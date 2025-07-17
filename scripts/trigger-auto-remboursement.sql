-- =====================================================
-- TRIGGER AUTOMATIQUE POUR CRÉER LES REMBOURSEMENTS
-- =====================================================
-- Ce trigger crée automatiquement un remboursement quand
-- une transaction passe au statut "EFFECTUEE"

-- Fonction pour créer automatiquement un remboursement
CREATE OR REPLACE FUNCTION create_automatic_reimbursement()
RETURNS TRIGGER AS $$
DECLARE
  frais_service_amount DECIMAL(10,2);
  date_limite_remb DATE;
  employe_info RECORD;
  partenaire_info RECORD;
  demande_info RECORD;
BEGIN
  -- Vérifier si c'est un changement vers EFFECTUEE
  IF NEW.statut = 'EFFECTUEE' AND (OLD.statut IS NULL OR OLD.statut != 'EFFECTUEE') THEN
    
    -- Log du début du processus
    RAISE NOTICE '🔄 Création automatique d''un remboursement pour la transaction: %', NEW.id;
    
    -- Vérifier si un remboursement existe déjà pour cette transaction
    IF EXISTS (SELECT 1 FROM remboursements WHERE transaction_id = NEW.id) THEN
      RAISE NOTICE '⚠️ Remboursement déjà existant pour la transaction: %', NEW.id;
      RETURN NEW;
    END IF;
    
    -- Récupérer les informations de la demande d'avance pour calculer les frais de service
    IF NEW.demande_avance_id IS NOT NULL THEN
      SELECT sa.frais_service INTO frais_service_amount
      FROM salary_advance_requests sa 
      WHERE sa.id = NEW.demande_avance_id;
    END IF;
    
    -- Si pas de frais définis dans la demande, calculer 6.5% par défaut
    IF frais_service_amount IS NULL THEN
      frais_service_amount := ROUND(NEW.montant * 0.065, 2);
    END IF;
    
    -- Calculer la date limite (30 jours après la transaction)
    date_limite_remb := CURRENT_DATE + INTERVAL '30 days';
    
    -- Récupérer les informations de l'employé
    IF NEW.employe_id IS NOT NULL THEN
      SELECT id, nom, prenom, email, telephone, partner_id INTO employe_info
      FROM employees 
      WHERE id = NEW.employe_id;
    END IF;
    
    -- Récupérer les informations du partenaire
    IF NEW.entreprise_id IS NOT NULL THEN
      SELECT id, nom, email, email_rh, telephone INTO partenaire_info
      FROM partners 
      WHERE id = NEW.entreprise_id;
    END IF;
    
    -- Récupérer les informations de la demande d'avance
    IF NEW.demande_avance_id IS NOT NULL THEN
      SELECT id, motif, type_motif, numero_reception INTO demande_info
      FROM salary_advance_requests 
      WHERE id = NEW.demande_avance_id;
    END IF;
    
    -- Créer le remboursement automatiquement
    INSERT INTO remboursements (
      transaction_id,
      demande_avance_id,
      employe_id,
      partenaire_id,
      montant_transaction,
      frais_service,
      montant_total_remboursement,
      methode_remboursement,
      date_creation,
      date_transaction_effectuee,
      date_limite_remboursement,
      statut,
      numero_reception,
      commentaire_admin,
      created_at,
      updated_at
    ) VALUES (
      NEW.id,
      NEW.demande_avance_id,
      NEW.employe_id,
      NEW.entreprise_id,
      NEW.montant,
      COALESCE(frais_service_amount, ROUND(NEW.montant * 0.065, 2)),
      NEW.montant + COALESCE(frais_service_amount, ROUND(NEW.montant * 0.065, 2)),
      CASE 
        WHEN NEW.methode_paiement = 'MOBILE_MONEY' THEN 'MOBILE_MONEY'
        WHEN NEW.methode_paiement = 'VIREMENT_BANCAIRE' THEN 'VIREMENT_BANCAIRE'
        WHEN NEW.methode_paiement = 'ESPECES' THEN 'ESPECES'
        WHEN NEW.methode_paiement = 'CHEQUE' THEN 'CHEQUE'
        ELSE 'MOBILE_MONEY'
      END,
      NOW(),
      COALESCE(NEW.date_transaction, NOW()),
      date_limite_remb,
      'EN_ATTENTE',
      COALESCE(NEW.numero_reception, demande_info.numero_reception),
      CASE 
        WHEN employe_info.nom IS NOT NULL THEN 
          FORMAT('Remboursement automatique pour %s %s - Transaction %s', 
                 employe_info.nom, 
                 employe_info.prenom, 
                 NEW.numero_transaction)
        ELSE 
          FORMAT('Remboursement automatique - Transaction %s', NEW.numero_transaction)
      END,
      NOW(),
      NOW()
    );
    
    -- Log de la création réussie
    RAISE NOTICE '✅ Remboursement créé automatiquement pour la transaction: % | Montant: % | Frais: % | Total: %', 
                 NEW.id, 
                 NEW.montant, 
                 COALESCE(frais_service_amount, ROUND(NEW.montant * 0.065, 2)),
                 NEW.montant + COALESCE(frais_service_amount, ROUND(NEW.montant * 0.065, 2));
    
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Supprimer le trigger s'il existe déjà
DROP TRIGGER IF EXISTS trigger_auto_remboursement ON transactions;

-- Créer le trigger qui se déclenche après UPDATE ou INSERT
CREATE TRIGGER trigger_auto_remboursement
  AFTER INSERT OR UPDATE OF statut ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION create_automatic_reimbursement();

-- =====================================================
-- TRIGGER POUR L'HISTORIQUE DES REMBOURSEMENTS
-- =====================================================

-- Fonction pour enregistrer l'historique des remboursements
CREATE OR REPLACE FUNCTION log_reimbursement_history()
RETURNS TRIGGER AS $$
BEGIN
  -- Enregistrer dans l'historique lors d'un INSERT (création)
  IF TG_OP = 'INSERT' THEN
    INSERT INTO historique_remboursements (
      remboursement_id,
      action,
      montant_avant,
      montant_apres,
      statut_avant,
      statut_apres,
      description,
      created_at
    ) VALUES (
      NEW.id,
      'CREATION',
      NULL,
      NEW.montant_total_remboursement,
      NULL,
      NEW.statut,
      FORMAT('Création automatique du remboursement - Transaction %s', 
             (SELECT numero_transaction FROM transactions WHERE id = NEW.transaction_id)),
      NOW()
    );
    RETURN NEW;
  END IF;
  
  -- Enregistrer dans l'historique lors d'un UPDATE
  IF TG_OP = 'UPDATE' THEN
    -- Seulement si le statut ou le montant a changé
    IF OLD.statut != NEW.statut OR OLD.montant_total_remboursement != NEW.montant_total_remboursement THEN
      INSERT INTO historique_remboursements (
        remboursement_id,
        action,
        montant_avant,
        montant_apres,
        statut_avant,
        statut_apres,
        description,
        created_at
      ) VALUES (
        NEW.id,
        CASE 
          WHEN OLD.statut != NEW.statut AND NEW.statut = 'PAYE' THEN 'PAIEMENT'
          WHEN OLD.statut != NEW.statut AND NEW.statut = 'ANNULE' THEN 'ANNULEMENT'
          ELSE 'MODIFICATION'
        END,
        OLD.montant_total_remboursement,
        NEW.montant_total_remboursement,
        OLD.statut,
        NEW.statut,
        CASE 
          WHEN OLD.statut != NEW.statut AND NEW.statut = 'PAYE' THEN 
            FORMAT('Remboursement payé - Référence: %s', COALESCE(NEW.reference_paiement, 'N/A'))
          WHEN OLD.statut != NEW.statut AND NEW.statut = 'ANNULE' THEN 
            'Remboursement annulé'
          ELSE 
            'Modification du remboursement'
        END,
        NOW()
      );
    END IF;
    RETURN NEW;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Supprimer le trigger s'il existe déjà
DROP TRIGGER IF EXISTS trigger_remboursement_history ON remboursements;

-- Créer le trigger pour l'historique
CREATE TRIGGER trigger_remboursement_history
  AFTER INSERT OR UPDATE ON remboursements
  FOR EACH ROW
  EXECUTE FUNCTION log_reimbursement_history();

-- =====================================================
-- INFORMATIONS ET TESTS
-- =====================================================

-- Afficher les triggers créés
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  trigger_schema
FROM information_schema.triggers 
WHERE trigger_name IN ('trigger_auto_remboursement', 'trigger_remboursement_history')
ORDER BY trigger_name;

-- Fonction de test pour vérifier le trigger
CREATE OR REPLACE FUNCTION test_trigger_remboursement()
RETURNS TEXT AS $$
DECLARE
  test_transaction_id UUID;
  test_result TEXT;
BEGIN
  -- Créer une transaction de test
  INSERT INTO transactions (
    employe_id,
    entreprise_id,
    montant,
    numero_transaction,
    methode_paiement,
    statut,
    date_transaction
  ) VALUES (
    (SELECT id FROM employees LIMIT 1),
    (SELECT id FROM partners LIMIT 1),
    100000, -- 100,000 GNF
    'TEST_' || EXTRACT(epoch FROM NOW()),
    'MOBILE_MONEY',
    'EFFECTUEE',
    NOW()
  ) RETURNING id INTO test_transaction_id;
  
  -- Vérifier si le remboursement a été créé
  IF EXISTS (SELECT 1 FROM remboursements WHERE transaction_id = test_transaction_id) THEN
    test_result := FORMAT('✅ TEST RÉUSSI - Remboursement créé automatiquement pour la transaction %s', test_transaction_id);
    
    -- Nettoyer les données de test
    DELETE FROM remboursements WHERE transaction_id = test_transaction_id;
    DELETE FROM transactions WHERE id = test_transaction_id;
  ELSE
    test_result := FORMAT('❌ TEST ÉCHOUÉ - Aucun remboursement créé pour la transaction %s', test_transaction_id);
  END IF;
  
  RETURN test_result;
END;
$$ LANGUAGE plpgsql;

-- Commenter la ligne suivante pour exécuter le test automatiquement
-- SELECT test_trigger_remboursement() as test_result;

-- =====================================================
-- DOCUMENTATION
-- =====================================================

/*
🔧 TRIGGER AUTOMATIQUE DE REMBOURSEMENT

Ce script crée un système automatique qui :

1. ✅ Détecte quand une transaction passe au statut "EFFECTUEE"
2. ✅ Crée automatiquement un remboursement correspondant
3. ✅ Calcule les frais de service (6.5% par défaut)
4. ✅ Définit la date limite à 30 jours
5. ✅ Enregistre l'historique des actions

📋 FONCTIONNALITÉS :

- Évite les doublons (vérifie si un remboursement existe déjà)
- Calcule automatiquement les montants et frais
- Gère les cas où certaines données sont manquantes
- Logs détaillés pour le debugging
- Historique complet des actions

🚀 UTILISATION :

Ce trigger fonctionne automatiquement. Dès qu'une transaction 
passe au statut "EFFECTUEE", un remboursement est créé.

🧪 TEST :

Pour tester le trigger, décommentez la dernière ligne pour 
exécuter test_trigger_remboursement().

*/ 
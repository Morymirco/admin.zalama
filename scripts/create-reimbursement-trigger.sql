-- =====================================================
-- TRIGGER AUTOMATIQUE DE REMBOURSEMENTS - VERSION OPTIMISÉE
-- =====================================================
-- Ce trigger crée automatiquement un remboursement quand
-- une transaction passe au statut "EFFECTUEE"

-- 1. Fonction pour créer automatiquement un remboursement
CREATE OR REPLACE FUNCTION create_automatic_reimbursement()
RETURNS TRIGGER AS $$
DECLARE
  frais_service_amount DECIMAL(10,2);
  date_limite_remb DATE;
  employe_info RECORD;
  partenaire_info RECORD;
  demande_info RECORD;
  existing_remboursement_count INTEGER;
BEGIN
  -- Log du début du processus
  RAISE NOTICE '🔄 Transaction % - Statut: OLD=% NEW=%', NEW.id, COALESCE(OLD.statut::text, 'NULL'), NEW.statut;
  
  -- Vérifier si c'est un changement vers EFFECTUEE
  IF NEW.statut = 'EFFECTUEE' AND (OLD IS NULL OR OLD.statut IS NULL OR OLD.statut != 'EFFECTUEE') THEN
    
    RAISE NOTICE '✅ Création automatique d''un remboursement pour la transaction: %', NEW.id;
    
    -- Vérifier si un remboursement existe déjà pour cette transaction
    SELECT COUNT(*) INTO existing_remboursement_count
    FROM remboursements 
    WHERE transaction_id = NEW.id;
    
    IF existing_remboursement_count > 0 THEN
      RAISE NOTICE '⚠️ Remboursement déjà existant pour la transaction: % (count: %)', NEW.id, existing_remboursement_count;
      RETURN NEW;
    END IF;
    
    -- Récupérer les informations de la demande d'avance pour calculer les frais de service
    IF NEW.demande_avance_id IS NOT NULL THEN
      SELECT 
        COALESCE(sa.frais_service, 0) as frais_service,
        COALESCE(sa.motif, '') as motif,
        COALESCE(sa.type_motif, '') as type_motif,
        COALESCE(sa.numero_reception, '') as numero_reception,
        sa.employe_id,
        sa.partenaire_id
      INTO demande_info
      FROM salary_advance_requests sa 
      WHERE sa.id = NEW.demande_avance_id;
      
      IF FOUND THEN
        frais_service_amount := demande_info.frais_service;
        RAISE NOTICE '📋 Demande trouvée - Frais service: %', COALESCE(frais_service_amount, 0);
      ELSE
        RAISE NOTICE '⚠️ Demande d''avance non trouvée: %', NEW.demande_avance_id;
      END IF;
    END IF;
    
    -- Si pas de frais définis dans la demande, calculer 6.5% par défaut
    IF frais_service_amount IS NULL OR frais_service_amount = 0 THEN
      frais_service_amount := ROUND(NEW.montant * 0.065, 2);
      RAISE NOTICE '💰 Frais calculés automatiquement (6.5%): %', COALESCE(frais_service_amount, 0);
    END IF;
    
    -- Calculer la date limite (30 jours après la transaction)
    date_limite_remb := COALESCE(NEW.date_transaction::date, CURRENT_DATE) + INTERVAL '30 days';
    
    -- Récupérer les informations de l'employé
    IF NEW.employe_id IS NOT NULL THEN
      SELECT id, nom, prenom, email, telephone, partner_id 
      INTO employe_info
      FROM employees 
      WHERE id = NEW.employe_id;
      
      IF FOUND THEN
        RAISE NOTICE '👤 Employé trouvé: % %', COALESCE(employe_info.nom, ''), COALESCE(employe_info.prenom, '');
      ELSE
        RAISE NOTICE '⚠️ Employé non trouvé: %', NEW.employe_id;
      END IF;
    END IF;
    
    -- Récupérer les informations du partenaire
    IF NEW.entreprise_id IS NOT NULL THEN
      SELECT id, nom, email, email_rh, telephone 
      INTO partenaire_info
      FROM partners 
      WHERE id = NEW.entreprise_id;
      
      IF FOUND THEN
        RAISE NOTICE '🏢 Partenaire trouvé: %', COALESCE(partenaire_info.nom, 'Inconnu');
      ELSE
        RAISE NOTICE '⚠️ Partenaire non trouvé: %', NEW.entreprise_id;
      END IF;
    END IF;
    
    -- Créer le remboursement automatiquement
    BEGIN
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
        frais_service_amount,
        NEW.montant + frais_service_amount,
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
        COALESCE(NEW.numero_reception, COALESCE(demande_info.numero_reception, '')),
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
      RAISE NOTICE '🎉 Remboursement créé avec succès!';
      RAISE NOTICE '   Transaction: %', NEW.id;
      RAISE NOTICE '   Montant: % FCFA', COALESCE(NEW.montant, 0);
      RAISE NOTICE '   Frais: % FCFA', COALESCE(frais_service_amount, 0);
      RAISE NOTICE '   Total: % FCFA', COALESCE(NEW.montant, 0) + COALESCE(frais_service_amount, 0);
      RAISE NOTICE '   Date limite: %', date_limite_remb;
      
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING '❌ Erreur lors de la création du remboursement pour la transaction %: %', NEW.id, SQLERRM;
      -- Ne pas faire échouer la transaction si le remboursement échoue
    END;
    
  ELSE
    RAISE NOTICE '📋 Transaction % - Pas de création de remboursement (statut: %)', NEW.id, NEW.statut;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Supprimer le trigger s'il existe déjà
DROP TRIGGER IF EXISTS trigger_auto_remboursement ON transactions;

-- 3. Créer le trigger qui se déclenche après UPDATE ou INSERT
CREATE TRIGGER trigger_auto_remboursement
  AFTER INSERT OR UPDATE OF statut ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION create_automatic_reimbursement();

-- 4. Fonction pour l'historique des remboursements (optionnelle)
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
    -- Seulement si le statut a changé
    IF OLD.statut != NEW.statut THEN
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
          WHEN NEW.statut = 'PAYE' THEN 'PAIEMENT'
          WHEN NEW.statut = 'ANNULE' THEN 'ANNULEMENT'
          ELSE 'MODIFICATION'
        END,
        OLD.montant_total_remboursement,
        NEW.montant_total_remboursement,
        OLD.statut,
        NEW.statut,
        CASE 
          WHEN NEW.statut = 'PAYE' THEN 
            FORMAT('Remboursement payé - Référence: %s', COALESCE(NEW.reference_paiement, 'N/A'))
          WHEN NEW.statut = 'ANNULE' THEN 
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

-- 5. Créer le trigger pour l'historique (si la table existe)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'historique_remboursements') THEN
    DROP TRIGGER IF EXISTS trigger_remboursement_history ON remboursements;
    CREATE TRIGGER trigger_remboursement_history
      AFTER INSERT OR UPDATE ON remboursements
      FOR EACH ROW
      EXECUTE FUNCTION log_reimbursement_history();
    RAISE NOTICE '✅ Trigger d''historique créé';
  ELSE
    RAISE NOTICE '⚠️ Table historique_remboursements non trouvée - trigger d''historique non créé';
  END IF;
END $$;

-- 6. Afficher les triggers créés
SELECT 
  'TRIGGERS CRÉÉS' as status,
  trigger_name,
  event_manipulation,
  event_object_table
FROM information_schema.triggers 
WHERE trigger_name IN ('trigger_auto_remboursement', 'trigger_remboursement_history')
AND trigger_schema = 'public'
ORDER BY trigger_name;

-- 7. Message de confirmation
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🎯 TRIGGER DE REMBOURSEMENTS AUTOMATIQUES CRÉÉ';
    RAISE NOTICE '';
    RAISE NOTICE '✅ FONCTIONNALITÉS:';
    RAISE NOTICE '   - Détecte les transactions EFFECTUEE';
    RAISE NOTICE '   - Crée automatiquement les remboursements';
    RAISE NOTICE '   - Calcule les frais de service (6.5%)';
    RAISE NOTICE '   - Évite les doublons';
    RAISE NOTICE '   - Logs détaillés pour debugging';
    RAISE NOTICE '';
    RAISE NOTICE '🚀 PRÊT POUR LES TESTS!';
END $$; 
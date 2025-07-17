-- =====================================================
-- TRIGGER AUTOMATIQUE DE REMBOURSEMENTS - VERSION SIMPLE
-- =====================================================

-- 1. Supprimer l'ancien trigger et fonction
DROP TRIGGER IF EXISTS trigger_auto_remboursement ON transactions;
DROP FUNCTION IF EXISTS create_automatic_reimbursement();

-- 2. Fonction simplifiée et robuste
CREATE OR REPLACE FUNCTION create_automatic_reimbursement()
RETURNS TRIGGER AS $$
DECLARE
  frais_service_amount DECIMAL(10,2) := 0;
  date_limite_remb TIMESTAMP WITH TIME ZONE;
  existing_count INTEGER := 0;
  employee_name TEXT := '';
  partner_name TEXT := '';
  transaction_num TEXT := '';
BEGIN
  -- Log de base
  RAISE NOTICE 'Transaction: % - Statut: %', NEW.id, NEW.statut;
  
  -- Vérifier si c'est un changement vers EFFECTUEE
  IF NEW.statut = 'EFFECTUEE' AND (OLD IS NULL OR OLD.statut IS NULL OR OLD.statut != 'EFFECTUEE') THEN
    
    RAISE NOTICE 'Création remboursement pour transaction: %', NEW.id;
    
    -- Vérifier si un remboursement existe déjà
    SELECT COUNT(*) INTO existing_count
    FROM remboursements 
    WHERE transaction_id = NEW.id;
    
    IF existing_count > 0 THEN
      RAISE NOTICE 'Remboursement déjà existant (count: %)', existing_count;
      RETURN NEW;
    END IF;
    
    -- Récupérer les frais de service depuis la demande d'avance
    IF NEW.demande_avance_id IS NOT NULL THEN
      SELECT COALESCE(frais_service, 0) INTO frais_service_amount
      FROM salary_advance_requests 
      WHERE id = NEW.demande_avance_id;
      
      RAISE NOTICE 'Frais depuis demande: %', frais_service_amount;
    END IF;
    
    -- Calculer 6.5% si pas de frais définis
    IF frais_service_amount IS NULL OR frais_service_amount = 0 THEN
      frais_service_amount := ROUND(COALESCE(NEW.montant, 0) * 0.065, 2);
      RAISE NOTICE 'Frais calculés (6.5 pour cent): %', frais_service_amount;
    END IF;
    
    -- Calculer la date limite (30 jours)
    date_limite_remb := COALESCE(NEW.date_transaction, NOW()) + INTERVAL '30 days';
    
    -- Récupérer le nom de l'employé
    SELECT COALESCE(nom || ' ' || prenom, 'Employé inconnu') INTO employee_name
    FROM employees 
    WHERE id = NEW.employe_id;
    
    -- Récupérer le nom du partenaire
    SELECT COALESCE(nom, 'Partenaire inconnu') INTO partner_name
    FROM partners 
    WHERE id = NEW.entreprise_id;
    
    -- Préparer le numéro de transaction
    transaction_num := COALESCE(NEW.numero_transaction, 'N/A');
    
    -- Créer le remboursement
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
        COALESCE(NEW.montant, 0),
        frais_service_amount,
        COALESCE(NEW.montant, 0) + frais_service_amount,
        CASE COALESCE(NEW.methode_paiement, '')
          WHEN 'MOBILE_MONEY' THEN 'MOBILE_MONEY'
          WHEN 'VIREMENT_BANCAIRE' THEN 'VIREMENT_BANCAIRE'
          WHEN 'ESPECES' THEN 'ESPECES'
          WHEN 'CHEQUE' THEN 'CHEQUE'
          ELSE 'MOBILE_MONEY'
        END,
        NOW(),
        COALESCE(NEW.date_transaction, NOW()),
        date_limite_remb,
        'EN_ATTENTE',
        COALESCE(NEW.numero_reception, ''),
        'Remboursement automatique pour ' || employee_name || ' - Transaction ' || transaction_num,
        NOW(),
        NOW()
      );
      
      RAISE NOTICE 'Remboursement créé avec succès!';
      RAISE NOTICE 'Montant: % FCFA', COALESCE(NEW.montant, 0);
      RAISE NOTICE 'Frais: % FCFA', frais_service_amount;
      RAISE NOTICE 'Total: % FCFA', COALESCE(NEW.montant, 0) + frais_service_amount;
      
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'Erreur création remboursement: %', SQLERRM;
    END;
    
  ELSE
    RAISE NOTICE 'Pas de création remboursement - Statut: %', NEW.statut;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Créer le trigger
CREATE TRIGGER trigger_auto_remboursement
  AFTER INSERT OR UPDATE OF statut ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION create_automatic_reimbursement();

-- 4. Vérification
SELECT 
  'TRIGGER CRÉÉ' as status,
  trigger_name,
  event_object_table
FROM information_schema.triggers 
WHERE trigger_name = 'trigger_auto_remboursement'
AND trigger_schema = 'public';

-- 5. Test rapide
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE 'TRIGGER DE REMBOURSEMENTS AUTOMATIQUES CRÉÉ';
  RAISE NOTICE 'Version simplifiée et robuste';
  RAISE NOTICE 'Prêt pour les tests!';
  RAISE NOTICE '';
END $$; 
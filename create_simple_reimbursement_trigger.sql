-- ============================================================================
-- TRIGGER SIMPLE : Création automatique des remboursements ZaLaMa
-- ============================================================================

DO $$ 
BEGIN 
    RAISE NOTICE '=== CRÉATION DU TRIGGER DE REMBOURSEMENT SIMPLE ===';
    RAISE NOTICE 'Logique ZaLaMa : Partenaire rembourse le montant demandé original';
END $$;

-- 1. CRÉER LA FONCTION SIMPLE
CREATE OR REPLACE FUNCTION create_zalama_reimbursement()
RETURNS TRIGGER AS $$
DECLARE
    v_demande_id UUID;
    v_employe_id UUID;
    v_partenaire_id UUID;
    v_frais_zalama DECIMAL(10,2);
    v_existing_count INTEGER;
BEGIN
    -- Vérifier que c'est bien un changement vers EFFECTUEE
    IF TG_OP = 'UPDATE' AND NEW.statut = 'EFFECTUEE' AND OLD.statut != 'EFFECTUEE' THEN
        
        RAISE NOTICE 'ZaLaMa: Transaction % passée à EFFECTUEE', NEW.numero_transaction;
        
        -- Vérifier qu'il n'y a pas déjà un remboursement
        SELECT COUNT(*) INTO v_existing_count
        FROM remboursements 
        WHERE transaction_id = NEW.id;
        
        IF v_existing_count > 0 THEN
            RAISE NOTICE 'ZaLaMa: Remboursement déjà existant pour transaction %', NEW.id;
            RETURN NEW;
        END IF;
        
        -- Récupérer les informations de la demande
        v_demande_id := NEW.demande_avance_id;
        v_employe_id := NEW.employe_id;
        v_partenaire_id := NEW.entreprise_id;
        
        -- Calculer les frais ZaLaMa (6.5%)
        v_frais_zalama := ROUND(NEW.montant * 0.065, 2);
        
        RAISE NOTICE 'ZaLaMa: Création remboursement - Montant: % GNF, Frais: % GNF', 
                     NEW.montant, v_frais_zalama;
        
        -- Créer le remboursement selon la logique ZaLaMa
        INSERT INTO remboursements (
            id,
            transaction_id,
            demande_avance_id,
            employe_id,
            partenaire_id,
            montant_transaction,              -- Montant de la transaction
            frais_service,                   -- Frais ZaLaMa (informatif)
            montant_total_remboursement,     -- Ce que paie le partenaire = montant demandé
            methode_remboursement,
            date_creation,
            date_transaction_effectuee,
            date_limite_remboursement,
            statut,
            commentaire_admin
        ) VALUES (
            gen_random_uuid(),
            NEW.id,
            v_demande_id,
            v_employe_id,
            v_partenaire_id,
            NEW.montant,                     -- Ex: 1000 GNF (montant demandé)
            v_frais_zalama,                  -- Ex: 65 GNF (frais ZaLaMa)
            NEW.montant,                     -- Ex: 1000 GNF (partenaire paie le montant demandé)
            'VIREMENT_BANCAIRE',
            NOW(),
            NEW.date_transaction,
            NEW.date_transaction + INTERVAL '30 days',
            'EN_ATTENTE',
            'Remboursement automatique ZaLaMa - Partenaire rembourse le montant demandé original'
        );
        
        RAISE NOTICE 'ZaLaMa: Remboursement créé avec succès pour transaction %', NEW.id;
        
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. CRÉER LE TRIGGER
CREATE TRIGGER zalama_simple_reimbursement_trigger
    AFTER UPDATE ON transactions
    FOR EACH ROW
    EXECUTE FUNCTION create_zalama_reimbursement();

-- 3. VÉRIFICATION
SELECT 
    'TRIGGER CRÉÉ' as status,
    trigger_name,
    event_manipulation,
    action_timing,
    event_object_table
FROM information_schema.triggers 
WHERE trigger_name = 'zalama_simple_reimbursement_trigger';

-- 4. TEST SIMPLE
DO $$ 
BEGIN 
    RAISE NOTICE '';
    RAISE NOTICE '🎯 ==========================================';
    RAISE NOTICE '🎯 TRIGGER DE REMBOURSEMENT CRÉÉ';
    RAISE NOTICE '🎯 ==========================================';
    RAISE NOTICE '';
    RAISE NOTICE '✅ Fonction: create_zalama_reimbursement()';
    RAISE NOTICE '✅ Trigger: zalama_simple_reimbursement_trigger';
    RAISE NOTICE '✅ Événement: UPDATE sur transactions';
    RAISE NOTICE '✅ Condition: statut passe à EFFECTUEE';
    RAISE NOTICE '';
    RAISE NOTICE '📋 LOGIQUE ZALAMA:';
    RAISE NOTICE '   - Employé demande: 1000 GNF';
    RAISE NOTICE '   - Transaction: montant = 1000 GNF';
    RAISE NOTICE '   - Employé reçoit: 935 GNF (via LengoPay)';
    RAISE NOTICE '   - Partenaire rembourse: 1000 GNF';
    RAISE NOTICE '   - ZaLaMa garde: 65 GNF (frais)';
    RAISE NOTICE '';
    RAISE NOTICE 'PRÊT POUR LES TESTS !';
END $$; 
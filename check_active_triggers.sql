-- ============================================================================
-- VÉRIFICATION ET CORRECTION DÉFINITIVE DES TRIGGERS ACTIFS
-- ============================================================================

-- 1. LISTER TOUS LES TRIGGERS ACTIFS SUR LA TABLE TRANSACTIONS
SELECT 
    '=== TRIGGERS ACTIFS SUR TRANSACTIONS ===' as diagnostic,
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'transactions'
AND trigger_schema = 'public'
ORDER BY trigger_name;

-- 2. LISTER TOUTES LES FONCTIONS DE TRIGGER EXISTANTES
SELECT 
    '=== FONCTIONS DE TRIGGER EXISTANTES ===' as fonctions,
    routine_name,
    routine_type,
    created
FROM information_schema.routines 
WHERE routine_name LIKE '%reimbursement%' 
OR routine_name LIKE '%remboursement%'
OR routine_name LIKE '%automatic%'
ORDER BY routine_name;

-- 3. SUPPRIMER TOUS LES ANCIENS TRIGGERS ET FONCTIONS
DO $$
BEGIN
    -- Supprimer tous les triggers de remboursement
    DROP TRIGGER IF EXISTS trigger_auto_remboursement ON transactions;
    DROP TRIGGER IF EXISTS trigger_create_automatic_reimbursement ON transactions;
    DROP TRIGGER IF EXISTS trigger_creer_remboursement_integral ON transactions;
    DROP TRIGGER IF EXISTS trigger_creer_remboursement_integral_automatique ON transactions;
    
    -- Supprimer toutes les anciennes fonctions
    DROP FUNCTION IF EXISTS create_automatic_reimbursement() CASCADE;
    DROP FUNCTION IF EXISTS creer_remboursement_integral() CASCADE;
    DROP FUNCTION IF EXISTS creer_remboursement_integral_automatique() CASCADE;
    DROP FUNCTION IF EXISTS creer_remboursement_integral_direct(UUID) CASCADE;
    
    RAISE NOTICE '🧹 Tous les anciens triggers et fonctions supprimés';
END $$;

-- 4. CRÉER LA FONCTION TRIGGER FINALE ET CORRECTE
CREATE OR REPLACE FUNCTION create_automatic_reimbursement_zalama()
RETURNS TRIGGER AS $$
DECLARE
    v_demande_id UUID;
    v_employe_id UUID;
    v_partenaire_id UUID;
    existing_count INTEGER;
BEGIN
    -- Vérifier si la transaction passe à EFFECTUEE
    IF NEW.statut = 'EFFECTUEE' AND (OLD.statut IS NULL OR OLD.statut != 'EFFECTUEE') THEN
        
        -- Vérifier si un remboursement existe déjà
        SELECT COUNT(*) INTO existing_count 
        FROM remboursements 
        WHERE transaction_id = NEW.id;
        
        IF existing_count = 0 THEN
            BEGIN
                -- Récupérer les informations de la demande d'avance
                IF NEW.demande_avance_id IS NOT NULL THEN
                    SELECT sar.id, sar.employe_id, sar.partenaire_id 
                    INTO v_demande_id, v_employe_id, v_partenaire_id
                    FROM salary_advance_requests sar 
                    WHERE sar.id = NEW.demande_avance_id;
                ELSE
                    -- Fallback vers les infos de la transaction
                    v_demande_id := NEW.demande_avance_id;
                    v_employe_id := NEW.employe_id;
                    v_partenaire_id := NEW.entreprise_id;
                END IF;
                
                -- ✅ CRÉER LE REMBOURSEMENT AVEC LA VRAIE LOGIQUE ZALAMA
                IF v_employe_id IS NOT NULL AND v_partenaire_id IS NOT NULL THEN
                    INSERT INTO remboursements (
                        transaction_id,
                        demande_avance_id,
                        employe_id,
                        partenaire_id,
                        montant_transaction,              -- Montant de la transaction
                        frais_service,                   -- Frais ZaLaMa 6.5% (informatif)
                        montant_total_remboursement,     -- ✅ CRUCIAL : = montant_transaction (logique ZaLaMa)
                        methode_remboursement,
                        date_creation,
                        date_transaction_effectuee,
                        date_limite_remboursement,
                        statut,
                        commentaire_admin,
                        created_at,
                        updated_at
                    ) VALUES (
                        NEW.id,
                        v_demande_id,
                        v_employe_id,
                        v_partenaire_id,
                        NEW.montant,                     -- Ex: 2000 GNF (montant demandé)
                        ROUND(NEW.montant * 0.065, 2),   -- Ex: 130 GNF (frais ZaLaMa - informatif)
                        NEW.montant,                     -- ✅ CORRECTION FINALE : 2000 GNF (PAS 2130!)
                        'VIREMENT_BANCAIRE',
                        NOW(),
                        NEW.date_transaction,
                        NEW.date_transaction + INTERVAL '30 days',
                        'EN_ATTENTE',
                        'REMBOURSEMENT ZALAMA FINAL : partenaire rembourse montant demandé (frais déjà prélevés)',
                        NOW(),
                        NOW()
                    );
                    
                    RAISE NOTICE '✅ ZaLaMa : Remboursement créé correctement pour transaction % (montant: % GNF)', NEW.id, NEW.montant;
                ELSE
                    RAISE WARNING '⚠️ ZaLaMa : Impossible de créer remboursement pour transaction % - infos manquantes', NEW.id;
                END IF;
                
            EXCEPTION WHEN OTHERS THEN
                RAISE WARNING '❌ ZaLaMa : Erreur création remboursement pour transaction %: %', NEW.id, SQLERRM;
            END;
        ELSE
            RAISE NOTICE 'ℹ️ ZaLaMa : Remboursement existe déjà pour transaction %', NEW.id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. CRÉER LE TRIGGER FINAL
CREATE TRIGGER trigger_zalama_automatic_reimbursement
    AFTER INSERT OR UPDATE OF statut ON transactions
    FOR EACH ROW
    EXECUTE FUNCTION create_automatic_reimbursement_zalama();

-- 6. VÉRIFICATION FINALE
SELECT 
    '=== NOUVEAU TRIGGER ACTIF ===' as nouveau_trigger,
    trigger_name,
    event_manipulation,
    action_timing
FROM information_schema.triggers 
WHERE event_object_table = 'transactions'
AND trigger_schema = 'public'
AND trigger_name = 'trigger_zalama_automatic_reimbursement';

-- 7. INSTRUCTIONS FINALES
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🎯 ==========================================';
    RAISE NOTICE '🎯 CORRECTION DÉFINITIVE APPLIQUÉE';
    RAISE NOTICE '🎯 ==========================================';
    RAISE NOTICE '';
    RAISE NOTICE '✅ Tous les anciens triggers supprimés';
    RAISE NOTICE '✅ Nouveau trigger ZaLaMa créé : trigger_zalama_automatic_reimbursement';
    RAISE NOTICE '✅ Logique financière correcte : montant_total_remboursement = montant_transaction';
    RAISE NOTICE '';
    RAISE NOTICE '📋 PROCHAINES ÉTAPES:';
    RAISE NOTICE '1. Testez une nouvelle transaction';
    RAISE NOTICE '2. Vérifiez que le remboursement créé a le bon montant';
    RAISE NOTICE '3. Exécutez fix_existing_remboursements_montants.sql pour corriger les anciens';
    RAISE NOTICE '';
END $$; 
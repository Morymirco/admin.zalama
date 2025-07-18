-- ============================================================================
-- CORRECTIF : Conflit entre triggers de remboursement automatique
-- ============================================================================

-- 1. DIAGNOSTIQUER le problème - Lister tous les triggers sur transactions
SELECT 
    '=== TRIGGERS SUR LA TABLE TRANSACTIONS ===' as info,
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers
WHERE event_object_table = 'transactions'
ORDER BY trigger_name;

-- 2. LISTER toutes les fonctions de trigger liées aux remboursements
SELECT 
    '=== FONCTIONS DE TRIGGER REMBOURSEMENT ===' as info,
    routine_name,
    routine_type
FROM information_schema.routines
WHERE routine_name LIKE '%remboursement%'
   OR routine_name LIKE '%reimbursement%'
ORDER BY routine_name;

-- 3. DÉSACTIVER temporairement TOUS les triggers de remboursement
-- pour éviter les conflits

-- Désactiver le trigger problématique
DROP TRIGGER IF EXISTS trigger_creer_remboursement_integral_automatique ON transactions;
DROP TRIGGER IF EXISTS trigger_create_automatic_reimbursement ON transactions;
DROP TRIGGER IF EXISTS trigger_remboursement_automatique ON transactions;

-- Supprimer les anciennes fonctions qui causent des conflits
DROP FUNCTION IF EXISTS creer_remboursement_integral_automatique() CASCADE;
DROP FUNCTION IF EXISTS create_reimbursement_automatique() CASCADE;

-- 4. CRÉER UNE SEULE FONCTION DE TRIGGER UNIFIÉE (sans conflits)
CREATE OR REPLACE FUNCTION zalama_create_automatic_reimbursement()
RETURNS TRIGGER AS $$
DECLARE
    v_demande_id UUID;
    v_employe_id UUID;
    v_partenaire_id UUID;
    v_existing_count INTEGER;
BEGIN
    -- Vérifier si la transaction vient d'être marquée comme EFFECTUEE
    IF NEW.statut = 'EFFECTUEE' AND (OLD.statut IS NULL OR OLD.statut != 'EFFECTUEE') THEN
        
        -- ✅ VÉRIFICATION CRUCIALE : Éviter les doublons absolument
        SELECT COUNT(*) INTO v_existing_count 
        FROM remboursements 
        WHERE transaction_id = NEW.id;
        
        IF v_existing_count > 0 THEN
            RAISE NOTICE 'ℹ️ Remboursement existe déjà pour transaction %, pas de création', NEW.id;
            RETURN NEW;
        END IF;
        
        -- Récupérer les informations nécessaires
        BEGIN
            -- Récupérer depuis la demande d'avance si disponible
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
            
            -- Insérer le remboursement SEULEMENT si toutes les infos sont présentes
            IF v_employe_id IS NOT NULL AND v_partenaire_id IS NOT NULL THEN
                INSERT INTO remboursements (
                    transaction_id,
                    demande_avance_id,
                    employe_id,
                    partenaire_id,
                    montant_transaction,              -- Montant de la transaction
                    frais_service,                   -- Frais ZaLaMa 6.5%
                    montant_total_remboursement,     -- = montant_transaction (logique ZaLaMa)
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
                    ROUND(NEW.montant * 0.065, 2),   -- Ex: 130 GNF (frais ZaLaMa)
                    NEW.montant,                     -- Ex: 2000 GNF (partenaire paie le montant demandé)
                    'VIREMENT_BANCAIRE',
                    NOW(),
                    NEW.date_transaction,
                    NEW.date_transaction + INTERVAL '30 days',
                    'EN_ATTENTE',
                    'Remboursement créé automatiquement - Logique ZaLaMa : partenaire rembourse le montant demandé',
                    NOW(),
                    NOW()
                );
                
                RAISE NOTICE '✅ Remboursement automatique créé par ZaLaMa pour transaction %', NEW.id;
            ELSE
                RAISE WARNING '⚠️ Impossible de créer un remboursement automatique pour transaction % - informations manquantes', NEW.id;
            END IF;
            
        EXCEPTION WHEN OTHERS THEN
            RAISE WARNING '❌ Erreur création remboursement automatique pour transaction %: %', NEW.id, SQLERRM;
        END;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. CRÉER UN SEUL TRIGGER UNIFIÉ (pas de conflit possible)
CREATE TRIGGER zalama_trigger_automatic_reimbursement
    AFTER UPDATE ON transactions
    FOR EACH ROW
    EXECUTE FUNCTION zalama_create_automatic_reimbursement();

-- 6. NETTOYER les remboursements en double existants
WITH doublons AS (
    SELECT 
        id,
        transaction_id,
        ROW_NUMBER() OVER (PARTITION BY transaction_id ORDER BY created_at ASC) as rn
    FROM remboursements
)
DELETE FROM remboursements 
WHERE id IN (
    SELECT id FROM doublons WHERE rn > 1
);

-- 7. VÉRIFIER qu'il n'y a plus de doublons
SELECT 
    '=== VÉRIFICATION DOUBLONS APRÈS NETTOYAGE ===' as titre,
    transaction_id,
    COUNT(*) as nombre_remboursements,
    CASE 
        WHEN COUNT(*) > 1 THEN '❌ DOUBLON ENCORE PRÉSENT'
        ELSE '✅ OK'
    END as statut
FROM remboursements 
GROUP BY transaction_id
HAVING COUNT(*) > 1
ORDER BY COUNT(*) DESC;

-- 8. LISTER les triggers actifs maintenant
SELECT 
    '=== TRIGGERS ACTIFS APRÈS CORRECTION ===' as info,
    trigger_name,
    event_manipulation,
    action_timing
FROM information_schema.triggers
WHERE event_object_table = 'transactions'
ORDER BY trigger_name;

-- 9. MESSAGE DE SUCCÈS
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '✅ CONFLIT DE TRIGGERS RÉSOLU !';
    RAISE NOTICE '✅ Un seul trigger unifié : zalama_trigger_automatic_reimbursement';
    RAISE NOTICE '✅ Fonction : zalama_create_automatic_reimbursement()';
    RAISE NOTICE '✅ Vérification anti-doublon intégrée';
    RAISE NOTICE '✅ Doublons existants supprimés';
    RAISE NOTICE '';
    RAISE NOTICE '🚀 Vous pouvez maintenant relancer test_complete_flow_FINAL_FIXED.sql';
    RAISE NOTICE '🚀 Le trigger devrait fonctionner sans conflit !';
END $$; 
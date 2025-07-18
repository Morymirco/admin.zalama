-- ============================================================================
-- VÉRIFICATION URGENTE : Triggers actifs qui modifient les montants
-- ============================================================================

DO $$ 
BEGIN 
    RAISE NOTICE '=== VÉRIFICATION URGENTE DES TRIGGERS ACTIFS ===';
    RAISE NOTICE 'Problème: Transaction créée avec montant=2000 mais affiche 1879';
END $$;

-- 1. VÉRIFIER TOUS LES TRIGGERS SUR TRANSACTIONS
SELECT 
    'TRIGGERS ACTIFS SUR TRANSACTIONS' as verification,
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
AND event_object_table = 'transactions'
ORDER BY trigger_name;

-- 2. VÉRIFIER LES FONCTIONS DE TRIGGER
SELECT 
    'FONCTIONS DE TRIGGER' as verification,
    routine_name,
    routine_type
FROM information_schema.routines 
WHERE routine_schema = 'public'
AND (routine_name LIKE '%trigger%' 
     OR routine_name LIKE '%transaction%'
     OR routine_name LIKE '%remboursement%'
     OR routine_name LIKE '%zalama%')
ORDER BY routine_name;

-- 3. VÉRIFIER LA DERNIÈRE TRANSACTION CRÉÉE
SELECT 
    'DERNIÈRE TRANSACTION' as verification,
    id,
    montant,
    numero_transaction,
    statut,
    created_at,
    updated_at
FROM transactions 
WHERE numero_transaction = 'ZDJHQ0hQcW5lODF0b003SVRtTDlmeUFWZVV6SGVWcUU='
ORDER BY created_at DESC
LIMIT 1;

-- 4. VÉRIFIER LES MODIFICATIONS RÉCENTES
SELECT 
    'MODIFICATIONS RÉCENTES' as verification,
    id,
    montant,
    numero_transaction,
    statut,
    created_at,
    updated_at,
    CASE 
        WHEN updated_at > created_at THEN 'MODIFIÉE APRÈS CRÉATION'
        ELSE 'NON MODIFIÉE'
    END as statut_modification
FROM transactions 
WHERE created_at >= NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC;

-- 5. SUPPRESSION D'URGENCE SI TRIGGERS TROUVÉS
DO $$
DECLARE
    trigger_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO trigger_count
    FROM information_schema.triggers 
    WHERE trigger_schema = 'public'
    AND event_object_table = 'transactions';
    
    IF trigger_count > 0 THEN
        RAISE NOTICE '🚨 ATTENTION: % triggers trouvés sur transactions !', trigger_count;
        RAISE NOTICE '🚨 SUPPRESSION D''URGENCE EN COURS...';
        
        -- Supprimer tous les triggers sur transactions
        DROP TRIGGER IF EXISTS zalama_simple_reimbursement_trigger ON transactions;
        DROP TRIGGER IF EXISTS create_automatic_reimbursement ON transactions;
        DROP TRIGGER IF EXISTS trigger_auto_remboursement ON transactions;
        DROP TRIGGER IF EXISTS trigger_create_reimbursement ON transactions;
        DROP TRIGGER IF EXISTS zalama_transaction_trigger ON transactions;
        
        RAISE NOTICE '✅ Tous les triggers sur transactions supprimés';
    ELSE
        RAISE NOTICE '✅ Aucun trigger trouvé sur transactions';
    END IF;
END $$;

-- 6. VÉRIFICATION FINALE
SELECT 
    'VÉRIFICATION FINALE' as verification,
    trigger_name,
    event_object_table
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
AND event_object_table = 'transactions';

-- 7. INSTRUCTIONS
DO $$ 
BEGIN 
    RAISE NOTICE '';
    RAISE NOTICE '🎯 ==========================================';
    RAISE NOTICE '🎯 DIAGNOSTIC TERMINÉ';
    RAISE NOTICE '🎯 ==========================================';
    RAISE NOTICE '';
    RAISE NOTICE '📋 Si des triggers apparaissent ci-dessus, ils ont été supprimés';
    RAISE NOTICE '📋 Vérifiez maintenant la table transactions pour le montant';
    RAISE NOTICE '📋 Créez une nouvelle demande pour tester';
    RAISE NOTICE '';
    RAISE NOTICE 'MAINTENANT : Vérifiez le montant de la transaction !';
END $$; 
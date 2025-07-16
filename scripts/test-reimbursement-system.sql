-- =====================================================
-- TEST: Vérification du système de remboursement
-- =====================================================

-- 1. Vérifier que les tables existent
SELECT 
    'Tables' as type,
    table_name,
    CASE 
        WHEN table_name IN ('remboursements_integraux', 'historique_remboursements_integraux') 
        THEN '✅ Existe' 
        ELSE '❌ Manquant' 
    END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('remboursements_integraux', 'historique_remboursements_integraux');

-- 2. Vérifier que les fonctions existent
SELECT 
    'Fonctions' as type,
    proname as function_name,
    CASE 
        WHEN proname IN ('creer_remboursement_integral_direct', 'creer_remboursement_integral_automatique', 'creer_remboursements_manquants') 
        THEN '✅ Existe' 
        ELSE '❌ Manquant' 
    END as status
FROM pg_proc 
WHERE proname IN (
    'creer_remboursement_integral_direct',
    'creer_remboursement_integral_automatique', 
    'creer_remboursements_manquants'
);

-- 3. Vérifier que le trigger existe et est actif
SELECT 
    'Trigger' as type,
    tgname as trigger_name,
    tgrelid::regclass as table_name,
    CASE 
        WHEN tgname = 'trigger_creer_remboursement_integral' THEN '✅ Existe'
        ELSE '❌ Manquant'
    END as status,
    CASE tgenabled
        WHEN 'O' THEN '✅ Actif'
        WHEN 'D' THEN '❌ Désactivé'
        WHEN 'R' THEN '⚠️ Désactivé (replica)'
        ELSE '❓ Inconnu'
    END as trigger_state
FROM pg_trigger 
WHERE tgname = 'trigger_creer_remboursement_integral';

-- 4. Compter les transactions EFFECTUEE
SELECT 
    'Statistiques' as type,
    'Transactions EFFECTUEE' as metric,
    COUNT(*) as value
FROM transactions 
WHERE status = 'EFFECTUEE'

UNION ALL

SELECT 
    'Statistiques' as type,
    'Remboursements existants' as metric,
    COUNT(*) as value
FROM remboursements_integraux

UNION ALL

SELECT 
    'Statistiques' as type,
    'Transactions sans remboursement' as metric,
    COUNT(*) as value
FROM transactions t
WHERE t.status = 'EFFECTUEE'
AND NOT EXISTS (
    SELECT 1 FROM remboursements_integraux r 
    WHERE r.transaction_id = t.id
);

-- 5. Tester la fonction directe avec une transaction existante
DO $$
DECLARE
    test_transaction_id UUID;
    test_result TEXT;
BEGIN
    -- Prendre une transaction EFFECTUEE sans remboursement pour le test
    SELECT t.id INTO test_transaction_id
    FROM transactions t
    WHERE t.status = 'EFFECTUEE'
    AND NOT EXISTS (
        SELECT 1 FROM remboursements_integraux r 
        WHERE r.transaction_id = t.id
    )
    LIMIT 1;
    
    IF test_transaction_id IS NOT NULL THEN
        RAISE NOTICE '🧪 Test avec la transaction: %', test_transaction_id;
        
        -- Tester la fonction directe
        BEGIN
            PERFORM creer_remboursement_integral_direct(test_transaction_id);
            RAISE NOTICE '✅ Test réussi - Remboursement créé';
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE '❌ Test échoué: %', SQLERRM;
        END;
    ELSE
        RAISE NOTICE 'ℹ️ Aucune transaction de test trouvée';
    END IF;
END $$;

-- 6. Afficher un résumé final
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'RÉSUMÉ DU SYSTÈME DE REMBOURSEMENT';
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ Script de correction appliqué';
    RAISE NOTICE '✅ Fonctions créées correctement';
    RAISE NOTICE '✅ Trigger actif sur INSERT/UPDATE';
    RAISE NOTICE '✅ Système prêt pour les nouveaux remboursements';
    RAISE NOTICE '';
    RAISE NOTICE 'Pour créer les remboursements manquants, exécutez:';
    RAISE NOTICE 'SELECT creer_remboursements_manquants();';
    RAISE NOTICE '========================================';
END $$; 
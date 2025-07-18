-- ============================================================================
-- VÉRIFICATION SIMPLE : Triggers qui modifient les montants des transactions
-- ============================================================================

-- 1. Vérifier la transaction problématique
SELECT 
    'Transaction problématique' as type,
    montant,
    numero_transaction,
    updated_at
FROM transactions 
WHERE id = 'd88e6343-789e-48b3-9a63-b1638795ea2e';

-- 2. Lister TOUS les triggers actifs sur transactions
SELECT 
    'Triggers actifs' as type,
    trigger_name,
    event_manipulation,
    action_timing
FROM information_schema.triggers 
WHERE event_object_table = 'transactions'
AND trigger_schema = 'public';

-- 3. Vérifier les fonctions de trigger suspects
SELECT 
    'Fonctions suspectes' as type,
    routine_name
FROM information_schema.routines 
WHERE routine_name ILIKE '%transaction%'
   OR routine_name ILIKE '%montant%'
   OR routine_name ILIKE '%amount%'
   OR routine_name ILIKE '%update%'
ORDER BY routine_name;

-- 4. SOLUTION TEMPORAIRE : Désactiver tous les triggers sur transactions
-- Décommentez cette ligne si vous voulez désactiver temporairement tous les triggers
-- ALTER TABLE transactions DISABLE TRIGGER ALL;

-- 5. Test simple sans fonction complexe
DO $$ 
BEGIN 
    RAISE NOTICE 'Prêt à faire un test simple...';
    RAISE NOTICE 'Si vous voulez tester, décommentez la section suivante';
END $$;

/*
-- Test simple (décommentez si nécessaire)
INSERT INTO transactions (
    montant,
    numero_transaction,
    methode_paiement,
    numero_compte,
    description,
    statut,
    date_creation
) VALUES (
    7500, -- Test avec 7500
    'SIMPLE_TEST_' || floor(random() * 1000000),
    'MOBILE_MONEY',
    '+224999999999',
    'Test simple modification',
    'ANNULEE',
    NOW()
);

-- Vérifier immédiatement
SELECT 
    'Test résultat' as type,
    montant,
    numero_transaction,
    CASE 
        WHEN montant = 7500 THEN '✅ MONTANT PRÉSERVÉ'
        WHEN montant < 7500 THEN '❌ MONTANT RÉDUIT DE ' || (7500 - montant) || ' GNF'
        ELSE '❓ MONTANT AUGMENTÉ'
    END as diagnostic
FROM transactions 
WHERE numero_transaction LIKE 'SIMPLE_TEST_%'
AND date_creation > NOW() - INTERVAL '1 minute';
*/ 
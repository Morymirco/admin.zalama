-- ============================================================================
-- DEBUG URGENT : Identifier ce qui modifie le montant des transactions
-- ============================================================================

-- 1. Vérifier la transaction spécifique
SELECT 
    '=== TRANSACTION DU LOG VS SUPABASE ===' as debug,
    id,
    montant,
    numero_transaction,
    date_creation,
    updated_at,
    description
FROM transactions 
WHERE id = 'd88e6343-789e-48b3-9a63-b1638795ea2e';

-- 2. Lister TOUS les triggers sur la table transactions
SELECT 
    '=== TOUS LES TRIGGERS SUR TRANSACTIONS ===' as debug,
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'transactions'
AND trigger_schema = 'public'
ORDER BY trigger_name;

-- 3. Lister toutes les fonctions de trigger liées
SELECT 
    '=== FONCTIONS DE TRIGGER ===' as debug,
    routine_name,
    routine_definition
FROM information_schema.routines 
WHERE routine_name LIKE '%transaction%'
   OR routine_name LIKE '%update%'
   OR routine_name LIKE '%modify%'
   OR routine_name LIKE '%change%'
ORDER BY routine_name;

-- 4. Vérifier les contraintes qui pourraient modifier les données
SELECT 
    '=== CONTRAINTES SUR TRANSACTIONS ===' as debug,
    constraint_name,
    constraint_type
FROM information_schema.table_constraints 
WHERE table_name = 'transactions'
AND table_schema = 'public';

-- 5. Test : Créer une transaction simple pour voir si elle est modifiée
INSERT INTO transactions (
    id,
    montant,
    numero_transaction,
    methode_paiement,
    numero_compte,
    description,
    statut,
    date_creation
) VALUES (
    gen_random_uuid(),
    5000, -- Test avec 5000 pour voir s'il devient 4675 (5000-325)
    'DEBUG_TEST_' || EXTRACT(EPOCH FROM NOW()),
    'MOBILE_MONEY',
    '+224123456789',
    'Test debug modification montant',
    'ANNULEE',
    NOW()
);

-- 6. Vérifier immédiatement si le montant a été modifié
SELECT 
    '=== VÉRIFICATION TEST IMMÉDIATE ===' as debug,
    id,
    montant,
    numero_transaction,
    CASE 
        WHEN montant = 5000 THEN '✅ MONTANT NON MODIFIÉ'
        WHEN montant = 4675 THEN '❌ MONTANT RÉDUIT DE 6.5%'
        ELSE '❓ AUTRE MODIFICATION: ' || montant
    END as diagnostic
FROM transactions 
WHERE numero_transaction LIKE 'DEBUG_TEST_%'
AND date_creation > NOW() - INTERVAL '1 minute';

-- 7. Nettoyage du test
DELETE FROM transactions 
WHERE numero_transaction LIKE 'DEBUG_TEST_%'
AND date_creation > NOW() - INTERVAL '1 minute'; 
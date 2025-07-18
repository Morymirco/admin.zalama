-- ============================================================================
-- VÉRIFICATION IMMÉDIATE : Dernière transaction créée
-- ============================================================================

-- 1. Vérifier la transaction spécifique du log
SELECT 
    '=== TRANSACTION SPÉCIFIQUE DU LOG ===' as verification,
    id,
    montant,
    numero_transaction,
    date_creation,
    statut,
    description
FROM transactions 
WHERE numero_transaction = 'VVhvaVZIbnNucnlYeDczRjRXS09ES0Ntb00wR3Q3SGU='
OR id = 'd88e6343-789e-48b3-9a63-b1638795ea2e';

-- 2. Vérifier les 3 dernières transactions créées
SELECT 
    '=== 3 DERNIÈRES TRANSACTIONS ===' as verification,
    id,
    montant,
    numero_transaction,
    date_creation,
    statut,
    CASE 
        WHEN montant = 2000 THEN '✅ MONTANT CORRECT (2000)'
        WHEN montant = 1870 THEN '❌ MONTANT NET (1870)'
        ELSE '❓ AUTRE MONTANT'
    END as diagnostic
FROM transactions 
ORDER BY date_creation DESC 
LIMIT 3;

-- 3. Vérifier si il y a des triggers qui modifient les montants
SELECT 
    '=== TRIGGERS SUR TRANSACTIONS ===' as verification,
    trigger_name,
    event_manipulation,
    action_timing
FROM information_schema.triggers 
WHERE event_object_table = 'transactions'
AND trigger_schema = 'public';

-- 4. Vérifier les remboursements associés
SELECT 
    '=== REMBOURSEMENTS CRÉÉS ===' as verification,
    r.id,
    r.transaction_id,
    r.montant_total_remboursement,
    r.frais_service,
    t.montant as transaction_montant,
    CASE 
        WHEN r.montant_total_remboursement = t.montant THEN '✅ LOGIQUE CORRECTE'
        ELSE '❌ PROBLÈME REMBOURSEMENT'
    END as diagnostic
FROM remboursements r
JOIN transactions t ON r.transaction_id = t.id
WHERE t.date_creation > NOW() - INTERVAL '5 minutes'
ORDER BY r.date_creation DESC; 
-- ============================================================================
-- DIAGNOSTIC URGENT : Problème de montants incorrects dans table TRANSACTIONS
-- ============================================================================

-- 1. VÉRIFIER LES TRIGGERS ACTIFS SUR TRANSACTIONS
DO $$ 
BEGIN 
    RAISE NOTICE '=== TRIGGERS ACTIFS SUR LA TABLE TRANSACTIONS ===';
END $$;

SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'transactions'
AND trigger_schema = 'public'
ORDER BY trigger_name;

-- 2. VÉRIFIER LES FONCTIONS DE TRIGGER LIÉES AUX TRANSACTIONS
DO $$ 
BEGIN 
    RAISE NOTICE '=== FONCTIONS DE TRIGGER POUR TRANSACTIONS ===';
END $$;

SELECT 
    routine_name,
    routine_type
FROM information_schema.routines 
WHERE routine_name LIKE '%transaction%' 
   OR routine_name LIKE '%reimbursement%'
   OR routine_name LIKE '%remboursement%'
ORDER BY routine_name;

-- 3. ANALYSER LES MONTANTS ACTUELS DANS TRANSACTIONS
DO $$ 
BEGIN 
    RAISE NOTICE '=== ANALYSE DES MONTANTS TRANSACTIONS ===';
END $$;

SELECT 
    id,
    montant as transaction_montant,
    statut,
    date_creation,
    CASE 
        WHEN montant % 1 = 0 THEN '✅ Montant entier (probablement correct)'
        ELSE '❌ Montant décimal (probablement net après frais)'
    END as diagnostic_montant,
    -- Si on peut retrouver la demande d'avance liée
    demande_avance_id
FROM transactions 
ORDER BY date_creation DESC 
LIMIT 10;

-- 4. VÉRIFIER SI ON PEUT RETROUVER LES MONTANTS DEMANDÉS ORIGINAUX
DO $$ 
BEGIN 
    RAISE NOTICE '=== COMPARAISON AVEC DEMANDES AVANCE ===';
END $$;

SELECT 
    t.id as transaction_id,
    t.montant as transaction_montant,
    sar.montant_demande as demande_montant_original,
    CASE 
        WHEN t.montant = sar.montant_demande THEN '✅ CORRECT'
        WHEN t.montant = ROUND(sar.montant_demande * 0.935) THEN '❌ MONTANT NET (après frais ZaLaMa)'
        ELSE '❓ AUTRE LOGIQUE'
    END as diagnostic
FROM transactions t
LEFT JOIN salary_advance_requests sar ON t.demande_avance_id = sar.id
WHERE sar.id IS NOT NULL
ORDER BY t.date_creation DESC
LIMIT 5;

-- 5. IDENTIFIER LES TRANSACTIONS À CORRIGER
DO $$ 
BEGIN 
    RAISE NOTICE '=== TRANSACTIONS À CORRIGER ===';
END $$;

SELECT 
    t.id,
    t.montant as montant_actuel_incorrect,
    sar.montant_demande as montant_correct_requis,
    (sar.montant_demande - t.montant) as difference,
    ROUND((sar.montant_demande - t.montant) / sar.montant_demande * 100, 2) as pourcentage_difference
FROM transactions t
JOIN salary_advance_requests sar ON t.demande_avance_id = sar.id
WHERE t.montant != sar.montant_demande
ORDER BY t.date_creation DESC; 
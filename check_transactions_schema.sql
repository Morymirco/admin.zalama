-- ============================================================================
-- VÉRIFICATION SCHEMA : Structure de la table transactions
-- ============================================================================

-- 1. VÉRIFIER LES COLONNES DE LA TABLE TRANSACTIONS
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'transactions' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. VÉRIFIER LES CLÉS ÉTRANGÈRES
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name='transactions';

-- 3. VÉRIFIER QUELQUES ENREGISTREMENTS POUR VOIR LA STRUCTURE
SELECT * FROM transactions LIMIT 3; 
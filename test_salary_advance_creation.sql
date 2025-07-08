-- =====================================================
-- TEST DE CRÉATION DE DEMANDE D'AVANCE
-- =====================================================

-- 1. Vérifier que les tables existent
SELECT 'Vérification des tables...' as step;

SELECT 
    table_name,
    column_name,
    data_type,
    udt_name
FROM information_schema.columns 
WHERE table_name IN ('salary_advance_requests', 'notifications', 'employees', 'partners')
ORDER BY table_name, ordinal_position;

-- 2. Vérifier que l'enum notification_type existe
SELECT 'Vérification de l\'enum notification_type...' as step;

SELECT 
    t.typname as enum_name,
    e.enumlabel as enum_value
FROM pg_type t
JOIN pg_enum e ON t.oid = e.enumtypid
WHERE t.typname = 'notification_type'
ORDER BY e.enumsortorder;

-- 3. Vérifier les triggers existants
SELECT 'Vérification des triggers...' as step;

SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE event_object_table = 'salary_advance_requests'
ORDER BY trigger_name;

-- 4. Vérifier les fonctions existantes
SELECT 'Vérification des fonctions...' as step;

SELECT 
    routine_name,
    routine_type,
    data_type
FROM information_schema.routines
WHERE routine_name LIKE '%notification%'
   OR routine_name LIKE '%salary_advance%'
ORDER BY routine_name;

-- 5. Test de création d'une demande (si des données existent)
SELECT 'Test de création de demande...' as step;

-- Vérifier s'il y a des employés et partenaires
SELECT 
    'Employés disponibles:' as info,
    COUNT(*) as count
FROM employees
WHERE actif = true;

SELECT 
    'Partenaires disponibles:' as info,
    COUNT(*) as count
FROM partners
WHERE actif = true;

-- 6. Afficher un exemple de données valides
SELECT 'Exemple de données valides pour test...' as step;

SELECT 
    e.id as employee_id,
    e.nom || ' ' || e.prenom as employee_name,
    e.salaire_net,
    p.id as partner_id,
    p.nom as partner_name
FROM employees e
JOIN partners p ON e.partner_id = p.id
WHERE e.actif = true AND p.actif = true
LIMIT 3; 
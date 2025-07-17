-- =====================================================
-- DIAGNOSTIC COMPLET DE salary_advance_requests
-- =====================================================

-- 1. Vérifier que la table existe
SELECT 
    'Table salary_advance_requests' as info,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_name = 'salary_advance_requests' 
            AND table_schema = 'public'
        ) THEN '✅ Existe'
        ELSE '❌ N''existe pas'
    END as status;

-- 2. Voir la structure de la table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'salary_advance_requests'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Voir l'enum transaction_status
SELECT 
    'Valeurs autorisées dans transaction_status' as info,
    enumlabel as valeur
FROM pg_enum 
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'transaction_status')
ORDER BY enumsortorder;

-- 4. Compter le nombre total d'enregistrements
SELECT 
    'Nombre total d''enregistrements' as info,
    COUNT(*) as total
FROM salary_advance_requests;

-- 5. Voir quelques exemples d'enregistrements (sans filter sur statut)
SELECT 
    'Exemples d''enregistrements' as info,
    id,
    employe_id,
    montant_demande,
    statut::text as statut_brut,
    date_creation
FROM salary_advance_requests
ORDER BY date_creation DESC
LIMIT 5;

-- 6. Essayer de voir tous les statuts distincts (mode sécurisé)
-- En convertissant explicitement en text pour éviter l'erreur enum
SELECT 
    'Statuts présents (mode text)' as info,
    statut::text as statut_valeur,
    COUNT(*) as nombre
FROM salary_advance_requests
GROUP BY statut::text
ORDER BY COUNT(*) DESC;

-- 7. Identifier les problèmes potentiels
-- Vérifier s'il y a des enregistrements avec des valeurs NULL
SELECT 
    'Enregistrements avec statut NULL' as info,
    COUNT(*) as nombre
FROM salary_advance_requests
WHERE statut IS NULL;

-- 8. Vérifier les enregistrements récents
SELECT 
    'Enregistrements des 7 derniers jours' as info,
    COUNT(*) as nombre,
    array_agg(DISTINCT statut::text) as statuts_distincts
FROM salary_advance_requests
WHERE date_creation > NOW() - INTERVAL '7 days';

-- Message de fin
DO $$
BEGIN
    RAISE NOTICE '🔍 Diagnostic terminé !';
    RAISE NOTICE 'Analysez les résultats pour identifier les problèmes.';
END $$; 
-- =====================================================
-- SUPPRESSION DE TOUS LES TRIGGERS (VERSION SIMPLE)
-- =====================================================

-- Supprimer tous les triggers de la base de données
DO $$
DECLARE
    trigger_record RECORD;
BEGIN
    -- Supprimer tous les triggers
    FOR trigger_record IN 
        SELECT 
            trigger_name,
            event_object_table
        FROM information_schema.triggers 
        WHERE trigger_schema = 'public'
    LOOP
        EXECUTE 'DROP TRIGGER IF EXISTS ' || trigger_record.trigger_name || ' ON public.' || trigger_record.event_object_table;
        RAISE NOTICE 'Trigger supprimé: % sur la table %', trigger_record.trigger_name, trigger_record.event_object_table;
    END LOOP;
END $$;

-- Supprimer toutes les fonctions liées aux notifications et triggers
DO $$
DECLARE
    function_record RECORD;
BEGIN
    -- Supprimer toutes les fonctions liées aux notifications
    FOR function_record IN 
        SELECT routine_name
        FROM information_schema.routines 
        WHERE routine_schema = 'public'
          AND (routine_name LIKE '%notification%' 
               OR routine_name LIKE '%notify%'
               OR routine_name LIKE '%trigger%'
               OR routine_name LIKE '%advance%'
               OR routine_name LIKE '%alert%')
    LOOP
        EXECUTE 'DROP FUNCTION IF EXISTS ' || function_record.routine_name || ' CASCADE';
        RAISE NOTICE 'Fonction supprimée: %', function_record.routine_name;
    END LOOP;
END $$;

-- Vérifier qu'il ne reste plus de triggers
SELECT 'Triggers restants:' as info;
SELECT 
    trigger_name,
    event_object_table
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- Vérifier qu'il ne reste plus de fonctions liées aux notifications
SELECT 'Fonctions restantes liées aux notifications:' as info;
SELECT 
    routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND (routine_name LIKE '%notification%' 
       OR routine_name LIKE '%notify%'
       OR routine_name LIKE '%trigger%')
ORDER BY routine_name;

SELECT 'Tous les triggers et fonctions de notification ont été supprimés!' as message; 
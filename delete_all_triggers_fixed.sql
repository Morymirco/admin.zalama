-- =====================================================
-- SUPPRESSION DE TOUS LES TRIGGERS (VERSION CORRIGÉE)
-- =====================================================

-- Étape 1: Supprimer tous les triggers d'abord
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

-- Étape 2: Maintenant supprimer toutes les fonctions (sans dépendances)
DO $$
DECLARE
    function_record RECORD;
BEGIN
    -- Supprimer toutes les fonctions liées aux notifications et triggers
    FOR function_record IN 
        SELECT routine_name
        FROM information_schema.routines 
        WHERE routine_schema = 'public'
          AND (routine_name LIKE '%notification%' 
               OR routine_name LIKE '%notify%'
               OR routine_name LIKE '%trigger%'
               OR routine_name LIKE '%advance%'
               OR routine_name LIKE '%alert%'
               OR routine_name LIKE '%create_alert%'
               OR routine_name LIKE '%calculate_partner_stats%')
    LOOP
        EXECUTE 'DROP FUNCTION IF EXISTS ' || function_record.routine_name || ' CASCADE';
        RAISE NOTICE 'Fonction supprimée: %', function_record.routine_name;
    END LOOP;
END $$;

-- Étape 3: Supprimer la fonction update_updated_at_column() si elle existe encore
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Étape 4: Supprimer toutes les autres fonctions restantes liées aux triggers
DO $$
DECLARE
    function_record RECORD;
BEGIN
    -- Supprimer toutes les fonctions restantes qui pourraient être liées
    FOR function_record IN 
        SELECT routine_name
        FROM information_schema.routines 
        WHERE routine_schema = 'public'
          AND routine_name IN (
              'update_updated_at_column',
              'create_notification',
              'mark_notification_as_read',
              'mark_all_notifications_as_read',
              'get_notification_stats',
              'cleanup_old_notifications'
          )
    LOOP
        EXECUTE 'DROP FUNCTION IF EXISTS ' || function_record.routine_name || ' CASCADE';
        RAISE NOTICE 'Fonction supprimée: %', function_record.routine_name;
    END LOOP;
END $$;

-- =====================================================
-- VÉRIFICATION
-- =====================================================

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
       OR routine_name LIKE '%trigger%'
       OR routine_name LIKE '%advance%'
       OR routine_name LIKE '%alert%')
ORDER BY routine_name;

-- Vérifier qu'il ne reste plus de fonctions update_updated_at_column
SELECT 'Fonctions update_updated_at_column restantes:' as info;
SELECT 
    routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name LIKE '%update_updated_at_column%'
ORDER BY routine_name;

SELECT 'Tous les triggers et fonctions de notification ont été supprimés!' as message; 
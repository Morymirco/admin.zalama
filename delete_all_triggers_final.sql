-- =====================================================
-- SUPPRESSION DE TOUS LES TRIGGERS (VERSION FINALE)
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

-- Étape 2: Supprimer les fonctions avec leurs signatures exactes
-- Supprimer toutes les variantes de create_notification
DROP FUNCTION IF EXISTS create_notification(UUID, VARCHAR, TEXT, notification_type) CASCADE;
DROP FUNCTION IF EXISTS create_notification(UUID, VARCHAR, TEXT, notification_type, UUID) CASCADE;
DROP FUNCTION IF EXISTS create_notification(UUID, VARCHAR, TEXT, notification_type, UUID, UUID) CASCADE;
DROP FUNCTION IF EXISTS create_notification(UUID, VARCHAR, TEXT, notification_type, UUID, UUID, UUID) CASCADE;

-- Supprimer toutes les fonctions de notification spécifiques
DROP FUNCTION IF EXISTS notify_salary_advance_created() CASCADE;
DROP FUNCTION IF EXISTS notify_salary_advance_status_changed() CASCADE;
DROP FUNCTION IF EXISTS notify_financial_transaction_created() CASCADE;
DROP FUNCTION IF EXISTS notify_alert_created() CASCADE;
DROP FUNCTION IF EXISTS notify_alert_resolved() CASCADE;
DROP FUNCTION IF EXISTS notify_review_created() CASCADE;
DROP FUNCTION IF EXISTS notify_partnership_request_created() CASCADE;
DROP FUNCTION IF EXISTS notify_partnership_request_status_changed() CASCADE;
DROP FUNCTION IF EXISTS notify_security_event() CASCADE;
DROP FUNCTION IF EXISTS notify_new_employee() CASCADE;
DROP FUNCTION IF EXISTS notify_new_partner() CASCADE;
DROP FUNCTION IF EXISTS notify_transaction_created() CASCADE;
DROP FUNCTION IF EXISTS notify_new_service() CASCADE;
DROP FUNCTION IF EXISTS notify_failed_login_attempts() CASCADE;
DROP FUNCTION IF EXISTS notify_advanced_salary_advance_status() CASCADE;
DROP FUNCTION IF EXISTS check_and_notify_advance_limits() CASCADE;
DROP FUNCTION IF EXISTS create_advance_reminders() CASCADE;
DROP FUNCTION IF EXISTS notify_monthly_advance_stats() CASCADE;

-- Supprimer les fonctions de gestion des notifications
DROP FUNCTION IF EXISTS mark_notification_as_read(UUID) CASCADE;
DROP FUNCTION IF EXISTS mark_all_notifications_as_read(UUID) CASCADE;
DROP FUNCTION IF EXISTS get_notification_stats(UUID) CASCADE;
DROP FUNCTION IF EXISTS cleanup_old_notifications() CASCADE;

-- Supprimer les fonctions utilitaires
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS create_alert(VARCHAR, TEXT, alert_type, VARCHAR, UUID, INTEGER) CASCADE;
DROP FUNCTION IF EXISTS create_alert(VARCHAR, TEXT, alert_type, VARCHAR, UUID) CASCADE;
DROP FUNCTION IF EXISTS create_alert(VARCHAR, TEXT, alert_type, VARCHAR) CASCADE;
DROP FUNCTION IF EXISTS calculate_partner_stats(UUID) CASCADE;

-- Étape 3: Supprimer toutes les autres fonctions liées aux triggers et notifications
DO $$
DECLARE
    function_record RECORD;
BEGIN
    -- Supprimer toutes les fonctions restantes liées aux notifications
    FOR function_record IN 
        SELECT 
            routine_name,
            routine_definition
        FROM information_schema.routines 
        WHERE routine_schema = 'public'
          AND (routine_name LIKE '%notification%' 
               OR routine_name LIKE '%notify%'
               OR routine_name LIKE '%trigger%'
               OR routine_name LIKE '%advance%'
               OR routine_name LIKE '%alert%'
               OR routine_name LIKE '%create_alert%'
               OR routine_name LIKE '%calculate_partner_stats%'
               OR routine_name LIKE '%mark_notification%'
               OR routine_name LIKE '%get_notification%'
               OR routine_name LIKE '%cleanup_old%')
          AND routine_name NOT IN (
              'create_notification',
              'notify_salary_advance_created',
              'notify_salary_advance_status_changed',
              'notify_financial_transaction_created',
              'notify_alert_created',
              'notify_alert_resolved',
              'notify_review_created',
              'notify_partnership_request_created',
              'notify_partnership_request_status_changed',
              'notify_security_event',
              'notify_new_employee',
              'notify_new_partner',
              'notify_transaction_created',
              'notify_new_service',
              'notify_failed_login_attempts',
              'notify_advanced_salary_advance_status',
              'check_and_notify_advance_limits',
              'create_advance_reminders',
              'notify_monthly_advance_stats',
              'mark_notification_as_read',
              'mark_all_notifications_as_read',
              'get_notification_stats',
              'cleanup_old_notifications',
              'update_updated_at_column',
              'create_alert',
              'calculate_partner_stats'
          )
    LOOP
        BEGIN
            EXECUTE 'DROP FUNCTION IF EXISTS ' || function_record.routine_name || ' CASCADE';
            RAISE NOTICE 'Fonction supprimée: %', function_record.routine_name;
        EXCEPTION
            WHEN OTHERS THEN
                RAISE NOTICE 'Erreur lors de la suppression de %: %', function_record.routine_name, SQLERRM;
        END;
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
    routine_name,
    routine_type
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
-- =====================================================
-- SUPPRESSION COMPLÈTE DE TOUS LES TRIGGERS DE L'APPLICATION
-- =====================================================
-- Ce script supprime tous les triggers et fonctions qui peuvent
-- causer des conflits avec les statuts enum

-- 1. SUPPRIMER TOUS LES TRIGGERS
DO $$
DECLARE
    trigger_record RECORD;
BEGIN
    -- Parcourir tous les triggers de la base
    FOR trigger_record IN
        SELECT t.tgname, c.relname as table_name, n.nspname as schema_name
        FROM pg_trigger t
        JOIN pg_class c ON t.tgrelid = c.oid
        JOIN pg_namespace n ON c.relnamespace = n.oid
        WHERE n.nspname = 'public'
        AND t.tgname NOT LIKE 'RI_%'  -- Exclure les triggers de clés étrangères
        AND t.tgname NOT LIKE 'pg_%'  -- Exclure les triggers système
    LOOP
        BEGIN
            EXECUTE format('DROP TRIGGER IF EXISTS %I ON %I.%I CASCADE',
                         trigger_record.tgname,
                         trigger_record.schema_name,
                         trigger_record.table_name);
            RAISE NOTICE 'Trigger supprimé: % sur %', trigger_record.tgname, trigger_record.table_name;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Erreur lors de la suppression du trigger %: %', trigger_record.tgname, SQLERRM;
        END;
    END LOOP;
END $$;

-- 2. SUPPRIMER TOUTES LES FONCTIONS PERSONNALISÉES
DO $$
DECLARE
    function_record RECORD;
BEGIN
    -- Parcourir toutes les fonctions personnalisées
    FOR function_record IN
        SELECT p.proname, n.nspname as schema_name,
               pg_get_function_identity_arguments(p.oid) as args
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public'
        AND p.proname LIKE '%notification%'
        OR p.proname LIKE '%advance%'
        OR p.proname LIKE '%salary%'
        OR p.proname LIKE '%trigger%'
        OR p.proname LIKE '%notify%'
    LOOP
        BEGIN
            EXECUTE format('DROP FUNCTION IF EXISTS %I.%I(%s) CASCADE',
                         function_record.schema_name,
                         function_record.proname,
                         function_record.args);
            RAISE NOTICE 'Fonction supprimée: %', function_record.proname;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Erreur lors de la suppression de la fonction %: %', function_record.proname, SQLERRM;
        END;
    END LOOP;
END $$;

-- 3. SUPPRIMER LES FONCTIONS SPÉCIFIQUES CONNUES
DROP FUNCTION IF EXISTS public.create_notification(text, text, text, uuid, uuid) CASCADE;
DROP FUNCTION IF EXISTS public.notify_all_admins(text, text, text, uuid, uuid) CASCADE;
DROP FUNCTION IF EXISTS public.handle_salary_advance_status_change() CASCADE;
DROP FUNCTION IF EXISTS public.handle_transaction_status_change() CASCADE;
DROP FUNCTION IF EXISTS public.handle_remboursement_creation() CASCADE;
DROP FUNCTION IF EXISTS public.handle_partnership_request_status() CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_employee() CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_partner() CASCADE;
DROP FUNCTION IF EXISTS public.handle_alert_creation() CASCADE;
DROP FUNCTION IF EXISTS public.handle_high_risk_alert() CASCADE;
DROP FUNCTION IF EXISTS public.handle_positive_avis() CASCADE;
DROP FUNCTION IF EXISTS public.handle_negative_avis() CASCADE;
DROP FUNCTION IF EXISTS public.cleanup_old_notifications() CASCADE;
DROP FUNCTION IF EXISTS public.handle_failed_login() CASCADE;

-- 4. VÉRIFICATION FINALE
SELECT 
    'Triggers restants' as type,
    t.tgname as name,
    c.relname as table_name
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE n.nspname = 'public'
AND t.tgname NOT LIKE 'RI_%'
AND t.tgname NOT LIKE 'pg_%'

UNION ALL

SELECT 
    'Fonctions restantes' as type,
    p.proname as name,
    '' as table_name
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND (p.proname LIKE '%notification%'
     OR p.proname LIKE '%advance%'
     OR p.proname LIKE '%salary%'
     OR p.proname LIKE '%trigger%'
     OR p.proname LIKE '%notify%')

ORDER BY type, name;

-- 5. MESSAGE DE CONFIRMATION
SELECT 'Suppression terminée - Tous les triggers ont été supprimés' as status; 
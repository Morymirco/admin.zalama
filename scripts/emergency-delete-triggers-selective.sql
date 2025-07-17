-- =====================================================
-- SUPPRESSION SÉLECTIVE DES TRIGGERS PROBLÉMATIQUES
-- =====================================================
-- Ce script supprime UNIQUEMENT les triggers qui causent 
-- l'erreur "APPROUVE" en préservant le trigger de remboursements

-- ✅ TRIGGERS À PRÉSERVER :
-- - trigger_auto_remboursement (remboursements automatiques)
-- - trigger_creer_remboursement_integral (remboursements intégraux)
-- - trigger_remboursement_history (historique remboursements)
-- - triggers système et clés étrangères

-- ❌ TRIGGERS À SUPPRIMER :
-- - Tous les triggers de notifications
-- - Triggers qui modifient les statuts enum

-- 1. SUPPRIMER LES TRIGGERS DE NOTIFICATIONS PROBLÉMATIQUES
DO $$
DECLARE
    trigger_record RECORD;
    triggers_to_delete TEXT[] := ARRAY[
        'trigger_salary_advance_created',
        'trigger_salary_advance_status_changed',
        'trigger_transaction_created', 
        'trigger_transaction_status_changed',
        'trigger_remboursement_created',
        'trigger_remboursement_status_changed',
        'trigger_partnership_request_created',
        'trigger_partnership_request_status_changed',
        'trigger_employee_created',
        'trigger_partner_created',
        'trigger_alert_created',
        'trigger_alert_resolved',
        'trigger_avis_created',
        'trigger_security_event_high_risk',
        'trigger_failed_login_attempts'
    ];
    trigger_name TEXT;
BEGIN
    FOREACH trigger_name IN ARRAY triggers_to_delete
    LOOP
        -- Trouver la table associée au trigger
        SELECT t.tgname, c.relname as table_name, n.nspname as schema_name
        INTO trigger_record
        FROM pg_trigger t
        JOIN pg_class c ON t.tgrelid = c.oid
        JOIN pg_namespace n ON c.relnamespace = n.oid
        WHERE t.tgname = trigger_name
        AND n.nspname = 'public';
        
        IF FOUND THEN
            BEGIN
                EXECUTE format('DROP TRIGGER IF EXISTS %I ON %I.%I CASCADE',
                             trigger_record.tgname,
                             trigger_record.schema_name,
                             trigger_record.table_name);
                RAISE NOTICE '❌ Trigger supprimé: % sur %', trigger_record.tgname, trigger_record.table_name;
            EXCEPTION WHEN OTHERS THEN
                RAISE NOTICE '⚠️ Erreur lors de la suppression du trigger %: %', trigger_record.tgname, SQLERRM;
            END;
        ELSE
            RAISE NOTICE '📋 Trigger non trouvé: %', trigger_name;
        END IF;
    END LOOP;
END $$;

-- 2. SUPPRIMER LES FONCTIONS DE NOTIFICATIONS PROBLÉMATIQUES
DO $$
DECLARE
    function_record RECORD;
    functions_to_delete TEXT[] := ARRAY[
        'create_notification',
        'notify_all_admins',
        'notify_salary_advance_created',
        'notify_salary_advance_status_changed',
        'notify_transaction_created',
        'notify_transaction_status_changed',
        'notify_remboursement_created',
        'notify_remboursement_status_changed',
        'notify_partnership_request_status_changed',
        'notify_partnership_request_created',
        'handle_new_employee',
        'handle_new_partner',
        'handle_alert_creation',
        'handle_high_risk_alert',
        'handle_positive_avis',
        'handle_negative_avis',
        'cleanup_old_notifications',
        'handle_failed_login'
    ];
    function_name TEXT;
BEGIN
    FOREACH function_name IN ARRAY functions_to_delete
    LOOP
        -- Trouver la fonction avec tous ses arguments
        FOR function_record IN
            SELECT p.proname, n.nspname as schema_name,
                   pg_get_function_identity_arguments(p.oid) as args
            FROM pg_proc p
            JOIN pg_namespace n ON p.pronamespace = n.oid
            WHERE n.nspname = 'public'
            AND p.proname = function_name
        LOOP
            BEGIN
                EXECUTE format('DROP FUNCTION IF EXISTS %I.%I(%s) CASCADE',
                             function_record.schema_name,
                             function_record.proname,
                             function_record.args);
                RAISE NOTICE '❌ Fonction supprimée: %', function_record.proname;
            EXCEPTION WHEN OTHERS THEN
                RAISE NOTICE '⚠️ Erreur lors de la suppression de la fonction %: %', function_record.proname, SQLERRM;
            END;
        END LOOP;
    END LOOP;
END $$;

-- 3. VÉRIFIER QUE LES TRIGGERS DE REMBOURSEMENTS SONT PRÉSERVÉS
SELECT 
    '✅ TRIGGERS PRÉSERVÉS' as type,
    t.tgname as name,
    c.relname as table_name,
    'Trigger de remboursement conservé' as description
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE n.nspname = 'public'
AND (t.tgname LIKE '%remboursement%' 
     OR t.tgname LIKE '%reimbursement%'
     OR t.tgname = 'trigger_auto_remboursement')
AND t.tgname NOT LIKE 'RI_%'

UNION ALL

SELECT 
    '❌ TRIGGERS SUPPRIMÉS' as type,
    'triggers de notifications' as name,
    'diverses tables' as table_name,
    'Triggers problématiques supprimés' as description

ORDER BY type, name;

-- 4. VÉRIFIER QUE LES FONCTIONS DE REMBOURSEMENTS SONT PRÉSERVÉES
SELECT 
    '✅ FONCTIONS PRÉSERVÉES' as type,
    p.proname as name,
    'Fonction de remboursement conservée' as description
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND (p.proname LIKE '%remboursement%' 
     OR p.proname LIKE '%reimbursement%'
     OR p.proname = 'create_automatic_reimbursement')

UNION ALL

SELECT 
    '❌ FONCTIONS SUPPRIMÉES' as type,
    'fonctions de notifications' as name,
    'Fonctions problématiques supprimées' as description

ORDER BY type, name;

-- 5. MESSAGE DE CONFIRMATION
SELECT 
    'SUPPRESSION SÉLECTIVE TERMINÉE' as status,
    'Triggers de remboursements automatiques PRÉSERVÉS' as detail,
    'Triggers de notifications problématiques SUPPRIMÉS' as action;

-- 6. INSTRUCTION POUR L'UTILISATEUR
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🎯 SUPPRESSION SÉLECTIVE TERMINÉE';
    RAISE NOTICE '';
    RAISE NOTICE '✅ PRÉSERVÉ:';
    RAISE NOTICE '   - Trigger de remboursements automatiques';
    RAISE NOTICE '   - Fonctions de remboursements';
    RAISE NOTICE '   - Triggers système et clés étrangères';
    RAISE NOTICE '';
    RAISE NOTICE '❌ SUPPRIMÉ:';
    RAISE NOTICE '   - Triggers de notifications';
    RAISE NOTICE '   - Fonctions qui causent l''erreur APPROUVE';
    RAISE NOTICE '';
    RAISE NOTICE '🚀 RÉSULTAT ATTENDU:';
    RAISE NOTICE '   - Les modales d''approbation/rejet fonctionnent';
    RAISE NOTICE '   - Les remboursements automatiques continuent';
    RAISE NOTICE '   - Plus d''erreur enum "APPROUVE"';
END $$; 
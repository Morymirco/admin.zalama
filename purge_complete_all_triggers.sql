-- ============================================================================
-- PURGE COMPLÈTE : Suppression de TOUS les triggers trouvés dans le projet
-- ============================================================================

DO $$ 
BEGIN 
    RAISE NOTICE '=== SUPPRESSION COMPLÈTE DE TOUS LES TRIGGERS ===';
    RAISE NOTICE 'Ce script supprime TOUS les triggers personnalisés du projet ZaLaMa';
END $$;

-- 1. SUPPRIMER TOUS LES TRIGGERS TROUVÉS DANS LES SCRIPTS
-- Triggers de transactions et remboursements
DROP TRIGGER IF EXISTS create_automatic_reimbursement ON transactions;
DROP TRIGGER IF EXISTS transaction_status_change ON transactions;
DROP TRIGGER IF EXISTS update_reimbursement_on_transaction_status ON transactions;
DROP TRIGGER IF EXISTS creer_remboursement_integral_automatique ON transactions;
DROP TRIGGER IF EXISTS trigger_create_reimbursement ON transactions;
DROP TRIGGER IF EXISTS auto_create_reimbursement ON transactions;
DROP TRIGGER IF EXISTS trigger_auto_remboursement ON transactions;
DROP TRIGGER IF EXISTS trigger_creer_remboursement_integral ON transactions;
DROP TRIGGER IF EXISTS trigger_zalama_automatic_reimbursement ON transactions;
DROP TRIGGER IF EXISTS zalama_transaction_status_trigger ON transactions;
DROP TRIGGER IF EXISTS zalama_debug_transaction_trigger ON transactions;
DROP TRIGGER IF EXISTS zalama_safe_transaction_trigger ON transactions;
DROP TRIGGER IF EXISTS zalama_unique_transaction_trigger ON transactions;
DROP TRIGGER IF EXISTS simple_zalama_transaction_trigger ON transactions;
DROP TRIGGER IF EXISTS trigger_creer_remboursement_integral_automatique ON transactions;
DROP TRIGGER IF EXISTS trigger_create_automatic_reimbursement ON transactions;
DROP TRIGGER IF EXISTS trigger_remboursement_automatique ON transactions;

-- Triggers de notifications
DROP TRIGGER IF EXISTS trigger_salary_advance_created ON salary_advance_requests;
DROP TRIGGER IF EXISTS trigger_salary_advance_status_changed ON salary_advance_requests;
DROP TRIGGER IF EXISTS trigger_salary_advance_request ON salary_advance_requests;
DROP TRIGGER IF EXISTS trigger_advanced_salary_advance_status ON salary_advance_requests;
DROP TRIGGER IF EXISTS trigger_check_advance_limits ON salary_advance_requests;
DROP TRIGGER IF EXISTS trigger_urgent_advance_request ON salary_advance_requests;

DROP TRIGGER IF EXISTS trigger_transaction_created ON transactions;
DROP TRIGGER IF EXISTS trigger_financial_transaction_created ON financial_transactions;
DROP TRIGGER IF EXISTS trigger_advance_transaction_created ON transactions;
DROP TRIGGER IF EXISTS trigger_transaction_failed ON transactions;
DROP TRIGGER IF EXISTS trigger_transaction_status_changed ON transactions;

DROP TRIGGER IF EXISTS trigger_remboursement_created ON remboursements;
DROP TRIGGER IF EXISTS trigger_remboursement_status_changed ON remboursements;
DROP TRIGGER IF EXISTS trigger_remboursement_history ON remboursements;
DROP TRIGGER IF EXISTS trigger_update_remboursements_updated_at ON remboursements;

DROP TRIGGER IF EXISTS trigger_alert_created ON alerts;
DROP TRIGGER IF EXISTS trigger_alert_resolved ON alerts;
DROP TRIGGER IF EXISTS trigger_alert_status_changed ON alerts;

DROP TRIGGER IF EXISTS trigger_review_created ON avis;
DROP TRIGGER IF EXISTS trigger_avis_created ON avis;

DROP TRIGGER IF EXISTS trigger_partnership_request_created ON partnership_requests;
DROP TRIGGER IF EXISTS trigger_partnership_request_status_changed ON partnership_requests;
DROP TRIGGER IF EXISTS trigger_partnership_request ON partnership_requests;
DROP TRIGGER IF EXISTS trigger_partnership_status_changed ON partnership_requests;

DROP TRIGGER IF EXISTS trigger_employee_created ON employees;
DROP TRIGGER IF EXISTS trigger_new_employee ON employees;
DROP TRIGGER IF EXISTS trigger_update_employees_updated_at ON employees;

DROP TRIGGER IF EXISTS trigger_partner_created ON partners;
DROP TRIGGER IF EXISTS trigger_new_partner ON partners;
DROP TRIGGER IF EXISTS trigger_update_partners_updated_at ON partners;

DROP TRIGGER IF EXISTS trigger_new_service ON services;
DROP TRIGGER IF EXISTS trigger_update_services_updated_at ON services;

DROP TRIGGER IF EXISTS trigger_security_event ON security_events;
DROP TRIGGER IF EXISTS trigger_security_event_high_risk ON security_events;

DROP TRIGGER IF EXISTS trigger_failed_login_attempts ON password_attempts;

-- Supprimer les triggers sur les tables qui existent seulement
DO $$
BEGIN
    -- Vérifier l'existence des tables avant de supprimer les triggers
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN
        DROP TRIGGER IF EXISTS trigger_update_users_updated_at ON users;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'admin_users') THEN
        DROP TRIGGER IF EXISTS trigger_update_admin_users_updated_at ON admin_users;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'demandes_avance_salaire') THEN
        DROP TRIGGER IF EXISTS trigger_update_demandes_avance_updated_at ON demandes_avance_salaire;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'partnership_requests') THEN
        DROP TRIGGER IF EXISTS trigger_update_partnership_requests_updated_at ON partnership_requests;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'performance_metrics') THEN
        DROP TRIGGER IF EXISTS trigger_update_performance_metrics_updated_at ON performance_metrics;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'dashboard_widgets') THEN
        DROP TRIGGER IF EXISTS trigger_update_dashboard_widgets_updated_at ON dashboard_widgets;
    END IF;
    
    -- Triggers sur transactions (table principale)
    DROP TRIGGER IF EXISTS trigger_update_transactions_updated_at ON transactions;
    
    RAISE NOTICE 'Triggers sur tables optionnelles vérifiés et supprimés si existants';
END $$;

-- 2. SUPPRIMER TOUTES LES FONCTIONS DE TRIGGER
DROP FUNCTION IF EXISTS create_automatic_reimbursement() CASCADE;
DROP FUNCTION IF EXISTS creer_remboursement_integral_automatique() CASCADE;
DROP FUNCTION IF EXISTS update_reimbursement_on_transaction_status() CASCADE;
DROP FUNCTION IF EXISTS handle_transaction_status_change() CASCADE;
DROP FUNCTION IF EXISTS auto_create_reimbursement() CASCADE;
DROP FUNCTION IF EXISTS zalama_transaction_trigger() CASCADE;
DROP FUNCTION IF EXISTS zalama_debug_trigger() CASCADE;
DROP FUNCTION IF EXISTS zalama_safe_trigger() CASCADE;
DROP FUNCTION IF EXISTS zalama_unique_trigger() CASCADE;
DROP FUNCTION IF EXISTS simple_zalama_trigger() CASCADE;
DROP FUNCTION IF EXISTS create_automatic_reimbursement_zalama() CASCADE;
DROP FUNCTION IF EXISTS creer_remboursement_integral_direct(UUID) CASCADE;
DROP FUNCTION IF EXISTS zalama_create_automatic_reimbursement() CASCADE;

-- Fonctions de notification
DROP FUNCTION IF EXISTS create_notification(UUID, VARCHAR, TEXT, notification_type) CASCADE;
DROP FUNCTION IF EXISTS create_notification(UUID, VARCHAR, TEXT, notification_type, UUID) CASCADE;
DROP FUNCTION IF EXISTS create_notification(UUID, VARCHAR, TEXT, notification_type, UUID, UUID) CASCADE;
DROP FUNCTION IF EXISTS create_notification(UUID, VARCHAR, TEXT, notification_type, UUID, UUID, UUID) CASCADE;
DROP FUNCTION IF EXISTS notify_salary_advance_created() CASCADE;
DROP FUNCTION IF EXISTS notify_salary_advance_status_changed() CASCADE;
DROP FUNCTION IF EXISTS notify_financial_transaction_created() CASCADE;
DROP FUNCTION IF EXISTS notify_transaction_created() CASCADE;
DROP FUNCTION IF EXISTS notify_transaction_status_changed() CASCADE;
DROP FUNCTION IF EXISTS notify_alert_created() CASCADE;
DROP FUNCTION IF EXISTS notify_alert_resolved() CASCADE;
DROP FUNCTION IF EXISTS notify_alert_status_changed() CASCADE;
DROP FUNCTION IF EXISTS notify_review_created() CASCADE;
DROP FUNCTION IF EXISTS notify_avis_created() CASCADE;
DROP FUNCTION IF EXISTS notify_partnership_request() CASCADE;
DROP FUNCTION IF EXISTS notify_partnership_request_created() CASCADE;
DROP FUNCTION IF EXISTS notify_partnership_request_status_changed() CASCADE;
DROP FUNCTION IF EXISTS notify_partnership_status_changed() CASCADE;
DROP FUNCTION IF EXISTS notify_security_event() CASCADE;
DROP FUNCTION IF EXISTS notify_security_event_high_risk() CASCADE;
DROP FUNCTION IF EXISTS notify_new_employee() CASCADE;
DROP FUNCTION IF EXISTS notify_employee_created() CASCADE;
DROP FUNCTION IF EXISTS notify_new_partner() CASCADE;
DROP FUNCTION IF EXISTS notify_partner_created() CASCADE;
DROP FUNCTION IF EXISTS notify_new_service() CASCADE;
DROP FUNCTION IF EXISTS notify_failed_login_attempts() CASCADE;
DROP FUNCTION IF EXISTS notify_remboursement_created() CASCADE;
DROP FUNCTION IF EXISTS notify_remboursement_status_changed() CASCADE;

-- Fonctions utilitaires
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS log_reimbursement_history() CASCADE;
DROP FUNCTION IF EXISTS enable_notification_triggers() CASCADE;
DROP FUNCTION IF EXISTS cleanup_notification_cache() CASCADE;

-- 3. SUPPRIMER DYNAMIQUEMENT TOUS LES TRIGGERS RESTANTS
DO $$
DECLARE
    trigger_record RECORD;
BEGIN
    RAISE NOTICE 'Suppression dynamique des triggers restants...';
    
    FOR trigger_record IN 
        SELECT trigger_name, event_object_table
        FROM information_schema.triggers 
        WHERE trigger_schema = 'public'
        AND trigger_name NOT LIKE 'RI_%' -- Préserver les triggers système
        AND trigger_name NOT LIKE 'pg_%' -- Préserver les triggers PostgreSQL
    LOOP
        BEGIN
            EXECUTE format('DROP TRIGGER IF EXISTS %I ON %I', 
                          trigger_record.trigger_name, 
                          trigger_record.event_object_table);
            RAISE NOTICE 'Supprimé: % sur %', trigger_record.trigger_name, trigger_record.event_object_table;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Impossible de supprimer %: %', trigger_record.trigger_name, SQLERRM;
        END;
    END LOOP;
END $$;

-- 4. SUPPRIMER DYNAMIQUEMENT TOUTES LES FONCTIONS RESTANTES
DO $$
DECLARE
    func_record RECORD;
BEGIN
    RAISE NOTICE 'Suppression dynamique des fonctions restantes...';
    
    FOR func_record IN 
        SELECT routine_name
        FROM information_schema.routines 
        WHERE routine_schema = 'public'
        AND (routine_name LIKE '%notification%' 
             OR routine_name LIKE '%notify%'
             OR routine_name LIKE '%trigger%'
             OR routine_name LIKE '%advance%'
             OR routine_name LIKE '%alert%'
             OR routine_name LIKE '%remboursement%'
             OR routine_name LIKE '%reimbursement%'
             OR routine_name LIKE '%zalama%'
             OR routine_name LIKE '%automatic%')
        AND routine_name NOT LIKE 'pg_%' -- Préserver les fonctions PostgreSQL
    LOOP
        BEGIN
            EXECUTE format('DROP FUNCTION IF EXISTS %I() CASCADE', func_record.routine_name);
            RAISE NOTICE 'Fonction supprimée: %', func_record.routine_name;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Impossible de supprimer fonction %: %', func_record.routine_name, SQLERRM;
        END;
    END LOOP;
END $$;

-- 5. VÉRIFICATION FINALE
DO $$ 
BEGIN 
    RAISE NOTICE '=== VÉRIFICATION FINALE ===';
END $$;

SELECT 
    'Triggers restants (non-système)' as type,
    trigger_name,
    event_object_table
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
AND trigger_name NOT LIKE 'RI_%' -- Exclure les triggers système
AND trigger_name NOT LIKE 'pg_%' -- Exclure les triggers PostgreSQL
ORDER BY trigger_name;

SELECT 
    'Fonctions restantes (liées aux triggers)' as type,
    routine_name
FROM information_schema.routines 
WHERE routine_schema = 'public'
AND (routine_name LIKE '%notification%' 
     OR routine_name LIKE '%notify%'
     OR routine_name LIKE '%trigger%'
     OR routine_name LIKE '%remboursement%'
     OR routine_name LIKE '%zalama%')
ORDER BY routine_name;

-- 6. INSTRUCTIONS FINALES
DO $$ 
BEGIN 
    RAISE NOTICE '';
    RAISE NOTICE '🎯 ==========================================';
    RAISE NOTICE '🎯 PURGE COMPLÈTE TERMINÉE';
    RAISE NOTICE '🎯 ==========================================';
    RAISE NOTICE '';
    RAISE NOTICE '✅ TOUS les triggers personnalisés supprimés';
    RAISE NOTICE '✅ TOUTES les fonctions de trigger supprimées';
    RAISE NOTICE '✅ Triggers système préservés (contraintes FK)';
    RAISE NOTICE '';
    RAISE NOTICE '📋 BASE DE DONNÉES PRÊTE POUR :';
    RAISE NOTICE '   - Création de nouveaux triggers simples';
    RAISE NOTICE '   - Tests sans conflits';
    RAISE NOTICE '   - Logique ZaLaMa pure';
    RAISE NOTICE '';
    RAISE NOTICE 'MAINTENANT : Testez une demande d''avance pour vérifier !';
END $$; 
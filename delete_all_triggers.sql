-- =====================================================
-- SUPPRESSION DE TOUS LES TRIGGERS
-- =====================================================

-- 1. Supprimer tous les triggers liés aux demandes d'avance
DROP TRIGGER IF EXISTS trigger_salary_advance_created ON public.salary_advance_requests;
DROP TRIGGER IF EXISTS trigger_salary_advance_status_changed ON public.salary_advance_requests;
DROP TRIGGER IF EXISTS trigger_check_advance_limits ON public.salary_advance_requests;

-- 2. Supprimer tous les triggers liés aux transactions
DROP TRIGGER IF EXISTS trigger_financial_transaction_created ON public.financial_transactions;
DROP TRIGGER IF EXISTS trigger_transaction_created ON public.transactions;

-- 3. Supprimer tous les triggers liés aux alertes
DROP TRIGGER IF EXISTS trigger_alert_created ON public.alerts;
DROP TRIGGER IF EXISTS trigger_alert_resolved ON public.alerts;

-- 4. Supprimer tous les triggers liés aux employés
DROP TRIGGER IF EXISTS trigger_new_employee ON public.employees;
DROP TRIGGER IF EXISTS trigger_update_employees_updated_at ON public.employees;

-- 5. Supprimer tous les triggers liés aux partenaires
DROP TRIGGER IF EXISTS trigger_new_partner ON public.partners;
DROP TRIGGER IF EXISTS trigger_update_partners_updated_at ON public.partners;

-- 6. Supprimer tous les triggers liés aux services
DROP TRIGGER IF EXISTS trigger_new_service ON public.services;
DROP TRIGGER IF EXISTS trigger_update_services_updated_at ON public.services;

-- 7. Supprimer tous les triggers liés aux utilisateurs
DROP TRIGGER IF EXISTS trigger_update_users_updated_at ON public.users;
DROP TRIGGER IF EXISTS trigger_update_admin_users_updated_at ON public.admin_users;

-- 8. Supprimer tous les triggers liés aux avis
DROP TRIGGER IF EXISTS trigger_review_created ON public.avis;

-- 9. Supprimer tous les triggers liés aux demandes de partenariat
DROP TRIGGER IF EXISTS trigger_partnership_request_created ON public.partnership_requests;
DROP TRIGGER IF EXISTS trigger_partnership_request_status_changed ON public.partnership_requests;

-- 10. Supprimer tous les triggers liés aux demandes d'avance (ancienne table)
DROP TRIGGER IF EXISTS trigger_update_demandes_avance_updated_at ON public.demandes_avance_salaire;

-- 11. Supprimer tous les triggers liés aux transactions (ancienne table)
DROP TRIGGER IF EXISTS trigger_update_transactions_updated_at ON public.transactions;

-- 12. Supprimer tous les triggers liés aux demandes de partenariat
DROP TRIGGER IF EXISTS trigger_update_partnership_requests_updated_at ON public.partnership_requests;

-- 13. Supprimer tous les triggers liés aux métriques de performance
DROP TRIGGER IF EXISTS trigger_update_performance_metrics_updated_at ON public.performance_metrics;

-- 14. Supprimer tous les triggers liés aux événements de sécurité
DROP TRIGGER IF EXISTS trigger_security_event ON public.security_events;

-- 15. Supprimer tous les triggers liés aux tentatives de mot de passe
DROP TRIGGER IF EXISTS trigger_password_attempts ON public.password_attempts;

-- 16. Supprimer tous les triggers liés aux activités utilisateur
DROP TRIGGER IF EXISTS trigger_user_activities ON public.user_activities;

-- 17. Supprimer tous les triggers liés aux widgets du dashboard
DROP TRIGGER IF EXISTS trigger_update_dashboard_widgets_updated_at ON public.dashboard_widgets;

-- 18. Supprimer tous les triggers liés aux métriques de performance
DROP TRIGGER IF EXISTS trigger_update_performance_metrics_updated_at ON public.performance_metrics;

-- 19. Supprimer tous les triggers liés aux tentatives de mot de passe
DROP TRIGGER IF EXISTS trigger_password_attempts ON public.password_attempts;

-- 20. Supprimer tous les triggers liés aux activités utilisateur
DROP TRIGGER IF EXISTS trigger_user_activities ON public.user_activities;

-- 21. Supprimer tous les triggers liés aux widgets du dashboard
DROP TRIGGER IF EXISTS trigger_update_dashboard_widgets_updated_at ON public.dashboard_widgets;

-- 22. Supprimer tous les triggers liés aux métriques de performance
DROP TRIGGER IF EXISTS trigger_update_performance_metrics_updated_at ON public.performance_metrics;

-- 23. Supprimer tous les triggers liés aux tentatives de mot de passe
DROP TRIGGER IF EXISTS trigger_password_attempts ON public.password_attempts;

-- 24. Supprimer tous les triggers liés aux activités utilisateur
DROP TRIGGER IF EXISTS trigger_user_activities ON public.user_activities;

-- 25. Supprimer tous les triggers liés aux widgets du dashboard
DROP TRIGGER IF EXISTS trigger_update_dashboard_widgets_updated_at ON public.dashboard_widgets;

-- =====================================================
-- SUPPRESSION DE TOUTES LES FONCTIONS
-- =====================================================

-- 26. Supprimer toutes les fonctions de notification
DROP FUNCTION IF EXISTS create_notification(UUID, VARCHAR, TEXT, notification_type, UUID, UUID);
DROP FUNCTION IF EXISTS create_notification(UUID, VARCHAR, TEXT, notification_type);
DROP FUNCTION IF EXISTS notify_salary_advance_created();
DROP FUNCTION IF EXISTS notify_salary_advance_status_changed();
DROP FUNCTION IF EXISTS notify_financial_transaction_created();
DROP FUNCTION IF EXISTS notify_alert_created();
DROP FUNCTION IF EXISTS notify_alert_resolved();
DROP FUNCTION IF EXISTS notify_review_created();
DROP FUNCTION IF EXISTS notify_partnership_request_created();
DROP FUNCTION IF EXISTS notify_partnership_request_status_changed();
DROP FUNCTION IF EXISTS notify_security_event();
DROP FUNCTION IF EXISTS notify_new_employee();
DROP FUNCTION IF EXISTS notify_new_partner();
DROP FUNCTION IF EXISTS notify_transaction_created();
DROP FUNCTION IF EXISTS notify_new_service();
DROP FUNCTION IF EXISTS notify_failed_login_attempts();
DROP FUNCTION IF EXISTS notify_advanced_salary_advance_status();
DROP FUNCTION IF EXISTS check_and_notify_advance_limits();
DROP FUNCTION IF EXISTS create_advance_reminders();
DROP FUNCTION IF EXISTS notify_monthly_advance_stats();

-- 27. Supprimer toutes les fonctions de gestion des notifications
DROP FUNCTION IF EXISTS mark_notification_as_read(UUID);
DROP FUNCTION IF EXISTS mark_all_notifications_as_read(UUID);
DROP FUNCTION IF EXISTS get_notification_stats(UUID);
DROP FUNCTION IF EXISTS cleanup_old_notifications();

-- 28. Supprimer toutes les fonctions utilitaires
DROP FUNCTION IF EXISTS update_updated_at_column();
DROP FUNCTION IF EXISTS create_alert(VARCHAR, TEXT, alert_type, VARCHAR, UUID, INTEGER);
DROP FUNCTION IF EXISTS calculate_partner_stats(UUID);

-- =====================================================
-- VÉRIFICATION
-- =====================================================

-- 29. Lister tous les triggers restants (devrait être vide)
SELECT 'Triggers restants:' as info;
SELECT 
    trigger_name,
    event_object_table,
    event_manipulation
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- 30. Lister toutes les fonctions restantes liées aux notifications
SELECT 'Fonctions restantes liées aux notifications:' as info;
SELECT 
    routine_name,
    routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND (routine_name LIKE '%notification%' 
       OR routine_name LIKE '%trigger%'
       OR routine_name LIKE '%notify%')
ORDER BY routine_name;

-- 31. Message de confirmation
SELECT 'Tous les triggers et fonctions de notification ont été supprimés!' as message; 
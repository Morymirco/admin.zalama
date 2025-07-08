-- =====================================================
-- SCRIPT POUR SUPPRIMER TOUS LES TRIGGERS LIÉS AUX NOTIFICATIONS
-- =====================================================

-- ATTENTION: Ce script supprime définitivement tous les triggers de notification
-- Assurez-vous de faire une sauvegarde avant d'exécuter ce script

-- =====================================================
-- SUPPRESSION DES TRIGGERS DE NOTIFICATION PRINCIPAUX
-- =====================================================

-- Triggers pour les demandes d'avance de salaire
DROP TRIGGER IF EXISTS trigger_salary_advance_created ON public.salary_advance_requests;
DROP TRIGGER IF EXISTS trigger_salary_advance_status_changed ON public.salary_advance_requests;
DROP TRIGGER IF EXISTS trigger_salary_advance_request ON public.salary_advance_requests;
DROP TRIGGER IF EXISTS trigger_advanced_salary_advance_status ON public.salary_advance_requests;
DROP TRIGGER IF EXISTS trigger_check_advance_limits ON public.salary_advance_requests;
DROP TRIGGER IF EXISTS trigger_urgent_advance_request ON public.salary_advance_requests;

-- Triggers pour les transactions
DROP TRIGGER IF EXISTS trigger_transaction_created ON public.transactions;
DROP TRIGGER IF EXISTS trigger_financial_transaction_created ON public.financial_transactions;
DROP TRIGGER IF EXISTS trigger_advance_transaction_created ON public.transactions;
DROP TRIGGER IF EXISTS trigger_transaction_failed ON public.transactions;

-- Triggers pour les alertes
DROP TRIGGER IF EXISTS trigger_alert_created ON public.alerts;
DROP TRIGGER IF EXISTS trigger_alert_resolved ON public.alerts;
DROP TRIGGER IF EXISTS trigger_alert_status_changed ON public.alerts;

-- Triggers pour les avis
DROP TRIGGER IF EXISTS trigger_review_created ON public.avis;
DROP TRIGGER IF EXISTS trigger_avis_created ON public.avis;

-- Triggers pour les demandes de partenariat
DROP TRIGGER IF EXISTS trigger_partnership_request_created ON public.partnership_requests;
DROP TRIGGER IF EXISTS trigger_partnership_request_status_changed ON public.partnership_requests;
DROP TRIGGER IF EXISTS trigger_partnership_request ON public.partnership_requests;
DROP TRIGGER IF EXISTS trigger_partnership_status_changed ON public.partnership_requests;

-- Triggers pour les événements de sécurité
DROP TRIGGER IF EXISTS trigger_security_event ON public.security_events;
DROP TRIGGER IF EXISTS trigger_failed_login_attempts ON public.password_attempts;

-- Triggers pour les nouveaux employés/partenaires/services
DROP TRIGGER IF EXISTS trigger_new_employee ON public.employees;
DROP TRIGGER IF EXISTS trigger_new_partner ON public.partners;
DROP TRIGGER IF EXISTS trigger_new_service ON public.services;

-- =====================================================
-- SUPPRESSION DES FONCTIONS DE NOTIFICATION
-- =====================================================

-- Fonctions principales de notification
DROP FUNCTION IF EXISTS create_notification(UUID, VARCHAR, TEXT, notification_type, UUID, UUID);
DROP FUNCTION IF EXISTS create_notification(UUID, VARCHAR, TEXT, notification_type);

-- Fonctions pour les demandes d'avance
DROP FUNCTION IF EXISTS notify_salary_advance_created();
DROP FUNCTION IF EXISTS notify_salary_advance_status_changed();
DROP FUNCTION IF EXISTS notify_advanced_salary_advance_status();
DROP FUNCTION IF EXISTS check_and_notify_advance_limits();
DROP FUNCTION IF EXISTS notify_urgent_advance_request();

-- Fonctions pour les transactions
DROP FUNCTION IF EXISTS notify_transaction_created();
DROP FUNCTION IF EXISTS notify_financial_transaction_created();
DROP FUNCTION IF EXISTS notify_advance_transaction_created();
DROP FUNCTION IF EXISTS notify_transaction_failed();

-- Fonctions pour les alertes
DROP FUNCTION IF EXISTS notify_alert_created();
DROP FUNCTION IF EXISTS notify_alert_resolved();
DROP FUNCTION IF EXISTS notify_alert_status_changed();

-- Fonctions pour les avis
DROP FUNCTION IF EXISTS notify_review_created();
DROP FUNCTION IF EXISTS notify_avis_created();

-- Fonctions pour les partenariats
DROP FUNCTION IF EXISTS notify_partnership_request_created();
DROP FUNCTION IF EXISTS notify_partnership_request_status_changed();
DROP FUNCTION IF EXISTS notify_partnership_request();
DROP FUNCTION IF EXISTS notify_partnership_status_changed();

-- Fonctions pour la sécurité
DROP FUNCTION IF EXISTS notify_security_event();
DROP FUNCTION IF EXISTS notify_failed_login_attempts();

-- Fonctions pour les nouveaux éléments
DROP FUNCTION IF EXISTS notify_new_employee();
DROP FUNCTION IF EXISTS notify_new_partner();
DROP FUNCTION IF EXISTS notify_new_service();

-- Fonctions utilitaires de notification
DROP FUNCTION IF EXISTS mark_notification_as_read(UUID);
DROP FUNCTION IF EXISTS mark_all_notifications_as_read(UUID);
DROP FUNCTION IF EXISTS get_notification_stats(UUID);
DROP FUNCTION IF EXISTS cleanup_old_notifications();
DROP FUNCTION IF EXISTS create_advance_reminders();
DROP FUNCTION IF EXISTS notify_monthly_advance_stats();
DROP FUNCTION IF EXISTS notify_batch_advance_approval(INTEGER, INTEGER, UUID);

-- =====================================================
-- SUPPRESSION DES INDEX LIÉS AUX NOTIFICATIONS (OPTIONNEL)
-- =====================================================

-- Index sur la table notifications
DROP INDEX IF EXISTS idx_notifications_user_id;
DROP INDEX IF EXISTS idx_notifications_lu;
DROP INDEX IF EXISTS idx_notifications_date_creation;
DROP INDEX IF EXISTS idx_notifications_type;
DROP INDEX IF EXISTS idx_notifications_employee_id;
DROP INDEX IF EXISTS idx_notifications_partner_id;

-- Index sur les tables liées aux notifications
DROP INDEX IF EXISTS idx_salary_advance_requests_statut;
DROP INDEX IF EXISTS idx_salary_advance_requests_date_creation;
DROP INDEX IF EXISTS idx_salary_advance_requests_montant_demande;
DROP INDEX IF EXISTS idx_financial_transactions_montant;
DROP INDEX IF EXISTS idx_alerts_assigne_a;
DROP INDEX IF EXISTS idx_avis_note;
DROP INDEX IF EXISTS idx_security_events_risk_score;
DROP INDEX IF EXISTS idx_transactions_demande_avance_id;
DROP INDEX IF EXISTS idx_transactions_statut;
DROP INDEX IF EXISTS idx_employees_salaire_net;

-- =====================================================
-- MESSAGE DE CONFIRMATION
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE 'Tous les triggers et fonctions de notification ont été supprimés avec succès.';
    RAISE NOTICE 'Les index liés aux notifications ont également été supprimés.';
    RAISE NOTICE 'Le système de notifications automatiques est maintenant désactivé.';
END $$; 
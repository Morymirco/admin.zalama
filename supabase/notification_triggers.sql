-- =====================================================
-- SYSTÈME DE NOTIFICATIONS AUTOMATIQUES
-- =====================================================

-- Fonction pour créer une notification
CREATE OR REPLACE FUNCTION create_notification(
    p_user_id UUID,
    p_titre VARCHAR,
    p_message TEXT,
    p_type notification_type DEFAULT 'Information'
)
RETURNS UUID AS $$
DECLARE
    notification_id UUID;
BEGIN
    INSERT INTO public.notifications (
        user_id,
        titre,
        message,
        type,
        lu,
        date_creation
    ) VALUES (
        p_user_id,
        p_titre,
        p_message,
        p_type,
        false,
        now()
    ) RETURNING id INTO notification_id;
    
    RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- TRIGGERS POUR LES DEMANDES D'AVANCE DE SALAIRE
-- =====================================================

-- Notification lors de la création d'une demande d'avance
CREATE OR REPLACE FUNCTION notify_salary_advance_created()
RETURNS TRIGGER AS $$
DECLARE
    employee_name text;
    partner_name text;
    admin_users_cursor CURSOR FOR
        SELECT id FROM admin_users 
        WHERE role IN ('admin', 'manager') AND active = true;
BEGIN
    -- Récupérer les informations de l'employé et du partenaire
    SELECT 
        e.nom || ' ' || e.prenom,
        p.nom
    INTO employee_name, partner_name
    FROM employees e
    LEFT JOIN partners p ON e.partner_id = p.id
    WHERE e.id = NEW.employe_id;
    
    -- Notifier tous les administrateurs
    FOR admin_user IN admin_users_cursor LOOP
        PERFORM create_notification(
            admin_user.id,
            'Nouvelle demande d''avance de salaire',
            'L''employé ' || employee_name || ' du partenaire ' || partner_name || 
            ' a soumis une demande d''avance de ' || NEW.montant_demande || ' FCFA.',
            'Alerte'
        );
    END LOOP;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_salary_advance_created ON public.salary_advance_requests;
CREATE TRIGGER trigger_salary_advance_created
    AFTER INSERT ON public.salary_advance_requests
    FOR EACH ROW
    EXECUTE FUNCTION notify_salary_advance_created();

-- Notification lors du changement de statut d'une demande
CREATE OR REPLACE FUNCTION notify_salary_advance_status_changed()
RETURNS TRIGGER AS $$
DECLARE
    employee_name text;
    partner_name text;
    employee_user_id uuid;
BEGIN
    -- Vérifier si le statut a changé
    IF OLD.statut != NEW.statut THEN
        -- Récupérer les informations
        SELECT 
            e.nom || ' ' || e.prenom,
            p.nom,
            e.user_id
        INTO employee_name, partner_name, employee_user_id
        FROM employees e
        LEFT JOIN partners p ON e.partner_id = p.id
        WHERE e.id = NEW.employe_id;
        
        -- Notifier l'employé si il a un compte
        IF employee_user_id IS NOT NULL THEN
            PERFORM create_notification(
                employee_user_id,
                'Mise à jour de votre demande d''avance',
                'Votre demande d''avance de ' || NEW.montant_demande || 
                ' FCFA a été ' || 
                CASE NEW.statut
                    WHEN 'Approuvée' THEN 'approuvée'
                    WHEN 'Rejetée' THEN 'rejetée'
                    WHEN 'En attente' THEN 'mise en attente'
                    ELSE 'mise à jour'
                END || '.',
                CASE NEW.statut
                    WHEN 'Approuvée' THEN 'Succès'
                    WHEN 'Rejetée' THEN 'Erreur'
                    ELSE 'Information'
                END
            );
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_salary_advance_status_changed ON public.salary_advance_requests;
CREATE TRIGGER trigger_salary_advance_status_changed
    AFTER UPDATE ON public.salary_advance_requests
    FOR EACH ROW
    EXECUTE FUNCTION notify_salary_advance_status_changed();

-- =====================================================
-- TRIGGERS POUR LES TRANSACTIONS FINANCIÈRES
-- =====================================================

-- Notification lors de la création d'une transaction financière
CREATE OR REPLACE FUNCTION notify_financial_transaction_created()
RETURNS TRIGGER AS $$
DECLARE
    partner_name text;
    admin_users_cursor CURSOR FOR
        SELECT id FROM admin_users 
        WHERE role IN ('admin', 'manager') AND active = true;
BEGIN
    -- Récupérer le nom du partenaire
    SELECT nom INTO partner_name
    FROM partners
    WHERE id = NEW.partenaire_id;
    
    -- Notifier les administrateurs
    FOR admin_user IN admin_users_cursor LOOP
        PERFORM create_notification(
            admin_user.id,
            'Nouvelle transaction financière',
            'Une transaction de ' || NEW.montant || ' FCFA a été effectuée pour ' || 
            partner_name || ' (' || NEW.type || ').',
            'Information'
        );
    END LOOP;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_financial_transaction_created ON public.financial_transactions;
CREATE TRIGGER trigger_financial_transaction_created
    AFTER INSERT ON public.financial_transactions
    FOR EACH ROW
    EXECUTE FUNCTION notify_financial_transaction_created();

-- =====================================================
-- TRIGGERS POUR LES ALERTES
-- =====================================================

-- Notification lors de la création d'une alerte
CREATE OR REPLACE FUNCTION notify_alert_created()
RETURNS TRIGGER AS $$
DECLARE
    admin_users_cursor CURSOR FOR
        SELECT id FROM admin_users 
        WHERE role IN ('admin', 'manager') AND active = true;
BEGIN
    -- Notifier tous les administrateurs
    FOR admin_user IN admin_users_cursor LOOP
        PERFORM create_notification(
            admin_user.id,
            'Nouvelle alerte : ' || NEW.titre,
            NEW.description,
            'Alerte'
        );
    END LOOP;
    
    -- Si l'alerte est assignée à quelqu'un, le notifier spécifiquement
    IF NEW.assigne_a IS NOT NULL THEN
        PERFORM create_notification(
            NEW.assigne_a,
            'Alerte assignée : ' || NEW.titre,
            'Une alerte vous a été assignée : ' || NEW.description,
            'Alerte'
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_alert_created ON public.alerts;
CREATE TRIGGER trigger_alert_created
    AFTER INSERT ON public.alerts
    FOR EACH ROW
    EXECUTE FUNCTION notify_alert_created();

-- Notification lors de la résolution d'une alerte
CREATE OR REPLACE FUNCTION notify_alert_resolved()
RETURNS TRIGGER AS $$
BEGIN
    -- Vérifier si l'alerte a été résolue
    IF OLD.date_resolution IS NULL AND NEW.date_resolution IS NOT NULL THEN
        -- Notifier l'assigné
        IF NEW.assigne_a IS NOT NULL THEN
            PERFORM create_notification(
                NEW.assigne_a,
                'Alerte résolue : ' || NEW.titre,
                'L''alerte "' || NEW.titre || '" a été résolue.',
                'Succès'
            );
        END IF;
        
        -- Notifier les administrateurs
        PERFORM create_notification(
            (SELECT id FROM admin_users WHERE role = 'admin' AND active = true LIMIT 1),
            'Alerte résolue : ' || NEW.titre,
            'L''alerte "' || NEW.titre || '" a été résolue.',
            'Succès'
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_alert_resolved ON public.alerts;
CREATE TRIGGER trigger_alert_resolved
    AFTER UPDATE ON public.alerts
    FOR EACH ROW
    EXECUTE FUNCTION notify_alert_resolved();

-- =====================================================
-- TRIGGERS POUR LES AVIS
-- =====================================================

-- Notification lors de la création d'un avis
CREATE OR REPLACE FUNCTION notify_review_created()
RETURNS TRIGGER AS $$
DECLARE
    partner_name text;
    employee_name text;
    admin_users_cursor CURSOR FOR
        SELECT id FROM admin_users 
        WHERE role IN ('admin', 'manager') AND active = true;
BEGIN
    -- Récupérer les informations
    SELECT p.nom INTO partner_name
    FROM partners p
    WHERE p.id = NEW.partner_id;
    
    IF NEW.employee_id IS NOT NULL THEN
        SELECT nom || ' ' || prenom INTO employee_name
        FROM employees
        WHERE id = NEW.employee_id;
    END IF;
    
    -- Notifier les administrateurs
    FOR admin_user IN admin_users_cursor LOOP
        PERFORM create_notification(
            admin_user.id,
            'Nouvel avis reçu',
            'Un nouvel avis de ' || COALESCE(employee_name, 'un employé') || 
            ' pour ' || partner_name || ' (Note: ' || NEW.note || '/5).',
            'Information'
        );
    END LOOP;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_review_created ON public.avis;
CREATE TRIGGER trigger_review_created
    AFTER INSERT ON public.avis
    FOR EACH ROW
    EXECUTE FUNCTION notify_review_created();

-- =====================================================
-- TRIGGERS POUR LES DEMANDES DE PARTENARIAT
-- =====================================================

-- Notification lors de la création d'une demande de partenariat
CREATE OR REPLACE FUNCTION notify_partnership_request_created()
RETURNS TRIGGER AS $$
DECLARE
    admin_users_cursor CURSOR FOR
        SELECT id FROM admin_users 
        WHERE role IN ('admin', 'manager') AND active = true;
BEGIN
    -- Notifier tous les administrateurs
    FOR admin_user IN admin_users_cursor LOOP
        PERFORM create_notification(
            admin_user.id,
            'Nouvelle demande de partenariat',
            'Une nouvelle demande de partenariat a été soumise par ' || 
            NEW.company_name || ' (' || NEW.activity_domain || ').',
            'Alerte'
        );
    END LOOP;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_partnership_request_created ON public.partnership_requests;
CREATE TRIGGER trigger_partnership_request_created
    AFTER INSERT ON public.partnership_requests
    FOR EACH ROW
    EXECUTE FUNCTION notify_partnership_request_created();

-- Notification lors du changement de statut d'une demande de partenariat
CREATE OR REPLACE FUNCTION notify_partnership_request_status_changed()
RETURNS TRIGGER AS $$
BEGIN
    -- Vérifier si le statut a changé
    IF OLD.status != NEW.status THEN
        -- Notifier les administrateurs du changement
        PERFORM create_notification(
            (SELECT id FROM admin_users WHERE role = 'admin' AND active = true LIMIT 1),
            'Mise à jour demande de partenariat',
            'La demande de partenariat de ' || NEW.company_name || 
            ' a été ' || NEW.status || '.',
            CASE NEW.status
                WHEN 'approved' THEN 'Succès'
                WHEN 'rejected' THEN 'Erreur'
                ELSE 'Information'
            END
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_partnership_request_status_changed ON public.partnership_requests;
CREATE TRIGGER trigger_partnership_request_status_changed
    AFTER UPDATE ON public.partnership_requests
    FOR EACH ROW
    EXECUTE FUNCTION notify_partnership_request_status_changed();

-- =====================================================
-- TRIGGERS POUR LES ÉVÉNEMENTS DE SÉCURITÉ
-- =====================================================

-- Notification pour les événements de sécurité à haut risque
CREATE OR REPLACE FUNCTION notify_security_event()
RETURNS TRIGGER AS $$
DECLARE
    admin_users_cursor CURSOR FOR
        SELECT id FROM admin_users 
        WHERE role IN ('admin') AND active = true;
BEGIN
    -- Notifier seulement pour les événements à haut risque
    IF NEW.risk_score >= 7 THEN
        FOR admin_user IN admin_users_cursor LOOP
            PERFORM create_notification(
                admin_user.id,
                'Événement de sécurité détecté',
                'Un événement de sécurité de type "' || NEW.event_type || 
                '" a été détecté avec un score de risque de ' || NEW.risk_score || '/10.',
                'Alerte'
            );
        END LOOP;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_security_event ON public.security_events;
CREATE TRIGGER trigger_security_event
    AFTER INSERT ON public.security_events
    FOR EACH ROW
    EXECUTE FUNCTION notify_security_event();

-- =====================================================
-- FONCTIONS UTILITAIRES
-- =====================================================

-- Fonction pour marquer une notification comme lue
CREATE OR REPLACE FUNCTION mark_notification_as_read(p_notification_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE public.notifications 
    SET lu = true, date_lecture = now()
    WHERE id = p_notification_id;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour marquer toutes les notifications d'un utilisateur comme lues
CREATE OR REPLACE FUNCTION mark_all_notifications_as_read(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
    updated_count INTEGER;
BEGIN
    UPDATE public.notifications 
    SET lu = true, date_lecture = now()
    WHERE user_id = p_user_id AND lu = false;
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RETURN updated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour supprimer les anciennes notifications (plus de 30 jours)
CREATE OR REPLACE FUNCTION cleanup_old_notifications()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM public.notifications 
    WHERE date_creation < now() - INTERVAL '30 days';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- INDEX POUR LES PERFORMANCES
-- =====================================================

-- Index pour les requêtes de notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_lu ON public.notifications(lu);
CREATE INDEX IF NOT EXISTS idx_notifications_date_creation ON public.notifications(date_creation);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON public.notifications(type);

-- Index pour les triggers
CREATE INDEX IF NOT EXISTS idx_salary_advance_requests_statut ON public.salary_advance_requests(statut);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_montant ON public.financial_transactions(montant);
CREATE INDEX IF NOT EXISTS idx_alerts_assigne_a ON public.alerts(assigne_a);
CREATE INDEX IF NOT EXISTS idx_avis_note ON public.avis(note);
CREATE INDEX IF NOT EXISTS idx_security_events_risk_score ON public.security_events(risk_score);

-- =====================================================
-- 7. TRIGGERS POUR LES NOUVEAUX EMPLOYÉS
-- =====================================================

-- Notification lors de l'ajout d'un nouvel employé
CREATE OR REPLACE FUNCTION notify_new_employee()
RETURNS TRIGGER AS $$
DECLARE
    partner_name text;
    admin_users_cursor CURSOR FOR
        SELECT id FROM admin_users 
        WHERE role IN ('admin', 'manager') AND active = true;
BEGIN
    -- Récupérer le nom du partenaire
    SELECT nom INTO partner_name
    FROM partners
    WHERE id = NEW.partner_id;
    
    -- Notifier les administrateurs
    FOR admin_user IN admin_users_cursor LOOP
        PERFORM create_notification(
            admin_user.id,
            'Nouvel employé ajouté',
            'Un nouvel employé ' || NEW.nom || ' ' || NEW.prenom || 
            ' a été ajouté au partenaire ' || partner_name || '.',
            'Information'
        );
    END LOOP;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_new_employee
    AFTER INSERT ON employees
    FOR EACH ROW
    EXECUTE FUNCTION notify_new_employee();

-- =====================================================
-- 8. TRIGGERS POUR LES NOUVEAUX PARTENAIRES
-- =====================================================

-- Notification lors de l'ajout d'un nouveau partenaire
CREATE OR REPLACE FUNCTION notify_new_partner()
RETURNS TRIGGER AS $$
DECLARE
    admin_users_cursor CURSOR FOR
        SELECT id FROM admin_users 
        WHERE role IN ('admin', 'manager') AND active = true;
BEGIN
    -- Notifier les administrateurs
    FOR admin_user IN admin_users_cursor LOOP
        PERFORM create_notification(
            admin_user.id,
            'Nouveau partenaire ajouté',
            'Un nouveau partenaire ' || NEW.nom || ' (' || NEW.type || 
            ') a été ajouté au système.',
            'Succès'
        );
    END LOOP;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_new_partner
    AFTER INSERT ON partners
    FOR EACH ROW
    EXECUTE FUNCTION notify_new_partner();

-- =====================================================
-- 9. TRIGGERS POUR LES TRANSACTIONS
-- =====================================================

-- Notification lors de la création d'une transaction
CREATE OR REPLACE FUNCTION notify_transaction_created()
RETURNS TRIGGER AS $$
DECLARE
    employee_name text;
    partner_name text;
    admin_users_cursor CURSOR FOR
        SELECT id FROM admin_users 
        WHERE role IN ('admin', 'manager') AND active = true;
BEGIN
    -- Récupérer les informations
    SELECT 
        e.nom || ' ' || e.prenom,
        p.nom
    INTO employee_name, partner_name
    FROM employees e
    LEFT JOIN partners p ON e.partner_id = p.id
    WHERE e.id = NEW.employe_id;
    
    -- Notifier les administrateurs
    FOR admin_user IN admin_users_cursor LOOP
        PERFORM create_notification(
            admin_user.id,
            'Nouvelle transaction effectuée',
            'Une transaction de ' || NEW.montant || ' FCFA a été effectuée pour ' || 
            employee_name || ' (' || partner_name || ').',
            'Information'
        );
    END LOOP;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_transaction_created
    AFTER INSERT ON transactions
    FOR EACH ROW
    EXECUTE FUNCTION notify_transaction_created();

-- =====================================================
-- 10. TRIGGERS POUR LES NOUVEAUX SERVICES
-- =====================================================

-- Notification lors de l'ajout d'un nouveau service
CREATE OR REPLACE FUNCTION notify_new_service()
RETURNS TRIGGER AS $$
DECLARE
    admin_users_cursor CURSOR FOR
        SELECT id FROM admin_users 
        WHERE role IN ('admin', 'manager') AND active = true;
BEGIN
    -- Notifier les administrateurs
    FOR admin_user IN admin_users_cursor LOOP
        PERFORM create_notification(
            admin_user.id,
            'Nouveau service ajouté',
            'Un nouveau service "' || NEW.nom || '" (' || NEW.categorie || 
            ') a été ajouté au catalogue.',
            'Information'
        );
    END LOOP;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_new_service
    AFTER INSERT ON services
    FOR EACH ROW
    EXECUTE FUNCTION notify_new_service();

-- =====================================================
-- 11. TRIGGERS POUR LES TENTATIVES DE CONNEXION ÉCHOUÉES
-- =====================================================

-- Notification pour les tentatives de connexion échouées multiples
CREATE OR REPLACE FUNCTION notify_failed_login_attempts()
RETURNS TRIGGER AS $$
DECLARE
    admin_users_cursor CURSOR FOR
        SELECT id FROM admin_users 
        WHERE role IN ('admin') AND active = true;
BEGIN
    -- Notifier si plus de 3 tentatives échouées
    IF NEW.attempt_count >= 3 THEN
        FOR admin_user IN admin_users_cursor LOOP
            PERFORM create_notification(
                admin_user.id,
                'Tentatives de connexion échouées',
                NEW.attempt_count || ' tentatives de connexion échouées détectées pour l''utilisateur.',
                'Alerte'
            );
        END LOOP;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_failed_login_attempts
    AFTER INSERT OR UPDATE ON password_attempts
    FOR EACH ROW
    EXECUTE FUNCTION notify_failed_login_attempts();

-- =====================================================
-- FONCTIONS UTILITAIRES SUPPLÉMENTAIRES
-- =====================================================

-- Fonction pour nettoyer les anciennes notifications
CREATE OR REPLACE FUNCTION cleanup_old_notifications()
RETURNS integer AS $$
DECLARE
    deleted_count integer;
BEGIN
    DELETE FROM notifications 
    WHERE date_creation < NOW() - INTERVAL '90 days'
    AND lu = true;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour marquer une notification comme lue
CREATE OR REPLACE FUNCTION mark_notification_as_read(p_notification_id uuid)
RETURNS boolean AS $$
BEGIN
    UPDATE notifications 
    SET lu = true, date_lecture = NOW()
    WHERE id = p_notification_id;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour marquer toutes les notifications d'un utilisateur comme lues
CREATE OR REPLACE FUNCTION mark_all_notifications_as_read(p_user_id uuid)
RETURNS integer AS $$
DECLARE
    updated_count integer;
BEGIN
    UPDATE notifications 
    SET lu = true, date_lecture = NOW()
    WHERE user_id = p_user_id AND lu = false;
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RETURN updated_count;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour obtenir les statistiques des notifications
CREATE OR REPLACE FUNCTION get_notification_stats(p_user_id uuid)
RETURNS json AS $$
DECLARE
    stats json;
BEGIN
    SELECT json_build_object(
        'total', COUNT(*),
        'non_lues', COUNT(*) FILTER (WHERE lu = false),
        'par_type', json_object_agg(type, count) FILTER (WHERE type IS NOT NULL),
        'recentes', COUNT(*) FILTER (WHERE date_creation > NOW() - INTERVAL '24 hours')
    ) INTO stats
    FROM notifications
    WHERE user_id = p_user_id;
    
    RETURN stats;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- COMMENTAIRES ET DOCUMENTATION
-- =====================================================

COMMENT ON FUNCTION create_notification IS 'Fonction utilitaire pour créer une notification';
COMMENT ON FUNCTION notify_salary_advance_created IS 'Notifie les administrateurs lors de la création d''une demande d''avance de salaire';
COMMENT ON FUNCTION notify_partnership_request_created IS 'Notifie les administrateurs lors de la création d''une demande de partenariat';
COMMENT ON FUNCTION notify_financial_transaction_created IS 'Notifie les administrateurs lors de la création d''une transaction financière';
COMMENT ON FUNCTION notify_alert_created IS 'Notifie les administrateurs lors de la création d''une alerte';
COMMENT ON FUNCTION notify_new_employee IS 'Notifie les administrateurs lors de l''ajout d''un nouvel employé';
COMMENT ON FUNCTION notify_new_partner IS 'Notifie les administrateurs lors de l''ajout d''un nouveau partenaire';
COMMENT ON FUNCTION cleanup_old_notifications IS 'Nettoie les anciennes notifications (plus de 90 jours)';
COMMENT ON FUNCTION mark_notification_as_read IS 'Marque une notification comme lue';
COMMENT ON FUNCTION mark_all_notifications_as_read IS 'Marque toutes les notifications d''un utilisateur comme lues';
COMMENT ON FUNCTION get_notification_stats IS 'Retourne les statistiques des notifications d''un utilisateur'; 
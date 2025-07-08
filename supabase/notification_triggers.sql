-- =====================================================
-- SYSTÈME DE NOTIFICATIONS AUTOMATIQUES
-- =====================================================

-- Fonction pour créer une notification (version améliorée avec employee_id et partner_id)
CREATE OR REPLACE FUNCTION create_notification(
    p_user_id UUID,
    p_titre VARCHAR,
    p_message TEXT,
    p_type notification_type DEFAULT 'Information',
    p_employee_id UUID DEFAULT NULL,
    p_partner_id UUID DEFAULT NULL
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
        date_creation,
        employee_id,
        partner_id
    ) VALUES (
        p_user_id,
        p_titre,
        p_message,
        p_type,
        false,
        now(),
        p_employee_id,
        p_partner_id
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
        WHERE role IN ('admin', 'responsable') AND active = true;
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
            'Alerte',
            NEW.employe_id,  -- employee_id
            NEW.partenaire_id  -- partner_id
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
                END,
                NEW.employe_id,  -- employee_id
                NEW.partenaire_id  -- partner_id
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
        WHERE role IN ('admin', 'responsable') AND active = true;
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
            'Information',
            NULL,  -- employee_id (pas d'employé spécifique pour les transactions financières)
            NEW.partenaire_id  -- partner_id
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
        WHERE role IN ('admin', 'responsable') AND active = true;
BEGIN
    -- Notifier tous les administrateurs
    FOR admin_user IN admin_users_cursor LOOP
        PERFORM create_notification(
            admin_user.id,
            'Nouvelle alerte : ' || NEW.titre,
            NEW.description,
            'Alerte',
            NULL,  -- employee_id
            NULL   -- partner_id
        );
    END LOOP;
    
    -- Si l'alerte est assignée à quelqu'un, le notifier spécifiquement
    IF NEW.assigne_a IS NOT NULL THEN
        PERFORM create_notification(
            NEW.assigne_a,
            'Alerte assignée : ' || NEW.titre,
            'Une alerte vous a été assignée : ' || NEW.description,
            'Alerte',
            NULL,  -- employee_id
            NULL   -- partner_id
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
                'Succès',
                NULL,  -- employee_id
                NULL   -- partner_id
            );
        END IF;
        
        -- Notifier les administrateurs
        PERFORM create_notification(
            (SELECT id FROM admin_users WHERE role = 'admin' AND active = true LIMIT 1),
            'Alerte résolue : ' || NEW.titre,
            'L''alerte "' || NEW.titre || '" a été résolue.',
            'Succès',
            NULL,  -- employee_id
            NULL   -- partner_id
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
        WHERE role IN ('admin', 'responsable') AND active = true;
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
            'Information',
            NEW.employee_id,  -- employee_id
            NEW.partner_id    -- partner_id
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
        WHERE role IN ('admin', 'responsable') AND active = true;
BEGIN
    -- Notifier tous les administrateurs
    FOR admin_user IN admin_users_cursor LOOP
        PERFORM create_notification(
            admin_user.id,
            'Nouvelle demande de partenariat',
            'Une nouvelle demande de partenariat a été soumise par ' || 
            NEW.company_name || ' (' || NEW.activity_domain || ').',
            'Alerte',
            NULL,  -- employee_id (pas d'employé pour les demandes de partenariat)
            NULL   -- partner_id (pas encore de partenaire)
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
            END,
            NULL,  -- employee_id
            NULL   -- partner_id
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
                'Alerte',
                NULL,  -- employee_id
                NULL   -- partner_id
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
CREATE INDEX IF NOT EXISTS idx_notifications_employee_id ON public.notifications(employee_id);
CREATE INDEX IF NOT EXISTS idx_notifications_partner_id ON public.notifications(partner_id);

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
        WHERE role IN ('admin', 'responsable') AND active = true;
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
            'Information',
            NEW.id,      -- employee_id (l'employé nouvellement créé)
            NEW.partner_id  -- partner_id
        );
    END LOOP;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_new_employee ON employees;

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
        WHERE role IN ('admin', 'responsable') AND active = true;
BEGIN
    -- Notifier les administrateurs
    FOR admin_user IN admin_users_cursor LOOP
        PERFORM create_notification(
            admin_user.id,
            'Nouveau partenaire ajouté',
            'Un nouveau partenaire ' || NEW.nom || ' (' || NEW.type || 
            ') a été ajouté au système.',
            'Succès',
            NULL,     -- employee_id (pas d'employé pour les nouveaux partenaires)
            NEW.id    -- partner_id (le partenaire nouvellement créé)
        );
    END LOOP;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_new_partner ON partners;

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
        WHERE role IN ('admin', 'responsable') AND active = true;
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
            'Information',
            NEW.employe_id,  -- employee_id
            (SELECT partner_id FROM employees WHERE id = NEW.employe_id)  -- partner_id via employé
        );
    END LOOP;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_transaction_created ON transactions;

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
        WHERE role IN ('admin', 'responsable') AND active = true;
BEGIN
    -- Notifier les administrateurs
    FOR admin_user IN admin_users_cursor LOOP
        PERFORM create_notification(
            admin_user.id,
            'Nouveau service ajouté',
            'Un nouveau service "' || NEW.nom || '" (' || NEW.categorie || 
            ') a été ajouté au catalogue.',
            'Information',
            NULL,  -- employee_id (pas d'employé pour les nouveaux services)
            NULL   -- partner_id (pas de partenaire pour les services)
        );
    END LOOP;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_new_service ON services;

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
                'Alerte',
                NULL,  -- employee_id
                NULL   -- partner_id
            );
        END LOOP;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_failed_login_attempts ON password_attempts;

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
-- NOUVELLES FONCTIONS POUR GESTION AVANCÉE DES STATUTS
-- =====================================================

-- Fonction pour notifier les changements de statut avancés des avances de salaire
CREATE OR REPLACE FUNCTION notify_advanced_salary_advance_status()
RETURNS TRIGGER AS $$
DECLARE
    employee_name text;
    partner_name text;
    employee_user_id uuid;
    status_message text;
    notification_type notification_type;
    admin_users_cursor CURSOR FOR
        SELECT id FROM admin_users 
        WHERE role IN ('admin', 'responsable') AND active = true;
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
        
        -- Définir le message selon le nouveau statut
        status_message := CASE NEW.statut
            WHEN 'Validé' THEN 'a été validée et sera traitée prochainement'
            WHEN 'En cours' THEN 'est en cours de traitement'
            WHEN 'Terminé' THEN 'a été complètement traitée'
            WHEN 'Annulé' THEN 'a été annulée'
            WHEN 'En attente' THEN 'est en attente de traitement'
            WHEN 'Rejeté' THEN 'a été rejetée'
            ELSE 'a été mise à jour'
        END;
        
        -- Définir le type de notification
        notification_type := CASE NEW.statut
            WHEN 'Validé' THEN 'Succès'
            WHEN 'Terminé' THEN 'Succès'
            WHEN 'Rejeté' THEN 'Erreur'
            WHEN 'Annulé' THEN 'Erreur'
            WHEN 'En cours' THEN 'Information'
            ELSE 'Information'
        END;
        
        -- Notifier l'employé si il a un compte
        IF employee_user_id IS NOT NULL THEN
            PERFORM create_notification(
                employee_user_id,
                'Mise à jour de votre demande d''avance',
                'Votre demande d''avance de ' || NEW.montant_demande || 
                ' FCFA ' || status_message || '.',
                notification_type
            );
        END IF;
        
        -- Notifier les administrateurs pour les statuts importants
        IF NEW.statut IN ('Validé', 'Rejeté', 'Terminé', 'Annulé') THEN
            FOR admin_user IN admin_users_cursor LOOP
                PERFORM create_notification(
                    admin_user.id,
                    'Demande d''avance ' || NEW.statut || ' - ' || employee_name,
                    'La demande d''avance de ' || employee_name || ' du partenaire ' || 
                    partner_name || ' (' || NEW.montant_demande || ' FCFA) ' || 
                    status_message || '.',
                    notification_type
                );
            END LOOP;
        END IF;
        
        -- Notification spéciale pour les montants élevés
        IF NEW.montant_demande > 500000 THEN -- Plus de 500k FCFA
            FOR admin_user IN admin_users_cursor LOOP
                PERFORM create_notification(
                    admin_user.id,
                    '⚠️ Demande d''avance importante ' || NEW.statut,
                    'Demande d''avance de ' || NEW.montant_demande || ' FCFA par ' || 
                    employee_name || ' (' || partner_name || ') ' || status_message || '.',
                    'Alerte'
                );
            END LOOP;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour les changements de statut avancés
DROP TRIGGER IF EXISTS trigger_advanced_salary_advance_status ON public.salary_advance_requests;
CREATE TRIGGER trigger_advanced_salary_advance_status
    AFTER UPDATE ON public.salary_advance_requests
    FOR EACH ROW
    EXECUTE FUNCTION notify_advanced_salary_advance_status();

-- =====================================================
-- FONCTION POUR NOTIFIER LES TRANSACTIONS LIÉES AUX AVANCES
-- =====================================================

-- Notification lors de la création d'une transaction liée à une avance
CREATE OR REPLACE FUNCTION notify_advance_transaction_created()
RETURNS TRIGGER AS $$
DECLARE
    employee_name text;
    partner_name text;
    advance_amount numeric;
    admin_users_cursor CURSOR FOR
        SELECT id FROM admin_users 
        WHERE role IN ('admin', 'responsable') AND active = true;
BEGIN
    -- Récupérer les informations de l'avance si elle existe
    IF NEW.demande_avance_id IS NOT NULL THEN
        SELECT 
            e.nom || ' ' || e.prenom,
            p.nom,
            sar.montant_demande
        INTO employee_name, partner_name, advance_amount
        FROM salary_advance_requests sar
        LEFT JOIN employees e ON sar.employe_id = e.id
        LEFT JOIN partners p ON sar.partenaire_id = p.id
        WHERE sar.id = NEW.demande_avance_id;
        
        -- Notifier les administrateurs
        FOR admin_user IN admin_users_cursor LOOP
            PERFORM create_notification(
                admin_user.id,
                'Transaction d''avance effectuée',
                'Transaction de ' || NEW.montant || ' FCFA effectuée pour l''avance de ' || 
                employee_name || ' (' || partner_name || '). Méthode: ' || NEW.methode_paiement || '.',
                'Succès'
            );
        END LOOP;
    ELSE
        -- Transaction générale
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
                'Transaction de ' || NEW.montant || ' FCFA effectuée pour ' || 
                employee_name || ' (' || partner_name || '). Méthode: ' || NEW.methode_paiement || '.',
                'Information'
            );
        END LOOP;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour les transactions liées aux avances
DROP TRIGGER IF EXISTS trigger_advance_transaction_created ON public.transactions;
CREATE TRIGGER trigger_advance_transaction_created
    AFTER INSERT ON public.transactions
    FOR EACH ROW
    EXECUTE FUNCTION notify_advance_transaction_created();

-- =====================================================
-- FONCTION POUR NOTIFIER LES ÉCHECS DE TRANSACTIONS
-- =====================================================

-- Notification lors d'un échec de transaction
CREATE OR REPLACE FUNCTION notify_transaction_failed()
RETURNS TRIGGER AS $$
DECLARE
    employee_name text;
    partner_name text;
    admin_users_cursor CURSOR FOR
        SELECT id FROM admin_users 
        WHERE role IN ('admin', 'responsable') AND active = true;
BEGIN
    -- Vérifier si le statut a changé vers échec
    IF OLD.statut != 'ECHEC' AND NEW.statut = 'ECHEC' THEN
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
                '❌ Échec de transaction',
                'La transaction de ' || NEW.montant || ' FCFA pour ' || 
                employee_name || ' (' || partner_name || ') a échoué. Numéro: ' || NEW.numero_transaction || '.',
                'Erreur'
            );
        END LOOP;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour les échecs de transaction
DROP TRIGGER IF EXISTS trigger_transaction_failed ON public.transactions;
CREATE TRIGGER trigger_transaction_failed
    AFTER UPDATE ON public.transactions
    FOR EACH ROW
    EXECUTE FUNCTION notify_transaction_failed();

-- =====================================================
-- FONCTION POUR NOTIFIER LES VALIDATIONS EN LOTS
-- =====================================================

-- Fonction pour notifier les validations en lots d'avances
CREATE OR REPLACE FUNCTION notify_batch_advance_approval(
    p_approved_count INTEGER,
    p_rejected_count INTEGER,
    p_processed_by UUID
)
RETURNS VOID AS $$
DECLARE
    processor_name text;
    admin_users_cursor CURSOR FOR
        SELECT id FROM admin_users 
        WHERE role IN ('admin', 'responsable') AND active = true;
BEGIN
    -- Récupérer le nom du processeur
    SELECT nom || ' ' || prenom INTO processor_name
    FROM admin_users
    WHERE id = p_processed_by;
    
    -- Notifier les administrateurs
    FOR admin_user IN admin_users_cursor LOOP
        PERFORM create_notification(
            admin_user.id,
            'Traitement en lots des avances terminé',
            processor_name || ' a traité ' || p_approved_count || ' avances approuvées et ' || 
            p_rejected_count || ' avances rejetées.',
            'Information'
        );
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FONCTION POUR NOTIFIER LES DÉPASSEMENTS DE LIMITES
-- =====================================================

-- Fonction pour vérifier et notifier les dépassements de limites
CREATE OR REPLACE FUNCTION check_and_notify_advance_limits()
RETURNS TRIGGER AS $$
DECLARE
    total_advances_this_month numeric;
    salary_amount numeric;
    admin_users_cursor CURSOR FOR
        SELECT id FROM admin_users 
        WHERE role IN ('admin', 'responsable') AND active = true;
BEGIN
    -- Calculer le total des avances du mois pour cet employé
    SELECT COALESCE(SUM(montant_demande), 0)
    INTO total_advances_this_month
    FROM salary_advance_requests
    WHERE employe_id = NEW.employe_id
    AND date_creation >= date_trunc('month', CURRENT_DATE)
    AND statut IN ('Validé', 'En cours', 'Terminé');
    
    -- Récupérer le salaire de l'employé
    SELECT salaire_net INTO salary_amount
    FROM employees
    WHERE id = NEW.employe_id;
    
    -- Vérifier si l'avance dépasse 50% du salaire
    IF (total_advances_this_month + NEW.montant_demande) > (salary_amount * 0.5) THEN
        -- Notifier les administrateurs
        FOR admin_user IN admin_users_cursor LOOP
            PERFORM create_notification(
                admin_user.id,
                '⚠️ Dépassement de limite d''avance',
                'L''employé ' || NEW.employe_id || ' a demandé une avance qui dépasse 50% de son salaire. ' ||
                'Total du mois: ' || (total_advances_this_month + NEW.montant_demande) || ' FCFA sur ' || salary_amount || ' FCFA.',
                'Alerte'
            );
        END LOOP;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour vérifier les limites d'avance
DROP TRIGGER IF EXISTS trigger_check_advance_limits ON public.salary_advance_requests;
CREATE TRIGGER trigger_check_advance_limits
    BEFORE INSERT ON public.salary_advance_requests
    FOR EACH ROW
    EXECUTE FUNCTION check_and_notify_advance_limits();

-- =====================================================
-- FONCTION POUR NOTIFIER LES RAPPELS AUTOMATIQUES
-- =====================================================

-- Fonction pour créer des rappels automatiques pour les avances en attente
CREATE OR REPLACE FUNCTION create_advance_reminders()
RETURNS VOID AS $$
DECLARE
    pending_advance RECORD;
    admin_users_cursor CURSOR FOR
        SELECT id FROM admin_users 
        WHERE role IN ('admin', 'responsable') AND active = true;
BEGIN
    -- Trouver les avances en attente depuis plus de 24h
    FOR pending_advance IN 
        SELECT 
            sar.id,
            sar.montant_demande,
            e.nom || ' ' || e.prenom as employee_name,
            p.nom as partner_name,
            EXTRACT(EPOCH FROM (NOW() - sar.date_creation))/3600 as hours_old
        FROM salary_advance_requests sar
        LEFT JOIN employees e ON sar.employe_id = e.id
        LEFT JOIN partners p ON sar.partenaire_id = p.id
        WHERE sar.statut = 'En attente'
        AND sar.date_creation < NOW() - INTERVAL '24 hours'
        AND sar.date_creation > NOW() - INTERVAL '48 hours' -- Éviter les doublons
    LOOP
        -- Notifier les administrateurs
        FOR admin_user IN admin_users_cursor LOOP
            PERFORM create_notification(
                admin_user.id,
                '⏰ Rappel: Avance en attente',
                'L''avance de ' || pending_advance.montant_demande || ' FCFA pour ' || 
                pending_advance.employee_name || ' (' || pending_advance.partner_name || 
                ') est en attente depuis ' || ROUND(pending_advance.hours_old) || ' heures.',
                'Information'
            );
        END LOOP;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FONCTION POUR NOTIFIER LES STATISTIQUES MENSUELLES
-- =====================================================

-- Fonction pour notifier les statistiques mensuelles des avances
CREATE OR REPLACE FUNCTION notify_monthly_advance_stats()
RETURNS VOID AS $$
DECLARE
    total_advances INTEGER;
    total_amount numeric;
    approved_count INTEGER;
    rejected_count INTEGER;
    admin_users_cursor CURSOR FOR
        SELECT id FROM admin_users 
        WHERE role IN ('admin', 'responsable') AND active = true;
BEGIN
    -- Calculer les statistiques du mois
    SELECT 
        COUNT(*),
        COALESCE(SUM(montant_demande), 0),
        COUNT(*) FILTER (WHERE statut = 'Validé'),
        COUNT(*) FILTER (WHERE statut = 'Rejeté')
    INTO total_advances, total_amount, approved_count, rejected_count
    FROM salary_advance_requests
    WHERE date_creation >= date_trunc('month', CURRENT_DATE);
    
    -- Notifier les administrateurs
    FOR admin_user IN admin_users_cursor LOOP
        PERFORM create_notification(
            admin_user.id,
            '📊 Statistiques mensuelles des avances',
            'Ce mois: ' || total_advances || ' demandes d''avance pour un total de ' || 
            total_amount || ' FCFA. Approuvées: ' || approved_count || ', Rejetées: ' || rejected_count || '.',
            'Information'
        );
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- INDEX SUPPLÉMENTAIRES POUR LES NOUVELLES FONCTIONS
-- =====================================================

-- Index pour les nouvelles fonctionnalités
CREATE INDEX IF NOT EXISTS idx_salary_advance_requests_date_creation ON public.salary_advance_requests(date_creation);
CREATE INDEX IF NOT EXISTS idx_salary_advance_requests_montant_demande ON public.salary_advance_requests(montant_demande);
CREATE INDEX IF NOT EXISTS idx_transactions_demande_avance_id ON public.transactions(demande_avance_id);
CREATE INDEX IF NOT EXISTS idx_transactions_statut ON public.transactions(statut);
CREATE INDEX IF NOT EXISTS idx_employees_salaire_net ON public.employees(salaire_net);

-- =====================================================
-- COMMENTAIRES ET DOCUMENTATION SUPPLÉMENTAIRES
-- =====================================================

COMMENT ON FUNCTION notify_advanced_salary_advance_status IS 'Notifie les changements de statut avancés des avances de salaire avec messages personnalisés';
COMMENT ON FUNCTION notify_advance_transaction_created IS 'Notifie la création de transactions liées aux avances de salaire';
COMMENT ON FUNCTION notify_transaction_failed IS 'Notifie les échecs de transactions';
COMMENT ON FUNCTION notify_batch_advance_approval IS 'Notifie les validations en lots d''avances';
COMMENT ON FUNCTION check_and_notify_advance_limits IS 'Vérifie et notifie les dépassements de limites d''avance';
COMMENT ON FUNCTION create_advance_reminders IS 'Crée des rappels automatiques pour les avances en attente';
COMMENT ON FUNCTION notify_monthly_advance_stats IS 'Notifie les statistiques mensuelles des avances';

-- =====================================================
-- COMMENTAIRES ET DOCUMENTATION
-- ===================================================== 
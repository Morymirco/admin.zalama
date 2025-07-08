-- =====================================================
-- ÉTAPE 2 : FONCTIONS ET TRIGGERS DE NOTIFICATION COMPLETS
-- =====================================================

-- Mettre à jour la fonction create_notification avec les nouveaux paramètres
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
-- FONCTIONS DE NOTIFICATION POUR LES DEMANDES D'AVANCE
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

-- =====================================================
-- FONCTIONS DE NOTIFICATION POUR LES TRANSACTIONS
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

-- =====================================================
-- FONCTIONS DE NOTIFICATION POUR LES ALERTES
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

-- Notification lors du changement de statut d'une alerte
CREATE OR REPLACE FUNCTION notify_alert_status_changed()
RETURNS TRIGGER AS $$
BEGIN
    -- Si l'alerte est résolue
    IF NEW.statut = 'Résolue' AND OLD.statut != 'Résolue' THEN
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

-- =====================================================
-- FONCTIONS DE NOTIFICATION POUR LES AVIS
-- =====================================================

-- Notification lors de la création d'un avis
CREATE OR REPLACE FUNCTION notify_avis_created()
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

-- =====================================================
-- FONCTIONS DE NOTIFICATION POUR LES DEMANDES DE PARTENARIAT
-- =====================================================

-- Notification lors de la création d'une demande de partenariat
CREATE OR REPLACE FUNCTION notify_partnership_request()
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

-- Notification lors du changement de statut d'une demande de partenariat
CREATE OR REPLACE FUNCTION notify_partnership_status_changed()
RETURNS TRIGGER AS $$
BEGIN
    -- Si le statut a changé
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

-- =====================================================
-- FONCTIONS DE NOTIFICATION POUR LES ÉVÉNEMENTS DE SÉCURITÉ
-- =====================================================

-- Notification lors d'un événement de sécurité
CREATE OR REPLACE FUNCTION notify_security_event()
RETURNS TRIGGER AS $$
DECLARE
    admin_users_cursor CURSOR FOR
        SELECT id FROM admin_users 
        WHERE role IN ('admin', 'responsable') AND active = true;
BEGIN
    -- Si le score de risque est élevé (>= 7), notifier les administrateurs
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

-- =====================================================
-- FONCTIONS DE NOTIFICATION POUR LES NOUVEAUX EMPLOYÉS
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

-- =====================================================
-- FONCTIONS DE NOTIFICATION POUR LES NOUVEAUX PARTENAIRES
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

-- =====================================================
-- FONCTIONS DE NOTIFICATION POUR LES NOUVEAUX SERVICES
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

-- =====================================================
-- FONCTIONS DE NOTIFICATION POUR LES TENTATIVES DE CONNEXION
-- =====================================================

-- Notification lors de tentatives de connexion échouées
CREATE OR REPLACE FUNCTION notify_failed_login_attempts()
RETURNS TRIGGER AS $$
DECLARE
    admin_users_cursor CURSOR FOR
        SELECT id FROM admin_users 
        WHERE role IN ('admin', 'responsable') AND active = true;
BEGIN
    -- Si le nombre de tentatives est élevé (>= 5), notifier les administrateurs
    IF NEW.attempt_count >= 5 THEN
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

-- =====================================================
-- SUPPRESSION ET RECRÉATION DES TRIGGERS
-- =====================================================

-- Supprimer les anciens triggers
DROP TRIGGER IF EXISTS trigger_salary_advance_request ON salary_advance_requests;
DROP TRIGGER IF EXISTS trigger_salary_advance_status_changed ON salary_advance_requests;
DROP TRIGGER IF EXISTS trigger_transaction_created ON transactions;
DROP TRIGGER IF EXISTS trigger_alert_created ON alerts;
DROP TRIGGER IF EXISTS trigger_alert_status_changed ON alerts;
DROP TRIGGER IF EXISTS trigger_avis_created ON avis;
DROP TRIGGER IF EXISTS trigger_partnership_request ON partnership_requests;
DROP TRIGGER IF EXISTS trigger_partnership_status_changed ON partnership_requests;
DROP TRIGGER IF EXISTS trigger_security_event ON security_events;
DROP TRIGGER IF EXISTS trigger_new_employee ON employees;
DROP TRIGGER IF EXISTS trigger_new_partner ON partners;
DROP TRIGGER IF EXISTS trigger_new_service ON services;
DROP TRIGGER IF EXISTS trigger_failed_login_attempts ON password_attempts;

-- =====================================================
-- RECRÉATION DES TRIGGERS
-- =====================================================

-- Trigger pour nouvelle demande d'avance de salaire
CREATE TRIGGER trigger_salary_advance_request
    AFTER INSERT ON salary_advance_requests
    FOR EACH ROW
    EXECUTE FUNCTION notify_salary_advance_created();

-- Trigger pour changement de statut d'avance de salaire
CREATE TRIGGER trigger_salary_advance_status_changed
    AFTER UPDATE ON salary_advance_requests
    FOR EACH ROW
    WHEN (OLD.statut IS DISTINCT FROM NEW.statut)
    EXECUTE FUNCTION notify_salary_advance_status_changed();

-- Trigger pour nouvelle transaction
CREATE TRIGGER trigger_transaction_created
    AFTER INSERT ON transactions
    FOR EACH ROW
    EXECUTE FUNCTION notify_transaction_created();

-- Trigger pour nouvelle alerte
CREATE TRIGGER trigger_alert_created
    AFTER INSERT ON alerts
    FOR EACH ROW
    EXECUTE FUNCTION notify_alert_created();

-- Trigger pour changement de statut d'alerte
CREATE TRIGGER trigger_alert_status_changed
    AFTER UPDATE ON alerts
    FOR EACH ROW
    WHEN (OLD.statut IS DISTINCT FROM NEW.statut)
    EXECUTE FUNCTION notify_alert_status_changed();

-- Trigger pour nouvel avis
CREATE TRIGGER trigger_avis_created
    AFTER INSERT ON avis
    FOR EACH ROW
    EXECUTE FUNCTION notify_avis_created();

-- Trigger pour nouvelle demande de partenariat
CREATE TRIGGER trigger_partnership_request
    AFTER INSERT ON partnership_requests
    FOR EACH ROW
    EXECUTE FUNCTION notify_partnership_request();

-- Trigger pour changement de statut de demande de partenariat
CREATE TRIGGER trigger_partnership_status_changed
    AFTER UPDATE ON partnership_requests
    FOR EACH ROW
    WHEN (OLD.status IS DISTINCT FROM NEW.status)
    EXECUTE FUNCTION notify_partnership_status_changed();

-- Trigger pour événement de sécurité
CREATE TRIGGER trigger_security_event
    AFTER INSERT ON security_events
    FOR EACH ROW
    EXECUTE FUNCTION notify_security_event();

-- Trigger pour nouvel employé
CREATE TRIGGER trigger_new_employee
    AFTER INSERT ON employees
    FOR EACH ROW
    EXECUTE FUNCTION notify_new_employee();

-- Trigger pour nouveau partenaire
CREATE TRIGGER trigger_new_partner
    AFTER INSERT ON partners
    FOR EACH ROW
    EXECUTE FUNCTION notify_new_partner();

-- Trigger pour nouveau service
CREATE TRIGGER trigger_new_service
    AFTER INSERT ON services
    FOR EACH ROW
    EXECUTE FUNCTION notify_new_service();

-- Trigger pour tentatives de connexion échouées
CREATE TRIGGER trigger_failed_login_attempts
    AFTER INSERT OR UPDATE ON password_attempts
    FOR EACH ROW
    EXECUTE FUNCTION notify_failed_login_attempts();

-- =====================================================
-- VÉRIFICATION FINALE
-- =====================================================

-- Vérifier que tous les triggers ont été créés
SELECT 
    'FONCTIONS ET TRIGGERS CRÉÉS' as status,
    trigger_name,
    event_manipulation,
    event_object_table
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
AND trigger_name LIKE 'trigger_%'
ORDER BY trigger_name; 
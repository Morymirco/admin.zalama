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

-- Trigger pour nouvelle demande d'avance de salaire
CREATE OR REPLACE FUNCTION notify_new_salary_advance()
RETURNS TRIGGER AS $$
DECLARE
    admin_user_id UUID;
    employee_name VARCHAR;
    partner_name VARCHAR;
BEGIN
    -- Récupérer les informations de l'employé et du partenaire
    SELECT 
        e.nom || ' ' || e.prenom,
        p.nom
    INTO employee_name, partner_name
    FROM public.employees e
    LEFT JOIN public.partners p ON e.partner_id = p.id
    WHERE e.id = NEW.employe_id;
    
    -- Notifier tous les admins
    FOR admin_user_id IN 
        SELECT id FROM public.admin_users WHERE active = true
    LOOP
        PERFORM create_notification(
            admin_user_id,
            'Nouvelle demande d''avance de salaire',
            'L''employé ' || employee_name || ' du partenaire ' || partner_name || ' a soumis une demande d''avance de ' || NEW.montant_demande || ' GNF.',
            'Information'
        );
    END LOOP;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_new_salary_advance ON public.salary_advance_requests;
CREATE TRIGGER trigger_new_salary_advance
    AFTER INSERT ON public.salary_advance_requests
    FOR EACH ROW
    EXECUTE FUNCTION notify_new_salary_advance();

-- Trigger pour changement de statut d'une demande
CREATE OR REPLACE FUNCTION notify_salary_advance_status_change()
RETURNS TRIGGER AS $$
DECLARE
    employee_name VARCHAR;
    status_message VARCHAR;
BEGIN
    -- Ne déclencher que si le statut a changé
    IF OLD.statut != NEW.statut THEN
        -- Récupérer le nom de l'employé
        SELECT nom || ' ' || prenom INTO employee_name
        FROM public.employees
        WHERE id = NEW.employe_id;
        
        -- Déterminer le message selon le statut
        CASE NEW.statut
            WHEN 'Validé' THEN
                status_message := 'Votre demande d''avance de salaire de ' || NEW.montant_demande || ' GNF a été validée.';
            WHEN 'Rejeté' THEN
                status_message := 'Votre demande d''avance de salaire de ' || NEW.montant_demande || ' GNF a été rejetée.';
            WHEN 'En attente' THEN
                status_message := 'Votre demande d''avance de salaire de ' || NEW.montant_demande || ' GNF est en attente de traitement.';
            WHEN 'Annulé' THEN
                status_message := 'Votre demande d''avance de salaire de ' || NEW.montant_demande || ' GNF a été annulée.';
            ELSE
                status_message := 'Le statut de votre demande d''avance de salaire a été mis à jour vers: ' || NEW.statut;
        END CASE;
        
        -- Notifier l'employé (si il a un user_id et existe dans admin_users)
        IF NEW.employe_id IS NOT NULL THEN
            DECLARE
                employee_user_id UUID;
            BEGIN
                -- Récupérer le user_id de l'employé
                SELECT user_id INTO employee_user_id
                FROM public.employees 
                WHERE id = NEW.employe_id;
                
                -- Vérifier que l'utilisateur existe dans admin_users
                IF employee_user_id IS NOT NULL AND EXISTS (
                    SELECT 1 FROM public.admin_users WHERE id = employee_user_id
                ) THEN
                    PERFORM create_notification(
                        employee_user_id,
                        'Mise à jour de votre demande d''avance',
                        status_message,
                        'Succès'
                    );
                END IF;
            END;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_salary_advance_status_change ON public.salary_advance_requests;
CREATE TRIGGER trigger_salary_advance_status_change
    AFTER UPDATE ON public.salary_advance_requests
    FOR EACH ROW
    EXECUTE FUNCTION notify_salary_advance_status_change();

-- =====================================================
-- TRIGGERS POUR LES TRANSACTIONS FINANCIÈRES
-- =====================================================

-- Trigger pour nouvelle transaction financière
CREATE OR REPLACE FUNCTION notify_new_financial_transaction()
RETURNS TRIGGER AS $$
DECLARE
    admin_user_id UUID;
    transaction_type VARCHAR;
BEGIN
    -- Notifier tous les admins pour les transactions importantes
    IF NEW.montant > 1000000 THEN -- Transactions > 1M GNF
        FOR admin_user_id IN 
            SELECT id FROM public.admin_users WHERE active = true
        LOOP
            PERFORM create_notification(
                admin_user_id,
                'Nouvelle transaction importante',
                'Une transaction de ' || NEW.montant || ' GNF a été enregistrée (Type: ' || NEW.type || ').',
                'Information'
            );
        END LOOP;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_new_financial_transaction ON public.financial_transactions;
CREATE TRIGGER trigger_new_financial_transaction
    AFTER INSERT ON public.financial_transactions
    FOR EACH ROW
    EXECUTE FUNCTION notify_new_financial_transaction();

-- =====================================================
-- TRIGGERS POUR LES ALERTES
-- =====================================================

-- Trigger pour nouvelle alerte
CREATE OR REPLACE FUNCTION notify_new_alert()
RETURNS TRIGGER AS $$
DECLARE
    admin_user_id UUID;
BEGIN
    -- Notifier l'admin assigné si spécifié
    IF NEW.assigne_a IS NOT NULL THEN
        PERFORM create_notification(
            NEW.assigne_a,
            'Nouvelle alerte assignée',
            'Une alerte "' || NEW.titre || '" vous a été assignée. Priorité: ' || NEW.priorite,
            'Alerte'
        );
    ELSE
        -- Notifier tous les admins si aucune assignation
        FOR admin_user_id IN 
            SELECT id FROM public.admin_users WHERE active = true
        LOOP
            PERFORM create_notification(
                admin_user_id,
                'Nouvelle alerte',
                'Une alerte "' || NEW.titre || '" a été créée. Priorité: ' || NEW.priorite,
                'Alerte'
            );
        END LOOP;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_new_alert ON public.alerts;
CREATE TRIGGER trigger_new_alert
    AFTER INSERT ON public.alerts
    FOR EACH ROW
    EXECUTE FUNCTION notify_new_alert();

-- =====================================================
-- TRIGGERS POUR LES AVIS
-- =====================================================

-- Trigger pour nouvel avis
CREATE OR REPLACE FUNCTION notify_new_review()
RETURNS TRIGGER AS $$
DECLARE
    admin_user_id UUID;
    employee_name VARCHAR;
    partner_name VARCHAR;
BEGIN
    -- Récupérer les informations
    SELECT 
        e.nom || ' ' || e.prenom,
        p.nom
    INTO employee_name, partner_name
    FROM public.employees e
    LEFT JOIN public.partners p ON e.partner_id = p.id
    WHERE e.id = NEW.employee_id;
    
    -- Notifier les admins pour les avis négatifs
    IF NEW.note <= 2 OR NEW.type_retour = 'negatif' THEN
        FOR admin_user_id IN 
            SELECT id FROM public.admin_users WHERE active = true
        LOOP
            PERFORM create_notification(
                admin_user_id,
                'Nouvel avis négatif',
                'Un avis négatif a été soumis par ' || employee_name || ' pour ' || partner_name || ' (Note: ' || NEW.note || '/5).',
                'Erreur'
            );
        END LOOP;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_new_review ON public.avis;
CREATE TRIGGER trigger_new_review
    AFTER INSERT ON public.avis
    FOR EACH ROW
    EXECUTE FUNCTION notify_new_review();

-- =====================================================
-- TRIGGERS POUR LES DEMANDES DE PARTENARIAT
-- =====================================================

-- Trigger pour nouvelle demande de partenariat
CREATE OR REPLACE FUNCTION notify_new_partnership_request()
RETURNS TRIGGER AS $$
DECLARE
    admin_user_id UUID;
BEGIN
    -- Notifier tous les admins
    FOR admin_user_id IN 
        SELECT id FROM public.admin_users WHERE active = true
    LOOP
        PERFORM create_notification(
            admin_user_id,
            'Nouvelle demande de partenariat',
            'Une nouvelle demande de partenariat a été soumise par ' || NEW.company_name || ' (' || NEW.employees_count || ' employés).',
            'Information'
        );
    END LOOP;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_new_partnership_request ON public.partnership_requests;
CREATE TRIGGER trigger_new_partnership_request
    AFTER INSERT ON public.partnership_requests
    FOR EACH ROW
    EXECUTE FUNCTION notify_new_partnership_request();

-- Trigger pour changement de statut de demande de partenariat
CREATE OR REPLACE FUNCTION notify_partnership_status_change()
RETURNS TRIGGER AS $$
DECLARE
    status_message VARCHAR;
BEGIN
    -- Ne déclencher que si le statut a changé
    IF OLD.status != NEW.status THEN
        CASE NEW.status
            WHEN 'approved' THEN
                status_message := 'Votre demande de partenariat a été approuvée !';
            WHEN 'rejected' THEN
                status_message := 'Votre demande de partenariat a été rejetée.';
            WHEN 'in_review' THEN
                status_message := 'Votre demande de partenariat est en cours d''examen.';
            ELSE
                status_message := 'Le statut de votre demande de partenariat a été mis à jour.';
        END CASE;
        
        -- Ici on pourrait notifier l'entreprise par email
        -- Pour l'instant, on ne fait que logger
        RAISE NOTICE 'Demande de partenariat %: %', NEW.company_name, status_message;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_partnership_status_change ON public.partnership_requests;
CREATE TRIGGER trigger_partnership_status_change
    AFTER UPDATE ON public.partnership_requests
    FOR EACH ROW
    EXECUTE FUNCTION notify_partnership_status_change();

-- =====================================================
-- TRIGGERS POUR LES ÉVÉNEMENTS DE SÉCURITÉ
-- =====================================================

-- Trigger pour événement de sécurité à haut risque
CREATE OR REPLACE FUNCTION notify_security_event()
RETURNS TRIGGER AS $$
DECLARE
    admin_user_id UUID;
BEGIN
    -- Notifier les admins pour les événements à haut risque
    IF NEW.risk_score >= 7 THEN
        FOR admin_user_id IN 
            SELECT id FROM public.admin_users WHERE active = true
        LOOP
            PERFORM create_notification(
                admin_user_id,
                'Événement de sécurité à haut risque',
                'Un événement de sécurité de niveau ' || NEW.risk_score || ' a été détecté (Type: ' || NEW.event_type || ').',
                'Erreur'
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
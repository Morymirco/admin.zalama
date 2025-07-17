-- =====================================================
-- SYSTÈME COMPLET DE TRIGGERS DE NOTIFICATIONS ZALAMA
-- Basé sur le schéma bd.sql fourni
-- =====================================================

-- =====================================================
-- 1. VÉRIFICATION ET CRÉATION DES TYPES ENUM
-- =====================================================

-- Créer le type notification_type s'il n'existe pas
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_type') THEN
        CREATE TYPE notification_type AS ENUM ('Information', 'Alerte', 'Succès', 'Erreur');
    END IF;
END $$;

-- =====================================================
-- 2. FONCTION UTILITAIRE POUR CRÉER DES NOTIFICATIONS
-- =====================================================

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
-- 3. FONCTIONS UTILITAIRES
-- =====================================================

-- Fonction pour notifier tous les administrateurs
CREATE OR REPLACE FUNCTION notify_all_admins(
    p_titre VARCHAR,
    p_message TEXT,
    p_type notification_type DEFAULT 'Information',
    p_employee_id UUID DEFAULT NULL,
    p_partner_id UUID DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
    admin_count INTEGER := 0;
    admin_record RECORD;
BEGIN
    FOR admin_record IN
        SELECT id FROM admin_users 
        WHERE role IN ('admin', 'responsable') AND active = true
    LOOP
        PERFORM create_notification(
            admin_record.id,
            p_titre,
            p_message,
            p_type,
            p_employee_id,
            p_partner_id
        );
        admin_count := admin_count + 1;
    END LOOP;
    
    RETURN admin_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 4. TRIGGERS POUR SALARY_ADVANCE_REQUESTS
-- =====================================================

-- Notification lors de la création d'une demande d'avance
CREATE OR REPLACE FUNCTION notify_salary_advance_created()
RETURNS TRIGGER AS $$
DECLARE
    employee_name TEXT;
    partner_name TEXT;
    montant_format TEXT;
BEGIN
    -- Récupérer les informations de l'employé et du partenaire
    SELECT 
        COALESCE(e.nom || ' ' || e.prenom, 'Employé inconnu'),
        COALESCE(p.nom, 'Partenaire inconnu')
    INTO employee_name, partner_name
    FROM employees e
    LEFT JOIN partners p ON e.partner_id = p.id
    WHERE e.id = NEW.employe_id;
    
    -- Formater le montant
    montant_format := to_char(NEW.montant_demande, 'FM999,999,999') || ' FCFA';
    
    -- Notifier tous les administrateurs
    PERFORM notify_all_admins(
        'Nouvelle demande d''avance de salaire',
        'L''employé ' || employee_name || ' (' || partner_name || ') a soumis une demande d''avance de ' || montant_format || '.' ||
        CASE 
            WHEN NEW.motif IS NOT NULL AND NEW.motif != '' THEN ' Motif: ' || NEW.motif
            ELSE ''
        END,
        'Alerte',
        NEW.employe_id,
        NEW.partenaire_id
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Notification lors du changement de statut d'une demande
CREATE OR REPLACE FUNCTION notify_salary_advance_status_changed()
RETURNS TRIGGER AS $$
DECLARE
    employee_name TEXT;
    employee_email TEXT;
    montant_format TEXT;
    status_message TEXT;
    notification_type notification_type;
BEGIN
    -- Vérifier si le statut a changé
    IF OLD.statut = NEW.statut THEN
        RETURN NEW;
    END IF;
    
    -- Récupérer les informations de l'employé
    SELECT 
        COALESCE(e.nom || ' ' || e.prenom, 'Employé inconnu'),
        e.email
    INTO employee_name, employee_email
    FROM employees e
    WHERE e.id = NEW.employe_id;
    
    -- Formater le montant
    montant_format := to_char(NEW.montant_demande, 'FM999,999,999') || ' FCFA';
    
    -- Déterminer le message et le type selon le statut
    CASE NEW.statut
        WHEN 'APPROUVE' THEN
            status_message := 'approuvée';
            notification_type := 'Succès';
        WHEN 'REFUSE' THEN
            status_message := 'refusée';
            notification_type := 'Erreur';
        WHEN 'PAYE' THEN
            status_message := 'payée';
            notification_type := 'Succès';
        ELSE
            status_message := 'mise à jour';
            notification_type := 'Information';
    END CASE;
    
    -- Notifier les administrateurs du changement
    PERFORM notify_all_admins(
        'Demande d''avance ' || status_message,
        'La demande d''avance de ' || montant_format || ' de ' || employee_name || ' a été ' || status_message || '.' ||
        CASE 
            WHEN NEW.motif_rejet IS NOT NULL AND NEW.motif_rejet != '' THEN ' Motif: ' || NEW.motif_rejet
            WHEN NEW.commentaire IS NOT NULL AND NEW.commentaire != '' THEN ' Commentaire: ' || NEW.commentaire
            ELSE ''
        END,
        notification_type,
        NEW.employe_id,
        NEW.partenaire_id
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 5. TRIGGERS POUR TRANSACTIONS
-- =====================================================

-- Notification lors de la création d'une transaction
CREATE OR REPLACE FUNCTION notify_transaction_created()
RETURNS TRIGGER AS $$
DECLARE
    employee_name TEXT;
    partner_name TEXT;
    montant_format TEXT;
    methode_text TEXT;
BEGIN
    -- Récupérer les informations
    SELECT 
        COALESCE(e.nom || ' ' || e.prenom, 'Employé inconnu'),
        COALESCE(p.nom, 'Partenaire inconnu')
    INTO employee_name, partner_name
    FROM employees e
    LEFT JOIN partners p ON p.id = NEW.entreprise_id
    WHERE e.id = NEW.employe_id;
    
    -- Formater le montant
    montant_format := to_char(NEW.montant, 'FM999,999,999') || ' FCFA';
    
    -- Formater la méthode de paiement
    methode_text := CASE NEW.methode_paiement
        WHEN 'VIREMENT_BANCAIRE' THEN 'virement bancaire'
        WHEN 'MOBILE_MONEY' THEN 'mobile money'
        WHEN 'ESPECES' THEN 'espèces'
        WHEN 'CHEQUE' THEN 'chèque'
        ELSE NEW.methode_paiement::TEXT
    END;
    
    -- Notifier tous les administrateurs
    PERFORM notify_all_admins(
        'Nouvelle transaction effectuée',
        'Transaction de ' || montant_format || ' effectuée par ' || methode_text || ' pour ' || 
        employee_name || ' (' || partner_name || '). Numéro: ' || NEW.numero_transaction,
        'Information',
        NEW.employe_id,
        NEW.entreprise_id
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Notification lors du changement de statut d'une transaction
CREATE OR REPLACE FUNCTION notify_transaction_status_changed()
RETURNS TRIGGER AS $$
DECLARE
    employee_name TEXT;
    montant_format TEXT;
    status_message TEXT;
    notification_type notification_type;
BEGIN
    -- Vérifier si le statut a changé
    IF OLD.statut = NEW.statut THEN
        RETURN NEW;
    END IF;
    
    -- Récupérer le nom de l'employé
    SELECT COALESCE(nom || ' ' || prenom, 'Employé inconnu')
    INTO employee_name
    FROM employees
    WHERE id = NEW.employe_id;
    
    -- Formater le montant
    montant_format := to_char(NEW.montant, 'FM999,999,999') || ' FCFA';
    
    -- Déterminer le message selon le statut
    CASE NEW.statut
        WHEN 'EFFECTUEE' THEN
            status_message := 'confirmée';
            notification_type := 'Succès';
        WHEN 'ANNULEE' THEN
            status_message := 'annulée';
            notification_type := 'Erreur';
        ELSE
            status_message := 'mise à jour';
            notification_type := 'Information';
    END CASE;
    
    -- Notifier les administrateurs
    PERFORM notify_all_admins(
        'Transaction ' || status_message,
        'La transaction de ' || montant_format || ' pour ' || employee_name || 
        ' (' || NEW.numero_transaction || ') a été ' || status_message,
        notification_type,
        NEW.employe_id,
        NEW.entreprise_id
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 6. TRIGGERS POUR REMBOURSEMENTS
-- =====================================================

-- Notification lors de la création d'un remboursement
CREATE OR REPLACE FUNCTION notify_remboursement_created()
RETURNS TRIGGER AS $$
DECLARE
    employee_name TEXT;
    partner_name TEXT;
    montant_format TEXT;
    limite_format TEXT;
BEGIN
    -- Récupérer les informations
    SELECT 
        COALESCE(e.nom || ' ' || e.prenom, 'Employé inconnu'),
        COALESCE(p.nom, 'Partenaire inconnu')
    INTO employee_name, partner_name
    FROM employees e
    LEFT JOIN partners p ON p.id = NEW.partenaire_id
    WHERE e.id = NEW.employe_id;
    
    -- Formater les montants et dates
    montant_format := to_char(NEW.montant_total_remboursement, 'FM999,999,999') || ' FCFA';
    limite_format := to_char(NEW.date_limite_remboursement, 'DD/MM/YYYY');
    
    -- Notifier tous les administrateurs
    PERFORM notify_all_admins(
        'Nouveau remboursement à effectuer',
        'Remboursement de ' || montant_format || ' à effectuer par ' || partner_name || 
        ' pour ' || employee_name || '. Date limite: ' || limite_format,
        'Alerte',
        NEW.employe_id,
        NEW.partenaire_id
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Notification lors du changement de statut d'un remboursement
CREATE OR REPLACE FUNCTION notify_remboursement_status_changed()
RETURNS TRIGGER AS $$
DECLARE
    employee_name TEXT;
    partner_name TEXT;
    montant_format TEXT;
    status_message TEXT;
    notification_type notification_type;
BEGIN
    -- Vérifier si le statut a changé
    IF OLD.statut = NEW.statut THEN
        RETURN NEW;
    END IF;
    
    -- Récupérer les informations
    SELECT 
        COALESCE(e.nom || ' ' || e.prenom, 'Employé inconnu'),
        COALESCE(p.nom, 'Partenaire inconnu')
    INTO employee_name, partner_name
    FROM employees e
    LEFT JOIN partners p ON p.id = NEW.partenaire_id
    WHERE e.id = NEW.employe_id;
    
    -- Formater le montant
    montant_format := to_char(NEW.montant_total_remboursement, 'FM999,999,999') || ' FCFA';
    
    -- Déterminer le message selon le statut
    CASE NEW.statut
        WHEN 'PAYE' THEN
            status_message := 'effectué';
            notification_type := 'Succès';
        WHEN 'EN_RETARD' THEN
            status_message := 'en retard';
            notification_type := 'Erreur';
        WHEN 'ANNULE' THEN
            status_message := 'annulé';
            notification_type := 'Erreur';
        ELSE
            status_message := 'mis à jour';
            notification_type := 'Information';
    END CASE;
    
    -- Notifier les administrateurs
    PERFORM notify_all_admins(
        'Remboursement ' || status_message,
        'Le remboursement de ' || montant_format || ' de ' || partner_name || 
        ' pour ' || employee_name || ' a été ' || status_message ||
        CASE 
            WHEN NEW.commentaire_admin IS NOT NULL AND NEW.commentaire_admin != '' 
            THEN '. Commentaire: ' || NEW.commentaire_admin
            ELSE ''
        END,
        notification_type,
        NEW.employe_id,
        NEW.partenaire_id
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 7. TRIGGERS POUR PARTNERSHIP_REQUESTS
-- =====================================================

-- Notification lors de la création d'une demande de partenariat
CREATE OR REPLACE FUNCTION notify_partnership_request_created()
RETURNS TRIGGER AS $$
BEGIN
    -- Notifier tous les administrateurs
    PERFORM notify_all_admins(
        'Nouvelle demande de partenariat',
        'Une nouvelle demande de partenariat a été soumise par ' || NEW.company_name || 
        ' (' || NEW.activity_domain || '). ' || NEW.employees_count || ' employés.',
        'Alerte'
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Notification lors du changement de statut d'une demande de partenariat
CREATE OR REPLACE FUNCTION notify_partnership_request_status_changed()
RETURNS TRIGGER AS $$
DECLARE
    status_message TEXT;
    notification_type notification_type;
BEGIN
    -- Vérifier si le statut a changé
    IF OLD.status = NEW.status THEN
        RETURN NEW;
    END IF;
    
    -- Déterminer le message selon le statut
    CASE NEW.status
        WHEN 'approved' THEN
            status_message := 'approuvée';
            notification_type := 'Succès';
        WHEN 'rejected' THEN
            status_message := 'rejetée';
            notification_type := 'Erreur';
        WHEN 'in_review' THEN
            status_message := 'en cours d''examen';
            notification_type := 'Information';
        ELSE
            status_message := 'mise à jour';
            notification_type := 'Information';
    END CASE;
    
    -- Notifier les administrateurs
    PERFORM notify_all_admins(
        'Demande de partenariat ' || status_message,
        'La demande de partenariat de ' || NEW.company_name || ' a été ' || status_message,
        notification_type
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 8. TRIGGERS POUR EMPLOYEES
-- =====================================================

-- Notification lors de l'ajout d'un nouvel employé
CREATE OR REPLACE FUNCTION notify_employee_created()
RETURNS TRIGGER AS $$
DECLARE
    partner_name TEXT;
BEGIN
    -- Récupérer le nom du partenaire
    SELECT COALESCE(nom, 'Partenaire inconnu')
    INTO partner_name
    FROM partners
    WHERE id = NEW.partner_id;
    
    -- Notifier tous les administrateurs
    PERFORM notify_all_admins(
        'Nouvel employé ajouté',
        'Un nouvel employé a été ajouté: ' || NEW.nom || ' ' || NEW.prenom || 
        ' (' || NEW.poste || ') chez ' || partner_name,
        'Information',
        NEW.id,
        NEW.partner_id
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 9. TRIGGERS POUR PARTNERS
-- =====================================================

-- Notification lors de l'ajout d'un nouveau partenaire
CREATE OR REPLACE FUNCTION notify_partner_created()
RETURNS TRIGGER AS $$
BEGIN
    -- Notifier tous les administrateurs
    PERFORM notify_all_admins(
        'Nouveau partenaire ajouté',
        'Un nouveau partenaire a été ajouté: ' || NEW.nom || ' (' || NEW.secteur || ')',
        'Information',
        NULL,
        NEW.id
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 10. TRIGGERS POUR ALERTS
-- =====================================================

-- Notification lors de la création d'une alerte
CREATE OR REPLACE FUNCTION notify_alert_created()
RETURNS TRIGGER AS $$
DECLARE
    priority_text TEXT;
    notification_type notification_type;
BEGIN
    -- Déterminer le type de notification selon la priorité
    priority_text := CASE NEW.priorite
        WHEN 1 THEN 'faible'
        WHEN 2 THEN 'normale'
        WHEN 3 THEN 'élevée'
        ELSE 'inconnue'
    END;
    
    notification_type := CASE NEW.type
        WHEN 'Critique' THEN 'Erreur'
        WHEN 'Importante' THEN 'Alerte'
        ELSE 'Information'
    END;
    
    -- Notifier tous les administrateurs
    PERFORM notify_all_admins(
        'Nouvelle alerte: ' || NEW.titre,
        'Une nouvelle alerte de priorité ' || priority_text || ' a été créée: ' || 
        COALESCE(NEW.description, 'Aucune description'),
        notification_type
    );
    
    -- Notifier spécifiquement l'assigné si défini
    IF NEW.assigne_a IS NOT NULL THEN
        PERFORM create_notification(
            NEW.assigne_a,
            'Alerte assignée: ' || NEW.titre,
            'Une alerte vous a été assignée: ' || COALESCE(NEW.description, 'Aucune description'),
            'Alerte'
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Notification lors de la résolution d'une alerte
CREATE OR REPLACE FUNCTION notify_alert_resolved()
RETURNS TRIGGER AS $$
BEGIN
    -- Vérifier si l'alerte est passée à "Résolue"
    IF OLD.statut != 'Résolue' AND NEW.statut = 'Résolue' THEN
        -- Notifier tous les administrateurs
        PERFORM notify_all_admins(
            'Alerte résolue: ' || NEW.titre,
            'L''alerte "' || NEW.titre || '" a été résolue',
            'Succès'
        );
        
        -- Notifier spécifiquement l'assigné si défini
        IF NEW.assigne_a IS NOT NULL THEN
            PERFORM create_notification(
                NEW.assigne_a,
                'Alerte résolue: ' || NEW.titre,
                'L''alerte qui vous était assignée a été résolue',
                'Succès'
            );
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 11. TRIGGERS POUR AVIS
-- =====================================================

-- Notification lors de la création d'un avis
CREATE OR REPLACE FUNCTION notify_avis_created()
RETURNS TRIGGER AS $$
DECLARE
    employee_name TEXT;
    partner_name TEXT;
    note_text TEXT;
    type_text TEXT;
BEGIN
    -- Récupérer les informations
    SELECT COALESCE(nom || ' ' || prenom, 'Employé inconnu')
    INTO employee_name
    FROM employees
    WHERE id = NEW.employee_id;
    
    SELECT COALESCE(nom, 'Partenaire inconnu')
    INTO partner_name
    FROM partners
    WHERE id = NEW.partner_id;
    
    -- Formater la note et le type
    note_text := NEW.note || '/5';
    type_text := CASE NEW.type_retour
        WHEN 'positif' THEN 'positif'
        WHEN 'negatif' THEN 'négatif'
        ELSE 'neutre'
    END;
    
    -- Notifier tous les administrateurs
    PERFORM notify_all_admins(
        'Nouvel avis ' || type_text,
        'Un avis ' || type_text || ' (' || note_text || ') a été laissé par ' || 
        employee_name || ' chez ' || partner_name ||
        CASE 
            WHEN NEW.commentaire IS NOT NULL AND NEW.commentaire != '' 
            THEN '. Commentaire: ' || LEFT(NEW.commentaire, 100) ||
                 CASE WHEN LENGTH(NEW.commentaire) > 100 THEN '...' ELSE '' END
            ELSE ''
        END,
        CASE NEW.type_retour
            WHEN 'positif' THEN 'Succès'
            WHEN 'negatif' THEN 'Alerte'
            ELSE 'Information'
        END,
        NEW.employee_id,
        NEW.partner_id
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 12. TRIGGERS POUR SECURITY_EVENTS
-- =====================================================

-- Notification pour les événements de sécurité à haut risque
CREATE OR REPLACE FUNCTION notify_security_event_high_risk()
RETURNS TRIGGER AS $$
DECLARE
    event_details TEXT;
BEGIN
    -- Notifier seulement pour les événements à haut risque
    IF NEW.risk_score >= 7 THEN
        event_details := 'Événement de sécurité détecté: ' || NEW.event_type || 
                        ' (Score de risque: ' || NEW.risk_score || '/10)';
        
        -- Notifier tous les administrateurs
        PERFORM notify_all_admins(
            'Alerte sécurité - Risque élevé',
            event_details,
            'Erreur'
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 13. TRIGGERS POUR PASSWORD_ATTEMPTS
-- =====================================================

-- Notification pour les tentatives de connexion échouées
CREATE OR REPLACE FUNCTION notify_failed_login_attempts()
RETURNS TRIGGER AS $$
DECLARE
    user_email TEXT;
BEGIN
    -- Notifier seulement si le nombre de tentatives atteint 3 ou plus
    IF NEW.attempt_count >= 3 THEN
        -- Récupérer l'email de l'utilisateur
        SELECT email INTO user_email
        FROM auth.users
        WHERE id = NEW.user_id;
        
        -- Notifier tous les administrateurs
        PERFORM notify_all_admins(
            'Tentatives de connexion échouées',
            'Plusieurs tentatives de connexion échouées détectées pour ' || 
            COALESCE(user_email, 'utilisateur inconnu') || ' (' || NEW.attempt_count || ' tentatives)',
            'Alerte'
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 14. CRÉATION DE TOUS LES TRIGGERS
-- =====================================================

-- Supprimer les triggers existants pour éviter les conflits
DROP TRIGGER IF EXISTS trigger_salary_advance_created ON public.salary_advance_requests;
DROP TRIGGER IF EXISTS trigger_salary_advance_status_changed ON public.salary_advance_requests;
DROP TRIGGER IF EXISTS trigger_transaction_created ON public.transactions;
DROP TRIGGER IF EXISTS trigger_transaction_status_changed ON public.transactions;
DROP TRIGGER IF EXISTS trigger_remboursement_created ON public.remboursements;
DROP TRIGGER IF EXISTS trigger_remboursement_status_changed ON public.remboursements;
DROP TRIGGER IF EXISTS trigger_partnership_request_created ON public.partnership_requests;
DROP TRIGGER IF EXISTS trigger_partnership_request_status_changed ON public.partnership_requests;
DROP TRIGGER IF EXISTS trigger_employee_created ON public.employees;
DROP TRIGGER IF EXISTS trigger_partner_created ON public.partners;
DROP TRIGGER IF EXISTS trigger_alert_created ON public.alerts;
DROP TRIGGER IF EXISTS trigger_alert_resolved ON public.alerts;
DROP TRIGGER IF EXISTS trigger_avis_created ON public.avis;
DROP TRIGGER IF EXISTS trigger_security_event_high_risk ON public.security_events;
DROP TRIGGER IF EXISTS trigger_failed_login_attempts ON public.password_attempts;

-- Créer tous les triggers

-- Triggers pour salary_advance_requests
CREATE TRIGGER trigger_salary_advance_created
    AFTER INSERT ON public.salary_advance_requests
    FOR EACH ROW
    EXECUTE FUNCTION notify_salary_advance_created();

CREATE TRIGGER trigger_salary_advance_status_changed
    AFTER UPDATE ON public.salary_advance_requests
    FOR EACH ROW
    EXECUTE FUNCTION notify_salary_advance_status_changed();

-- Triggers pour transactions
CREATE TRIGGER trigger_transaction_created
    AFTER INSERT ON public.transactions
    FOR EACH ROW
    EXECUTE FUNCTION notify_transaction_created();

CREATE TRIGGER trigger_transaction_status_changed
    AFTER UPDATE ON public.transactions
    FOR EACH ROW
    EXECUTE FUNCTION notify_transaction_status_changed();

-- Triggers pour remboursements
CREATE TRIGGER trigger_remboursement_created
    AFTER INSERT ON public.remboursements
    FOR EACH ROW
    EXECUTE FUNCTION notify_remboursement_created();

CREATE TRIGGER trigger_remboursement_status_changed
    AFTER UPDATE ON public.remboursements
    FOR EACH ROW
    EXECUTE FUNCTION notify_remboursement_status_changed();

-- Triggers pour partnership_requests
CREATE TRIGGER trigger_partnership_request_created
    AFTER INSERT ON public.partnership_requests
    FOR EACH ROW
    EXECUTE FUNCTION notify_partnership_request_created();

CREATE TRIGGER trigger_partnership_request_status_changed
    AFTER UPDATE ON public.partnership_requests
    FOR EACH ROW
    EXECUTE FUNCTION notify_partnership_request_status_changed();

-- Triggers pour employees
CREATE TRIGGER trigger_employee_created
    AFTER INSERT ON public.employees
    FOR EACH ROW
    EXECUTE FUNCTION notify_employee_created();

-- Triggers pour partners
CREATE TRIGGER trigger_partner_created
    AFTER INSERT ON public.partners
    FOR EACH ROW
    EXECUTE FUNCTION notify_partner_created();

-- Triggers pour alerts
CREATE TRIGGER trigger_alert_created
    AFTER INSERT ON public.alerts
    FOR EACH ROW
    EXECUTE FUNCTION notify_alert_created();

CREATE TRIGGER trigger_alert_resolved
    AFTER UPDATE ON public.alerts
    FOR EACH ROW
    EXECUTE FUNCTION notify_alert_resolved();

-- Triggers pour avis
CREATE TRIGGER trigger_avis_created
    AFTER INSERT ON public.avis
    FOR EACH ROW
    EXECUTE FUNCTION notify_avis_created();

-- Triggers pour security_events
CREATE TRIGGER trigger_security_event_high_risk
    AFTER INSERT ON public.security_events
    FOR EACH ROW
    EXECUTE FUNCTION notify_security_event_high_risk();

-- Triggers pour password_attempts
CREATE TRIGGER trigger_failed_login_attempts
    AFTER UPDATE ON public.password_attempts
    FOR EACH ROW
    EXECUTE FUNCTION notify_failed_login_attempts();

-- =====================================================
-- 15. FONCTIONS DE MAINTENANCE ET VÉRIFICATION
-- =====================================================

-- Fonction pour vérifier l'état des triggers
CREATE OR REPLACE FUNCTION check_notification_triggers()
RETURNS TABLE (
    table_name TEXT,
    trigger_name TEXT,
    function_name TEXT,
    status TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        n.nspname::TEXT || '.' || c.relname::TEXT as table_name,
        t.tgname::TEXT as trigger_name,
        p.proname::TEXT as function_name,
        'ACTIVE'::TEXT as status
    FROM pg_trigger t
    JOIN pg_class c ON c.oid = t.tgrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    JOIN pg_proc p ON p.oid = t.tgfoid
    WHERE t.tgname LIKE 'trigger_%'
    AND n.nspname = 'public'
    ORDER BY table_name, trigger_name;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour nettoyer les anciennes notifications
CREATE OR REPLACE FUNCTION cleanup_old_notifications(days_to_keep INTEGER DEFAULT 30)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM public.notifications
    WHERE date_creation < (NOW() - INTERVAL '1 day' * days_to_keep)
    AND lu = true;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 16. MESSAGE DE CONFIRMATION
-- =====================================================

SELECT 
    'Système de notifications ZaLaMa installé avec succès!' as message,
    COUNT(*) as triggers_created
FROM pg_trigger t
JOIN pg_class c ON c.oid = t.tgrelid
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE t.tgname LIKE 'trigger_%'
AND n.nspname = 'public';

-- Afficher la liste des triggers créés
SELECT 
    n.nspname || '.' || c.relname as table_name,
    t.tgname as trigger_name,
    'CRÉÉ' as status
FROM pg_trigger t
JOIN pg_class c ON c.oid = t.tgrelid
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE t.tgname LIKE 'trigger_%'
AND n.nspname = 'public'
ORDER BY table_name, trigger_name; 
-- =====================================================
-- SYSTÈME DE NOTIFICATIONS AVANCÉES POUR AVANCES DE SALAIRE
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
-- FONCTION POUR NOTIFIER LES DEMANDES URGENTES
-- =====================================================

-- Fonction pour notifier les demandes d'avance urgentes
CREATE OR REPLACE FUNCTION notify_urgent_advance_request()
RETURNS TRIGGER AS $$
DECLARE
    employee_name text;
    partner_name text;
    admin_users_cursor CURSOR FOR
        SELECT id FROM admin_users 
        WHERE role IN ('admin', 'responsable') AND active = true;
BEGIN
    -- Vérifier si c'est une demande urgente (motif contient "urgent" ou montant élevé)
    IF (NEW.motif ILIKE '%urgent%' OR NEW.motif ILIKE '%urgence%' OR NEW.montant_demande > 300000) THEN
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
                '🚨 Demande d''avance urgente',
                'Demande urgente de ' || NEW.montant_demande || ' FCFA par ' || 
                employee_name || ' (' || partner_name || '). Motif: ' || NEW.motif || '.',
                'Alerte'
            );
        END LOOP;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour les demandes urgentes
DROP TRIGGER IF EXISTS trigger_urgent_advance_request ON public.salary_advance_requests;
CREATE TRIGGER trigger_urgent_advance_request
    AFTER INSERT ON public.salary_advance_requests
    FOR EACH ROW
    EXECUTE FUNCTION notify_urgent_advance_request();

-- =====================================================
-- FONCTIONS UTILITAIRES SUPPLÉMENTAIRES
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
-- COMMENTAIRES ET DOCUMENTATION
-- =====================================================

COMMENT ON FUNCTION notify_advanced_salary_advance_status IS 'Notifie les changements de statut avancés des avances de salaire avec messages personnalisés';
COMMENT ON FUNCTION notify_advance_transaction_created IS 'Notifie la création de transactions liées aux avances de salaire';
COMMENT ON FUNCTION notify_transaction_failed IS 'Notifie les échecs de transactions';
COMMENT ON FUNCTION check_and_notify_advance_limits IS 'Vérifie et notifie les dépassements de limites d''avance';
COMMENT ON FUNCTION notify_urgent_advance_request IS 'Notifie les demandes d''avance urgentes';
COMMENT ON FUNCTION notify_batch_advance_approval IS 'Notifie les validations en lots d''avances';
COMMENT ON FUNCTION create_advance_reminders IS 'Crée des rappels automatiques pour les avances en attente';
COMMENT ON FUNCTION notify_monthly_advance_stats IS 'Notifie les statistiques mensuelles des avances'; 
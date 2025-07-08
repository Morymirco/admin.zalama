-- =====================================================
-- CORRECTION DES TRIGGERS DE NOTIFICATION
-- =====================================================

-- 1. Supprimer les triggers existants pour éviter les conflits
DROP TRIGGER IF EXISTS trigger_salary_advance_created ON public.salary_advance_requests;
DROP TRIGGER IF EXISTS trigger_salary_advance_status_changed ON public.salary_advance_requests;
DROP TRIGGER IF EXISTS trigger_financial_transaction_created ON public.financial_transactions;
DROP TRIGGER IF EXISTS trigger_alert_created ON public.alerts;
DROP TRIGGER IF EXISTS trigger_alert_resolved ON public.alerts;

-- 2. Supprimer les fonctions existantes
DROP FUNCTION IF EXISTS notify_salary_advance_created();
DROP FUNCTION IF EXISTS notify_salary_advance_status_changed();
DROP FUNCTION IF EXISTS notify_financial_transaction_created();
DROP FUNCTION IF EXISTS notify_alert_created();
DROP FUNCTION IF EXISTS notify_alert_resolved();
DROP FUNCTION IF EXISTS create_notification(UUID, VARCHAR, TEXT, notification_type, UUID, UUID);

-- 3. Recréer la fonction create_notification avec le bon type
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

-- 4. Recréer la fonction de notification pour les demandes d'avance
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
            ' a soumis une demande d''avance de ' || NEW.montant_demande || ' GNF.',
            'Information'
        );
    END LOOP;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Recréer le trigger pour les demandes d'avance
CREATE TRIGGER trigger_salary_advance_created
    AFTER INSERT ON public.salary_advance_requests
    FOR EACH ROW
    EXECUTE FUNCTION notify_salary_advance_created();

-- 6. Vérifier que l'enum notification_type existe et a les bonnes valeurs
DO $$
BEGIN
    -- Vérifier si l'enum existe
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_type') THEN
        CREATE TYPE notification_type AS ENUM ('Information', 'Alerte', 'Succès', 'Erreur');
    END IF;
END $$;

-- 7. Vérifier que la table notifications a le bon type
DO $$
BEGIN
    -- Vérifier si la colonne type existe et a le bon type
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'notifications' 
        AND column_name = 'type'
    ) THEN
        -- La colonne existe, vérifier le type
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'notifications' 
            AND column_name = 'type'
            AND data_type = 'USER-DEFINED'
            AND udt_name = 'notification_type'
        ) THEN
            -- Modifier le type de la colonne
            ALTER TABLE notifications ALTER COLUMN type TYPE notification_type USING type::notification_type;
        END IF;
    END IF;
END $$;

-- 8. Afficher un message de confirmation
SELECT 'Triggers de notification corrigés avec succès!' as message; 
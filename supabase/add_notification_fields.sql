-- =====================================================
-- AJOUT DES CHAMPS EMPLOYEE_ID ET PARTNER_ID À LA TABLE NOTIFICATIONS
-- =====================================================

-- Ajouter les nouveaux champs à la table notifications
ALTER TABLE public.notifications 
ADD COLUMN IF NOT EXISTS employee_id uuid REFERENCES public.employees(id) ON DELETE SET NULL;

ALTER TABLE public.notifications 
ADD COLUMN IF NOT EXISTS partner_id uuid REFERENCES public.partners(id) ON DELETE SET NULL;

-- Créer les index pour les nouveaux champs
CREATE INDEX IF NOT EXISTS idx_notifications_employee_id ON public.notifications(employee_id);
CREATE INDEX IF NOT EXISTS idx_notifications_partner_id ON public.notifications(partner_id);

-- Index composite pour les requêtes fréquentes
CREATE INDEX IF NOT EXISTS idx_notifications_user_employee ON public.notifications(user_id, employee_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_partner ON public.notifications(user_id, partner_id);
CREATE INDEX IF NOT EXISTS idx_notifications_employee_partner ON public.notifications(employee_id, partner_id);

-- =====================================================
-- FONCTIONS UTILITAIRES POUR LES NOUVELLES NOTIFICATIONS
-- =====================================================

-- Fonction pour obtenir les notifications d'un employé spécifique
CREATE OR REPLACE FUNCTION get_employee_notifications(p_employee_id uuid)
RETURNS TABLE (
    id uuid,
    titre varchar,
    message text,
    type notification_type,
    lu boolean,
    date_creation timestamp with time zone,
    employee_id uuid,
    partner_id uuid
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        n.id,
        n.titre,
        n.message,
        n.type,
        n.lu,
        n.date_creation,
        n.employee_id,
        n.partner_id
    FROM public.notifications n
    WHERE n.employee_id = p_employee_id
    ORDER BY n.date_creation DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour obtenir les notifications d'un partenaire spécifique
CREATE OR REPLACE FUNCTION get_partner_notifications(p_partner_id uuid)
RETURNS TABLE (
    id uuid,
    titre varchar,
    message text,
    type notification_type,
    lu boolean,
    date_creation timestamp with time zone,
    employee_id uuid,
    partner_id uuid
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        n.id,
        n.titre,
        n.message,
        n.type,
        n.lu,
        n.date_creation,
        n.employee_id,
        n.partner_id
    FROM public.notifications n
    WHERE n.partner_id = p_partner_id
    ORDER BY n.date_creation DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour obtenir les notifications d'un utilisateur avec informations employé/partenaire
CREATE OR REPLACE FUNCTION get_user_notifications_with_details(p_user_id uuid)
RETURNS TABLE (
    id uuid,
    titre varchar,
    message text,
    type notification_type,
    lu boolean,
    date_creation timestamp with time zone,
    employee_id uuid,
    partner_id uuid,
    employee_name text,
    partner_name text
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        n.id,
        n.titre,
        n.message,
        n.type,
        n.lu,
        n.date_creation,
        n.employee_id,
        n.partner_id,
        e.nom || ' ' || e.prenom as employee_name,
        p.nom as partner_name
    FROM public.notifications n
    LEFT JOIN public.employees e ON n.employee_id = e.id
    LEFT JOIN public.partners p ON n.partner_id = p.id
    WHERE n.user_id = p_user_id
    ORDER BY n.date_creation DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- MIGRATION DES NOTIFICATIONS EXISTANTES (OPTIONNEL)
-- =====================================================

-- Fonction pour migrer les notifications existantes basées sur le contenu du message
-- Cette fonction peut être utilisée pour enrichir les notifications existantes
CREATE OR REPLACE FUNCTION migrate_existing_notifications()
RETURNS integer AS $$
DECLARE
    updated_count integer := 0;
    notification_record record;
BEGIN
    -- Pour les notifications de demandes d'avance (basé sur le contenu du message)
    FOR notification_record IN 
        SELECT n.id, n.message
        FROM public.notifications n
        WHERE n.employee_id IS NULL 
        AND n.message LIKE '%demande d''avance%'
    LOOP
        -- Essayer d'extraire l'ID de l'employé depuis les demandes d'avance
        UPDATE public.notifications 
        SET employee_id = (
            SELECT sar.employe_id 
            FROM public.salary_advance_requests sar
            WHERE sar.montant_demande::text = ANY(
                string_to_array(
                    regexp_replace(notification_record.message, '[^0-9]', ' ', 'g'), 
                    ' '
                )
            )
            LIMIT 1
        ),
        partner_id = (
            SELECT sar.partenaire_id 
            FROM public.salary_advance_requests sar
            WHERE sar.montant_demande::text = ANY(
                string_to_array(
                    regexp_replace(notification_record.message, '[^0-9]', ' ', 'g'), 
                    ' '
                )
            )
            LIMIT 1
        )
        WHERE id = notification_record.id;
        
        updated_count := updated_count + 1;
    END LOOP;
    
    RETURN updated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- COMMENTAIRES ET DOCUMENTATION
-- =====================================================

COMMENT ON COLUMN public.notifications.employee_id IS 'ID de l''employé concerné par cette notification (optionnel)';
COMMENT ON COLUMN public.notifications.partner_id IS 'ID du partenaire concerné par cette notification (optionnel)';
COMMENT ON FUNCTION get_employee_notifications(uuid) IS 'Récupère toutes les notifications liées à un employé spécifique';
COMMENT ON FUNCTION get_partner_notifications(uuid) IS 'Récupère toutes les notifications liées à un partenaire spécifique';
COMMENT ON FUNCTION get_user_notifications_with_details(uuid) IS 'Récupère les notifications d''un utilisateur avec les détails employé/partenaire';
COMMENT ON FUNCTION migrate_existing_notifications() IS 'Migre les notifications existantes pour ajouter employee_id et partner_id (optionnel)';

-- =====================================================
-- VÉRIFICATION FINALE
-- =====================================================

-- Vérifier que les champs ont été ajoutés
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'notifications' 
AND table_schema = 'public'
AND column_name IN ('employee_id', 'partner_id')
ORDER BY column_name; 
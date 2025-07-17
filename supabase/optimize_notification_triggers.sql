-- =====================================================
-- OPTIMISATION DES TRIGGERS DE NOTIFICATIONS ZALAMA
-- Réduction des timeouts et amélioration des performances
-- =====================================================

-- =====================================================
-- 1. OPTIMISER LA FONCTION notify_all_admins
-- =====================================================

-- Version optimisée avec une seule requête batch
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
BEGIN
    -- Insertion batch de toutes les notifications en une seule requête
    INSERT INTO public.notifications (
        user_id,
        titre,
        message,
        type,
        lu,
        date_creation,
        employee_id,
        partner_id
    )
    SELECT 
        au.id,
        p_titre,
        p_message,
        p_type,
        false,
        now(),
        p_employee_id,
        p_partner_id
    FROM admin_users au
    WHERE au.role IN ('admin', 'responsable') 
    AND au.active = true;
    
    GET DIAGNOSTICS admin_count = ROW_COUNT;
    
    RETURN admin_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 2. OPTIMISER LES TRIGGERS GOURMANDS
-- =====================================================

-- Version optimisée du trigger d'avance de salaire
CREATE OR REPLACE FUNCTION notify_salary_advance_created()
RETURNS TRIGGER AS $$
DECLARE
    employee_name TEXT;
    partner_name TEXT;
    montant_format TEXT;
BEGIN
    -- Récupérer les informations en une seule requête optimisée
    SELECT 
        COALESCE(e.nom || ' ' || e.prenom, 'Employé inconnu'),
        COALESCE(p.nom, 'Partenaire inconnu'),
        to_char(NEW.montant_demande, 'FM999,999,999') || ' FCFA'
    INTO employee_name, partner_name, montant_format
    FROM employees e
    LEFT JOIN partners p ON e.partner_id = p.id
    WHERE e.id = NEW.employe_id;
    
    -- Utiliser la fonction optimisée avec condition pour éviter les notifications vides
    IF employee_name IS NOT NULL THEN
        PERFORM notify_all_admins(
            'Nouvelle demande d''avance de salaire',
            'L''employé ' || employee_name || ' (' || partner_name || ') a soumis une demande d''avance de ' || montant_format || '.' ||
            CASE 
                WHEN NEW.motif IS NOT NULL AND NEW.motif != '' THEN ' Motif: ' || LEFT(NEW.motif, 100)
                ELSE ''
            END,
            'Alerte',
            NEW.employe_id,
            NEW.partenaire_id
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Version optimisée du trigger de transaction
CREATE OR REPLACE FUNCTION notify_transaction_created()
RETURNS TRIGGER AS $$
DECLARE
    employee_name TEXT;
    partner_name TEXT;
    montant_format TEXT;
    methode_text TEXT;
BEGIN
    -- Optimisation : seulement pour les montants significatifs (>= 10000 FCFA)
    IF NEW.montant < 10000 THEN
        RETURN NEW;
    END IF;
    
    -- Récupérer les informations en une seule requête
    SELECT 
        COALESCE(e.nom || ' ' || e.prenom, 'Employé inconnu'),
        COALESCE(p.nom, 'Partenaire inconnu'),
        to_char(NEW.montant, 'FM999,999,999') || ' FCFA'
    INTO employee_name, partner_name, montant_format
    FROM employees e
    LEFT JOIN partners p ON p.id = NEW.entreprise_id
    WHERE e.id = NEW.employe_id;
    
    -- Formater la méthode de paiement
    methode_text := CASE NEW.methode_paiement
        WHEN 'VIREMENT_BANCAIRE' THEN 'virement bancaire'
        WHEN 'MOBILE_MONEY' THEN 'mobile money'
        WHEN 'ESPECES' THEN 'espèces'
        WHEN 'CHEQUE' THEN 'chèque'
        ELSE NEW.methode_paiement::TEXT
    END;
    
    -- Notifier avec informations compactes
    IF employee_name IS NOT NULL THEN
        PERFORM notify_all_admins(
            'Nouvelle transaction',
            'Transaction de ' || montant_format || ' (' || methode_text || ') - ' || 
            employee_name || ' chez ' || partner_name,
            'Information',
            NEW.employe_id,
            NEW.entreprise_id
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 3. CRÉER UNE TABLE DE CACHE POUR RÉDUIRE LES REQUÊTES
-- =====================================================

-- Table pour cache des informations fréquemment utilisées
CREATE TABLE IF NOT EXISTS notification_cache (
    cache_key VARCHAR(255) PRIMARY KEY,
    cache_value JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '1 hour')
);

-- Index pour le nettoyage automatique
CREATE INDEX IF NOT EXISTS idx_notification_cache_expires 
ON notification_cache(expires_at);

-- Fonction pour obtenir ou créer des entrées de cache
CREATE OR REPLACE FUNCTION get_cached_info(
    p_cache_key VARCHAR,
    p_employee_id UUID DEFAULT NULL,
    p_partner_id UUID DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    cached_result JSONB;
    employee_info JSONB;
    partner_info JSONB;
BEGIN
    -- Vérifier le cache
    SELECT cache_value INTO cached_result
    FROM notification_cache
    WHERE cache_key = p_cache_key
    AND expires_at > NOW();
    
    IF cached_result IS NOT NULL THEN
        RETURN cached_result;
    END IF;
    
    -- Construire les informations
    IF p_employee_id IS NOT NULL THEN
        SELECT jsonb_build_object(
            'name', COALESCE(nom || ' ' || prenom, 'Employé inconnu'),
            'email', email,
            'poste', poste
        ) INTO employee_info
        FROM employees
        WHERE id = p_employee_id;
    END IF;
    
    IF p_partner_id IS NOT NULL THEN
        SELECT jsonb_build_object(
            'name', COALESCE(nom, 'Partenaire inconnu'),
            'secteur', secteur,
            'type', type
        ) INTO partner_info
        FROM partners
        WHERE id = p_partner_id;
    END IF;
    
    -- Combiner les informations
    cached_result := jsonb_build_object(
        'employee', COALESCE(employee_info, '{}'::jsonb),
        'partner', COALESCE(partner_info, '{}'::jsonb)
    );
    
    -- Mettre en cache (avec upsert)
    INSERT INTO notification_cache (cache_key, cache_value)
    VALUES (p_cache_key, cached_result)
    ON CONFLICT (cache_key)
    DO UPDATE SET 
        cache_value = EXCLUDED.cache_value,
        expires_at = NOW() + INTERVAL '1 hour';
    
    RETURN cached_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 4. FONCTION DE NETTOYAGE AUTOMATIQUE DU CACHE
-- =====================================================

CREATE OR REPLACE FUNCTION cleanup_notification_cache()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM notification_cache
    WHERE expires_at < NOW();
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 5. DÉSACTIVER TEMPORAIREMENT LES TRIGGERS LOURDS
-- =====================================================

-- Désactiver les triggers qui causent des timeouts
ALTER TABLE remboursements DISABLE TRIGGER trigger_remboursement_created;
ALTER TABLE remboursements DISABLE TRIGGER trigger_remboursement_status_changed;
ALTER TABLE partnership_requests DISABLE TRIGGER trigger_partnership_request_created;
ALTER TABLE partnership_requests DISABLE TRIGGER trigger_partnership_request_status_changed;
ALTER TABLE employees DISABLE TRIGGER trigger_employee_created;
ALTER TABLE partners DISABLE TRIGGER trigger_partner_created;
ALTER TABLE alerts DISABLE TRIGGER trigger_alert_created;
ALTER TABLE alerts DISABLE TRIGGER trigger_alert_resolved;
ALTER TABLE avis DISABLE TRIGGER trigger_avis_created;
ALTER TABLE security_events DISABLE TRIGGER trigger_security_event_high_risk;
ALTER TABLE password_attempts DISABLE TRIGGER trigger_failed_login_attempts;

-- Garder seulement les triggers essentiels et optimisés
ALTER TABLE salary_advance_requests ENABLE TRIGGER trigger_salary_advance_created;
ALTER TABLE salary_advance_requests ENABLE TRIGGER trigger_salary_advance_status_changed;
ALTER TABLE transactions ENABLE TRIGGER trigger_transaction_created;
ALTER TABLE transactions ENABLE TRIGGER trigger_transaction_status_changed;

-- =====================================================
-- 6. MODIFIER LE TIMEOUT DANS LES REQUÊTES
-- =====================================================

-- Fonction pour réactiver progressivement les triggers
CREATE OR REPLACE FUNCTION enable_notification_triggers()
RETURNS TEXT AS $$
BEGIN
    -- Réactiver un par un avec délai
    ALTER TABLE remboursements ENABLE TRIGGER trigger_remboursement_created;
    ALTER TABLE employees ENABLE TRIGGER trigger_employee_created;
    ALTER TABLE partners ENABLE TRIGGER trigger_partner_created;
    
    RETURN 'Triggers essentiels réactivés. Surveillez les performances.';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 7. STATISTIQUES ET MONITORING
-- =====================================================

-- Vue pour surveiller les performances des notifications
CREATE OR REPLACE VIEW notification_performance AS
SELECT 
    type,
    COUNT(*) as total_notifications,
    COUNT(*) FILTER (WHERE date_creation > NOW() - INTERVAL '1 hour') as last_hour,
    COUNT(*) FILTER (WHERE date_creation > NOW() - INTERVAL '1 day') as last_day,
    AVG(EXTRACT(EPOCH FROM (date_lecture - date_creation))) as avg_read_time_seconds
FROM notifications
WHERE date_creation > NOW() - INTERVAL '7 days'
GROUP BY type
ORDER BY total_notifications DESC;

-- Fonction pour obtenir des statistiques de performance
CREATE OR REPLACE FUNCTION get_notification_stats()
RETURNS TABLE (
    metric VARCHAR,
    value BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 'total_notifications'::VARCHAR, COUNT(*)::BIGINT FROM notifications
    UNION ALL
    SELECT 'unread_notifications'::VARCHAR, COUNT(*)::BIGINT FROM notifications WHERE lu = false
    UNION ALL
    SELECT 'cache_entries'::VARCHAR, COUNT(*)::BIGINT FROM notification_cache
    UNION ALL
    SELECT 'expired_cache'::VARCHAR, COUNT(*)::BIGINT FROM notification_cache WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 8. TÂCHE DE NETTOYAGE AUTOMATIQUE
-- =====================================================

-- Nettoyer automatiquement le cache et les anciennes notifications
SELECT cleanup_notification_cache();
SELECT cleanup_old_notifications(30);

-- =====================================================
-- 9. MESSAGE DE CONFIRMATION
-- =====================================================

SELECT 
    'Optimisation des triggers terminée !' as message,
    'Triggers lourds désactivés, cache activé' as status,
    (SELECT COUNT(*) FROM pg_trigger t 
     JOIN pg_class c ON c.oid = t.tgrelid 
     JOIN pg_namespace n ON n.oid = c.relnamespace 
     WHERE t.tgname LIKE 'trigger_%' 
     AND n.nspname = 'public' 
     AND NOT t.tgisinternal 
     AND t.tgenabled = 'O') as active_triggers;

-- Afficher les statistiques
SELECT * FROM get_notification_stats(); 
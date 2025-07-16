-- =====================================================
-- NETTOYAGE : Suppression des tables remboursements_integraux
-- =====================================================
-- Ce script supprime les tables et objets liés au système intégral
-- qui ne sont plus utilisés car nous utilisons la table remboursements

-- 1. Supprimer les triggers liés aux remboursements intégraux
DROP TRIGGER IF EXISTS trigger_creer_remboursement_integral ON transactions;
DROP TRIGGER IF EXISTS trigger_historique_remboursement_integral ON remboursements_integraux;
DROP TRIGGER IF EXISTS trigger_update_remboursements_integraux_updated_at ON remboursements_integraux;

-- 2. Supprimer les fonctions liées aux remboursements intégraux
DROP FUNCTION IF EXISTS creer_remboursement_integral();
DROP FUNCTION IF EXISTS creer_remboursement_integral_direct(UUID);
DROP FUNCTION IF EXISTS creer_remboursement_integral_automatique();
DROP FUNCTION IF EXISTS ajouter_historique_remboursement_integral();
DROP FUNCTION IF EXISTS mettre_a_jour_statuts_retard();
DROP FUNCTION IF EXISTS creer_remboursements_manquants();

-- 3. Supprimer les vues liées aux remboursements intégraux
DROP VIEW IF EXISTS vue_remboursements_integraux;
DROP VIEW IF EXISTS remboursements_integraux_details;

-- 4. Supprimer les index liés aux remboursements intégraux
DROP INDEX IF EXISTS idx_remboursements_integraux_transaction_id;
DROP INDEX IF EXISTS idx_remboursements_integraux_entreprise_id;
DROP INDEX IF EXISTS idx_remboursements_integraux_partenaire_id;
DROP INDEX IF EXISTS idx_remboursements_integraux_employe_id;
DROP INDEX IF EXISTS idx_remboursements_integraux_statut;
DROP INDEX IF EXISTS idx_remboursements_integraux_status;
DROP INDEX IF EXISTS idx_remboursements_integraux_date_creation;
DROP INDEX IF EXISTS idx_remboursements_integraux_date_echeance;
DROP INDEX IF EXISTS idx_remboursements_integraux_date_limite;

DROP INDEX IF EXISTS idx_historique_remboursements_integraux_remboursement_id;
DROP INDEX IF EXISTS idx_historique_remboursements_integraux_date_action;

-- 5. Supprimer les politiques RLS liées aux remboursements intégraux
DROP POLICY IF EXISTS "Les administrateurs peuvent voir tous les remboursements" ON remboursements_integraux;
DROP POLICY IF EXISTS "Les administrateurs peuvent voir tout l'historique" ON historique_remboursements_integraux;
DROP POLICY IF EXISTS "Authenticated users have full access to remboursements_integraux" ON remboursements_integraux;
DROP POLICY IF EXISTS "Authenticated users have full access to historique_remboursements_integraux" ON historique_remboursements_integraux;

-- 6. Supprimer les tables principales (si elles existent)
DROP TABLE IF EXISTS historique_remboursements_integraux CASCADE;
DROP TABLE IF EXISTS remboursements_integraux CASCADE;

-- 7. Vérifier que les tables ont été supprimées
SELECT 
    'Tables supprimées' as action,
    table_name,
    CASE 
        WHEN table_name IN ('remboursements_integraux', 'historique_remboursements_integraux') 
        THEN '❌ Supprimée' 
        ELSE '✅ N/A' 
    END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('remboursements_integraux', 'historique_remboursements_integraux');

-- 8. Vérifier que la table remboursements existe toujours
SELECT 
    'Table principale' as action,
    table_name,
    CASE 
        WHEN table_name = 'remboursements' 
        THEN '✅ Existe' 
        ELSE '❌ Manquante' 
    END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'remboursements';

-- 9. Vérifier que la table historique_remboursements existe toujours
SELECT 
    'Table historique' as action,
    table_name,
    CASE 
        WHEN table_name = 'historique_remboursements' 
        THEN '✅ Existe' 
        ELSE '❌ Manquante' 
    END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'historique_remboursements';

-- 10. Message de confirmation
DO $$
BEGIN
    RAISE NOTICE '✅ Nettoyage terminé avec succès!';
    RAISE NOTICE '🗑️ Tables supprimées:';
    RAISE NOTICE '   - remboursements_integraux';
    RAISE NOTICE '   - historique_remboursements_integraux';
    RAISE NOTICE '🔧 Objets supprimés:';
    RAISE NOTICE '   - Triggers automatiques';
    RAISE NOTICE '   - Fonctions de création automatique';
    RAISE NOTICE '   - Vues de rapport';
    RAISE NOTICE '   - Index et politiques RLS';
    RAISE NOTICE '✅ Tables conservées:';
    RAISE NOTICE '   - remboursements (table principale)';
    RAISE NOTICE '   - historique_remboursements';
    RAISE NOTICE '📋 Le système utilise maintenant uniquement la table remboursements';
END $$; 
-- =====================================================
-- SUPPRESSION DÉFINITIVE : remboursements_integraux
-- =====================================================
-- Script pour supprimer complètement le système intégral
-- et ne garder que la table remboursements principale

-- 1. SUPPRIMER LES TRIGGERS
DROP TRIGGER IF EXISTS trigger_creer_remboursement_integral ON transactions;
DROP TRIGGER IF EXISTS trigger_historique_remboursement_integral ON remboursements_integraux;
DROP TRIGGER IF EXISTS trigger_update_remboursements_integraux_updated_at ON remboursements_integraux;

-- 2. SUPPRIMER LES FONCTIONS
DROP FUNCTION IF EXISTS creer_remboursement_integral();
DROP FUNCTION IF EXISTS creer_remboursement_integral_direct(UUID);
DROP FUNCTION IF EXISTS creer_remboursement_integral_automatique();
DROP FUNCTION IF EXISTS ajouter_historique_remboursement_integral();
DROP FUNCTION IF EXISTS mettre_a_jour_statuts_retard();
DROP FUNCTION IF EXISTS creer_remboursements_manquants();

-- 3. SUPPRIMER LES VUES
DROP VIEW IF EXISTS vue_remboursements_integraux;
DROP VIEW IF EXISTS remboursements_integraux_details;

-- 4. SUPPRIMER LES INDEX
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

-- 5. SUPPRIMER LES POLITIQUES RLS
DROP POLICY IF EXISTS "Les administrateurs peuvent voir tous les remboursements" ON remboursements_integraux;
DROP POLICY IF EXISTS "Les administrateurs peuvent voir tout l'historique" ON historique_remboursements_integraux;
DROP POLICY IF EXISTS "Authenticated users have full access to remboursements_integraux" ON remboursements_integraux;
DROP POLICY IF EXISTS "Authenticated users have full access to historique_remboursements_integraux" ON historique_remboursements_integraux;

-- 6. SUPPRIMER LES TABLES (CASCADE supprime tout ce qui en dépend)
DROP TABLE IF EXISTS historique_remboursements_integraux CASCADE;
DROP TABLE IF EXISTS remboursements_integraux CASCADE;

-- 7. VÉRIFICATION FINALE
SELECT 
    'SUPPRESSION TERMINÉE' as status,
    'remboursements_integraux' as table_name,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'remboursements_integraux') 
        THEN '❌ ÉCHEC - Table encore présente' 
        ELSE '✅ SUCCÈS - Table supprimée' 
    END as result

UNION ALL

SELECT 
    'SUPPRESSION TERMINÉE' as status,
    'historique_remboursements_integraux' as table_name,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'historique_remboursements_integraux') 
        THEN '❌ ÉCHEC - Table encore présente' 
        ELSE '✅ SUCCÈS - Table supprimée' 
    END as result

UNION ALL

SELECT 
    'VÉRIFICATION' as status,
    'remboursements (table principale)' as table_name,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'remboursements') 
        THEN '✅ OK - Table principale conservée' 
        ELSE '❌ ATTENTION - Table principale manquante' 
    END as result

UNION ALL

SELECT 
    'VÉRIFICATION' as status,
    'historique_remboursements' as table_name,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'historique_remboursements') 
        THEN '✅ OK - Table historique conservée' 
        ELSE '❌ ATTENTION - Table historique manquante' 
    END as result;

-- 8. MESSAGE DE CONFIRMATION
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🗑️ SUPPRESSION TERMINÉE AVEC SUCCÈS!';
    RAISE NOTICE '';
    RAISE NOTICE '✅ Tables supprimées:';
    RAISE NOTICE '   - remboursements_integraux';
    RAISE NOTICE '   - historique_remboursements_integraux';
    RAISE NOTICE '';
    RAISE NOTICE '✅ Objets supprimés:';
    RAISE NOTICE '   - Triggers automatiques';
    RAISE NOTICE '   - Fonctions de création automatique';
    RAISE NOTICE '   - Vues de rapport';
    RAISE NOTICE '   - Index et politiques RLS';
    RAISE NOTICE '';
    RAISE NOTICE '✅ Tables conservées:';
    RAISE NOTICE '   - remboursements (table principale)';
    RAISE NOTICE '   - historique_remboursements';
    RAISE NOTICE '';
    RAISE NOTICE '🎯 Le système utilise maintenant uniquement la table remboursements';
    RAISE NOTICE '📋 Toutes les APIs ont été mises à jour pour utiliser cette table';
    RAISE NOTICE '';
END $$; 
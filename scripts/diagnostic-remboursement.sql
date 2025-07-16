-- =====================================================
-- DIAGNOSTIC: Vérification du système de remboursement
-- =====================================================

-- 1. Vérifier l'existence des tables
SELECT 
    table_name,
    CASE 
        WHEN table_name IN ('remboursements_integraux', 'historique_remboursements_integraux') 
        THEN '✅ Existe' 
        ELSE '❌ Manquant' 
    END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('remboursements_integraux', 'historique_remboursements_integraux');

-- 2. Vérifier l'existence des fonctions
SELECT 
    proname as function_name,
    CASE 
        WHEN proname IN ('creer_remboursement_integral_direct', 'creer_remboursement_integral_automatique', 'creer_remboursements_manquants') 
        THEN '✅ Existe' 
        ELSE '❌ Manquant' 
    END as status
FROM pg_proc 
WHERE proname IN (
    'creer_remboursement_integral_direct',
    'creer_remboursement_integral_automatique', 
    'creer_remboursements_manquants'
);

-- 3. Vérifier l'existence et l'état du trigger
SELECT 
    tgname as trigger_name,
    tgrelid::regclass as table_name,
    CASE 
        WHEN tgname = 'trigger_creer_remboursement_integral' THEN '✅ Existe'
        ELSE '❌ Manquant'
    END as status,
    CASE tgenabled
        WHEN 'O' THEN '✅ Actif'
        WHEN 'D' THEN '❌ Désactivé'
        WHEN 'R' THEN '⚠️ Désactivé (replica)'
        ELSE '❓ Inconnu'
    END as trigger_state
FROM pg_trigger 
WHERE tgname = 'trigger_creer_remboursement_integral';

-- 4. Compter les transactions EFFECTUEE
SELECT 
    COUNT(*) as total_transactions_effectuee,
    COUNT(DISTINCT partenaire_id) as partenaires_concernes
FROM transactions 
WHERE statut = 'EFFECTUEE';

-- 5. Compter les remboursements existants
SELECT 
    COUNT(*) as total_remboursements,
    COUNT(CASE WHEN status = 'EN_ATTENTE' THEN 1 END) as en_attente,
    COUNT(CASE WHEN status = 'PAYE' THEN 1 END) as payes,
    COUNT(CASE WHEN status = 'EN_RETARD' THEN 1 END) as en_retard,
    COUNT(CASE WHEN status = 'ANNULE' THEN 1 END) as annules
FROM remboursements_integraux;

-- 6. Identifier les transactions EFFECTUEE sans remboursement
SELECT 
    t.id as transaction_id,
    t.montant,
    t.frais_service,
    t.date_creation,
    p.nom as partenaire_nom,
    e.nom as employe_nom
FROM transactions t
LEFT JOIN partenaires p ON t.partenaire_id = p.id
LEFT JOIN employes e ON t.employe_id = e.id
WHERE t.statut = 'EFFECTUEE'
AND NOT EXISTS (
    SELECT 1 FROM remboursements_integraux r 
    WHERE r.transaction_id = t.id
)
ORDER BY t.date_creation DESC;

-- 7. Tester la création d'un remboursement manquant (si il y en a)
-- Décommentez la ligne suivante pour créer les remboursements manquants
-- SELECT creer_remboursements_manquants();

-- 8. Vérifier la cohérence des données
SELECT 
    'Transactions EFFECTUEE' as type,
    COUNT(*) as count
FROM transactions 
WHERE statut = 'EFFECTUEE'
UNION ALL
SELECT 
    'Remboursements créés' as type,
    COUNT(*) as count
FROM remboursements_integraux
UNION ALL
SELECT 
    'Transactions sans remboursement' as type,
    COUNT(*) as count
FROM transactions t
WHERE t.statut = 'EFFECTUEE'
AND NOT EXISTS (
    SELECT 1 FROM remboursements_integraux r 
    WHERE r.transaction_id = t.id
);

-- =====================================================
-- 9. RECOMMANDATIONS
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🔍 DIAGNOSTIC TERMINÉ';
    RAISE NOTICE '';
    RAISE NOTICE '📋 RECOMMANDATIONS:';
    RAISE NOTICE '1. Vérifiez que les triggers sont bien créés';
    RAISE NOTICE '2. Vérifiez que les transactions ont bien demande_avance_id';
    RAISE NOTICE '3. Vérifiez que les demandes d''avance existent';
    RAISE NOTICE '4. Exécutez le script de correction si nécessaire';
    RAISE NOTICE '';
END $$; 
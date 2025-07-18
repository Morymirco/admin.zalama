-- ============================================================================
-- CORRECTION URGENTE : Remboursements existants avec montants incorrects
-- ============================================================================
-- PROBLÈME : Certains remboursements ont montant_total_remboursement = montant net
-- au lieu du montant demandé original

-- 1. DIAGNOSTIC DU PROBLÈME
SELECT 
    '=== REMBOURSEMENTS AVEC MONTANTS INCORRECTS ===' as diagnostic,
    r.id,
    t.montant as transaction_montant_original,
    r.montant_transaction as remb_montant_transaction,
    r.frais_service as remb_frais_service,
    r.montant_total_remboursement as remb_montant_total,
    CASE 
        WHEN r.montant_total_remboursement = t.montant THEN '✅ CORRECT'
        WHEN r.montant_total_remboursement = (t.montant - r.frais_service) THEN '❌ MONTANT NET (INCORRECT)'
        WHEN r.montant_total_remboursement = (t.montant + r.frais_service) THEN '❌ MONTANT + FRAIS (INCORRECT)'
        ELSE '❌ AUTRE LOGIQUE INCORRECTE'
    END as diagnostic_montant,
    (t.montant - r.montant_total_remboursement) as difference_a_corriger
FROM remboursements r
JOIN transactions t ON r.transaction_id = t.id
WHERE r.montant_total_remboursement != t.montant
ORDER BY r.created_at DESC;

-- 2. IDENTIFIER LES REMBOURSEMENTS À CORRIGER
-- Ceux où montant_total_remboursement = montant_transaction mais montant_transaction ≠ montant demandé original
WITH remboursements_incorrects AS (
    SELECT 
        r.id,
        r.montant_transaction,
        r.montant_total_remboursement,
        r.frais_service,
        t.montant as montant_original_demande,
        -- Recalculer le montant original demandé
        CASE 
            -- Si montant_transaction semble être le net (montant - frais), retrouver l'original
            WHEN r.montant_transaction = (r.montant_transaction - r.frais_service) THEN 
                r.montant_transaction + r.frais_service
            ELSE 
                t.montant
        END as montant_correct_a_rembourser
    FROM remboursements r
    JOIN transactions t ON r.transaction_id = t.id
    WHERE r.montant_total_remboursement != t.montant
)
SELECT 
    '=== REMBOURSEMENTS À CORRIGER ===' as correction_necessaire,
    COUNT(*) as nombre_remboursements_incorrects,
    SUM(montant_correct_a_rembourser - montant_total_remboursement) as montant_total_difference
FROM remboursements_incorrects;

-- 3. CORRIGER SELON DEUX SCÉNARIOS

-- Scénario A: Corriger en utilisant le montant de la transaction comme référence
UPDATE remboursements 
SET 
    montant_total_remboursement = (
        SELECT t.montant 
        FROM transactions t 
        WHERE t.id = remboursements.transaction_id
    ),
    commentaire_admin = COALESCE(commentaire_admin, '') || ' | CORRIGÉ: montant_total_remboursement ajusté selon logique ZaLaMa (partenaire paie montant demandé original)'
WHERE montant_total_remboursement != (
    SELECT t.montant 
    FROM transactions t 
    WHERE t.id = remboursements.transaction_id
);

-- 4. CAS SPÉCIAL: Si montant_transaction lui-même est incorrect (montant net au lieu du montant demandé)
-- Corriger d'abord montant_transaction puis montant_total_remboursement
UPDATE remboursements 
SET 
    montant_transaction = montant_transaction + frais_service,
    montant_total_remboursement = montant_transaction + frais_service,
    commentaire_admin = COALESCE(commentaire_admin, '') || ' | CORRIGÉ: montant_transaction et montant_total_remboursement recalculés (ajout frais service)'
WHERE montant_transaction = montant_total_remboursement 
AND montant_transaction < (montant_transaction + frais_service)
AND EXISTS (
    SELECT 1 FROM transactions t 
    WHERE t.id = remboursements.transaction_id 
    AND t.montant > remboursements.montant_transaction
);

-- 5. VÉRIFICATION FINALE APRÈS CORRECTION
SELECT 
    '=== VÉRIFICATION APRÈS CORRECTION ===' as verification,
    COUNT(*) as total_remboursements,
    COUNT(CASE WHEN r.montant_total_remboursement = t.montant THEN 1 END) as logique_correcte,
    COUNT(CASE WHEN r.montant_total_remboursement != t.montant THEN 1 END) as logique_incorrecte,
    ROUND(
        (COUNT(CASE WHEN r.montant_total_remboursement = t.montant THEN 1 END)::DECIMAL / COUNT(*)) * 100, 
        2
    ) as pourcentage_correct
FROM remboursements r
JOIN transactions t ON r.transaction_id = t.id;

-- 6. DÉTAIL DES CORRECTIONS APPLIQUÉES
SELECT 
    '=== DÉTAIL DES CORRECTIONS ===' as detail,
    r.id,
    t.montant as transaction_montant_original,
    r.montant_transaction as remb_montant_transaction,
    r.frais_service as remb_frais_service,
    r.montant_total_remboursement as remb_montant_total_corrige,
    CASE 
        WHEN r.montant_total_remboursement = t.montant THEN '✅ CORRECT'
        ELSE '❌ ENCORE INCORRECT'
    END as statut_final,
    r.commentaire_admin
FROM remboursements r
JOIN transactions t ON r.transaction_id = t.id
WHERE r.commentaire_admin LIKE '%CORRIGÉ%'
ORDER BY r.updated_at DESC;

-- 7. INSTRUCTIONS DE VALIDATION
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🎯 =======================================';
    RAISE NOTICE '🎯 CORRECTION DES MONTANTS TERMINÉE';
    RAISE NOTICE '🎯 =======================================';
    RAISE NOTICE '';
    RAISE NOTICE '📋 VÉRIFICATIONS À EFFECTUER:';
    RAISE NOTICE '1. Tous les montant_total_remboursement doivent égaler transaction.montant';
    RAISE NOTICE '2. Les frais_service restent informatifs (6.5%% du montant demandé)';
    RAISE NOTICE '3. La logique ZaLaMa est respectée: partenaire paie montant demandé pur';
    RAISE NOTICE '';
    RAISE NOTICE '🔄 POUR VÉRIFIER DANS L''APPLICATION:';
    RAISE NOTICE '   - Rafraîchissez la page remboursements';
    RAISE NOTICE '   - Vérifiez que les montants correspondent à la logique ZaLaMa';
    RAISE NOTICE '   - Le montant à rembourser doit être = montant demandé original';
    RAISE NOTICE '';
    RAISE NOTICE '✅ Script de correction exécuté !';
END $$; 
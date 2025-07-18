-- ============================================================================
-- VALIDATION RAPIDE : Logique ZaLaMa après corrections
-- ============================================================================
-- Ce script vérifie que tous les éléments respectent la logique ZaLaMa

-- 1. VÉRIFICATION DES REMBOURSEMENTS
SELECT 
    '=== VALIDATION LOGIQUE ZALAMA ===' as test,
    COUNT(*) as total_remboursements,
    COUNT(CASE WHEN r.montant_total_remboursement = t.montant THEN 1 END) as logique_correcte,
    COUNT(CASE WHEN r.montant_total_remboursement != t.montant THEN 1 END) as logique_incorrecte,
    ROUND(
        (COUNT(CASE WHEN r.montant_total_remboursement = t.montant THEN 1 END)::DECIMAL / 
         NULLIF(COUNT(*), 0)) * 100, 2
    ) as pourcentage_correct
FROM remboursements r
JOIN transactions t ON r.transaction_id = t.id;

-- 2. DÉTAIL DES CAS INCORRECTS (s'il y en a)
SELECT 
    '=== CAS INCORRECTS (à corriger) ===' as problemes,
    r.id as remboursement_id,
    t.montant as transaction_montant_demande,
    r.montant_total_remboursement as remb_montant_total,
    r.frais_service as remb_frais_service,
    (t.montant - r.montant_total_remboursement) as difference,
    r.commentaire_admin
FROM remboursements r
JOIN transactions t ON r.transaction_id = t.id
WHERE r.montant_total_remboursement != t.montant;

-- 3. VALIDATION DES FRAIS (doivent être 6.5% du montant demandé)
SELECT 
    '=== VALIDATION DES FRAIS ===' as validation_frais,
    COUNT(*) as total_remboursements,
    COUNT(CASE WHEN ABS(r.frais_service - ROUND(t.montant * 0.065, 2)) < 0.01 THEN 1 END) as frais_corrects,
    COUNT(CASE WHEN ABS(r.frais_service - ROUND(t.montant * 0.065, 2)) >= 0.01 THEN 1 END) as frais_incorrects
FROM remboursements r
JOIN transactions t ON r.transaction_id = t.id;

-- 4. EXEMPLES CONCRETS DE LA LOGIQUE ZALAMA
SELECT 
    '=== EXEMPLES LOGIQUE ZALAMA ===' as exemples,
    t.montant as "1_Montant_Demandé_GNF",
    r.frais_service as "2_Frais_ZaLaMa_GNF",
    (t.montant - r.frais_service) as "3_Reçu_Employé_GNF",
    r.montant_total_remboursement as "4_Rembourse_Partenaire_GNF",
    CASE 
        WHEN r.montant_total_remboursement = t.montant THEN '✅ CORRECT'
        ELSE '❌ INCORRECT'
    END as "5_Validation"
FROM remboursements r
JOIN transactions t ON r.transaction_id = t.id
ORDER BY t.montant DESC
LIMIT 5;

-- 5. RÉSUMÉ FINAL
DO $$
DECLARE
    total_count INTEGER;
    correct_count INTEGER;
    percentage DECIMAL;
BEGIN
    -- Compter les remboursements
    SELECT COUNT(*) INTO total_count 
    FROM remboursements r
    JOIN transactions t ON r.transaction_id = t.id;
    
    SELECT COUNT(*) INTO correct_count 
    FROM remboursements r
    JOIN transactions t ON r.transaction_id = t.id
    WHERE r.montant_total_remboursement = t.montant;
    
    IF total_count > 0 THEN
        percentage := ROUND((correct_count::DECIMAL / total_count) * 100, 2);
    ELSE
        percentage := 0;
    END IF;
    
    RAISE NOTICE '';
    RAISE NOTICE '🎯 ==========================================';
    RAISE NOTICE '🎯 RÉSUMÉ VALIDATION LOGIQUE ZALAMA';
    RAISE NOTICE '🎯 ==========================================';
    RAISE NOTICE '';
    RAISE NOTICE '📊 Total remboursements: %', total_count;
    RAISE NOTICE '✅ Logique correcte: %', correct_count;
    RAISE NOTICE '❌ Logique incorrecte: %', (total_count - correct_count);
    RAISE NOTICE '📈 Pourcentage correct: %%%', percentage;
    RAISE NOTICE '';
    
    IF percentage = 100 THEN
        RAISE NOTICE '🎉 PARFAIT ! Tous les remboursements respectent la logique ZaLaMa !';
        RAISE NOTICE '✅ Le système est prêt pour la production';
    ELSIF percentage >= 90 THEN
        RAISE NOTICE '👍 TRÈS BON ! La plupart des remboursements sont corrects';
        RAISE NOTICE '🔧 Quelques corrections mineures nécessaires';
    ELSIF percentage >= 50 THEN
        RAISE NOTICE '⚠️ MOYEN : Plusieurs remboursements nécessitent une correction';
        RAISE NOTICE '🔧 Exécutez fix_existing_remboursements_montants.sql';
    ELSE
        RAISE NOTICE '❌ PROBLÈME : La majorité des remboursements sont incorrects';
        RAISE NOTICE '🚨 Vérifiez la configuration du trigger et les API';
    END IF;
    
    RAISE NOTICE '';
    RAISE NOTICE '🔄 Pour corriger les problèmes:';
    RAISE NOTICE '   1. Exécutez fix_existing_remboursements_montants.sql';
    RAISE NOTICE '   2. Vérifiez que le nouveau trigger est actif';
    RAISE NOTICE '   3. Testez avec une nouvelle transaction';
    RAISE NOTICE '';
END $$; 
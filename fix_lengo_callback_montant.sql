-- ============================================================================
-- CORRECTION URGENTE : Montants modifiés par le callback LengoPay
-- ============================================================================

DO $$ 
BEGIN 
    RAISE NOTICE '=== CORRECTION DES MONTANTS MODIFIÉS PAR CALLBACK ===';
    RAISE NOTICE 'Problème: handleLengoPayCallback remplace montant par amount reçu';
END $$;

-- 1. DIAGNOSTIC DES TRANSACTIONS MODIFIÉES
SELECT 
    '=== TRANSACTIONS MODIFIÉES PAR CALLBACK ===' as diagnostic,
    t.id,
    t.montant as montant_actuel,
    sar.montant_demande as montant_demande_original,
    t.numero_transaction,
    t.statut,
    t.created_at,
    t.updated_at,
    CASE 
        WHEN t.montant = sar.montant_demande THEN '✅ CORRECT'
        WHEN t.montant = (sar.montant_demande * 0.935) THEN '❌ MODIFIÉ PAR CALLBACK (montant net)'
        ELSE '❌ AUTRE MODIFICATION'
    END as diagnostic_montant
FROM transactions t
JOIN salary_advance_requests sar ON t.demande_avance_id = sar.id
WHERE t.montant != sar.montant_demande
ORDER BY t.created_at DESC;

-- 2. CORRECTION DES MONTANTS
DO $$
DECLARE
    transaction_record RECORD;
    corrected_count INTEGER := 0;
BEGIN
    RAISE NOTICE '=== DÉBUT DE LA CORRECTION ===';
    
    FOR transaction_record IN 
        SELECT 
            t.id,
            t.montant as montant_actuel,
            sar.montant_demande as montant_correct
        FROM transactions t
        JOIN salary_advance_requests sar ON t.demande_avance_id = sar.id
        WHERE t.montant != sar.montant_demande
    LOOP
        -- Corriger le montant
        UPDATE transactions 
        SET 
            montant = transaction_record.montant_correct,
            updated_at = NOW()
        WHERE id = transaction_record.id;
        
        corrected_count := corrected_count + 1;
        RAISE NOTICE 'Corrigé transaction %: % → % GNF', 
                     transaction_record.id, 
                     transaction_record.montant_actuel, 
                     transaction_record.montant_correct;
    END LOOP;
    
    RAISE NOTICE '=== CORRECTION TERMINÉE ===';
    RAISE NOTICE 'Nombre de transactions corrigées: %', corrected_count;
END $$;

-- 3. VÉRIFICATION APRÈS CORRECTION
SELECT 
    '=== VÉRIFICATION APRÈS CORRECTION ===' as verification,
    t.id,
    t.montant as montant_corrige,
    sar.montant_demande as montant_demande,
    CASE 
        WHEN t.montant = sar.montant_demande THEN '✅ CORRECT'
        ELSE '❌ ENCORE INCORRECT'
    END as statut_final
FROM transactions t
JOIN salary_advance_requests sar ON t.demande_avance_id = sar.id
ORDER BY t.updated_at DESC;

-- 4. INSTRUCTIONS POUR CORRIGER LE CODE
DO $$ 
BEGIN 
    RAISE NOTICE '';
    RAISE NOTICE '🎯 ==========================================';
    RAISE NOTICE '🎯 CORRECTION TERMINÉE';
    RAISE NOTICE '🎯 ==========================================';
    RAISE NOTICE '';
    RAISE NOTICE '✅ Toutes les transactions corrigées';
    RAISE NOTICE '';
    RAISE NOTICE '🔧 PROCHAINES ÉTAPES:';
    RAISE NOTICE '   1. Corriger le code handleLengoPayCallback';
    RAISE NOTICE '   2. Supprimer la ligne: montant: amount';
    RAISE NOTICE '   3. Garder seulement: statut, numero_reception, etc.';
    RAISE NOTICE '';
    RAISE NOTICE '📋 FICHIER À MODIFIER:';
    RAISE NOTICE '   services/lengoPayService.ts ligne ~250';
    RAISE NOTICE '';
    RAISE NOTICE 'MAINTENANT : Testez une nouvelle demande !';
END $$; 
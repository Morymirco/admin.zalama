-- ============================================================================
-- CORRECTION URGENTE : Montants incorrects dans table TRANSACTIONS
-- ============================================================================
-- OBJECTIF : Mettre les montants des transactions = montants des demandes originales

-- 1. SAUVEGARDE AVANT CORRECTION
CREATE TABLE IF NOT EXISTS transactions_backup_before_fix AS
SELECT * FROM transactions WHERE demande_avance_id IS NOT NULL;

DO $$ 
BEGIN 
    RAISE NOTICE '=== SAUVEGARDE CRÉÉE ===';
    RAISE NOTICE 'Table: transactions_backup_before_fix';
END $$;

-- 2. DIAGNOSTIC AVANT CORRECTION
DO $$ 
BEGIN 
    RAISE NOTICE '=== DIAGNOSTIC AVANT CORRECTION ===';
END $$;

SELECT 
    COUNT(*) as total_transactions,
    COUNT(CASE WHEN t.montant = sar.montant_demande THEN 1 END) as corrects,
    COUNT(CASE WHEN t.montant != sar.montant_demande THEN 1 END) as incorrects,
    ROUND(
        COUNT(CASE WHEN t.montant = sar.montant_demande THEN 1 END)::DECIMAL / 
        NULLIF(COUNT(*), 0) * 100, 2
    ) as pourcentage_correct
FROM transactions t
JOIN salary_advance_requests sar ON t.demande_avance_id = sar.id;

-- 3. AFFICHER LES TRANSACTIONS QUI SERONT CORRIGÉES
DO $$ 
BEGIN 
    RAISE NOTICE '=== TRANSACTIONS QUI SERONT CORRIGÉES ===';
END $$;

SELECT 
    t.id,
    t.montant as ancien_montant_incorrect,
    sar.montant_demande as nouveau_montant_correct,
    (sar.montant_demande - t.montant) as correction_appliquee
FROM transactions t
JOIN salary_advance_requests sar ON t.demande_avance_id = sar.id
WHERE t.montant != sar.montant_demande
ORDER BY t.date_creation DESC;

-- 4. CORRECTION AUTOMATIQUE
DO $$ 
DECLARE 
    affected_rows INTEGER;
BEGIN 
    RAISE NOTICE '=== DÉBUT DE LA CORRECTION ===';
    
    -- Mettre à jour les montants des transactions
    UPDATE transactions 
    SET montant = sar.montant_demande
    FROM salary_advance_requests sar 
    WHERE transactions.demande_avance_id = sar.id
    AND transactions.montant != sar.montant_demande;
    
    GET DIAGNOSTICS affected_rows = ROW_COUNT;
    RAISE NOTICE '✅ Correction terminée: % transactions mises à jour', affected_rows;
END $$;

-- 5. VÉRIFICATION APRÈS CORRECTION
DO $$ 
BEGIN 
    RAISE NOTICE '=== VÉRIFICATION APRÈS CORRECTION ===';
END $$;

SELECT 
    COUNT(*) as total_transactions,
    COUNT(CASE WHEN t.montant = sar.montant_demande THEN 1 END) as corrects,
    COUNT(CASE WHEN t.montant != sar.montant_demande THEN 1 END) as incorrects,
    CASE 
        WHEN COUNT(CASE WHEN t.montant != sar.montant_demande THEN 1 END) = 0 
        THEN '✅ TOUTES LES TRANSACTIONS SONT CORRECTES'
        ELSE '❌ CERTAINES TRANSACTIONS RESTENT INCORRECTES'
    END as statut_final
FROM transactions t
JOIN salary_advance_requests sar ON t.demande_avance_id = sar.id;

-- 6. AFFICHER LES TRANSACTIONS CORRIGÉES
DO $$ 
BEGIN 
    RAISE NOTICE '=== TRANSACTIONS APRÈS CORRECTION ===';
END $$;

SELECT 
    t.id,
    t.montant as montant_final,
    sar.montant_demande as montant_demande_original,
    CASE 
        WHEN t.montant = sar.montant_demande THEN '✅ CORRECT'
        ELSE '❌ ENCORE INCORRECT'
    END as statut
FROM transactions t
JOIN salary_advance_requests sar ON t.demande_avance_id = sar.id
ORDER BY t.date_creation DESC
LIMIT 10;

-- 7. NETTOYAGE (optionnel)
-- Décommentez cette ligne si vous voulez supprimer la sauvegarde
-- DROP TABLE IF EXISTS transactions_backup_before_fix; 
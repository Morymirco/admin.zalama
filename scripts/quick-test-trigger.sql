-- =====================================================
-- TEST RAPIDE DU TRIGGER DE REMBOURSEMENTS
-- =====================================================

-- 1. Vérifier que le trigger existe
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.triggers 
        WHERE trigger_name = 'trigger_auto_remboursement'
        AND trigger_schema = 'public'
    ) THEN
        RAISE NOTICE '✅ Trigger trigger_auto_remboursement existe';
    ELSE
        RAISE NOTICE '❌ Trigger trigger_auto_remboursement manquant';
    END IF;
END $$;

-- 2. Vérifier que la fonction existe
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_proc 
        WHERE proname = 'create_automatic_reimbursement'
    ) THEN
        RAISE NOTICE '✅ Fonction create_automatic_reimbursement existe';
    ELSE
        RAISE NOTICE '❌ Fonction create_automatic_reimbursement manquante';
    END IF;
END $$;

-- 3. Test simple avec données existantes
DO $$
DECLARE
    test_transaction_id UUID;
    remboursement_count_before INTEGER;
    remboursement_count_after INTEGER;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🧪 TEST RAPIDE DU TRIGGER';
    RAISE NOTICE '========================';
    
    -- Compter les remboursements avant
    SELECT COUNT(*) INTO remboursement_count_before FROM remboursements;
    RAISE NOTICE '📊 Remboursements avant: %', remboursement_count_before;
    
    -- Créer une transaction de test simple
    INSERT INTO transactions (
        id,
        employe_id,
        entreprise_id,
        montant,
        numero_transaction,
        methode_paiement,
        statut,
        date_transaction
    ) VALUES (
        gen_random_uuid(),
        (SELECT id FROM employees LIMIT 1),
        (SELECT id FROM partners LIMIT 1),
        50000, -- 50,000 FCFA
        'TEST_QUICK_' || EXTRACT(epoch FROM NOW()),
        'MOBILE_MONEY',
        'EFFECTUEE', -- Déclenche le trigger
        NOW()
    ) RETURNING id INTO test_transaction_id;
    
    RAISE NOTICE '✅ Transaction test créée: %', test_transaction_id;
    
    -- Attendre que le trigger s'exécute
    PERFORM pg_sleep(1);
    
    -- Compter les remboursements après
    SELECT COUNT(*) INTO remboursement_count_after FROM remboursements;
    RAISE NOTICE '📊 Remboursements après: %', remboursement_count_after;
    
    -- Vérifier le résultat
    IF remboursement_count_after > remboursement_count_before THEN
        RAISE NOTICE '🎉 SUCCESS: Trigger fonctionne!';
        
        -- Afficher le remboursement créé
        PERFORM (
            SELECT RAISE NOTICE '   Remboursement ID: %', r.id
            FROM remboursements r 
            WHERE r.transaction_id = test_transaction_id
            LIMIT 1
        );
        
    ELSE
        RAISE NOTICE '❌ ÉCHEC: Aucun remboursement créé';
    END IF;
    
    -- Nettoyer
    DELETE FROM remboursements WHERE transaction_id = test_transaction_id;
    DELETE FROM transactions WHERE id = test_transaction_id;
    
    RAISE NOTICE '🧹 Données de test nettoyées';
    RAISE NOTICE '';
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '❌ ERREUR DANS LE TEST: %', SQLERRM;
END $$;

-- 4. Statut final
SELECT 
    'TEST TERMINÉ' as status,
    'Vérifiez les messages ci-dessus' as instruction; 
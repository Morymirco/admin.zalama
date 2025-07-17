-- =====================================================
-- TEST DU TRIGGER DE REMBOURSEMENTS AUTOMATIQUES
-- =====================================================

-- 1. DIAGNOSTIC PRÉLIMINAIRE
SELECT 
    'TEST PRÉLIMINAIRE' as phase,
    'Vérification des prérequis' as action;

-- Vérifier que le trigger existe
SELECT 
    trigger_name,
    event_object_table,
    action_timing,
    event_manipulation
FROM information_schema.triggers 
WHERE trigger_name = 'trigger_auto_remboursement'
AND trigger_schema = 'public';

-- Vérifier que la fonction existe
SELECT 
    proname as function_name,
    'Fonction existe' as status
FROM pg_proc 
WHERE proname = 'create_automatic_reimbursement';

-- 2. CRÉER UNE TRANSACTION DE TEST
DO $$
DECLARE
    test_employee_id UUID;
    test_partner_id UUID;
    test_demande_id UUID;
    test_transaction_id UUID;
    remboursement_count_before INTEGER;
    remboursement_count_after INTEGER;
    test_result TEXT;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🧪 DÉBUT DU TEST DU TRIGGER';
    RAISE NOTICE '================================';
    
    -- Obtenir un employé et un partenaire existants
    SELECT id INTO test_employee_id FROM employees LIMIT 1;
    SELECT id INTO test_partner_id FROM partners LIMIT 1;
    
    IF test_employee_id IS NULL THEN
        RAISE NOTICE '❌ Aucun employé trouvé - Création d''un employé de test';
        INSERT INTO employees (id, nom, prenom, email, telephone, partner_id) 
        VALUES (gen_random_uuid(), 'Test', 'Employee', 'test@test.com', '123456789', test_partner_id)
        RETURNING id INTO test_employee_id;
    END IF;
    
    IF test_partner_id IS NULL THEN
        RAISE NOTICE '❌ Aucun partenaire trouvé - Création d''un partenaire de test';
        INSERT INTO partners (id, nom, email, telephone) 
        VALUES (gen_random_uuid(), 'Partenaire Test', 'partner@test.com', '987654321')
        RETURNING id INTO test_partner_id;
    END IF;
    
    RAISE NOTICE '✅ Employé test: %', test_employee_id;
    RAISE NOTICE '✅ Partenaire test: %', test_partner_id;
    
    -- Créer une demande d'avance de test
    INSERT INTO salary_advance_requests (
        id,
        employe_id,
        partenaire_id,
        montant_demande,
        motif,
        type_motif,
        statut,
        frais_service,
        numero_reception
    ) VALUES (
        gen_random_uuid(),
        test_employee_id,
        test_partner_id,
        100000, -- 100,000 FCFA
        'Test trigger remboursement',
        'Urgence',
        'Validé',
        6500, -- 6.5% de frais
        '+224123456789'
    ) RETURNING id INTO test_demande_id;
    
    RAISE NOTICE '✅ Demande d''avance créée: %', test_demande_id;
    
    -- Compter les remboursements avant
    SELECT COUNT(*) INTO remboursement_count_before FROM remboursements;
    RAISE NOTICE '📊 Remboursements avant test: %', remboursement_count_before;
    
    -- Créer une transaction EFFECTUEE (ceci devrait déclencher le trigger)
    RAISE NOTICE '';
    RAISE NOTICE '🚀 CRÉATION DE LA TRANSACTION (déclenchement du trigger)';
    RAISE NOTICE '-----------------------------------------------------------';
    
    INSERT INTO transactions (
        id,
        employe_id,
        entreprise_id,
        demande_avance_id,
        montant,
        numero_transaction,
        methode_paiement,
        statut,
        date_transaction,
        numero_reception
    ) VALUES (
        gen_random_uuid(),
        test_employee_id,
        test_partner_id,
        test_demande_id,
        100000, -- 100,000 FCFA
        'TEST_TRIGGER_' || EXTRACT(epoch FROM NOW()),
        'MOBILE_MONEY',
        'EFFECTUEE', -- ⚡ Ceci devrait déclencher le trigger
        NOW(),
        '+224123456789'
    ) RETURNING id INTO test_transaction_id;
    
    RAISE NOTICE '✅ Transaction créée: %', test_transaction_id;
    RAISE NOTICE '';
    
    -- Attendre un peu pour que le trigger s'exécute
    PERFORM pg_sleep(1);
    
    -- Compter les remboursements après
    SELECT COUNT(*) INTO remboursement_count_after FROM remboursements;
    RAISE NOTICE '📊 Remboursements après test: %', remboursement_count_after;
    
    -- Vérifier le résultat
    IF remboursement_count_after > remboursement_count_before THEN
        test_result := '🎉 TEST RÉUSSI - Remboursement créé automatiquement!';
        
        -- Afficher les détails du remboursement créé
        RAISE NOTICE '';
        RAISE NOTICE '📋 DÉTAILS DU REMBOURSEMENT CRÉÉ:';
        RAISE NOTICE '-----------------------------------';
        
        PERFORM (
            SELECT RAISE NOTICE '   ID: %', r.id
            FROM remboursements r 
            WHERE r.transaction_id = test_transaction_id
        );
        
        PERFORM (
            SELECT RAISE NOTICE '   Montant transaction: % FCFA', r.montant_transaction
            FROM remboursements r 
            WHERE r.transaction_id = test_transaction_id
        );
        
        PERFORM (
            SELECT RAISE NOTICE '   Frais service: % FCFA', r.frais_service
            FROM remboursements r 
            WHERE r.transaction_id = test_transaction_id
        );
        
        PERFORM (
            SELECT RAISE NOTICE '   Montant total: % FCFA', r.montant_total_remboursement
            FROM remboursements r 
            WHERE r.transaction_id = test_transaction_id
        );
        
        PERFORM (
            SELECT RAISE NOTICE '   Statut: %', r.statut
            FROM remboursements r 
            WHERE r.transaction_id = test_transaction_id
        );
        
        PERFORM (
            SELECT RAISE NOTICE '   Date limite: %', r.date_limite_remboursement
            FROM remboursements r 
            WHERE r.transaction_id = test_transaction_id
        );
        
    ELSE
        test_result := '❌ TEST ÉCHOUÉ - Aucun remboursement créé';
    END IF;
    
    RAISE NOTICE '';
    RAISE NOTICE '%', test_result;
    RAISE NOTICE '';
    
    -- Nettoyer les données de test
    RAISE NOTICE '🧹 NETTOYAGE DES DONNÉES DE TEST';
    RAISE NOTICE '=================================';
    
    DELETE FROM remboursements WHERE transaction_id = test_transaction_id;
    RAISE NOTICE '✅ Remboursement de test supprimé';
    
    DELETE FROM transactions WHERE id = test_transaction_id;
    RAISE NOTICE '✅ Transaction de test supprimée';
    
    DELETE FROM salary_advance_requests WHERE id = test_demande_id;
    RAISE NOTICE '✅ Demande d''avance de test supprimée';
    
    -- Ne pas supprimer les employés/partenaires car ils peuvent être réels
    
    RAISE NOTICE '';
    RAISE NOTICE '🏁 TEST TERMINÉ';
    
END $$;

-- 3. VÉRIFICATION FINALE
SELECT 
    'TEST TERMINÉ' as phase,
    'Vérification que le trigger est actif' as action;

-- Afficher l'état du trigger
SELECT 
    t.tgname as trigger_name,
    c.relname as table_name,
    CASE t.tgenabled
        WHEN 'O' THEN '✅ ACTIF'
        WHEN 'D' THEN '❌ DÉSACTIVÉ'
        ELSE '❓ INCONNU'
    END as status
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
WHERE t.tgname = 'trigger_auto_remboursement';

-- Message final
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '💡 POUR TESTER MANUELLEMENT:';
    RAISE NOTICE '1. Créez une transaction avec statut "EN_ATTENTE"';
    RAISE NOTICE '2. Changez le statut vers "EFFECTUEE"';
    RAISE NOTICE '3. Vérifiez qu''un remboursement a été créé automatiquement';
    RAISE NOTICE '';
END $$; 
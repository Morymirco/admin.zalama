-- ============================================================================
-- SCRIPT DE TEST COMPLET : Flux ZaLaMa de A à Z
-- ============================================================================

-- 🧹 NETTOYAGE INITIAL (pour un test propre)
DO $$
DECLARE
    test_partner_id UUID;
    test_employee_id UUID;
    test_request_id UUID;
    test_transaction_id UUID;
BEGIN
    -- Nettoyer les données de test précédentes
    DELETE FROM remboursements WHERE commentaire_admin LIKE '%TEST_ZALAMA%';
    DELETE FROM transactions WHERE description LIKE '%TEST_ZALAMA%';
    DELETE FROM salary_advance_requests WHERE motif LIKE '%TEST_ZALAMA%';
    DELETE FROM employees WHERE nom = 'TESTEUR';
    DELETE FROM partners WHERE nom = 'ENTREPRISE_TEST_ZALAMA';
    
    RAISE NOTICE '🧹 Nettoyage des données de test précédentes terminé';
END $$;

-- ============================================================================
-- ÉTAPE 1: CRÉER UN PARTENAIRE TEST
-- ============================================================================

INSERT INTO partners (
    id,
    nom,
    email,
    telephone,
    adresse,
    secteur_activite,
    nombre_employes,
    statut,
    date_creation,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    'ENTREPRISE_TEST_ZALAMA',
    'test@entreprise-zalama.com',
    '224612345678',
    'Conakry, Guinée - Zone Test',
    'Technologie',
    50,
    'ACTIF',
    NOW(),
    NOW(),
    NOW()
) RETURNING id AS partner_id;

-- Récupérer l'ID du partenaire créé
DO $$
DECLARE
    test_partner_id UUID;
BEGIN
    SELECT id INTO test_partner_id 
    FROM partners 
    WHERE nom = 'ENTREPRISE_TEST_ZALAMA' 
    LIMIT 1;
    
    RAISE NOTICE '✅ ÉTAPE 1: Partenaire créé avec ID: %', test_partner_id;
END $$;

-- ============================================================================
-- ÉTAPE 2: CRÉER UN EMPLOYÉ TEST
-- ============================================================================

DO $$
DECLARE
    test_partner_id UUID;
    test_employee_id UUID;
BEGIN
    -- Récupérer l'ID du partenaire
    SELECT id INTO test_partner_id 
    FROM partners 
    WHERE nom = 'ENTREPRISE_TEST_ZALAMA' 
    LIMIT 1;
    
    -- Créer l'employé
    INSERT INTO employees (
        id,
        partner_id,
        nom,
        prenom,
        email,
        telephone,
        poste,
        salaire_brut,
        salaire_net,
        date_embauche,
        statut,
        created_at,
        updated_at
    ) VALUES (
        gen_random_uuid(),
        test_partner_id,
        'TESTEUR',
        'ZaLaMa',
        'testeur@zalama-test.com',
        '224698765432',
        'Développeur Test',
        3000000.00,  -- 3M GNF brut
        2500000.00,  -- 2.5M GNF net
        CURRENT_DATE - INTERVAL '6 months',
        'ACTIF',
        NOW(),
        NOW()
    ) RETURNING id INTO test_employee_id;
    
    RAISE NOTICE '✅ ÉTAPE 2: Employé créé avec ID: %', test_employee_id;
    RAISE NOTICE '   - Nom: TESTEUR ZaLaMa';
    RAISE NOTICE '   - Salaire net: 2,500,000 GNF';
    RAISE NOTICE '   - Partenaire ID: %', test_partner_id;
END $$;

-- ============================================================================
-- ÉTAPE 3: CRÉER UNE DEMANDE D'AVANCE TEST
-- ============================================================================

DO $$
DECLARE
    test_partner_id UUID;
    test_employee_id UUID;
    test_request_id UUID;
    montant_demande DECIMAL := 500000.00; -- 500K GNF
    frais_service DECIMAL;
    montant_total DECIMAL;
BEGIN
    -- Récupérer les IDs
    SELECT id INTO test_partner_id FROM partners WHERE nom = 'ENTREPRISE_TEST_ZALAMA' LIMIT 1;
    SELECT id INTO test_employee_id FROM employees WHERE nom = 'TESTEUR' LIMIT 1;
    
    -- Calculer les frais et montant total
    frais_service := ROUND(montant_demande * 0.065, 2); -- 6.5%
    montant_total := montant_demande + frais_service;
    
    -- Créer la demande d'avance
    INSERT INTO salary_advance_requests (
        id,
        employe_id,
        partenaire_id,
        montant_demande,
        frais_service,
        montant_total,
        type_motif,
        motif,
        numero_reception,
        salaire_disponible,
        avance_disponible,
        statut,
        date_demande,
        created_at,
        updated_at
    ) VALUES (
        gen_random_uuid(),
        test_employee_id,
        test_partner_id,
        montant_demande,
        frais_service,
        montant_total,
        'Urgence familiale',
        'TEST_ZALAMA - Demande d''avance pour test complet du système',
        '224698765432',
        2500000.00,  -- Salaire disponible
        1250000.00,  -- 50% du salaire en avance max
        'En attente',
        NOW(),
        NOW(),
        NOW()
    ) RETURNING id INTO test_request_id;
    
    RAISE NOTICE '✅ ÉTAPE 3: Demande d''avance créée avec ID: %', test_request_id;
    RAISE NOTICE '   - Montant demandé: % GNF', montant_demande;
    RAISE NOTICE '   - Frais service (6.5%%): % GNF', frais_service;
    RAISE NOTICE '   - Montant total: % GNF', montant_total;
    RAISE NOTICE '   - Employé reçoit: % GNF (montant demandé - frais)', (montant_demande - frais_service);
END $$;

-- ============================================================================
-- ÉTAPE 4: CRÉER UNE TRANSACTION TEST (SIMULER PAIEMENT LENGO)
-- ============================================================================

DO $$
DECLARE
    test_partner_id UUID;
    test_employee_id UUID;
    test_request_id UUID;
    test_transaction_id UUID;
    montant_demande DECIMAL := 500000.00;
    frais_service DECIMAL;
    montant_net_employe DECIMAL;
    fake_pay_id TEXT;
BEGIN
    -- Récupérer les IDs
    SELECT id INTO test_partner_id FROM partners WHERE nom = 'ENTREPRISE_TEST_ZALAMA' LIMIT 1;
    SELECT id INTO test_employee_id FROM employees WHERE nom = 'TESTEUR' LIMIT 1;
    SELECT id INTO test_request_id FROM salary_advance_requests 
    WHERE motif LIKE '%TEST_ZALAMA%' LIMIT 1;
    
    -- Calculer montant net pour l'employé (logique ZaLaMa)
    frais_service := ROUND(montant_demande * 0.065, 2);
    montant_net_employe := montant_demande - frais_service;
    
    -- Générer un pay_id de test
    fake_pay_id := 'TEST_ZALAMA_' || substr(test_request_id::text, 1, 8);
    
    -- Créer la transaction (STATUT INITIAL: ANNULEE)
    INSERT INTO transactions (
        id,
        montant,
        numero_transaction,
        methode_paiement,
        numero_compte,
        description,
        entreprise_id,
        demande_avance_id,
        employe_id,
        statut,
        date_creation,
        date_transaction,
        created_at,
        updated_at
    ) VALUES (
        gen_random_uuid(),
        montant_demande,  -- ✅ IMPORTANT: On stocke le montant demandé (pas le net)
        fake_pay_id,
        'MOBILE_MONEY',
        '224698765432',
        'TEST_ZALAMA - Avance sur salaire - Employé TESTEUR ZaLaMa',
        test_partner_id,
        test_request_id,
        test_employee_id,
        'ANNULEE',  -- Statut initial avant confirmation LengoPay
        NOW(),
        NULL,  -- Pas de date_transaction encore
        NOW(),
        NOW()
    ) RETURNING id INTO test_transaction_id;
    
    RAISE NOTICE '✅ ÉTAPE 4: Transaction créée avec ID: %', test_transaction_id;
    RAISE NOTICE '   - Pay ID: %', fake_pay_id;
    RAISE NOTICE '   - Montant stocké: % GNF (montant demandé)', montant_demande;
    RAISE NOTICE '   - Montant net employé: % GNF (ce qu''il reçoit)', montant_net_employe;
    RAISE NOTICE '   - Statut initial: ANNULEE (en attente confirmation)';
END $$;

-- ============================================================================
-- ÉTAPE 5: SIMULER LE SUCCÈS DU PAIEMENT (DÉCLENCHER LE TRIGGER)
-- ============================================================================

DO $$
DECLARE
    test_transaction_id UUID;
    remboursement_count_before INTEGER;
    remboursement_count_after INTEGER;
BEGIN
    -- Compter les remboursements avant
    SELECT COUNT(*) INTO remboursement_count_before 
    FROM remboursements 
    WHERE commentaire_admin LIKE '%TEST_ZALAMA%';
    
    -- Récupérer l'ID de la transaction de test
    SELECT t.id INTO test_transaction_id 
    FROM transactions t
    WHERE t.description LIKE '%TEST_ZALAMA%' 
    LIMIT 1;
    
    RAISE NOTICE '🔥 ÉTAPE 5: SIMULATION DU SUCCÈS PAIEMENT';
    RAISE NOTICE '   - Remboursements avant: %', remboursement_count_before;
    RAISE NOTICE '   - Transaction ID: %', test_transaction_id;
    
    -- ✅ MOMENT CRUCIAL: Mettre à jour le statut vers EFFECTUEE
    -- Ceci va déclencher le trigger create_automatic_reimbursement()
    UPDATE transactions 
    SET 
        statut = 'EFFECTUEE',
        date_transaction = NOW(),
        updated_at = NOW()
    WHERE id = test_transaction_id;
    
    -- Compter les remboursements après
    SELECT COUNT(*) INTO remboursement_count_after 
    FROM remboursements 
    WHERE commentaire_admin LIKE '%TEST_ZALAMA%';
    
    RAISE NOTICE '✅ Mise à jour du statut transaction: ANNULEE → EFFECTUEE';
    RAISE NOTICE '   - Remboursements après: %', remboursement_count_after;
    
    IF remboursement_count_after > remboursement_count_before THEN
        RAISE NOTICE '🎉 TRIGGER FONCTIONNEL: Remboursement automatique créé !';
    ELSE
        RAISE NOTICE '❌ PROBLÈME: Aucun remboursement automatique créé';
    END IF;
END $$;

-- ============================================================================
-- ÉTAPE 6: VÉRIFICATION COMPLÈTE DU RÉSULTAT
-- ============================================================================

SELECT 
    '=== RÉSULTATS DU TEST COMPLET ===' as titre,
    '1. PARTENAIRE' as etape,
    p.nom as nom_partenaire,
    p.email as email_partenaire,
    p.statut as statut_partenaire
FROM partners p 
WHERE p.nom = 'ENTREPRISE_TEST_ZALAMA'

UNION ALL

SELECT 
    NULL as titre,
    '2. EMPLOYÉ' as etape,
    CONCAT(e.nom, ' ', e.prenom) as nom_partenaire,
    e.email as email_partenaire,
    e.statut as statut_partenaire
FROM employees e 
WHERE e.nom = 'TESTEUR'

UNION ALL

SELECT 
    NULL as titre,
    '3. DEMANDE D''AVANCE' as etape,
    CONCAT(sar.montant_demande, ' GNF') as nom_partenaire,
    sar.type_motif as email_partenaire,
    sar.statut as statut_partenaire
FROM salary_advance_requests sar 
WHERE sar.motif LIKE '%TEST_ZALAMA%'

UNION ALL

SELECT 
    NULL as titre,
    '4. TRANSACTION' as etape,
    CONCAT(t.montant, ' GNF') as nom_partenaire,
    t.numero_transaction as email_partenaire,
    t.statut as statut_partenaire
FROM transactions t 
WHERE t.description LIKE '%TEST_ZALAMA%'

UNION ALL

SELECT 
    NULL as titre,
    '5. REMBOURSEMENT AUTO' as etape,
    CONCAT(r.montant_total_remboursement, ' GNF') as nom_partenaire,
    r.methode_remboursement as email_partenaire,
    r.statut as statut_partenaire
FROM remboursements r 
WHERE r.commentaire_admin LIKE '%TEST_ZALAMA%';

-- ============================================================================
-- ÉTAPE 7: VÉRIFICATION DÉTAILLÉE DE LA LOGIQUE FINANCIÈRE
-- ============================================================================

SELECT 
    '=== VÉRIFICATION LOGIQUE FINANCIÈRE ZALAMA ===' as verification,
    t.montant as transaction_montant,
    r.montant_transaction as remb_montant_transaction,
    r.frais_service as remb_frais_service,
    r.montant_total_remboursement as remb_montant_total,
    CASE 
        WHEN r.montant_total_remboursement = t.montant THEN '✅ LOGIQUE CORRECTE'
        ELSE '❌ LOGIQUE INCORRECTE'
    END as validation_logique,
    CASE 
        WHEN r.frais_service = ROUND(t.montant * 0.065, 2) THEN '✅ FRAIS CORRECTS (6.5%)'
        ELSE '❌ FRAIS INCORRECTS'
    END as validation_frais
FROM transactions t
JOIN remboursements r ON t.id = r.transaction_id
WHERE t.description LIKE '%TEST_ZALAMA%';

-- ============================================================================
-- ÉTAPE 8: RÉSUMÉ FINAL DU TEST
-- ============================================================================

DO $$
DECLARE
    partner_exists BOOLEAN;
    employee_exists BOOLEAN;
    request_exists BOOLEAN;
    transaction_exists BOOLEAN;
    transaction_status TEXT;
    reimbursement_exists BOOLEAN;
    reimbursement_amount DECIMAL;
    transaction_amount DECIMAL;
    logic_correct BOOLEAN;
BEGIN
    -- Vérifier chaque étape
    SELECT EXISTS(SELECT 1 FROM partners WHERE nom = 'ENTREPRISE_TEST_ZALAMA') INTO partner_exists;
    SELECT EXISTS(SELECT 1 FROM employees WHERE nom = 'TESTEUR') INTO employee_exists;
    SELECT EXISTS(SELECT 1 FROM salary_advance_requests WHERE motif LIKE '%TEST_ZALAMA%') INTO request_exists;
    
    SELECT EXISTS(SELECT 1 FROM transactions WHERE description LIKE '%TEST_ZALAMA%') INTO transaction_exists;
    SELECT statut INTO transaction_status FROM transactions WHERE description LIKE '%TEST_ZALAMA%' LIMIT 1;
    
    SELECT EXISTS(SELECT 1 FROM remboursements WHERE commentaire_admin LIKE '%TEST_ZALAMA%') INTO reimbursement_exists;
    
    IF reimbursement_exists THEN
        SELECT r.montant_total_remboursement, t.montant 
        INTO reimbursement_amount, transaction_amount
        FROM remboursements r
        JOIN transactions t ON r.transaction_id = t.id
        WHERE r.commentaire_admin LIKE '%TEST_ZALAMA%' 
        LIMIT 1;
        
        logic_correct := (reimbursement_amount = transaction_amount);
    END IF;
    
    RAISE NOTICE '';
    RAISE NOTICE '🎯 ========================================';
    RAISE NOTICE '🎯 RÉSUMÉ FINAL DU TEST ZALAMA';
    RAISE NOTICE '🎯 ========================================';
    RAISE NOTICE '';
    RAISE NOTICE '✅ 1. Partenaire créé: %', CASE WHEN partner_exists THEN 'OUI' ELSE 'NON' END;
    RAISE NOTICE '✅ 2. Employé créé: %', CASE WHEN employee_exists THEN 'OUI' ELSE 'NON' END;
    RAISE NOTICE '✅ 3. Demande d''avance créée: %', CASE WHEN request_exists THEN 'OUI' ELSE 'NON' END;
    RAISE NOTICE '✅ 4. Transaction créée: %', CASE WHEN transaction_exists THEN 'OUI' ELSE 'NON' END;
    RAISE NOTICE '✅ 5. Statut transaction: %', COALESCE(transaction_status, 'N/A');
    RAISE NOTICE '✅ 6. Remboursement automatique: %', CASE WHEN reimbursement_exists THEN 'CRÉÉ' ELSE 'NON CRÉÉ' END;
    
    IF reimbursement_exists THEN
        RAISE NOTICE '✅ 7. Logique financière: %', CASE WHEN logic_correct THEN 'CORRECTE' ELSE 'INCORRECTE' END;
        RAISE NOTICE '   - Montant transaction: % GNF', transaction_amount;
        RAISE NOTICE '   - Montant remboursement: % GNF', reimbursement_amount;
    END IF;
    
    RAISE NOTICE '';
    
    IF partner_exists AND employee_exists AND request_exists AND 
       transaction_exists AND transaction_status = 'EFFECTUEE' AND 
       reimbursement_exists AND logic_correct THEN
        RAISE NOTICE '🎉 TEST RÉUSSI: Tout le flux ZaLaMa fonctionne correctement !';
        RAISE NOTICE '🎉 Le trigger de remboursement automatique est opérationnel !';
    ELSE
        RAISE NOTICE '❌ TEST ÉCHOUÉ: Un ou plusieurs éléments ne fonctionnent pas';
        RAISE NOTICE '❌ Vérifiez les logs ci-dessus pour identifier le problème';
    END IF;
    
    RAISE NOTICE '';
    RAISE NOTICE '🧹 Pour nettoyer les données de test, exécutez:';
    RAISE NOTICE '   DELETE FROM remboursements WHERE commentaire_admin LIKE ''%%TEST_ZALAMA%%'';';
    RAISE NOTICE '   DELETE FROM transactions WHERE description LIKE ''%%TEST_ZALAMA%%'';';
    RAISE NOTICE '   DELETE FROM salary_advance_requests WHERE motif LIKE ''%%TEST_ZALAMA%%'';';
    RAISE NOTICE '   DELETE FROM employees WHERE nom = ''TESTEUR'';';
    RAISE NOTICE '   DELETE FROM partners WHERE nom = ''ENTREPRISE_TEST_ZALAMA'';';
END $$; 
-- ============================================================================
-- SCRIPT DE TEST COMPLET FINAL : Flux ZaLaMa de A à Z (TOUTES CORRECTIONS)
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
    type,
    secteur,
    description,
    nom_representant,
    email_representant,
    telephone_representant,
    nom_rh,
    email_rh,
    telephone_rh,
    rccm,
    nif,
    email,
    telephone,
    adresse,
    site_web,
    logo_url,
    date_adhesion,
    actif,
    nombre_employes,
    salaire_net_total,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    'ENTREPRISE_TEST_ZALAMA',
    'PME',
    'Technologie',
    'Entreprise de test pour valider le système ZaLaMa',
    'Jean TESTEUR',
    'jean.testeur@entreprise-test.com',
    '224612345678',
    'Marie RH',
    'marie.rh@entreprise-test.com',
    '224612345679',
    'RC/CNK/2024/A/TEST',
    'NIF123456789TEST',
    'contact@entreprise-test.com',
    '224612345680',
    'Conakry, Guinée - Zone Test ZaLaMa',
    'https://www.entreprise-test-zalama.com',
    NULL,
    NOW(),
    true,
    50,
    0,
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
    RAISE NOTICE '   - Nom: ENTREPRISE_TEST_ZALAMA';
    RAISE NOTICE '   - Secteur: Technologie';
    RAISE NOTICE '   - RH: Marie RH (marie.rh@entreprise-test.com)';
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
    
    -- Créer l'employé avec les vraies colonnes
    INSERT INTO employees (
        id,
        partner_id,
        nom,
        prenom,
        genre,
        email,
        telephone,
        adresse,
        poste,
        role,
        type_contrat,
        salaire_net,
        date_embauche,
        actif,
        created_at,
        updated_at
    ) VALUES (
        gen_random_uuid(),
        test_partner_id,
        'TESTEUR',
        'ZaLaMa',
        'Homme',
        'testeur@zalama-test.com',
        '224698765432',
        'Conakry, Quartier Test ZaLaMa',
        'Développeur Test',
        'Lead Developer',
        'CDI',
        2500000.00,
        CURRENT_DATE - INTERVAL '6 months',
        true,
        NOW(),
        NOW()
    ) RETURNING id INTO test_employee_id;
    
    RAISE NOTICE '✅ ÉTAPE 2: Employé créé avec ID: %', test_employee_id;
    RAISE NOTICE '   - Nom: TESTEUR ZaLaMa';
    RAISE NOTICE '   - Genre: Homme';
    RAISE NOTICE '   - Contrat: CDI';
    RAISE NOTICE '   - Salaire net: 2,500,000 GNF';
    RAISE NOTICE '   - Partenaire ID: %', test_partner_id;
END $$;

-- ============================================================================
-- ÉTAPE 3: CRÉER UNE DEMANDE D'AVANCE TEST (COLONNES CORRIGÉES)
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
    
    -- ✅ CORRECTION : Utiliser les vraies colonnes de salary_advance_requests
    INSERT INTO salary_advance_requests (
        id,
        employe_id,
        partenaire_id,
        montant_demande,
        type_motif,
        motif,
        numero_reception,
        frais_service,
        montant_total,
        salaire_disponible,
        avance_disponible,
        statut,
        date_creation,          -- ✅ CORRIGÉ : date_creation au lieu de date_demande
        created_at,
        updated_at
    ) VALUES (
        gen_random_uuid(),
        test_employee_id,
        test_partner_id,
        montant_demande,
        'Urgence familiale',    -- type_motif
        'TEST_ZALAMA - Demande d''avance pour test complet du système de remboursement automatique',  -- motif
        '224698765432',         -- numero_reception
        frais_service,          -- frais_service
        montant_total,          -- montant_total
        2500000.00,             -- salaire_disponible
        1250000.00,             -- avance_disponible
        'En attente',           -- statut
        NOW(),                  -- date_creation
        NOW(),                  -- created_at
        NOW()                   -- updated_at
    ) RETURNING id INTO test_request_id;
    
    RAISE NOTICE '✅ ÉTAPE 3: Demande d''avance créée avec ID: %', test_request_id;
    RAISE NOTICE '   - Montant demandé: % GNF', montant_demande;
    RAISE NOTICE '   - Frais service (6.5%%): % GNF', frais_service;
    RAISE NOTICE '   - Montant total: % GNF', montant_total;
    RAISE NOTICE '   - Employé reçoit: % GNF (montant demandé - frais)', (montant_demande - frais_service);
    RAISE NOTICE '   - Partenaire rembourse: % GNF (montant demandé pur)', montant_demande;
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
        'TEST_ZALAMA - Avance sur salaire - Employé TESTEUR ZaLaMa - Test trigger remboursement',
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
    RAISE NOTICE '   - Logique ZaLaMa: Transaction stocke montant demandé, remboursement = montant demandé';
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
    
    RAISE NOTICE '';
    RAISE NOTICE '🔥 ÉTAPE 5: SIMULATION DU SUCCÈS PAIEMENT';
    RAISE NOTICE '   - Remboursements avant: %', remboursement_count_before;
    RAISE NOTICE '   - Transaction ID: %', test_transaction_id;
    RAISE NOTICE '   - Action: Mise à jour ANNULEE → EFFECTUEE';
    RAISE NOTICE '   - Résultat attendu: Trigger crée remboursement automatique';
    
    -- ✅ MOMENT CRUCIAL: Mettre à jour le statut vers EFFECTUEE
    -- Ceci va déclencher le trigger create_automatic_reimbursement()
    UPDATE transactions 
    SET 
        statut = 'EFFECTUEE',
        date_transaction = NOW(),
        updated_at = NOW()
    WHERE id = test_transaction_id;
    
    -- Petite pause pour s'assurer que le trigger s'exécute
    PERFORM pg_sleep(0.1);
    
    -- Compter les remboursements après
    SELECT COUNT(*) INTO remboursement_count_after 
    FROM remboursements 
    WHERE commentaire_admin LIKE '%TEST_ZALAMA%';
    
    RAISE NOTICE '✅ Mise à jour du statut transaction: ANNULEE → EFFECTUEE';
    RAISE NOTICE '   - Remboursements après: %', remboursement_count_after;
    
    IF remboursement_count_after > remboursement_count_before THEN
        RAISE NOTICE '🎉 TRIGGER FONCTIONNEL: Remboursement automatique créé !';
        RAISE NOTICE '   - Nombre de nouveaux remboursements: %', (remboursement_count_after - remboursement_count_before);
    ELSE
        RAISE NOTICE '❌ PROBLÈME: Aucun remboursement automatique créé';
        RAISE NOTICE '❌ Vérifiez que le trigger create_automatic_reimbursement() est actif';
    END IF;
END $$;

-- ============================================================================
-- ÉTAPE 6: VÉRIFICATION COMPLÈTE DU RÉSULTAT
-- ============================================================================

SELECT 
    '=== RÉSULTATS DU TEST COMPLET ===' as titre,
    '1. PARTENAIRE' as etape,
    p.nom as nom_entite,
    p.secteur as detail_1,
    p.email as detail_2,
    CASE WHEN p.actif THEN '✅ ACTIF' ELSE '❌ INACTIF' END as statut
FROM partners p 
WHERE p.nom = 'ENTREPRISE_TEST_ZALAMA'

UNION ALL

SELECT 
    NULL as titre,
    '2. EMPLOYÉ' as etape,
    CONCAT(e.nom, ' ', e.prenom) as nom_entite,
    e.poste as detail_1,
    e.email as detail_2,
    CASE WHEN e.actif THEN '✅ ACTIF' ELSE '❌ INACTIF' END as statut
FROM employees e 
WHERE e.nom = 'TESTEUR'

UNION ALL

SELECT 
    NULL as titre,
    '3. DEMANDE AVANCE' as etape,
    CONCAT(sar.montant_demande, ' GNF') as nom_entite,
    sar.type_motif as detail_1,
    sar.numero_reception as detail_2,
    sar.statut::text as statut   -- ✅ CORRIGÉ : Cast explicite en text
FROM salary_advance_requests sar 
WHERE sar.motif LIKE '%TEST_ZALAMA%'

UNION ALL

SELECT 
    NULL as titre,
    '4. TRANSACTION' as etape,
    CONCAT(t.montant, ' GNF') as nom_entite,
    t.methode_paiement::text as detail_1,   -- ✅ CORRIGÉ : Cast explicite en text
    t.numero_transaction as detail_2,
    t.statut::text as statut    -- ✅ CORRIGÉ : Cast explicite en text
FROM transactions t 
WHERE t.description LIKE '%TEST_ZALAMA%'

UNION ALL

SELECT 
    NULL as titre,
    '5. REMBOURSEMENT' as etape,
    CONCAT(r.montant_total_remboursement, ' GNF') as nom_entite,
    r.methode_remboursement::text as detail_1,   -- ✅ CORRIGÉ : Cast explicite en text
    'Auto-généré' as detail_2,
    r.statut::text as statut    -- ✅ CORRIGÉ : Cast explicite en text
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
    END as validation_frais,
    CASE 
        WHEN r.montant_transaction = t.montant THEN '✅ MONTANT TRANSACTION OK'
        ELSE '❌ MONTANT TRANSACTION INCORRECT'
    END as validation_montant_transaction
FROM transactions t
JOIN remboursements r ON t.id = r.transaction_id
WHERE t.description LIKE '%TEST_ZALAMA%';

-- ============================================================================
-- ÉTAPE 8: RÉSUMÉ FINAL DU TEST AVEC DIAGNOSTIC COMPLET
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
    fees_correct BOOLEAN;
    actual_fees DECIMAL;
    expected_fees DECIMAL;
    trigger_exists BOOLEAN;
BEGIN
    -- Vérifier chaque étape
    SELECT EXISTS(SELECT 1 FROM partners WHERE nom = 'ENTREPRISE_TEST_ZALAMA') INTO partner_exists;
    SELECT EXISTS(SELECT 1 FROM employees WHERE nom = 'TESTEUR') INTO employee_exists;
    SELECT EXISTS(SELECT 1 FROM salary_advance_requests WHERE motif LIKE '%TEST_ZALAMA%') INTO request_exists;
    
    SELECT EXISTS(SELECT 1 FROM transactions WHERE description LIKE '%TEST_ZALAMA%') INTO transaction_exists;
    SELECT statut::text INTO transaction_status FROM transactions WHERE description LIKE '%TEST_ZALAMA%' LIMIT 1;
    
    SELECT EXISTS(SELECT 1 FROM remboursements WHERE commentaire_admin LIKE '%TEST_ZALAMA%') INTO reimbursement_exists;
    
    -- Vérifier si le trigger existe
    SELECT EXISTS(
        SELECT 1 FROM information_schema.triggers 
        WHERE trigger_name = 'trigger_create_automatic_reimbursement'
    ) INTO trigger_exists;
    
    IF reimbursement_exists THEN
        SELECT r.montant_total_remboursement, t.montant, r.frais_service
        INTO reimbursement_amount, transaction_amount, actual_fees
        FROM remboursements r
        JOIN transactions t ON r.transaction_id = t.id
        WHERE r.commentaire_admin LIKE '%TEST_ZALAMA%' 
        LIMIT 1;
        
        expected_fees := ROUND(transaction_amount * 0.065, 2);
        logic_correct := (reimbursement_amount = transaction_amount);
        fees_correct := (actual_fees = expected_fees);
    END IF;
    
    RAISE NOTICE '';
    RAISE NOTICE '🎯 ==========================================';
    RAISE NOTICE '🎯 RÉSUMÉ FINAL DU TEST ZALAMA COMPLET';
    RAISE NOTICE '🎯 ==========================================';
    RAISE NOTICE '';
    RAISE NOTICE '✅ 1. Partenaire créé: %', CASE WHEN partner_exists THEN 'OUI ✅' ELSE 'NON ❌' END;
    RAISE NOTICE '✅ 2. Employé créé: %', CASE WHEN employee_exists THEN 'OUI ✅' ELSE 'NON ❌' END;
    RAISE NOTICE '✅ 3. Demande d''avance créée: %', CASE WHEN request_exists THEN 'OUI ✅' ELSE 'NON ❌' END;
    RAISE NOTICE '✅ 4. Transaction créée: %', CASE WHEN transaction_exists THEN 'OUI ✅' ELSE 'NON ❌' END;
    RAISE NOTICE '✅ 5. Statut transaction: %', COALESCE(transaction_status, 'N/A');
    RAISE NOTICE '✅ 6. Trigger exists: %', CASE WHEN trigger_exists THEN 'OUI ✅' ELSE 'NON ❌' END;
    RAISE NOTICE '✅ 7. Remboursement automatique: %', CASE WHEN reimbursement_exists THEN 'CRÉÉ ✅' ELSE 'NON CRÉÉ ❌' END;
    
    IF reimbursement_exists THEN
        RAISE NOTICE '✅ 8. Logique financière: %', CASE WHEN logic_correct THEN 'CORRECTE ✅' ELSE 'INCORRECTE ❌' END;
        RAISE NOTICE '   - Montant transaction: % GNF', transaction_amount;
        RAISE NOTICE '   - Montant remboursement: % GNF', reimbursement_amount;
        RAISE NOTICE '✅ 9. Frais de service: %', CASE WHEN fees_correct THEN 'CORRECTS ✅' ELSE 'INCORRECTS ❌' END;
        RAISE NOTICE '   - Frais calculés: % GNF', actual_fees;
        RAISE NOTICE '   - Frais attendus (6.5%%): % GNF', expected_fees;
    END IF;
    
    RAISE NOTICE '';
    
    IF partner_exists AND employee_exists AND request_exists AND 
       transaction_exists AND transaction_status = 'EFFECTUEE' AND 
       reimbursement_exists AND logic_correct AND fees_correct THEN
        RAISE NOTICE '🎉🎉🎉 TEST RÉUSSI À 100%% ! 🎉🎉🎉';
        RAISE NOTICE '🎉 Tout le flux ZaLaMa fonctionne parfaitement !';
        RAISE NOTICE '🎉 Le trigger de remboursement automatique est opérationnel !';
        RAISE NOTICE '🎉 La logique financière ZaLaMa est correctement implémentée !';
        RAISE NOTICE '🎉 Le système est prêt pour la production !';
    ELSE
        RAISE NOTICE '❌ TEST ÉCHOUÉ PARTIELLEMENT';
        RAISE NOTICE '❌ Un ou plusieurs éléments ne fonctionnent pas correctement';
        RAISE NOTICE '';
        RAISE NOTICE '🔧 DIAGNOSTIC DES PROBLÈMES:';
        
        IF NOT trigger_exists THEN
            RAISE NOTICE '❌ Le trigger create_automatic_reimbursement n''existe pas';
            RAISE NOTICE '🔧 Exécutez d''abord fix_transaction_logic_FINAL.sql';
        END IF;
        
        IF NOT reimbursement_exists THEN
            RAISE NOTICE '❌ Le trigger ne s''exécute pas lors de la mise à jour EFFECTUEE';
            RAISE NOTICE '🔧 Vérifiez que le trigger est actif sur la table transactions';
        END IF;
        
        IF reimbursement_exists AND NOT logic_correct THEN
            RAISE NOTICE '❌ Logique financière incorrecte dans le trigger';
            RAISE NOTICE '🔧 Le montant_total_remboursement doit égaler montant_transaction';
        END IF;
        
        IF reimbursement_exists AND NOT fees_correct THEN
            RAISE NOTICE '❌ Calcul des frais incorrect (doit être 6.5%%)';
            RAISE NOTICE '🔧 Vérifiez la formule ROUND(montant * 0.065, 2)';
        END IF;
    END IF;
    
    RAISE NOTICE '';
    RAISE NOTICE '🧹 COMMANDES DE NETTOYAGE:';
    RAISE NOTICE '   DELETE FROM remboursements WHERE commentaire_admin LIKE ''%%TEST_ZALAMA%%'';';
    RAISE NOTICE '   DELETE FROM transactions WHERE description LIKE ''%%TEST_ZALAMA%%'';';
    RAISE NOTICE '   DELETE FROM salary_advance_requests WHERE motif LIKE ''%%TEST_ZALAMA%%'';';
    RAISE NOTICE '   DELETE FROM employees WHERE nom = ''TESTEUR'';';
    RAISE NOTICE '   DELETE FROM partners WHERE nom = ''ENTREPRISE_TEST_ZALAMA'';';
    RAISE NOTICE '';
    RAISE NOTICE '🔄 Pour refaire le test: Exécutez ce script à nouveau !';
    RAISE NOTICE '📋 Pour corriger les problèmes: Exécutez fix_transaction_logic_FINAL.sql d''abord !';
END $$; 
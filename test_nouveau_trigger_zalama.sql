-- ============================================================================
-- TEST COMPLET : Nouveau trigger ZaLaMa
-- ============================================================================

-- 1. NETTOYAGE DES TESTS PRÉCÉDENTS
DELETE FROM remboursements WHERE transaction_id IN (
    SELECT id FROM transactions WHERE numero_transaction LIKE 'TEST_ZALAMA_%'
);
DELETE FROM transactions WHERE numero_transaction LIKE 'TEST_ZALAMA_%';

-- 2. TEST DU NOUVEAU TRIGGER
DO $$ 
BEGIN 
    RAISE NOTICE '=== DÉBUT DU TEST NOUVEAU TRIGGER ZALAMA ===';
END $$;

-- Créer une transaction de test avec montant 4000 GNF
INSERT INTO transactions (
    id,
    montant,
    numero_transaction,
    methode_paiement,
    numero_compte,
    description,
    entreprise_id,
    statut,
    date_creation
) VALUES (
    gen_random_uuid(),
    4000, -- Test avec 4000 GNF
    'TEST_ZALAMA_' || EXTRACT(EPOCH FROM NOW()),
    'MOBILE_MONEY',
    '+224123456789',
    'Test nouveau trigger ZaLaMa - Vérification logique',
    '35de2272-972a-4a52-b905-909ffce12152',
    'ANNULEE', -- Commencer par ANNULEE
    NOW()
);

-- Vérifier que la transaction est créée
SELECT 
    '1. Transaction créée' as etape,
    montant,
    numero_transaction,
    statut
FROM transactions 
WHERE numero_transaction LIKE 'TEST_ZALAMA_%'
AND date_creation > NOW() - INTERVAL '1 minute';

-- Changer le statut pour déclencher le trigger
UPDATE transactions 
SET 
    statut = 'EFFECTUEE',
    date_transaction = NOW()
WHERE numero_transaction LIKE 'TEST_ZALAMA_%'
AND date_creation > NOW() - INTERVAL '1 minute';

-- 3. VÉRIFICATION COMPLÈTE DU RÉSULTAT
DO $$ 
BEGIN 
    RAISE NOTICE '=== VÉRIFICATION COMPLÈTE ===';
END $$;

SELECT 
    '2. Résultat final' as etape,
    t.montant as "TRANSACTION_MONTANT",
    r.montant_total_remboursement as "REMBOURSEMENT_MONTANT",
    r.frais_service as "FRAIS_ZALAMA",
    -- Calculs attendus pour 4000 GNF
    4000 as "ATTENDU_TRANSACTION",
    4000 as "ATTENDU_REMBOURSEMENT", 
    260 as "ATTENDU_FRAIS_6_5_POURCENT", -- 4000 * 0.065 = 260
    3740 as "ATTENDU_NET_EMPLOYE", -- 4000 - 260 = 3740
    -- Vérifications
    CASE 
        WHEN t.montant = 4000 THEN '✅'
        ELSE '❌ Transaction: ' || t.montant
    END as "VERIF_TRANSACTION",
    CASE 
        WHEN r.montant_total_remboursement = 4000 THEN '✅'
        ELSE '❌ Remboursement: ' || COALESCE(r.montant_total_remboursement::text, 'NULL')
    END as "VERIF_REMBOURSEMENT",
    CASE 
        WHEN r.frais_service = 260 THEN '✅'
        ELSE '❌ Frais: ' || COALESCE(r.frais_service::text, 'NULL')
    END as "VERIF_FRAIS",
    -- Diagnostic final
    CASE 
        WHEN t.montant = 4000 
             AND r.montant_total_remboursement = 4000 
             AND r.frais_service = 260
        THEN '🎉 LOGIQUE ZALAMA PARFAITE'
        WHEN r.id IS NULL 
        THEN '❌ REMBOURSEMENT NON CRÉÉ'
        ELSE '❌ LOGIQUE INCORRECTE'
    END as "DIAGNOSTIC_FINAL"
FROM transactions t
LEFT JOIN remboursements r ON r.transaction_id = t.id
WHERE t.numero_transaction LIKE 'TEST_ZALAMA_%'
AND t.date_creation > NOW() - INTERVAL '1 minute';

-- 4. DÉTAILS DU REMBOURSEMENT CRÉÉ
SELECT 
    '3. Détails remboursement' as etape,
    r.id,
    r.statut as remb_statut,
    r.type_remboursement,
    r.commentaire_admin,
    r.date_creation
FROM remboursements r
JOIN transactions t ON r.transaction_id = t.id
WHERE t.numero_transaction LIKE 'TEST_ZALAMA_%'
AND t.date_creation > NOW() - INTERVAL '1 minute';

-- 5. VÉRIFICATION QU'IL N'Y A QU'UN SEUL TRIGGER ACTIF
SELECT 
    '4. Triggers actifs' as etape,
    trigger_name,
    event_manipulation,
    action_timing
FROM information_schema.triggers 
WHERE event_object_table = 'transactions'
AND trigger_schema = 'public';

-- 6. NETTOYAGE DU TEST
DELETE FROM remboursements WHERE transaction_id IN (
    SELECT id FROM transactions WHERE numero_transaction LIKE 'TEST_ZALAMA_%'
    AND date_creation > NOW() - INTERVAL '1 minute'
);
DELETE FROM transactions 
WHERE numero_transaction LIKE 'TEST_ZALAMA_%'
AND date_creation > NOW() - INTERVAL '1 minute';

-- 7. INSTRUCTIONS FINALES
DO $$ 
BEGIN 
    RAISE NOTICE '=== TEST TERMINÉ ===';
    RAISE NOTICE 'Si vous voyez "🎉 LOGIQUE ZALAMA PARFAITE", le trigger fonctionne !';
    RAISE NOTICE 'Vous pouvez maintenant tester avec une vraie demande d''avance';
    RAISE NOTICE '';
    RAISE NOTICE 'RAPPEL LOGIQUE ZALAMA :';
    RAISE NOTICE '- Employé demande: 4000 GNF';
    RAISE NOTICE '- Frais ZaLaMa: 260 GNF (6.5%%)';
    RAISE NOTICE '- Employé reçoit: 3740 GNF (via LengoPay)';
    RAISE NOTICE '- Transaction DB: 4000 GNF (montant demandé)';
    RAISE NOTICE '- Partenaire rembourse: 4000 GNF (montant demandé)';
    RAISE NOTICE '- Profit ZaLaMa: 260 GNF';
END $$; 
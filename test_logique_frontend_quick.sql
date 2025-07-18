-- ============================================================================
-- TEST RAPIDE : Créer manuellement une transaction avec la logique ZaLaMa correcte
-- ============================================================================

-- 1. Trouver une demande d'avance existante
DO $$ 
BEGIN 
    RAISE NOTICE '=== DEMANDES EXISTANTES ===';
END $$;

SELECT 
    id,
    montant_demande,
    employe_id,
    partenaire_id,
    statut
FROM salary_advance_requests 
ORDER BY date_creation DESC 
LIMIT 3;

-- 2. Créer manuellement une transaction avec la logique ZaLaMa correcte
-- Remplacer 'VOTRE_DEMANDE_ID' par un ID réel de la requête ci-dessus
INSERT INTO transactions (
    id,
    montant, -- ✅ CRUCIAL: Montant demandé original (ex: 2000)
    numero_transaction,
    methode_paiement,
    numero_compte,
    description,
    entreprise_id,
    demande_avance_id,
    employe_id,
    statut,
    date_creation,
    date_transaction
) VALUES (
    'test-logique-' || EXTRACT(EPOCH FROM NOW()),
    2000, -- ✅ Montant demandé (remplacer par votre montant)
    'TEST_LOGIQUE_' || EXTRACT(EPOCH FROM NOW()),
    'MOBILE_MONEY',
    '+224625212115',
    'Test logique ZaLaMa - Transaction manuelle',
    '35de2272-972a-4a52-b905-909ffce12152', -- Remplacer par votre entreprise_id
    -- 'VOTRE_DEMANDE_ID', -- Décommentez et remplacez par l'ID d'une vraie demande
    NULL, -- Pour ce test, pas de demande liée
    'emp-test-123', -- Remplacer par votre employe_id  
    'ANNULEE', -- Commencer par ANNULEE
    NOW(),
    NULL
);

-- 3. Changer le statut pour déclencher le trigger
UPDATE transactions 
SET 
    statut = 'EFFECTUEE',
    date_transaction = NOW()
WHERE numero_transaction LIKE 'TEST_LOGIQUE_%'
AND date_creation > NOW() - INTERVAL '1 minute';

-- 4. Vérifier le résultat
DO $$ 
BEGIN 
    RAISE NOTICE '=== VÉRIFICATION APRÈS TRIGGER ===';
END $$;

SELECT 
    'Test manuel' as test_type,
    t.montant as transaction_montant,
    r.montant_total_remboursement as remboursement_montant,
    r.frais_service as frais_zalama,
    CASE 
        WHEN r.montant_total_remboursement = t.montant THEN '✅ LOGIQUE CORRECTE'
        ELSE '❌ PROBLÈME TRIGGER'
    END as diagnostic
FROM transactions t
LEFT JOIN remboursements r ON r.transaction_id = t.id
WHERE t.numero_transaction LIKE 'TEST_LOGIQUE_%'
AND t.date_creation > NOW() - INTERVAL '1 minute'
ORDER BY t.date_creation DESC
LIMIT 1;

-- 5. Nettoyage
DO $$ 
BEGIN 
    RAISE NOTICE '=== POUR NETTOYER ===';
    RAISE NOTICE 'Exécutez: DELETE FROM remboursements WHERE transaction_id IN (SELECT id FROM transactions WHERE numero_transaction LIKE ''TEST_LOGIQUE_%'');';
    RAISE NOTICE 'Puis: DELETE FROM transactions WHERE numero_transaction LIKE ''TEST_LOGIQUE_%'';';
END $$; 
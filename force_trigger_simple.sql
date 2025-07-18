-- ============================================================================
-- FORCE TRIGGER : Solution ultra-simple pour créer les remboursements
-- ============================================================================

-- 1. SUPPRIMER TOUS LES TRIGGERS EXISTANTS
DROP TRIGGER IF EXISTS zalama_debug_transaction_trigger ON transactions;
DROP TRIGGER IF EXISTS zalama_safe_transaction_trigger ON transactions;
DROP FUNCTION IF EXISTS zalama_debug_trigger() CASCADE;
DROP FUNCTION IF EXISTS zalama_safe_trigger() CASCADE;

-- 2. VÉRIFIER QU'IL N'Y A PLUS DE TRIGGERS
SELECT 
    'Triggers après suppression' as verification,
    trigger_name
FROM information_schema.triggers 
WHERE event_object_table = 'transactions'
AND trigger_schema = 'public'
AND trigger_name NOT LIKE 'RI_%';

-- 3. CRÉER UNE FONCTION TRIGGER ULTRA-SIMPLE
CREATE OR REPLACE FUNCTION simple_zalama_trigger()
RETURNS TRIGGER AS $$
BEGIN
    -- Afficher un message pour confirmer que le trigger se déclenche
    RAISE NOTICE 'SIMPLE TRIGGER: Déclenchement pour transaction % - statut %', NEW.id, NEW.statut;
    
    -- Si la transaction devient EFFECTUEE
    IF NEW.statut = 'EFFECTUEE' THEN
        RAISE NOTICE 'SIMPLE TRIGGER: Transaction EFFECTUEE détectée';
        
        -- Vérifier si un remboursement existe déjà
        IF NOT EXISTS (SELECT 1 FROM remboursements WHERE transaction_id = NEW.id) THEN
            RAISE NOTICE 'SIMPLE TRIGGER: Aucun remboursement existant, création...';
            
            -- Créer le remboursement directement
            INSERT INTO remboursements (
                id,
                transaction_id,
                partenaire_id,
                montant_transaction,
                frais_service,
                montant_total_remboursement,
                statut,
                date_creation,
                type_remboursement,
                commentaire_admin
            ) VALUES (
                gen_random_uuid(),
                NEW.id,
                NEW.entreprise_id,
                NEW.montant,
                ROUND(NEW.montant * 0.065, 2),
                NEW.montant,
                'EN_ATTENTE',
                NOW(),
                'INTEGRAL',
                'Trigger simple ZaLaMa'
            );
            
            RAISE NOTICE 'SIMPLE TRIGGER: Remboursement créé avec succès';
        ELSE
            RAISE NOTICE 'SIMPLE TRIGGER: Remboursement existe déjà';
        END IF;
    ELSE
        RAISE NOTICE 'SIMPLE TRIGGER: Statut % ignoré', NEW.statut;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. CRÉER LE TRIGGER SIMPLE
CREATE TRIGGER simple_zalama_transaction_trigger
    AFTER INSERT OR UPDATE ON transactions
    FOR EACH ROW
    EXECUTE FUNCTION simple_zalama_trigger();

-- 5. VÉRIFIER QUE LE TRIGGER EST CRÉÉ
SELECT 
    'Nouveau trigger' as verification,
    trigger_name,
    event_manipulation
FROM information_schema.triggers 
WHERE trigger_name = 'simple_zalama_transaction_trigger';

-- 6. TEST IMMÉDIAT
DO $$ 
BEGIN 
    RAISE NOTICE '=== TEST DU TRIGGER SIMPLE ===';
END $$;

-- Créer une transaction de test
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
    12000, -- Test avec 12000 GNF
    'TEST_SIMPLE_' || EXTRACT(EPOCH FROM NOW()),
    'MOBILE_MONEY',
    '+224123456789',
    'Test trigger ultra-simple',
    '35de2272-972a-4a52-b905-909ffce12152',
    'ANNULEE',
    NOW()
);

-- Déclencher le trigger
UPDATE transactions 
SET statut = 'EFFECTUEE'
WHERE numero_transaction LIKE 'TEST_SIMPLE_%'
AND date_creation > NOW() - INTERVAL '1 minute';

-- 7. VÉRIFIER LE RÉSULTAT
SELECT 
    'RÉSULTAT TRIGGER SIMPLE' as test,
    t.montant as transaction_montant,
    r.montant_total_remboursement,
    r.frais_service,
    CASE 
        WHEN r.id IS NOT NULL THEN '🎉 TRIGGER SIMPLE FONCTIONNE'
        ELSE '❌ TRIGGER SIMPLE ÉCHOUE AUSSI'
    END as diagnostic_final
FROM transactions t
LEFT JOIN remboursements r ON r.transaction_id = t.id
WHERE t.numero_transaction LIKE 'TEST_SIMPLE_%'
AND t.date_creation > NOW() - INTERVAL '1 minute';

-- 8. ALTERNATIVE : CRÉER LE REMBOURSEMENT MANUELLEMENT
DO $$ 
DECLARE
    test_transaction_id UUID;
BEGIN 
    RAISE NOTICE '=== CRÉER REMBOURSEMENT MANUELLEMENT ===';
    
    -- Récupérer l'ID de la transaction de test
    SELECT id INTO test_transaction_id
    FROM transactions 
    WHERE numero_transaction LIKE 'TEST_SIMPLE_%'
    AND date_creation > NOW() - INTERVAL '1 minute'
    LIMIT 1;
    
    IF test_transaction_id IS NOT NULL THEN
        -- Créer le remboursement manuellement
        INSERT INTO remboursements (
            id,
            transaction_id,
            partenaire_id,
            montant_transaction,
            frais_service,
            montant_total_remboursement,
            statut,
            date_creation,
            type_remboursement,
            commentaire_admin
        ) 
        SELECT 
            gen_random_uuid(),
            t.id,
            t.entreprise_id,
            t.montant,
            ROUND(t.montant * 0.065, 2),
            t.montant,
            'EN_ATTENTE',
            NOW(),
            'INTEGRAL',
            'Création manuelle pour test'
        FROM transactions t
        WHERE t.id = test_transaction_id
        AND NOT EXISTS (SELECT 1 FROM remboursements WHERE transaction_id = t.id);
        
        RAISE NOTICE 'Remboursement manuel créé pour transaction %', test_transaction_id;
    END IF;
END $$;

-- 9. VÉRIFICATION FINALE
SELECT 
    'VÉRIFICATION FINALE' as test,
    t.montant as transaction_montant,
    r.montant_total_remboursement,
    r.frais_service,
    r.commentaire_admin,
    CASE 
        WHEN r.id IS NOT NULL THEN '✅ REMBOURSEMENT PRÉSENT'
        ELSE '❌ AUCUN REMBOURSEMENT'
    END as diagnostic_final
FROM transactions t
LEFT JOIN remboursements r ON r.transaction_id = t.id
WHERE t.numero_transaction LIKE 'TEST_SIMPLE_%'
AND t.date_creation > NOW() - INTERVAL '1 minute';

-- 10. INSTRUCTIONS
DO $$ 
BEGIN 
    RAISE NOTICE '';
    RAISE NOTICE '=== REGARDEZ LES MESSAGES "SIMPLE TRIGGER:" ===';
    RAISE NOTICE 'Si vous ne voyez AUCUN message "SIMPLE TRIGGER:", le problème est plus profond';
    RAISE NOTICE 'Si vous voyez "🎉 TRIGGER SIMPLE FONCTIONNE", le problème est résolu !';
    RAISE NOTICE '';
END $$; 
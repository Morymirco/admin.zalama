-- ============================================================================
-- DIAGNOSTIC : Pourquoi le trigger ZaLaMa ne crée pas de remboursement
-- ============================================================================

-- 1. VÉRIFIER SI LE TRIGGER EST BIEN ACTIF
SELECT 
    '=== TRIGGERS ACTIFS ===' as diagnostic,
    trigger_name,
    event_manipulation,
    action_timing,
    event_object_table
FROM information_schema.triggers 
WHERE event_object_table = 'transactions'
AND trigger_schema = 'public'
ORDER BY trigger_name;

-- 2. VÉRIFIER LA TRANSACTION DE TEST
SELECT 
    '=== TRANSACTION DE TEST ===' as diagnostic,
    id,
    montant,
    numero_transaction,
    statut,
    entreprise_id,
    date_creation
FROM transactions 
WHERE numero_transaction LIKE 'TEST_SAFE_%'
AND date_creation > NOW() - INTERVAL '10 minutes'
ORDER BY date_creation DESC;

-- 3. VÉRIFIER S'IL Y A DES REMBOURSEMENTS POUR CETTE TRANSACTION
SELECT 
    '=== REMBOURSEMENTS EXISTANTS ===' as diagnostic,
    r.id,
    r.transaction_id,
    r.montant_total_remboursement,
    r.frais_service,
    r.commentaire_admin,
    r.date_creation
FROM remboursements r
JOIN transactions t ON r.transaction_id = t.id
WHERE t.numero_transaction LIKE 'TEST_SAFE_%'
AND t.date_creation > NOW() - INTERVAL '10 minutes';

-- 4. TESTER LE TRIGGER MANUELLEMENT AVEC LOGS
DO $$ 
BEGIN 
    RAISE NOTICE '=== TEST MANUEL DU TRIGGER ===';
END $$;

-- Créer une nouvelle transaction de test
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
    7500, -- Test avec 7500 GNF
    'TEST_DEBUG_' || EXTRACT(EPOCH FROM NOW()),
    'MOBILE_MONEY',
    '+224123456789',
    'Test debug trigger ZaLaMa',
    '35de2272-972a-4a52-b905-909ffce12152',
    'ANNULEE',
    NOW()
);

-- Changer le statut pour déclencher le trigger
UPDATE transactions 
SET 
    statut = 'EFFECTUEE',
    date_transaction = NOW()
WHERE numero_transaction LIKE 'TEST_DEBUG_%'
AND date_creation > NOW() - INTERVAL '1 minute';

-- 5. VÉRIFIER IMMÉDIATEMENT LE RÉSULTAT
SELECT 
    '=== RÉSULTAT TEST MANUEL ===' as diagnostic,
    t.id as transaction_id,
    t.montant as transaction_montant,
    t.statut as transaction_statut,
    r.id as remboursement_id,
    r.montant_total_remboursement,
    r.frais_service,
    CASE 
        WHEN r.id IS NOT NULL THEN '✅ REMBOURSEMENT CRÉÉ'
        ELSE '❌ AUCUN REMBOURSEMENT'
    END as diagnostic_remboursement
FROM transactions t
LEFT JOIN remboursements r ON r.transaction_id = t.id
WHERE t.numero_transaction LIKE 'TEST_DEBUG_%'
AND t.date_creation > NOW() - INTERVAL '1 minute';

-- 6. VÉRIFIER LA STRUCTURE DE LA TABLE REMBOURSEMENTS
SELECT 
    '=== STRUCTURE TABLE REMBOURSEMENTS ===' as diagnostic,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'remboursements'
AND table_schema = 'public'
AND column_name IN ('id', 'transaction_id', 'partenaire_id', 'montant_total_remboursement', 'frais_service', 'statut', 'type_remboursement')
ORDER BY ordinal_position;

-- 7. CRÉER UN TRIGGER AVEC LOGS DÉTAILLÉS
CREATE OR REPLACE FUNCTION zalama_debug_trigger()
RETURNS TRIGGER AS $$
DECLARE
    existing_reimbursement_id UUID;
    frais_zalama DECIMAL(10,2);
    remboursement_id UUID;
BEGIN
    RAISE NOTICE 'DEBUG TRIGGER: Démarrage pour transaction %', NEW.id;
    RAISE NOTICE 'DEBUG TRIGGER: TG_OP = %, OLD.statut = %, NEW.statut = %', 
                 TG_OP, 
                 COALESCE(OLD.statut::text, 'NULL'), 
                 NEW.statut;
    
    -- Seulement traiter les changements de statut vers EFFECTUEE
    IF TG_OP = 'UPDATE' AND NEW.statut = 'EFFECTUEE' AND OLD.statut != 'EFFECTUEE' THEN
        
        RAISE NOTICE 'DEBUG TRIGGER: Condition remplie, création du remboursement';
        
        -- Vérifier si un remboursement existe déjà pour cette transaction
        SELECT id INTO existing_reimbursement_id 
        FROM remboursements 
        WHERE transaction_id = NEW.id;
        
        RAISE NOTICE 'DEBUG TRIGGER: Remboursement existant = %', 
                     COALESCE(existing_reimbursement_id::text, 'AUCUN');
        
        -- Si un remboursement existe déjà, ne rien faire
        IF existing_reimbursement_id IS NOT NULL THEN
            RAISE NOTICE 'DEBUG TRIGGER: Remboursement déjà existant, arrêt';
            RETURN NEW;
        END IF;
        
        -- Calculer les frais ZaLaMa
        frais_zalama := ROUND(NEW.montant * 0.065, 2);
        RAISE NOTICE 'DEBUG TRIGGER: Frais calculés = %', frais_zalama;
        
        -- Générer un ID pour le remboursement
        remboursement_id := gen_random_uuid();
        RAISE NOTICE 'DEBUG TRIGGER: ID remboursement = %', remboursement_id;
        
        -- Créer le remboursement avec gestion d'erreur détaillée
        BEGIN
            RAISE NOTICE 'DEBUG TRIGGER: Tentative d''insertion du remboursement';
            
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
                remboursement_id,
                NEW.id,
                NEW.entreprise_id,
                NEW.montant,
                frais_zalama,
                NEW.montant,
                'EN_ATTENTE',
                NOW(),
                'INTEGRAL',
                'DEBUG TRIGGER - Test création remboursement'
            );
            
            RAISE NOTICE 'DEBUG TRIGGER: ✅ Remboursement créé avec succès, ID = %', remboursement_id;
            
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'DEBUG TRIGGER: ❌ ERREUR lors de la création du remboursement';
            RAISE NOTICE 'DEBUG TRIGGER: Erreur code = %', SQLSTATE;
            RAISE NOTICE 'DEBUG TRIGGER: Erreur message = %', SQLERRM;
            RAISE NOTICE 'DEBUG TRIGGER: Valeurs utilisées:';
            RAISE NOTICE '  - transaction_id = %', NEW.id;
            RAISE NOTICE '  - partenaire_id = %', NEW.entreprise_id;
            RAISE NOTICE '  - montant = %', NEW.montant;
            RAISE NOTICE '  - frais = %', frais_zalama;
        END;
        
    ELSE
        RAISE NOTICE 'DEBUG TRIGGER: Condition non remplie, pas de création';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. REMPLACER LE TRIGGER PAR LA VERSION DEBUG
DROP TRIGGER IF EXISTS zalama_safe_transaction_trigger ON transactions;
CREATE TRIGGER zalama_debug_transaction_trigger
    AFTER UPDATE ON transactions
    FOR EACH ROW
    EXECUTE FUNCTION zalama_debug_trigger();

-- 9. TEST AVEC LE TRIGGER DEBUG
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
    9000, -- Test avec 9000 GNF
    'TEST_DEBUG2_' || EXTRACT(EPOCH FROM NOW()),
    'MOBILE_MONEY',
    '+224123456789',
    'Test debug trigger avec logs',
    '35de2272-972a-4a52-b905-909ffce12152',
    'ANNULEE',
    NOW()
);

-- Déclencher le trigger avec logs
UPDATE transactions 
SET 
    statut = 'EFFECTUEE',
    date_transaction = NOW()
WHERE numero_transaction LIKE 'TEST_DEBUG2_%'
AND date_creation > NOW() - INTERVAL '1 minute';

-- 10. VÉRIFIER LE RÉSULTAT FINAL
SELECT 
    '=== RÉSULTAT AVEC LOGS ===' as diagnostic,
    t.montant as transaction_montant,
    r.montant_total_remboursement,
    r.frais_service,
    CASE 
        WHEN r.id IS NOT NULL THEN '✅ REMBOURSEMENT CRÉÉ AVEC LOGS'
        ELSE '❌ ÉCHEC MÊME AVEC LOGS'
    END as diagnostic_final
FROM transactions t
LEFT JOIN remboursements r ON r.transaction_id = t.id
WHERE t.numero_transaction LIKE 'TEST_DEBUG2_%'
AND t.date_creation > NOW() - INTERVAL '1 minute';

-- 11. INSTRUCTIONS
DO $$ 
BEGIN 
    RAISE NOTICE '';
    RAISE NOTICE '=== REGARDEZ LES LOGS CI-DESSUS ===';
    RAISE NOTICE 'Les messages "DEBUG TRIGGER:" vous diront exactement ce qui se passe';
    RAISE NOTICE 'Si vous voyez "ERREUR lors de la création", regardez le message d''erreur';
    RAISE NOTICE '';
END $$; 
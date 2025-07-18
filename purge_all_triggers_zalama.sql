-- ============================================================================
-- PURGE COMPLÈTE : Suppression de TOUS les triggers et création du seul trigger ZaLaMa
-- ============================================================================

-- 1. LISTER ET SUPPRIMER SEULEMENT LES TRIGGERS PERSONNALISÉS
DO $$ 
BEGIN 
    RAISE NOTICE '=== SUPPRESSION DES TRIGGERS PERSONNALISÉS SEULEMENT ===';
END $$;

-- 2. SUPPRIMER TOUS LES TRIGGERS EXISTANTS UN PAR UN
DROP TRIGGER IF EXISTS create_automatic_reimbursement ON transactions;
DROP TRIGGER IF EXISTS transaction_status_change ON transactions;
DROP TRIGGER IF EXISTS update_reimbursement_on_transaction_status ON transactions;
DROP TRIGGER IF EXISTS creer_remboursement_integral_automatique ON transactions;
DROP TRIGGER IF EXISTS trigger_create_reimbursement ON transactions;
DROP TRIGGER IF EXISTS auto_create_reimbursement ON transactions;
DROP TRIGGER IF EXISTS trigger_auto_remboursement ON transactions;
DROP TRIGGER IF EXISTS trigger_creer_remboursement_integral ON transactions;
DROP TRIGGER IF EXISTS trigger_zalama_automatic_reimbursement ON transactions;
DROP TRIGGER IF EXISTS zalama_transaction_status_trigger ON transactions;

-- Supprimer d'autres triggers possibles
DROP TRIGGER IF EXISTS trigger_transaction_notification ON transactions;
DROP TRIGGER IF EXISTS notify_transaction_created ON transactions;
DROP TRIGGER IF EXISTS notify_transaction_status_changed ON transactions;

-- 3. SUPPRIMER TOUTES LES FONCTIONS DE TRIGGER
DROP FUNCTION IF EXISTS create_automatic_reimbursement() CASCADE;
DROP FUNCTION IF EXISTS creer_remboursement_integral_automatique() CASCADE;
DROP FUNCTION IF EXISTS update_reimbursement_on_transaction_status() CASCADE;
DROP FUNCTION IF EXISTS handle_transaction_status_change() CASCADE;
DROP FUNCTION IF EXISTS auto_create_reimbursement() CASCADE;
DROP FUNCTION IF EXISTS zalama_transaction_trigger() CASCADE;
DROP FUNCTION IF EXISTS create_automatic_reimbursement_zalama() CASCADE;
DROP FUNCTION IF EXISTS creer_remboursement_integral_direct(UUID) CASCADE;
DROP FUNCTION IF EXISTS notify_transaction_created() CASCADE;
DROP FUNCTION IF EXISTS notify_transaction_status_changed() CASCADE;

-- 4. VÉRIFIER QU'IL N'Y A PLUS DE TRIGGERS
DO $$ 
BEGIN 
    RAISE NOTICE '=== VÉRIFICATION : PLUS DE TRIGGERS ===';
END $$;

SELECT 
    'Triggers restants' as verification,
    trigger_name,
    event_object_table
FROM information_schema.triggers 
WHERE event_object_table IN ('transactions', 'remboursements', 'salary_advance_requests')
AND trigger_schema = 'public';

-- 5. LES TRIGGERS SYSTÈME RESTENT TOUJOURS ACTIFS (contraintes FK)

-- 6. CRÉER LE SEUL ET UNIQUE TRIGGER ZALAMA CORRECT
DO $$ 
BEGIN 
    RAISE NOTICE '=== CRÉATION DU TRIGGER ZALAMA UNIQUE ===';
END $$;

CREATE OR REPLACE FUNCTION zalama_unique_trigger()
RETURNS TRIGGER AS $$
DECLARE
    existing_reimbursement_id UUID;
    frais_zalama DECIMAL(10,2);
BEGIN
    -- Seulement traiter les changements de statut vers EFFECTUEE
    IF TG_OP = 'UPDATE' AND NEW.statut = 'EFFECTUEE' AND OLD.statut != 'EFFECTUEE' THEN
        
        RAISE NOTICE 'ZALAMA UNIQUE: Transaction % passée à EFFECTUEE', NEW.numero_transaction;
        
        -- Vérifier si un remboursement existe déjà pour cette transaction
        SELECT id INTO existing_reimbursement_id 
        FROM remboursements 
        WHERE transaction_id = NEW.id;
        
        -- Si un remboursement existe déjà, ne rien faire
        IF existing_reimbursement_id IS NOT NULL THEN
            RAISE NOTICE 'ZALAMA UNIQUE: Remboursement déjà existant pour transaction %', NEW.id;
            RETURN NEW;
        END IF;
        
        -- Calculer les frais ZaLaMa (6.5% du montant de la transaction)
        frais_zalama := ROUND(NEW.montant * 0.065, 2);
        
        -- ✅ LOGIQUE ZALAMA UNIQUE ET CORRECTE :
        -- - Transaction.montant = montant demandé original (ex: 2000) - NE JAMAIS MODIFIER
        -- - Remboursement.montant_total = montant demandé original (ex: 2000)
        -- - Frais ZaLaMa = 6.5% du montant demandé (ex: 130)
        -- - Employé reçoit = montant demandé - frais (ex: 1870) - GÉRÉ PAR LENGOPAY
        -- - Partenaire rembourse = montant demandé complet (ex: 2000)
        
        RAISE NOTICE 'ZALAMA UNIQUE: Création remboursement avec montant_total = % (MONTANT TRANSACTION JAMAIS MODIFIÉ)', NEW.montant;
        RAISE NOTICE 'ZALAMA UNIQUE: Frais ZaLaMa calculés = %', frais_zalama;
        
        -- Créer le remboursement avec la logique ZaLaMa correcte
        INSERT INTO remboursements (
            id,
            transaction_id,
            partenaire_id,
            montant_transaction,
            frais_service,
            montant_total_remboursement, -- ✅ CRUCIAL: = montant demandé original
            statut,
            date_creation,
            type_remboursement,
            commentaire_admin
        ) VALUES (
            gen_random_uuid(),
            NEW.id,
            NEW.entreprise_id,
            NEW.montant, -- Montant de la transaction (montant demandé - JAMAIS MODIFIÉ)
            frais_zalama, -- Frais ZaLaMa (6.5%)
            NEW.montant, -- ✅ MONTANT TOTAL = MONTANT DEMANDÉ (logique ZaLaMa)
            'EN_ATTENTE',
            NOW(),
            'INTEGRAL',
            'TRIGGER ZALAMA UNIQUE - Remboursement = montant demandé original'
        );
        
        RAISE NOTICE 'ZALAMA UNIQUE: Remboursement créé avec succès pour transaction %', NEW.numero_transaction;
        
    END IF;
    
    -- ✅ CRUCIAL : JAMAIS MODIFIER LE MONTANT DE LA TRANSACTION
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. CRÉER LE TRIGGER UNIQUE
CREATE TRIGGER zalama_unique_transaction_trigger
    AFTER UPDATE ON transactions
    FOR EACH ROW
    EXECUTE FUNCTION zalama_unique_trigger();

-- 8. LE TRIGGER EST DÉJÀ ACTIF PAR DÉFAUT (pas besoin de l'activer manuellement)

-- 9. VÉRIFICATION FINALE
DO $$ 
BEGIN 
    RAISE NOTICE '=== VÉRIFICATION FINALE ===';
END $$;

SELECT 
    'TRIGGER UNIQUE ACTIF' as verification,
    trigger_name,
    event_manipulation,
    action_timing
FROM information_schema.triggers 
WHERE event_object_table = 'transactions'
AND trigger_schema = 'public';

-- 10. TEST IMMÉDIAT
DO $$ 
BEGIN 
    RAISE NOTICE '=== TEST IMMÉDIAT DU TRIGGER UNIQUE ===';
END $$;

-- Test simple : créer une transaction et voir si elle garde son montant
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
    8000, -- Test avec 8000 GNF
    'TEST_UNIQUE_' || EXTRACT(EPOCH FROM NOW()),
    'MOBILE_MONEY',
    '+224123456789',
    'Test trigger unique ZaLaMa',
    '35de2272-972a-4a52-b905-909ffce12152',
    'ANNULEE',
    NOW()
);

-- Changer le statut pour déclencher le trigger
UPDATE transactions 
SET 
    statut = 'EFFECTUEE',
    date_transaction = NOW()
WHERE numero_transaction LIKE 'TEST_UNIQUE_%'
AND date_creation > NOW() - INTERVAL '1 minute';

-- Vérifier le résultat
SELECT 
    'RÉSULTAT TEST UNIQUE' as test_result,
    t.montant as "TRANSACTION_MONTANT",
    r.montant_total_remboursement as "REMBOURSEMENT_MONTANT",
    r.frais_service as "FRAIS_ZALAMA",
    CASE 
        WHEN t.montant = 8000 
             AND r.montant_total_remboursement = 8000 
             AND r.frais_service = 520  -- 8000 * 0.065 = 520
        THEN '🎉 TRIGGER UNIQUE PARFAIT'
        WHEN t.montant != 8000
        THEN '❌ TRANSACTION MODIFIÉE: ' || t.montant
        WHEN r.montant_total_remboursement != 8000
        THEN '❌ REMBOURSEMENT INCORRECT: ' || COALESCE(r.montant_total_remboursement::text, 'NULL')
        ELSE '❌ AUTRE PROBLÈME'
    END as "DIAGNOSTIC_FINAL"
FROM transactions t
LEFT JOIN remboursements r ON r.transaction_id = t.id
WHERE t.numero_transaction LIKE 'TEST_UNIQUE_%'
AND t.date_creation > NOW() - INTERVAL '1 minute';

-- Nettoyage du test
DELETE FROM remboursements WHERE transaction_id IN (
    SELECT id FROM transactions WHERE numero_transaction LIKE 'TEST_UNIQUE_%'
    AND date_creation > NOW() - INTERVAL '1 minute'
);
DELETE FROM transactions 
WHERE numero_transaction LIKE 'TEST_UNIQUE_%'
AND date_creation > NOW() - INTERVAL '1 minute';

-- 11. INSTRUCTIONS FINALES
DO $$ 
BEGIN 
    RAISE NOTICE '';
    RAISE NOTICE '🎯 ==========================================';
    RAISE NOTICE '🎯 PURGE COMPLÈTE TERMINÉE';
    RAISE NOTICE '🎯 ==========================================';
    RAISE NOTICE '';
    RAISE NOTICE '✅ TOUS les anciens triggers supprimés';
    RAISE NOTICE '✅ UN SEUL trigger actif : zalama_unique_transaction_trigger';
    RAISE NOTICE '✅ Logique ZaLaMa pure : montant transaction JAMAIS modifié';
    RAISE NOTICE '✅ Remboursement = montant demandé original';
    RAISE NOTICE '';
    RAISE NOTICE 'MAINTENANT : Testez une nouvelle demande d''avance !';
    RAISE NOTICE 'Le montant de la transaction devrait rester intact.';
END $$; 
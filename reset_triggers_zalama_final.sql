-- ============================================================================
-- RESET COMPLET : Suppression de tous les triggers et création d'un trigger simple ZaLaMa
-- ============================================================================

-- 1. SUPPRESSION DE TOUS LES TRIGGERS EXISTANTS
DO $$ 
BEGIN 
    RAISE NOTICE '=== SUPPRESSION DE TOUS LES TRIGGERS EXISTANTS ===';
END $$;

-- Lister tous les triggers avant suppression
SELECT 
    'Triggers à supprimer' as action,
    trigger_name,
    event_object_table
FROM information_schema.triggers 
WHERE event_object_table IN ('transactions', 'remboursements', 'salary_advance_requests')
AND trigger_schema = 'public';

-- Supprimer tous les triggers sur transactions
DROP TRIGGER IF EXISTS create_automatic_reimbursement ON transactions;
DROP TRIGGER IF EXISTS transaction_status_change ON transactions;
DROP TRIGGER IF EXISTS update_reimbursement_on_transaction_status ON transactions;
DROP TRIGGER IF EXISTS creer_remboursement_integral_automatique ON transactions;
DROP TRIGGER IF EXISTS trigger_create_reimbursement ON transactions;
DROP TRIGGER IF EXISTS auto_create_reimbursement ON transactions;

-- Supprimer toutes les fonctions de trigger existantes
DROP FUNCTION IF EXISTS create_automatic_reimbursement() CASCADE;
DROP FUNCTION IF EXISTS creer_remboursement_integral_automatique() CASCADE;
DROP FUNCTION IF EXISTS update_reimbursement_on_transaction_status() CASCADE;
DROP FUNCTION IF EXISTS handle_transaction_status_change() CASCADE;
DROP FUNCTION IF EXISTS auto_create_reimbursement() CASCADE;

-- 2. CRÉATION DE LA FONCTION TRIGGER SIMPLE ET CORRECTE
DO $$ 
BEGIN 
    RAISE NOTICE '=== CRÉATION DU NOUVEAU TRIGGER ZALAMA ===';
END $$;

CREATE OR REPLACE FUNCTION zalama_transaction_trigger()
RETURNS TRIGGER AS $$
DECLARE
    existing_reimbursement_id UUID;
    frais_zalama DECIMAL(10,2);
    demande_montant DECIMAL(10,2);
BEGIN
    -- Seulement traiter les changements de statut vers EFFECTUEE
    IF TG_OP = 'UPDATE' AND NEW.statut = 'EFFECTUEE' AND OLD.statut != 'EFFECTUEE' THEN
        
        RAISE NOTICE 'ZALAMA TRIGGER: Transaction % passée à EFFECTUEE', NEW.numero_transaction;
        
        -- Vérifier si un remboursement existe déjà pour cette transaction
        SELECT id INTO existing_reimbursement_id 
        FROM remboursements 
        WHERE transaction_id = NEW.id;
        
        -- Si un remboursement existe déjà, ne rien faire
        IF existing_reimbursement_id IS NOT NULL THEN
            RAISE NOTICE 'ZALAMA TRIGGER: Remboursement déjà existant pour transaction %', NEW.id;
            RETURN NEW;
        END IF;
        
        -- Calculer les frais ZaLaMa (6.5% du montant de la transaction)
        frais_zalama := ROUND(NEW.montant * 0.065, 2);
        
        -- ✅ LOGIQUE ZALAMA CORRECTE :
        -- - Transaction.montant = montant demandé original (ex: 2000)
        -- - Remboursement.montant_total = montant demandé original (ex: 2000)
        -- - Frais ZaLaMa = 6.5% du montant demandé (ex: 130)
        -- - Employé reçoit = montant demandé - frais (ex: 1870)
        -- - Partenaire rembourse = montant demandé complet (ex: 2000)
        
        RAISE NOTICE 'ZALAMA TRIGGER: Création remboursement avec montant_total = % (montant transaction)', NEW.montant;
        RAISE NOTICE 'ZALAMA TRIGGER: Frais ZaLaMa calculés = %', frais_zalama;
        
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
            NEW.montant, -- Montant de la transaction (montant demandé)
            frais_zalama, -- Frais ZaLaMa (6.5%)
            NEW.montant, -- ✅ MONTANT TOTAL = MONTANT DEMANDÉ (logique ZaLaMa)
            'EN_ATTENTE',
            NOW(),
            'INTEGRAL',
            'Remboursement créé automatiquement par trigger ZaLaMa'
        );
        
        RAISE NOTICE 'ZALAMA TRIGGER: Remboursement créé avec succès pour transaction %', NEW.numero_transaction;
        
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. CRÉATION DU TRIGGER
CREATE TRIGGER zalama_transaction_status_trigger
    AFTER UPDATE ON transactions
    FOR EACH ROW
    EXECUTE FUNCTION zalama_transaction_trigger();

-- 4. VÉRIFICATION DE LA CRÉATION
DO $$ 
BEGIN 
    RAISE NOTICE '=== VÉRIFICATION DU NOUVEAU TRIGGER ===';
END $$;

SELECT 
    'Nouveau trigger créé' as action,
    trigger_name,
    event_manipulation,
    action_timing
FROM information_schema.triggers 
WHERE trigger_name = 'zalama_transaction_status_trigger';

-- 5. TEST DU NOUVEAU TRIGGER
DO $$ 
BEGIN 
    RAISE NOTICE '=== TEST DU NOUVEAU TRIGGER ===';
    RAISE NOTICE 'Créez une transaction de test et changez son statut vers EFFECTUEE pour tester';
END $$;

-- Exemple de test (décommentez si vous voulez tester immédiatement)
/*
-- Insérer une transaction de test
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
    3000, -- Test avec 3000 GNF
    'TEST_TRIGGER_' || EXTRACT(EPOCH FROM NOW()),
    'MOBILE_MONEY',
    '+224123456789',
    'Test nouveau trigger ZaLaMa',
    '35de2272-972a-4a52-b905-909ffce12152',
    'ANNULEE',
    NOW()
);

-- Changer le statut pour déclencher le trigger
UPDATE transactions 
SET statut = 'EFFECTUEE', date_transaction = NOW()
WHERE numero_transaction LIKE 'TEST_TRIGGER_%'
AND date_creation > NOW() - INTERVAL '1 minute';

-- Vérifier le résultat
SELECT 
    'Test résultat' as type,
    t.montant as transaction_montant,
    r.montant_total_remboursement as remboursement_montant,
    r.frais_service as frais_zalama,
    CASE 
        WHEN r.montant_total_remboursement = t.montant THEN '✅ LOGIQUE ZALAMA CORRECTE'
        ELSE '❌ PROBLÈME DÉTECTÉ'
    END as diagnostic
FROM transactions t
LEFT JOIN remboursements r ON r.transaction_id = t.id
WHERE t.numero_transaction LIKE 'TEST_TRIGGER_%'
AND t.date_creation > NOW() - INTERVAL '1 minute';
*/

-- 6. INSTRUCTIONS FINALES
DO $$ 
BEGIN 
    RAISE NOTICE '=== TRIGGER ZALAMA INSTALLÉ AVEC SUCCÈS ===';
    RAISE NOTICE 'Le trigger va maintenant créer automatiquement les remboursements';
    RAISE NOTICE 'avec la logique ZaLaMa correcte quand une transaction passe à EFFECTUEE';
    RAISE NOTICE '';
    RAISE NOTICE 'LOGIQUE IMPLEMENTÉE :';
    RAISE NOTICE '- Transaction.montant = Montant demandé original';
    RAISE NOTICE '- Remboursement.montant_total = Montant demandé original';
    RAISE NOTICE '- Frais ZaLaMa = 6.5%% du montant demandé';
    RAISE NOTICE '- Employé reçoit = Montant demandé - Frais (via LengoPay)';
    RAISE NOTICE '- Partenaire rembourse = Montant demandé complet';
END $$; 
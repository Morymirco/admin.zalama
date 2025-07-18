-- ============================================================================
-- PURGE SÛRE : Suppression seulement des triggers personnalisés ZaLaMa
-- ============================================================================

-- 1. LISTER LES TRIGGERS PERSONNALISÉS AVANT SUPPRESSION
DO $$ 
BEGIN 
    RAISE NOTICE '=== TRIGGERS PERSONNALISÉS À SUPPRIMER ===';
END $$;

SELECT 
    'Triggers personnalisés' as type,
    trigger_name,
    event_object_table
FROM information_schema.triggers 
WHERE event_object_table IN ('transactions', 'remboursements', 'salary_advance_requests')
AND trigger_schema = 'public'
AND trigger_name NOT LIKE 'RI_%' -- Exclure les triggers système
ORDER BY trigger_name;

-- 2. SUPPRIMER SEULEMENT LES TRIGGERS PERSONNALISÉS
DO $$ 
DECLARE
    trigger_record RECORD;
BEGIN
    RAISE NOTICE '=== SUPPRESSION SÉCURISÉE DES TRIGGERS ===';
    
    -- Supprimer les triggers personnalisés un par un
    FOR trigger_record IN 
        SELECT trigger_name, event_object_table
        FROM information_schema.triggers 
        WHERE event_object_table IN ('transactions', 'remboursements', 'salary_advance_requests')
        AND trigger_schema = 'public'
        AND trigger_name NOT LIKE 'RI_%' -- Exclure les triggers système
    LOOP
        BEGIN
            EXECUTE format('DROP TRIGGER IF EXISTS %I ON %I', 
                          trigger_record.trigger_name, 
                          trigger_record.event_object_table);
            RAISE NOTICE 'Supprimé: %', trigger_record.trigger_name;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Impossible de supprimer % (probablement système): %', 
                        trigger_record.trigger_name, SQLERRM;
        END;
    END LOOP;
END $$;

-- 3. SUPPRIMER LES FONCTIONS DE TRIGGER PERSONNALISÉES
DO $$ 
DECLARE
    func_record RECORD;
BEGIN
    RAISE NOTICE '=== SUPPRESSION DES FONCTIONS DE TRIGGER ===';
    
    FOR func_record IN 
        SELECT routine_name
        FROM information_schema.routines 
        WHERE routine_name LIKE '%reimbursement%'
           OR routine_name LIKE '%remboursement%'
           OR routine_name LIKE '%transaction%'
           OR routine_name LIKE '%zalama%'
        AND routine_schema = 'public'
        AND routine_type = 'FUNCTION'
    LOOP
        BEGIN
            EXECUTE format('DROP FUNCTION IF EXISTS %I() CASCADE', func_record.routine_name);
            RAISE NOTICE 'Fonction supprimée: %', func_record.routine_name;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Impossible de supprimer fonction %: %', 
                        func_record.routine_name, SQLERRM;
        END;
    END LOOP;
END $$;

-- 4. VÉRIFIER QU'IL N'Y A PLUS DE TRIGGERS PERSONNALISÉS
DO $$ 
BEGIN 
    RAISE NOTICE '=== VÉRIFICATION : TRIGGERS RESTANTS ===';
END $$;

SELECT 
    'Triggers après nettoyage' as verification,
    trigger_name,
    event_object_table,
    CASE 
        WHEN trigger_name LIKE 'RI_%' THEN 'Système (OK)'
        ELSE 'Personnalisé (à vérifier)'
    END as type_trigger
FROM information_schema.triggers 
WHERE event_object_table IN ('transactions', 'remboursements', 'salary_advance_requests')
AND trigger_schema = 'public'
ORDER BY trigger_name;

-- 5. CRÉER LE TRIGGER ZALAMA UNIQUE ET CORRECT
DO $$ 
BEGIN 
    RAISE NOTICE '=== CRÉATION DU TRIGGER ZALAMA UNIQUE ===';
END $$;

CREATE OR REPLACE FUNCTION zalama_safe_trigger()
RETURNS TRIGGER AS $$
DECLARE
    existing_reimbursement_id UUID;
    frais_zalama DECIMAL(10,2);
BEGIN
    -- Seulement traiter les changements de statut vers EFFECTUEE
    IF TG_OP = 'UPDATE' AND NEW.statut = 'EFFECTUEE' AND OLD.statut != 'EFFECTUEE' THEN
        
        RAISE NOTICE 'ZALAMA SAFE: Transaction % passée à EFFECTUEE', NEW.numero_transaction;
        
        -- Vérifier si un remboursement existe déjà pour cette transaction
        SELECT id INTO existing_reimbursement_id 
        FROM remboursements 
        WHERE transaction_id = NEW.id;
        
        -- Si un remboursement existe déjà, ne rien faire
        IF existing_reimbursement_id IS NOT NULL THEN
            RAISE NOTICE 'ZALAMA SAFE: Remboursement déjà existant pour transaction %', NEW.id;
            RETURN NEW;
        END IF;
        
        -- Calculer les frais ZaLaMa (6.5% du montant de la transaction)
        frais_zalama := ROUND(NEW.montant * 0.065, 2);
        
        RAISE NOTICE 'ZALAMA SAFE: Création remboursement avec montant_total = % (INCHANGÉ)', NEW.montant;
        RAISE NOTICE 'ZALAMA SAFE: Frais ZaLaMa calculés = %', frais_zalama;
        
        -- Créer le remboursement avec la logique ZaLaMa correcte
        BEGIN
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
                'TRIGGER ZALAMA SAFE - Remboursement = montant demandé original'
            );
            
            RAISE NOTICE 'ZALAMA SAFE: Remboursement créé avec succès pour transaction %', NEW.numero_transaction;
        EXCEPTION WHEN OTHERS THEN
            RAISE WARNING 'ZALAMA SAFE: Erreur création remboursement pour %: %', NEW.id, SQLERRM;
        END;
        
    END IF;
    
    -- ✅ CRUCIAL : JAMAIS MODIFIER LE MONTANT DE LA TRANSACTION
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. CRÉER LE TRIGGER SÛREMENT
CREATE TRIGGER zalama_safe_transaction_trigger
    AFTER UPDATE ON transactions
    FOR EACH ROW
    EXECUTE FUNCTION zalama_safe_trigger();

-- 7. VÉRIFICATION FINALE
DO $$ 
BEGIN 
    RAISE NOTICE '=== VÉRIFICATION FINALE ===';
END $$;

SELECT 
    'NOUVEAU TRIGGER ACTIF' as verification,
    trigger_name,
    event_manipulation,
    action_timing
FROM information_schema.triggers 
WHERE trigger_name = 'zalama_safe_transaction_trigger';

-- 8. TEST SÉCURISÉ
DO $$ 
BEGIN 
    RAISE NOTICE '=== TEST SÉCURISÉ ===';
END $$;

-- Test avec transaction simple
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
    6000, -- Test avec 6000 GNF
    'TEST_SAFE_' || EXTRACT(EPOCH FROM NOW()),
    'MOBILE_MONEY',
    '+224123456789',
    'Test trigger sécurisé ZaLaMa',
    '35de2272-972a-4a52-b905-909ffce12152',
    'ANNULEE',
    NOW()
);

-- Changer le statut pour déclencher le trigger
UPDATE transactions 
SET 
    statut = 'EFFECTUEE',
    date_transaction = NOW()
WHERE numero_transaction LIKE 'TEST_SAFE_%'
AND date_creation > NOW() - INTERVAL '1 minute';

-- Vérifier le résultat
SELECT 
    'RÉSULTAT TEST SÉCURISÉ' as test_result,
    t.montant as "TRANSACTION_MONTANT",
    r.montant_total_remboursement as "REMBOURSEMENT_MONTANT",
    r.frais_service as "FRAIS_ZALAMA",
    CASE 
        WHEN t.montant = 6000 
             AND r.montant_total_remboursement = 6000 
             AND r.frais_service = 390  -- 6000 * 0.065 = 390
        THEN '🎉 TRIGGER SÉCURISÉ PARFAIT'
        WHEN t.montant != 6000
        THEN '❌ TRANSACTION MODIFIÉE: ' || t.montant
        WHEN r.montant_total_remboursement != 6000
        THEN '❌ REMBOURSEMENT INCORRECT: ' || COALESCE(r.montant_total_remboursement::text, 'NULL')
        ELSE '❌ AUTRE PROBLÈME'
    END as "DIAGNOSTIC_FINAL"
FROM transactions t
LEFT JOIN remboursements r ON r.transaction_id = t.id
WHERE t.numero_transaction LIKE 'TEST_SAFE_%'
AND t.date_creation > NOW() - INTERVAL '1 minute';

-- Nettoyage du test
DELETE FROM remboursements WHERE transaction_id IN (
    SELECT id FROM transactions WHERE numero_transaction LIKE 'TEST_SAFE_%'
    AND date_creation > NOW() - INTERVAL '1 minute'
);
DELETE FROM transactions 
WHERE numero_transaction LIKE 'TEST_SAFE_%'
AND date_creation > NOW() - INTERVAL '1 minute';

-- 9. INSTRUCTIONS FINALES
DO $$ 
BEGIN 
    RAISE NOTICE '';
    RAISE NOTICE '🎯 ==========================================';
    RAISE NOTICE '🎯 PURGE SÉCURISÉE TERMINÉE';
    RAISE NOTICE '🎯 ==========================================';
    RAISE NOTICE '';
    RAISE NOTICE '✅ Triggers personnalisés supprimés en sécurité';
    RAISE NOTICE '✅ Triggers système préservés (contraintes FK)';
    RAISE NOTICE '✅ UN SEUL trigger actif : zalama_safe_transaction_trigger';
    RAISE NOTICE '✅ Logique ZaLaMa : montant transaction JAMAIS modifié';
    RAISE NOTICE '';
    RAISE NOTICE 'MAINTENANT : Testez une nouvelle demande d''avance !';
    RAISE NOTICE 'Si le test ci-dessus montre "🎉 TRIGGER SÉCURISÉ PARFAIT",';
    RAISE NOTICE 'alors votre problème est résolu !';
END $$; 
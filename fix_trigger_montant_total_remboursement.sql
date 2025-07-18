-- ============================================================================
-- CORRECTION URGENTE : Trigger remboursement automatique - Logique ZaLaMa
-- ============================================================================
-- PROBLÈME IDENTIFIÉ : Le trigger ajoute les frais au lieu de respecter 
-- la logique ZaLaMa (partenaire rembourse montant demandé pur)

-- 1. DIAGNOSTIC DU PROBLÈME ACTUEL
SELECT 
    '=== DIAGNOSTIC TRIGGER ACTUEL ===' as diagnostic,
    t.montant as transaction_montant,
    r.montant_transaction as remb_montant_transaction,
    r.frais_service as remb_frais_service,
    r.montant_total_remboursement as remb_montant_total,
    CASE 
        WHEN r.montant_total_remboursement = t.montant THEN '✅ LOGIQUE CORRECTE'
        WHEN r.montant_total_remboursement = t.montant + r.frais_service THEN '❌ AJOUTE FRAIS (INCORRECT)'
        ELSE '❌ LOGIQUE INCONNUE'
    END as validation_logique
FROM transactions t
JOIN remboursements r ON t.id = r.transaction_id
WHERE t.description LIKE '%TEST_ZALAMA%'
OR r.commentaire_admin LIKE '%TEST_ZALAMA%';

-- 2. CORRIGER LA FONCTION TRIGGER
CREATE OR REPLACE FUNCTION create_automatic_reimbursement()
RETURNS TRIGGER AS $$
DECLARE
    v_demande_id UUID;
    v_employe_id UUID;
    v_partenaire_id UUID;
    existing_count INTEGER;
BEGIN
    -- Vérifier si la transaction passe à EFFECTUEE
    IF NEW.statut = 'EFFECTUEE' AND (OLD.statut IS NULL OR OLD.statut != 'EFFECTUEE') THEN
        
        -- Vérifier si un remboursement existe déjà
        SELECT COUNT(*) INTO existing_count 
        FROM remboursements 
        WHERE transaction_id = NEW.id;
        
        IF existing_count = 0 THEN
            BEGIN
                -- Récupérer les informations de la demande d'avance
                IF NEW.demande_avance_id IS NOT NULL THEN
                    SELECT sar.id, sar.employe_id, sar.partenaire_id 
                    INTO v_demande_id, v_employe_id, v_partenaire_id
                    FROM salary_advance_requests sar 
                    WHERE sar.id = NEW.demande_avance_id;
                ELSE
                    -- Fallback vers les infos de la transaction
                    v_demande_id := NEW.demande_avance_id;
                    v_employe_id := NEW.employe_id;
                    v_partenaire_id := NEW.entreprise_id;
                END IF;
                
                -- Créer le remboursement avec la VRAIE logique ZaLaMa
                IF v_employe_id IS NOT NULL AND v_partenaire_id IS NOT NULL THEN
                    INSERT INTO remboursements (
                        transaction_id,
                        demande_avance_id,
                        employe_id,
                        partenaire_id,
                        montant_transaction,              -- Montant de la transaction
                        frais_service,                   -- Frais ZaLaMa 6.5% (informatif)
                        montant_total_remboursement,     -- ✅ CRUCIAL : = montant_transaction (PAS + frais)
                        methode_remboursement,
                        date_creation,
                        date_transaction_effectuee,
                        date_limite_remboursement,
                        statut,
                        commentaire_admin,
                        created_at,
                        updated_at
                    ) VALUES (
                        NEW.id,
                        v_demande_id,
                        v_employe_id,
                        v_partenaire_id,
                        NEW.montant,                     -- Ex: 2000 GNF (montant demandé)
                        ROUND(NEW.montant * 0.065, 2),   -- Ex: 130 GNF (frais ZaLaMa - informatif)
                        NEW.montant,                     -- ✅ CORRECTION : 2000 GNF (PAS 2130!)
                        'VIREMENT_BANCAIRE',
                        NOW(),
                        NEW.date_transaction,
                        NEW.date_transaction + INTERVAL '30 days',
                        'EN_ATTENTE',
                        'Remboursement automatique - Logique ZaLaMa CORRECTE : partenaire rembourse le montant demandé pur',
                        NOW(),
                        NOW()
                    );
                    
                    RAISE NOTICE '✅ Remboursement automatique créé avec logique ZaLaMa correcte pour transaction %', NEW.id;
                ELSE
                    RAISE WARNING '⚠️ Impossible de créer remboursement automatique pour transaction % - informations manquantes', NEW.id;
                END IF;
                
            EXCEPTION WHEN OTHERS THEN
                RAISE WARNING '❌ Erreur création remboursement automatique pour transaction %: %', NEW.id, SQLERRM;
            END;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. RECRÉER LE TRIGGER
DROP TRIGGER IF EXISTS trigger_create_automatic_reimbursement ON transactions;

CREATE TRIGGER trigger_create_automatic_reimbursement
    AFTER INSERT OR UPDATE OF statut ON transactions
    FOR EACH ROW
    EXECUTE FUNCTION create_automatic_reimbursement();

-- 4. CORRIGER LES REMBOURSEMENTS EXISTANTS CRÉÉS AVEC L'ANCIENNE LOGIQUE
UPDATE remboursements 
SET 
    montant_total_remboursement = montant_transaction,
    commentaire_admin = COALESCE(commentaire_admin, '') || ' | Corrigé : logique ZaLaMa appliquée - partenaire rembourse montant demandé pur'
WHERE montant_total_remboursement = montant_transaction + frais_service
AND montant_total_remboursement != montant_transaction;

-- 5. DIAGNOSTIC APRÈS CORRECTION
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🔍 =======================================';
    RAISE NOTICE '🔍 DIAGNOSTIC APRÈS CORRECTION';
    RAISE NOTICE '🔍 =======================================';
END $$;

SELECT 
    '=== VÉRIFICATION POST-CORRECTION ===' as verification,
    COUNT(*) as total_remboursements,
    COUNT(CASE WHEN montant_total_remboursement = montant_transaction THEN 1 END) as logique_correcte,
    COUNT(CASE WHEN montant_total_remboursement = montant_transaction + frais_service THEN 1 END) as logique_incorrecte,
    ROUND(
        (COUNT(CASE WHEN montant_total_remboursement = montant_transaction THEN 1 END)::DECIMAL / COUNT(*)) * 100, 
        2
    ) as pourcentage_correct
FROM remboursements;

-- 6. VÉRIFICATION SPÉCIFIQUE POUR LES TEST_ZALAMA
SELECT 
    '=== RÉSULTATS TEST_ZALAMA APRÈS CORRECTION ===' as test_zalama,
    t.montant as transaction_montant,
    r.montant_transaction as remb_montant_transaction,
    r.frais_service as remb_frais_service,
    r.montant_total_remboursement as remb_montant_total,
    CASE 
        WHEN r.montant_total_remboursement = t.montant THEN '✅ LOGIQUE CORRECTE'
        ELSE '❌ LOGIQUE INCORRECTE'
    END as validation_logique,
    '✅ Employé a reçu: ' || (t.montant - r.frais_service) || ' GNF' as employe_recu,
    '✅ Partenaire rembourse: ' || r.montant_total_remboursement || ' GNF' as partenaire_paie,
    '✅ ZaLaMa garde: ' || r.frais_service || ' GNF' as zalama_profit
FROM transactions t
JOIN remboursements r ON t.id = r.transaction_id
WHERE t.description LIKE '%TEST_ZALAMA%'
OR r.commentaire_admin LIKE '%TEST_ZALAMA%';

-- 7. INSTRUCTIONS DE VALIDATION
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '📋 PROCHAINES ÉTAPES DE VALIDATION:';
    RAISE NOTICE '1. Vérifiez que tous les remboursements ont montant_total_remboursement = montant_transaction';
    RAISE NOTICE '2. Testez la création d''une nouvelle transaction pour valider le trigger';
    RAISE NOTICE '3. Vérifiez l''affichage dans la page remboursements';
    RAISE NOTICE '';
    RAISE NOTICE '🎯 LOGIQUE ZALAMA CORRECTE:';
    RAISE NOTICE '   - Employé demande: X GNF';
    RAISE NOTICE '   - Employé reçoit: X - 6.5%% GNF (via Lengo)';
    RAISE NOTICE '   - Partenaire rembourse: X GNF (montant demandé pur)';
    RAISE NOTICE '   - ZaLaMa garde: 6.5%% GNF (frais de service)';
    RAISE NOTICE '';
    RAISE NOTICE '✅ Trigger corrigé et remboursements existants mis à jour !';
END $$; 
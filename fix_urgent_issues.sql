-- ============================================================================
-- CORRECTIFS URGENTS : Contrainte unique + Statut transaction
-- ============================================================================

-- 1. SUPPRIMER les remboursements en double pour cette transaction spécifique
DELETE FROM remboursements 
WHERE transaction_id = 'fcc10eb9-2e00-4591-b1ba-be39fc94c1f8'
AND id NOT IN (
    SELECT MIN(id) 
    FROM remboursements 
    WHERE transaction_id = 'fcc10eb9-2e00-4591-b1ba-be39fc94c1f8'
);

-- 2. METTRE À JOUR le statut de la transaction qui est SUCCESS mais encore ANNULEE
UPDATE transactions 
SET 
    statut = 'EFFECTUEE',
    date_transaction = NOW(),
    updated_at = NOW()
WHERE numero_transaction = 'UFFuSDg2T2drS2FzTmhhc2RkWFBpNXZVbHJOSEZEZVI='
AND statut = 'ANNULEE';

-- 3. CORRIGER le trigger pour éviter les doublons
CREATE OR REPLACE FUNCTION create_automatic_reimbursement()
RETURNS TRIGGER AS $$
BEGIN
    -- Vérifier si la transaction vient d'être marquée comme EFFECTUEE
    IF NEW.statut = 'EFFECTUEE' AND (OLD.statut IS NULL OR OLD.statut != 'EFFECTUEE') THEN
        
        -- ✅ VÉRIFIER qu'un remboursement n'existe pas déjà (éviter les doublons)
        IF NOT EXISTS (SELECT 1 FROM remboursements WHERE transaction_id = NEW.id) THEN
            
            -- Récupérer les infos de la demande d'avance SEULEMENT si elle existe
            DECLARE
                v_demande_id UUID;
                v_employe_id UUID;
                v_partenaire_id UUID;
            BEGIN
                -- Vérifier si demande_avance_id existe
                IF NEW.demande_avance_id IS NOT NULL THEN
                    SELECT sar.id, sar.employe_id, sar.partenaire_id 
                    INTO v_demande_id, v_employe_id, v_partenaire_id
                    FROM salary_advance_requests sar 
                    WHERE sar.id = NEW.demande_avance_id;
                ELSE
                    -- Si pas de demande_avance_id, utiliser les infos de la transaction
                    v_demande_id := NEW.demande_avance_id;
                    v_employe_id := NEW.employe_id;
                    v_partenaire_id := NEW.entreprise_id;
                END IF;
                
                -- Insérer un remboursement automatique SEULEMENT si toutes les infos sont présentes
                IF v_employe_id IS NOT NULL AND v_partenaire_id IS NOT NULL THEN
                    INSERT INTO remboursements (
                        transaction_id,
                        demande_avance_id,
                        employe_id,
                        partenaire_id,
                        montant_transaction,
                        frais_service,
                        montant_total_remboursement,
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
                        NEW.montant,
                        ROUND(NEW.montant * 0.065, 2),
                        NEW.montant,
                        'VIREMENT_BANCAIRE',
                        NOW(),
                        NEW.date_transaction,
                        NEW.date_transaction + INTERVAL '30 days',
                        'EN_ATTENTE',
                        'Remboursement créé automatiquement - Logique ZaLaMa',
                        NOW(),
                        NOW()
                    );
                    
                    RAISE NOTICE 'Remboursement automatique créé pour transaction %', NEW.id;
                ELSE
                    RAISE WARNING 'Impossible de créer un remboursement automatique pour transaction % - informations manquantes', NEW.id;
                END IF;
                
            EXCEPTION WHEN OTHERS THEN
                RAISE WARNING 'Erreur création remboursement automatique pour transaction %: %', NEW.id, SQLERRM;
            END;
        ELSE
            RAISE NOTICE 'Remboursement existe déjà pour transaction %', NEW.id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. VÉRIFIER les résultats
SELECT 
    t.id,
    t.numero_transaction,
    t.statut as transaction_statut,
    t.montant,
    r.id as remboursement_id,
    r.statut as remboursement_statut,
    r.montant_total_remboursement
FROM transactions t
LEFT JOIN remboursements r ON t.id = r.transaction_id
WHERE t.numero_transaction = 'UFFuSDg2T2drS2FzTmhhc2RkWFBpNXZVbHJOSEZEZVI='; 
-- ============================================================================
-- CORRECTIF ÉTAPE PAR ÉTAPE : Nettoyer d'abord, contraintes ensuite
-- ============================================================================

-- ÉTAPE 1: SUPPRIMER toutes les contraintes qui posent problème
ALTER TABLE remboursements DROP CONSTRAINT IF EXISTS remboursements_montant_check;
ALTER TABLE remboursements DROP CONSTRAINT IF EXISTS remboursements_montant_rembourse_check;
ALTER TABLE remboursements DROP CONSTRAINT IF EXISTS check_montant_positif;
ALTER TABLE remboursements DROP CONSTRAINT IF EXISTS remboursements_montant_transaction_check;
ALTER TABLE remboursements DROP CONSTRAINT IF EXISTS remboursements_montant_total_check;

-- ÉTAPE 2: EXAMINER les données problématiques
SELECT 
    r.id,
    r.montant_transaction,
    r.montant_total_remboursement,
    r.frais_service,
    (r.montant_total_remboursement - r.montant_transaction) as difference,
    r.commentaire_admin
FROM remboursements r
WHERE r.montant_total_remboursement != r.montant_transaction
ORDER BY r.date_creation DESC;

-- ÉTAPE 3: CORRIGER les données AVANT d'ajouter les contraintes
UPDATE remboursements 
SET 
    montant_total_remboursement = montant_transaction,
    frais_service = ROUND(montant_transaction * 0.065, 2),
    commentaire_admin = COALESCE(commentaire_admin, '') || 
        CASE 
            WHEN commentaire_admin IS NULL OR commentaire_admin = '' 
            THEN 'Montant corrigé selon logique ZaLaMa'
            ELSE ' | Montant corrigé selon logique ZaLaMa'
        END,
    updated_at = NOW()
WHERE montant_total_remboursement != montant_transaction;

-- ÉTAPE 4: VÉRIFIER que toutes les données sont maintenant conformes
SELECT 
    COUNT(*) as total_remboursements,
    COUNT(CASE WHEN montant_total_remboursement = montant_transaction THEN 1 END) as conformes,
    COUNT(CASE WHEN montant_total_remboursement != montant_transaction THEN 1 END) as non_conformes
FROM remboursements;

-- ÉTAPE 5: SEULEMENT maintenant, ajouter les contraintes
ALTER TABLE remboursements 
ADD CONSTRAINT remboursements_montant_transaction_check 
CHECK (montant_transaction > 0);

ALTER TABLE remboursements 
ADD CONSTRAINT remboursements_montant_total_check 
CHECK (montant_total_remboursement > 0 AND montant_total_remboursement = montant_transaction);

-- ÉTAPE 6: CORRIGER le trigger pour les futurs remboursements
CREATE OR REPLACE FUNCTION create_automatic_reimbursement()
RETURNS TRIGGER AS $$
BEGIN
    -- Vérifier si la transaction vient d'être marquée comme EFFECTUEE
    IF NEW.statut = 'EFFECTUEE' AND (OLD.statut IS NULL OR OLD.statut != 'EFFECTUEE') THEN
        
        -- Vérifier qu'un remboursement n'existe pas déjà
        IF NOT EXISTS (SELECT 1 FROM remboursements WHERE transaction_id = NEW.id) THEN
            
            -- Récupérer les infos de la demande d'avance
            DECLARE
                v_demande_id UUID;
                v_employe_id UUID;
                v_partenaire_id UUID;
            BEGIN
                SELECT sar.id, sar.employe_id, sar.partenaire_id 
                INTO v_demande_id, v_employe_id, v_partenaire_id
                FROM salary_advance_requests sar 
                WHERE sar.id = NEW.demande_avance_id;
                
                -- Insérer un remboursement automatique avec la logique ZaLaMa correcte
                INSERT INTO remboursements (
                    transaction_id,
                    demande_avance_id,
                    employe_id,
                    partenaire_id,
                    montant_transaction,              -- Montant de la transaction
                    frais_service,                   -- Frais ZaLaMa 6.5%
                    montant_total_remboursement,     -- = montant_transaction (logique ZaLaMa)
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
                    NEW.montant,                     -- Ex: 2000 GNF
                    ROUND(NEW.montant * 0.065, 2),   -- Ex: 130 GNF (frais ZaLaMa)
                    NEW.montant,                     -- Ex: 2000 GNF (partenaire paie le montant demandé)
                    'VIREMENT_BANCAIRE',
                    NOW(),
                    NEW.date_transaction,
                    NEW.date_transaction + INTERVAL '30 days',
                    'EN_ATTENTE',
                    'Remboursement créé automatiquement - Logique ZaLaMa : partenaire rembourse le montant demandé pur',
                    NOW(),
                    NOW()
                );
                
                RAISE NOTICE 'Remboursement automatique créé pour transaction % avec montant %', NEW.id, NEW.montant;
                
            EXCEPTION WHEN OTHERS THEN
                RAISE WARNING 'Erreur création remboursement automatique: %', SQLERRM;
            END;
        ELSE
            RAISE NOTICE 'Remboursement existe déjà pour transaction %', NEW.id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ÉTAPE 7: VÉRIFICATION finale
SELECT 
    r.id as remboursement_id,
    r.montant_transaction,
    r.montant_total_remboursement,
    r.frais_service,
    CASE 
        WHEN r.montant_total_remboursement = r.montant_transaction THEN '✅ CORRECT'
        ELSE '❌ INCORRECT'
    END as status_logique,
    r.statut,
    r.date_creation
FROM remboursements r
ORDER BY r.date_creation DESC
LIMIT 10; 
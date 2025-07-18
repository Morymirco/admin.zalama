-- ============================================================================
-- CORRECTIF URGENT FINAL : Contrainte remboursement (avec VRAIES colonnes)
-- ============================================================================

-- 1. SUPPRIMER toutes les contraintes qui posent problème
ALTER TABLE remboursements DROP CONSTRAINT IF EXISTS remboursements_montant_check;
ALTER TABLE remboursements DROP CONSTRAINT IF EXISTS remboursements_montant_rembourse_check;
ALTER TABLE remboursements DROP CONSTRAINT IF EXISTS check_montant_positif;
ALTER TABLE remboursements DROP CONSTRAINT IF EXISTS remboursements_montant_transaction_check;
ALTER TABLE remboursements DROP CONSTRAINT IF EXISTS remboursements_montant_total_check;

-- 2. CORRIGER le trigger de création automatique avec les VRAIES colonnes
CREATE OR REPLACE FUNCTION create_automatic_reimbursement()
RETURNS TRIGGER AS $$
BEGIN
    -- Vérifier si la transaction vient d'être marquée comme EFFECTUEE
    IF NEW.statut = 'EFFECTUEE' AND (OLD.statut IS NULL OR OLD.statut != 'EFFECTUEE') THEN
        
        -- Récupérer les infos de la demande d'avance
        DECLARE
            v_demande_id UUID;
            v_employe_id UUID;
            v_partenaire_id UUID;
        BEGIN
            SELECT id, employe_id, partenaire_id 
            INTO v_demande_id, v_employe_id, v_partenaire_id
            FROM salary_advance_requests 
            WHERE id = NEW.demande_avance_id;
            
            -- Insérer un remboursement automatique avec les VRAIES colonnes
            INSERT INTO remboursements (
                transaction_id,
                demande_avance_id,
                employe_id,
                partenaire_id,
                montant_transaction,              -- ✅ VRAIE colonne
                frais_service,                   -- ✅ Frais ZaLaMa calculés
                montant_total_remboursement,     -- ✅ VRAIE colonne - ce que paie le partenaire
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
                NEW.montant,                     -- ✅ Montant de la transaction (ex: 2000 GNF)
                ROUND(NEW.montant * 0.065, 2),   -- ✅ Frais ZaLaMa 6.5% (ex: 130 GNF)
                NEW.montant,                     -- ✅ CRUCIAL : Partenaire paie le montant demandé pur
                'VIREMENT_BANCAIRE',
                NOW(),
                NEW.date_transaction,
                NEW.date_transaction + INTERVAL '30 days',
                'EN_ATTENTE',
                'Remboursement créé automatiquement - Logique ZaLaMa : partenaire rembourse le montant demandé pur',
                NOW(),
                NOW()
            );
            
            RAISE NOTICE 'Remboursement automatique créé pour transaction % avec montant_total_remboursement %', NEW.id, NEW.montant;
            
        EXCEPTION WHEN OTHERS THEN
            RAISE WARNING 'Erreur création remboursement automatique: %', SQLERRM;
        END;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. RECRÉER les contraintes avec les VRAIES colonnes
ALTER TABLE remboursements 
ADD CONSTRAINT remboursements_montant_transaction_check 
CHECK (montant_transaction > 0);

ALTER TABLE remboursements 
ADD CONSTRAINT remboursements_montant_total_check 
CHECK (montant_total_remboursement > 0 AND montant_total_remboursement = montant_transaction);

-- 4. NETTOYER les remboursements existants qui violent la contrainte
UPDATE remboursements 
SET montant_total_remboursement = montant_transaction,
    commentaire_admin = COALESCE(commentaire_admin, '') || ' | Montant corrigé selon logique ZaLaMa'
WHERE montant_total_remboursement != montant_transaction;

-- 5. VÉRIFICATION finale avec les VRAIES colonnes
SELECT 
    r.id as remboursement_id,
    r.montant_transaction,
    r.montant_total_remboursement,
    r.frais_service,
    CASE 
        WHEN r.montant_total_remboursement = r.montant_transaction THEN '✅ CORRECT'
        ELSE '❌ INCORRECT'
    END as status_logique,
    r.commentaire_admin
FROM remboursements r
WHERE r.date_creation >= CURRENT_DATE - INTERVAL '7 days'
ORDER BY r.date_creation DESC; 
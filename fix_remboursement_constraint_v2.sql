-- ============================================================================
-- CORRECTIF URGENT V2 : Contrainte remboursement (avec noms de colonnes corrects)
-- ============================================================================

-- 1. VÉRIFIER la structure de la table remboursements
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'remboursements' 
ORDER BY ordinal_position;

-- 2. SUPPRIMER les contraintes qui posent problème
ALTER TABLE remboursements DROP CONSTRAINT IF EXISTS remboursements_montant_check;
ALTER TABLE remboursements DROP CONSTRAINT IF EXISTS remboursements_montant_rembourse_check;
ALTER TABLE remboursements DROP CONSTRAINT IF EXISTS check_montant_positif;

-- 3. CORRIGER le trigger selon les vraies colonnes (probablement montant_rembourse)
CREATE OR REPLACE FUNCTION create_automatic_reimbursement()
RETURNS TRIGGER AS $$
BEGIN
    -- Vérifier si la transaction vient d'être marquée comme EFFECTUEE
    IF NEW.statut = 'EFFECTUEE' AND (OLD.statut IS NULL OR OLD.statut != 'EFFECTUEE') THEN
        
        -- Insérer un remboursement automatique avec le montant DEMANDÉ pur (logique ZaLaMa)
        INSERT INTO remboursements (
            transaction_id,
            entreprise_id,
            montant_rembourse,                 -- ✅ CORRECTION : colonne correcte
            frais_service,                     -- ✅ Frais ZaLaMa calculés
            montant_net,                       -- ✅ Ce qui a été payé à l'employé
            methode_paiement,
            date_creation,
            date_transaction,
            date_echeance,
            statut,
            commentaire_admin,
            date_creation_auto,
            date_modification
        ) VALUES (
            NEW.id,
            NEW.entreprise_id,
            NEW.montant,                       -- ✅ Montant demandé (ex: 2000 GNF)
            ROUND(NEW.montant * 0.065, 2),     -- ✅ Frais ZaLaMa 6.5%
            NEW.montant - ROUND(NEW.montant * 0.065, 2), -- ✅ Net employé
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
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. RECRÉER la contrainte avec le bon nom de colonne
ALTER TABLE remboursements 
ADD CONSTRAINT remboursements_montant_rembourse_check 
CHECK (montant_rembourse > 0 AND montant_rembourse <= (
    SELECT t.montant 
    FROM transactions t 
    WHERE t.id = transaction_id
));

-- 5. NETTOYER les remboursements existants qui violent la contrainte
UPDATE remboursements 
SET montant_rembourse = (
    SELECT t.montant 
    FROM transactions t 
    WHERE t.id = remboursements.transaction_id
),
commentaire_admin = COALESCE(commentaire_admin, '') || ' | Montant corrigé selon logique ZaLaMa'
WHERE montant_rembourse > (
    SELECT t.montant 
    FROM transactions t 
    WHERE t.id = remboursements.transaction_id
);

-- 6. VÉRIFICATION avec les vraies colonnes
SELECT 
    r.id as remboursement_id,
    t.montant as transaction_montant,
    r.montant_rembourse,
    r.frais_service,
    r.montant_net,
    CASE 
        WHEN r.montant_rembourse = t.montant THEN '✅ CORRECT'
        ELSE '❌ INCORRECT'
    END as status_logique
FROM remboursements r
JOIN transactions t ON r.transaction_id = t.id
WHERE r.date_creation >= CURRENT_DATE - INTERVAL '7 days'
ORDER BY r.date_creation DESC; 
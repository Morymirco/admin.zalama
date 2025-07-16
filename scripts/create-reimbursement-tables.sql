-- =====================================================
-- CRÉATION DES TABLES DE REMBOURSEMENT MANQUANTES
-- =====================================================

-- 1. Créer les types ENUM pour les remboursements
DO $$ BEGIN
    CREATE TYPE remboursement_statut AS ENUM (
        'EN_ATTENTE', 
        'PAYE', 
        'EN_RETARD', 
        'ANNULE'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE methode_remboursement AS ENUM (
        'VIREMENT_BANCAIRE',
        'MOBILE_MONEY',
        'ESPECES',
        'CHEQUE',
        'PRELEVEMENT_SALAIRE',
        'COMPENSATION_AVANCE'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Créer la table remboursements_integraux
CREATE TABLE IF NOT EXISTS remboursements_integraux (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Référence à la transaction réussie (EFFECTUEE)
  transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  
  -- Montants (basés sur la transaction réussie)
  montant_transaction DECIMAL(10,2) NOT NULL, -- Montant de la transaction EFFECTUEE
  frais_service DECIMAL(10,2) DEFAULT 0, -- Frais de service
  montant_total DECIMAL(10,2) NOT NULL, -- Montant total à rembourser (transaction + frais)
  
  -- Dates importantes
  date_creation TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  date_echeance TIMESTAMP WITH TIME ZONE NOT NULL, -- Date limite pour le remboursement (30 jours)
  date_paiement TIMESTAMP WITH TIME ZONE, -- Date du remboursement effectif
  
  -- Statut et suivi
  status remboursement_statut DEFAULT 'EN_ATTENTE',
  
  -- Références
  partenaire_id UUID REFERENCES partners(id),
  employe_id UUID REFERENCES employees(id),
  
  -- Informations de paiement
  numero_compte VARCHAR(100),
  numero_reception VARCHAR(100),
  reference_paiement VARCHAR(100),
  numero_transaction_remboursement VARCHAR(100),
  
  -- Commentaires
  description TEXT,
  commentaire_partenaire TEXT,
  commentaire_admin TEXT,
  motif_retard TEXT,
  
  -- Métadonnées
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Contraintes
  CONSTRAINT remboursements_integraux_transaction_unique UNIQUE (transaction_id),
  CONSTRAINT remboursements_integraux_montant_check CHECK (montant_total = montant_transaction + frais_service)
);

-- 3. Créer la table historique_remboursements_integraux
CREATE TABLE IF NOT EXISTS historique_remboursements_integraux (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Référence au remboursement
  remboursement_id UUID NOT NULL REFERENCES remboursements_integraux(id) ON DELETE CASCADE,
  
  -- Informations de l'action
  action VARCHAR(50) NOT NULL, -- 'CREATION', 'PAIEMENT', 'MODIFICATION', 'ANNULEMENT'
  details TEXT NOT NULL,
  
  -- Utilisateur qui a effectué l'action
  utilisateur_id UUID REFERENCES admin_users(id),
  
  -- Métadonnées
  date_action TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Créer les index pour les performances
CREATE INDEX IF NOT EXISTS idx_remboursements_integraux_transaction_id ON remboursements_integraux(transaction_id);
CREATE INDEX IF NOT EXISTS idx_remboursements_integraux_partenaire_id ON remboursements_integraux(partenaire_id);
CREATE INDEX IF NOT EXISTS idx_remboursements_integraux_employe_id ON remboursements_integraux(employe_id);
CREATE INDEX IF NOT EXISTS idx_remboursements_integraux_status ON remboursements_integraux(status);
CREATE INDEX IF NOT EXISTS idx_remboursements_integraux_date_creation ON remboursements_integraux(date_creation);
CREATE INDEX IF NOT EXISTS idx_remboursements_integraux_date_echeance ON remboursements_integraux(date_echeance);

CREATE INDEX IF NOT EXISTS idx_historique_remboursements_integraux_remboursement_id ON historique_remboursements_integraux(remboursement_id);
CREATE INDEX IF NOT EXISTS idx_historique_remboursements_integraux_date_action ON historique_remboursements_integraux(date_action);

-- 5. Créer les triggers pour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_remboursements_integraux_updated_at ON remboursements_integraux;
CREATE TRIGGER trigger_update_remboursements_integraux_updated_at
  BEFORE UPDATE ON remboursements_integraux
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 6. Créer les vues pour les rapports
CREATE OR REPLACE VIEW remboursements_integraux_details AS
SELECT 
  r.id,
  r.transaction_id,
  r.employe_id,
  e.nom as employe_nom,
  e.prenom as employe_prenom,
  e.email as employe_email,
  e.telephone as employe_telephone,
  r.partenaire_id,
  p.nom as partenaire_nom,
  p.email as partenaire_email,
  p.email_rh as partenaire_email_rh,
  p.telephone as partenaire_telephone,
  r.montant_transaction,
  r.frais_service,
  r.montant_total,
  r.status,
  r.date_creation,
  r.date_echeance,
  r.date_paiement,
  r.description,
  r.commentaire_partenaire,
  r.commentaire_admin,
  r.created_at,
  r.updated_at,
  -- Informations de la transaction
  t.numero_transaction,
  t.methode_paiement as methode_paiement_transaction,
  t.date_transaction,
  t.statut as statut_transaction,
  -- Calculs
  CASE 
    WHEN r.date_echeance < CURRENT_DATE AND r.status = 'EN_ATTENTE' 
    THEN CURRENT_DATE - r.date_echeance::date 
    ELSE 0 
  END as jours_retard
FROM remboursements_integraux r
LEFT JOIN employees e ON r.employe_id = e.id
LEFT JOIN partners p ON r.partenaire_id = p.id
LEFT JOIN transactions t ON r.transaction_id = t.id;

-- 7. Créer les politiques RLS
ALTER TABLE remboursements_integraux ENABLE ROW LEVEL SECURITY;
ALTER TABLE historique_remboursements_integraux ENABLE ROW LEVEL SECURITY;

-- Politiques pour remboursements_integraux
DROP POLICY IF EXISTS "Authenticated users have full access to remboursements_integraux" ON remboursements_integraux;
CREATE POLICY "Authenticated users have full access to remboursements_integraux" ON remboursements_integraux
  FOR ALL USING (auth.role() = 'authenticated');

-- Politiques pour historique_remboursements_integraux
DROP POLICY IF EXISTS "Authenticated users have full access to historique_remboursements_integraux" ON historique_remboursements_integraux;
CREATE POLICY "Authenticated users have full access to historique_remboursements_integraux" ON historique_remboursements_integraux
  FOR ALL USING (auth.role() = 'authenticated');

-- 8. Vérifier que les tables sont créées
SELECT 
    table_name,
    CASE 
        WHEN table_name IN ('remboursements_integraux', 'historique_remboursements_integraux') 
        THEN '✅ Créée' 
        ELSE '❌ Manquante' 
    END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('remboursements_integraux', 'historique_remboursements_integraux');

-- 9. Afficher un message de confirmation
DO $$
BEGIN
    RAISE NOTICE '✅ Tables de remboursement intégral créées avec succès!';
    RAISE NOTICE '📋 Tables créées:';
    RAISE NOTICE '   - remboursements_integraux';
    RAISE NOTICE '   - historique_remboursements_integraux';
    RAISE NOTICE '📊 Index et triggers configurés';
    RAISE NOTICE '🔒 Politiques RLS activées';
    RAISE NOTICE '📋 Vues de rapport créées';
END $$; 
-- =====================================================
-- SYSTÈME DE REMBOURSEMENT INTÉGRAL DES TRANSACTIONS RÉUSSIES
-- =====================================================
-- Ce fichier implémente un système de remboursement en paiement intégral
-- basé sur les transactions qui ont réussi (statut EFFECTUEE)

-- =====================================================
-- TYPES ENUM POUR LES REMBOURSEMENTS
-- =====================================================

-- Créer les types ENUM s'ils n'existent pas déjà
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

-- =====================================================
-- TABLE: remboursements
-- =====================================================

CREATE TABLE IF NOT EXISTS remboursements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Référence à la transaction réussie (EFFECTUEE)
  transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  demande_avance_id UUID NOT NULL REFERENCES salary_advance_requests(id) ON DELETE CASCADE,
  employe_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  partenaire_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  
  -- Montants (basés sur la transaction réussie)
  montant_transaction DECIMAL(10,2) NOT NULL, -- Montant de la transaction EFFECTUEE
  frais_service DECIMAL(10,2) DEFAULT 0, -- Frais de service
  montant_total_remboursement DECIMAL(10,2) NOT NULL, -- Montant total à rembourser (transaction + frais)
  
  -- Informations de remboursement
  methode_remboursement methode_remboursement NOT NULL,
  
  -- Dates importantes
  date_creation TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  date_transaction_effectuee TIMESTAMP WITH TIME ZONE NOT NULL, -- Date de la transaction réussie
  date_limite_remboursement TIMESTAMP WITH TIME ZONE NOT NULL, -- Date limite pour le remboursement (30 jours)
  date_remboursement_effectue TIMESTAMP WITH TIME ZONE, -- Date du remboursement effectif
  
  -- Statut et suivi
  statut remboursement_statut DEFAULT 'EN_ATTENTE',
  
  -- Informations de paiement
  numero_compte VARCHAR(100),
  numero_reception VARCHAR(100),
  reference_paiement VARCHAR(100),
  numero_transaction_remboursement VARCHAR(100),
  
  -- Commentaires et notes
  commentaire_partenaire TEXT,
  commentaire_admin TEXT,
  motif_retard TEXT,
  
  -- Métadonnées
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Contraintes
  CONSTRAINT remboursements_transaction_unique UNIQUE (transaction_id),
  CONSTRAINT remboursements_montant_check CHECK (montant_total_remboursement = montant_transaction + frais_service)
);

-- =====================================================
-- TABLE: historique_remboursements
-- =====================================================

CREATE TABLE IF NOT EXISTS historique_remboursements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Référence au remboursement
  remboursement_id UUID NOT NULL REFERENCES remboursements(id) ON DELETE CASCADE,
  
  -- Informations de l'action
  action VARCHAR(50) NOT NULL, -- 'CREATION', 'PAIEMENT', 'MODIFICATION', 'ANNULEMENT'
  montant_avant DECIMAL(10,2),
  montant_apres DECIMAL(10,2),
  statut_avant VARCHAR(20),
  statut_apres VARCHAR(20),
  
  -- Détails de l'action
  description TEXT NOT NULL,
  utilisateur_id UUID REFERENCES admin_users(id),
  
  -- Métadonnées
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES POUR LES PERFORMANCES
-- =====================================================

-- Index pour les remboursements
CREATE INDEX idx_remboursements_transaction_id ON remboursements(transaction_id);
CREATE INDEX idx_remboursements_demande_avance_id ON remboursements(demande_avance_id);
CREATE INDEX idx_remboursements_employe_id ON remboursements(employe_id);
CREATE INDEX idx_remboursements_partenaire_id ON remboursements(partenaire_id);
CREATE INDEX idx_remboursements_statut ON remboursements(statut);
CREATE INDEX idx_remboursements_date_creation ON remboursements(date_creation);
CREATE INDEX idx_remboursements_date_limite ON remboursements(date_limite_remboursement);

-- Index pour l'historique
CREATE INDEX idx_historique_remboursement_id ON historique_remboursements(remboursement_id);
CREATE INDEX idx_historique_created_at ON historique_remboursements(created_at);

-- =====================================================
-- VUES POUR LES RAPPORTS
-- =====================================================

-- Vue des remboursements avec détails complets (paiement intégral)
CREATE OR REPLACE VIEW remboursements_details AS
SELECT 
  r.id,
  r.transaction_id,
  r.demande_avance_id,
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
  r.montant_total_remboursement,
  r.methode_remboursement,
  r.statut,
  r.date_creation,
  r.date_transaction_effectuee,
  r.date_limite_remboursement,
  r.date_remboursement_effectue,
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
    WHEN r.date_limite_remboursement < CURRENT_DATE AND r.statut = 'EN_ATTENTE' 
    THEN CURRENT_DATE - r.date_limite_remboursement::date 
    ELSE 0 
  END as jours_retard
FROM remboursements r
LEFT JOIN employees e ON r.employe_id = e.id
LEFT JOIN partners p ON r.partenaire_id = p.id
LEFT JOIN transactions t ON r.transaction_id = t.id;

-- Vue des transactions réussies sans remboursement
CREATE OR REPLACE VIEW transactions_sans_remboursement AS
SELECT 
  t.id as transaction_id,
  t.demande_avance_id,
  t.employe_id,
  e.nom as employe_nom,
  e.prenom as employe_prenom,
  e.email as employe_email,
  t.entreprise_id as partenaire_id,
  p.nom as partenaire_nom,
  p.email as partenaire_email,
  p.email_rh as partenaire_email_rh,
  t.montant,
  t.numero_transaction,
  t.methode_paiement,
  t.date_transaction,
  t.statut,
  t.created_at,
  -- Informations de la demande d'avance
  sar.motif,
  sar.type_motif,
  sar.frais_service,
  -- Calcul du montant total à rembourser
  t.montant + COALESCE(sar.frais_service, 0) as montant_total_remboursement
FROM transactions t
LEFT JOIN employees e ON t.employe_id = e.id
LEFT JOIN partners p ON t.entreprise_id = p.id
LEFT JOIN salary_advance_requests sar ON t.demande_avance_id = sar.id
WHERE t.statut = 'EFFECTUEE'
  AND NOT EXISTS (
    SELECT 1 FROM remboursements r WHERE r.transaction_id = t.id
  );

-- Vue des statistiques de remboursement par partenaire
CREATE OR REPLACE VIEW statistiques_remboursement_partenaire AS
SELECT 
  p.id as partenaire_id,
  p.nom as partenaire_nom,
  COUNT(r.id) as total_remboursements,
  COUNT(CASE WHEN r.statut = 'EN_ATTENTE' THEN 1 END) as remboursements_en_attente,
  COUNT(CASE WHEN r.statut = 'PAYE' THEN 1 END) as remboursements_payes,
  COUNT(CASE WHEN r.statut = 'EN_RETARD' THEN 1 END) as remboursements_en_retard,
  SUM(r.montant_transaction) as montant_total_transactions,
  SUM(r.montant_total_remboursement) as montant_total_a_rembourser,
  SUM(CASE WHEN r.statut = 'PAYE' THEN r.montant_total_remboursement ELSE 0 END) as montant_total_rembourse,
  AVG(r.montant_transaction) as montant_moyen_transaction,
  CASE 
    WHEN SUM(r.montant_total_remboursement) > 0 
    THEN (SUM(CASE WHEN r.statut = 'PAYE' THEN r.montant_total_remboursement ELSE 0 END) / SUM(r.montant_total_remboursement)) * 100 
    ELSE 0 
  END as taux_remboursement,
  -- Statistiques des transactions réussies
  COUNT(DISTINCT t.id) as total_transactions_reussies,
  SUM(t.montant) as montant_total_transactions_reussies
FROM partners p
LEFT JOIN transactions t ON p.id = t.entreprise_id AND t.statut = 'EFFECTUEE'
LEFT JOIN remboursements r ON t.id = r.transaction_id
GROUP BY p.id, p.nom;

-- Vue des remboursements en retard
CREATE OR REPLACE VIEW remboursements_en_retard AS
SELECT 
  r.id,
  r.transaction_id,
  r.employe_id,
  e.nom as employe_nom,
  e.prenom as employe_prenom,
  r.partenaire_id,
  p.nom as partenaire_nom,
  p.email_rh as partenaire_email_rh,
  p.telephone as partenaire_telephone,
  r.montant_transaction,
  r.montant_total_remboursement,
  r.date_limite_remboursement,
  CURRENT_DATE - r.date_limite_remboursement::date as jours_retard
FROM remboursements r
LEFT JOIN employees e ON r.employe_id = e.id
LEFT JOIN partners p ON r.partenaire_id = p.id
WHERE r.statut = 'EN_ATTENTE' 
  AND r.date_limite_remboursement < CURRENT_DATE;

-- =====================================================
-- FONCTIONS POUR LA GESTION AUTOMATIQUE
-- =====================================================

-- Fonction pour créer automatiquement un remboursement lors d'une transaction réussie
CREATE OR REPLACE FUNCTION creer_remboursement_integral_automatique()
RETURNS TRIGGER AS $$
DECLARE
  montant_transaction DECIMAL(10,2);
  frais_service DECIMAL(10,2);
  montant_total_remboursement DECIMAL(10,2);
  date_limite_remboursement TIMESTAMP WITH TIME ZONE;
  demande_avance_id UUID;
  employe_id UUID;
  partenaire_id UUID;
BEGIN
  -- Vérifier si c'est une nouvelle transaction réussie
  IF NEW.statut = 'EFFECTUEE' AND (OLD.statut IS NULL OR OLD.statut != 'EFFECTUEE') THEN
    -- Récupérer les informations de la demande d'avance
    SELECT 
      sar.id,
      sar.employe_id,
      sar.partenaire_id,
      COALESCE(sar.frais_service, 0)
    INTO demande_avance_id, employe_id, partenaire_id, frais_service
    FROM salary_advance_requests sar
    WHERE sar.id = NEW.demande_avance_id;
    
    -- Récupérer les montants
    montant_transaction := NEW.montant;
    montant_total_remboursement := montant_transaction + frais_service;
    
    -- Calculer la date limite de remboursement (30 jours après la transaction)
    date_limite_remboursement := NEW.date_transaction + INTERVAL '30 days';
    
    -- Créer le remboursement
    INSERT INTO remboursements (
      transaction_id,
      demande_avance_id,
      employe_id,
      partenaire_id,
      montant_transaction,
      frais_service,
      montant_total_remboursement,
      methode_remboursement,
      date_transaction_effectuee,
      date_limite_remboursement,
      statut
    ) VALUES (
      NEW.id,
      demande_avance_id,
      employe_id,
      partenaire_id,
      montant_transaction,
      frais_service,
      montant_total_remboursement,
      'VIREMENT_BANCAIRE',
      NEW.date_transaction,
      date_limite_remboursement,
      'EN_ATTENTE'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour effectuer un remboursement intégral
CREATE OR REPLACE FUNCTION effectuer_remboursement_integral(
  p_remboursement_id UUID,
  p_methode_remboursement methode_remboursement,
  p_numero_transaction VARCHAR(100),
  p_numero_reception VARCHAR(100),
  p_reference_paiement VARCHAR(100),
  p_commentaire TEXT,
  p_utilisateur_id UUID
)
RETURNS JSONB AS $$
DECLARE
  v_remboursement remboursements%ROWTYPE;
  v_result JSONB;
BEGIN
  -- Récupérer le remboursement
  SELECT * INTO v_remboursement
  FROM remboursements
  WHERE id = p_remboursement_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Remboursement non trouvé';
  END IF;
  
  -- Vérifier que le remboursement est en attente
  IF v_remboursement.statut != 'EN_ATTENTE' THEN
    RAISE EXCEPTION 'Le remboursement ne peut être effectué que s''il est en attente';
  END IF;
  
  -- Mettre à jour le remboursement
  UPDATE remboursements
  SET statut = 'PAYE',
      date_remboursement_effectue = CURRENT_TIMESTAMP,
      methode_remboursement = p_methode_remboursement,
      numero_transaction_remboursement = p_numero_transaction,
      numero_reception = p_numero_reception,
      reference_paiement = p_reference_paiement,
      commentaire_partenaire = p_commentaire,
      updated_at = CURRENT_TIMESTAMP
  WHERE id = p_remboursement_id;
  
  -- Enregistrer dans l'historique
  INSERT INTO historique_remboursements (
    remboursement_id,
    action,
    montant_avant,
    montant_apres,
    statut_avant,
    statut_apres,
    description,
    utilisateur_id
  ) VALUES (
    p_remboursement_id,
    'PAIEMENT',
    v_remboursement.montant_total_remboursement,
    v_remboursement.montant_total_remboursement,
    v_remboursement.statut,
    'PAYE',
    'Remboursement intégral effectué: ' || v_remboursement.montant_total_remboursement || ' FCFA',
    p_utilisateur_id
  );
  
  -- Retourner le résultat
  SELECT jsonb_build_object(
    'success', true,
    'remboursement_id', p_remboursement_id,
    'montant_rembourse', v_remboursement.montant_total_remboursement,
    'message', 'Remboursement intégral effectué avec succès'
  ) INTO v_result;
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour mettre à jour les remboursements en retard
CREATE OR REPLACE FUNCTION mettre_a_jour_remboursements_retard()
RETURNS VOID AS $$
BEGIN
  -- Marquer les remboursements en retard
  UPDATE remboursements 
  SET statut = 'EN_RETARD'
  WHERE statut = 'EN_ATTENTE' 
    AND date_limite_remboursement < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Trigger pour créer automatiquement un remboursement lors d'une transaction réussie
DROP TRIGGER IF EXISTS trigger_creer_remboursement_integral_automatique ON transactions;
CREATE TRIGGER trigger_creer_remboursement_integral_automatique
  AFTER UPDATE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION creer_remboursement_integral_automatique();

-- Trigger pour mettre à jour les timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_remboursements_updated_at ON remboursements;
CREATE TRIGGER trigger_update_remboursements_updated_at
  BEFORE UPDATE ON remboursements
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- FONCTION POUR EXÉCUTER LA MAINTENANCE QUOTIDIENNE
-- =====================================================

-- Cette fonction peut être appelée par un cron job quotidien
CREATE OR REPLACE FUNCTION maintenance_quotidienne_remboursements()
RETURNS VOID AS $$
BEGIN
  -- Mettre à jour les remboursements en retard
  PERFORM mettre_a_jour_remboursements_retard();
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- COMMENTAIRES
-- =====================================================

COMMENT ON TABLE remboursements IS 'Table principale pour gérer les remboursements intégraux basés sur les transactions réussies (EFFECTUEE)';
COMMENT ON TABLE historique_remboursements IS 'Table pour tracer l''historique des actions sur les remboursements';
COMMENT ON FUNCTION creer_remboursement_integral_automatique() IS 'Fonction déclenchée automatiquement lors d''une transaction réussie (EFFECTUEE)';
COMMENT ON FUNCTION maintenance_quotidienne_remboursements() IS 'Fonction de maintenance quotidienne pour mettre à jour les statuts';
COMMENT ON VIEW transactions_sans_remboursement IS 'Vue des transactions réussies qui n''ont pas encore de remboursement créé';
COMMENT ON VIEW remboursements_en_retard IS 'Vue des remboursements en retard (dépassant la date limite)'; 
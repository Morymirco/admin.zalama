-- =====================================================
-- FICHIER SQL SÉPARÉ POUR LES DEMANDES ET TRANSACTIONS
-- =====================================================
-- Ce fichier peut être exécuté indépendamment du schéma principal
-- pour ajouter les tables de demandes d'avance sur salaire et transactions

-- =====================================================
-- TYPES ENUM POUR LES DEMANDES ET TRANSACTIONS
-- =====================================================

-- Créer les types ENUM s'ils n'existent pas déjà
DO $$ BEGIN
    CREATE TYPE demande_statut AS ENUM ('EN_ATTENTE', 'APPROUVE', 'REFUSE', 'PAYE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE transaction_statut AS ENUM ('EFFECTUEE', 'ANNULEE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE methode_paiement AS ENUM ('VIREMENT_BANCAIRE', 'MOBILE_MONEY', 'ESPECES', 'CHEQUE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- =====================================================
-- TABLE: demandes_avance_salaire
-- =====================================================

-- Supprimer la table si elle existe déjà
DROP TABLE IF EXISTS demandes_avance_salaire CASCADE;

CREATE TABLE demandes_avance_salaire (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  employe_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  montant_demande DECIMAL(10,2) NOT NULL,
  motif TEXT NOT NULL,
  date_demande TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  statut demande_statut DEFAULT 'EN_ATTENTE',
  commentaire TEXT,
  date_traitement TIMESTAMP WITH TIME ZONE,
  numero_reception VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLE: transactions
-- =====================================================

-- Supprimer la table si elle existe déjà
DROP TABLE IF EXISTS transactions CASCADE;

CREATE TABLE transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  demande_avance_id UUID REFERENCES demandes_avance_salaire(id) ON DELETE CASCADE,
  employe_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  entreprise_id UUID REFERENCES partners(id) ON DELETE CASCADE,
  montant DECIMAL(10,2) NOT NULL,
  numero_transaction VARCHAR(100) UNIQUE NOT NULL,
  methode_paiement methode_paiement NOT NULL,
  numero_compte VARCHAR(100),
  numero_reception VARCHAR(100),
  date_transaction TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  recu_url VARCHAR(500),
  date_creation TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  statut transaction_statut DEFAULT 'EFFECTUEE',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES POUR LES NOUVELLES TABLES
-- =====================================================

-- Index pour demandes_avance_salaire
CREATE INDEX idx_demandes_avance_employe_id ON demandes_avance_salaire(employe_id);
CREATE INDEX idx_demandes_avance_statut ON demandes_avance_salaire(statut);
CREATE INDEX idx_demandes_avance_date_demande ON demandes_avance_salaire(date_demande);

-- Index pour transactions
CREATE INDEX idx_transactions_demande_avance_id ON transactions(demande_avance_id);
CREATE INDEX idx_transactions_employe_id ON transactions(employe_id);
CREATE INDEX idx_transactions_entreprise_id ON transactions(entreprise_id);
CREATE INDEX idx_transactions_numero_transaction ON transactions(numero_transaction);
CREATE INDEX idx_transactions_date_transaction ON transactions(date_transaction);
CREATE INDEX idx_transactions_statut ON transactions(statut);

-- =====================================================
-- TRIGGERS POUR LES NOUVELLES TABLES
-- =====================================================

-- Fonction pour mettre à jour updated_at (si elle n'existe pas déjà)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger pour demandes_avance_salaire
DROP TRIGGER IF EXISTS trigger_update_demandes_avance_updated_at ON demandes_avance_salaire;
CREATE TRIGGER trigger_update_demandes_avance_updated_at
  BEFORE UPDATE ON demandes_avance_salaire
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger pour transactions
DROP TRIGGER IF EXISTS trigger_update_transactions_updated_at ON transactions;
CREATE TRIGGER trigger_update_transactions_updated_at
  BEFORE UPDATE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- POLITIQUES RLS POUR LES NOUVELLES TABLES
-- =====================================================

-- Activer RLS sur les nouvelles tables
ALTER TABLE demandes_avance_salaire ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Politiques pour demandes_avance_salaire
DROP POLICY IF EXISTS "Authenticated users have full access to demandes_avance_salaire" ON demandes_avance_salaire;
CREATE POLICY "Authenticated users have full access to demandes_avance_salaire" ON demandes_avance_salaire
  FOR ALL USING (auth.role() = 'authenticated');

-- Politiques pour transactions
DROP POLICY IF EXISTS "Authenticated users have full access to transactions" ON transactions;
CREATE POLICY "Authenticated users have full access to transactions" ON transactions
  FOR ALL USING (auth.role() = 'authenticated');

-- =====================================================
-- VUES POUR LES DEMANDES ET TRANSACTIONS
-- =====================================================

-- Vue des demandes avec informations employé et entreprise
DROP VIEW IF EXISTS demandes_avance_details;
CREATE VIEW demandes_avance_details AS
SELECT 
  das.id,
  das.employe_id,
  e.nom as employe_nom,
  e.prenom as employe_prenom,
  e.email as employe_email,
  p.id as entreprise_id,
  p.nom as entreprise_nom,
  p.email as entreprise_email,
  p.email_rh as entreprise_email_rh,
  das.montant_demande,
  das.motif,
  das.date_demande,
  das.statut,
  das.commentaire,
  das.date_traitement,
  das.numero_reception,
  das.created_at,
  das.updated_at
FROM demandes_avance_salaire das
LEFT JOIN employees e ON das.employe_id = e.id
LEFT JOIN partners p ON e.partner_id = p.id;

-- Vue des transactions avec informations complètes
DROP VIEW IF EXISTS transactions_details;
CREATE VIEW transactions_details AS
SELECT 
  t.id,
  t.demande_avance_id,
  t.employe_id,
  e.nom as employe_nom,
  e.prenom as employe_prenom,
  e.email as employe_email,
  t.entreprise_id,
  p.nom as entreprise_nom,
  p.email as entreprise_email,
  p.email_rh as entreprise_email_rh,
  t.montant,
  t.numero_transaction,
  t.methode_paiement,
  t.numero_compte,
  t.numero_reception,
  t.date_transaction,
  t.recu_url as recu,
  t.date_creation,
  t.statut,
  t.created_at,
  t.updated_at
FROM transactions t
LEFT JOIN employees e ON t.employe_id = e.id
LEFT JOIN partners p ON t.entreprise_id = p.id;

-- Vue des statistiques des demandes par entreprise
DROP VIEW IF EXISTS demandes_statistiques_entreprise;
CREATE VIEW demandes_statistiques_entreprise AS
SELECT 
  p.id as entreprise_id,
  p.nom as entreprise_nom,
  COUNT(das.id) as total_demandes,
  COUNT(CASE WHEN das.statut = 'EN_ATTENTE' THEN 1 END) as demandes_en_attente,
  COUNT(CASE WHEN das.statut = 'APPROUVE' THEN 1 END) as demandes_approvees,
  COUNT(CASE WHEN das.statut = 'REFUSE' THEN 1 END) as demandes_refusees,
  COUNT(CASE WHEN das.statut = 'PAYE' THEN 1 END) as demandes_payees,
  SUM(das.montant_demande) as montant_total_demande,
  AVG(das.montant_demande) as montant_moyen_demande
FROM partners p
LEFT JOIN employees e ON p.id = e.partner_id
LEFT JOIN demandes_avance_salaire das ON e.id = das.employe_id
GROUP BY p.id, p.nom;

-- =====================================================
-- DONNÉES DE TEST (optionnel)
-- =====================================================

-- Insérer quelques demandes de test (décommentez si nécessaire)
/*
INSERT INTO demandes_avance_salaire (employe_id, montant_demande, motif, statut) VALUES
('EMPLOYEE_ID_1', 50000.00, 'Urgence médicale', 'EN_ATTENTE'),
('EMPLOYEE_ID_2', 75000.00, 'Réparation véhicule', 'APPROUVE'),
('EMPLOYEE_ID_3', 30000.00, 'Frais de scolarité', 'REFUSE');

-- Insérer quelques transactions de test (décommentez si nécessaire)
INSERT INTO transactions (demande_avance_id, employe_id, entreprise_id, montant, numero_transaction, methode_paiement, statut) VALUES
('DEMANDE_ID_1', 'EMPLOYEE_ID_1', 'PARTNER_ID_1', 50000.00, 'TXN001', 'VIREMENT_BANCAIRE', 'EFFECTUEE'),
('DEMANDE_ID_2', 'EMPLOYEE_ID_2', 'PARTNER_ID_1', 75000.00, 'TXN002', 'MOBILE_MONEY', 'EFFECTUEE');
*/

-- =====================================================
-- MESSAGE DE CONFIRMATION
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE 'Tables demandes_avance_salaire et transactions créées avec succès!';
  RAISE NOTICE 'Vues demandes_avance_details, transactions_details et demandes_statistiques_entreprise créées!';
  RAISE NOTICE 'Index et triggers configurés!';
  RAISE NOTICE 'Politiques RLS activées!';
END $$; 
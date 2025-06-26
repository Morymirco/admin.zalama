-- =====================================================
-- SCHEMA COMPLET ZALAMA ADMIN - SUPABASE
-- =====================================================

-- Supprimer toutes les tables existantes (ordre inverse des dépendances)
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS performance_metrics CASCADE;
DROP TABLE IF EXISTS financial_transactions CASCADE;
DROP TABLE IF EXISTS alerts CASCADE;
DROP TABLE IF EXISTS employees CASCADE;
DROP TABLE IF EXISTS services CASCADE;
DROP TABLE IF EXISTS partners CASCADE;
DROP TABLE IF EXISTS admin_users CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS demandes_avance_salaire CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;

-- Supprimer tous les types ENUM existants
DROP TYPE IF EXISTS notification_type CASCADE;
DROP TYPE IF EXISTS transaction_status CASCADE;
DROP TYPE IF EXISTS transaction_type CASCADE;
DROP TYPE IF EXISTS alert_status CASCADE;
DROP TYPE IF EXISTS alert_type CASCADE;
DROP TYPE IF EXISTS employee_contract_type CASCADE;
DROP TYPE IF EXISTS employee_gender CASCADE;
DROP TYPE IF EXISTS user_status CASCADE;
DROP TYPE IF EXISTS user_type CASCADE;
DROP TYPE IF EXISTS admin_role CASCADE;
DROP TYPE IF EXISTS demande_statut CASCADE;
DROP TYPE IF EXISTS transaction_statut CASCADE;
DROP TYPE IF EXISTS methode_paiement CASCADE;

-- Types ENUM
CREATE TYPE user_type AS ENUM ('Étudiant', 'Salarié', 'Entreprise');
CREATE TYPE user_status AS ENUM ('Actif', 'Inactif', 'En attente');
CREATE TYPE employee_gender AS ENUM ('Homme', 'Femme', 'Autre');
CREATE TYPE employee_contract_type AS ENUM ('CDI', 'CDD', 'Consultant', 'Stage', 'Autre');
CREATE TYPE alert_type AS ENUM ('Critique', 'Importante', 'Information');
CREATE TYPE alert_status AS ENUM ('Résolue', 'En cours', 'Nouvelle');
CREATE TYPE transaction_type AS ENUM ('Débloqué', 'Récupéré', 'Revenu', 'Remboursement');
CREATE TYPE transaction_status AS ENUM ('En attente', 'Validé', 'Rejeté', 'Annulé');
CREATE TYPE notification_type AS ENUM ('Information', 'Alerte', 'Succès', 'Erreur');
CREATE TYPE admin_role AS ENUM ('admin', 'user', 'rh', 'responsable');
CREATE TYPE demande_statut AS ENUM ('EN_ATTENTE', 'APPROUVE', 'REFUSE', 'PAYE');
CREATE TYPE transaction_statut AS ENUM ('EFFECTUEE', 'ANNULEE');
CREATE TYPE methode_paiement AS ENUM ('VIREMENT_BANCAIRE', 'MOBILE_MONEY', 'ESPECES', 'CHEQUE');

-- =====================================================
-- TABLE: admin_users (Utilisateurs d'administration)
-- =====================================================
CREATE TABLE admin_users (
  id UUID PRIMARY KEY, -- Utilise l'ID de Supabase Auth
  email VARCHAR(255) UNIQUE NOT NULL,
  display_name VARCHAR(200) NOT NULL,
  role admin_role NOT NULL DEFAULT 'user',
  partenaire_id UUID, -- Référence vers partners si l'utilisateur est lié à un partenaire
  active BOOLEAN DEFAULT true,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLE: users (Utilisateurs finaux)
-- =====================================================
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  nom VARCHAR(100) NOT NULL,
  prenom VARCHAR(100) NOT NULL,
  telephone VARCHAR(20),
  adresse TEXT,
  type user_type NOT NULL DEFAULT 'Étudiant',
  statut user_status NOT NULL DEFAULT 'En attente',
  photo_url VARCHAR(500),
  organisation VARCHAR(200),
  poste VARCHAR(100),
  niveau_etudes VARCHAR(100),
  etablissement VARCHAR(200),
  date_inscription TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  derniere_connexion TIMESTAMP WITH TIME ZONE,
  actif BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLE: partners
-- =====================================================
CREATE TABLE partners (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nom VARCHAR(200) NOT NULL,
  type VARCHAR(100) NOT NULL,
  secteur VARCHAR(100) NOT NULL,
  description TEXT,
  
  -- Représentant
  nom_representant VARCHAR(200),
  email_representant VARCHAR(255),
  telephone_representant VARCHAR(20),
  
  -- Responsable RH
  nom_rh VARCHAR(200),
  email_rh VARCHAR(255),
  telephone_rh VARCHAR(20),
  
  -- Informations légales
  rccm VARCHAR(100),
  nif VARCHAR(100),
  email VARCHAR(255),
  telephone VARCHAR(20),
  adresse TEXT,
  site_web VARCHAR(255),
  
  -- Autres
  logo_url VARCHAR(500),
  date_adhesion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  actif BOOLEAN DEFAULT true,
  nombre_employes INTEGER DEFAULT 0,
  salaire_net_total DECIMAL(15,2) DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLE: employees
-- =====================================================
CREATE TABLE employees (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  partner_id UUID REFERENCES partners(id) ON DELETE CASCADE,
  nom VARCHAR(100) NOT NULL,
  prenom VARCHAR(100) NOT NULL,
  genre employee_gender NOT NULL,
  email VARCHAR(255),
  telephone VARCHAR(20),
  adresse TEXT,
  poste VARCHAR(100) NOT NULL,
  role VARCHAR(100),
  type_contrat employee_contract_type NOT NULL,
  salaire_net DECIMAL(10,2),
  date_embauche DATE,
  actif BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLE: services (MISE À JOUR AVEC fraisAttribues)
-- =====================================================
CREATE TABLE services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nom VARCHAR(200) NOT NULL,
  description TEXT,
  categorie VARCHAR(100) NOT NULL,
  frais_attribues DECIMAL(10,2), -- Nouveau champ pour les frais en FG
  pourcentage_max DECIMAL(5,2), -- Pourcentage maximum
  duree VARCHAR(50),
  disponible BOOLEAN DEFAULT true,
  image_url VARCHAR(500),
  date_creation TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLE: alerts
-- =====================================================
CREATE TABLE alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  titre VARCHAR(200) NOT NULL,
  description TEXT,
  type alert_type NOT NULL,
  statut alert_status NOT NULL DEFAULT 'Nouvelle',
  source VARCHAR(100),
  assigne_a UUID REFERENCES admin_users(id),
  date_creation TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  date_resolution TIMESTAMP WITH TIME ZONE,
  priorite INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLE: financial_transactions
-- =====================================================
CREATE TABLE financial_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  montant DECIMAL(15,2) NOT NULL,
  type transaction_type NOT NULL,
  description TEXT,
  partenaire_id UUID REFERENCES partners(id),
  utilisateur_id UUID REFERENCES users(id),
  service_id UUID REFERENCES services(id),
  statut transaction_status NOT NULL DEFAULT 'En attente',
  date_transaction TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  date_validation TIMESTAMP WITH TIME ZONE,
  reference VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLE: performance_metrics
-- =====================================================
CREATE TABLE performance_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nom VARCHAR(100) NOT NULL,
  valeur DECIMAL(10,2) NOT NULL,
  unite VARCHAR(20),
  categorie VARCHAR(100),
  date_mesure DATE NOT NULL,
  periode VARCHAR(20) DEFAULT 'jour',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLE: notifications
-- =====================================================
CREATE TABLE notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES admin_users(id) ON DELETE CASCADE,
  titre VARCHAR(200) NOT NULL,
  message TEXT,
  type notification_type NOT NULL DEFAULT 'Information',
  lu BOOLEAN DEFAULT false,
  date_creation TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  date_lecture TIMESTAMP WITH TIME ZONE
);

-- =====================================================
-- TABLE: demandes_avance_salaire
-- =====================================================
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
-- INDEXES
-- =====================================================

-- Index pour admin_users
CREATE INDEX idx_admin_users_email ON admin_users(email);
CREATE INDEX idx_admin_users_role ON admin_users(role);
CREATE INDEX idx_admin_users_active ON admin_users(active);
CREATE INDEX idx_admin_users_partenaire_id ON admin_users(partenaire_id);

-- Index pour users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_type ON users(type);
CREATE INDEX idx_users_statut ON users(statut);
CREATE INDEX idx_users_date_inscription ON users(date_inscription);

-- Index pour partners
CREATE INDEX idx_partners_nom ON partners(nom);
CREATE INDEX idx_partners_type ON partners(type);
CREATE INDEX idx_partners_actif ON partners(actif);

-- Index pour employees
CREATE INDEX idx_employees_partner_id ON employees(partner_id);
CREATE INDEX idx_employees_actif ON employees(actif);

-- Index pour services
CREATE INDEX idx_services_categorie ON services(categorie);
CREATE INDEX idx_services_disponible ON services(disponible);
CREATE INDEX idx_services_frais_attribues ON services(frais_attribues);

-- Index pour alerts
CREATE INDEX idx_alerts_type ON alerts(type);
CREATE INDEX idx_alerts_statut ON alerts(statut);
CREATE INDEX idx_alerts_date_creation ON alerts(date_creation);

-- Index pour financial_transactions
CREATE INDEX idx_financial_transactions_date ON financial_transactions(date_transaction);
CREATE INDEX idx_financial_transactions_type ON financial_transactions(type);
CREATE INDEX idx_financial_transactions_statut ON financial_transactions(statut);

-- Index pour performance_metrics
CREATE INDEX idx_performance_metrics_date ON performance_metrics(date_mesure);
CREATE INDEX idx_performance_metrics_categorie ON performance_metrics(categorie);

-- Index pour notifications
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_lu ON notifications(lu);
CREATE INDEX idx_notifications_date_creation ON notifications(date_creation);

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
-- VUES
-- =====================================================

-- Vue des statistiques utilisateurs
CREATE VIEW user_statistics AS
SELECT 
  COUNT(*) as total_users,
  COUNT(CASE WHEN actif = true THEN 1 END) as active_users,
  COUNT(CASE WHEN actif = false THEN 1 END) as inactive_users,
  COUNT(CASE WHEN type = 'Étudiant' THEN 1 END) as students,
  COUNT(CASE WHEN type = 'Salarié' THEN 1 END) as employees,
  COUNT(CASE WHEN type = 'Entreprise' THEN 1 END) as companies
FROM users;

-- Vue des performances financières
CREATE VIEW financial_performance AS
SELECT 
  DATE_TRUNC('month', date_transaction) as month,
  SUM(CASE WHEN type = 'Revenu' THEN montant ELSE 0 END) as revenue,
  SUM(CASE WHEN type = 'Débloqué' THEN montant ELSE 0 END) as disbursed,
  SUM(CASE WHEN type = 'Récupéré' THEN montant ELSE 0 END) as recovered,
  COUNT(*) as total_transactions
FROM financial_transactions
GROUP BY DATE_TRUNC('month', date_transaction)
ORDER BY month DESC;

-- Vue des alertes actives
CREATE VIEW active_alerts AS
SELECT 
  a.*,
  au.display_name as assigned_to_name
FROM alerts a
LEFT JOIN admin_users au ON a.assigne_a = au.id
WHERE a.statut IN ('Nouvelle', 'En cours')
ORDER BY a.priorite DESC, a.date_creation DESC;

-- Vue des statistiques partenaires
CREATE VIEW partner_statistics AS
SELECT 
  COUNT(*) as total_partners,
  COUNT(CASE WHEN actif = true THEN 1 END) as active_partners,
  COUNT(CASE WHEN actif = false THEN 1 END) as inactive_partners,
  SUM(nombre_employes) as total_employees,
  AVG(nombre_employes) as avg_employees_per_partner,
  SUM(salaire_net_total) as total_salary
FROM partners;

-- Vue des statistiques services
CREATE VIEW service_statistics AS
SELECT 
  COUNT(*) as total_services,
  COUNT(CASE WHEN disponible = true THEN 1 END) as available_services,
  COUNT(CASE WHEN disponible = false THEN 1 END) as unavailable_services,
  AVG(frais_attribues) as avg_fees,
  SUM(frais_attribues) as total_fees
FROM services;

-- Vue des demandes avec informations employé et entreprise
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
-- TRIGGERS ET FONCTIONS
-- =====================================================

-- Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour admin_users
CREATE TRIGGER trigger_update_admin_users_updated_at
  BEFORE UPDATE ON admin_users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Triggers pour users
CREATE TRIGGER trigger_update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Triggers pour partners
CREATE TRIGGER trigger_update_partners_updated_at
  BEFORE UPDATE ON partners
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Triggers pour employees
CREATE TRIGGER trigger_update_employees_updated_at
  BEFORE UPDATE ON employees
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Triggers pour services
CREATE TRIGGER trigger_update_services_updated_at
  BEFORE UPDATE ON services
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Triggers pour alerts
CREATE TRIGGER trigger_update_alerts_updated_at
  BEFORE UPDATE ON alerts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Triggers pour financial_transactions
CREATE TRIGGER trigger_update_financial_transactions_updated_at
  BEFORE UPDATE ON financial_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Triggers pour demandes_avance_salaire
CREATE TRIGGER trigger_update_demandes_avance_updated_at
  BEFORE UPDATE ON demandes_avance_salaire
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Triggers pour transactions
CREATE TRIGGER trigger_update_transactions_updated_at
  BEFORE UPDATE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- FONCTIONS MÉTIER
-- =====================================================

-- Fonction pour créer une alerte
CREATE OR REPLACE FUNCTION create_alert(
  p_titre VARCHAR(200),
  p_description TEXT,
  p_type alert_type,
  p_source VARCHAR(100),
  p_assigne_a UUID DEFAULT NULL,
  p_priorite INTEGER DEFAULT 1
)
RETURNS UUID AS $$
DECLARE
  v_alert_id UUID;
BEGIN
  INSERT INTO alerts (titre, description, type, source, assigne_a, priorite)
  VALUES (p_titre, p_description, p_type, p_source, p_assigne_a, p_priorite)
  RETURNING id INTO v_alert_id;
  
  RETURN v_alert_id;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour calculer les statistiques partenaires
CREATE OR REPLACE FUNCTION calculate_partner_stats(p_partner_id UUID)
RETURNS TABLE (
  total_employees INTEGER,
  active_employees INTEGER,
  total_salary DECIMAL(15,2),
  avg_salary DECIMAL(10,2)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::INTEGER as total_employees,
    COUNT(CASE WHEN e.actif = true THEN 1 END)::INTEGER as active_employees,
    COALESCE(SUM(e.salaire_net), 0) as total_salary,
    COALESCE(AVG(e.salaire_net), 0) as avg_salary
  FROM employees e
  WHERE e.partner_id = p_partner_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- POLITIQUES RLS (Row Level Security) - CORRIGÉES
-- =====================================================

-- Activer RLS sur toutes les tables
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE demandes_avance_salaire ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Politiques simplifiées pour admin_users (éviter la récursion)
CREATE POLICY "Users can view their own profile" ON admin_users
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "Users can update their own profile" ON admin_users
  FOR UPDATE USING (id = auth.uid());

-- Politiques pour les autres tables (accès complet pour les utilisateurs authentifiés)
CREATE POLICY "Authenticated users have full access to users" ON users
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users have full access to partners" ON partners
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users have full access to employees" ON employees
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users have full access to services" ON services
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users have full access to alerts" ON alerts
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users have full access to financial_transactions" ON financial_transactions
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users have full access to performance_metrics" ON performance_metrics
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Authenticated users can manage notifications" ON notifications
  FOR ALL USING (auth.role() = 'authenticated');

-- Politiques pour demandes_avance_salaire
CREATE POLICY "Authenticated users have full access to demandes_avance_salaire" ON demandes_avance_salaire
  FOR ALL USING (auth.role() = 'authenticated');

-- Politiques pour transactions
CREATE POLICY "Authenticated users have full access to transactions" ON transactions
  FOR ALL USING (auth.role() = 'authenticated');

-- =====================================================
-- DONNÉES DE TEST
-- =====================================================

-- Insérer quelques partenaires de test
INSERT INTO partners (nom, type, secteur, description, email, telephone, actif) VALUES
('TechCorp', 'Entreprise', 'Technologie', 'Entreprise spécialisée dans le développement logiciel', 'contact@techcorp.com', '+1234567890', true),
('EduPlus', 'Institution', 'Éducation', 'Institution éducative de premier plan', 'info@eduplus.com', '+1234567891', true),
('HealthCare Solutions', 'Organisation', 'Santé', 'Organisation de santé innovante', 'contact@healthcare.com', '+1234567892', true);

-- Insérer le service "Avance sur salaire" avec les nouvelles données
INSERT INTO services (nom, description, categorie, frais_attribues, pourcentage_max, duree, disponible) VALUES
('Avance sur salaire', 'Service permettant aux employés de recevoir une partie de leur salaire avant la date de paiement officielle, en cas de besoin urgent. L''avance est remboursée automatiquement lors du versement du salaire.', 'Finances / Services aux employés', 15000.00, 30.00, '24-48 heures', true);

-- Insérer quelques autres services de test
INSERT INTO services (nom, description, categorie, frais_attribues, pourcentage_max, duree, disponible) VALUES
('Consultation IT', 'Service de consultation en informatique', 'Consultation', 50000.00, 15.00, '2 heures', true),
('Formation Web', 'Formation en développement web', 'Formation', 150000.00, 20.00, '40 heures', true),
('Support Technique', 'Support technique 24/7', 'Support', 25000.00, 10.00, '1 heure', true);

-- Insérer quelques métriques de performance de test
INSERT INTO performance_metrics (nom, valeur, unite, categorie, date_mesure) VALUES
('Utilisateurs actifs', 150, 'utilisateurs', 'engagement', CURRENT_DATE),
('Taux de conversion', 12.5, '%', 'business', CURRENT_DATE),
('Temps de réponse', 2.3, 'secondes', 'performance', CURRENT_DATE); 
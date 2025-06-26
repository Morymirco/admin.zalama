-- =====================================================
-- SCHEMA COMPLET ZALAMA ADMIN - SUPABASE
-- =====================================================

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

-- =====================================================
-- TABLE: users
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
-- TABLE: services
-- =====================================================
CREATE TABLE services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nom VARCHAR(200) NOT NULL,
  description TEXT,
  categorie VARCHAR(100) NOT NULL,
  prix DECIMAL(10,2) NOT NULL,
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
  assigne_a UUID REFERENCES users(id),
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
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  titre VARCHAR(200) NOT NULL,
  message TEXT,
  type notification_type NOT NULL DEFAULT 'Information',
  lu BOOLEAN DEFAULT false,
  date_creation TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  date_lecture TIMESTAMP WITH TIME ZONE
);

-- =====================================================
-- INDEXES POUR LES PERFORMANCES
-- =====================================================
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_type ON users(type);
CREATE INDEX idx_users_statut ON users(statut);
CREATE INDEX idx_users_date_inscription ON users(date_inscription);

CREATE INDEX idx_partners_nom ON partners(nom);
CREATE INDEX idx_partners_type ON partners(type);
CREATE INDEX idx_partners_actif ON partners(actif);

CREATE INDEX idx_employees_partner_id ON employees(partner_id);
CREATE INDEX idx_employees_actif ON employees(actif);

CREATE INDEX idx_services_categorie ON services(categorie);
CREATE INDEX idx_services_disponible ON services(disponible);

CREATE INDEX idx_alerts_type ON alerts(type);
CREATE INDEX idx_alerts_statut ON alerts(statut);
CREATE INDEX idx_alerts_date_creation ON alerts(date_creation);

CREATE INDEX idx_financial_transactions_date ON financial_transactions(date_transaction);
CREATE INDEX idx_financial_transactions_type ON financial_transactions(type);
CREATE INDEX idx_financial_transactions_statut ON financial_transactions(statut);

CREATE INDEX idx_performance_metrics_date ON performance_metrics(date_mesure);
CREATE INDEX idx_performance_metrics_categorie ON performance_metrics(categorie);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_lu ON notifications(lu);
CREATE INDEX idx_notifications_date_creation ON notifications(date_creation);

-- =====================================================
-- VUES POUR LES STATISTIQUES
-- =====================================================

-- Vue pour les statistiques utilisateurs
CREATE VIEW user_statistics AS
SELECT 
  COUNT(*) as total_users,
  COUNT(*) FILTER (WHERE statut = 'Actif') as active_users,
  COUNT(*) FILTER (WHERE statut = 'Inactif') as inactive_users,
  COUNT(*) FILTER (WHERE date_inscription >= NOW() - INTERVAL '30 days') as new_users_month,
  COUNT(*) FILTER (WHERE type = 'Étudiant') as students,
  COUNT(*) FILTER (WHERE type = 'Salarié') as employees,
  COUNT(*) FILTER (WHERE type = 'Entreprise') as companies
FROM users;

-- Vue pour les statistiques financières
CREATE VIEW financial_performance AS
SELECT 
  SUM(montant) FILTER (WHERE type = 'Revenu') as total_revenue,
  SUM(montant) FILTER (WHERE type = 'Débloqué') as total_disbursed,
  SUM(montant) FILTER (WHERE type = 'Récupéré') as total_recovered,
  COUNT(*) as total_transactions,
  COUNT(*) FILTER (WHERE statut = 'Validé') as validated_transactions
FROM financial_transactions;

-- Vue pour les alertes actives
CREATE VIEW active_alerts AS
SELECT 
  COUNT(*) as total_alerts,
  COUNT(*) FILTER (WHERE type = 'Critique') as critical_alerts,
  COUNT(*) FILTER (WHERE type = 'Importante') as important_alerts,
  COUNT(*) FILTER (WHERE statut = 'Nouvelle') as new_alerts,
  COUNT(*) FILTER (WHERE statut = 'En cours') as in_progress_alerts
FROM alerts;

-- Vue pour les statistiques partenaires
CREATE VIEW partner_statistics AS
SELECT 
  COUNT(*) as total_partners,
  COUNT(*) FILTER (WHERE actif = true) as active_partners,
  COUNT(*) FILTER (WHERE actif = false) as inactive_partners,
  COUNT(*) FILTER (WHERE date_adhesion >= NOW() - INTERVAL '30 days') as new_partners_month,
  SUM(nombre_employes) as total_employees,
  AVG(nombre_employes) as avg_employees_per_partner
FROM partners;

-- =====================================================
-- FONCTIONS ET TRIGGERS
-- =====================================================

-- Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour mettre à jour updated_at automatiquement
CREATE TRIGGER trigger_update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_partners_updated_at
  BEFORE UPDATE ON partners
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_employees_updated_at
  BEFORE UPDATE ON employees
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_services_updated_at
  BEFORE UPDATE ON services
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_alerts_updated_at
  BEFORE UPDATE ON alerts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_financial_transactions_updated_at
  BEFORE UPDATE ON financial_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Fonction pour créer une alerte automatiquement
CREATE OR REPLACE FUNCTION create_alert(
  p_titre VARCHAR(200),
  p_description TEXT,
  p_type alert_type,
  p_source VARCHAR(100) DEFAULT NULL,
  p_assigne_a UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  alert_id UUID;
BEGIN
  INSERT INTO alerts (titre, description, type, source, assigne_a)
  VALUES (p_titre, p_description, p_type, p_source, p_assigne_a)
  RETURNING id INTO alert_id;
  
  RETURN alert_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- POLITIQUES RLS (Row Level Security)
-- =====================================================

-- Activer RLS sur toutes les tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Politiques pour les utilisateurs (exemple - à adapter selon vos besoins)
CREATE POLICY "Users can view their own data" ON users
  FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update their own data" ON users
  FOR UPDATE USING (auth.uid()::text = id::text);

-- Politiques pour les partenaires (lecture publique, écriture admin)
CREATE POLICY "Partners are viewable by everyone" ON partners
  FOR SELECT USING (true);

CREATE POLICY "Partners can be created by authenticated users" ON partners
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Politiques pour les employés
CREATE POLICY "Employees are viewable by everyone" ON employees
  FOR SELECT USING (true);

CREATE POLICY "Employees can be created by authenticated users" ON employees
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Politiques pour les services
CREATE POLICY "Services are viewable by everyone" ON services
  FOR SELECT USING (true);

CREATE POLICY "Services can be created by authenticated users" ON services
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Politiques pour les alertes
CREATE POLICY "Alerts are viewable by authenticated users" ON alerts
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Alerts can be created by authenticated users" ON alerts
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Politiques pour les transactions financières
CREATE POLICY "Financial transactions are viewable by authenticated users" ON financial_transactions
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Financial transactions can be created by authenticated users" ON financial_transactions
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Politiques pour les notifications
CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Notifications can be created by authenticated users" ON notifications
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- =====================================================
-- DONNÉES DE TEST
-- =====================================================

-- Insérer quelques partenaires de test
INSERT INTO partners (nom, type, secteur, description, email, telephone, actif) VALUES
('TechCorp', 'Entreprise', 'Technologie', 'Entreprise spécialisée dans le développement logiciel', 'contact@techcorp.com', '+1234567890', true),
('EduPlus', 'Institution', 'Éducation', 'Institution éducative de premier plan', 'info@eduplus.com', '+1234567891', true),
('HealthCare Solutions', 'Organisation', 'Santé', 'Organisation de santé innovante', 'contact@healthcare.com', '+1234567892', true);

-- Insérer quelques services de test
INSERT INTO services (nom, description, categorie, prix, disponible) VALUES
('Consultation IT', 'Service de consultation en informatique', 'Consultation', 150.00, true),
('Formation Web', 'Formation en développement web', 'Formation', 500.00, true),
('Support Technique', 'Support technique 24/7', 'Support', 100.00, true);

-- Insérer quelques métriques de performance de test
INSERT INTO performance_metrics (nom, valeur, unite, categorie, date_mesure) VALUES
('Utilisateurs actifs', 150, 'utilisateurs', 'engagement', CURRENT_DATE),
('Taux de conversion', 12.5, '%', 'business', CURRENT_DATE),
('Temps de réponse', 2.3, 'secondes', 'performance', CURRENT_DATE); 
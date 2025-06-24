-- =====================================================
-- SCHEMA COMPLET ZALAMA ADMIN - SUPABASE (CORRIGÉ)
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
CREATE TYPE widget_type AS ENUM ('statistiques', 'graphique', 'liste', 'alerte', 'performance');

-- =====================================================
-- TABLE: users
-- =====================================================
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
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
-- TABLE: user_activities
-- =====================================================
CREATE TABLE user_activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
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
-- TABLE: dashboard_widgets
-- =====================================================
CREATE TABLE dashboard_widgets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nom VARCHAR(100) NOT NULL,
  type widget_type NOT NULL,
  configuration JSONB,
  position_x INTEGER DEFAULT 0,
  position_y INTEGER DEFAULT 0,
  largeur INTEGER DEFAULT 1,
  hauteur INTEGER DEFAULT 1,
  actif BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEX
-- =====================================================

-- Index pour les utilisateurs
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_type ON users(type);
CREATE INDEX idx_users_statut ON users(statut);
CREATE INDEX idx_users_date_inscription ON users(date_inscription);

-- Index pour les partenaires
CREATE INDEX idx_partners_nom ON partners(nom);
CREATE INDEX idx_partners_type ON partners(type);
CREATE INDEX idx_partners_actif ON partners(actif);

-- Index pour les employés
CREATE INDEX idx_employees_partner_id ON employees(partner_id);
CREATE INDEX idx_employees_actif ON employees(actif);

-- Index pour les services
CREATE INDEX idx_services_categorie ON services(categorie);
CREATE INDEX idx_services_disponible ON services(disponible);

-- Index pour les alertes
CREATE INDEX idx_alerts_type ON alerts(type);
CREATE INDEX idx_alerts_statut ON alerts(statut);
CREATE INDEX idx_alerts_date_creation ON alerts(date_creation);

-- Index pour les transactions financières
CREATE INDEX idx_financial_transactions_date ON financial_transactions(date_transaction);
CREATE INDEX idx_financial_transactions_type ON financial_transactions(type);
CREATE INDEX idx_financial_transactions_statut ON financial_transactions(statut);

-- Index pour les métriques de performance
CREATE INDEX idx_performance_metrics_date ON performance_metrics(date_mesure);
CREATE INDEX idx_performance_metrics_categorie ON performance_metrics(categorie);

-- Index pour les activités utilisateur
CREATE INDEX idx_user_activities_user_id ON user_activities(user_id);
CREATE INDEX idx_user_activities_created_at ON user_activities(created_at);

-- Index pour les notifications
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_lu ON notifications(lu);
CREATE INDEX idx_notifications_date_creation ON notifications(date_creation);

-- =====================================================
-- VUES
-- =====================================================

-- Vue pour les statistiques des utilisateurs
CREATE VIEW user_statistics AS
SELECT 
  COUNT(*) as total_users,
  COUNT(*) FILTER (WHERE statut = 'Actif') as active_users,
  COUNT(*) FILTER (WHERE type = 'Étudiant') as student_users,
  COUNT(*) FILTER (WHERE type = 'Salarié') as employee_users,
  COUNT(*) FILTER (WHERE type = 'Entreprise') as business_users,
  COUNT(*) FILTER (WHERE date_inscription >= CURRENT_DATE - INTERVAL '30 days') as new_users_month
FROM users;

-- Vue pour les performances financières
CREATE VIEW financial_performance AS
SELECT 
  SUM(montant) FILTER (WHERE type = 'Débloqué') as total_debloque,
  SUM(montant) FILTER (WHERE type = 'Récupéré') as total_recupere,
  SUM(montant) FILTER (WHERE type = 'Revenu') as total_revenus,
  SUM(montant) FILTER (WHERE type = 'Remboursement') as total_remboursements,
  COUNT(*) as total_transactions,
  AVG(montant) as montant_moyen
FROM financial_transactions
WHERE statut = 'Validé';

-- Vue pour les alertes actives
CREATE VIEW active_alerts AS
SELECT 
  id,
  titre,
  description,
  type,
  statut,
  source,
  assigne_a,
  date_creation,
  priorite
FROM alerts
WHERE statut IN ('Nouvelle', 'En cours')
ORDER BY priorite DESC, date_creation DESC;

-- Vue pour les statistiques des partenaires
CREATE VIEW partner_statistics AS
SELECT 
  p.id,
  p.nom,
  p.type,
  p.actif,
  COUNT(e.id) as nombre_employes,
  COALESCE(SUM(e.salaire_net), 0) as salaire_total,
  p.created_at
FROM partners p
LEFT JOIN employees e ON p.id = e.partner_id AND e.actif = true
GROUP BY p.id, p.nom, p.type, p.actif, p.created_at;

-- =====================================================
-- FONCTIONS
-- =====================================================

-- Fonction pour récupérer les statistiques du dashboard
CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'users', (SELECT row_to_json(us) FROM user_statistics us),
    'financial', (SELECT row_to_json(fp) FROM financial_performance fp),
    'alerts', (SELECT COUNT(*) FROM active_alerts),
    'partners', (SELECT COUNT(*) FROM partners WHERE actif = true)
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour créer une alerte
CREATE OR REPLACE FUNCTION create_alert(
  p_titre VARCHAR(200),
  p_description TEXT,
  p_type alert_type,
  p_source VARCHAR(100),
  p_priorite INTEGER DEFAULT 1
)
RETURNS UUID AS $$
DECLARE
  alert_id UUID;
BEGIN
  INSERT INTO alerts (titre, description, type, source, priorite)
  VALUES (p_titre, p_description, p_type, p_source, p_priorite)
  RETURNING id INTO alert_id;
  
  RETURN alert_id;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour mettre à jour les statistiques des partenaires
CREATE OR REPLACE FUNCTION update_partner_statistics()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' OR TG_OP = 'DELETE' THEN
    UPDATE partners 
    SET 
      nombre_employes = (
        SELECT COUNT(*) 
        FROM employees 
        WHERE partner_id = COALESCE(NEW.partner_id, OLD.partner_id) 
        AND actif = true
      ),
      salaire_net_total = (
        SELECT COALESCE(SUM(salaire_net), 0) 
        FROM employees 
        WHERE partner_id = COALESCE(NEW.partner_id, OLD.partner_id) 
        AND actif = true
      )
    WHERE id = COALESCE(NEW.partner_id, OLD.partner_id);
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Trigger pour mettre à jour les statistiques des partenaires
CREATE TRIGGER trigger_update_partner_statistics
  AFTER INSERT OR UPDATE OR DELETE ON employees
  FOR EACH ROW
  EXECUTE FUNCTION update_partner_statistics();

-- Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

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

CREATE TRIGGER trigger_update_dashboard_widgets_updated_at
  BEFORE UPDATE ON dashboard_widgets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- DONNÉES DE TEST
-- =====================================================

-- Insertion d'un utilisateur admin
INSERT INTO users (email, password_hash, nom, prenom, type, statut, organisation) VALUES
('admin@zalama.com', '$2a$10$dummy.hash.for.testing', 'Admin', 'ZaLaMa', 'Entreprise', 'Actif', 'ZaLaMa Admin');

-- Insertion de partenaires de test
INSERT INTO partners (nom, type, secteur, description, email, telephone, adresse) VALUES
('Tech Solutions SARL', 'Entreprise', 'Technologie', 'Solutions technologiques innovantes pour les entreprises', 'contact@techsolutions.com', '+224 123 456 789', 'Conakry, Guinée'),
('Formation Plus', 'Centre de formation', 'Éducation', 'Centre de formation professionnelle de qualité', 'info@formationplus.com', '+224 987 654 321', 'Conakry, Guinée'),
('Digital Agency', 'Agence', 'Marketing', 'Agence de marketing digital et communication', 'hello@digitalagency.com', '+224 555 123 456', 'Conakry, Guinée');

-- Insertion de services de test
INSERT INTO services (nom, description, categorie, prix, duree, disponible) VALUES
('Formation Web Development', 'Formation complète en développement web moderne', 'Formation', 250000, '3 mois', true),
('Consultation IT', 'Consultation en technologies de l''information', 'Consultation', 150000, '1 jour', true),
('Maintenance Système', 'Maintenance et support technique des systèmes', 'Support', 75000, '1 mois', true),
('Développement Mobile', 'Développement d''applications mobiles natives', 'Développement', 500000, '2 mois', true);

-- Insertion d'alertes de test
INSERT INTO alerts (titre, description, type, source, priorite) VALUES
('Nouveau partenaire inscrit', 'Tech Solutions SARL vient de s''inscrire comme partenaire', 'Information', 'Système', 1),
('Maintenance prévue', 'Maintenance du système prévue ce weekend', 'Importante', 'Système', 3),
('Paiement en retard', 'Paiement en retard pour le service Formation Web Development', 'Critique', 'Finance', 5);

-- Insertion de transactions financières de test
INSERT INTO financial_transactions (montant, type, description, statut, reference) VALUES
(25000000, 'Débloqué', 'Fonds débloqués pour le programme de formation', 'Validé', 'REF-2024-001'),
(950000, 'Débloqué', 'Fonds pour consultation IT', 'Validé', 'REF-2024-002'),
(75000, 'Récupéré', 'Remboursement maintenance système', 'Validé', 'REF-2024-003'),
(50000, 'Revenu', 'Revenus générés par les services', 'Validé', 'REF-2024-004');

-- Insertion de métriques de performance de test
INSERT INTO performance_metrics (nom, valeur, unite, categorie, date_mesure, periode) VALUES
('Utilisateurs actifs', 5200, 'utilisateurs', 'Utilisateurs', CURRENT_DATE, 'jour'),
('Nouveaux inscrits', 870, 'utilisateurs', 'Utilisateurs', CURRENT_DATE, 'mois'),
('Taux de conversion', 85.5, '%', 'Performance', CURRENT_DATE, 'mois'),
('Revenus mensuels', 1500000, 'GNF', 'Finance', CURRENT_DATE, 'mois'); 
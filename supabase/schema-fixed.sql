-- =====================================================
-- SCHEMA COMPLET ZALAMA ADMIN - SUPABASE (CORRIGÉ ET MIS À JOUR)
-- =====================================================

-- Types ENUM (inchangés)
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
CREATE TYPE partnership_request_status AS ENUM ('En attente', 'Validée', 'Rejetée'); -- Nouveau type ENUM pour les demandes

-- =====================================================
-- TABLE: users (inchangée)
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
-- TABLE: partners (modifiée pour ajouter poste_representant)
-- =====================================================
CREATE TABLE partners (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nom VARCHAR(200) NOT NULL,
  type VARCHAR(100) NOT NULL,
  secteur VARCHAR(100) NOT NULL,
  description TEXT,
  nom_representant VARCHAR(200),
  email_representant VARCHAR(255),
  telephone_representant VARCHAR(20),
  poste_representant VARCHAR(100), -- Ajout pour correspondre à legalPosition du formulaire
  nom_rh VARCHAR(200),
  email_rh VARCHAR(255),
  telephone_rh VARCHAR(20),
  rccm VARCHAR(100),
  nif VARCHAR(100),
  email VARCHAR(255),
  telephone VARCHAR(20),
  adresse TEXT,
  site_web VARCHAR(255),
  logo_url VARCHAR(500),
  date_adhesion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  actif BOOLEAN DEFAULT true,
  nombre_employes INTEGER DEFAULT 0,
  salaire_net_total DECIMAL(15,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- NOUVELLE TABLE: partnership_requests
-- =====================================================
CREATE TABLE partnership_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nom_entreprise VARCHAR(200) NOT NULL,
  rccm VARCHAR(100) NOT NULL,
  nif VARCHAR(100) NOT NULL,
  adresse VARCHAR(255) NOT NULL,
  type_entreprise VARCHAR(100), -- Optionnel, ex. "SARL", "SA"
  secteur VARCHAR(100), -- Optionnel, ex. "Technologie"
  email_entreprise VARCHAR(255), -- Optionnel
  telephone_entreprise VARCHAR(20), -- Optionnel
  nom_representant VARCHAR(100) NOT NULL,
  poste_representant VARCHAR(100) NOT NULL, -- Correspond à legalPosition
  email_representant VARCHAR(255) NOT NULL,
  telephone_representant VARCHAR(20) NOT NULL,
  nom_rh VARCHAR(100) NOT NULL,
  email_rh VARCHAR(255) NOT NULL,
  telephone_rh VARCHAR(20) NOT NULL,
  agreement BOOLEAN NOT NULL DEFAULT false, -- Engagement du formulaire
  statut partnership_request_status NOT NULL DEFAULT 'En attente',
  commentaire_rejet TEXT, -- Raison du rejet, si applicable
  date_soumission TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  date_validation TIMESTAMP WITH TIME ZONE, -- Date de validation/rejet
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLE: employees (corrigée)
-- =====================================================
CREATE TABLE employees (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  partner_id UUID REFERENCES partners(id) ON DELETE CASCADE, -- Changé de BIGINT à UUID
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
-- TABLE: services (inchangée)
-- =====================================================
CREATE TABLE services (
  id BIGINT PRIMARY KEY,
  nom VARCHAR(255) NOT NULL,
  description TEXT,
  categorie VARCHAR(255),
  prix DECIMAL(10,2) NOT NULL,
  duree VARCHAR(255),
  disponible BOOLEAN DEFAULT true,
  image_url VARCHAR(255),
  date_creation TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLE: alerts (inchangée)
-- =====================================================
-- =====================================================
-- TABLE: alerts (corrigée)
-- =====================================================
CREATE TABLE alerts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY, -- Utilise uuid_generate_v4() pour compatibilité
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
-- TABLE: financial_transactions (inchangée)
-- =====================================================
CREATE TABLE financial_transactions (
    transaction_id BIGINT PRIMARY KEY,
    montant DECIMAL(10,2) NOT NULL,
    type VARCHAR(255) NOT NULL,
    description TEXT,
    partenaire_id BIGINT,
    utilisateur_id BIGINT,
    service_id BIGINT,
    statut VARCHAR(255) NOT NULL DEFAULT 'En attente',
    date_transaction DATE NOT NULL,
    date_validation DATE,
    reference VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLE: performance_metrics (inchangée)
-- =====================================================
CREATE TABLE performance_metrics (
    performance_id BIGINT PRIMARY KEY,
    nom VARCHAR(255) NOT NULL,
    valeur DECIMAL(10,2) NOT NULL,
    unite VARCHAR(255),
    categorie VARCHAR(255),
    date_mesure DATE NOT NULL,
    periode VARCHAR(255) DEFAULT 'jour',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLE: user_activities (inchangée)
-- =====================================================
CREATE TABLE user_activities (
    id BIGINT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    action VARCHAR(255) NOT NULL,
    details JSONB,
    ip_address VARCHAR(255),
    user_agent VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLE: notifications (inchangée)
-- =====================================================
CREATE TABLE notifications (
    notification_id BIGINT PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    titre VARCHAR(255) NOT NULL,
    message TEXT,
    type VARCHAR(255) NOT NULL,
    lu BOOLEAN DEFAULT FALSE,
    date_creation TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    date_lecture TIMESTAMP WITH TIME ZONE
);

-- =====================================================
-- TABLE: dashboard_widgets (inchangée)
-- =====================================================
CREATE TABLE dashboard_widgets (
    widget_id BIGINT PRIMARY KEY,
    nom VARCHAR(255) NOT NULL,
    type VARCHAR(255) NOT NULL,
    configuration JSONB,
    position_x INTEGER DEFAULT 0,
    position_y INTEGER DEFAULT 0,
    largeur INTEGER DEFAULT 1,
    hauteur INTEGER DEFAULT 1,
    actif BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEX (ajout pour partnership_requests)
-- =====================================================
-- Index pour les utilisateurs (inchangés)
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_type ON users(type);
CREATE INDEX idx_users_statut ON users(statut);
CREATE INDEX idx_users_date_inscription ON users(date_inscription);

-- Index pour les partenaires (inchangés)
CREATE INDEX idx_partners_nom ON partners(nom);
CREATE INDEX idx_partners_type ON partners(type);
CREATE INDEX idx_partners_actif ON partners(actif);

-- Index pour les demandes de partenariat
CREATE INDEX idx_partnership_requests_nom_entreprise ON partnership_requests(nom_entreprise);
CREATE INDEX idx_partnership_requests_statut ON partnership_requests(statut);
CREATE INDEX idx_partnership_requests_date_soumission ON partnership_requests(date_soumission);

-- Index pour les employés (inchangés)
CREATE INDEX idx_employees_partner_id ON employees(partner_id);
CREATE INDEX idx_employees_actif ON employees(actif);

-- Index pour les services (inchangés)
CREATE INDEX idx_services_categorie ON services(categorie);
CREATE INDEX idx_services_disponible ON services(disponible);

-- Index pour les alertes (inchangés)
CREATE INDEX idx_alerts_type ON alerts(type);
CREATE INDEX idx_alerts_statut ON alerts(statut);
CREATE INDEX idx_alerts_date_creation ON alerts(date_creation);

-- Index pour les transactions financières (inchangés)
CREATE INDEX idx_financial_transactions_date ON financial_transactions(date_transaction);
CREATE INDEX idx_financial_transactions_type ON financial_transactions(type);
CREATE INDEX idx_financial_transactions_statut ON financial_transactions(statut);

-- Index pour les métriques de performance (inchangés)
CREATE INDEX idx_performance_metrics_date ON performance_metrics(date_mesure);
CREATE INDEX idx_performance_metrics_categorie ON performance_metrics(categorie);

-- Index pour les activités utilisateur (inchangés)
CREATE INDEX idx_user_activities_user_id ON user_activities(user_id);
CREATE INDEX idx_user_activities_created_at ON user_activities(created_at);

-- Index pour les notifications (inchangés)
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_lu ON notifications(lu);
CREATE INDEX idx_notifications_date_creation ON notifications(date_creation);

-- =====================================================
-- VUES (ajout d'une vue pour les demandes de partenariat)
-- =====================================================
-- Vue pour les statistiques des utilisateurs (inchangée)
CREATE VIEW user_statistics AS
SELECT 
  COUNT(*) as total_users,
  COUNT(*) FILTER (WHERE statut = 'Actif') as active_users,
  COUNT(*) FILTER (WHERE type = 'Étudiant') as student_users,
  COUNT(*) FILTER (WHERE type = 'Salarié') as employee_users,
  COUNT(*) FILTER (WHERE type = 'Entreprise') as business_users,
  COUNT(*) FILTER (WHERE date_inscription >= CURRENT_DATE - INTERVAL '30 days') as new_users_month
FROM users;

-- Vue pour les performances financières (inchangée)
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

-- Vue pour les alertes actives (inchangée)
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

-- Vue pour les statistiques des partenaires (inchangée)
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

-- Nouvelle vue pour les demandes de partenariat en attente
CREATE VIEW pending_partnership_requests AS
SELECT 
  id,
  nom_entreprise,
  rccm,
  nif,
  adresse,
  nom_representant,
  email_representant,
  telephone_representant,
  nom_rh,
  email_rh,
  telephone_rh,
  statut,
  date_soumission
FROM partnership_requests
WHERE statut = 'En attente'
ORDER BY date_soumission DESC;

-- =====================================================
-- FONCTIONS (ajout d'une fonction pour valider une demande)
-- =====================================================
-- Fonction pour récupérer les statistiques du dashboard (modifiée)
CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'users', (SELECT row_to_json(us) FROM user_statistics us),
    'financial', (SELECT row_to_json(fp) FROM financial_performance fp),
    'alerts', (SELECT COUNT(*) FROM active_alerts),
    'partners', (SELECT COUNT(*) FROM partners WHERE actif = true),
    'pending_requests', (SELECT COUNT(*) FROM partnership_requests WHERE statut = 'En attente')
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour créer une alerte (inchangée)
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

-- Nouvelle fonction pour valider une demande de partenariat
CREATE OR REPLACE FUNCTION validate_partnership_request(
  p_request_id UUID,
  p_type VARCHAR(100),
  p_secteur VARCHAR(100)
)
RETURNS UUID AS $$
DECLARE
  partner_id UUID;
BEGIN
  -- Transférer la demande validée vers la table partners
  INSERT INTO partners (
    nom, type, secteur, rccm, nif, adresse, email, telephone,
    nom_representant, email_representant, telephone_representant, poste_representant,
    nom_rh, email_rh, telephone_rh, actif, date_adhesion
  )
  SELECT 
    nom_entreprise, p_type, p_secteur, rccm, nif, adresse, email_entreprise, telephone_entreprise,
    nom_representant, email_representant, telephone_representant, poste_representant,
    nom_rh, email_rh, telephone_rh, true, NOW()
  FROM partnership_requests
  WHERE id = p_request_id
  RETURNING id INTO partner_id;

  -- Mettre à jour le statut de la demande
  UPDATE partnership_requests
  SET statut = 'Validée', date_validation = NOW()
  WHERE id = p_request_id;

  -- Créer une alerte pour la validation
  PERFORM create_alert(
    'Partenariat validé',
    'La demande de partenariat pour ' || (SELECT nom_entreprise FROM partnership_requests WHERE id = p_request_id) || ' a été validée.',
    'Information',
    'Système',
    2
  );

  RETURN partner_id;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour mettre à jour les statistiques des partenaires (inchangée)
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
-- TRIGGERS (ajout d'un trigger pour les demandes)
-- =====================================================
-- Trigger pour mettre à jour les statistiques des partenaires (inchangé)
CREATE TRIGGER trigger_update_partner_statistics
  AFTER INSERT OR UPDATE OR DELETE ON employees
  FOR EACH ROW
  EXECUTE FUNCTION update_partner_statistics();

-- Trigger pour mettre à jour updated_at (inchangé + ajout pour partnership_requests)
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

CREATE TRIGGER trigger_update_partnership_requests_updated_at
  BEFORE UPDATE ON partnership_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Nouveau trigger pour générer une alerte lors d'une nouvelle demande
CREATE OR REPLACE FUNCTION notify_new_partnership_request()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM create_alert(
    'Nouvelle demande de partenariat',
    'Une nouvelle demande de partenariat a été soumise par ' || NEW.nom_entreprise,
    'Information',
    'Système',
    3
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_notify_new_partnership_request
  AFTER INSERT ON partnership_requests
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_partnership_request();

-- =====================================================
-- DONNÉES DE TEST (ajout pour partnership_requests)
-- =====================================================
-- Insertion d'un utilisateur admin (inchangée)
INSERT INTO users (email, password_hash, nom, prenom, type, statut, organisation) VALUES
('admin@zalama.com', '$2a$10$dummy.hash.for.testing', 'Admin', 'ZaLaMa', 'Entreprise', 'Actif', 'ZaLaMa Admin');

-- Insertion de partenaires de test (inchangée)
INSERT INTO partners (nom, type, secteur, description, email, telephone, adresse) VALUES
('Tech Solutions SARL', 'Entreprise', 'Technologie', 'Solutions technologiques innovantes pour les entreprises', 'contact@techsolutions.com', '+224 123 456 789', 'Conakry, Guinée'),
('Formation Plus', 'Centre de formation', 'Éducation', 'Centre de formation professionnelle de qualité', 'info@formationplus.com', '+224 987 654 321', 'Conakry, Guinée'),
('Digital Agency', 'Agence', 'Marketing', 'Agence de marketing digital et communication', 'hello@digitalagency.com', '+224 555 123 456', 'Conakry, Guinée');

-- Insertion de demandes de partenariat de test
INSERT INTO partnership_requests (
  nom_entreprise, rccm, nif, adresse, type_entreprise, secteur, email_entreprise, telephone_entreprise,
  nom_representant, poste_representant, email_representant, telephone_representant,
  nom_rh, email_rh, telephone_rh, agreement, statut
) VALUES
('Innovatech SARL', 'RCCM987654', 'NIF123456', '123 Rue Innovatech, Conakry', 'SARL', 'Technologie', 'contact@innovatech.com', '+224111222333',
 'Fatou Camara', 'Directrice Générale', 'fatou.camara@innovatech.com', '+224444555666',
 'Mamadou Diallo', 'mamadou.diallo@innovatech.com', '+224777888999', true, 'En attente'),
('Educenter', 'RCCM456789', 'NIF789123', '456 Avenue Éducation, Conakry', 'Association', 'Éducation', 'info@educenter.org', '+224222333444',
 'Aissatou Bah', 'Présidente', 'aissatou.bah@educenter.org', '+224555666777',
 'Ousmane Sow', 'ousmane.sow@educenter.org', '+224888999000', true, 'En attente');

-- Insertion de services de test (inchangée)
INSERT INTO services (id, nom, description, categorie, prix, duree, disponible) VALUES
(1001, 'Formation Web Development', 'Formation complète en développement web moderne', 'Formation', 750000.00, '3 mois', true),
(1002, 'Consultation IT', 'Consultation en technologies de l''information', 'Consultation', 150000.00, '1 jour', true),
(2001, 'Maintenance Système', 'Maintenance et support technique des systèmes', 'Support', 200000.00, '1 mois', true),
(2002, 'Développement Mobile', 'Développement d''applications mobiles natives', 'Développement', 500000.00, '2 mois', true);

-- Insertion d'alertes de test (inchangée)
INSERT INTO alerts (titre, description, type, source, priorite, date_creation) VALUES
('Nouveau partenaire inscrit', 'Tech Solutions SARL vient de s''inscrire comme partenaire', 'Information', 'Système', 1, NOW()),
('Maintenance prévue', 'Maintenance du système prévue ce weekend', 'Importante', 'Système', 3, NOW()),
('Paiement en retard', 'Paiement en retard pour le service Formation Web Development', 'Critique', 'Finance', 5, NOW());

-- Insertion de transactions financières de test (inchangée)
INSERT INTO financial_transactions (transaction_id, montant, type, description, statut, reference, date_transaction) VALUES
(1001, 2500000.00, 'Débloque', 'Fonds débloqués pour le programme de formation', 'Validé', 'REF-2024-001', CURRENT_DATE),
(1002, 950000.00, 'Débloque', 'Fonds pour consultation IT', 'Validé', 'REF-2024-002', CURRENT_DATE),
(2001, 75000.00, 'Récupéré', 'Remboursement maintenance système', 'Validé', 'REF-2024-003', CURRENT_DATE),
(2002, 50000.00, 'Revenu', 'Revenus générés par les services', 'Validé', 'REF-2024-004', CURRENT_DATE);

-- Insertion de métriques de performance de test (inchangée)
INSERT INTO performance_metrics (performance_id, nom, valeur, unite, categorie, date_mesure, periode) VALUES
(1001, 'Utilisation', 5200.00, 'utilisateur', 'Utilisation', CURRENT_DATE, 'jour'),
(1002, 'Nouveau inscrit', 870.00, 'utilisateur', 'Utilisation', CURRENT_DATE, 'mois'),
(2001, 'Taux de conversion', 85.50, '%', 'Performance', CURRENT_DATE, 'mois'),
(2002, 'Revenus mensuels', 1500000.00, 'GNF', 'Finance', CURRENT_DATE, 'mois');

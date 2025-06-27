-- =====================================================
-- AJOUT DU CHAMP user_id À LA TABLE employees
-- =====================================================

-- Ajouter le champ user_id à la table employees
ALTER TABLE employees 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Créer un index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_employees_user_id ON employees(user_id);

-- Créer un index composite pour les requêtes fréquentes
CREATE INDEX IF NOT EXISTS idx_employees_partner_user ON employees(partner_id, user_id);

-- Ajouter une contrainte unique sur user_id pour éviter les doublons
ALTER TABLE employees 
ADD CONSTRAINT IF NOT EXISTS unique_employee_user_id UNIQUE (user_id);

-- Commentaire pour documenter le champ
COMMENT ON COLUMN employees.user_id IS 'Référence vers le compte Supabase Auth de l''employé';

-- =====================================================
-- FONCTION POUR SYNCHRONISER LES EMPLOYÉS SANS user_id
-- =====================================================

CREATE OR REPLACE FUNCTION sync_employees_without_user_id()
RETURNS TABLE (
  employee_id UUID,
  employee_email VARCHAR,
  user_id UUID,
  sync_status TEXT
) AS $$
DECLARE
  employee_record RECORD;
  auth_user_record RECORD;
BEGIN
  -- Parcourir tous les employés sans user_id
  FOR employee_record IN 
    SELECT id, email, nom, prenom 
    FROM employees 
    WHERE user_id IS NULL AND email IS NOT NULL
  LOOP
    -- Chercher l'utilisateur dans Supabase Auth
    SELECT id INTO auth_user_record
    FROM auth.users 
    WHERE email = employee_record.email;
    
    IF FOUND THEN
      -- Mettre à jour l'employé avec le user_id trouvé
      UPDATE employees 
      SET user_id = auth_user_record.id 
      WHERE id = employee_record.id;
      
      -- Retourner le succès
      employee_id := employee_record.id;
      employee_email := employee_record.email;
      user_id := auth_user_record.id;
      sync_status := 'SYNCED';
    ELSE
      -- Retourner l'échec
      employee_id := employee_record.id;
      employee_email := employee_record.email;
      user_id := NULL;
      sync_status := 'NO_AUTH_USER_FOUND';
    END IF;
    
    RETURN NEXT;
  END LOOP;
  
  RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- VUE POUR LES EMPLOYÉS NON SYNCHRONISÉS
-- =====================================================

CREATE OR REPLACE VIEW employees_sync_status AS
SELECT 
  e.id,
  e.nom,
  e.prenom,
  e.email,
  e.partner_id,
  p.nom as partner_nom,
  e.user_id,
  CASE 
    WHEN e.user_id IS NULL THEN 'NOT_SYNCED'
    ELSE 'SYNCED'
  END as sync_status,
  e.created_at,
  e.updated_at
FROM employees e
LEFT JOIN partners p ON e.partner_id = p.id
ORDER BY e.created_at DESC;

-- =====================================================
-- TRIGGER POUR METTRE À JOUR updated_at QUAND user_id CHANGE
-- =====================================================

CREATE OR REPLACE FUNCTION update_employee_user_id_trigger()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.user_id IS DISTINCT FROM NEW.user_id THEN
    NEW.updated_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_employee_user_id
  BEFORE UPDATE ON employees
  FOR EACH ROW
  EXECUTE FUNCTION update_employee_user_id_trigger();

-- =====================================================
-- POLITIQUES RLS MISE À JOUR
-- =====================================================

-- Politique pour permettre aux utilisateurs de voir leurs propres données d'employé
CREATE POLICY IF NOT EXISTS "Users can view their own employee data" ON employees
  FOR SELECT USING (user_id = auth.uid());

-- Politique pour permettre aux admins de voir tous les employés
CREATE POLICY IF NOT EXISTS "Admins can view all employees" ON employees
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Politique pour permettre aux RH de voir les employés de leur partenaire
CREATE POLICY IF NOT EXISTS "RH can view partner employees" ON employees
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE id = auth.uid() 
      AND role = 'rh' 
      AND partenaire_id = employees.partner_id
    )
  ); 
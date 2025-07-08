-- Script simplifié pour ajouter le champ photo_url à la table employees
-- Exécuter ce script dans l'éditeur SQL de Supabase

-- Ajouter le champ photo_url à la table employees
ALTER TABLE public.employees 
ADD COLUMN IF NOT EXISTS photo_url character varying;

-- Vérifier que le champ a été ajouté
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'employees' 
  AND table_schema = 'public'
  AND column_name = 'photo_url'; 
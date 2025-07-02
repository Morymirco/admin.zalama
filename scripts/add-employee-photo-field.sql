-- Script pour ajouter le champ photo_url à la table employees
-- Exécuter ce script dans l'éditeur SQL de Supabase

-- 1. Ajouter le champ photo_url à la table employees
ALTER TABLE public.employees 
ADD COLUMN IF NOT EXISTS photo_url character varying;

-- 2. Ajouter une contrainte pour vérifier que l'URL est valide (optionnel)
-- ALTER TABLE public.employees 
-- ADD CONSTRAINT employees_photo_url_check 
-- CHECK (photo_url IS NULL OR photo_url ~* '^https?://.*');

-- 3. Créer le bucket de stockage pour les photos d'employés
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'employee-photos', 
  'employee-photos', 
  true, 
  5242880, -- 5MB en bytes
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- 4. Politiques RLS pour le bucket employee-photos

-- Politique pour permettre l'upload des photos (utilisateurs authentifiés)
CREATE POLICY "Allow authenticated users to upload employee photos" 
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'employee-photos' 
  AND auth.role() = 'authenticated'
);

-- Politique pour permettre la lecture des photos (public)
CREATE POLICY "Allow public to view employee photos" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'employee-photos');

-- Politique pour permettre la mise à jour des photos (utilisateurs authentifiés)
CREATE POLICY "Allow authenticated users to update employee photos" 
ON storage.objects FOR UPDATE 
USING (
  bucket_id = 'employee-photos' 
  AND auth.role() = 'authenticated'
);

-- Politique pour permettre la suppression des photos (utilisateurs authentifiés)
CREATE POLICY "Allow authenticated users to delete employee photos" 
ON storage.objects FOR DELETE 
USING (
  bucket_id = 'employee-photos' 
  AND auth.role() = 'authenticated'
);

-- 5. Vérifier que les changements ont été appliqués
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'employees' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 6. Vérifier que le bucket existe
SELECT * FROM storage.buckets WHERE id = 'employee-photos';

-- 7. Vérifier les politiques RLS
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'objects' 
  AND schemaname = 'storage'
ORDER BY policyname; 
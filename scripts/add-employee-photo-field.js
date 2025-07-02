const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = 'https://mspmrzlqhwpdkkburjiw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zcG1yemxxaHdwZGtrYnVyaml3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3ODcyNTgsImV4cCI6MjA2NjM2MzI1OH0.zr-TRpKjGJjW0nRtsyPcCLy4Us-c5tOGX71k5_3JJd0';

async function addEmployeePhotoField() {
  try {
    console.log('🔧 Ajout du champ photo_url à la table employees...');
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // 1. Vérifier la structure actuelle de la table employees
    console.log('1. Vérification de la structure actuelle...');
    const { data: employees, error: employeesError } = await supabase
      .from('employees')
      .select('*')
      .limit(1);
    
    if (employeesError) {
      console.error('❌ Erreur lors de la vérification de la table employees:', employeesError);
      return;
    }
    
    console.log('✅ Table employees accessible');
    console.log('📋 Colonnes actuelles:', Object.keys(employees[0] || {}));
    
    // 2. Vérifier si le champ photo_url existe déjà
    if (employees[0] && 'photo_url' in employees[0]) {
      console.log('✅ Le champ photo_url existe déjà dans la table employees');
    } else {
      console.log('⚠️  Le champ photo_url n\'existe pas. Il doit être ajouté manuellement.');
      console.log('');
      console.log('📋 SQL à exécuter dans Supabase:');
      console.log('');
      console.log('ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS photo_url character varying;');
      console.log('');
      console.log('📋 Ou pour ajouter avec des contraintes:');
      console.log('');
      console.log('ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS photo_url character varying CHECK (photo_url ~* \'^https?://.*\');');
      console.log('');
    }
    
    // 3. Créer le bucket de stockage pour les photos d'employés
    console.log('3. Vérification du bucket de stockage...');
    console.log('⚠️  Pour créer le bucket de stockage, exécutez dans Supabase:');
    console.log('');
    console.log('-- Créer le bucket employee-photos');
    console.log('INSERT INTO storage.buckets (id, name, public) VALUES (\'employee-photos\', \'employee-photos\', true);');
    console.log('');
    console.log('-- Politique RLS pour permettre l\'upload des photos');
    console.log('CREATE POLICY "Allow authenticated users to upload employee photos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = \'employee-photos\' AND auth.role() = \'authenticated\');');
    console.log('');
    console.log('-- Politique RLS pour permettre la lecture des photos');
    console.log('CREATE POLICY "Allow public to view employee photos" ON storage.objects FOR SELECT USING (bucket_id = \'employee-photos\');');
    console.log('');
    console.log('-- Politique RLS pour permettre la mise à jour des photos');
    console.log('CREATE POLICY "Allow authenticated users to update employee photos" ON storage.objects FOR UPDATE USING (bucket_id = \'employee-photos\' AND auth.role() = \'authenticated\');');
    console.log('');
    console.log('-- Politique RLS pour permettre la suppression des photos');
    console.log('CREATE POLICY "Allow authenticated users to delete employee photos" ON storage.objects FOR DELETE USING (bucket_id = \'employee-photos\' AND auth.role() = \'authenticated\');');
    console.log('');
    
    // 4. Vérifier les employés existants
    console.log('4. Vérification des employés existants...');
    const { data: allEmployees, error: allEmployeesError } = await supabase
      .from('employees')
      .select('id, nom, prenom, photo_url')
      .limit(10);
    
    if (allEmployeesError) {
      console.error('❌ Erreur lors de la récupération des employés:', allEmployeesError);
      return;
    }
    
    console.log(`📊 Nombre d'employés trouvés: ${allEmployees?.length || 0}`);
    if (allEmployees && allEmployees.length > 0) {
      console.log('📋 Exemples d\'employés:');
      allEmployees.forEach((employee, index) => {
        console.log(`   ${index + 1}. ${employee.prenom} ${employee.nom} - Photo: ${employee.photo_url || 'Aucune'}`);
      });
    }
    
    // 5. Créer un service d'upload pour les employés
    console.log('5. Création du service d\'upload...');
    console.log('📋 Service à créer dans services/employeePhotoService.ts:');
    console.log('');
    console.log(`
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mspmrzlqhwpdkkburjiw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zcG1yemxxaHdwZGtrYnVyaml3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3ODcyNTgsImV4cCI6MjA2NjM2MzI1OH0.zr-TRpKjGJjW0nRtsyPcCLy4Us-c5tOGX71k5_3JJd0';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const employeePhotoService = {
  async uploadPhoto(file: File, employeeId: string): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = \`\${employeeId}-\${Date.now()}.\${fileExt}\`;
    
    const { data, error } = await supabase.storage
      .from('employee-photos')
      .upload(fileName, file);
    
    if (error) throw error;
    
    const { data: { publicUrl } } = supabase.storage
      .from('employee-photos')
      .getPublicUrl(fileName);
    
    return publicUrl;
  },
  
  async deletePhoto(photoUrl: string): Promise<void> {
    const fileName = photoUrl.split('/').pop();
    if (!fileName) return;
    
    const { error } = await supabase.storage
      .from('employee-photos')
      .remove([fileName]);
    
    if (error) throw error;
  },
  
  async updateEmployeePhoto(employeeId: string, photoUrl: string): Promise<void> {
    const { error } = await supabase
      .from('employees')
      .update({ photo_url: photoUrl })
      .eq('id', employeeId);
    
    if (error) throw error;
  }
};
    `);
    
    console.log('');
    console.log('🎉 Script terminé!');
    console.log('');
    console.log('📋 Prochaines étapes:');
    console.log('1. Exécuter le SQL pour ajouter le champ photo_url');
    console.log('2. Créer le bucket de stockage employee-photos');
    console.log('3. Créer le service employeePhotoService.ts');
    console.log('4. Mettre à jour les composants d\'ajout d\'employé');
    console.log('5. Tester l\'upload de photos');
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'ajout du champ photo:', error);
    process.exit(1);
  }
}

// Exécuter le script
addEmployeePhotoField(); 
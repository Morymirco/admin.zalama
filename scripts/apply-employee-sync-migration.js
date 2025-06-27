const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = 'https://mspmrzlqhwpdkkburjiw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zcG1yemxxaHdwZGtrYnVyaml3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3ODcyNTgsImV4cCI6MjA2NjM2MzI1OH0.zr-TRpKjGJjW0nRtsyPcCLy4Us-c5tOGX71k5_3JJd0';

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function applyMigration() {
  try {
    console.log('🚀 Application de la migration de synchronisation des employés...');
    
    // Vérifier si le champ user_id existe déjà
    console.log('🔍 Vérification de la structure de la table employees...');
    
    const { data: testData, error: testError } = await supabase
      .from('employees')
      .select('*')
      .limit(1);
    
    if (testError) {
      console.error('❌ Erreur lors de la vérification de la table:', testError);
      return;
    }
    
    if (testData && testData.length > 0) {
      const hasUserId = 'user_id' in testData[0];
      console.log(`📊 Champ user_id ${hasUserId ? 'déjà présent' : 'absent'} dans la table employees`);
      
      if (hasUserId) {
        console.log('✅ Migration déjà appliquée !');
        return;
      }
    }
    
    console.log('⚠️ Le champ user_id n\'existe pas. Veuillez appliquer manuellement la migration SQL.');
    console.log('');
    console.log('📋 Instructions :');
    console.log('1. Allez dans votre dashboard Supabase');
    console.log('2. Ouvrez l\'éditeur SQL');
    console.log('3. Copiez et exécutez le contenu du fichier supabase/add_user_id_to_employees.sql');
    console.log('4. Ou utilisez la page de synchronisation : /dashboard/employee-sync');
    
  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error);
  }
}

// Exécuter la vérification
applyMigration(); 
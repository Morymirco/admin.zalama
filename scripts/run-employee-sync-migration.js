const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuration Supabase
const supabaseUrl = 'https://mspmrzlqhwpdkkburjiw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zcG1yemxxaHdwZGtrYnVyaml3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3ODcyNTgsImV4cCI6MjA2NjM2MzI1OH0.zr-TRpKjGJjW0nRtsyPcCLy4Us-c5tOGX71k5_3JJd0';

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function runMigration() {
  try {
    console.log('🚀 Début de la migration de synchronisation des employés...');
    
    // Lire le fichier SQL de migration
    const migrationPath = path.join(__dirname, '../supabase/add_user_id_to_employees.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('📝 Exécution du script SQL de migration...');
    
    // Exécuter le script SQL
    const { error } = await supabase.rpc('exec_sql', {
      sql: migrationSQL
    });
    
    if (error) {
      console.error('❌ Erreur lors de l\'exécution de la migration:', error);
      return;
    }
    
    console.log('✅ Migration SQL exécutée avec succès');
    
    // Vérifier que la migration a fonctionné
    console.log('🔍 Vérification de la migration...');
    
    // Vérifier que le champ user_id existe
    const { data: columns, error: columnsError } = await supabase
      .from('employees')
      .select('*')
      .limit(1);
    
    if (columnsError) {
      console.error('❌ Erreur lors de la vérification des colonnes:', columnsError);
      return;
    }
    
    if (columns && columns.length > 0) {
      const hasUserId = 'user_id' in columns[0];
      console.log(`✅ Champ user_id ${hasUserId ? 'présent' : 'absent'} dans la table employees`);
    }
    
    // Vérifier la vue de statut
    const { data: syncStatus, error: statusError } = await supabase
      .from('employees_sync_status')
      .select('*')
      .limit(5);
    
    if (statusError) {
      console.error('❌ Erreur lors de la vérification de la vue:', statusError);
    } else {
      console.log(`✅ Vue employees_sync_status accessible (${syncStatus?.length || 0} enregistrements)`);
    }
    
    console.log('🎉 Migration terminée avec succès !');
    console.log('');
    console.log('📋 Prochaines étapes :');
    console.log('1. Accéder à la page de synchronisation : /dashboard/employee-sync');
    console.log('2. Vérifier le statut des employés existants');
    console.log('3. Synchroniser les employés qui n\'ont pas de user_id');
    console.log('4. Tester la création d\'un nouvel employé');
    
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
  }
}

// Exécuter la migration
runMigration(); 
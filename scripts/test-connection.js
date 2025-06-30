const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = 'https://mspmrzlqhwpdkkburjiw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zcG1yemxxaHdwZGtrYnVyaml3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3ODcyNTgsImV4cCI6MjA2NjM2MzI1OH0.zr-TRpKjGJjW0nRtsyPcCLy4Us-c5tOGX71k5_3JJd0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    console.log('🔍 Test de connexion à Supabase...');
    
    // Test 1: Vérifier si la table existe
    console.log('\n1. Vérification de l\'existence de la table partnership_requests...');
    const { data: tableCheck, error: tableError } = await supabase
      .from('partnership_requests')
      .select('count')
      .limit(1);
    
    if (tableError) {
      console.error('❌ Erreur lors de la vérification de la table:', tableError);
      return;
    }
    
    console.log('✅ Table partnership_requests accessible');
    
    // Test 2: Compter les enregistrements
    console.log('\n2. Comptage des enregistrements...');
    const { count, error: countError } = await supabase
      .from('partnership_requests')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('❌ Erreur lors du comptage:', countError);
      return;
    }
    
    console.log(`📊 Nombre total d'enregistrements: ${count}`);
    
    // Test 3: Récupérer quelques enregistrements
    if (count > 0) {
      console.log('\n3. Récupération des premiers enregistrements...');
      const { data: records, error: recordsError } = await supabase
        .from('partnership_requests')
        .select('id, company_name, status, created_at')
        .limit(5);
      
      if (recordsError) {
        console.error('❌ Erreur lors de la récupération:', recordsError);
        return;
      }
      
      console.log('✅ Enregistrements récupérés:');
      records.forEach((record, index) => {
        console.log(`   ${index + 1}. ${record.company_name} (${record.status}) - ${record.created_at}`);
      });
    } else {
      console.log('📝 Aucun enregistrement trouvé dans la table');
    }
    
    // Test 4: Vérifier la structure de la table
    console.log('\n4. Test de récupération complète d\'un enregistrement...');
    const { data: fullRecord, error: fullError } = await supabase
      .from('partnership_requests')
      .select('*')
      .limit(1)
      .single();
    
    if (fullError) {
      console.error('❌ Erreur lors de la récupération complète:', fullError);
    } else if (fullRecord) {
      console.log('✅ Structure de la table OK');
      console.log('📋 Champs disponibles:', Object.keys(fullRecord).join(', '));
    }
    
  } catch (error) {
    console.error('❌ Erreur inattendue:', error);
  }
}

// Exécuter le test
testConnection(); 
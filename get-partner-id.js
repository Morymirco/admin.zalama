const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = 'https://mspmrzlqhwpdkkburjiw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zcG1yemxxaHdwZGtrYnVyaml3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDc4NzI1OCwiZXhwIjoyMDY2MzYzMjU4fQ.6sIgEDZIP1fkUoxdPJYfzKHU1B_SfN6Hui6v_FV6yzw';

const supabase = createClient(supabaseUrl, supabaseKey);

async function getPartnerId() {
  try {
    console.log('🔍 Recherche d\'un partenaire existant...');
    
    const { data: partners, error } = await supabase
      .from('partners')
      .select('id, nom')
      .limit(1);

    if (error) {
      console.error('❌ Erreur:', error);
      return;
    }

    if (partners && partners.length > 0) {
      console.log('✅ Partenaire trouvé:');
      console.log(`   Nom: ${partners[0].nom}`);
      console.log(`   ID: ${partners[0].id}`);
      console.log('\n📋 Copiez cette ligne dans votre script de test:');
      console.log(`const PARTNER_ID = '${partners[0].id}';`);
    } else {
      console.log('⚠️ Aucun partenaire trouvé dans la base de données');
      console.log('💡 Créez d\'abord un partenaire avec le script test-partner-creation-complete.js');
    }
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

getPartnerId(); 
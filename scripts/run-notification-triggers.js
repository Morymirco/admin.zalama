// Charger les variables d'environnement depuis .env.local
require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuration Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mspmrzlqhwpdkkburjiw.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY est requis !');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runNotificationTriggers() {
  try {
    console.log('🚀 Exécution des triggers de notification...');
    
    // Lire le fichier de triggers
    const triggersPath = path.join(__dirname, '..', 'supabase', 'notification_triggers.sql');
    const triggersSQL = fs.readFileSync(triggersPath, 'utf8');
    
    console.log('📄 Fichier de triggers chargé avec succès');
    
    // Diviser le SQL en déclarations individuelles
    const statements = triggersSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt && !stmt.startsWith('--'));
    
    console.log(`📋 Exécution de ${statements.length} déclarations SQL...`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement) {
        try {
          console.log(`⚡ Exécution déclaration ${i + 1}/${statements.length}...`);
          
          const { error } = await supabase.rpc('exec_sql', { sql: statement + ';' });
          
          if (error) {
            console.log(`❌ Erreur déclaration ${i + 1}:`, error.message);
            errorCount++;
          } else {
            successCount++;
          }
        } catch (e) {
          console.log(`❌ Exception déclaration ${i + 1}:`, e.message);
          errorCount++;
        }
      }
    }
    
    console.log('\n📊 Résultats :');
    console.log(`✅ Succès: ${successCount}`);
    console.log(`❌ Erreurs: ${errorCount}`);
    
    if (errorCount === 0) {
      console.log('🎉 Tous les triggers de notification ont été créés avec succès !');
    } else {
      console.log('⚠️  Certaines déclarations ont échoué. Vérifiez les erreurs ci-dessus.');
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'exécution des triggers:', error);
    process.exit(1);
  }
}

// Exécuter les triggers
runNotificationTriggers(); 
const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase avec la clé anonyme
const supabaseUrl = 'https://mspmrzlqhwpdkkburjiw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zcG1yemxxaHdwZGtrYnVyaml3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3ODcyNTgsImV4cCI6MjA2NjM2MzI1OH0.zr-TRpKjGJjW0nRtsyPcCLy4Us-c5tOGX71k5_3JJd0';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkAndCreateBucket() {
  try {
    console.log('🔍 Vérification des buckets existants...');

    // Essayer de lister les fichiers dans le bucket 'logos'
    const { data: files, error } = await supabase.storage
      .from('logos')
      .list('', {
        limit: 1
      });

    if (error) {
      if (error.message.includes('Bucket not found')) {
        console.log('❌ Bucket "logos" n\'existe pas');
        console.log('📋 Instructions pour créer le bucket:');
        console.log('1. Allez sur https://supabase.com/dashboard/project/mspmrzlqhwpdkkburjiw/storage');
        console.log('2. Cliquez sur "New bucket"');
        console.log('3. Nom du bucket: "logos"');
        console.log('4. Cochez "Public bucket"');
        console.log('5. Cliquez sur "Create bucket"');
        console.log('');
        console.log('📋 Politiques RLS à configurer:');
        console.log('1. Allez dans Storage > Policies');
        console.log('2. Pour le bucket "logos", ajoutez ces politiques:');
        console.log('   - SELECT: true (pour permettre la lecture publique)');
        console.log('   - INSERT: auth.role() = \'authenticated\' (pour permettre l\'upload)');
        console.log('   - UPDATE: auth.role() = \'authenticated\'');
        console.log('   - DELETE: auth.role() = \'authenticated\'');
      } else {
        console.error('❌ Erreur lors de la vérification:', error);
      }
    } else {
      console.log('✅ Bucket "logos" existe et est accessible');
      console.log('📁 Fichiers dans le bucket:', files?.length || 0);
    }

    // Vérifier aussi le bucket 'photos'
    const { data: photosFiles, error: photosError } = await supabase.storage
      .from('photos')
      .list('', {
        limit: 1
      });

    if (photosError) {
      if (photosError.message.includes('Bucket not found')) {
        console.log('❌ Bucket "photos" n\'existe pas');
        console.log('📋 Créez aussi le bucket "photos" avec les mêmes paramètres');
      }
    } else {
      console.log('✅ Bucket "photos" existe et est accessible');
    }

  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

// Exécuter le script
checkAndCreateBucket(); 
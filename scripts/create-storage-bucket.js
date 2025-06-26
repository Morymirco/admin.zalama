const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Configuration Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement Supabase manquantes');
  console.error('Assurez-vous que NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont définies dans .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createLogosBucket() {
  console.log('🔧 Création du bucket logos dans Supabase Storage...\n');

  try {
    // Créer le bucket logos
    const { data, error } = await supabase.storage.createBucket('logos', {
      public: true,
      fileSizeLimit: 5242880, // 5MB
      allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    });

    if (error) {
      if (error.message.includes('already exists')) {
        console.log('✅ Bucket "logos" existe déjà');
      } else {
        console.error('❌ Erreur lors de la création du bucket:', error);
        return;
      }
    } else {
      console.log('✅ Bucket "logos" créé avec succès');
    }

    // Créer les politiques RLS pour le bucket
    console.log('\n🔒 Configuration des politiques de sécurité...');

    const policies = [
      {
        name: 'Logos publics accessibles à tous',
        definition: 'SELECT',
        policy: 'true'
      },
      {
        name: 'Authenticated users can upload logos',
        definition: 'INSERT',
        policy: 'auth.role() = \'authenticated\''
      },
      {
        name: 'Users can update their own logos',
        definition: 'UPDATE',
        policy: 'auth.role() = \'authenticated\''
      },
      {
        name: 'Users can delete their own logos',
        definition: 'DELETE',
        policy: 'auth.role() = \'authenticated\''
      }
    ];

    for (const policyConfig of policies) {
      try {
        const { error: policyError } = await supabase.storage.createBucketPolicy('logos', {
          name: policyConfig.name,
          definition: policyConfig.definition,
          policy: policyConfig.policy
        });
        
        if (policyError) {
          if (policyError.message.includes('already exists')) {
            console.log(`✅ Politique "${policyConfig.name}" existe déjà`);
          } else {
            console.error(`❌ Erreur lors de la création de la politique "${policyConfig.name}":`, policyError);
          }
        } else {
          console.log(`✅ Politique "${policyConfig.name}" créée`);
        }
      } catch (error) {
        console.error(`❌ Erreur lors de la configuration de la politique "${policyConfig.name}":`, error);
      }
    }

    console.log('\n🎉 Configuration du bucket terminée !');
    console.log('\n📝 Prochaines étapes :');
    console.log('1. Testez l\'upload de logo depuis l\'application');
    console.log('2. Vérifiez que les logos sont accessibles publiquement');
    
  } catch (error) {
    console.error('❌ Erreur lors de la configuration du bucket:', error);
  }
}

createLogosBucket().catch(console.error); 
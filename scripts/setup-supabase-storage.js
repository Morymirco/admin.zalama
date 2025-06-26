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

// Configuration des buckets
const buckets = [
  {
    name: 'logos',
    public: true,
    allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
    fileSizeLimit: 5242880, // 5MB
    description: 'Logos des partenaires et services'
  },
  {
    name: 'photos',
    public: true,
    allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
    fileSizeLimit: 5242880, // 5MB
    description: 'Photos de profil des utilisateurs'
  },
  {
    name: 'documents',
    public: false,
    allowedMimeTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'],
    fileSizeLimit: 10485760, // 10MB
    description: 'Documents et fichiers divers'
  },
  {
    name: 'receipts',
    public: false,
    allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'],
    fileSizeLimit: 5242880, // 5MB
    description: 'Reçus et justificatifs'
  }
];

async function setupStorageBuckets() {
  console.log('🚀 Configuration des buckets de storage Supabase...\n');

  try {
    // Lister les buckets existants
    const { data: existingBuckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('❌ Erreur lors de la récupération des buckets existants:', listError);
      return;
    }

    console.log('📋 Buckets existants:', existingBuckets.map(b => b.name));

    // Créer ou mettre à jour chaque bucket
    for (const bucketConfig of buckets) {
      const existingBucket = existingBuckets.find(b => b.name === bucketConfig.name);
      
      if (existingBucket) {
        console.log(`✅ Bucket "${bucketConfig.name}" existe déjà`);
        
        // Mettre à jour la configuration si nécessaire
        const { error: updateError } = await supabase.storage.updateBucket(bucketConfig.name, {
          public: bucketConfig.public,
          fileSizeLimit: bucketConfig.fileSizeLimit,
          allowedMimeTypes: bucketConfig.allowedMimeTypes
        });
        
        if (updateError) {
          console.error(`⚠️ Erreur lors de la mise à jour du bucket "${bucketConfig.name}":`, updateError);
        } else {
          console.log(`🔄 Bucket "${bucketConfig.name}" mis à jour`);
        }
      } else {
        // Créer le nouveau bucket
        const { data, error } = await supabase.storage.createBucket(bucketConfig.name, {
          public: bucketConfig.public,
          fileSizeLimit: bucketConfig.fileSizeLimit,
          allowedMimeTypes: bucketConfig.allowedMimeTypes
        });
        
        if (error) {
          console.error(`❌ Erreur lors de la création du bucket "${bucketConfig.name}":`, error);
        } else {
          console.log(`✅ Bucket "${bucketConfig.name}" créé avec succès`);
        }
      }
    }

    // Créer les politiques RLS pour les buckets
    await setupStoragePolicies();

    console.log('\n🎉 Configuration des buckets terminée avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur lors de la configuration des buckets:', error);
  }
}

async function setupStoragePolicies() {
  console.log('\n🔒 Configuration des politiques de sécurité (RLS)...');

  const policies = [
    // Politiques pour le bucket 'logos'
    {
      bucket: 'logos',
      name: 'Logos publics accessibles à tous',
      definition: 'SELECT',
      policy: 'true'
    },
    {
      bucket: 'logos',
      name: 'Authenticated users can upload logos',
      definition: 'INSERT',
      policy: 'auth.role() = \'authenticated\''
    },
    {
      bucket: 'logos',
      name: 'Users can update their own logos',
      definition: 'UPDATE',
      policy: 'auth.role() = \'authenticated\''
    },
    {
      bucket: 'logos',
      name: 'Users can delete their own logos',
      definition: 'DELETE',
      policy: 'auth.role() = \'authenticated\''
    },

    // Politiques pour le bucket 'photos'
    {
      bucket: 'photos',
      name: 'Photos publiques accessibles à tous',
      definition: 'SELECT',
      policy: 'true'
    },
    {
      bucket: 'photos',
      name: 'Authenticated users can upload photos',
      definition: 'INSERT',
      policy: 'auth.role() = \'authenticated\''
    },
    {
      bucket: 'photos',
      name: 'Users can update their own photos',
      definition: 'UPDATE',
      policy: 'auth.role() = \'authenticated\''
    },
    {
      bucket: 'photos',
      name: 'Users can delete their own photos',
      definition: 'DELETE',
      policy: 'auth.role() = \'authenticated\''
    },

    // Politiques pour le bucket 'documents'
    {
      bucket: 'documents',
      name: 'Authenticated users can view documents',
      definition: 'SELECT',
      policy: 'auth.role() = \'authenticated\''
    },
    {
      bucket: 'documents',
      name: 'Authenticated users can upload documents',
      definition: 'INSERT',
      policy: 'auth.role() = \'authenticated\''
    },
    {
      bucket: 'documents',
      name: 'Users can update their own documents',
      definition: 'UPDATE',
      policy: 'auth.role() = \'authenticated\''
    },
    {
      bucket: 'documents',
      name: 'Users can delete their own documents',
      definition: 'DELETE',
      policy: 'auth.role() = \'authenticated\''
    },

    // Politiques pour le bucket 'receipts'
    {
      bucket: 'receipts',
      name: 'Authenticated users can view receipts',
      definition: 'SELECT',
      policy: 'auth.role() = \'authenticated\''
    },
    {
      bucket: 'receipts',
      name: 'Authenticated users can upload receipts',
      definition: 'INSERT',
      policy: 'auth.role() = \'authenticated\''
    },
    {
      bucket: 'receipts',
      name: 'Users can update their own receipts',
      definition: 'UPDATE',
      policy: 'auth.role() = \'authenticated\''
    },
    {
      bucket: 'receipts',
      name: 'Users can delete their own receipts',
      definition: 'DELETE',
      policy: 'auth.role() = \'authenticated\''
    }
  ];

  for (const policyConfig of policies) {
    try {
      // Vérifier si la politique existe déjà
      const { data: existingPolicies, error: listError } = await supabase.storage.getBucketPolicy(policyConfig.bucket);
      
      if (listError) {
        console.error(`⚠️ Erreur lors de la vérification des politiques pour "${policyConfig.bucket}":`, listError);
        continue;
      }

      const policyExists = existingPolicies?.some(p => p.name === policyConfig.name);
      
      if (policyExists) {
        console.log(`✅ Politique "${policyConfig.name}" existe déjà pour le bucket "${policyConfig.bucket}"`);
      } else {
        // Créer la politique
        const { error } = await supabase.storage.createBucketPolicy(policyConfig.bucket, {
          name: policyConfig.name,
          definition: policyConfig.definition,
          policy: policyConfig.policy
        });
        
        if (error) {
          console.error(`❌ Erreur lors de la création de la politique "${policyConfig.name}":`, error);
        } else {
          console.log(`✅ Politique "${policyConfig.name}" créée pour le bucket "${policyConfig.bucket}"`);
        }
      }
    } catch (error) {
      console.error(`❌ Erreur lors de la configuration de la politique "${policyConfig.name}":`, error);
    }
  }
}

// Fonction pour tester l'upload
async function testUpload() {
  console.log('\n🧪 Test d\'upload...');
  
  try {
    // Créer un fichier de test
    const testContent = 'Test file content';
    const testFile = new Blob([testContent], { type: 'text/plain' });
    const fileName = `test-${Date.now()}.txt`;
    
    // Upload dans le bucket documents
    const { data, error } = await supabase.storage
      .from('documents')
      .upload(`test/${fileName}`, testFile);
    
    if (error) {
      console.error('❌ Erreur lors du test d\'upload:', error);
    } else {
      console.log('✅ Test d\'upload réussi:', data);
      
      // Supprimer le fichier de test
      await supabase.storage
        .from('documents')
        .remove([`test/${fileName}`]);
      
      console.log('🧹 Fichier de test supprimé');
    }
  } catch (error) {
    console.error('❌ Erreur lors du test d\'upload:', error);
  }
}

// Exécution du script
async function main() {
  console.log('🔧 Configuration du Storage Supabase pour ZaLaMa Admin\n');
  
  await setupStorageBuckets();
  await testUpload();
  
  console.log('\n✨ Configuration terminée !');
  console.log('\n📝 Prochaines étapes :');
  console.log('1. Vérifiez que les buckets ont été créés dans votre dashboard Supabase');
  console.log('2. Testez l\'upload de fichiers depuis l\'application');
  console.log('3. Configurez les politiques RLS selon vos besoins spécifiques');
}

main().catch(console.error); 
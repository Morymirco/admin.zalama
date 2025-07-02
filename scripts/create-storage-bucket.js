const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = 'https://mspmrzlqhwpdkkburjiw.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zcG1yemxxaHdwZGtrYnVyaml3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDc4NzI1OCwiZXhwIjoyMDY2MzYzMjU4fQ.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8'; // Clé de service

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createStorageBuckets() {
  try {
    console.log('🚀 Création des buckets de stockage...');

    // Créer le bucket 'logos' pour les logos de partenaires et services
    console.log('📦 Création du bucket "logos"...');
    const { data: logosData, error: logosError } = await supabase.storage.createBucket('logos', {
      public: true,
      allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
      fileSizeLimit: 5242880 // 5MB
    });

    if (logosError) {
      if (logosError.message.includes('already exists')) {
        console.log('✅ Bucket "logos" existe déjà');
      } else {
        console.error('❌ Erreur création bucket logos:', logosError);
      }
    } else {
      console.log('✅ Bucket "logos" créé avec succès');
    }

    // Créer le bucket 'photos' pour les photos de profil utilisateurs
    console.log('📦 Création du bucket "photos"...');
    const { data: photosData, error: photosError } = await supabase.storage.createBucket('photos', {
      public: true,
      allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
      fileSizeLimit: 5242880 // 5MB
    });

    if (photosError) {
      if (photosError.message.includes('already exists')) {
        console.log('✅ Bucket "photos" existe déjà');
      } else {
        console.error('❌ Erreur création bucket photos:', photosError);
      }
    } else {
      console.log('✅ Bucket "photos" créé avec succès');
    }

    // Créer le bucket 'documents' pour les documents
    console.log('📦 Création du bucket "documents"...');
    const { data: docsData, error: docsError } = await supabase.storage.createBucket('documents', {
      public: false,
      allowedMimeTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
      fileSizeLimit: 10485760 // 10MB
    });

    if (docsError) {
      if (docsError.message.includes('already exists')) {
        console.log('✅ Bucket "documents" existe déjà');
      } else {
        console.error('❌ Erreur création bucket documents:', docsError);
      }
    } else {
      console.log('✅ Bucket "documents" créé avec succès');
    }

    // Créer le bucket 'receipts' pour les reçus
    console.log('📦 Création du bucket "receipts"...');
    const { data: receiptsData, error: receiptsError } = await supabase.storage.createBucket('receipts', {
      public: false,
      allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'],
      fileSizeLimit: 5242880 // 5MB
    });

    if (receiptsError) {
      if (receiptsError.message.includes('already exists')) {
        console.log('✅ Bucket "receipts" existe déjà');
      } else {
        console.error('❌ Erreur création bucket receipts:', receiptsError);
      }
    } else {
      console.log('✅ Bucket "receipts" créé avec succès');
    }

    console.log('🎉 Configuration des buckets terminée !');

    // Lister tous les buckets pour vérification
    console.log('\n📋 Liste des buckets disponibles:');
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('❌ Erreur lors du listing des buckets:', listError);
    } else {
      buckets.forEach(bucket => {
        console.log(`  - ${bucket.name} (public: ${bucket.public})`);
      });
    }

  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

// Exécuter le script
createStorageBuckets(); 
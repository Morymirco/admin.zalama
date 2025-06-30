const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = 'https://mspmrzlqhwpdkkburjiw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zcG1yemxxaHdwZGtrYnVyaml3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3ODcyNTgsImV4cCI6MjA2NjM2MzI1OH0.zr-TRpKjGJjW0nRtsyPcCLy4Us-c5tOGX71k5_3JJd0';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Services de test
const sampleServices = [
  {
    nom: 'Avance sur salaire',
    description: 'Service permettant aux employés de demander une avance sur leur salaire en cas de besoin urgent',
    categorie: 'Financier',
    frais_attribues: 5000,
    pourcentage_max: 30,
    duree: '24-48 heures',
    disponible: true,
    image_url: null
  },
  {
    nom: 'Attestation de travail',
    description: 'Génération d\'attestations de travail pour les employés',
    categorie: 'Administratif',
    frais_attribues: 2000,
    pourcentage_max: 10,
    duree: '2-4 heures',
    disponible: true,
    image_url: null
  },
  {
    nom: 'Demande de congé',
    description: 'Gestion des demandes de congé et de permission',
    categorie: 'RH',
    frais_attribues: 0,
    pourcentage_max: 0,
    duree: '24 heures',
    disponible: true,
    image_url: null
  },
  {
    nom: 'Certificat de salaire',
    description: 'Émission de certificats de salaire pour les employés',
    categorie: 'Administratif',
    frais_attribues: 3000,
    pourcentage_max: 15,
    duree: '4-6 heures',
    disponible: true,
    image_url: null
  },
  {
    nom: 'Prêt personnel',
    description: 'Service de prêt personnel pour les employés',
    categorie: 'Financier',
    frais_attribues: 10000,
    pourcentage_max: 50,
    duree: '3-5 jours',
    disponible: false,
    image_url: null
  },
  {
    nom: 'Formation professionnelle',
    description: 'Accès aux formations professionnelles et développement des compétences',
    categorie: 'Formation',
    frais_attribues: 15000,
    pourcentage_max: 25,
    duree: 'Variable',
    disponible: true,
    image_url: null
  }
];

async function addSampleServices() {
  try {
    console.log('🚀 Ajout des services de test...');
    
    // Supprimer les services existants (optionnel)
    const { error: deleteError } = await supabase
      .from('services')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Supprimer tous sauf un ID impossible
    
    if (deleteError) {
      console.log('Note: Aucun service existant à supprimer ou erreur:', deleteError.message);
    }

    // Ajouter les nouveaux services
    const { data, error } = await supabase
      .from('services')
      .insert(sampleServices)
      .select();

    if (error) {
      console.error('❌ Erreur lors de l\'ajout des services:', error);
      return;
    }

    console.log('✅ Services ajoutés avec succès!');
    console.log('📊 Services créés:', data.length);
    
    data.forEach((service, index) => {
      console.log(`${index + 1}. ${service.nom} (${service.categorie})`);
    });

  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

// Exécuter le script
addSampleServices(); 
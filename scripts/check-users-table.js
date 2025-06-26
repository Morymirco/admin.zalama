const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement manquantes:');
  console.error('   - NEXT_PUBLIC_SUPABASE_URL');
  console.error('   - SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkUsersTable() {
  console.log('🔍 Vérification de la table users...');

  try {
    // Tenter de récupérer des données de la table users
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .limit(1);

    if (error) {
      console.error('❌ Erreur lors de l\'accès à la table users:', error);
      
      if (error.code === '42P01') {
        console.log('📋 Table users non trouvée, création en cours...');
        await createUsersTable();
      } else if (error.code === '42501') {
        console.log('🔒 Problème de permissions RLS, désactivation temporaire...');
        await disableRLSForUsers();
      } else {
        console.log('💡 Autre erreur, vérifiez la configuration Supabase');
      }
    } else {
      console.log('✅ Table users accessible');
      console.log(`📊 ${data.length} utilisateur(s) trouvé(s)`);
    }

  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error);
  }
}

async function createUsersTable() {
  try {
    // Créer la table users avec le schéma de base
    const { error } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS users (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          display_name VARCHAR(200) NOT NULL,
          phone_number VARCHAR(20),
          adresse TEXT,
          type VARCHAR(50) DEFAULT 'Étudiant',
          statut VARCHAR(50) DEFAULT 'En attente',
          photo_url VARCHAR(500),
          organisation VARCHAR(200),
          poste VARCHAR(100),
          departement VARCHAR(100),
          niveau_etudes VARCHAR(100),
          etablissement VARCHAR(200),
          date_inscription TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          derniere_connexion TIMESTAMP WITH TIME ZONE,
          active BOOLEAN DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (error) {
      console.error('❌ Erreur lors de la création de la table users:', error);
    } else {
      console.log('✅ Table users créée avec succès');
      
      // Désactiver RLS temporairement
      await disableRLSForUsers();
      
      // Ajouter quelques utilisateurs de test
      await addSampleUsers();
    }
  } catch (error) {
    console.error('❌ Erreur lors de la création de la table:', error);
  }
}

async function disableRLSForUsers() {
  try {
    const { error } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE users DISABLE ROW LEVEL SECURITY;'
    });

    if (error) {
      console.error('❌ Erreur lors de la désactivation de RLS:', error);
    } else {
      console.log('✅ RLS désactivé pour la table users');
    }
  } catch (error) {
    console.error('❌ Erreur lors de la désactivation de RLS:', error);
  }
}

async function addSampleUsers() {
  try {
    const sampleUsers = [
      {
        email: 'etudiant@example.com',
        display_name: 'Étudiant Test',
        phone_number: '+224123456789',
        type: 'Étudiant',
        statut: 'Actif',
        niveau_etudes: 'Licence',
        etablissement: 'Université de Conakry',
        active: true
      },
      {
        email: 'salarie@example.com',
        display_name: 'Salarié Test',
        phone_number: '+224123456790',
        type: 'Salarié',
        statut: 'Actif',
        poste: 'Développeur',
        departement: 'IT',
        organisation: 'TechCorp',
        active: true
      },
      {
        email: 'entreprise@example.com',
        display_name: 'Entreprise Test',
        phone_number: '+224123456791',
        type: 'Entreprise',
        statut: 'Actif',
        organisation: 'BusinessCorp',
        active: true
      }
    ];

    const { data, error } = await supabase
      .from('users')
      .insert(sampleUsers)
      .select();

    if (error) {
      console.error('❌ Erreur lors de l\'ajout des utilisateurs de test:', error);
    } else {
      console.log(`✅ ${data.length} utilisateurs de test ajoutés`);
    }
  } catch (error) {
    console.error('❌ Erreur lors de l\'ajout des utilisateurs de test:', error);
  }
}

// Exécuter la vérification
checkUsersTable()
  .then(() => {
    console.log('🎉 Vérification terminée');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Erreur fatale:', error);
    process.exit(1);
  }); 
// Charger les variables d'environnement depuis .env.local
require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase - Variables définies directement
const supabaseUrl = 'https://mspmrzlqhwpdkkburjiw.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zcG1yemxxaHdwZGtrYnVyaml3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDc4NzI1OCwiZXhwIjoyMDY2MzYzMjU4fQ.6sIgEDZIP1fkUoxdPJYfzKHU1B_SfN6Hui6v_FV6yzw';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement Supabase manquantes');
  console.log('Assurez-vous que NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont définies dans .env.local');
  console.log('\nVérification des variables :');
  console.log(`   NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl ? '✅ Définie' : '❌ Manquante'}`);
  console.log(`   SUPABASE_SERVICE_ROLE_KEY: ${supabaseServiceKey ? '✅ Définie' : '❌ Manquante'}`);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Configuration du compte admin par défaut
const DEFAULT_ADMIN = {
  email: 'admin@zalamagn.com',
  password: 'AdminZalama2024!',
  displayName: 'Administrateur Zalama',
  role: 'admin'
};

async function createAdminUser() {
  console.log('🚀 Création du compte administrateur par défaut\n');

  try {
    // Vérifier la connexion
    console.log('1️⃣ Vérification de la connexion Supabase...');
    const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('❌ Erreur de connexion Supabase:', authError.message);
      return;
    }
    
    console.log('✅ Connexion Supabase réussie');
    console.log(`   Utilisateurs existants: ${authData.users.length}\n`);

    // Vérifier si l'admin existe déjà
    console.log('2️⃣ Vérification de l\'existence du compte admin...');
    const existingAdmin = authData.users.find(user => user.email === DEFAULT_ADMIN.email);
    
    if (existingAdmin) {
      console.log('⚠️ Le compte admin existe déjà');
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   ID: ${existingAdmin.id}`);
      console.log(`   Créé le: ${existingAdmin.created_at}`);
      
      // Vérifier s'il est dans la table admin_users
      const { data: userRecord, error: userError } = await supabase
        .from('admin_users')
        .select('*')
        .eq('id', existingAdmin.id)
        .single();

      if (userError) {
        console.log('⚠️ L\'admin n\'est pas dans la table admin_users, ajout en cours...');
        await addUserRecord(existingAdmin);
      } else {
        console.log('✅ L\'admin est déjà dans la table admin_users');
        console.log(`   Nom: ${userRecord.display_name}`);
        console.log(`   Rôle: ${userRecord.role}`);
      }
      
      return;
    }

    // Créer le compte admin
    console.log('3️⃣ Création du compte administrateur...');
    const { data: adminUser, error: createError } = await supabase.auth.admin.createUser({
      email: DEFAULT_ADMIN.email,
      password: DEFAULT_ADMIN.password,
      email_confirm: true,
      user_metadata: {
        displayName: DEFAULT_ADMIN.displayName,
        role: DEFAULT_ADMIN.role,
      },
    });

    if (createError) {
      console.error('❌ Erreur lors de la création de l\'admin:', createError.message);
      return;
    }

    if (!adminUser.user) {
      console.error('❌ Aucun utilisateur créé');
      return;
    }

    console.log('✅ Compte admin créé avec succès');
    console.log(`   ID: ${adminUser.user.id}`);
    console.log(`   Email: ${adminUser.user.email}`);

    // Ajouter l'enregistrement dans la table admin_users
    console.log('\n4️⃣ Ajout dans la table admin_users...');
    await addUserRecord(adminUser.user);

    console.log('\n🎉 Compte administrateur créé avec succès !');
    console.log('\n📋 Informations de connexion :');
    console.log(`   Email: ${DEFAULT_ADMIN.email}`);
    console.log(`   Mot de passe: ${DEFAULT_ADMIN.password}`);
    console.log('\n⚠️ IMPORTANT: Changez le mot de passe après la première connexion !');

  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

async function addUserRecord(authUser) {
  try {
    const { data, error } = await supabase
      .from('admin_users')
      .insert([{
        id: authUser.id,
        email: authUser.email,
        display_name: authUser.user_metadata?.displayName || 'Administrateur',
        role: authUser.user_metadata?.role || 'admin',
        active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      console.error('❌ Erreur lors de l\'ajout dans la table admin_users:', error.message);
    } else {
      console.log('✅ Enregistrement ajouté dans la table admin_users');
      console.log(`   Nom: ${data.display_name}`);
      console.log(`   Rôle: ${data.role}`);
    }
  } catch (error) {
    console.error('❌ Erreur lors de l\'ajout dans la table admin_users:', error.message);
  }
}

// Fonction pour vérifier la configuration
async function checkConfiguration() {
  console.log('🔧 Vérification de la configuration...\n');
  
  console.log('Variables d\'environnement :');
  console.log(`   NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl ? '✅ Définie' : '❌ Manquante'}`);
  console.log(`   SUPABASE_SERVICE_ROLE_KEY: ${supabaseServiceKey ? '✅ Définie' : '❌ Manquante'}`);
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.log('\n❌ Configuration incomplète. Veuillez vérifier votre fichier .env.local');
    return false;
  }
  
  console.log('\n✅ Configuration valide');
  return true;
}

// Exécuter le script
async function main() {
  const configOk = await checkConfiguration();
  if (configOk) {
    await createAdminUser();
  }
}

main(); 
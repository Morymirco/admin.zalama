const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

console.log('🔍 Vérification de la configuration ZaLaMa Admin\n');

// Vérifier les variables d'environnement
const requiredVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY'
];

let missingVars = [];
let config = {};

requiredVars.forEach(varName => {
  const value = process.env[varName];
  if (!value) {
    missingVars.push(varName);
  } else {
    config[varName] = value;
  }
});

if (missingVars.length > 0) {
  console.log('❌ Variables d\'environnement manquantes :');
  missingVars.forEach(varName => {
    console.log(`   - ${varName}`);
  });
  console.log('\n💡 Créez un fichier .env.local avec ces variables');
  process.exit(1);
}

console.log('✅ Toutes les variables d\'environnement sont présentes\n');

// Tester la connexion Supabase
async function testSupabaseConnection() {
  console.log('🔗 Test de connexion à Supabase...');
  
  try {
    const supabase = createClient(
      config.NEXT_PUBLIC_SUPABASE_URL,
      config.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    // Test simple de connexion
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);

    if (error) {
      console.log('❌ Erreur de connexion à Supabase :');
      console.log(`   ${error.message}`);
      
      if (error.message.includes('relation "users" does not exist')) {
        console.log('\n💡 La table "users" n\'existe pas. Exécutez le schéma SQL dans Supabase.');
      }
      
      return false;
    }

    console.log('✅ Connexion à Supabase réussie');
    return true;

  } catch (error) {
    console.log('❌ Erreur lors du test de connexion :');
    console.log(`   ${error.message}`);
    return false;
  }
}

// Tester la connexion avec la clé service role
async function testServiceRoleConnection() {
  console.log('\n🔑 Test de connexion avec la clé service role...');
  
  try {
    const supabase = createClient(
      config.NEXT_PUBLIC_SUPABASE_URL,
      config.SUPABASE_SERVICE_ROLE_KEY
    );

    // Test d'accès admin
    const { data, error } = await supabase.auth.admin.listUsers();

    if (error) {
      console.log('❌ Erreur avec la clé service role :');
      console.log(`   ${error.message}`);
      return false;
    }

    console.log('✅ Clé service role valide');
    console.log(`   Utilisateurs dans Auth : ${data.users.length}`);
    return true;

  } catch (error) {
    console.log('❌ Erreur lors du test de la clé service role :');
    console.log(`   ${error.message}`);
    return false;
  }
}

// Vérifier la structure de la base de données
async function checkDatabaseStructure() {
  console.log('\n🗄️ Vérification de la structure de la base de données...');
  
  try {
    const supabase = createClient(
      config.NEXT_PUBLIC_SUPABASE_URL,
      config.SUPABASE_SERVICE_ROLE_KEY
    );

    const requiredTables = [
      'users',
      'partners',
      'employees',
      'services',
      'alerts',
      'financial_transactions',
      'performance_metrics',
      'notifications'
    ];

    let missingTables = [];
    let existingTables = [];

    for (const tableName of requiredTables) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);

        if (error) {
          missingTables.push(tableName);
        } else {
          existingTables.push(tableName);
        }
      } catch (error) {
        missingTables.push(tableName);
      }
    }

    if (existingTables.length > 0) {
      console.log('✅ Tables existantes :');
      existingTables.forEach(table => {
        console.log(`   - ${table}`);
      });
    }

    if (missingTables.length > 0) {
      console.log('❌ Tables manquantes :');
      missingTables.forEach(table => {
        console.log(`   - ${table}`);
      });
      console.log('\n💡 Exécutez le schéma SQL dans Supabase SQL Editor');
      return false;
    }

    console.log('✅ Toutes les tables sont présentes');
    return true;

  } catch (error) {
    console.log('❌ Erreur lors de la vérification de la structure :');
    console.log(`   ${error.message}`);
    return false;
  }
}

// Vérifier l'existence de l'admin
async function checkAdminUser() {
  console.log('\n👤 Vérification de l\'utilisateur admin...');
  
  try {
    const supabase = createClient(
      config.NEXT_PUBLIC_SUPABASE_URL,
      config.SUPABASE_SERVICE_ROLE_KEY
    );

    // Vérifier dans Auth
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.log('❌ Erreur lors de la vérification Auth :');
      console.log(`   ${authError.message}`);
      return false;
    }

    const adminInAuth = authUsers.users.find(user => user.email === 'admin@zalama.com');
    
    if (adminInAuth) {
      console.log('✅ Admin trouvé dans Supabase Auth');
    } else {
      console.log('❌ Admin non trouvé dans Supabase Auth');
    }

    // Vérifier dans la table users
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'admin@zalama.com')
      .single();

    if (userError && userError.code !== 'PGRST116') {
      console.log('❌ Erreur lors de la vérification table users :');
      console.log(`   ${userError.message}`);
      return false;
    }

    if (userData) {
      console.log('✅ Admin trouvé dans la table users');
      console.log(`   ID: ${userData.id}`);
      console.log(`   Statut: ${userData.statut}`);
    } else {
      console.log('❌ Admin non trouvé dans la table users');
    }

    if (!adminInAuth || !userData) {
      console.log('\n💡 Exécutez le script de création de l\'admin :');
      console.log('   node scripts/create-admin.js');
      return false;
    }

    return true;

  } catch (error) {
    console.log('❌ Erreur lors de la vérification de l\'admin :');
    console.log(`   ${error.message}`);
    return false;
  }
}

// Fonction principale
async function main() {
  const results = {
    env: true,
    connection: false,
    serviceRole: false,
    structure: false,
    admin: false
  };

  // Test de connexion
  results.connection = await testSupabaseConnection();
  results.serviceRole = await testServiceRoleConnection();
  
  if (results.connection && results.serviceRole) {
    results.structure = await checkDatabaseStructure();
    results.admin = await checkAdminUser();
  }

  // Résumé
  console.log('\n📊 Résumé de la vérification :');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`Variables d'environnement : ${results.env ? '✅' : '❌'}`);
  console.log(`Connexion Supabase : ${results.connection ? '✅' : '❌'}`);
  console.log(`Clé service role : ${results.serviceRole ? '✅' : '❌'}`);
  console.log(`Structure DB : ${results.structure ? '✅' : '❌'}`);
  console.log(`Utilisateur admin : ${results.admin ? '✅' : '❌'}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  if (results.env && results.connection && results.serviceRole && results.structure && results.admin) {
    console.log('\n🎉 Configuration complète ! L\'application est prête à être utilisée.');
    console.log('🚀 Lancez l\'application avec : npm run dev');
  } else {
    console.log('\n⚠️  Certains éléments nécessitent une attention.');
    console.log('📖 Consultez le guide SETUP_ENV.md pour plus de détails.');
    process.exit(1);
  }
}

// Exécuter le script
main().catch(console.error); 
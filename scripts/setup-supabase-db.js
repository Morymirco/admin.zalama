const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

console.log('🗄️  Configuration de la base de données Supabase ZaLaMa\n');

// Charger les variables d'environnement
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.log('❌ Variables d\'environnement manquantes');
  console.log('💡 Exécutez d\'abord : node scripts/setup-supabase-env.js');
  process.exit(1);
}

// Créer le client Supabase avec la clé service
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupDatabase() {
  try {
    console.log('🔍 Vérification de la connexion Supabase...');
    
    // Test de connexion
    const { data, error } = await supabase.from('partners').select('count').limit(1);
    
    if (error && error.code === 'PGRST116') {
      console.log('📋 Table partners non trouvée, création du schéma...');
      await createSchema();
    } else if (error) {
      throw error;
    } else {
      console.log('✅ Connexion Supabase réussie');
      console.log('✅ Base de données déjà configurée');
      return;
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de la configuration :', error.message);
    process.exit(1);
  }
}

async function createSchema() {
  try {
    console.log('📖 Lecture du schéma SQL...');
    
    const schemaPath = path.join(__dirname, '..', 'supabase', 'schema.sql');
    if (!fs.existsSync(schemaPath)) {
      throw new Error('Fichier schema.sql non trouvé');
    }
    
    const schemaContent = fs.readFileSync(schemaPath, 'utf8');
    
    // Diviser le schéma en commandes individuelles
    const commands = schemaContent
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));
    
    console.log(`📝 Exécution de ${commands.length} commandes SQL...\n`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];
      
      try {
        // Exécuter la commande SQL
        const { error } = await supabase.rpc('exec_sql', { sql: command });
        
        if (error) {
          // Si exec_sql n'existe pas, utiliser une approche différente
          console.log(`⚠️  Commande ${i + 1} : ${error.message}`);
          errorCount++;
        } else {
          successCount++;
        }
        
        // Afficher le progrès
        if ((i + 1) % 10 === 0) {
          console.log(`📊 Progrès : ${i + 1}/${commands.length} commandes`);
        }
        
      } catch (err) {
        console.log(`⚠️  Commande ${i + 1} : ${err.message}`);
        errorCount++;
      }
    }
    
    console.log('\n📊 Résumé de l\'exécution :');
    console.log(`✅ Commandes réussies : ${successCount}`);
    console.log(`❌ Commandes en erreur : ${errorCount}`);
    
    if (errorCount === 0) {
      console.log('\n🎉 Schéma de base de données créé avec succès !');
      await verifySetup();
    } else {
      console.log('\n⚠️  Certaines commandes ont échoué');
      console.log('💡 Vérifiez les logs ci-dessus et exécutez manuellement dans Supabase Dashboard');
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de la création du schéma :', error.message);
    console.log('\n💡 Exécutez manuellement le schéma dans Supabase Dashboard :');
    console.log('1. Allez sur https://supabase.com/dashboard');
    console.log('2. Sélectionnez votre projet ZaLaMa');
    console.log('3. Allez dans SQL Editor');
    console.log('4. Copiez le contenu de supabase/schema.sql');
    console.log('5. Exécutez le script');
  }
}

async function verifySetup() {
  try {
    console.log('\n🔍 Vérification de la configuration...');
    
    // Vérifier les tables principales
    const tables = ['users', 'partners', 'employees', 'services', 'alerts', 'financial_transactions'];
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase.from(table).select('count').limit(1);
        
        if (error) {
          console.log(`❌ Table ${table} : Erreur - ${error.message}`);
        } else {
          console.log(`✅ Table ${table} : OK`);
        }
      } catch (err) {
        console.log(`❌ Table ${table} : Erreur - ${err.message}`);
      }
    }
    
    // Vérifier les vues
    const views = ['user_statistics', 'financial_performance', 'active_alerts', 'partner_statistics'];
    
    for (const view of views) {
      try {
        const { data, error } = await supabase.from(view).select('*').limit(1);
        
        if (error) {
          console.log(`❌ Vue ${view} : Erreur - ${error.message}`);
        } else {
          console.log(`✅ Vue ${view} : OK`);
        }
      } catch (err) {
        console.log(`❌ Vue ${view} : Erreur - ${err.message}`);
      }
    }
    
    console.log('\n🎉 Configuration de la base de données terminée !');
    console.log('\n🚀 Prochaines étapes :');
    console.log('1. Testez la migration : http://localhost:3000/dashboard/migration-test');
    console.log('2. Créez un utilisateur admin si nécessaire');
    console.log('3. Commencez à utiliser l\'application');
    
  } catch (error) {
    console.error('❌ Erreur lors de la vérification :', error.message);
  }
}

// Exécuter la configuration
setupDatabase(); 
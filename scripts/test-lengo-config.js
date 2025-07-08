// Charger les variables d'environnement depuis les deux fichiers
require('dotenv').config({ path: '.env' });
require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

// Configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mspmrzlqhwpdkkburjiw.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const LENGO_API_URL = process.env.LENGO_API_URL || 'https://portal.lengopay.com';
const LENGO_SITE_ID = process.env.LENGO_SITE_ID;
const LENGO_API_KEY = process.env.LENGO_API_KEY;
const LENGO_CALLBACK_URL = process.env.LENGO_CALLBACK_URL;

console.log('🔍 DIAGNOSTIC LENGOPAY CONFIGURATION');
console.log('=====================================');

// Vérifier les variables d'environnement
console.log('\n📋 Variables d\'environnement:');
console.log('  - NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅ Présent' : '❌ Manquant');
console.log('  - SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅ Présent' : '❌ Manquant');
console.log('  - LENGO_API_URL:', LENGO_API_URL);
console.log('  - LENGO_SITE_ID:', LENGO_SITE_ID ? '✅ Présent' : '❌ Manquant');
console.log('  - LENGO_API_KEY:', LENGO_API_KEY ? '✅ Présent' : '❌ Manquant');
console.log('  - LENGO_CALLBACK_URL:', LENGO_CALLBACK_URL ? '✅ Présent' : '❌ Manquant');

// Test de connexion Supabase
async function testSupabaseConnection() {
  console.log('\n🗄️ Test de connexion Supabase...');
  
  if (!supabaseServiceKey) {
    console.error('❌ SUPABASE_SERVICE_ROLE_KEY manquant');
    return false;
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Test simple de connexion
    const { data, error } = await supabase
      .from('transactions')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Erreur connexion Supabase:', error.message);
      return false;
    }
    
    console.log('✅ Connexion Supabase réussie');
    return true;
  } catch (error) {
    console.error('❌ Erreur lors du test Supabase:', error.message);
    return false;
  }
}

// Test de l'API LengoPay
async function testLengoPayAPI() {
  console.log('\n🌐 Test de l\'API LengoPay...');
  
  if (!LENGO_API_KEY) {
    console.error('❌ LENGO_API_KEY manquant');
    return false;
  }

  try {
    // Test de connectivité réseau
    console.log('  - Test de connectivité réseau...');
    const response = await fetch(`${LENGO_API_URL}/api/v2/cashin/request`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${LENGO_API_KEY}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: '1000',
        currency: 'GNF',
        websiteid: LENGO_SITE_ID || 'test',
        type_account: 'lp-om-gn',
        account: '123456789',
      }),
    });

    console.log('  - Status:', response.status);
    console.log('  - Status Text:', response.statusText);
    
    const text = await response.text();
    console.log('  - Response:', text);

    if (response.status === 500) {
      console.error('❌ Erreur 500 de l\'API LengoPay');
      console.error('  - Cela peut indiquer un problème côté serveur LengoPay');
      console.error('  - Vérifiez vos credentials et la configuration');
      return false;
    }

    if (response.ok) {
      console.log('✅ API LengoPay accessible');
      return true;
    } else {
      console.error('❌ Erreur API LengoPay:', response.status, text);
      return false;
    }
  } catch (error) {
    console.error('❌ Erreur lors du test API LengoPay:', error.message);
    return false;
  }
}

// Test de la table transactions
async function testTransactionsTable() {
  console.log('\n📊 Test de la table transactions...');
  
  if (!supabaseServiceKey) {
    console.error('❌ SUPABASE_SERVICE_ROLE_KEY manquant');
    return false;
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Vérifier la structure de la table
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ Erreur accès table transactions:', error.message);
      return false;
    }
    
    console.log('✅ Table transactions accessible');
    
    // Vérifier les colonnes requises
    if (data && data.length > 0) {
      const columns = Object.keys(data[0]);
      const requiredColumns = ['montant', 'numero_transaction', 'methode_paiement', 'numero_compte', 'description', 'statut'];
      
      console.log('  - Colonnes disponibles:', columns);
      
      const missingColumns = requiredColumns.filter(col => !columns.includes(col));
      if (missingColumns.length > 0) {
        console.error('❌ Colonnes manquantes:', missingColumns);
        return false;
      }
      
      console.log('✅ Toutes les colonnes requises sont présentes');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Erreur lors du test table transactions:', error.message);
    return false;
  }
}

// Fonction principale
async function runDiagnostics() {
  console.log('🚀 Démarrage des diagnostics...\n');
  
  const results = {
    supabase: await testSupabaseConnection(),
    lengoPay: await testLengoPayAPI(),
    transactions: await testTransactionsTable(),
  };
  
  console.log('\n📊 RÉSUMÉ DES DIAGNOSTICS');
  console.log('==========================');
  console.log('  - Supabase:', results.supabase ? '✅ OK' : '❌ ERREUR');
  console.log('  - LengoPay API:', results.lengoPay ? '✅ OK' : '❌ ERREUR');
  console.log('  - Table transactions:', results.transactions ? '✅ OK' : '❌ ERREUR');
  
  if (results.supabase && results.lengoPay && results.transactions) {
    console.log('\n🎉 Tous les tests sont passés avec succès!');
  } else {
    console.log('\n⚠️ Certains tests ont échoué. Vérifiez la configuration.');
    
    if (!results.lengoPay) {
      console.log('\n🔧 Suggestions pour LengoPay:');
      console.log('  1. Vérifiez que LENGO_API_KEY est correct');
      console.log('  2. Vérifiez que LENGO_SITE_ID est valide');
      console.log('  3. Contactez le support LengoPay si l\'erreur 500 persiste');
      console.log('  4. Vérifiez que votre compte LengoPay est actif');
    }
  }
}

// Exécuter les diagnostics
runDiagnostics().catch(console.error); 
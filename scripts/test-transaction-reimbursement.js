// Script de test pour déboguer l'API de remboursement de transactions
const API_BASE_URL = 'http://localhost:3000'; // ou https://admin.zalamasas.com en production
const API_KEY = 'zalama_partner_key_2024_secure_1';

// Fonction pour tester l'API avec plus de détails
async function testTransactionReimbursement() {
  console.log('🔍 Test de l\'API de remboursement de transactions');
  console.log('================================================');

  // 1. Test de l'endpoint GET pour voir les informations de l'API
  console.log('\n1️⃣ Test de l\'endpoint GET...');
  try {
    const getResponse = await fetch(`${API_BASE_URL}/api/payments/lengo-external`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const getResult = await getResponse.json();
    console.log('✅ GET Response:', JSON.stringify(getResult, null, 2));
  } catch (error) {
    console.error('❌ GET Error:', error.message);
  }

  // 2. Test avec des données d'exemple
  console.log('\n2️⃣ Test avec des données d\'exemple...');
  
  const testData = {
    partner_id: 'test-partner-id', // Remplacer par un vrai partner_id
    transaction_id: 'test-transaction-id', // Remplacer par un vrai transaction_id
    currency: 'GNF',
    description: 'Test remboursement transaction',
    reference: 'TEST-TXN-' + Date.now()
  };

  console.log('📤 Données envoyées:', JSON.stringify(testData, null, 2));

  try {
    const response = await fetch(`${API_BASE_URL}/api/payments/lengo-external`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    });

    console.log('📥 Status:', response.status);
    console.log('📥 Status Text:', response.statusText);
    console.log('📥 Headers:', Object.fromEntries(response.headers.entries()));

    const result = await response.json();
    console.log('📥 Response:', JSON.stringify(result, null, 2));

    if (response.ok) {
      console.log('✅ Succès!');
      console.log('🔗 URL de paiement:', result.data?.payment_url);
    } else {
      console.log('❌ Erreur:', result.error);
      
      // Suggestions basées sur l'erreur
      if (result.error?.includes('Transaction non trouvée')) {
        console.log('\n💡 Suggestions pour résoudre l\'erreur:');
        console.log('1. Vérifiez que le transaction_id existe dans la base de données');
        console.log('2. Vérifiez que la transaction appartient au partenaire');
        console.log('3. Vérifiez que la transaction a le statut "EFFECTUEE"');
        console.log('4. Vérifiez que aucun remboursement n\'existe déjà pour cette transaction');
      }
    }
  } catch (error) {
    console.error('❌ Network Error:', error.message);
  }
}

// Fonction pour lister les transactions disponibles
async function listAvailableTransactions() {
  console.log('\n3️⃣ Recherche de transactions disponibles...');
  
  // Note: Cette fonction nécessiterait un endpoint pour lister les transactions
  // ou vous pouvez utiliser le script SQL debug-transactions.sql
  
  console.log('💡 Pour voir les transactions disponibles, exécutez le script SQL:');
  console.log('   scripts/debug-transactions.sql dans Supabase SQL Editor');
}

// Fonction pour tester avec des vraies données (à adapter)
async function testWithRealData() {
  console.log('\n4️⃣ Test avec des vraies données...');
  
  // Remplacez ces valeurs par de vraies données de votre base
  const realData = {
    partner_id: 'REAL_PARTNER_ID', // UUID d'un vrai partenaire
    transaction_id: 'REAL_TRANSACTION_ID', // UUID d'une vraie transaction EFFECTUEE
    currency: 'GNF',
    description: 'Remboursement avance sur salaire',
    reference: 'REAL-TXN-' + Date.now()
  };

  console.log('📤 Données réelles:', JSON.stringify(realData, null, 2));
  console.log('⚠️  Remplacez REAL_PARTNER_ID et REAL_TRANSACTION_ID par de vraies valeurs');
}

// Fonction principale
async function main() {
  console.log('🚀 Démarrage du test de l\'API de remboursement de transactions');
  console.log('================================================================');
  
  await testTransactionReimbursement();
  await listAvailableTransactions();
  await testWithRealData();
  
  console.log('\n✅ Test terminé');
  console.log('\n📋 Prochaines étapes:');
  console.log('1. Exécutez le script SQL debug-transactions.sql dans Supabase');
  console.log('2. Identifiez un partner_id et transaction_id valides');
  console.log('3. Modifiez testWithRealData() avec les vraies valeurs');
  console.log('4. Relancez le test');
}

// Exécuter le test
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  testTransactionReimbursement,
  listAvailableTransactions,
  testWithRealData
}; 
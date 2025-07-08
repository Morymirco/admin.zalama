require('dotenv').config({ path: '.env.local' });

const API_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

console.log('🧪 TEST DE L\'API ROUTE LENGO-CASHIN');
console.log('====================================');

// Données de test
const testData = {
  amount: 5000,
  phone: '623456789',
  description: 'Test de paiement LengoPay',
  partnerId: null,
  type_account: 'lp-om-gn'
};

console.log('📋 Données de test:');
console.log(JSON.stringify(testData, null, 2));

async function testLengoCashinAPI() {
  try {
    console.log('\n🌐 Appel de l\'API route...');
    console.log('  - URL:', `${API_BASE_URL}/api/payments/lengo-cashin`);
    console.log('  - Method: POST');
    console.log('  - Body:', JSON.stringify(testData, null, 2));

    const response = await fetch(`${API_BASE_URL}/api/payments/lengo-cashin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    console.log('\n📡 Réponse reçue:');
    console.log('  - Status:', response.status);
    console.log('  - Status Text:', response.statusText);
    console.log('  - Headers:', Object.fromEntries(response.headers.entries()));

    const responseText = await response.text();
    console.log('  - Response Text:', responseText);

    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (parseError) {
      console.error('❌ Erreur parsing JSON:', parseError.message);
      return;
    }

    console.log('\n📊 Réponse parsée:');
    console.log(JSON.stringify(responseData, null, 2));

    if (response.ok && responseData.success) {
      console.log('\n✅ Test réussi!');
      console.log('  - Pay ID:', responseData.pay_id);
      console.log('  - Transaction ID:', responseData.transaction?.id);
      console.log('  - Message:', responseData.message);
    } else {
      console.log('\n❌ Test échoué!');
      console.log('  - Erreur:', responseData.error);
      if (responseData.details) {
        console.log('  - Détails:', responseData.details);
      }
    }

  } catch (error) {
    console.error('\n💥 Erreur lors du test:', error.message);
    console.error('  - Stack:', error.stack);
  }
}

// Vérifier que le serveur est en cours d'exécution
async function checkServerStatus() {
  try {
    console.log('🔍 Vérification du statut du serveur...');
    const response = await fetch(`${API_BASE_URL}/api/health`, {
      method: 'GET',
    });
    
    if (response.ok) {
      console.log('✅ Serveur accessible');
      return true;
    } else {
      console.log('⚠️ Serveur accessible mais endpoint health non disponible');
      return true; // On continue quand même
    }
  } catch (error) {
    console.error('❌ Serveur non accessible:', error.message);
    console.log('\n💡 Assurez-vous que le serveur Next.js est en cours d\'exécution:');
    console.log('   npm run dev');
    return false;
  }
}

// Fonction principale
async function runTest() {
  console.log('🚀 Démarrage du test...\n');
  
  const serverOk = await checkServerStatus();
  if (!serverOk) {
    return;
  }
  
  await testLengoCashinAPI();
  
  console.log('\n📋 RÉSUMÉ DU TEST');
  console.log('==================');
  console.log('Si vous voyez une erreur 500 de LengoPay:');
  console.log('1. Vérifiez vos credentials LengoPay');
  console.log('2. Exécutez: npm run test-lengo-config');
  console.log('3. Contactez le support LengoPay si nécessaire');
}

// Exécuter le test
runTest().catch(console.error); 
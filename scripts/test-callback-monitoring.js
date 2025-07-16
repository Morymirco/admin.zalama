// Configuration
const CALLBACK_URL = 'http://localhost:3000/api/remboursements/lengo-callback';
const TEST_PAY_ID = 'test-pay-id-' + Date.now();

console.log('🔍 Test de monitoring du callback Lengo Pay');
console.log('==========================================');
console.log(`📡 URL de callback: ${CALLBACK_URL}`);
console.log(`🆔 Pay ID de test: ${TEST_PAY_ID}`);
console.log('');

// Test 1: Vérifier que l'endpoint est accessible
async function testEndpointAccess() {
  console.log('🧪 Test 1: Vérifier l\'accessibilité de l\'endpoint...');
  
  try {
    const response = await fetch(CALLBACK_URL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Endpoint accessible:', data);
    } else {
      console.log('❌ Endpoint non accessible:', data);
    }
  } catch (error) {
    console.log('❌ Erreur de connexion:', error.message);
  }
  console.log('');
}

// Test 2: Simuler un callback SUCCESS
async function testSuccessCallback() {
  console.log('🧪 Test 2: Simuler un callback SUCCESS...');
  
  const callbackData = {
    pay_id: TEST_PAY_ID,
    status: 'SUCCESS',
    amount: 1500,
    message: 'Transaction Successful',
    Client: '624897845'
  };
  
  try {
    const response = await fetch(CALLBACK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'LengoPay/1.0'
      },
      body: JSON.stringify(callbackData)
    });
    
    const data = await response.json();
    
    console.log(`📊 Status: ${response.status}`);
    console.log('📋 Réponse:', data);
    
    if (response.ok) {
      console.log('✅ Callback SUCCESS simulé avec succès');
    } else {
      console.log('❌ Erreur lors du callback SUCCESS');
    }
  } catch (error) {
    console.log('❌ Erreur de connexion:', error.message);
  }
  console.log('');
}

// Test 3: Simuler un callback FAILED
async function testFailedCallback() {
  console.log('🧪 Test 3: Simuler un callback FAILED...');
  
  const callbackData = {
    pay_id: TEST_PAY_ID + '-failed',
    status: 'FAILED',
    amount: 1500,
    message: 'Transaction Failed',
    Client: '624897845'
  };
  
  try {
    const response = await fetch(CALLBACK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'LengoPay/1.0'
      },
      body: JSON.stringify(callbackData)
    });
    
    const data = await response.json();
    
    console.log(`📊 Status: ${response.status}`);
    console.log('📋 Réponse:', data);
    
    if (response.ok) {
      console.log('✅ Callback FAILED simulé avec succès');
    } else {
      console.log('❌ Erreur lors du callback FAILED');
    }
  } catch (error) {
    console.log('❌ Erreur de connexion:', error.message);
  }
  console.log('');
}

// Test 4: Simuler un callback avec données manquantes
async function testInvalidCallback() {
  console.log('🧪 Test 4: Simuler un callback invalide (données manquantes)...');
  
  const callbackData = {
    // pay_id manquant
    status: 'SUCCESS',
    amount: 1500
  };
  
  try {
    const response = await fetch(CALLBACK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'LengoPay/1.0'
      },
      body: JSON.stringify(callbackData)
    });
    
    const data = await response.json();
    
    console.log(`📊 Status: ${response.status}`);
    console.log('📋 Réponse:', data);
    
    if (response.status === 400) {
      console.log('✅ Validation des données fonctionne correctement');
    } else {
      console.log('❌ Validation des données ne fonctionne pas');
    }
  } catch (error) {
    console.log('❌ Erreur de connexion:', error.message);
  }
  console.log('');
}

// Exécuter tous les tests
async function runAllTests() {
  console.log('🚀 Démarrage des tests de monitoring...\n');
  
  await testEndpointAccess();
  await testSuccessCallback();
  await testFailedCallback();
  await testInvalidCallback();
  
  console.log('🎯 Tests terminés!');
  console.log('');
  console.log('📋 Comment vérifier que le callback a été appelé:');
  console.log('1. Regardez les logs de la console du serveur');
  console.log('2. Cherchez les messages avec 🚨 CALLBACK LENGO PAY DÉTECTÉ!');
  console.log('3. Vérifiez les logs avec [requestId] pour tracer chaque appel');
  console.log('4. Consultez la base de données pour voir les mises à jour');
  console.log('');
  console.log('🔍 Commandes utiles:');
  console.log('- npm run dev (pour voir les logs en temps réel)');
  console.log('- tail -f logs/app.log (si vous avez des logs)');
  console.log('- Vérifiez la table remboursements dans Supabase');
}

// Exécuter si le script est appelé directement
if (typeof process !== 'undefined' && process.argv[1] === new URL(import.meta.url).pathname) {
  runAllTests().catch(console.error);
}

export { };

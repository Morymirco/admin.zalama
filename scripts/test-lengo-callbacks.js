const fetch = require('node-fetch');

// Configuration
const PRODUCTION_URL = 'https://admin.zalamasas.com';
const CALLBACK_ENDPOINTS = [
  '/api/payments/lengo-callback',
  '/api/remboursements/lengo-callback'
];

console.log('🧪 Test des callbacks Lengo Pay');
console.log('==============================\n');

// Test 1: Vérifier l'accessibilité des endpoints
async function testEndpointAccessibility() {
  console.log('1️⃣ Test d\'accessibilité des endpoints...');
  
  for (const endpoint of CALLBACK_ENDPOINTS) {
    const url = `${PRODUCTION_URL}${endpoint}`;
    
    try {
      console.log(`\n📡 Test GET ${url}`);
      const response = await fetch(url, { 
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'LengoPay-Callback-Test/1.0'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log(`   ✅ Accessible (${response.status})`);
        console.log(`   📋 Réponse:`, data);
      } else {
        console.log(`   ⚠️  Réponse ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.log(`   ❌ Erreur: ${error.message}`);
    }
  }
}

// Test 2: Simuler un callback de paiement réussi
async function testSuccessfulPaymentCallback() {
  console.log('\n2️⃣ Test de callback de paiement réussi...');
  
  const callbackData = {
    pay_id: 'TEST_PAY_' + Date.now(),
    status: 'SUCCESS',
    amount: 50000,
    message: 'Paiement test réussi',
    Client: 'TEST_CLIENT_123',
    account: '+224123456789'
  };
  
  for (const endpoint of CALLBACK_ENDPOINTS) {
    const url = `${PRODUCTION_URL}${endpoint}`;
    
    try {
      console.log(`\n📡 Test POST ${url}`);
      console.log(`   📋 Données envoyées:`, callbackData);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'LengoPay-Callback-Test/1.0',
          'X-Lengo-Signature': 'test-signature'
        },
        body: JSON.stringify(callbackData)
      });
      
      const responseData = await response.json();
      
      if (response.ok) {
        console.log(`   ✅ Succès (${response.status})`);
        console.log(`   📋 Réponse:`, responseData);
      } else {
        console.log(`   ⚠️  Erreur ${response.status}: ${response.statusText}`);
        console.log(`   📋 Réponse:`, responseData);
      }
    } catch (error) {
      console.log(`   ❌ Erreur réseau: ${error.message}`);
    }
  }
}

// Test 3: Simuler un callback de paiement échoué
async function testFailedPaymentCallback() {
  console.log('\n3️⃣ Test de callback de paiement échoué...');
  
  const callbackData = {
    pay_id: 'TEST_PAY_FAILED_' + Date.now(),
    status: 'FAILED',
    amount: 25000,
    message: 'Paiement test échoué',
    Client: 'TEST_CLIENT_456',
    account: '+224987654321'
  };
  
  for (const endpoint of CALLBACK_ENDPOINTS) {
    const url = `${PRODUCTION_URL}${endpoint}`;
    
    try {
      console.log(`\n📡 Test POST ${url}`);
      console.log(`   📋 Données envoyées:`, callbackData);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'LengoPay-Callback-Test/1.0',
          'X-Lengo-Signature': 'test-signature'
        },
        body: JSON.stringify(callbackData)
      });
      
      const responseData = await response.json();
      
      if (response.ok) {
        console.log(`   ✅ Succès (${response.status})`);
        console.log(`   📋 Réponse:`, responseData);
      } else {
        console.log(`   ⚠️  Erreur ${response.status}: ${response.statusText}`);
        console.log(`   📋 Réponse:`, responseData);
      }
    } catch (error) {
      console.log(`   ❌ Erreur réseau: ${error.message}`);
    }
  }
}

// Test 4: Simuler un callback avec données invalides
async function testInvalidCallbackData() {
  console.log('\n4️⃣ Test de callback avec données invalides...');
  
  const invalidData = [
    { status: 'SUCCESS' }, // pay_id manquant
    { pay_id: 'TEST_123' }, // status manquant
    {}, // données vides
    { pay_id: null, status: 'SUCCESS' }, // pay_id null
    { pay_id: 'TEST_123', status: '' } // status vide
  ];
  
  for (let i = 0; i < invalidData.length; i++) {
    const data = invalidData[i];
    console.log(`\n📡 Test ${i + 1}: Données invalides`);
    console.log(`   📋 Données:`, data);
    
    try {
      const response = await fetch(`${PRODUCTION_URL}/api/payments/lengo-callback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'LengoPay-Callback-Test/1.0'
        },
        body: JSON.stringify(data)
      });
      
      const responseData = await response.json();
      
      if (response.status === 400) {
        console.log(`   ✅ Validation correcte (${response.status})`);
        console.log(`   📋 Réponse:`, responseData);
      } else {
        console.log(`   ⚠️  Réponse inattendue ${response.status}`);
        console.log(`   📋 Réponse:`, responseData);
      }
    } catch (error) {
      console.log(`   ❌ Erreur: ${error.message}`);
    }
  }
}

// Test 5: Vérifier la configuration Lengo Pay
async function testLengoConfiguration() {
  console.log('\n5️⃣ Vérification de la configuration...');
  
  const configChecks = [
    {
      name: 'URL de callback principale',
      url: 'https://admin.zalamasas.com/api/payments/lengo-callback',
      expected: 'Accessible'
    },
    {
      name: 'URL de callback remboursements',
      url: 'https://admin.zalamasas.com/api/remboursements/lengo-callback',
      expected: 'Accessible'
    }
  ];
  
  for (const check of configChecks) {
    try {
      const response = await fetch(check.url, { method: 'GET' });
      if (response.ok) {
        console.log(`   ✅ ${check.name}: ${check.expected}`);
      } else {
        console.log(`   ⚠️  ${check.name}: Réponse ${response.status}`);
      }
    } catch (error) {
      console.log(`   ❌ ${check.name}: ${error.message}`);
    }
  }
}

// Exécution des tests
async function runAllTests() {
  try {
    await testEndpointAccessibility();
    await testSuccessfulPaymentCallback();
    await testFailedPaymentCallback();
    await testInvalidCallbackData();
    await testLengoConfiguration();
    
    console.log('\n🎯 Résumé des tests:');
    console.log('   • Les endpoints doivent être accessibles');
    console.log('   • Les callbacks valides doivent être traités');
    console.log('   • Les callbacks invalides doivent être rejetés');
    console.log('   • La configuration doit être correcte');
    
    console.log('\n📋 URLs de callback pour Lengo Pay:');
    console.log('   • https://admin.zalamasas.com/api/payments/lengo-callback');
    console.log('   • https://admin.zalamasas.com/api/remboursements/lengo-callback');
    
    console.log('\n✅ Tests terminés !');
    
  } catch (error) {
    console.error('\n❌ Erreur lors des tests:', error);
    process.exit(1);
  }
}

// Point d'entrée
if (require.main === module) {
  runAllTests();
}

module.exports = {
  testEndpointAccessibility,
  testSuccessfulPaymentCallback,
  testFailedPaymentCallback,
  testInvalidCallbackData,
  testLengoConfiguration
}; 
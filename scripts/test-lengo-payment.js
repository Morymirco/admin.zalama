import fetch from 'node-fetch';

// Configuration Lengo Pay
const LENGO_API_URL = 'https://portal.lengopay.com';
const LENGO_API_KEY = 'bDM0WlhpcDRta052MmxIZEFFcEV1Mno0WERwS2R0dnk3ZUhWOEpwczdYVXdnM1Bwd016UTVLcEVZNmc0RkQwMw==';
const LENGO_WEBSITE_ID = 'ozazlahgzpntmYAG';

// URLs de test
const BASE_URL = 'http://localhost:3000';
const CALLBACK_URL = `${BASE_URL}/api/remboursements/lengo-callback`;
const RETURN_URL = `${BASE_URL}/dashboard/remboursements?status=success`;

async function testLengoPayment() {
  console.log('🧪 Test de l\'API Lengo Pay');
  console.log('📋 Configuration:');
  console.log('  - API URL:', LENGO_API_URL);
  console.log('  - Website ID:', LENGO_WEBSITE_ID);
  console.log('  - API Key:', LENGO_API_KEY ? '✅ Présent' : '❌ Manquant');
  console.log('  - Callback URL:', CALLBACK_URL);
  console.log('  - Return URL:', RETURN_URL);

  // Test 1: Vérifier que l'endpoint existe
  console.log('\n🔍 Test 1: Vérification de l\'endpoint...');
  try {
    const response = await fetch(`${LENGO_API_URL}/api/v1/payments`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${LENGO_API_KEY}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    const text = await response.text();
    console.log('  - Status:', response.status);
    console.log('  - Response:', text);
    
    if (response.status === 405) {
      console.log('  ✅ Endpoint existe (méthode GET non supportée, mais POST devrait fonctionner)');
    } else {
      console.log('  ❌ Endpoint problématique');
    }
  } catch (error) {
    console.log('  ❌ Erreur de connexion:', error.message);
  }

  // Test 2: Test avec payload minimal
  console.log('\n🔍 Test 2: Test avec payload minimal...');
  try {
    const payload = {
      websiteid: LENGO_WEBSITE_ID,
      amount: 1000,
      currency: 'GNF'
    };

    console.log('  - Payload:', payload);
    
    const response = await fetch(`${LENGO_API_URL}/api/v1/payments`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${LENGO_API_KEY}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    console.log('  - Status:', response.status);
    console.log('  - Status Text:', response.statusText);
    console.log('  - Headers:', Object.fromEntries(response.headers.entries()));

    const contentType = response.headers.get('content-type');
    console.log('  - Content-Type:', contentType);

    if (contentType && contentType.includes('application/json')) {
      const result = await response.json();
      console.log('  - Response JSON:', result);
    } else {
      const text = await response.text();
      console.log('  - Response Text:', text.substring(0, 500));
    }

    if (response.ok) {
      console.log('  ✅ Test réussi !');
    } else {
      console.log('  ❌ Test échoué');
    }
  } catch (error) {
    console.log('  ❌ Erreur:', error.message);
  }

  // Test 3: Test avec payload complet
  console.log('\n🔍 Test 3: Test avec payload complet...');
  try {
    const payload = {
      websiteid: LENGO_WEBSITE_ID,
      amount: 1000,
      currency: 'GNF',
      return_url: RETURN_URL,
      callback_url: CALLBACK_URL
    };

    console.log('  - Payload:', payload);
    
    const response = await fetch(`${LENGO_API_URL}/api/v1/payments`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${LENGO_API_KEY}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    console.log('  - Status:', response.status);
    console.log('  - Status Text:', response.statusText);

    const contentType = response.headers.get('content-type');
    console.log('  - Content-Type:', contentType);

    if (contentType && contentType.includes('application/json')) {
      const result = await response.json();
      console.log('  - Response JSON:', result);
    } else {
      const text = await response.text();
      console.log('  - Response Text:', text.substring(0, 500));
    }

    if (response.ok) {
      console.log('  ✅ Test réussi !');
    } else {
      console.log('  ❌ Test échoué');
    }
  } catch (error) {
    console.log('  ❌ Erreur:', error.message);
  }
}

// Exécuter le test
testLengoPayment().catch(console.error); 
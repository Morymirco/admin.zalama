const fetch = require('node-fetch');

// URL de base pour les tests
const BASE_URL = 'http://localhost:3000';

async function testSMSSendAPI() {
  console.log('=== Test de l\'API route SMS ===\n');

  // Test 1: Vérifier le solde
  console.log('1. Test de vérification du solde...');
  try {
    const balanceResponse = await fetch(`${BASE_URL}/api/sms/send`, {
      method: 'GET',
    });

    if (balanceResponse.ok) {
      const balanceData = await balanceResponse.json();
      console.log('✅ Solde récupéré:', balanceData.balance);
    } else {
      console.log('❌ Erreur lors de la vérification du solde:', balanceResponse.status);
    }
  } catch (error) {
    console.error('❌ Erreur réseau:', error.message);
  }

  // Test 2: Envoyer un SMS
  console.log('\n2. Test d\'envoi de SMS...');
  try {
    const smsData = {
      to: ['224625212115'],
      message: 'Test API route ZaLaMa - ' + new Date().toISOString(),
      sender_name: 'ZaLaMa'
    };

    console.log('Données SMS:', smsData);

    const smsResponse = await fetch(`${BASE_URL}/api/sms/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(smsData),
    });

    if (smsResponse.ok) {
      const smsResult = await smsResponse.json();
      console.log('✅ SMS envoyé avec succès:', smsResult);
    } else {
      const errorData = await smsResponse.json();
      console.log('❌ Erreur lors de l\'envoi du SMS:', errorData);
    }
  } catch (error) {
    console.error('❌ Erreur réseau:', error.message);
  }

  console.log('\n=== Test terminé ===');
}

// Vérifier si le serveur est en cours d'exécution
async function checkServerStatus() {
  try {
    const response = await fetch(`${BASE_URL}/api/sms/send`, {
      method: 'GET',
    });
    return response.status !== 404;
  } catch (error) {
    return false;
  }
}

async function main() {
  console.log('Vérification du statut du serveur...');
  
  const serverRunning = await checkServerStatus();
  if (!serverRunning) {
    console.log('❌ Le serveur Next.js n\'est pas en cours d\'exécution.');
    console.log('Veuillez démarrer le serveur avec: npm run dev');
    return;
  }

  console.log('✅ Serveur Next.js détecté, lancement des tests...\n');
  await testSMSSendAPI();
}

main().catch(console.error); 
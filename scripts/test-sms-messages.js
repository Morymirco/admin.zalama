const { Client } = require('nimbasms');

// Configuration Nimba SMS
const config = {
  SERVICE_ID: process.env.NIMBA_SMS_SERVICE_ID || '9d83d5b67444c654c702f109dd837167',
  SECRET_TOKEN: process.env.NIMBA_SMS_SECRET_TOKEN || 'qf_bpb4CVfEalTU5eVEFC05wpoqlo17M-mozkZVbIHT_3xfOIjB7Oac-lkXZ6Pg2VqO2LXVy6BUlYTZe73y411agSC0jVh3OcOU92s8Rplc',
};

const client = new Client(config);

async function testSMSMessages() {
  console.log('🧪 Test de l\'API des messages SMS avec Nimba SMS\n');

  try {
    // Test 1: Récupérer tous les messages
    console.log('1️⃣ Test de récupération de tous les messages...');
    const allMessages = await client.messages.list();
    console.log(`✅ ${allMessages.count} messages trouvés dans votre compte.`);
    console.log('Structure de la réponse:', JSON.stringify(allMessages, null, 2));

    // Test 2: Récupérer seulement les 5 derniers messages
    console.log('\n2️⃣ Test de récupération des 5 derniers messages...');
    const recentMessages = await client.messages.list({ limit: 5 });
    console.log(`✅ ${recentMessages.count} messages récupérés (limite: 5)`);
    
    if (recentMessages.results && recentMessages.results.length > 0) {
      console.log('Exemple de message:');
      console.log(JSON.stringify(recentMessages.results[0], null, 2));
    }

    // Test 3: Récupérer un message spécifique (si des messages existent)
    if (recentMessages.results && recentMessages.results.length > 0) {
      const firstMessageId = recentMessages.results[0].id;
      console.log(`\n3️⃣ Test de récupération du message spécifique: ${firstMessageId}`);
      
      try {
        const specificMessage = await client.messages.get(firstMessageId);
        console.log('✅ Message spécifique récupéré:');
        console.log(JSON.stringify(specificMessage, null, 2));
      } catch (error) {
        console.log('❌ Erreur lors de la récupération du message spécifique:', error.message);
      }
    }

    // Test 4: Envoyer un message de test
    console.log('\n4️⃣ Test d\'envoi d\'un message SMS...');
    const testMessage = {
      to: ['+224000000000'], // Numéro de test
      message: 'Test API Nimba SMS - ' + new Date().toLocaleString(),
      sender_name: 'ZaLaMa'
    };

    try {
      const sentMessage = await client.messages.create(testMessage);
      console.log('✅ Message de test envoyé avec succès:');
      console.log(JSON.stringify(sentMessage, null, 2));
    } catch (error) {
      console.log('❌ Erreur lors de l\'envoi du message de test:', error.message);
    }

    // Test 5: Vérifier le solde du compte
    console.log('\n5️⃣ Test de vérification du solde du compte...');
    try {
      const account = await client.accounts.get();
      console.log('✅ Solde du compte récupéré:');
      console.log(JSON.stringify(account, null, 2));
    } catch (error) {
      console.log('❌ Erreur lors de la vérification du solde:', error.message);
    }

    console.log('\n🎉 Tests terminés avec succès!');

  } catch (error) {
    console.error('❌ Erreur générale lors des tests:', error);
    
    if (error.response) {
      console.error('Détails de l\'erreur:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data
      });
    }
  }
}

// Test de l'API Next.js
async function testNextJSAPI() {
  console.log('\n🌐 Test de l\'API Next.js des messages SMS\n');

  const baseURL = 'http://localhost:3000';

  try {
    // Test 1: Récupérer les messages via l'API Next.js
    console.log('1️⃣ Test de l\'API GET /api/sms/messages...');
    const messagesResponse = await fetch(`${baseURL}/api/sms/messages?limit=5`);
    const messagesData = await messagesResponse.json();
    
    if (messagesData.success) {
      console.log('✅ Messages récupérés via API Next.js:');
      console.log(`Nombre de messages: ${messagesData.count}`);
      if (messagesData.messages && messagesData.messages.length > 0) {
        console.log('Exemple de message:', messagesData.messages[0]);
      }
    } else {
      console.log('❌ Erreur API Next.js:', messagesData.error);
    }

    // Test 2: Vérifier le solde via l'API Next.js
    console.log('\n2️⃣ Test de l\'API GET /api/sms/balance...');
    const balanceResponse = await fetch(`${baseURL}/api/sms/balance`);
    const balanceData = await balanceResponse.json();
    
    if (balanceData.success) {
      console.log('✅ Solde récupéré via API Next.js:', balanceData.balance);
    } else {
      console.log('❌ Erreur API Next.js balance:', balanceData.error);
    }

    // Test 3: Envoyer un SMS via l'API Next.js
    console.log('\n3️⃣ Test de l\'API POST /api/sms/send...');
    const sendResponse = await fetch(`${baseURL}/api/sms/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: ['+224000000000'],
        message: 'Test API Next.js - ' + new Date().toLocaleString(),
        sender_name: 'ZaLaMa'
      }),
    });
    
    const sendData = await sendResponse.json();
    if (sendData.success) {
      console.log('✅ SMS envoyé via API Next.js:', sendData.response);
    } else {
      console.log('❌ Erreur API Next.js send:', sendData.error);
    }

  } catch (error) {
    console.error('❌ Erreur lors du test de l\'API Next.js:', error.message);
  }
}

// Exécuter les tests
async function runTests() {
  console.log('🚀 Démarrage des tests SMS...\n');
  
  // Test direct de l'API Nimba SMS
  await testSMSMessages();
  
  // Test de l'API Next.js (si le serveur est en cours d'exécution)
  await testNextJSAPI();
  
  console.log('\n✨ Tous les tests sont terminés!');
}

// Exécuter si le script est appelé directement
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { testSMSMessages, testNextJSAPI }; 
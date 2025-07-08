require('dotenv').config({ path: '.env' });
require('dotenv').config({ path: '.env.local' });

const API_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

console.log('🧪 TEST LENGO AVEC LOGS DÉTAILLÉS');
console.log('==================================');

// Données de test avec numéro local guinéen
const testData = {
  amount: 1000,
  phone: '620123456', // Numéro local guinéen à 9 chiffres
  description: 'Test de paiement LengoPay avec logs détaillés',
  partnerId: null,
  type_account: 'lp-om-gn'
};

console.log('📋 Données de test:');
console.log(JSON.stringify(testData, null, 2));

async function testLengoWithDetailedLogs() {
  try {
    console.log('\n🌐 Appel de l\'API route avec logs détaillés...');
    console.log('  - URL:', `${API_BASE_URL}/api/payments/lengo-cashin`);
    console.log('  - Method: POST');
    console.log('  - Body:', JSON.stringify(testData, null, 2));

    const startTime = Date.now();
    
    const response = await fetch(`${API_BASE_URL}/api/payments/lengo-cashin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    const endTime = Date.now();
    const duration = endTime - startTime;

    console.log('\n📡 Réponse reçue:');
    console.log('  - Status:', response.status);
    console.log('  - Status Text:', response.statusText);
    console.log('  - Duration:', duration + 'ms');
    console.log('  - Headers:', Object.fromEntries(response.headers.entries()));

    const responseText = await response.text();
    console.log('  - Response Text (brut):', responseText);

    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (parseError) {
      console.error('❌ Erreur parsing JSON:', parseError.message);
      console.log('  - Response Text (non-JSON):', responseText);
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

    // Analyse des logs côté serveur
    console.log('\n🔍 ANALYSE DES LOGS CÔTÉ SERVEUR');
    console.log('==================================');
    console.log('Vérifiez les logs de votre serveur Next.js pour voir:');
    console.log('  - 🚀 Début de la route lengo-cashin');
    console.log('  - 📋 Body reçu');
    console.log('  - 📱 Numéro normalisé');
    console.log('  - 🔧 Vérification des variables d\'environnement');
    console.log('  - 💳 Paramètres Lengo Pay préparés');
    console.log('  - 🌐 Appel de l\'API Lengo Pay');
    console.log('  - ✅ Réponse Lengo Pay reçue (ou erreur)');
    console.log('  - 💾 Insertion de la transaction');
    console.log('  - 📊 Données de transaction à insérer');

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
  console.log('🚀 Démarrage du test avec logs détaillés...\n');
  
  const serverOk = await checkServerStatus();
  if (!serverOk) {
    return;
  }
  
  await testLengoWithDetailedLogs();
  
  console.log('\n📋 INSTRUCTIONS POUR VOIR LES LOGS');
  console.log('===================================');
  console.log('1. Ouvrez un autre terminal');
  console.log('2. Lancez: npm run dev');
  console.log('3. Dans ce terminal, lancez ce script');
  console.log('4. Regardez les logs détaillés dans le terminal du serveur');
  console.log('5. Copiez-moi les logs complets pour analyse');
}

// Exécuter le test
runTest().catch(console.error); 
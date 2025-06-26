const fetch = require('node-fetch');

// Configuration
const API_BASE_URL = 'http://localhost:3000';

// Fonction pour tester l'API SMS
async function testSMSAPI() {
  console.log('🧪 Test de l\'API SMS\n');

  const testCases = [
    {
      name: 'Format international complet',
      data: {
        to: '+224623456789',
        message: 'Test SMS ZaLaMa - Format international'
      }
    },
    {
      name: 'Format local guinéen',
      data: {
        to: '623456789',
        message: 'Test SMS ZaLaMa - Format local'
      }
    },
    {
      name: 'Format avec espaces',
      data: {
        to: '+224 623 456 789',
        message: 'Test SMS ZaLaMa - Format avec espaces'
      }
    },
    {
      name: 'Format sans préfixe',
      data: {
        to: '224623456789',
        message: 'Test SMS ZaLaMa - Format sans préfixe'
      }
    }
  ];

  for (const testCase of testCases) {
    console.log(`📱 Test: ${testCase.name}`);
    console.log(`📞 Numéro: ${testCase.data.to}`);
    console.log(`📨 Message: ${testCase.data.message}`);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/sms/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testCase.data),
      });

      console.log(`📡 Statut: ${response.status}`);
      
      const result = await response.json();
      console.log(`📄 Réponse:`, JSON.stringify(result, null, 2));

      if (response.ok && result.success) {
        console.log('✅ Succès\n');
      } else {
        console.log(`❌ Échec: ${result.error}\n`);
      }
    } catch (error) {
      console.log(`💥 Erreur: ${error.message}\n`);
      
      if (error.code === 'ECONNREFUSED') {
        console.log('💡 Conseil: Assurez-vous que le serveur Next.js est démarré sur le port 3000');
        console.log('   Commande: npm run dev\n');
        break;
      }
    }
  }
}

// Fonction pour vérifier le solde
async function checkBalance() {
  console.log('💰 Vérification du solde SMS\n');
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/sms/send`, {
      method: 'GET',
    });

    if (response.ok) {
      const result = await response.json();
      console.log('📊 Solde:', result);
    } else {
      console.log('❌ Erreur lors de la vérification du solde');
    }
  } catch (error) {
    console.log('💥 Erreur:', error.message);
  }
}

// Fonction principale
async function runTests() {
  console.log('🚀 Démarrage des tests de l\'API SMS\n');
  
  await checkBalance();
  await testSMSAPI();
  
  console.log('🎉 Tous les tests terminés');
}

// Exécuter les tests
runTests().catch(console.error); 
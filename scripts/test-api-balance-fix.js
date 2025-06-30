const fetch = require('node-fetch');

// URL de base pour les tests
const BASE_URL = 'http://localhost:3000';

async function testAPIBalanceFix() {
  console.log('🔧 Test de l\'API corrigée pour la vérification du solde\n');
  
  const apis = [
    { name: 'Test SMS Balance', url: '/api/test/sms', method: 'GET' },
    { name: 'SMS Send Balance', url: '/api/sms/send', method: 'GET' },
    { name: 'Health Check', url: '/api/health', method: 'GET' }
  ];

  for (const api of apis) {
    console.log(`\n📡 Test: ${api.name}`);
    console.log(`🔗 URL: ${api.method} ${BASE_URL}${api.url}`);
    
    try {
      const response = await fetch(`${BASE_URL}${api.url}`, {
        method: api.method,
      });

      console.log(`📊 Status: ${response.status} ${response.statusText}`);

      if (response.ok) {
        try {
          const result = await response.json();
          console.log('✅ Réponse JSON valide:', result);
          
          if (result.balance) {
            console.log(`💰 Solde: ${result.balance}`);
          }
        } catch (jsonError) {
          const text = await response.text();
          console.log('⚠️ Réponse non-JSON:', text.substring(0, 200) + '...');
        }
      } else {
        const errorText = await response.text();
        console.log('❌ Erreur HTTP:', errorText.substring(0, 200) + '...');
      }
      
    } catch (error) {
      console.error('💥 Erreur réseau:', error.message);
    }
  }

  console.log('\n🎯 Test d\'envoi de SMS via API...');
  try {
    const smsData = {
      to: ['224625212115'],
      message: 'Test API corrigée - ' + new Date().toISOString(),
      sender_name: 'ZaLaMa'
    };

    console.log('📤 Données SMS:', smsData);

    const response = await fetch(`${BASE_URL}/api/sms/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(smsData),
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ SMS envoyé avec succès via API:', result);
    } else {
      const errorData = await response.json();
      console.log('❌ Erreur envoi SMS:', errorData);
    }
  } catch (error) {
    console.error('💥 Erreur lors de l\'envoi SMS:', error.message);
  }

  console.log('\n🎉 Tests terminés !');
}

// Exécuter les tests
testAPIBalanceFix(); 
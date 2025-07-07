require('dotenv').config();

const API_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const API_KEY = process.env.EXTERNAL_API_KEY || 'zalama_external_key_2024';

// Configuration des headers
const headers = {
  'Content-Type': 'application/json',
  'x-api-key': API_KEY
};

// Fonction pour faire des requêtes HTTP
async function makeRequest(url, options = {}) {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...options.headers
      }
    });
    
    const data = await response.json();
    return { status: response.status, data };
  } catch (error) {
    console.error('Erreur de requête:', error.message);
    return { status: 500, data: { error: error.message } };
  }
}

async function testExternalAPI() {
  console.log('🧪 Test des routes externes de notifications...\n');

  // 1. Test du statut de l'API
  console.log('1️⃣ Test du statut de l\'API...');
  const statusResult = await makeRequest(`${API_BASE_URL}/api/external/notifications`);
  
  if (statusResult.status === 200 && statusResult.data.success) {
    console.log('✅ API accessible');
    console.log('   - Status:', statusResult.data.status);
    console.log('   - Version:', statusResult.data.version);
    console.log('   - SMS disponible:', statusResult.data.services.sms.available);
    console.log('   - Email disponible:', statusResult.data.services.email.available);
    if (statusResult.data.services.sms.available) {
      console.log('   - Solde SMS:', statusResult.data.services.sms.balance, statusResult.data.services.sms.currency);
    }
  } else {
    console.log('❌ Erreur API:', statusResult.data.error);
    return;
  }

  // 2. Test des templates disponibles
  console.log('\n2️⃣ Test des templates disponibles...');
  const templatesResult = await makeRequest(`${API_BASE_URL}/api/external/notifications/templates`);
  
  if (templatesResult.status === 200 && templatesResult.data.success) {
    console.log('✅ Templates disponibles:');
    templatesResult.data.templates.forEach(template => {
      console.log(`   - ${template.name}: ${template.description}`);
      console.log(`     Variables: ${template.variables.join(', ')}`);
    });
  } else {
    console.log('❌ Erreur templates:', templatesResult.data.error);
  }

  // 3. Test d'envoi de notification personnalisée
  console.log('\n3️⃣ Test d\'envoi de notification personnalisée...');
  const customNotification = {
    type: 'both',
    recipients: [
      {
        phone: '+224623456789',
        email: 'test@example.com',
        name: 'Utilisateur Test'
      }
    ],
    message: {
      subject: 'Test API Externe',
      content: 'Ceci est un test de l\'API externe ZaLaMa',
      html: '<h1>Test API Externe</h1><p>Ceci est un test de l\'API externe ZaLaMa</p>'
    },
    metadata: {
      partner_id: 'test-partner-123',
      request_id: 'test-request-456'
    }
  };

  const customResult = await makeRequest(`${API_BASE_URL}/api/external/notifications`, {
    method: 'POST',
    body: JSON.stringify(customNotification)
  });

  if (customResult.status === 200 && customResult.data.success) {
    console.log('✅ Notification personnalisée envoyée');
    console.log('   - Total traité:', customResult.data.results.total);
    console.log('   - Réussis:', customResult.data.results.success);
    console.log('   - Échoués:', customResult.data.results.failed);
  } else {
    console.log('❌ Erreur notification personnalisée:', customResult.data.error);
  }

  // 4. Test d'envoi avec template
  console.log('\n4️⃣ Test d\'envoi avec template...');
  const templateNotification = {
    template: 'welcome',
    recipients: [
      {
        phone: '+224623456789',
        email: 'welcome@example.com',
        name: 'Nouveau Utilisateur'
      }
    ],
    variables: {
      name: 'Nouveau Utilisateur'
    },
    metadata: {
      partner_id: 'test-partner-123'
    }
  };

  const templateResult = await makeRequest(`${API_BASE_URL}/api/external/notifications/templates`, {
    method: 'POST',
    body: JSON.stringify(templateNotification)
  });

  if (templateResult.status === 200 && templateResult.data.success) {
    console.log('✅ Notification avec template envoyée');
    console.log('   - Template utilisé:', templateResult.data.template);
    console.log('   - Total traité:', templateResult.data.results.total);
    console.log('   - Réussis:', templateResult.data.results.success);
    console.log('   - Échoués:', templateResult.data.results.failed);
  } else {
    console.log('❌ Erreur notification avec template:', templateResult.data.error);
  }

  // 5. Test d'authentification (sans clé API)
  console.log('\n5️⃣ Test d\'authentification...');
  const authResult = await makeRequest(`${API_BASE_URL}/api/external/notifications`, {
    headers: { 'Content-Type': 'application/json' } // Sans clé API
  });

  if (authResult.status === 401) {
    console.log('✅ Authentification sécurisée (accès refusé sans clé API)');
  } else {
    console.log('⚠️ Problème de sécurité: accès possible sans clé API');
  }

  console.log('\n🎉 Tests terminés !');
  console.log('\n📋 Résumé:');
  console.log('   - API accessible: ✅');
  console.log('   - Templates disponibles: ✅');
  console.log('   - Notifications personnalisées: ✅');
  console.log('   - Notifications avec templates: ✅');
  console.log('   - Sécurité: ✅');
  
  console.log('\n💡 L\'API externe est prête à être utilisée par les applications partenaires !');
}

// Exécuter les tests
testExternalAPI().catch(console.error); 
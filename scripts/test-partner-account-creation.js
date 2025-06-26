const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

// Configuration
const API_BASE_URL = 'http://localhost:3000';

// Fonction pour faire un appel HTTP avec curl
async function makeRequest(url, method = 'GET', data = null) {
  let curlCommand = `curl -X ${method} "${url}"`;
  
  if (data) {
    curlCommand += ` -H "Content-Type: application/json" -d '${JSON.stringify(data)}'`;
  }
  
  curlCommand += ' -s'; // Mode silencieux
  
  try {
    const { stdout, stderr } = await execAsync(curlCommand);
    
    if (stderr) {
      console.error('Erreur curl:', stderr);
    }
    
    return JSON.parse(stdout);
  } catch (error) {
    console.error('Erreur lors de l\'appel curl:', error.message);
    return null;
  }
}

// Fonction pour tester la création de compte RH
async function testRHAccountCreation() {
  console.log('🧪 Test de création de compte RH\n');

  const testRHData = {
    rhData: {
      email: 'rh.test@zalama.com',
      nom: 'Marie Dupont',
      partenaire_id: '550e8400-e29b-41d4-a716-446655440000'
    }
  };

  console.log('📋 Données de test RH:', testRHData);

  try {
    const result = await makeRequest(
      `${API_BASE_URL}/api/auth/create-rh-account`,
      'POST',
      testRHData
    );

    console.log('📄 Résultat création compte RH:', JSON.stringify(result, null, 2));

    if (result && result.success) {
      console.log('✅ Compte RH créé avec succès !');
      console.log('📊 Détails:', {
        email: result.account.email,
        nom: result.account.display_name,
        role: result.account.role,
        motDePasse: result.account.password
      });
    } else {
      console.log('❌ Échec création compte RH:', result ? result.error : 'Pas de réponse');
    }

  } catch (error) {
    console.error('💥 Erreur lors du test RH:', error);
  }

  console.log('\n🏁 Fin du test RH\n');
}

// Fonction pour tester la création de compte responsable
async function testResponsableAccountCreation() {
  console.log('🧪 Test de création de compte responsable\n');

  const testResponsableData = {
    responsableData: {
      email: 'responsable.test@zalama.com',
      nom: 'Jean Martin',
      partenaire_id: '550e8400-e29b-41d4-a716-446655440000'
    }
  };

  console.log('📋 Données de test responsable:', testResponsableData);

  try {
    const result = await makeRequest(
      `${API_BASE_URL}/api/auth/create-responsable-account`,
      'POST',
      testResponsableData
    );

    console.log('📄 Résultat création compte responsable:', JSON.stringify(result, null, 2));

    if (result && result.success) {
      console.log('✅ Compte responsable créé avec succès !');
      console.log('📊 Détails:', {
        email: result.account.email,
        nom: result.account.display_name,
        role: result.account.role,
        motDePasse: result.account.password
      });
    } else {
      console.log('❌ Échec création compte responsable:', result ? result.error : 'Pas de réponse');
    }

  } catch (error) {
    console.error('💥 Erreur lors du test responsable:', error);
  }

  console.log('\n🏁 Fin du test responsable\n');
}

// Fonction pour tester l'envoi SMS avec les nouveaux comptes
async function testSMSSending() {
  console.log('📱 Test d\'envoi SMS avec les nouveaux comptes\n');

  const testCases = [
    {
      name: 'SMS RH',
      data: {
        to: '+224623456789',
        message: 'Bonjour Marie, votre compte ZaLaMa RH a été créé.\nEmail: rh.test@zalama.com\nMot de passe: Test123!\nConnectez-vous sur https://admin.zalama.com'
      }
    },
    {
      name: 'SMS Responsable',
      data: {
        to: '+224623456789',
        message: 'Bonjour Jean, votre compte ZaLaMa responsable a été créé.\nEmail: responsable.test@zalama.com\nMot de passe: Test456!\nConnectez-vous sur https://admin.zalama.com'
      }
    }
  ];

  for (const testCase of testCases) {
    console.log(`📤 Test: ${testCase.name}`);
    
    try {
      const result = await makeRequest(
        `${API_BASE_URL}/api/sms/send`,
        'POST',
        testCase.data
      );
      
      if (result && result.success) {
        console.log('  ✅ SMS envoyé avec succès');
      } else {
        console.log(`  ❌ Échec envoi SMS: ${result ? result.error : 'Pas de réponse'}`);
      }
    } catch (error) {
      console.log(`  💥 Erreur: ${error.message}`);
    }
  }
}

// Fonction principale
async function runTests() {
  console.log('🚀 Démarrage des tests de création de comptes partenaire\n');
  
  await testRHAccountCreation();
  await testResponsableAccountCreation();
  await testSMSSending();
  
  console.log('\n🎉 Tous les tests terminés');
}

// Exécuter les tests
runTests().catch(console.error); 
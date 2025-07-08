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

// Fonction pour simuler la création d'un employé
async function testEmployeeCreationProcess() {
  console.log('🧪 Test du processus complet de création d\'employé\n');

  // Données de test avec un UUID valide pour partner_id
  const testEmployeeData = {
    id: 'test-employee-' + Date.now(),
    partner_id: '550e8400-e29b-41d4-a716-446655440000', // UUID valide
    nom: 'Diallo',
    prenom: 'Ibrahim',
    email: 'ibrahim.test@zalama.com',
    telephone: '+224623456789',
    poste: 'Développeur',
    genre: 'Homme',
    type_contrat: 'CDI',
    salaire_net: 500000,
    date_embauche: '2024-01-01',
    actif: true
  };

  console.log('📋 Données de test:', testEmployeeData);

  try {
    // Étape 1: Créer le compte via l'API route
    console.log('\n🔐 Étape 1: Création du compte via API route');
    
    const accountResult = await makeRequest(
              `${API_BASE_URL}/api/auth/create-employee-accounts`,
      'POST',
      { employeeData: testEmployeeData }
    );

    console.log('📄 Résultat création compte:', JSON.stringify(accountResult, null, 2));

    if (!accountResult || !accountResult.success) {
      console.log('❌ Échec de la création du compte');
      return;
    }

    // Étape 2: Tester l'envoi SMS
    console.log('\n📱 Étape 2: Test de l\'envoi SMS');
    
    const smsMessage = `Bonjour ${testEmployeeData.prenom}, votre compte ZaLaMa a été créé avec succès.\nEmail: ${testEmployeeData.email}\nMot de passe: ${accountResult.account.password}\nConnectez-vous sur https://admin.zalama.com`;
    
    console.log('📨 Message SMS:', smsMessage);
    console.log('📞 Numéro de téléphone:', testEmployeeData.telephone);

    const smsResult = await makeRequest(
      `${API_BASE_URL}/api/sms/send`,
      'POST',
      {
        to: testEmployeeData.telephone,
        message: smsMessage
      }
    );

    console.log('📄 Résultat SMS:', JSON.stringify(smsResult, null, 2));

    if (smsResult && smsResult.success) {
      console.log('\n✅ Test complet réussi !');
      console.log('📊 Résumé:', {
        employe: `${testEmployeeData.prenom} ${testEmployeeData.nom}`,
        email: testEmployeeData.email,
        motDePasse: accountResult.account.password,
        smsEnvoye: smsResult.success
      });
    } else {
      console.log('\n❌ Test échoué !');
      console.log('🚨 Erreur SMS:', smsResult ? smsResult.error : 'Pas de réponse');
    }

  } catch (error) {
    console.error('\n💥 Erreur lors du test:', error);
  }

  console.log('\n🏁 Fin du test');
}

// Fonction pour tester différents formats de numéros de téléphone
async function testPhoneFormats() {
  console.log('\n📱 Test des différents formats de numéros de téléphone\n');

  const phoneFormats = [
    '+224623456789',
    '224623456789',
    '623456789',
    '+224 623 456 789',
    '224 623 456 789'
  ];

  for (const phone of phoneFormats) {
    console.log(`📞 Test du format: ${phone}`);
    
    try {
      const result = await makeRequest(
        `${API_BASE_URL}/api/sms/send`,
        'POST',
        {
          to: phone,
          message: `Test format: ${phone}`
        }
      );
      
      if (result && result.success) {
        console.log('  ✅ Succès');
      } else {
        console.log(`  ❌ Échec: ${result ? result.error : 'Pas de réponse'}`);
      }
    } catch (error) {
      console.log(`  💥 Erreur: ${error.message}`);
    }
  }
}

// Fonction principale
async function runTests() {
  console.log('🚀 Démarrage des tests du processus de création d\'employé\n');
  
  await testEmployeeCreationProcess();
  await testPhoneFormats();
  
  console.log('\n🎉 Tous les tests terminés');
}

// Exécuter les tests
runTests().catch(console.error); 
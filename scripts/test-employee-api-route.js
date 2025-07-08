const fetch = require('node-fetch');

// Configuration
const API_BASE_URL = 'http://localhost:3000';

// Fonction pour tester la création de compte employé
async function testCreateEmployeeAccount() {
  console.log('🧪 Test de l\'API route de création de compte employé\n');

  // Données de test
  const testEmployeeData = {
    id: 'test-employee-' + Date.now(),
    partner_id: 'test-partner-123',
    nom: 'Diallo',
    prenom: 'Ibrahim',
    email: 'ibrahim.test@zalama.com',
    telephone: '+224623456789',
    poste: 'Développeur'
  };

  console.log('📋 Données de test:', testEmployeeData);

  try {
    // Test de création de compte via API route
    const response = await fetch(`${API_BASE_URL}/api/auth/create-employee-accounts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        employeeData: testEmployeeData
      }),
    });

    console.log('📡 Statut de la réponse:', response.status);
    console.log('📡 Headers de la réponse:', Object.fromEntries(response.headers.entries()));

    const result = await response.json();
    console.log('📄 Corps de la réponse:', JSON.stringify(result, null, 2));

    if (response.ok && result.success) {
      console.log('\n✅ Test réussi !');
      console.log('📊 Résultat:', {
        employe: `${result.account.display_name}`,
        email: result.account.email,
        motDePasse: result.account.password,
        role: result.account.role,
        actif: result.account.active
      });
    } else {
      console.log('\n❌ Test échoué !');
      console.log('🚨 Erreur:', result.error || 'Erreur inconnue');
    }

  } catch (error) {
    console.error('\n💥 Erreur lors du test:', error);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Conseil: Assurez-vous que le serveur Next.js est démarré sur le port 3000');
      console.log('   Commande: npm run dev');
    }
  }

  console.log('\n🏁 Fin du test');
}

// Fonction pour tester la validation des données
async function testValidation() {
  console.log('\n🔍 Test de validation des données\n');

  const testCases = [
    {
      name: 'Email manquant',
      data: {
        id: 'test-1',
        partner_id: 'test-partner',
        nom: 'Test',
        prenom: 'User',
        poste: 'Développeur'
      }
    },
    {
      name: 'Email invalide',
      data: {
        id: 'test-2',
        partner_id: 'test-partner',
        nom: 'Test',
        prenom: 'User',
        email: 'email-invalide',
        poste: 'Développeur'
      }
    },
    {
      name: 'Données valides',
      data: {
        id: 'test-3',
        partner_id: 'test-partner',
        nom: 'Test',
        prenom: 'User',
        email: 'test.valid@zalama.com',
        poste: 'Développeur'
      }
    }
  ];

  for (const testCase of testCases) {
    console.log(`📝 Test: ${testCase.name}`);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/create-employee-accounts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          employeeData: testCase.data
        }),
      });

      const result = await response.json();
      
      if (response.ok && result.success) {
        console.log('  ✅ Succès');
      } else {
        console.log(`  ❌ Échec: ${result.error}`);
      }
    } catch (error) {
      console.log(`  💥 Erreur: ${error.message}`);
    }
  }
}

// Fonction principale
async function runTests() {
  console.log('🚀 Démarrage des tests de l\'API route de création de compte employé\n');
  
  await testCreateEmployeeAccount();
  await testValidation();
  
  console.log('\n🎉 Tous les tests terminés');
}

// Exécuter les tests
runTests().catch(console.error); 
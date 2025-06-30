const fetch = require('node-fetch');

// URL de base pour les tests
const BASE_URL = 'http://localhost:3000';

async function testEmployeeCreationFix() {
  console.log('🔧 Test de la correction de la création d\'employé\n');
  
  // Données de test pour un nouvel employé
  const testEmployee = {
    nom: 'Test',
    prenom: 'Employee',
    email: `test.employee.${Date.now()}@test.com`, // Email unique
    telephone: '+224625212115',
    poste: 'Développeur',
    departement: 'IT',
    date_embauche: new Date().toISOString().split('T')[0],
    salaire: 500000,
    statut: 'actif',
    partner_id: 'test-partner-id', // Remplacer par un vrai ID de partenaire
    type_contrat: 'CDI',
    adresse: 'Conakry, Guinée'
  };

  console.log('📋 Données de test employé:', testEmployee);

  // Test 1: Vérifier l'API de création de compte employé
  console.log('\n1. Test de l\'API de création de compte employé...');
  try {
    const accountResponse = await fetch(`${BASE_URL}/api/auth/create-employee-account`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        employeeData: {
          ...testEmployee,
          id: 'test-employee-id'
        }
      }),
    });

    console.log(`📊 Status: ${accountResponse.status} ${accountResponse.statusText}`);

    if (accountResponse.ok) {
      const result = await accountResponse.json();
      console.log('✅ Compte employé créé avec succès:', result);
    } else {
      const errorData = await accountResponse.json();
      console.log('❌ Erreur création compte:', errorData);
    }
  } catch (error) {
    console.error('💥 Erreur réseau:', error.message);
  }

  // Test 2: Test avec un email déjà existant
  console.log('\n2. Test avec un email déjà existant...');
  try {
    const duplicateResponse = await fetch(`${BASE_URL}/api/auth/create-employee-account`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        employeeData: {
          ...testEmployee,
          email: 'test@test.com', // Email qui pourrait exister
          id: 'test-employee-id-2'
        }
      }),
    });

    console.log(`📊 Status: ${duplicateResponse.status} ${duplicateResponse.statusText}`);

    if (duplicateResponse.status === 409) {
      const result = await duplicateResponse.json();
      console.log('✅ Gestion correcte de l\'email en double:', result);
    } else {
      const result = await duplicateResponse.json();
      console.log('⚠️ Réponse inattendue:', result);
    }
  } catch (error) {
    console.error('💥 Erreur réseau:', error.message);
  }

  // Test 3: Test avec des données invalides
  console.log('\n3. Test avec des données invalides...');
  try {
    const invalidResponse = await fetch(`${BASE_URL}/api/auth/create-employee-account`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        employeeData: {
          email: 'email-invalide',
          id: 'test-employee-id-3'
        }
      }),
    });

    console.log(`📊 Status: ${invalidResponse.status} ${invalidResponse.statusText}`);

    if (invalidResponse.status === 400) {
      const result = await invalidResponse.json();
      console.log('✅ Validation correcte des données:', result);
    } else {
      const result = await invalidResponse.json();
      console.log('⚠️ Réponse inattendue:', result);
    }
  } catch (error) {
    console.error('💥 Erreur réseau:', error.message);
  }

  console.log('\n🎉 Tests terminés !');
  console.log('\n📝 Résumé des corrections apportées:');
  console.log('   - Variable accountResult correctement déclarée');
  console.log('   - Vérification des emails en double dans l\'API');
  console.log('   - Amélioration de la gestion d\'erreur');
  console.log('   - Utilisation du service SMS corrigé');
}

// Exécuter les tests
testEmployeeCreationFix(); 
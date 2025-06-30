const fetch = require('node-fetch');

// Configuration
const API_BASE = 'http://localhost:3000/api';
const PARTNER_ID = 'a3c3916b-1a7b-4b41-a1af-2c4a793ab4f8'; // Vrai ID de partenaire

// Données de test
const testEmployee = {
  partner_id: PARTNER_ID,
  nom: 'Dupont',
  prenom: 'Jean',
  genre: 'Homme',
  email: `jean.dupont.${Date.now()}@test.com`,
  telephone: '+224123456789',
  adresse: '123 Rue de la Paix, Conakry',
  poste: 'Développeur',
  role: 'Développeur Full-Stack',
  type_contrat: 'CDI',
  salaire_net: 2500000,
  date_embauche: '2024-01-15',
  actif: true
};

async function testEmployeeCreation() {
  console.log('🧪 Test de création d\'employé');
  console.log('='.repeat(50));
  
  try {
    // Test 1: Création d'employé
    console.log('\n📝 Test 1: Création d\'employé');
    console.log('Données:', JSON.stringify(testEmployee, null, 2));
    
    const createResponse = await fetch(`${API_BASE}/employees`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testEmployee)
    });

    const createResult = await createResponse.json();
    
    console.log('Status:', createResponse.status);
    console.log('Résultat:', JSON.stringify(createResult, null, 2));

    if (createResult.success) {
      console.log('✅ Employé créé avec succès!');
      
      // Test 2: Récupération des employés du partenaire
      console.log('\n📋 Test 2: Récupération des employés du partenaire');
      
      const listResponse = await fetch(`${API_BASE}/employees?partner_id=${PARTNER_ID}`);
      const listResult = await listResponse.json();
      
      console.log('Status:', listResponse.status);
      console.log('Nombre d\'employés:', listResult.count);
      console.log('Employés:', JSON.stringify(listResult.employees, null, 2));

      // Test 3: Recherche d'employé
      console.log('\n🔍 Test 3: Recherche d\'employé');
      
      const searchResponse = await fetch(`${API_BASE}/employees?search=Dupont&partner_id=${PARTNER_ID}`);
      const searchResult = await searchResponse.json();
      
      console.log('Status:', searchResponse.status);
      console.log('Résultats de recherche:', JSON.stringify(searchResult, null, 2));

    } else {
      console.log('❌ Échec de la création:', createResult.error);
    }

  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  }
}

// Test de duplication d'email
async function testDuplicateEmail() {
  console.log('\n🧪 Test de duplication d\'email');
  console.log('='.repeat(50));
  
  try {
    const duplicateEmployee = {
      ...testEmployee,
      email: testEmployee.email // Même email
    };

    console.log('📝 Tentative de création avec email dupliqué');
    
    const response = await fetch(`${API_BASE}/employees`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(duplicateEmployee)
    });

    const result = await response.json();
    
    console.log('Status:', response.status);
    console.log('Résultat:', JSON.stringify(result, null, 2));

    if (!result.success) {
      console.log('✅ Duplication d\'email correctement détectée!');
    } else {
      console.log('❌ Duplication d\'email non détectée!');
    }

  } catch (error) {
    console.error('❌ Erreur lors du test de duplication:', error);
  }
}

// Exécuter les tests
async function runTests() {
  console.log('🚀 Démarrage des tests de création d\'employés');
  console.log('API Base:', API_BASE);
  console.log('Partner ID:', PARTNER_ID);
  
  await testEmployeeCreation();
  await testDuplicateEmail();
  
  console.log('\n🏁 Tests terminés');
}

// Exécuter si le script est appelé directement
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { testEmployeeCreation, testDuplicateEmail }; 
const https = require('https');
const http = require('http');

// Configuration
const API_BASE = 'http://localhost:3000/api';
const PARTNER_ID = 'a3c3916b-1a7b-4b41-a1af-2c4a793ab4f8';

// Fonction utilitaire pour faire des requêtes HTTP
function makeRequest(url, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const req = client.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(body);
          resolve({
            status: res.statusCode,
            data: jsonData
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            data: body
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

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
    
    const createResult = await makeRequest(`${API_BASE}/employees`, 'POST', testEmployee);
    
    console.log('Status:', createResult.status);
    console.log('Résultat:', JSON.stringify(createResult.data, null, 2));

    if (createResult.data.success) {
      console.log('✅ Employé créé avec succès!');
      
      // Test 2: Récupération des employés du partenaire
      console.log('\n📋 Test 2: Récupération des employés du partenaire');
      
      const listResult = await makeRequest(`${API_BASE}/employees?partner_id=${PARTNER_ID}`);
      
      console.log('Status:', listResult.status);
      console.log('Nombre d\'employés:', listResult.data.count);
      console.log('Employés:', JSON.stringify(listResult.data.employees, null, 2));

    } else {
      console.log('❌ Échec de la création:', createResult.data.error);
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
    
    const result = await makeRequest(`${API_BASE}/employees`, 'POST', duplicateEmployee);
    
    console.log('Status:', result.status);
    console.log('Résultat:', JSON.stringify(result.data, null, 2));

    if (!result.data.success) {
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
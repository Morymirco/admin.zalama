const https = require('https');
const http = require('http');
const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = 'https://mspmrzlqhwpdkkburjiw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zcG1yemxxaHdwZGtrYnVyaml3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3ODcyNTgsImV4cCI6MjA2NjM2MzI1OH0.zr-TRpKjGJjW0nRtsyPcCLy4Us-c5tOGX71k5_3JJd0';

const supabase = createClient(supabaseUrl, supabaseKey);

// URL de base pour les tests
const BASE_URL = 'http://localhost:3000';

// Fonction simple pour faire des requêtes HTTP
function makeRequest(url, method, data) {
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
          const result = JSON.parse(body);
          resolve({ status: res.statusCode, data: result });
        } catch (error) {
          resolve({ status: res.statusCode, data: body });
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

async function getRealPartnerId() {
  try {
    const { data: partners, error } = await supabase
      .from('partners')
      .select('id, nom')
      .limit(1);

    if (error) {
      console.error('Erreur lors de la récupération des partenaires:', error);
      return null;
    }

    if (partners && partners.length > 0) {
      console.log(`✅ Partenaire trouvé: ${partners[0].nom} (${partners[0].id})`);
      return partners[0].id;
    } else {
      console.log('⚠️ Aucun partenaire trouvé dans la base de données');
      return null;
    }
  } catch (error) {
    console.error('Erreur lors de la récupération du partenaire:', error);
    return null;
  }
}

async function testEmployeeCreationSimple() {
  console.log('🔧 Test simple de la création d\'employé\n');
  
  // Récupérer un vrai ID de partenaire
  console.log('🔍 Récupération d\'un partenaire existant...');
  const realPartnerId = await getRealPartnerId();
  
  if (!realPartnerId) {
    console.log('❌ Impossible de continuer sans partenaire valide');
    return;
  }
  
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
    partner_id: realPartnerId, // Utiliser le vrai ID
    type_contrat: 'CDI',
    adresse: 'Conakry, Guinée'
  };

  console.log('📋 Données de test employé:', testEmployee);

  // Test 1: Vérifier l'API de création de compte employé
  console.log('\n1. Test de l\'API de création de compte employé...');
  try {
    const result = await makeRequest(
      `${BASE_URL}/api/auth/create-employee-accounts`,
      'POST',
      {
        employeeData: {
          ...testEmployee,
          id: 'test-employee-id'
        }
      }
    );

    console.log(`📊 Status: ${result.status}`);

    if (result.status === 200 || result.status === 201) {
      console.log('✅ Compte employé créé avec succès:', result.data);
    } else if (result.status === 409) {
      console.log('✅ Gestion correcte de l\'email en double:', result.data);
    } else {
      console.log('❌ Erreur création compte:', result.data);
    }
  } catch (error) {
    console.error('💥 Erreur réseau:', error.message);
  }

  // Test 2: Test avec un email déjà existant
  console.log('\n2. Test avec un email déjà existant...');
  try {
    const result = await makeRequest(
      `${BASE_URL}/api/auth/create-employee-accounts`,
      'POST',
      {
        employeeData: {
          ...testEmployee,
          email: 'test@test.com', // Email qui pourrait exister
          id: 'test-employee-id-2'
        }
      }
    );

    console.log(`📊 Status: ${result.status}`);

    if (result.status === 409) {
      console.log('✅ Gestion correcte de l\'email en double:', result.data);
    } else {
      console.log('⚠️ Réponse inattendue:', result.data);
    }
  } catch (error) {
    console.error('💥 Erreur réseau:', error.message);
  }

  // Test 3: Test avec des données invalides
  console.log('\n3. Test avec des données invalides...');
  try {
    const result = await makeRequest(
      `${BASE_URL}/api/auth/create-employee-accounts`,
      'POST',
      {
        employeeData: {
          email: 'email-invalide',
          id: 'test-employee-id-3'
        }
      }
    );

    console.log(`📊 Status: ${result.status}`);

    if (result.status === 400) {
      console.log('✅ Validation correcte des données:', result.data);
    } else {
      console.log('⚠️ Réponse inattendue:', result.data);
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
testEmployeeCreationSimple(); 
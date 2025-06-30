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

async function testPartnerCreationComplete() {
  console.log('🚀 Test complet de création de partenaire de A à Z\n');
  
  const timestamp = Date.now();
  
  // Données de test pour un nouveau partenaire
  const testPartner = {
    nom: `Entreprise Test ${timestamp}`,
    description: 'Test complet de création de partenaire',
    type: 'PME',
    secteur: 'Technologie',
    adresse: 'Conakry, Guinée',
    telephone: '+224625212115',
    email: 'contact@test.com',
    nom_representant: `John Doe ${timestamp}`,
    telephone_representant: '+224625212115',
    email_representant: `john.doe.${timestamp}@test.com`,
    nom_rh: `Jane Smith ${timestamp}`,
    telephone_rh: '+224625212115',
    email_rh: `jane.smith.${timestamp}@test.com`,
    actif: true
  };

  console.log('📋 Données du partenaire:', testPartner);

  // Test 1: Créer le partenaire via l'API
  console.log('\n1. Test de création du partenaire...');
  try {
    const result = await makeRequest(
      `${BASE_URL}/api/partners`,
      'POST',
      testPartner
    );

    console.log(`📊 Status: ${result.status}`);

    if (result.status === 200 || result.status === 201) {
      console.log('✅ Partenaire créé avec succès:', result.data);
      
      const partnerId = result.data.partenaire?.id;
      if (partnerId) {
        console.log(`🆔 ID du partenaire créé: ${partnerId}`);
        
        // Test 2: Vérifier que le partenaire existe dans la base
        console.log('\n2. Vérification dans la base de données...');
        try {
          const { data: partner, error } = await supabase
            .from('partners')
            .select('*')
            .eq('id', partnerId)
            .single();

          if (error) {
            console.log('❌ Erreur lors de la vérification:', error);
          } else {
            console.log('✅ Partenaire trouvé dans la base:', partner);
          }
        } catch (dbError) {
          console.log('❌ Erreur base de données:', dbError);
        }

        // Test 3: Vérifier les comptes créés
        console.log('\n3. Vérification des comptes créés...');
        try {
          const { data: accounts, error } = await supabase
            .from('admin_users')
            .select('*')
            .eq('partenaire_id', partnerId);

          if (error) {
            console.log('❌ Erreur lors de la vérification des comptes:', error);
          } else {
            console.log(`✅ ${accounts?.length || 0} comptes trouvés:`, accounts);
          }
        } catch (accountsError) {
          console.log('❌ Erreur vérification comptes:', accountsError);
        }

        // Test 4: Vérifier les résultats SMS et email
        console.log('\n4. Résultats SMS et Email:');
        if (result.data.smsResults) {
          console.log('📱 SMS Results:', result.data.smsResults);
        }
        if (result.data.emailResults) {
          console.log('📧 Email Results:', result.data.emailResults);
        }
        if (result.data.accountResults) {
          console.log('🔐 Account Results:', result.data.accountResults);
        }

      } else {
        console.log('⚠️ Pas d\'ID de partenaire retourné');
      }
    } else {
      console.log('❌ Erreur création partenaire:', result.data);
    }
  } catch (error) {
    console.error('💥 Erreur réseau:', error.message);
  }

  // Test 5: Test avec des données invalides
  console.log('\n5. Test avec des données invalides...');
  try {
    const invalidPartner = {
      nom: '', // Nom vide
      email: 'email-invalide', // Email invalide
      // Données manquantes
    };

    const result = await makeRequest(
      `${BASE_URL}/api/partners`,
      'POST',
      invalidPartner
    );

    console.log(`📊 Status: ${result.status}`);

    if (result.status === 400) {
      console.log('✅ Validation correcte des données invalides:', result.data);
    } else {
      console.log('⚠️ Réponse inattendue:', result.data);
    }
  } catch (error) {
    console.error('💥 Erreur réseau:', error.message);
  }

  // Test 6: Test avec des emails en double
  console.log('\n6. Test avec des emails en double...');
  try {
    const duplicatePartner = {
      ...testPartner,
      nom: `Entreprise Duplicate ${timestamp}`,
      email_representant: 'test@test.com', // Email qui pourrait exister
      email_rh: 'test@test.com' // Email qui pourrait exister
    };

    const result = await makeRequest(
      `${BASE_URL}/api/partners`,
      'POST',
      duplicatePartner
    );

    console.log(`📊 Status: ${result.status}`);

    if (result.status === 409) {
      console.log('✅ Gestion correcte des emails en double:', result.data);
    } else {
      console.log('⚠️ Réponse inattendue:', result.data);
    }
  } catch (error) {
    console.error('💥 Erreur réseau:', error.message);
  }

  console.log('\n🎉 Tests terminés !');
  console.log('\n📝 Résumé des corrections apportées:');
  console.log('   - Service SMS corrigé dans partnerAccountService');
  console.log('   - Vérification des emails en double dans toutes les APIs');
  console.log('   - Gestion d\'erreur améliorée');
  console.log('   - Validation des données renforcée');
  console.log('   - Tests complets de A à Z');
}

// Exécuter les tests
testPartnerCreationComplete(); 
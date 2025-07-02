require('dotenv').config({ path: '.env' });
const { exec } = require('child_process');
const { promisify } = require('util');
const { createClient } = require('@supabase/supabase-js');

const execAsync = promisify(exec);

// Configuration
const API_BASE_URL = 'http://localhost:3000';

// Configuration Supabase
const supabaseUrl = 'https://mspmrzlqhwpdkkburjiw.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY non définie');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

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

async function testPartnerAccountCreation() {
  console.log('🧪 Test de création de comptes partenaires avec SMS/Email...\n');

  // Données de test pour un partenaire
  const testPartnerData = {
    nom: 'Entreprise Test SMS/Email',
    type: 'PME',
    secteur: 'Technologie',
    adresse: '123 Rue Test, Conakry',
    telephone: '+224625212115',
    email: 'test@entreprise.com',
    actif: true,
    
    // Données RH
    nom_rh: 'Mariama Diallo',
    email_rh: 'rh@entreprise.com',
    telephone_rh: '+224625212115',
    
    // Données responsable
    nom_representant: 'Ibrahima Diallo',
    email_representant: 'responsable@entreprise.com',
    telephone_representant: '+224625212115'
  };

  try {
    console.log('📝 Création du partenaire de test...');
    
    // Créer le partenaire
    const { data: partner, error: partnerError } = await supabase
      .from('partners')
      .insert([testPartnerData])
      .select()
      .single();

    if (partnerError) {
      console.error('❌ Erreur création partenaire:', partnerError);
      return;
    }

    console.log('✅ Partenaire créé:', partner.id);

    // Appeler l'API de création des comptes
    console.log('\n🔐 Création des comptes RH et responsable...');
    
    const response = await fetch('http://localhost:3000/api/auth/create-partner-accounts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        partenaireData: { ...testPartnerData, id: partner.id } 
      }),
    });

    if (!response.ok) {
      console.error('❌ Erreur API:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('Détails:', errorText);
      return;
    }

    const result = await response.json();
    
    console.log('\n📊 Résultats de création des comptes:');
    console.log('✅ Succès:', result.success);
    
    if (result.results) {
      console.log('\n👤 Compte RH:');
      console.log('  - Création:', result.results.rh.account.success ? '✅' : '❌');
      console.log('  - SMS:', result.results.rh.sms.success ? '✅' : '❌');
      console.log('  - Email:', result.results.rh.email.success ? '✅' : '❌');
      
      if (result.results.rh.account.success) {
        console.log('  - Mot de passe:', result.results.rh.account.account?.password);
      }
      
      console.log('\n👤 Compte Responsable:');
      console.log('  - Création:', result.results.responsable.account.success ? '✅' : '❌');
      console.log('  - SMS:', result.results.responsable.sms.success ? '✅' : '❌');
      console.log('  - Email:', result.results.responsable.email.success ? '✅' : '❌');
      
      if (result.results.responsable.account.success) {
        console.log('  - Mot de passe:', result.results.responsable.account.account?.password);
      }
    }

    // Nettoyer - supprimer le partenaire de test
    console.log('\n🧹 Nettoyage - Suppression du partenaire de test...');
    await supabase
      .from('partners')
      .delete()
      .eq('id', partner.id);
    
    console.log('✅ Test terminé avec succès !');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  }
}

// Fonction principale
async function runTests() {
  console.log('🚀 Démarrage des tests de création de comptes partenaire\n');
  
  await testRHAccountCreation();
  await testResponsableAccountCreation();
  await testSMSSending();
  await testPartnerAccountCreation();
  
  console.log('\n🎉 Tous les tests terminés');
}

// Exécuter les tests
runTests().catch(console.error); 
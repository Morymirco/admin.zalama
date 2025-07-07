const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = 'https://mspmrzlqhwpdkkburjiw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zcG1yemxxaHdwZGtrYnVyaml3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3ODcyNTgsImV4cCI6MjA2NjM2MzI1OH0.zr-TRpKjGJjW0nRtsyPcCLy4Us-c5tOGX71k5_3JJd0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testEmployeeCreation() {
  try {
    console.log('🧪 Test de création d\'employé avec SMS et email...\n');

    // Récupérer un partenaire existant pour le test
    const { data: partners, error: partnersError } = await supabase
      .from('partners')
      .select('id, nom')
      .limit(1);

    if (partnersError || !partners.length) {
      console.error('❌ Impossible de récupérer un partenaire pour le test');
      return;
    }

    const testPartner = partners[0];
    console.log(`📋 Utilisation du partenaire: ${testPartner.nom} (${testPartner.id})`);

    // Données de test pour l'employé
    const testEmployeeData = {
      partner_id: testPartner.id,
      nom: 'Test',
      prenom: 'Employé',
      email: `test.employe.${Date.now()}@example.com`,
      telephone: '+224625212115', // Numéro de test
      adresse: 'Adresse de test',
      poste: 'Développeur',
      role: 'user',
      type_contrat: 'CDI',
      salaire_net: 500000,
      date_embauche: new Date().toISOString().split('T')[0],
      actif: true,
      genre: 'Homme'
    };

    console.log('👤 Données de test:', {
      nom: `${testEmployeeData.prenom} ${testEmployeeData.nom}`,
      email: testEmployeeData.email,
      telephone: testEmployeeData.telephone,
      partenaire: testPartner.nom
    });

    // Appeler l'API de création d'employé
    console.log('\n🔄 Appel de l\'API de création d\'employé...');
    
    const baseUrl = 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/auth/create-employee-accounts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ employeeData: testEmployeeData }),
    });

    if (!response.ok) {
      console.error('❌ Erreur API:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('Détails:', errorText);
      return;
    }

    const result = await response.json();
    
    console.log('\n📊 Résultats de la création:');
    console.log('  - Succès:', result.success);
    
    if (result.success && result.results) {
      const { account, smsResults, emailResults } = result.results;
      
      console.log('\n🔐 Compte:');
      console.log('  - Créé:', account.success ? '✅' : '❌');
      if (account.success && account.account) {
        console.log('  - Email:', account.account.email);
        console.log('  - Mot de passe:', account.account.password);
      } else {
        console.log('  - Erreur:', account.error);
      }
      
      console.log('\n📱 SMS:');
      console.log('  - Employé:', smsResults.employe.success ? '✅ Envoyé' : `❌ ${smsResults.employe.error}`);
      
      console.log('\n📧 Email:');
      console.log('  - Employé:', emailResults.employe.success ? '✅ Envoyé' : `❌ ${emailResults.employe.error}`);
      
    } else {
      console.log('  - Erreur:', result.error);
    }

    console.log('\n✅ Test terminé');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  }
}

// Exécuter le test
testEmployeeCreation(); 
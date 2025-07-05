const fetch = require('node-fetch');
const { v4: uuidv4 } = require('uuid');

// Configuration
const API_BASE_URL = 'http://localhost:3000';
const PARTNER_ID = 'a3c3916b-1a7b-4b41-a1af-2c4a793ab4f8'; // ID de partenaire existant

// Services pour les tests
const smsService = {
  async sendSMS(to, message) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/sms/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, message })
      });
      return await response.json();
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};

const emailService = {
  async sendEmail(to, subject, html) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/email/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, subject, html })
      });
      return await response.json();
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};

async function testEmployeeCreationWithSMS() {
  console.log('🧪 Test de création d\'employé avec envoi SMS/Email automatique');
  console.log('=' .repeat(60));

  try {
    // Données de test pour un nouvel employé
    const testEmployeeData = {
      partner_id: PARTNER_ID,
      nom: 'Diallo',
      prenom: 'Fatou',
      genre: 'Femme',
      email: `fatou.diallo.${Date.now()}@test.com`,
      telephone: '+224625212115',
      adresse: '123 Rue Test, Conakry',
      poste: 'Développeuse',
      role: 'Développeuse Full-Stack',
      type_contrat: 'CDI',
      salaire_net: 3500000,
      date_embauche: '2024-01-15',
      actif: true
    };

    console.log('📝 Données de l\'employé de test:');
    console.log('  - Nom:', `${testEmployeeData.prenom} ${testEmployeeData.nom}`);
    console.log('  - Email:', testEmployeeData.email);
    console.log('  - Téléphone:', testEmployeeData.telephone);
    console.log('  - Poste:', testEmployeeData.poste);

    // Créer l'employé via l'API
    console.log('\n🔄 Création de l\'employé...');
    
    const createResponse = await fetch(`${API_BASE_URL}/api/employees`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testEmployeeData)
    });

    if (!createResponse.ok) {
      const errorData = await createResponse.json();
      console.error('❌ Erreur création employé:', errorData);
      return;
    }

    const createResult = await createResponse.json();
    
    console.log('✅ Employé créé avec succès:', createResult.employe.id);
    console.log('📊 Résultats de création:');
    console.log('  - Compte employé:', createResult.accountResults.employe.success ? '✅' : '❌');
    console.log('  - SMS employé:', createResult.smsResults.employe.success ? '✅' : '❌');
    console.log('  - Email employé:', createResult.emailResults.employe.success ? '✅' : '❌');
    console.log('  - SMS admin:', createResult.smsResults.admin.success ? '✅' : '❌');

    // Afficher les détails des résultats
    if (createResult.accountResults.employe.success) {
      console.log('\n🔐 Détails du compte créé:');
      console.log('  - Mot de passe:', createResult.accountResults.employe.password);
    }

    if (!createResult.smsResults.employe.success) {
      console.log('\n❌ Erreur SMS employé:', createResult.smsResults.employe.error);
    }

    if (!createResult.emailResults.employe.success) {
      console.log('\n❌ Erreur email employé:', createResult.emailResults.employe.error);
    }

    // Test manuel d'envoi SMS si l'envoi automatique a échoué
    if (!createResult.smsResults.employe.success && createResult.accountResults.employe.success) {
      console.log('\n🔄 Test manuel d\'envoi SMS...');
      
      const smsMessage = `Bonjour ${testEmployeeData.prenom} ${testEmployeeData.nom}, votre compte ZaLaMa a été créé avec succès.\nEmail: ${testEmployeeData.email}\nMot de passe: ${createResult.accountResults.employe.password}\nConnectez-vous sur https://admin.zalama.com`;
      
      const smsResult = await smsService.sendSMS([testEmployeeData.telephone], smsMessage);
      console.log('📱 Résultat SMS manuel:', smsResult.success ? '✅' : '❌');
      if (!smsResult.success) {
        console.log('  Erreur:', smsResult.error);
      }
    }

    // Test manuel d'envoi email si l'envoi automatique a échoué
    if (!createResult.emailResults.employe.success && createResult.accountResults.employe.success) {
      console.log('\n🔄 Test manuel d\'envoi email...');
      
      const emailSubject = `Compte employé créé - ${testEmployeeData.prenom} ${testEmployeeData.nom}`;
      const emailBody = `
        <h2>Votre compte employé a été créé</h2>
        <p><strong>Employé:</strong> ${testEmployeeData.prenom} ${testEmployeeData.nom}</p>
        <p><strong>Email:</strong> ${testEmployeeData.email}</p>
        <p><strong>Mot de passe:</strong> ${createResult.accountResults.employe.password}</p>
        <p>Vous pouvez maintenant vous connecter à l'interface d'administration.</p>
      `;
      
      const emailResult = await emailService.sendEmail(testEmployeeData.email, emailSubject, emailBody);
      console.log('📧 Résultat email manuel:', emailResult.success ? '✅' : '❌');
      if (!emailResult.success) {
        console.log('  Erreur:', emailResult.error);
      }
    }

    console.log('\n✅ Test terminé !');
    console.log('\n📋 Résumé:');
    console.log('  - Employé créé:', '✅');
    console.log('  - Compte créé:', createResult.accountResults.employe.success ? '✅' : '❌');
    console.log('  - SMS envoyés:', createResult.smsResults.employe.success || createResult.smsResults.admin.success ? '✅' : '❌');
    console.log('  - Emails envoyés:', createResult.emailResults.employe.success ? '✅' : '❌');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  }
}

async function testValidation() {
  console.log('\n🔍 Test de validation des données\n');

  const testCases = [
    {
      name: 'Données valides complètes',
      data: {
        partner_id: PARTNER_ID,
        nom: 'Traoré',
        prenom: 'Moussa',
        genre: 'Homme',
        email: 'moussa.traore@test.com',
        telephone: '+224625212115',
        poste: 'Manager',
        type_contrat: 'CDI',
        salaire_net: 5000000
      }
    },
    {
      name: 'Données minimales (sans email/téléphone)',
      data: {
        partner_id: PARTNER_ID,
        nom: 'Camara',
        prenom: 'Aissatou',
        poste: 'Assistante'
      }
    },
    {
      name: 'Données invalides',
      data: {
        partner_id: PARTNER_ID,
        nom: '', // Nom vide
        prenom: 'Test',
        email: 'email-invalide', // Email invalide
        telephone: '123', // Téléphone invalide
        poste: 'Testeur'
      }
    }
  ];

  for (const testCase of testCases) {
    console.log(`📝 Test: ${testCase.name}`);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/employees`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testCase.data)
      });

      const result = await response.json();
      
      if (response.ok && result.success) {
        console.log('  ✅ Succès');
        console.log('    - Employé créé:', result.employe.id);
        console.log('    - Compte créé:', result.accountResults.employe.success ? 'Oui' : 'Non');
      } else {
        console.log(`  ❌ Échec: ${result.error}`);
        if (result.details) {
          console.log('    - Erreurs:', result.details);
        }
        if (result.warnings) {
          console.log('    - Avertissements:', result.warnings);
        }
      }
    } catch (error) {
      console.log(`  💥 Erreur: ${error.message}`);
    }
  }
}

// Fonction principale
async function main() {
  console.log('🚀 Test d\'intégration SMS/Email pour la création d\'employés\n');
  
  // Vérifier que le serveur est démarré
  try {
    const healthResponse = await fetch(`${API_BASE_URL}/api/health`);
    if (!healthResponse.ok) {
      console.log('❌ Serveur non accessible. Assurez-vous que le serveur Next.js est démarré sur le port 3000');
      console.log('   Commande: npm run dev');
      return;
    }
    console.log('✅ Serveur accessible\n');
  } catch (error) {
    console.log('❌ Impossible de se connecter au serveur');
    console.log('   Assurez-vous que le serveur Next.js est démarré sur le port 3000');
    console.log('   Commande: npm run dev');
    return;
  }

  // Exécuter les tests
  await testEmployeeCreationWithSMS();
  await testValidation();
  
  console.log('\n🏁 Tous les tests terminés');
}

// Exécuter le script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  testEmployeeCreationWithSMS,
  testValidation
}; 
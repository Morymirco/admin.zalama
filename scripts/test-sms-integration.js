const { Client } = require('nimbasms');

// Configuration de test
const config = {
  SERVICE_ID: '9d83d5b67444c654c702f109dd837167',
  SECRET_TOKEN: 'qf_bpb4CVfEalTU5eVEFC05wpoqlo17M-mozkZVbIHT_3xfOIjB7Oac-lkXZ6Pg2VqO2LXVy6BUlYTZe73y411agSC0jVh3OcOU92s8Rplc',
};

const client = new Client(config);

// Fonction pour formater le numéro de téléphone selon Nimba SMS
function formatPhoneNumber(phone) {
  // Supprimer tous les caractères non numériques sauf le +
  let cleaned = phone.replace(/[^\d+]/g, '');
  
  // Si le numéro commence par +, le supprimer
  if (cleaned.startsWith('+')) {
    cleaned = cleaned.substring(1);
  }
  
  // S'assurer que le numéro commence par 224 pour la Guinée
  if (!cleaned.startsWith('224')) {
    cleaned = '224' + cleaned;
  }
  
  // Limiter à 12 chiffres (224 + 9 chiffres)
  if (cleaned.length > 12) {
    cleaned = cleaned.substring(0, 12);
  }
  
  return cleaned;
}

async function testSMSService() {
  console.log('🧪 Test d\'intégration SMS - Nimba SMS');
  console.log('=====================================\n');

  try {
    // 1. Vérifier le solde du compte
    console.log('1. Vérification du solde...');
    const account = await client.accounts.get();
    console.log(`✅ Solde du compte: ${account.balance} crédits\n`);

    // 2. Lister les sendernames
    console.log('2. Récupération des sendernames...');
    const sendernames = await client.sendernames.list();
    console.log(`✅ Nombre de sendernames: ${sendernames.count || sendernames.results?.length || 0}`);
    if (sendernames.results && sendernames.results.length > 0) {
      console.log('📝 Sendernames disponibles:');
      sendernames.results.forEach(sender => {
        console.log(`   - ${sender.name} (${sender.status})`);
      });
    }
    console.log('');

    // 3. Lister les derniers messages
    console.log('3. Récupération des derniers messages...');
    const messages = await client.messages.list({ limit: 5 });
    console.log(`✅ Nombre total de messages: ${messages.count || messages.results?.length || 0}`);
    if (messages.results && messages.results.length > 0) {
      console.log(`📱 Derniers ${messages.results.length} messages:`);
      messages.results.forEach((msg, index) => {
        console.log(`   ${index + 1}. ${msg.to} - ${msg.message.substring(0, 50)}... (${msg.status})`);
      });
    } else {
      console.log('📱 Aucun message trouvé');
    }
    console.log('');

    // 4. Test de création de contact
    console.log('4. Test de création de contact...');
    const testContact = {
      numero: formatPhoneNumber('224625212115'), // Numéro de test formaté
      name: 'Test Contact ZaLaMa',
      groups: ['Test', 'ZaLaMa'],
    };
    
    try {
      const contact = await client.contacts.create(testContact);
      console.log(`✅ Contact créé: ${contact.name} (${contact.numero})`);
    } catch (contactError) {
      console.log(`⚠️  Erreur création contact: ${contactError.message || contactError}`);
    }
    console.log('');

    // 5. Lister les contacts
    console.log('5. Récupération des contacts...');
    const contacts = await client.contacts.list();
    console.log(`✅ Nombre total de contacts: ${contacts.count || contacts.results?.length || 0}`);
    if (contacts.results && contacts.results.length > 0) {
      console.log(`📋 Derniers ${Math.min(5, contacts.results.length)} contacts:`);
      contacts.results.slice(0, 5).forEach((contact, index) => {
        console.log(`   ${index + 1}. ${contact.name || 'Sans nom'} (${contact.numero})`);
      });
    } else {
      console.log('📋 Aucun contact trouvé');
    }
    console.log('');

    console.log('🎉 Tests terminés avec succès !');
    console.log('\n📋 Résumé:');
    console.log(`   - Solde: ${account.balance} crédits`);
    console.log(`   - Sendernames: ${sendernames.count || sendernames.results?.length || 0}`);
    console.log(`   - Messages: ${messages.count || messages.results?.length || 0}`);
    console.log(`   - Contacts: ${contacts.count || contacts.results?.length || 0}`);

  } catch (error) {
    console.error('❌ Erreur lors des tests:', error.message);
    console.error('Détails:', error);
    
    if (error.message.includes('401')) {
      console.log('\n💡 Vérifiez vos identifiants NIMBA_SMS_SERVICE_ID et NIMBA_SMS_SECRET_TOKEN');
    } else if (error.message.includes('403')) {
      console.log('\n💡 Vérifiez les permissions de votre compte Nimba SMS');
    }
  }
}

// Fonction pour vérifier le statut d'un message
async function checkMessageStatus(messageId) {
  console.log(`📋 Vérification du statut du message ${messageId}...`);
  
  try {
    const message = await client.messages.get(messageId);
    console.log('📊 Statut du message:', message);
    return message;
  } catch (error) {
    console.error('❌ Erreur lors de la vérification du statut:', error.message);
    throw error;
  }
}

// Fonction pour tester l'envoi de SMS (à utiliser avec précaution)
async function testSendSMS(phoneNumber, message) {
  console.log(`📤 Test d'envoi de SMS vers ${phoneNumber}...`);
  
  try {
    // Formater le numéro selon Nimba SMS
    const formattedPhone = formatPhoneNumber(phoneNumber);
    
    // Format exact attendu par Nimba SMS
    const body = {
      to: [formattedPhone], // Array de numéros
      message: message || 'Test SMS de ZaLaMa - ' + new Date().toLocaleString('fr-FR'),
      sender_name: 'ZaLaMa', // Utiliser le sendername configuré
    };

    console.log('Format SMS Nimba:', body);
    const result = await client.messages.create(body);
    console.log('✅ SMS envoyé avec succès !');
    console.log('📋 Détails:', result);
    
    // Vérifier le statut après 2 secondes
    if (result.messageid) {
      console.log('⏳ Vérification du statut dans 2 secondes...');
      setTimeout(async () => {
        try {
          await checkMessageStatus(result.messageid);
        } catch (error) {
          console.log('⚠️ Impossible de vérifier le statut:', error.message);
        }
      }, 2000);
    }
    
    return result;
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi du SMS:', error.message);
    throw error;
  }
}

// Fonction pour tester les SMS de bienvenue
async function testWelcomeSMS() {
  console.log('🎉 Test des SMS de bienvenue...');
  
  const testData = {
    nomPartenaire: 'Test Partenaire ZaLaMa',
    nomRepresentant: 'John Doe',
    telephoneRepresentant: '224625212115',
    emailRepresentant: 'john@test.com',
    nomRH: 'Jane Smith',
    telephoneRH: '224625212115',
    emailRH: 'jane@test.com',
  };

  try {
    // SMS au représentant
    console.log('📱 Envoi SMS au représentant...');
    const messageRep = `Bonjour ${testData.nomRepresentant},

Bienvenue dans la famille ZaLaMa ! 

Votre partenaire "${testData.nomPartenaire}" a été créé avec succès dans notre système.

Vos informations de connexion :
- Email: ${testData.emailRepresentant}
- Téléphone: ${testData.telephoneRepresentant}

Vous recevrez bientôt vos identifiants de connexion par email.

Pour toute question, contactez-nous au +224 XXX XXX XXX.

Cordialement,
L'équipe ZaLaMa`;

    await testSendSMS(testData.telephoneRepresentant, messageRep);

    // SMS au RH
    console.log('📱 Envoi SMS au responsable RH...');
    const messageRH = `Bonjour ${testData.nomRH},

Bienvenue dans la famille ZaLaMa !

En tant que responsable RH de "${testData.nomPartenaire}", vous avez accès à toutes les fonctionnalités de gestion des employés.

Vos informations de connexion :
- Email: ${testData.emailRH}
- Téléphone: ${testData.telephoneRH}

Vous recevrez bientôt vos identifiants de connexion par email.

Pour toute question RH, contactez-nous au +224 XXX XXX XXX.

Cordialement,
L'équipe ZaLaMa`;

    await testSendSMS(testData.telephoneRH, messageRH);

    console.log('✅ Tous les SMS de bienvenue envoyés avec succès !');

  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi des SMS de bienvenue:', error.message);
  }
}

// Exécution des tests
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--send')) {
    const sendIndex = args.indexOf('--send');
    const phone = args[sendIndex + 1];
    const message = args[sendIndex + 2];
    
    if (phone) {
      testSendSMS(phone, message || 'Test SMS ZaLaMa');
    } else {
      console.log('❌ Veuillez spécifier un numéro de téléphone: --send <numero> [message]');
    }
  } else if (args.includes('--welcome')) {
    testWelcomeSMS();
  } else {
    testSMSService();
  }
}

module.exports = {
  testSMSService,
  testSendSMS,
  testWelcomeSMS,
  formatPhoneNumber,
}; 
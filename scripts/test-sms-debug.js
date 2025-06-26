const { Client } = require('nimbasms');

// Configuration Nimba SMS
const config = {
  SERVICE_ID: '9d83d5b67444c654c702f109dd837167',
  SECRET_TOKEN: 'qf_bpb4CVfEalTU5eVEFC05wpoqlo17M-mozkZVbIHT_3xfOIjB7Oac-lkXZ6Pg2VqO2LXVy6BUlYTZe73y411agSC0jVh3OcOU92s8Rplc',
};

console.log('Configuration SMS:', config);

const client = new Client(config);

async function testSMSConnection() {
  try {
    console.log('Test de connexion au service SMS...');
    
    // Test 1: Vérifier le solde
    console.log('\n1. Test de vérification du solde...');
    const account = await client.accounts.get();
    console.log('✅ Solde du compte:', account.balance);
    
    // Test 2: Envoyer un SMS de test
    console.log('\n2. Test d\'envoi de SMS...');
    const testMessage = {
      to: ['224625212115'], // Votre numéro
      message: 'Test SMS ZaLaMa - ' + new Date().toISOString(),
      sender_name: 'ZaLaMa'
    };
    
    console.log('Message à envoyer:', testMessage);
    const response = await client.messages.create(testMessage);
    console.log('✅ SMS envoyé avec succès:', response);
    
    // Test 3: Lister les messages
    console.log('\n3. Test de liste des messages...');
    const messages = await client.messages.list({ limit: 5 });
    console.log('✅ Messages récupérés:', messages.count);
    
  } catch (error) {
    console.error('❌ Erreur lors du test SMS:');
    console.error('Type d\'erreur:', typeof error);
    console.error('Message d\'erreur:', error.message);
    console.error('Stack trace:', error.stack);
    console.error('Erreur complète:', error);
    
    // Vérifier si c'est une erreur réseau
    if (error.code) {
      console.error('Code d\'erreur:', error.code);
    }
    if (error.status) {
      console.error('Status:', error.status);
    }
  }
}

async function testPhoneFormatting() {
  console.log('\n=== Test de formatage des numéros ===');
  
  const testNumbers = [
    '+224625212115',
    '224625212115',
    '625212115',
    '+224 625 212 115',
    '224-625-212-115'
  ];
  
  testNumbers.forEach(phone => {
    let cleaned = phone.replace(/[^\d+]/g, '');
    if (cleaned.startsWith('+')) {
      cleaned = cleaned.substring(1);
    }
    if (!cleaned.startsWith('224')) {
      cleaned = '224' + cleaned;
    }
    if (cleaned.length > 12) {
      cleaned = cleaned.substring(0, 12);
    }
    
    console.log(`${phone} -> ${cleaned}`);
  });
}

async function main() {
  console.log('=== Test de diagnostic SMS ZaLaMa ===\n');
  
  await testPhoneFormatting();
  await testSMSConnection();
  
  console.log('\n=== Test terminé ===');
}

main().catch(console.error); 
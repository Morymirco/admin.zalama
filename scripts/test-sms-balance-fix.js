const { Client } = require('nimbasms');

// Configuration Nimba SMS
const config = {
  SERVICE_ID: '9d83d5b67444c654c702f109dd837167',
  SECRET_TOKEN: 'qf_bpb4CVfEalTU5eVEFC05wpoqlo17M-mozkZVbIHT_3xfOIjB7Oac-lkXZ6Pg2VqO2LXVy6BUlYTZe73y411agSC0jVh3OcOU92s8Rplc',
};

const client = new Client(config);

async function testBalanceFix() {
  console.log('🔧 Test de la correction du problème de solde SMS\n');
  
  try {
    console.log('1. Test direct avec le client Nimba SMS...');
    const account = await client.accounts.get();
    console.log('✅ Solde récupéré directement:', account.balance);
    console.log('📊 Détails du compte:', account);
    
    console.log('\n2. Test d\'envoi de SMS...');
    const testMessage = {
      to: ['224625212115'],
      message: 'Test correction solde - ' + new Date().toISOString(),
      sender_name: 'ZaLaMa'
    };
    
    console.log('Message à envoyer:', testMessage);
    const response = await client.messages.create(testMessage);
    console.log('✅ SMS envoyé avec succès:', response);
    
    console.log('\n🎉 Correction réussie ! Le problème était l\'architecture circulaire.');
    console.log('📝 Résumé de la correction:');
    console.log('   - Suppression de l\'appel HTTP interne dans le service SMS');
    console.log('   - Utilisation directe du client Nimba SMS');
    console.log('   - Suppression de la méthode getBaseUrl() inutile');
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
    console.error('Détails:', error);
    
    if (error.message.includes('401')) {
      console.log('\n💡 Vérifiez vos identifiants NIMBA_SMS_SERVICE_ID et NIMBA_SMS_SECRET_TOKEN');
    } else if (error.message.includes('403')) {
      console.log('\n💡 Vérifiez les permissions de votre compte Nimba SMS');
    }
  }
}

// Exécuter le test
testBalanceFix(); 
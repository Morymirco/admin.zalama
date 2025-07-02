const { Client } = require('nimbasms');
require('dotenv').config();

console.log('🧪 Test de configuration SMS');
console.log('============================');

// Vérifier les variables d'environnement
const SERVICE_ID = process.env.NIMBA_SMS_SERVICE_ID;
const SECRET_TOKEN = process.env.NIMBA_SMS_SECRET_TOKEN;

console.log('📋 Variables d\'environnement :');
console.log(`   SERVICE_ID: ${SERVICE_ID ? '✅ Configuré' : '❌ Non configuré'}`);
console.log(`   SECRET_TOKEN: ${SECRET_TOKEN ? '✅ Configuré' : '❌ Non configuré'}`);

if (!SERVICE_ID || !SECRET_TOKEN) {
  console.log('');
  console.log('❌ Configuration incomplète');
  console.log('   Vérifiez que les variables sont dans le fichier .env');
  process.exit(1);
}

// Vérifier si ce sont les clés par défaut
const isDefaultKeys = SERVICE_ID === '9d83d5b67444c654c702f109dd837167' && 
                     SECRET_TOKEN === 'qf_bpb4CVfEalTU5eVEFC05wpoqlo17M-mozkZVbIHT_3xfOIjB7Oac-lkXZ6Pg2VqO2LXVy6BUlYTZe73y411agSC0jVh3OcOU92s8Rplc';

if (isDefaultKeys) {
  console.log('');
  console.log('⚠️  Utilisation des clés par défaut (non configurées)');
  console.log('   Le service SMS ne fonctionnera pas avec les clés par défaut');
  process.exit(1);
}

console.log('');
console.log('✅ Configuration SMS valide !');
console.log('');

// Tester la connexion avec Nimba SMS
async function testConnection() {
  try {
    console.log('🔗 Test de connexion avec Nimba SMS...');
    
    const config = {
      SERVICE_ID: SERVICE_ID,
      SECRET_TOKEN: SECRET_TOKEN,
    };
    
    const client = new Client(config);
    
    // Tester en récupérant les informations du compte
    const account = await client.accounts.get();
    
    console.log('✅ Connexion réussie !');
    console.log(`💰 Solde du compte: ${account.balance}`);
    console.log('');
    
    // Test d'envoi de SMS
    console.log('📱 Test d\'envoi de SMS...');
    const testPhone = '+224625212115';
    const testMessage = 'Test SMS ZaLaMa - ' + new Date().toLocaleString('fr-FR');
    
    console.log(`📤 Envoi vers: ${testPhone}`);
    console.log(`💬 Message: ${testMessage}`);
    
    const result = await client.messages.create({
      to: [testPhone],
      message: testMessage,
      sender_name: 'ZaLaMa',
    });
    
    console.log('✅ SMS envoyé avec succès !');
    console.log('📋 Résultat:', result);
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
    
    if (error.message.includes('401') || error.message.includes('Unauthorized')) {
      console.log('');
      console.log('🔑 Erreur d\'authentification');
      console.log('   Vérifiez que vos clés API sont correctes');
    } else if (error.message.includes('Network') || error.message.includes('fetch')) {
      console.log('');
      console.log('🌐 Erreur réseau');
      console.log('   Vérifiez votre connexion internet');
    }
  }
}

testConnection(); 
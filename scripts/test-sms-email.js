const { Client } = require('nimbasms');
const { Resend } = require('resend');

// Configuration
const config = {
  SMS: {
    SERVICE_ID: process.env.NIMBA_SMS_SERVICE_ID || '9d83d5b67444c654c702f109dd837167',
    SECRET_TOKEN: process.env.NIMBA_SMS_SECRET_TOKEN || 'qf_bpb4CVfEalTU5eVEFC05wpoqlo17M-mozkZVbIHT_3xfOIjB7Oac-lkXZ6Pg2VqO2LXVy6BUlYTZe73y411agSC0jVh3OcOU92s8Rplc',
  },
  EMAIL: {
    API_KEY: process.env.RESEND_API_KEY,
  }
};

// Vérifier la configuration
const isSMSConfigured = config.SMS.SERVICE_ID && config.SMS.SECRET_TOKEN && 
  config.SMS.SERVICE_ID !== '9d83d5b67444c654c702f109dd837167' && 
  config.SMS.SECRET_TOKEN !== 'qf_bpb4CVfEalTU5eVEFC05wpoqlo17M-mozkZVbIHT_3xfOIjB7Oac-lkXZ6Pg2VqO2LXVy6BUlYTZe73y411agSC0jVh3OcOU92s8Rplc';

const isEmailConfigured = config.EMAIL.API_KEY;

console.log('🧪 Test SMS & Email - Configuration');
console.log('=====================================');
console.log(`📱 SMS configuré: ${isSMSConfigured ? '✅' : '❌'}`);
console.log(`📧 Email configuré: ${isEmailConfigured ? '✅' : '❌'}`);
console.log('');

// Test SMS
async function testSMS() {
  if (!isSMSConfigured) {
    console.log('⚠️ SMS non configuré - Test ignoré');
    return;
  }

  console.log('📱 Test SMS');
  console.log('------------');
  
  try {
    const client = new Client(config.SMS);
    
    // Test d'envoi SMS
    const testPhone = '+224625212115';
    const testMessage = 'Test SMS ZaLaMa - ' + new Date().toLocaleString('fr-FR');
    
    console.log(`📤 Envoi vers: ${testPhone}`);
    console.log(`💬 Message: ${testMessage}`);
    
    const result = await client.messages.create({
      to: [testPhone],
      message: testMessage,
      sender_name: 'ZaLaMa',
    });
    
    console.log('✅ SMS envoyé avec succès:', result);
    
    // Vérifier le solde
    const account = await client.accounts.get();
    console.log('💰 Solde du compte:', account.balance);
    
  } catch (error) {
    console.error('❌ Erreur SMS:', error.message);
  }
  
  console.log('');
}

// Test Email
async function testEmail() {
  if (!isEmailConfigured) {
    console.log('⚠️ Email non configuré - Test ignoré');
    return;
  }

  console.log('📧 Test Email');
  console.log('-------------');
  
  try {
    const resend = new Resend(config.EMAIL.API_KEY);
    
    // Test d'envoi email
    const testEmail = 'test@exemple.com'; // Remplacer par une vraie adresse pour tester
    const testSubject = 'Test Email ZaLaMa';
    const testMessage = `
      <h2>Test Email ZaLaMa</h2>
      <p>Ceci est un email de test envoyé depuis l'application ZaLaMa.</p>
      <p>Date: ${new Date().toLocaleString('fr-FR')}</p>
    `;
    
    console.log(`📤 Envoi vers: ${testEmail}`);
    console.log(`📝 Sujet: ${testSubject}`);
    
    const result = await resend.emails.send({
      from: 'ZaLaMa <noreply@zalamagn.com>',
      to: [testEmail],
      subject: testSubject,
      html: testMessage,
    });
    
    console.log('✅ Email envoyé avec succès:', result.data?.id);
    
  } catch (error) {
    console.error('❌ Erreur Email:', error.message);
  }
  
  console.log('');
}

// Test API Routes
async function testAPIRoutes() {
  console.log('🌐 Test API Routes');
  console.log('------------------');
  
  const baseUrl = 'http://localhost:3000';
  
  try {
    // Test API SMS
    console.log('📱 Test API SMS...');
    const smsResponse = await fetch(`${baseUrl}/api/test/sms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: '+224625212115',
        message: 'Test API SMS ZaLaMa - ' + new Date().toLocaleString('fr-FR')
      })
    });
    
    const smsResult = await smsResponse.json();
    console.log('📱 API SMS:', smsResult.success ? '✅' : '❌', smsResult.message);
    
  } catch (error) {
    console.error('❌ Erreur API SMS:', error.message);
  }
  
  try {
    // Test API Email
    console.log('📧 Test API Email...');
    const emailResponse = await fetch(`${baseUrl}/api/email/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: 'test@exemple.com',
        subject: 'Test API Email ZaLaMa',
        message: 'Ceci est un test de l\'API email.'
      })
    });
    
    const emailResult = await emailResponse.json();
    console.log('📧 API Email:', emailResult.success ? '✅' : '❌', emailResult.message);
    
  } catch (error) {
    console.error('❌ Erreur API Email:', error.message);
  }
  
  console.log('');
}

// Exécuter les tests
async function runTests() {
  console.log('🚀 Démarrage des tests SMS & Email');
  console.log('==================================');
  console.log('');
  
  await testSMS();
  await testEmail();
  await testAPIRoutes();
  
  console.log('✅ Tests terminés');
}

// Exécuter si appelé directement
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { testSMS, testEmail, testAPIRoutes }; 
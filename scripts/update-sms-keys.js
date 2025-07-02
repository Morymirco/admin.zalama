const fs = require('fs');
const path = require('path');

// Clés API Nimba SMS fournies par l'utilisateur
const NIMBA_SMS_SERVICE_ID = '9d83d5b67444c654c702f109dd837167';
const NIMBA_SMS_SECRET_TOKEN = 'qf_bpb4CVfEalTU5eVEFC05wpoqlo17M-mozkZVbIHT_3xfOIjB7Oac-lkXZ6Pg2VqO2LXVy6BUlYTZe73y411agSC0jVh3OcOU92s8Rplc';

// Chemin vers le fichier .env
const envPath = path.join(__dirname, '..', '.env');

console.log('📱 Configuration des clés API Nimba SMS...');
console.log('==========================================');

try {
  // Lire le fichier .env
  let envContent = fs.readFileSync(envPath, 'utf8');
  
  // Mettre à jour ou ajouter NIMBA_SMS_SERVICE_ID
  if (envContent.includes('NIMBA_SMS_SERVICE_ID=')) {
    envContent = envContent.replace(
      /NIMBA_SMS_SERVICE_ID=.*/,
      `NIMBA_SMS_SERVICE_ID=${NIMBA_SMS_SERVICE_ID}`
    );
    console.log('✅ SERVICE_ID mis à jour');
  } else {
    envContent += `\n# Configuration SMS (Nimba SMS)\nNIMBA_SMS_SERVICE_ID=${NIMBA_SMS_SERVICE_ID}\n`;
    console.log('✅ SERVICE_ID ajouté');
  }
  
  // Mettre à jour ou ajouter NIMBA_SMS_SECRET_TOKEN
  if (envContent.includes('NIMBA_SMS_SECRET_TOKEN=')) {
    envContent = envContent.replace(
      /NIMBA_SMS_SECRET_TOKEN=.*/,
      `NIMBA_SMS_SECRET_TOKEN=${NIMBA_SMS_SECRET_TOKEN}`
    );
    console.log('✅ SECRET_TOKEN mis à jour');
  } else {
    envContent += `NIMBA_SMS_SECRET_TOKEN=${NIMBA_SMS_SECRET_TOKEN}\n`;
    console.log('✅ SECRET_TOKEN ajouté');
  }
  
  // Écrire le fichier mis à jour
  fs.writeFileSync(envPath, envContent);
  
  console.log('📱 Configuration SMS terminée !');
  console.log('');
  console.log('🔄 Redémarrez votre serveur pour appliquer les changements :');
  console.log('   npm run dev');
  console.log('');
  console.log('🧪 Testez ensuite sur : http://localhost:3000/dashboard/test-sms');
  console.log('');
  console.log('📋 Configuration actuelle :');
  console.log(`   SERVICE_ID: ${NIMBA_SMS_SERVICE_ID}`);
  console.log(`   SECRET_TOKEN: ${NIMBA_SMS_SECRET_TOKEN.substring(0, 20)}...`);
  
} catch (error) {
  console.error('❌ Erreur lors de la mise à jour :', error.message);
  console.log('');
  console.log('📝 Mettez à jour manuellement votre fichier .env :');
  console.log(`   NIMBA_SMS_SERVICE_ID=${NIMBA_SMS_SERVICE_ID}`);
  console.log(`   NIMBA_SMS_SECRET_TOKEN=${NIMBA_SMS_SECRET_TOKEN}`);
} 
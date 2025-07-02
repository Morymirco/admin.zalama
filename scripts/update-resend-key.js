const fs = require('fs');
const path = require('path');

// Clé API Resend fournie par l'utilisateur
const RESEND_API_KEY = 're_aQWgf3nW_Ht5jAsAUj6BzqspyDqxEcCwB';

// Chemin vers le fichier .env
const envPath = path.join(__dirname, '..', '.env');

console.log('🔧 Mise à jour de la clé API Resend...');
console.log('=====================================');

try {
  // Lire le fichier .env.local
  let envContent = fs.readFileSync(envPath, 'utf8');
  
  // Vérifier si la ligne RESEND_API_KEY existe déjà
  if (envContent.includes('RESEND_API_KEY=')) {
    // Remplacer la ligne existante
    envContent = envContent.replace(
      /RESEND_API_KEY=.*/,
      `RESEND_API_KEY=${RESEND_API_KEY}`
    );
    console.log('✅ Clé API Resend mise à jour');
  } else {
    // Ajouter la ligne si elle n'existe pas
    envContent += `\n# Configuration Email (Resend)\nRESEND_API_KEY=${RESEND_API_KEY}\n`;
    console.log('✅ Clé API Resend ajoutée');
  }
  
  // Écrire le fichier mis à jour
  fs.writeFileSync(envPath, envContent);
  
  console.log('📧 Configuration Resend terminée !');
  console.log('');
  console.log('🔄 Redémarrez votre serveur pour appliquer les changements :');
  console.log('   npm run dev');
  console.log('');
  console.log('🧪 Testez ensuite sur : http://localhost:3000/dashboard/test-sms');
  
} catch (error) {
  console.error('❌ Erreur lors de la mise à jour :', error.message);
  console.log('');
  console.log('📝 Mettez à jour manuellement votre fichier .env.local :');
  console.log(`   RESEND_API_KEY=${RESEND_API_KEY}`);
} 
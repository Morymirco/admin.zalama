const fs = require('fs');
const path = require('path');

// Credentials Lengo Pay fournis
const LENGO_CREDENTIALS = {
  SITE_ID: 'ozazlahgzpntmYAG',
  API_KEY: 'bDM0WlhpcDRta052MmxIZEFFcEV1Mno0WERwS2R0dnk3ZUhWOEpwczdYVXdnM1Bwd016UTVLcEVZNmc0RkQwMw==',
  API_URL: 'https://portal.lengopay.com',
  CALLBACK_URL: 'https://votre-domaine.com/api/payments/lengo-callback'
};

function setupLengoCredentials() {
  console.log('🔧 Configuration des credentials Lengo Pay...\n');

  const envPath = path.join(process.cwd(), '.env.local');
  
  // Vérifier si le fichier .env.local existe
  let existingEnv = '';
  if (fs.existsSync(envPath)) {
    existingEnv = fs.readFileSync(envPath, 'utf8');
    console.log('✅ Fichier .env.local trouvé');
  } else {
    console.log('📝 Création du fichier .env.local');
  }

  // Préparer les nouvelles variables Lengo Pay
  const lengoEnvVars = [
    '',
    '# Lengo Pay Configuration',
    `LENGO_SITE_ID=${LENGO_CREDENTIALS.SITE_ID}`,
    `LENGO_API_KEY=${LENGO_CREDENTIALS.API_KEY}`,
    `LENGO_API_URL=${LENGO_CREDENTIALS.API_URL}`,
    `LENGO_CALLBACK_URL=${LENGO_CREDENTIALS.CALLBACK_URL}`,
    '',
    '# Note: Remplacez "votre-domaine.com" par votre vrai domaine',
    '# Pour le développement local, utilisez ngrok ou similaire',
    ''
  ].join('\n');

  // Vérifier si les variables Lengo existent déjà
  const hasLengoConfig = existingEnv.includes('LENGO_');
  
  if (hasLengoConfig) {
    console.log('⚠️  Variables Lengo Pay déjà présentes dans .env.local');
    console.log('   Mise à jour des valeurs...');
    
    // Remplacer les valeurs existantes
    let updatedEnv = existingEnv;
    
    // Remplacer ou ajouter chaque variable
    const variables = [
      { name: 'LENGO_SITE_ID', value: LENGO_CREDENTIALS.SITE_ID },
      { name: 'LENGO_API_KEY', value: LENGO_CREDENTIALS.API_KEY },
      { name: 'LENGO_API_URL', value: LENGO_CREDENTIALS.API_URL },
      { name: 'LENGO_CALLBACK_URL', value: LENGO_CREDENTIALS.CALLBACK_URL }
    ];

    variables.forEach(({ name, value }) => {
      const regex = new RegExp(`^${name}=.*$`, 'm');
      if (regex.test(updatedEnv)) {
        updatedEnv = updatedEnv.replace(regex, `${name}=${value}`);
      } else {
        updatedEnv += `\n${name}=${value}`;
      }
    });

    fs.writeFileSync(envPath, updatedEnv);
  } else {
    console.log('📝 Ajout des variables Lengo Pay...');
    fs.writeFileSync(envPath, existingEnv + lengoEnvVars);
  }

  console.log('✅ Configuration Lengo Pay terminée!');
  console.log('\n📋 Variables configurées:');
  console.log(`   LENGO_SITE_ID: ${LENGO_CREDENTIALS.SITE_ID}`);
  console.log(`   LENGO_API_KEY: ${LENGO_CREDENTIALS.API_KEY.substring(0, 20)}...`);
  console.log(`   LENGO_API_URL: ${LENGO_CREDENTIALS.API_URL}`);
  console.log(`   LENGO_CALLBACK_URL: ${LENGO_CREDENTIALS.CALLBACK_URL}`);
  
  console.log('\n⚠️  IMPORTANT:');
  console.log('   - Remplacez "votre-domaine.com" par votre vrai domaine');
  console.log('   - Pour le développement local, utilisez ngrok ou similaire');
  console.log('   - Exemple: LENGO_CALLBACK_URL=https://abc123.ngrok.io/api/payments/lengo-callback');
  
  console.log('\n🧪 Pour tester la configuration:');
  console.log('   npm run test-payment-page');
  
  console.log('\n🚀 Pour démarrer l\'application:');
  console.log('   npm run dev');
}

// Exécuter la configuration
setupLengoCredentials(); 
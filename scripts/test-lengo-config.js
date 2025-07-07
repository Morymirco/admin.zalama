require('dotenv').config({ path: '.env.local' });

console.log('🔧 Test de la configuration Lengo Pay...\n');

// Vérifier les variables d'environnement
const variables = {
  'LENGO_SITE_ID': process.env.LENGO_SITE_ID,
  'LENGO_API_KEY': process.env.LENGO_API_KEY,
  'LENGO_API_URL': process.env.LENGO_API_URL,
  'LENGO_CALLBACK_URL': process.env.LENGO_CALLBACK_URL
};

console.log('📋 Variables d\'environnement:');
let allConfigured = true;

Object.entries(variables).forEach(([key, value]) => {
  const status = value ? '✅' : '❌';
  const displayValue = value ? (key.includes('KEY') ? value.substring(0, 20) + '...' : value) : 'Non configuré';
  console.log(`   ${key}: ${status} ${displayValue}`);
  
  if (!value) {
    allConfigured = false;
  }
});

console.log('\n📊 Résumé:');
if (allConfigured) {
  console.log('✅ Toutes les variables Lengo Pay sont configurées');
  console.log('🚀 Vous pouvez maintenant tester les paiements');
} else {
  console.log('❌ Certaines variables Lengo Pay sont manquantes');
  console.log('💡 Exécutez: npm run setup-lengo');
}

console.log('\n🧪 Pour tester les paiements:');
console.log('1. npm run dev');
console.log('2. Accédez à: http://localhost:3000/dashboard/paiements');
console.log('3. Remplissez le formulaire et testez un paiement');

// Test de décodage de l'API Key (si elle est en base64)
if (variables['LENGO_API_KEY']) {
  try {
    const decoded = Buffer.from(variables['LENGO_API_KEY'], 'base64').toString('utf-8');
    console.log('\n🔍 API Key décodée:', decoded);
  } catch (error) {
    console.log('\n⚠️  API Key n\'est pas en format base64 valide');
  }
} 
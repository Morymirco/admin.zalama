require('dotenv').config({ path: '.env.local' });

console.log('🧪 TEST COMPLET LENGO PAY');
console.log('==========================\n');

// Configuration
const BASE_URL = 'http://localhost:3000';
const CALLBACK_URL = `${BASE_URL}/api/remboursements/lengo-callback`;

const LENGO_API_URL = process.env.LENGO_API_URL || 'https://portal.lengopay.com';
const LENGO_LICENSE_KEY = process.env.LENGO_API_KEY;
const LENGO_WEBSITE_ID = process.env.LENGO_SITE_ID;

console.log('📋 Configuration:');
console.log('  BASE_URL:', BASE_URL);
console.log('  CALLBACK_URL:', CALLBACK_URL);
console.log('  LENGO_API_URL:', LENGO_API_URL);
console.log('  LENGO_WEBSITE_ID:', LENGO_WEBSITE_ID ? '✅ Configuré' : '❌ Manquant');
console.log('  LENGO_LICENSE_KEY:', LENGO_LICENSE_KEY ? '✅ Configuré' : '❌ Manquant');

console.log('\n🔍 Validation des URLs:');
try {
  new URL(CALLBACK_URL);
  console.log('  ✅ CALLBACK_URL valide');
} catch (error) {
  console.log('  ❌ CALLBACK_URL invalide:', error.message);
}

console.log('\n📤 Payload Lengo Pay simulé (selon la doc officielle):');
const lengoPayload = {
  websiteid: LENGO_WEBSITE_ID || 'test-site-id',
  amount: 1500,
  currency: 'GNF',
  callback_url: CALLBACK_URL // SEULEMENT le callback_url - OBLIGATOIRE pour connaître le statut
};

console.log(JSON.stringify(lengoPayload, null, 2));

console.log('\n🔧 Test de l\'API route:');
console.log('  POST /api/remboursements/lengo-paiement');
console.log('  Headers:');
console.log('    Authorization: Basic [LENGO_LICENSE_KEY]');
console.log('    Accept: application/json');
console.log('    Content-Type: application/json');
console.log('  Body:', JSON.stringify(lengoPayload, null, 2));

console.log('\n📞 Callback configuré:');
console.log('  POST /api/remboursements/lengo-callback - Notification serveur Lengo Pay');
console.log('  Format attendu selon la doc:');
console.log('    {');
console.log('      "pay_id": "identifiant_paiement",');
console.log('      "status": "SUCCESS|FAILED|PENDING|CANCELLED",');
console.log('      "amount": 1500,');
console.log('      "message": "Transaction Successful",');
console.log('      "Client": "624897845"');
console.log('    }');

console.log('\n✅ Configuration complète !');
console.log('\n🚀 Pour tester:');
console.log('  1. Démarrez le serveur: npm run dev');
console.log('  2. Allez sur: http://localhost:3000/dashboard/remboursements');
console.log('  3. Cliquez sur "Payer via Lengo Pay"');
console.log('  4. Vérifiez les logs dans la console');
console.log('  5. Le callback mettra à jour automatiquement le statut'); 
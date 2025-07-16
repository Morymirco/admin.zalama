console.log('🧪 TEST DES URLs LENGO PAY');
console.log('==========================\n');

// URLs définies directement
const BASE_URL = 'http://localhost:3000';
const CALLBACK_URL = `${BASE_URL}/api/remboursements/lengo-callback`;
const RETURN_URL = `${BASE_URL}/api/remboursements/return-callback`;

console.log('📋 URLs configurées:');
console.log('  BASE_URL:', BASE_URL);
console.log('  CALLBACK_URL:', CALLBACK_URL);
console.log('  RETURN_URL:', RETURN_URL);

console.log('\n🔍 Validation des URLs:');
try {
  new URL(CALLBACK_URL);
  console.log('  ✅ CALLBACK_URL valide');
} catch (error) {
  console.log('  ❌ CALLBACK_URL invalide:', error.message);
}

try {
  new URL(RETURN_URL);
  console.log('  ✅ RETURN_URL valide');
} catch (error) {
  console.log('  ❌ RETURN_URL invalide:', error.message);
}

console.log('\n📤 Payload Lengo Pay simulé:');
const lengoPayload = {
  websiteid: 'test-site-id',
  amount: 1500,
  currency: 'GNF',
  return_url: RETURN_URL,
  callback_url: CALLBACK_URL
};

console.log(JSON.stringify(lengoPayload, null, 2));

console.log('\n✅ Test terminé - URLs correctes !'); 
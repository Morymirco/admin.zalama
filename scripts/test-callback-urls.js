require('dotenv').config({ path: '.env.local' });

// Fonction pour nettoyer l'URL de base (copie de celle dans le code)
function getBaseUrl() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  
  console.log('🔍 getBaseUrl - URL originale:', appUrl);
  
  if (!appUrl) {
    console.log('🔍 getBaseUrl - Pas d\'URL configurée, utilisation de localhost');
    return 'http://localhost:3000';
  }
  
  // Nettoyer l'URL si elle contient des caractères malformés
  let cleanUrl = appUrl.trim();
  
  console.log('🔍 getBaseUrl - URL après trim:', cleanUrl);
  
  // Vérifier si l'URL commence par http ou https
  if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
    console.log('🔍 getBaseUrl - Ajout du protocole http://');
    cleanUrl = 'http://' + cleanUrl;
  }
  
  // Supprimer les doubles slashes après le protocole
  cleanUrl = cleanUrl.replace(/^(https?:\/\/)\/+/g, '$1');
  
  // Supprimer le slash final s'il existe
  cleanUrl = cleanUrl.replace(/\/$/, '');
  
  console.log('🔍 getBaseUrl - URL finale nettoyée:', cleanUrl);
  
  // Validation finale de l'URL
  try {
    new URL(cleanUrl);
    console.log('✅ getBaseUrl - URL valide');
  } catch (error) {
    console.error('❌ getBaseUrl - URL invalide, utilisation de localhost:', error);
    return 'http://localhost:3000';
  }
  
  return cleanUrl;
}

console.log('🧪 TEST DES URLs DE CALLBACK');
console.log('============================\n');

// Test de la fonction getBaseUrl
const baseUrl = getBaseUrl();
const returnUrl = `${baseUrl}/api/remboursements/return-callback`;
const callbackUrl = `${baseUrl}/api/remboursements/lengo-callback`;

console.log('\n📋 URLs générées:');
console.log('  Base URL:', baseUrl);
console.log('  Return URL:', returnUrl);
console.log('  Callback URL:', callbackUrl);

console.log('\n🔍 Validation des URLs:');
try {
  new URL(returnUrl);
  console.log('  ✅ Return URL valide');
} catch (error) {
  console.log('  ❌ Return URL invalide:', error.message);
}

try {
  new URL(callbackUrl);
  console.log('  ✅ Callback URL valide');
} catch (error) {
  console.log('  ❌ Callback URL invalide:', error.message);
}

console.log('\n📋 Variables d\'environnement:');
console.log('  NEXT_PUBLIC_APP_URL:', process.env.NEXT_PUBLIC_APP_URL || 'Non définie');
console.log('  LENGO_API_URL:', process.env.LENGO_API_URL || 'Non définie');
console.log('  LENGO_SITE_ID:', process.env.LENGO_SITE_ID ? 'Définie' : 'Non définie');
console.log('  LENGO_API_KEY:', process.env.LENGO_API_KEY ? 'Définie' : 'Non définie');

console.log('\n✅ Test terminé'); 
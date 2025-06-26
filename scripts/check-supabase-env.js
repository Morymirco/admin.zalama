const fs = require('fs');
const path = require('path');

console.log('🔍 Vérification de la configuration Supabase ZaLaMa\n');

// Vérifier si le fichier .env.local existe
const envPath = path.join(__dirname, '..', '.env.local');

if (!fs.existsSync(envPath)) {
  console.log('❌ Fichier .env.local non trouvé');
  console.log('💡 Exécutez : node scripts/setup-supabase-env.js');
  process.exit(1);
}

// Lire le fichier .env.local
const envContent = fs.readFileSync(envPath, 'utf8');

// Variables requises pour Supabase
const requiredVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY'
];

// Variables optionnelles
const optionalVars = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'RESEND_API_KEY',
  'SMS_API_KEY',
  'NEXT_PUBLIC_USE_SUPABASE'
];

console.log('📋 Vérification des variables d\'environnement :\n');

let allValid = true;
const missingVars = [];
const invalidVars = [];

// Vérifier les variables requises
requiredVars.forEach(varName => {
  const regex = new RegExp(`^${varName}=(.+)$`, 'm');
  const match = envContent.match(regex);
  
  if (!match) {
    console.log(`❌ ${varName} : MANQUANTE`);
    missingVars.push(varName);
    allValid = false;
  } else {
    const value = match[1].trim();
    if (value === 'votre_cle_service_role_ici' && varName === 'SUPABASE_SERVICE_ROLE_KEY') {
      console.log(`⚠️  ${varName} : À CONFIGURER (valeur par défaut)`);
      invalidVars.push(varName);
      allValid = false;
    } else if (value === '' || value === 'undefined') {
      console.log(`❌ ${varName} : VIDE`);
      invalidVars.push(varName);
      allValid = false;
    } else {
      console.log(`✅ ${varName} : CONFIGURÉE`);
    }
  }
});

// Vérifier les variables optionnelles
console.log('\n📋 Variables optionnelles :\n');
optionalVars.forEach(varName => {
  const regex = new RegExp(`^${varName}=(.+)$`, 'm');
  const match = envContent.match(regex);
  
  if (!match) {
    console.log(`⚠️  ${varName} : NON CONFIGURÉE (optionnel)`);
  } else {
    const value = match[1].trim();
    if (value.includes('votre_') || value === '' || value === 'undefined') {
      console.log(`⚠️  ${varName} : À CONFIGURER (optionnel)`);
    } else {
      console.log(`✅ ${varName} : CONFIGURÉE`);
    }
  }
});

// Vérifier les formats des URLs et clés
console.log('\n🔍 Vérification des formats :\n');

const supabaseUrlMatch = envContent.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)$/m);
if (supabaseUrlMatch) {
  const url = supabaseUrlMatch[1].trim();
  if (url.includes('supabase.co')) {
    console.log('✅ URL Supabase : Format valide');
  } else {
    console.log('❌ URL Supabase : Format invalide');
    allValid = false;
  }
}

const anonKeyMatch = envContent.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.+)$/m);
if (anonKeyMatch) {
  const key = anonKeyMatch[1].trim();
  if (key.startsWith('eyJ') && key.length > 100) {
    console.log('✅ Clé anonyme Supabase : Format valide');
  } else {
    console.log('❌ Clé anonyme Supabase : Format invalide');
    allValid = false;
  }
}

// Résumé
console.log('\n📊 Résumé de la vérification :\n');

if (allValid) {
  console.log('🎉 Configuration Supabase VALIDE !');
  console.log('✅ Toutes les variables requises sont configurées');
  console.log('✅ Les formats sont corrects');
  console.log('\n🚀 Vous pouvez maintenant :');
  console.log('1. Exécuter le schéma SQL dans Supabase Dashboard');
  console.log('2. Lancer l\'application : npm run dev');
  console.log('3. Tester la migration : http://localhost:3000/dashboard/migration-test');
} else {
  console.log('❌ Configuration INCOMPLÈTE');
  
  if (missingVars.length > 0) {
    console.log('\n🔧 Variables manquantes :');
    missingVars.forEach(varName => {
      console.log(`   - ${varName}`);
    });
  }
  
  if (invalidVars.length > 0) {
    console.log('\n🔧 Variables à configurer :');
    invalidVars.forEach(varName => {
      console.log(`   - ${varName}`);
    });
  }
  
  console.log('\n💡 Actions à effectuer :');
  console.log('1. Vérifiez votre fichier .env.local');
  console.log('2. Ajoutez les variables manquantes');
  console.log('3. Récupérez votre clé service role dans Supabase Dashboard');
  console.log('4. Relancez cette vérification : node scripts/check-supabase-env.js');
}

console.log('\n📚 Documentation :');
console.log('- Guide de migration : MIGRATION_GUIDE.md');
console.log('- Configuration Supabase : https://supabase.com/docs');
console.log('- Dashboard Supabase : https://supabase.com/dashboard'); 
const fs = require('fs');
const path = require('path');

console.log('🔍 Vérification des URLs de callback Lengo Pay');
console.log('==============================================\n');

// URLs de callback attendues
const EXPECTED_CALLBACK_URLS = [
  'https://admin.zalamasas.com/api/payments/lengo-callback',
  'https://admin.zalamasas.com/api/remboursements/lengo-callback'
];

// Fichiers à vérifier
const FILES_TO_CHECK = [
  'services/lengoPayService.ts',
  'app/api/remboursements/simple-paiement/route.ts',
  'app/api/remboursements/simple-paiement-lot/route.ts',
  'app/api/payments/lengo-cashin/route.ts',
  'app/api/remboursements/lengo-paiement/route.ts',
  'scripts/setup-lengo-credentials.js'
];

let allCorrect = true;

FILES_TO_CHECK.forEach(filePath => {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    console.log(`📁 ${filePath}:`);
    
    let fileHasIssues = false;
    
    lines.forEach((line, index) => {
      // Vérifier les URLs hardcodées incorrectes
      if (line.includes('votre-domaine.com') || line.includes('localhost:3000')) {
        console.log(`   ❌ Ligne ${index + 1}: URL incorrecte détectée`);
        console.log(`      ${line.trim()}`);
        fileHasIssues = true;
        allCorrect = false;
      }
      
      // Vérifier les URLs correctes
      if (line.includes('admin.zalamasas.com')) {
        console.log(`   ✅ Ligne ${index + 1}: URL correcte`);
        console.log(`      ${line.trim()}`);
      }
      
      // Vérifier les variables d'environnement
      if (line.includes('LENGO_CALLBACK_URL') && line.includes('process.env')) {
        console.log(`   ✅ Ligne ${index + 1}: Variable d'environnement correcte`);
        console.log(`      ${line.trim()}`);
      }
    });
    
    if (!fileHasIssues) {
      console.log(`   ✅ Aucun problème détecté`);
    }
    
    console.log('');
  } catch (error) {
    console.log(`   ❌ Erreur lors de la lecture du fichier: ${error.message}`);
    allCorrect = false;
  }
});

// Vérifier les variables d'environnement
console.log('🔧 Variables d\'environnement:');
const envVars = [
  'LENGO_CALLBACK_URL',
  'NEXT_PUBLIC_BASE_URL'
];

envVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    if (value.includes('admin.zalamasas.com')) {
      console.log(`   ✅ ${varName}: ${value}`);
    } else {
      console.log(`   ⚠️  ${varName}: ${value} (devrait pointer vers admin.zalamasas.com)`);
      allCorrect = false;
    }
  } else {
    console.log(`   ❌ ${varName}: Non définie`);
    allCorrect = false;
  }
});

console.log('\n📋 Résumé des URLs de callback:');
EXPECTED_CALLBACK_URLS.forEach(url => {
  console.log(`   • ${url}`);
});

console.log('\n🎯 Recommandations:');
console.log('   1. Assurez-vous que LENGO_CALLBACK_URL est définie dans .env');
console.log('   2. Vérifiez que Lengo Pay est configuré avec les bonnes URLs');
console.log('   3. Testez les callbacks avec des paiements réels');

if (allCorrect) {
  console.log('\n✅ Toutes les URLs de callback sont correctement configurées !');
} else {
  console.log('\n❌ Des problèmes ont été détectés. Veuillez les corriger.');
  process.exit(1);
}

// Vérifier l'accessibilité des endpoints
console.log('\n🌐 Test d\'accessibilité des endpoints...');

const testEndpoints = async () => {
  const endpoints = [
    'https://admin.zalamasas.com/api/payments/lengo-callback',
    'https://admin.zalamasas.com/api/remboursements/lengo-callback'
  ];
  
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint, { method: 'GET' });
      if (response.ok) {
        console.log(`   ✅ ${endpoint} - Accessible (${response.status})`);
      } else {
        console.log(`   ⚠️  ${endpoint} - Réponse ${response.status}`);
      }
    } catch (error) {
      console.log(`   ❌ ${endpoint} - Erreur: ${error.message}`);
    }
  }
};

// Exécuter les tests d'accessibilité si fetch est disponible
if (typeof fetch !== 'undefined') {
  testEndpoints();
} else {
  console.log('   ℹ️  Test d\'accessibilité non disponible (fetch non supporté)');
} 
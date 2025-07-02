#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 Optimisation de l\'environnement de développement...\n');

// Configuration des variables d'environnement pour le développement
const envVars = {
  'NEXT_TELEMETRY_DISABLED': '1',
  'NODE_ENV': 'development',
  'NEXT_OPTIMIZE_FONTS': 'true',
  'NEXT_OPTIMIZE_IMAGES': 'true',
  'NEXT_DEV_FAST_REFRESH': 'true',
  'NEXT_DEV_HMR': 'true',
  'NEXT_CACHE_DISABLED': 'false',
  'NEXT_CACHE_MAX_AGE': '300',
  'NEXT_DEBUG': 'false',
  'NEXT_VERBOSE': 'false'
};

// Créer le fichier .env.local s'il n'existe pas
const envPath = path.join(process.cwd(), '.env.local');
let envContent = '';

if (fs.existsSync(envPath)) {
  envContent = fs.readFileSync(envPath, 'utf8');
}

// Ajouter les variables manquantes
Object.entries(envVars).forEach(([key, value]) => {
  if (!envContent.includes(`${key}=`)) {
    envContent += `\n${key}=${value}`;
  }
});

fs.writeFileSync(envPath, envContent.trim());
console.log('✅ Variables d\'environnement optimisées');

// Optimiser le package.json
const packagePath = path.join(process.cwd(), 'package.json');
if (fs.existsSync(packagePath)) {
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  
  // Ajouter des scripts optimisés
  if (!packageJson.scripts) {
    packageJson.scripts = {};
  }
  
  const optimizedScripts = {
    'dev:fast': 'NEXT_TELEMETRY_DISABLED=1 NEXT_OPTIMIZE_FONTS=true next dev',
    'dev:debug': 'NEXT_DEBUG=true next dev',
    'build:analyze': 'ANALYZE=true next build',
    'start:fast': 'NEXT_TELEMETRY_DISABLED=1 next start',
    'clean': 'rm -rf .next && rm -rf node_modules/.cache',
    'cache:clear': 'rm -rf .next/cache',
    'perf:test': 'node scripts/test-dashboard-simple.js'
  };
  
  Object.entries(optimizedScripts).forEach(([name, script]) => {
    if (!packageJson.scripts[name]) {
      packageJson.scripts[name] = script;
    }
  });
  
  fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
  console.log('✅ Scripts optimisés ajoutés au package.json');
}

// Créer un fichier de configuration pour le développement
const devConfig = {
  fastRefresh: true,
  hmr: true,
  cache: {
    enabled: true,
    maxAge: 300000 // 5 minutes
  },
  optimization: {
    bundleAnalyzer: false,
    minify: false,
    sourceMaps: true
  },
  performance: {
    hints: false,
    maxEntrypointSize: 512000,
    maxAssetSize: 512000
  }
};

const devConfigPath = path.join(process.cwd(), 'dev.config.json');
fs.writeFileSync(devConfigPath, JSON.stringify(devConfig, null, 2));
console.log('✅ Configuration de développement créée');

// Créer un fichier .gitignore optimisé
const gitignorePath = path.join(process.cwd(), '.gitignore');
let gitignoreContent = '';

if (fs.existsSync(gitignorePath)) {
  gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
}

const gitignoreAdditions = [
  '# Optimisations de développement',
  '.env.local',
  'dev.config.json',
  '.next/cache/',
  'node_modules/.cache/',
  '*.log',
  'npm-debug.log*',
  'yarn-debug.log*',
  'yarn-error.log*',
  '.DS_Store',
  '*.tsbuildinfo'
];

gitignoreAdditions.forEach(line => {
  if (!gitignoreContent.includes(line)) {
    gitignoreContent += `\n${line}`;
  }
});

fs.writeFileSync(gitignorePath, gitignoreContent.trim());
console.log('✅ .gitignore optimisé');

// Créer un script de nettoyage
const cleanupScript = `#!/bin/bash
echo "🧹 Nettoyage du cache et des fichiers temporaires..."

# Nettoyer le cache Next.js
rm -rf .next/cache
rm -rf .next/build-manifest.json
rm -rf .next/prerender-manifest.json

# Nettoyer le cache Node.js
rm -rf node_modules/.cache
rm -rf node_modules/.vite

# Nettoyer les logs
rm -rf *.log
rm -rf npm-debug.log*
rm -rf yarn-debug.log*
rm -rf yarn-error.log*

# Nettoyer les fichiers temporaires
rm -rf .DS_Store
rm -rf *.tsbuildinfo

echo "✅ Nettoyage terminé"
`;

const cleanupPath = path.join(process.cwd(), 'scripts', 'cleanup.sh');
fs.writeFileSync(cleanupPath, cleanupScript);
fs.chmodSync(cleanupPath, '755');
console.log('✅ Script de nettoyage créé');

console.log('\n🎉 Optimisation terminée !');
console.log('\n📋 Commandes disponibles :');
console.log('   npm run dev:fast    - Démarrage rapide en développement');
console.log('   npm run clean       - Nettoyage complet');
console.log('   npm run cache:clear - Nettoyage du cache');
console.log('   npm run perf:test   - Test de performance');
console.log('\n💡 Conseils :');
console.log('   - Utilisez "npm run dev:fast" pour un démarrage plus rapide');
console.log('   - Exécutez "npm run clean" si vous rencontrez des problèmes');
console.log('   - Le cache est maintenant optimisé pour de meilleures performances'); 
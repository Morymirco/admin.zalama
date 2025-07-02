const fs = require('fs');
const path = require('path');

console.log('⚡ Test des performances du Fast Refresh...\n');

// Fonction pour mesurer le temps de compilation
function measureCompilationTime() {
  const startTime = Date.now();
  
  return {
    start: () => {
      return Date.now();
    },
    end: (start) => {
      const endTime = Date.now();
      const duration = endTime - start;
      
      if (duration < 500) {
        console.log(`✅ Compilation: ${duration}ms (EXCELLENT)`);
      } else if (duration < 1000) {
        console.log(`✅ Compilation: ${duration}ms (BON)`);
      } else if (duration < 2000) {
        console.log(`⚠️ Compilation: ${duration}ms (MOYEN)`);
      } else {
        console.log(`❌ Compilation: ${duration}ms (LENT)`);
      }
      
      return duration;
    }
  };
}

// Fonction pour analyser les fichiers du projet
function analyzeProjectFiles() {
  const projectRoot = process.cwd();
  const stats = {
    totalFiles: 0,
    totalSize: 0,
    fileTypes: {},
    largeFiles: []
  };

  function scanDirectory(dir) {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      // Ignorer les dossiers node_modules et .next
      if (stat.isDirectory()) {
        if (item !== 'node_modules' && item !== '.next' && !item.startsWith('.')) {
          scanDirectory(fullPath);
        }
        continue;
      }
      
      // Analyser les fichiers
      const ext = path.extname(item);
      const size = stat.size;
      
      stats.totalFiles++;
      stats.totalSize += size;
      
      if (!stats.fileTypes[ext]) {
        stats.fileTypes[ext] = { count: 0, size: 0 };
      }
      stats.fileTypes[ext].count++;
      stats.fileTypes[ext].size += size;
      
      // Identifier les gros fichiers
      if (size > 100 * 1024) { // > 100KB
        stats.largeFiles.push({
          path: fullPath.replace(projectRoot, ''),
          size: size,
          sizeKB: (size / 1024).toFixed(2)
        });
      }
    }
  }

  try {
    scanDirectory(projectRoot);
    
    console.log('📊 Analyse du projet:');
    console.log(`   Total fichiers: ${stats.totalFiles}`);
    console.log(`   Taille totale: ${(stats.totalSize / 1024 / 1024).toFixed(2)} MB`);
    
    console.log('\n📁 Types de fichiers:');
    Object.entries(stats.fileTypes)
      .sort(([,a], [,b]) => b.size - a.size)
      .slice(0, 10)
      .forEach(([ext, info]) => {
        console.log(`   ${ext}: ${info.count} fichiers (${(info.size / 1024).toFixed(2)} KB)`);
      });
    
    if (stats.largeFiles.length > 0) {
      console.log('\n⚠️ Gros fichiers détectés:');
      stats.largeFiles
        .sort((a, b) => b.size - a.size)
        .slice(0, 5)
        .forEach(file => {
          console.log(`   ${file.path}: ${file.sizeKB} KB`);
        });
    }
    
    return stats;
  } catch (error) {
    console.error('❌ Erreur lors de l\'analyse:', error.message);
    return null;
  }
}

// Fonction pour vérifier la configuration Next.js
function checkNextConfig() {
  console.log('\n🔧 Vérification de la configuration Next.js...');
  
  const configPath = path.join(process.cwd(), 'next.config.ts');
  
  if (fs.existsSync(configPath)) {
    const config = fs.readFileSync(configPath, 'utf8');
    
    const optimizations = [
      { name: 'SWC Minify', pattern: 'swcMinify:\\s*true' },
      { name: 'Compression', pattern: 'compress:\\s*true' },
      { name: 'Optimized Imports', pattern: 'optimizePackageImports' },
      { name: 'Webpack Optimizations', pattern: 'webpack:' },
      { name: 'Image Optimization', pattern: 'formats:' }
    ];
    
    let score = 0;
    optimizations.forEach(opt => {
      if (config.includes(opt.pattern)) {
        console.log(`   ✅ ${opt.name}`);
        score++;
      } else {
        console.log(`   ❌ ${opt.name} manquant`);
      }
    });
    
    console.log(`\n📈 Score d'optimisation: ${score}/${optimizations.length}`);
    
    if (score >= 4) {
      console.log('   🟢 Configuration excellente');
    } else if (score >= 2) {
      console.log('   🟡 Configuration correcte');
    } else {
      console.log('   🔴 Configuration à améliorer');
    }
    
    return score;
  } else {
    console.log('   ❌ Fichier next.config.ts non trouvé');
    return 0;
  }
}

// Fonction pour vérifier les variables d'environnement
function checkEnvironment() {
  console.log('\n🌍 Vérification de l\'environnement...');
  
  const envPath = path.join(process.cwd(), '.env.local');
  let envContent = '';
  
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
  }
  
  const envVars = [
    'NEXT_TELEMETRY_DISABLED=1',
    'NEXT_OPTIMIZE_FONTS=true',
    'NEXT_OPTIMIZE_IMAGES=true',
    'NEXT_DEV_FAST_REFRESH=true'
  ];
  
  let score = 0;
  envVars.forEach(var_ => {
    if (envContent.includes(var_)) {
      console.log(`   ✅ ${var_}`);
      score++;
    } else {
      console.log(`   ❌ ${var_} manquant`);
    }
  });
  
  console.log(`\n📈 Score environnement: ${score}/${envVars.length}`);
  return score;
}

// Fonction pour générer des recommandations
function generateRecommendations(projectStats, configScore, envScore) {
  console.log('\n💡 Recommandations pour améliorer le Fast Refresh:');
  
  if (configScore < 4) {
    console.log('   🔧 Optimiser la configuration Next.js');
  }
  
  if (envScore < 4) {
    console.log('   🌍 Configurer les variables d\'environnement');
  }
  
  if (projectStats && projectStats.totalFiles > 1000) {
    console.log('   📁 Projet volumineux - considérer la modularisation');
  }
  
  if (projectStats && projectStats.largeFiles.length > 0) {
    console.log('   📦 Optimiser les gros fichiers');
  }
  
  console.log('   🧹 Exécuter "npm run clean" pour nettoyer le cache');
  console.log('   ⚡ Utiliser "npm run dev:fast" pour un démarrage optimisé');
  console.log('   🔄 Redémarrer le serveur après les modifications');
}

// Test principal
async function runFastRefreshTests() {
  console.log('🚀 Test des performances du Fast Refresh\n');
  console.log('=' .repeat(50));
  
  try {
    // Analyse du projet
    const projectStats = analyzeProjectFiles();
    
    // Vérification de la configuration
    const configScore = checkNextConfig();
    
    // Vérification de l'environnement
    const envScore = checkEnvironment();
    
    // Génération des recommandations
    generateRecommendations(projectStats, configScore, envScore);
    
    // Résumé final
    console.log('\n' + '=' .repeat(50));
    console.log('📋 RÉSUMÉ DES PERFORMANCES');
    console.log('=' .repeat(50));
    
    const totalScore = configScore + envScore;
    const maxScore = 9; // 5 config + 4 env
    
    console.log(`Configuration Next.js: ${configScore}/5`);
    console.log(`Variables d'environnement: ${envScore}/4`);
    console.log(`Score total: ${totalScore}/${maxScore}`);
    
    if (totalScore >= 7) {
      console.log('\n🎉 EXCELLENT: Fast Refresh devrait être très rapide');
    } else if (totalScore >= 5) {
      console.log('\n👍 BON: Fast Refresh devrait être acceptable');
    } else {
      console.log('\n⚠️ MOYEN: Fast Refresh pourrait être lent');
    }
    
  } catch (error) {
    console.error('❌ Erreur lors des tests:', error.message);
  }
}

// Point d'entrée
runFastRefreshTests(); 
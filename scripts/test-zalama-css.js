#!/usr/bin/env node

/**
 * Script de test pour vérifier l'utilisation des variables CSS ZaLaMa
 * Ce script analyse les fichiers TypeScript/React pour s'assurer que
 * les variables CSS ZaLaMa sont utilisées au lieu des classes Tailwind hardcodées
 */

const fs = require('fs');
const path = require('path');

// Variables CSS ZaLaMa à vérifier
const ZALAMA_VARIABLES = [
  '--zalama-blue',
  '--zalama-blue-accent',
  '--zalama-success',
  '--zalama-warning',
  '--zalama-danger',
  '--zalama-green',
  '--zalama-red',
  '--zalama-bg-dark',
  '--zalama-bg-darker',
  '--zalama-bg-light',
  '--zalama-bg-lighter',
  '--zalama-header-blue',
  '--zalama-card',
  '--zalama-border',
  '--zalama-text',
  '--zalama-text-secondary',
  '--zalama-shadow'
];

// Classes Tailwind à éviter (couleurs hardcodées)
const HARDCODED_COLORS = [
  'bg-gray-',
  'text-gray-',
  'border-gray-',
  'bg-white',
  'text-white',
  'bg-black',
  'text-black',
  'bg-red-',
  'text-red-',
  'bg-green-',
  'text-green-',
  'bg-blue-',
  'text-blue-',
  'bg-yellow-',
  'text-yellow-',
  'bg-orange-',
  'text-orange-',
  'bg-purple-',
  'text-purple-',
  'bg-pink-',
  'text-pink-',
  'bg-indigo-',
  'text-indigo-',
  'bg-zinc-',
  'text-zinc-',
  'bg-slate-',
  'text-slate-'
];

// Fonction pour analyser un fichier
function analyzeFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const issues = [];
    
    lines.forEach((line, index) => {
      const lineNumber = index + 1;
      
      // Vérifier les classes Tailwind hardcodées
      HARDCODED_COLORS.forEach(colorClass => {
        if (line.includes(colorClass)) {
          issues.push({
            type: 'hardcoded_color',
            line: lineNumber,
            content: line.trim(),
            suggestion: `Remplacer par une variable CSS ZaLaMa appropriée`
          });
        }
      });
      
      // Vérifier l'utilisation des variables ZaLaMa
      const hasZalamaVariable = ZALAMA_VARIABLES.some(variable => 
        line.includes(`var(${variable})`)
      );
      
      // Si la ligne contient des couleurs mais pas de variables ZaLaMa
      if (!hasZalamaVariable && HARDCODED_COLORS.some(colorClass => line.includes(colorClass))) {
        issues.push({
          type: 'missing_zalama_variable',
          line: lineNumber,
          content: line.trim(),
          suggestion: `Utiliser une variable CSS ZaLaMa au lieu d'une couleur hardcodée`
        });
      }
    });
    
    return issues;
  } catch (error) {
    console.error(`Erreur lors de l'analyse de ${filePath}:`, error.message);
    return [];
  }
}

// Fonction pour parcourir récursivement les dossiers
function walkDir(dir, fileExtensions = ['.tsx', '.ts', '.jsx', '.js']) {
  let results = [];
  const list = fs.readdirSync(dir);
  
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat && stat.isDirectory()) {
      // Ignorer les dossiers node_modules et .git
      if (file !== 'node_modules' && file !== '.git' && !file.startsWith('.')) {
        results = results.concat(walkDir(filePath, fileExtensions));
      }
    } else {
      // Vérifier l'extension du fichier
      const ext = path.extname(file);
      if (fileExtensions.includes(ext)) {
        results.push(filePath);
      }
    }
  });
  
  return results;
}

// Fonction principale
function main() {
  console.log('🔍 Analyse de l\'utilisation des variables CSS ZaLaMa...\n');
  
  const componentsDir = path.join(__dirname, '..', 'components');
  const appDir = path.join(__dirname, '..', 'app');
  
  const allFiles = [
    ...walkDir(componentsDir),
    ...walkDir(appDir)
  ];
  
  let totalIssues = 0;
  let filesWithIssues = 0;
  
  allFiles.forEach(filePath => {
    const issues = analyzeFile(filePath);
    
    if (issues.length > 0) {
      filesWithIssues++;
      const relativePath = path.relative(process.cwd(), filePath);
      console.log(`📁 ${relativePath}:`);
      
      issues.forEach(issue => {
        totalIssues++;
        console.log(`  ❌ Ligne ${issue.line}: ${issue.type}`);
        console.log(`     Contenu: ${issue.content}`);
        console.log(`     Suggestion: ${issue.suggestion}\n`);
      });
    }
  });
  
  // Résumé
  console.log('📊 Résumé de l\'analyse:');
  console.log(`   Fichiers analysés: ${allFiles.length}`);
  console.log(`   Fichiers avec problèmes: ${filesWithIssues}`);
  console.log(`   Total des problèmes: ${totalIssues}`);
  
  if (totalIssues === 0) {
    console.log('\n✅ Tous les composants utilisent correctement les variables CSS ZaLaMa !');
  } else {
    console.log('\n⚠️  Certains composants utilisent encore des couleurs hardcodées.');
    console.log('   Consultez les suggestions ci-dessus pour les corriger.');
  }
  
  // Statistiques d'utilisation des variables ZaLaMa
  console.log('\n📈 Statistiques d\'utilisation des variables ZaLaMa:');
  const usageStats = {};
  
  allFiles.forEach(filePath => {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      ZALAMA_VARIABLES.forEach(variable => {
        const matches = content.match(new RegExp(`var\\(${variable}\\)`, 'g'));
        if (matches) {
          usageStats[variable] = (usageStats[variable] || 0) + matches.length;
        }
      });
    } catch (error) {
      // Ignorer les erreurs de lecture
    }
  });
  
  Object.entries(usageStats)
    .sort(([,a], [,b]) => b - a)
    .forEach(([variable, count]) => {
      console.log(`   ${variable}: ${count} utilisations`);
    });
}

// Exécuter le script
if (require.main === module) {
  main();
}

module.exports = { analyzeFile, walkDir, ZALAMA_VARIABLES, HARDCODED_COLORS }; 
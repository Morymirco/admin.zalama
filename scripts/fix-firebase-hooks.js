const fs = require('fs');
const path = require('path');

// Liste des fichiers à corriger
const filesToFix = [
  'components/dashboard/StatistiquesUtilisateurs.tsx',
  'components/dashboard/DonneesUtilisateurs.tsx',
  'components/dashboard/PerformanceFinanciere.tsx',
  'app/dashboard/(dashboard)/finances/page.tsx',
  'app/dashboard/(dashboard)/alertes/page.tsx'
];

// Mappings des imports et services
const replacements = [
  {
    from: "import { useFirebaseCollection } from '@/hooks/useFirebaseCollection';",
    to: "import { useSupabaseCollection } from '@/hooks/useSupabaseCollection';"
  },
  {
    from: "import userService from '@/services/userService';",
    to: "import { userService } from '@/services/userService';"
  },
  {
    from: "import partenaireService from '@/services/partenaireService';",
    to: "import { partenaireService } from '@/services/partenaireService';"
  },
  {
    from: "import transactionService from '@/services/transactionService';",
    to: "import { transactionService } from '@/services/transactionService';"
  },
  {
    from: "import alerteService from '@/services/alerteService';",
    to: "import { alerteService } from '@/services/alerteService';"
  },
  {
    from: "import salaryAdvanceService from '@/services/salaryAdvanceService';",
    to: "import { salaryAdvanceService } from '@/services/salaryAdvanceService';"
  }
];

// Fonction pour corriger un fichier
function fixFile(filePath) {
  try {
    const fullPath = path.join(process.cwd(), filePath);
    
    if (!fs.existsSync(fullPath)) {
      console.log(`❌ Fichier non trouvé: ${filePath}`);
      return false;
    }

    let content = fs.readFileSync(fullPath, 'utf8');
    let modified = false;

    // Remplacer les imports
    replacements.forEach(replacement => {
      if (content.includes(replacement.from)) {
        content = content.replace(replacement.from, replacement.to);
        modified = true;
        console.log(`✅ Remplacé dans ${filePath}: ${replacement.from} -> ${replacement.to}`);
      }
    });

    // Remplacer useFirebaseCollection par useSupabaseCollection
    if (content.includes('useFirebaseCollection')) {
      content = content.replace(/useFirebaseCollection/g, 'useSupabaseCollection');
      modified = true;
      console.log(`✅ Remplacé useFirebaseCollection par useSupabaseCollection dans ${filePath}`);
    }

    // Remplacer les propriétés Firebase par Supabase
    const propertyReplacements = [
      { from: 'user.active', to: 'user.actif' },
      { from: 'user.createdAt', to: 'user.created_at' },
      { from: 'p.dateCreation', to: 'p.created_at' },
      { from: 'p.totalEmployes', to: 'p.nombre_employes' }
    ];

    propertyReplacements.forEach(replacement => {
      if (content.includes(replacement.from)) {
        content = content.replace(new RegExp(replacement.from, 'g'), replacement.to);
        modified = true;
        console.log(`✅ Remplacé propriété dans ${filePath}: ${replacement.from} -> ${replacement.to}`);
      }
    });

    // Supprimer les imports Firebase non utilisés
    const firebaseImports = [
      "import { where, orderBy, Timestamp } from 'firebase/firestore';",
      "import { where, Timestamp } from 'firebase/firestore';",
      "import { where } from 'firebase/firestore';",
      "import { Timestamp } from 'firebase/firestore';"
    ];

    firebaseImports.forEach(importStatement => {
      if (content.includes(importStatement)) {
        content = content.replace(importStatement, '');
        modified = true;
        console.log(`✅ Supprimé import Firebase dans ${filePath}: ${importStatement}`);
      }
    });

    if (modified) {
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`✅ Fichier corrigé: ${filePath}`);
      return true;
    } else {
      console.log(`ℹ️  Aucune modification nécessaire: ${filePath}`);
      return false;
    }

  } catch (error) {
    console.error(`❌ Erreur lors de la correction de ${filePath}:`, error.message);
    return false;
  }
}

// Fonction principale
function main() {
  console.log('🔧 Correction des hooks Firebase vers Supabase...\n');

  let fixedCount = 0;
  let totalFiles = filesToFix.length;

  filesToFix.forEach(filePath => {
    if (fixFile(filePath)) {
      fixedCount++;
    }
  });

  console.log(`\n📊 Résumé:`);
  console.log(`- Fichiers traités: ${totalFiles}`);
  console.log(`- Fichiers corrigés: ${fixedCount}`);
  console.log(`- Fichiers inchangés: ${totalFiles - fixedCount}`);

  if (fixedCount > 0) {
    console.log('\n✅ Correction terminée avec succès !');
  } else {
    console.log('\nℹ️  Aucune correction nécessaire.');
  }
}

// Exécuter le script
main(); 
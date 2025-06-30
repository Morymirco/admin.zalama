const { validateEmail } = require('../lib/utils');

// Fonction de validation complète des données de partenaire
function validatePartnerData(data) {
  const errors = [];
  const warnings = [];

  // Validation du nom
  if (!data.nom || data.nom.trim().length === 0) {
    errors.push('Le nom du partenaire est requis');
  } else if (data.nom.trim().length < 2) {
    errors.push('Le nom du partenaire doit contenir au moins 2 caractères');
  }

  // Validation de l'email principal
  if (!data.email) {
    errors.push('L\'email principal est requis');
  } else if (!validateEmail(data.email)) {
    errors.push('Format d\'email principal invalide');
  }

  // Validation du téléphone principal
  if (!data.telephone) {
    errors.push('Le téléphone principal est requis');
  } else if (!/^\+?[0-9\s\-\(\)]{8,}$/.test(data.telephone)) {
    warnings.push('Format de téléphone principal suspect');
  }

  // Validation du type
  const validTypes = ['PME', 'Grande Entreprise', 'ONG', 'Institution Publique', 'Autre'];
  if (!data.type) {
    errors.push('Le type de partenaire est requis');
  } else if (!validTypes.includes(data.type)) {
    errors.push(`Type invalide. Types acceptés: ${validTypes.join(', ')}`);
  }

  // Validation du secteur
  if (!data.secteur) {
    errors.push('Le secteur d\'activité est requis');
  }

  // Validation du représentant
  if (data.email_representant) {
    if (!validateEmail(data.email_representant)) {
      errors.push('Format d\'email du représentant invalide');
    }
    if (!data.nom_representant) {
      errors.push('Le nom du représentant est requis si l\'email est fourni');
    }
    if (!data.telephone_representant) {
      warnings.push('Téléphone du représentant recommandé');
    }
  }

  // Validation du RH
  if (data.email_rh) {
    if (!validateEmail(data.email_rh)) {
      errors.push('Format d\'email du RH invalide');
    }
    if (!data.nom_rh) {
      errors.push('Le nom du RH est requis si l\'email est fourni');
    }
    if (!data.telephone_rh) {
      warnings.push('Téléphone du RH recommandé');
    }
  }

  // Vérification des doublons d'email
  const emails = [data.email, data.email_representant, data.email_rh].filter(Boolean);
  const uniqueEmails = new Set(emails);
  if (emails.length !== uniqueEmails.size) {
    errors.push('Les adresses email doivent être uniques');
  }

  // Validation de l'adresse
  if (!data.adresse || data.adresse.trim().length === 0) {
    warnings.push('Adresse recommandée');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    hasWarnings: warnings.length > 0
  };
}

// Fonction pour nettoyer les données
function cleanPartnerData(data) {
  return {
    nom: data.nom?.trim(),
    description: data.description?.trim(),
    type: data.type?.trim(),
    secteur: data.secteur?.trim(),
    adresse: data.adresse?.trim(),
    telephone: data.telephone?.trim(),
    email: data.email?.trim().toLowerCase(),
    nom_representant: data.nom_representant?.trim(),
    telephone_representant: data.telephone_representant?.trim(),
    email_representant: data.email_representant?.trim().toLowerCase(),
    nom_rh: data.nom_rh?.trim(),
    telephone_rh: data.telephone_rh?.trim(),
    email_rh: data.email_rh?.trim().toLowerCase(),
    actif: data.actif !== undefined ? data.actif : true
  };
}

// Test de validation
function testValidation() {
  console.log('🧪 Test de validation des données de partenaire\n');

  const testCases = [
    {
      name: 'Données valides',
      data: {
        nom: 'Entreprise Test',
        email: 'test@entreprise.com',
        telephone: '+224625212115',
        type: 'PME',
        secteur: 'Technologie',
        nom_representant: 'John Doe',
        email_representant: 'john@entreprise.com',
        telephone_representant: '+224625212115',
        nom_rh: 'Jane Smith',
        email_rh: 'jane@entreprise.com',
        telephone_rh: '+224625212115',
        adresse: 'Conakry, Guinée'
      }
    },
    {
      name: 'Données invalides',
      data: {
        nom: '',
        email: 'email-invalide',
        telephone: '123',
        type: 'Type Invalide',
        email_representant: 'john@entreprise.com',
        email_rh: 'john@entreprise.com' // Doublon
      }
    },
    {
      name: 'Données partielles',
      data: {
        nom: 'Entreprise Partielle',
        email: 'partial@entreprise.com',
        telephone: '+224625212115',
        type: 'PME',
        secteur: 'Technologie'
      }
    }
  ];

  testCases.forEach((testCase, index) => {
    console.log(`${index + 1}. ${testCase.name}:`);
    
    const cleanedData = cleanPartnerData(testCase.data);
    const validation = validatePartnerData(cleanedData);
    
    console.log('   Données nettoyées:', cleanedData);
    console.log('   Valide:', validation.isValid);
    
    if (validation.errors.length > 0) {
      console.log('   ❌ Erreurs:', validation.errors);
    }
    
    if (validation.warnings.length > 0) {
      console.log('   ⚠️ Avertissements:', validation.warnings);
    }
    
    console.log('');
  });
}

// Exporter les fonctions
module.exports = {
  validatePartnerData,
  cleanPartnerData,
  testValidation
};

// Exécuter le test si le script est appelé directement
if (require.main === module) {
  testValidation();
} 
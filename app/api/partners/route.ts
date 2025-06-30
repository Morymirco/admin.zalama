import { NextRequest, NextResponse } from 'next/server';
import partenaireService from '@/services/partenaireService';
import { validateEmail } from '@/lib/utils';

// Fonction de validation des données de partenaire
function validatePartnerData(data: any) {
  const errors: string[] = [];
  const warnings: string[] = [];

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
function cleanPartnerData(data: any) {
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
    actif: data.actif !== undefined ? data.actif : true,
    // Champs obligatoires avec valeurs par défaut
    date_adhesion: data.date_adhesion || new Date().toISOString().split('T')[0],
    nombre_employes: data.nombre_employes || 0,
    salaire_net_total: data.salaire_net_total || 0,
    // Champs optionnels
    rccm: data.rccm?.trim(),
    nif: data.nif?.trim(),
    site_web: data.site_web?.trim(),
    logo_url: data.logo_url?.trim()
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const searchTerm = searchParams.get('search');
    const type = searchParams.get('type');
    const active = searchParams.get('active');

    let partenaires;

    if (searchTerm) {
      partenaires = await partenaireService.search(searchTerm);
    } else if (type) {
      partenaires = await partenaireService.getByType(type);
    } else if (active === 'true') {
      partenaires = await partenaireService.getActive();
    } else if (active === 'false') {
      partenaires = await partenaireService.getInactive();
    } else {
      partenaires = await partenaireService.getAll();
    }

    return NextResponse.json({
      success: true,
      partenaires,
      count: partenaires.length
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des partenaires:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des partenaires' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Nettoyer et valider les données
    const cleanedData = cleanPartnerData(body);
    const validation = validatePartnerData(cleanedData);

    if (!validation.isValid) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Données invalides',
          details: validation.errors,
          warnings: validation.warnings
        },
        { status: 400 }
      );
    }

    // Créer le partenaire
    const result = await partenaireService.create(cleanedData);

    return NextResponse.json({
      success: true,
      partenaire: result.partenaire,
      smsResults: result.smsResults,
      emailResults: result.emailResults,
      accountResults: result.accountResults,
      message: 'Partenaire créé avec succès'
    }, { status: 201 });

  } catch (error) {
    console.error('Erreur lors de la création du partenaire:', error);
    
    // Détecter les erreurs spécifiques
    if (error instanceof Error) {
      if (error.message.includes('duplicate') || error.message.includes('already exists')) {
        return NextResponse.json(
          { success: false, error: 'Un partenaire avec ces informations existe déjà' },
          { status: 409 }
        );
      }
    }
    
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la création du partenaire' },
      { status: 500 }
    );
  }
} 
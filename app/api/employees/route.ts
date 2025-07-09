import { NextRequest, NextResponse } from 'next/server';
import { cleanEmployeeData, validateEmployeeData, generatePassword } from '@/lib/utils';
import { createClient } from '@supabase/supabase-js';
import employeeService from '@/services/employeeService';

const supabaseUrl = 'https://mspmrzlqhwpdkkburjiw.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zcG1yemxxaHdwZGtrYnVyaml3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDc4NzI1OCwiZXhwIjoyMDY2MzYzMjU4fQ.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includePhone = searchParams.get('includePhone') === 'true';
    const partnerId = searchParams.get('partner_id') || searchParams.get('partnerId');
    const active = searchParams.get('active');
    const search = searchParams.get('search');

    console.log('🔍 Paramètres de recherche:', { partnerId, active, search, includePhone });

    let query = supabase
      .from('employees')
      .select(`
        *,
        partners:partner_id (
          id,
          nom
        )
      `);

    // Filtrer par partenaire si spécifié
    if (partnerId) {
      query = query.eq('partner_id', partnerId);
    }

    // Filtrer par statut actif si spécifié
    if (active !== null) {
      query = query.eq('actif', active === 'true');
    }

    // Recherche textuelle si spécifiée
    if (search) {
      query = query.or(`nom.ilike.%${search}%,prenom.ilike.%${search}%,email.ilike.%${search}%,poste.ilike.%${search}%`);
    }

    // Filtrer les employés avec téléphone si demandé
    if (includePhone) {
      query = query.not('telephone', 'is', null);
    }

    const { data: employees, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Erreur lors de la récupération des employés:', error);
      return NextResponse.json(
        { success: false, error: 'Erreur lors de la récupération des employés' },
        { status: 500 }
      );
    }

    console.log(`📊 ${employees?.length || 0} employés trouvés`);

    // Si c'est pour la sélection (includePhone), formater différemment
    if (includePhone) {
      const formattedEmployees = employees?.map(employee => ({
        id: employee.id,
        label: `${employee.prenom} ${employee.nom} (${employee.partners?.nom || 'Partenaire inconnu'})`,
        value: employee.telephone,
        nom: employee.nom,
        prenom: employee.prenom,
        email: employee.email,
        telephone: employee.telephone,
        poste: employee.poste,
        partenaire_nom: employee.partners?.nom || 'Partenaire inconnu'
      })) || [];

      return NextResponse.json({
        success: true,
        employees: formattedEmployees,
        count: formattedEmployees.length
      });
    }

    // Sinon, retourner les employés complets
    return NextResponse.json({
      success: true,
      employees: employees || [],
      count: employees?.length || 0
    });

  } catch (error) {
    console.error('Erreur générale lors de la récupération des employés:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur inattendue'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('📝 Données reçues pour création employé:', body);

    // Nettoyer et valider les données
    const cleanedData = cleanEmployeeData(body);
    const validation = validateEmployeeData(cleanedData);

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

    // Utiliser le service employeeService corrigé
    console.log('🔄 Création de l\'employé avec employeeService...');
    
    try {
      const result = await employeeService.create(cleanedData);
      
      console.log('✅ Employé créé avec succès via employeeService');
      console.log('📊 Résultats:');
      console.log('  - Employé ID:', result.employee.id);
      console.log('  - User ID:', result.employee.user_id);
      console.log('  - Compte créé:', result.accountResults.employe.success);

      return NextResponse.json({
        success: true,
        employee: result.employee,
        smsResults: result.smsResults,
        emailResults: result.emailResults,
        accountResults: result.accountResults,
        message: 'Employé créé avec succès'
      }, { status: 201 });

    } catch (serviceError) {
      console.error('❌ Erreur employeeService.create:', serviceError);
      
      // Gérer les erreurs spécifiques
      if (serviceError instanceof Error) {
        const errorMessage = serviceError.message;
        
        // Email déjà existant
        if (errorMessage.includes('already been registered') || errorMessage.includes('email_exists')) {
          return NextResponse.json(
            { 
              success: false, 
              error: 'Un compte avec cet email existe déjà. Veuillez utiliser un email différent ou réinitialiser le mot de passe du compte existant.',
              code: 'EMAIL_EXISTS'
            },
            { status: 409 }
          );
        }
        
        // Email obligatoire
        if (errorMessage.includes('Email obligatoire')) {
          return NextResponse.json(
            { 
              success: false, 
              error: 'Email obligatoire pour créer un employé avec un compte de connexion',
              code: 'EMAIL_REQUIRED'
            },
            { status: 400 }
          );
        }
        
        // Erreur de création de compte
        if (errorMessage.includes('Impossible de créer le compte de connexion')) {
          return NextResponse.json(
            { 
              success: false, 
              error: 'Impossible de créer le compte de connexion. Veuillez réessayer.',
              code: 'AUTH_ERROR'
            },
            { status: 500 }
          );
        }
        
        // Erreur de création d'employé
        if (errorMessage.includes('user_id manquant')) {
          return NextResponse.json(
            { 
              success: false, 
              error: 'Erreur lors de la création du compte. Veuillez réessayer.',
              code: 'USER_ID_ERROR'
            },
            { status: 500 }
          );
        }
      }
      
      // Erreur générique
      return NextResponse.json(
        { 
          success: false, 
          error: 'Erreur lors de la création de l\'employé. Veuillez réessayer.',
          code: 'GENERAL_ERROR'
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Erreur générale lors de la création de l\'employé:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur interne du serveur',
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    );
  }
} 
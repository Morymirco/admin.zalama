import { NextRequest, NextResponse } from 'next/server';
import employeeService from '@/services/employeeService';
import { cleanEmployeeData, validateEmployeeData } from '@/lib/utils';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mspmrzlqhwpdkkburjiw.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zcG1yemxxaHdwZGtrYnVyaml3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDc4NzI1OCwiZXhwIjoyMDY2MzYzMjU4fQ.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includePhone = searchParams.get('includePhone') === 'true';
    const partnerId = searchParams.get('partnerId');
    const active = searchParams.get('active');

    let query = supabase
      .from('employees')
      .select(`
        id,
        nom,
        prenom,
        email,
        telephone,
        poste,
        actif,
        partner_id,
        partners!inner(nom as partenaire_nom)
      `);

    // Filtrer par partenaire si spécifié
    if (partnerId) {
      query = query.eq('partner_id', partnerId);
    }

    // Filtrer par statut actif si spécifié
    if (active !== null) {
      query = query.eq('actif', active === 'true');
    }

    // Filtrer les employés avec téléphone si demandé
    if (includePhone) {
      query = query.not('telephone', 'is', null);
    }

    const { data: employees, error } = await query.order('nom', { ascending: true });

    if (error) {
      console.error('Erreur lors de la récupération des employés:', error);
      return NextResponse.json(
        { success: false, error: 'Erreur lors de la récupération des employés' },
        { status: 500 }
      );
    }

    // Formater les données pour la sélection
    const formattedEmployees = employees?.map(employee => ({
      id: employee.id,
      label: `${employee.prenom} ${employee.nom} (${employee.partenaire_nom})`,
      value: employee.telephone,
      nom: employee.nom,
      prenom: employee.prenom,
      email: employee.email,
      telephone: employee.telephone,
      poste: employee.poste,
      partenaire_nom: employee.partenaire_nom
    })) || [];

    return NextResponse.json({
      success: true,
      employees: formattedEmployees,
      count: formattedEmployees.length
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

    // Créer l'employé avec le nouveau service
    const result = await employeeService.create(cleanedData);

    console.log('📊 Résultat création employé:', result);

    return NextResponse.json({
      success: true,
      employe: result.employee,
      smsResults: result.smsResults,
      emailResults: result.emailResults,
      accountResults: result.accountResults,
      message: 'Employé créé avec succès'
    }, { status: 201 });

  } catch (error) {
    console.error('Erreur lors de la création de l\'employé:', error);
    
    // Détecter les erreurs spécifiques
    if (error instanceof Error) {
      if (error.message.includes('duplicate') || error.message.includes('already exists')) {
        return NextResponse.json(
          { success: false, error: 'Un employé avec ces informations existe déjà' },
          { status: 409 }
        );
      }
    }
    
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la création de l\'employé' },
      { status: 500 }
    );
  }
} 
import { NextRequest, NextResponse } from 'next/server';
import employeeService from '@/services/employeeService';
import { cleanEmployeeData, validateEmployeeData } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const partnerId = searchParams.get('partner_id');
    const search = searchParams.get('search');

    let employees;

    if (search) {
      employees = await employeeService.search(search);
    } else if (partnerId) {
      employees = await employeeService.getByPartner(partnerId);
    } else {
      employees = await employeeService.getAll();
    }

    return NextResponse.json({
      success: true,
      employees,
      count: employees.length
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des employés:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des employés' },
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
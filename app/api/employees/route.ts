import { NextRequest, NextResponse } from 'next/server';
import employeeService from '@/services/employeeService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const searchTerm = searchParams.get('search');
    const partnerId = searchParams.get('partner_id');

    let employees;

    if (searchTerm) {
      employees = await employeeService.search(searchTerm, partnerId || undefined);
    } else if (partnerId) {
      employees = await employeeService.getByPartnerId(partnerId);
    } else {
      return NextResponse.json(
        { success: false, error: 'Paramètre partner_id requis' },
        { status: 400 }
      );
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

    // Créer l'employé avec le nouveau service
    const result = await employeeService.createEmployee(body);

    console.log('📊 Résultat création employé:', result);

    if (!result.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: result.error
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      employee: result.employee,
      password: result.account?.password,
      sms: result.sms,
      email: result.email,
      message: 'Employé créé avec succès'
    }, { status: 201 });

  } catch (error) {
    console.error('Erreur lors de la création de l\'employé:', error);
    
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la création de l\'employé' },
      { status: 500 }
    );
  }
} 
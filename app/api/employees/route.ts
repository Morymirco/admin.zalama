import { NextRequest, NextResponse } from 'next/server';
import { employeeService } from '@/services/employeeService';
import { employeeSyncService } from '@/services/employeeSyncService';
import { smsService } from '@/services/smsService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const searchTerm = searchParams.get('search');
    const partnerId = searchParams.get('partner_id');

    let employees;

    if (searchTerm) {
      employees = await employeeService.search(searchTerm, partnerId || undefined);
    } else if (partnerId) {
      employees = await employeeService.getByPartner(partnerId);
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

    // Créer l'employé avec le service de synchronisation
    const result = await employeeSyncService.createEmployeeWithAuth(body);

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

    // Envoyer un SMS avec les identifiants si le téléphone est fourni
    let smsResult = null;
    if (body.telephone && result.password) {
      try {
        const smsMessage = `Bonjour ${body.prenom} ${body.nom}, votre compte ZaLaMa a été créé.\nEmail: ${body.email}\nMot de passe: ${result.password}\nConnectez-vous sur l'application ZaLaMa.`;
        
        smsResult = await smsService.sendSMS({
          to: [body.telephone],
          message: smsMessage
        });
      } catch (smsError) {
        console.error('Erreur lors de l\'envoi du SMS:', smsError);
        smsResult = {
          success: false,
          error: 'Erreur lors de l\'envoi du SMS'
        };
      }
    }

    return NextResponse.json({
      success: true,
      employe: {
        id: result.employeeId,
        ...body,
        user_id: result.userId
      },
      account: {
        success: result.success,
        password: result.password,
        error: result.error
      },
      sms: smsResult,
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
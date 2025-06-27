import { NextRequest, NextResponse } from 'next/server';
import smsService from '@/services/smsService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { testType = 'simple', phoneNumber, message } = body;

    console.log('🧪 Test SMS - Type:', testType);
    console.log('📱 Numéro original:', phoneNumber);
    console.log('💬 Message:', message);

    // Validation du numéro de téléphone
    if (!phoneNumber) {
      return NextResponse.json(
        { error: 'Le numéro de téléphone est requis' },
        { status: 400 }
      );
    }

    let result;

    try {
      switch (testType) {
        case 'simple':
          // Test simple avec l'API SMS
          result = await smsService.sendSMS({
            to: [phoneNumber],
            message: message || 'Test SMS ZaLaMa - ' + new Date().toLocaleString('fr-FR')
          });
          break;

        case 'welcome_representant':
          // Test SMS de bienvenue représentant
          result = await smsService.sendWelcomeSMSToRepresentant(
            'Entreprise Test',
            'John Doe',
            phoneNumber,
            'john.doe@test.com'
          );
          break;

        case 'welcome_rh':
          // Test SMS de bienvenue RH
          result = await smsService.sendWelcomeSMSToRH(
            'Entreprise Test',
            'Jane Smith',
            phoneNumber,
            'jane.smith@test.com'
          );
          break;

        case 'partner_creation':
          // Test notification création partenaire
          result = await smsService.sendPartnerCreationNotification(
            'Nouvelle Entreprise',
            'Entreprise',
            'Technologie'
          );
          break;

        case 'welcome_employee':
          // Test SMS de bienvenue employé avec identifiants
          result = await smsService.sendWelcomeSMSToEmployee(
            'Doe',
            'John',
            phoneNumber,
            'john.doe@test.com',
            'MotDePasse123!'
          );
          break;

        default:
          return NextResponse.json(
            { error: 'Type de test non reconnu' },
            { status: 400 }
          );
      }

      console.log('✅ Test SMS réussi:', result);

      return NextResponse.json({
        success: true,
        message: 'Test SMS réussi',
        result: result,
        phoneNumber: phoneNumber
      });

    } catch (smsError) {
      console.error('❌ Erreur lors de l\'envoi SMS:', smsError);
      
      let smsErrorMessage = 'Erreur SMS inconnue';
      if (smsError instanceof Error) {
        smsErrorMessage = smsError.message;
      } else if (typeof smsError === 'string') {
        smsErrorMessage = smsError;
      } else if (smsError && typeof smsError === 'object') {
        if ('message' in smsError) {
          smsErrorMessage = String(smsError.message);
        } else if ('error' in smsError) {
          smsErrorMessage = String(smsError.error);
        } else {
          smsErrorMessage = JSON.stringify(smsError);
        }
      }

      return NextResponse.json(
        { 
          success: false, 
          error: `Erreur lors de l'envoi SMS: ${smsErrorMessage}`,
          phoneNumber: phoneNumber
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('❌ Erreur générale test SMS:', error);
    
    let errorMessage = 'Erreur inconnue';
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    } else if (error && typeof error === 'object') {
      if ('message' in error) {
        errorMessage = String(error.message);
      } else if ('error' in error) {
        errorMessage = String(error.error);
      } else {
        errorMessage = JSON.stringify(error);
      }
    }

    return NextResponse.json(
      { 
        success: false, 
        error: `Erreur générale: ${errorMessage}`,
        phoneNumber: phoneNumber || 'Non fourni'
      },
      { status: 500 }
    );
  }
}

// Route GET pour tester le solde
export async function GET() {
  try {
    const balance = await smsService.checkBalance();
    
    return NextResponse.json({
      success: true,
      balance: balance
    });
  } catch (error) {
    console.error('❌ Erreur vérification solde:', error);
    
    let errorMessage = 'Erreur inconnue';
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    } else if (error && typeof error === 'object') {
      if ('message' in error) {
        errorMessage = String(error.message);
      } else if ('error' in error) {
        errorMessage = String(error.error);
      } else {
        errorMessage = JSON.stringify(error);
      }
    }

    return NextResponse.json(
      { 
        success: false, 
        error: `Erreur lors de la vérification du solde: ${errorMessage}`
      },
      { status: 500 }
    );
  }
} 
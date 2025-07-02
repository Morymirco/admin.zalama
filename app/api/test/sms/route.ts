import { NextRequest, NextResponse } from 'next/server';
import smsService from '@/services/smsService';

export async function POST(request: NextRequest) {
  try {
    const { to, message } = await request.json();

    if (!to || !message) {
      return NextResponse.json(
        { success: false, error: 'Numéro de téléphone et message requis' },
        { status: 400 }
      );
    }

    console.log('📱 Test SMS - Envoi vers:', to);
    console.log('📱 Test SMS - Message:', message);

    const result = await smsService.sendSMS({
      to: [to],
      message: message,
    });

    console.log('📱 Test SMS - Résultat:', result);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'SMS envoyé avec succès',
        response: result.response
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.error || 'Erreur lors de l\'envoi du SMS',
        message: result.message
      }, { status: 500 });
    }

  } catch (error) {
    console.error('❌ Erreur API test SMS:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
      message: 'Erreur lors de l\'envoi du SMS'
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    // Vérifier le solde du compte SMS
    const balance = await smsService.checkBalance();
    
    return NextResponse.json({
      success: true,
      balance: balance.balance,
      message: 'Solde vérifié avec succès'
    });
  } catch (error) {
    console.error('❌ Erreur vérification solde SMS:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
      message: 'Erreur lors de la vérification du solde'
    }, { status: 500 });
  }
} 
import { NextRequest, NextResponse } from 'next/server';
import smsService from '@/services/smsService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;

    switch (action) {
      case 'send_test':
        // Envoyer un SMS de test
        const result = await smsService.sendSMS({
          to: [data.phone],
          message: data.message || 'Test SMS de ZaLaMa - ' + new Date().toLocaleString('fr-FR'),
        });
        return NextResponse.json({ success: true, data: result });

      case 'check_balance':
        // Vérifier le solde
        const balance = await smsService.checkBalance();
        return NextResponse.json({ success: true, data: balance });

      case 'list_messages':
        // Lister les messages
        const messages = await smsService.listMessages(data.limit || 10);
        return NextResponse.json({ success: true, data: messages });

      case 'send_welcome_representant':
        // Envoyer SMS de bienvenue au représentant
        const welcomeRep = await smsService.sendWelcomeSMSToRepresentant(
          data.nomPartenaire,
          data.nomRepresentant,
          data.telephoneRepresentant,
          data.emailRepresentant
        );
        return NextResponse.json({ success: true, data: welcomeRep });

      case 'send_welcome_rh':
        // Envoyer SMS de bienvenue au RH
        const welcomeRH = await smsService.sendWelcomeSMSToRH(
          data.nomPartenaire,
          data.nomRH,
          data.telephoneRH,
          data.emailRH
        );
        return NextResponse.json({ success: true, data: welcomeRH });

      case 'send_verification':
        // Envoyer SMS de vérification
        const verification = await smsService.sendVerificationSMS({
          to: data.phone,
          message: data.message,
          expiry_time: data.expiry_time || 5,
        });
        return NextResponse.json({ success: true, data: verification });

      case 'verify_code':
        // Vérifier un code
        const verifyResult = await smsService.verifyCode(data.verificationId, data.code);
        return NextResponse.json({ success: true, data: verifyResult });

      default:
        return NextResponse.json(
          { success: false, error: 'Action non reconnue' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Erreur dans l\'API SMS:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Erreur inconnue' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Vérifier le solde par défaut
    const balance = await smsService.checkBalance();
    return NextResponse.json({ success: true, data: balance });
  } catch (error) {
    console.error('Erreur lors de la vérification du solde:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Erreur inconnue' },
      { status: 500 }
    );
  }
} 
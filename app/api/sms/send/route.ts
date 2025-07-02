import { NextRequest, NextResponse } from 'next/server';
import { Client } from 'nimbasms';

// Configuration Nimba SMS côté serveur
const config = {
  SERVICE_ID: process.env.NIMBA_SMS_SERVICE_ID || '9d83d5b67444c654c702f109dd837167',
  SECRET_TOKEN: process.env.NIMBA_SMS_SECRET_TOKEN || 'qf_bpb4CVfEalTU5eVEFC05wpoqlo17M-mozkZVbIHT_3xfOIjB7Oac-lkXZ6Pg2VqO2LXVy6BUlYTZe73y411agSC0jVh3OcOU92s8Rplc',
};

const client = new Client(config);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { to, message, sender_name = 'ZaLaMa' } = body;

    if (!to || !message) {
      return NextResponse.json(
        { success: false, error: 'Paramètres manquants: to et message sont requis' },
        { status: 400 }
      );
    }

    console.log('📱 Envoi SMS via API route:', { to, message, sender_name });

    // S'assurer que 'to' est un tableau
    const toArray = Array.isArray(to) ? to : [to];
    
    // Envoyer le SMS via le client Nimba SMS
    const response = await client.messages.create({
      to: toArray,
      message: message,
      sender_name: sender_name,
    });

    console.log('✅ SMS envoyé avec succès:', response);

    return NextResponse.json({
      success: true,
      response: response,
      message: 'SMS envoyé avec succès'
    });

  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi du SMS:', error);
    
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
        error: errorMessage,
        message: 'SMS non envoyé'
      },
      { status: 500 }
    );
  }
}

// Route pour vérifier le solde
export async function GET() {
  try {
    const account = await client.accounts.get();
    
    return NextResponse.json({
      success: true,
      balance: account.balance
    });
  } catch (error) {
    console.error('Erreur lors de la vérification du solde:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur lors de la vérification du solde' 
      },
      { status: 500 }
    );
  }
} 
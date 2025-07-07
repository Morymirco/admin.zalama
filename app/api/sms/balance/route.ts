import { NextResponse } from 'next/server';
import { Client } from 'nimbasms';

// Configuration Nimba SMS côté serveur
const config = {
  SERVICE_ID: process.env.NIMBA_SMS_SERVICE_ID || '9d83d5b67444c654c702f109dd837167',
  SECRET_TOKEN: process.env.NIMBA_SMS_SECRET_TOKEN || 'qf_bpb4CVfEalTU5eVEFC05wpoqlo17M-mozkZVbIHT_3xfOIjB7Oac-lkXZ6Pg2VqO2LXVy6BUlYTZe73y411agSC0jVh3OcOU92s8Rplc',
};

const client = new Client(config);

export async function GET() {
  try {
    console.log('💰 Vérification du solde SMS via API route');

    // Vérifier le solde via le client Nimba SMS
    const account = await client.accounts.get();
    
    console.log('✅ Solde du compte SMS:', account.balance);

    return NextResponse.json({
      success: true,
      balance: {
        balance: account.balance,
        currency: account.currency || 'GNF'
      },
      message: 'Solde récupéré avec succès'
    });

  } catch (error) {
    console.error('❌ Erreur lors de la vérification du solde:', error);
    
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
        balance: { balance: 0, currency: 'GNF' },
        error: errorMessage,
        message: 'Impossible de récupérer le solde'
      },
      { status: 500 }
    );
  }
} 
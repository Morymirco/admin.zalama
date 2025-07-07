import { NextRequest, NextResponse } from 'next/server';
import { Client } from 'nimbasms';

// Configuration Nimba SMS côté serveur
const config = {
  SERVICE_ID: process.env.NIMBA_SMS_SERVICE_ID || '9d83d5b67444c654c702f109dd837167',
  SECRET_TOKEN: process.env.NIMBA_SMS_SECRET_TOKEN || 'qf_bpb4CVfEalTU5eVEFC05wpoqlo17M-mozkZVbIHT_3xfOIjB7Oac-lkXZ6Pg2VqO2LXVy6BUlYTZe73y411agSC0jVh3OcOU92s8Rplc',
};

const client = new Client(config);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 10;

    console.log('📱 Récupération des messages SMS via API route, limite:', limit);

    // Récupérer les messages selon la documentation Nimba SMS
    const messages = await client.messages.list({ limit });

    console.log(`✅ ${messages.count} messages récupérés avec succès`);

    // Transformer les messages pour correspondre à notre interface
    const transformedMessages = messages.results.map((message: any) => ({
      id: message.messageid,
      to: message.to || 'N/A',
      message: message.message,
      sender_name: message.sender_name,
      status: message.status || 'unknown',
      created_at: new Date(message.sent_at * 1000).toISOString(),
      cost: message.cost || 0
    }));

    return NextResponse.json({
      success: true,
      messages: transformedMessages,
      count: messages.results.length,
      message: 'Messages récupérés avec succès'
    });

  } catch (error) {
    console.error('❌ Erreur lors de la récupération des messages:', error);
    
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
        messages: [],
        error: errorMessage,
        message: 'Impossible de récupérer les messages'
      },
      { status: 500 }
    );
  }
}

// Route pour récupérer un message spécifique
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messageId } = body;

    if (!messageId) {
      return NextResponse.json(
        { success: false, error: 'ID du message requis' },
        { status: 400 }
      );
    }

    console.log('📱 Récupération du message SMS:', messageId);

    // Récupérer un message spécifique selon la documentation Nimba SMS
    const message = await client.messages.get(messageId);

    console.log('✅ Message récupéré avec succès:', message);

    return NextResponse.json({
      success: true,
      message: {
        id: message.messageid,
        to: message.to || 'N/A',
        message: message.message,
        sender_name: message.sender_name,
        status: message.status || 'unknown',
        created_at: new Date(message.sent_at * 1000).toISOString(),
        cost: message.cost || 0
      },
      message: 'Message récupéré avec succès'
    });

  } catch (error) {
    console.error('❌ Erreur lors de la récupération du message:', error);
    
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
        message: 'Impossible de récupérer le message'
      },
      { status: 500 }
    );
  }
} 
import { sendWelcomeSMS } from '@/lib/sms-service';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber, displayName, resetLink, type } = await request.json();

    if (!phoneNumber || !displayName) {
      return NextResponse.json(
        { error: 'Le numéro de téléphone et le nom sont requis' },
        { status: 400 }
      );
    }

    // Envoyer le SMS
    const result = await sendWelcomeSMS(phoneNumber, displayName, resetLink);

    return NextResponse.json({
      success: result,
      message: result 
        ? 'SMS envoyé avec succès' 
        : 'Échec de l\'envoi du SMS',
      details: {
        phoneNumber,
        displayName,
        resetLink: resetLink || 'Non fourni',
        type: type || 'standard'
      }
    });
  } catch (error: any) {
    console.error('Erreur lors du test d\'envoi de SMS:', error);
    
    return NextResponse.json(
      { 
        error: error.message || 'Une erreur est survenue lors de l\'envoi du SMS',
        code: error.code
      },
      { status: 500 }
    );
  }
} 
import { NextRequest, NextResponse } from 'next/server';
import emailService from '@/services/emailService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { to, subject, html, text } = body;

    // Validation des données
    if (!to || !subject || !html) {
      return NextResponse.json(
        { success: false, error: 'Données manquantes: to, subject, html sont requis' },
        { status: 400 }
      );
    }

    console.log('📧 Email - Envoi via API:', { to, subject });

    // Utiliser emailService côté serveur
    const result = await emailService.sendEmail({
      to: Array.isArray(to) ? to : [to],
      subject: subject,
      html: html,
      text: text
    });

    if (result.success) {
      console.log('✅ Email envoyé avec succès via API:', result.id);
      return NextResponse.json({
        success: true,
        id: result.id,
        message: 'Email envoyé avec succès'
      });
    } else {
      console.error('❌ Erreur email via API:', result.error);
      return NextResponse.json({
        success: false,
        error: result.error || 'Erreur lors de l\'envoi de l\'email'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('❌ Erreur générale lors de l\'envoi de l\'email via API:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inattendue'
      },
      { status: 500 }
    );
  }
}

// Route GET pour vérifier la configuration email
export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      message: 'Service email API disponible',
      service: 'Resend'
    });
  } catch (error) {
    console.error('❌ Erreur vérification config email API:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur lors de la vérification de la configuration email'
      },
      { status: 500 }
    );
  }
} 
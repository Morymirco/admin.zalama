import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

// Configuration Resend Email
const resend = new Resend(process.env.RESEND_API_KEY || 're_1234567890abcdef');

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

    // Envoyer l'email directement avec Resend
    const result = await resend.emails.send({
      from: 'noreply@zalamagn.com',
      to: Array.isArray(to) ? to : [to],
      subject: subject,
      html: html,
      text: text
    });

    if (result.data) {
      console.log('✅ Email envoyé avec succès via API:', result.data.id);
      return NextResponse.json({
        success: true,
        id: result.data.id,
        message: 'Email envoyé avec succès'
      });
    } else {
      console.error('❌ Erreur email via API:', result.error);
      return NextResponse.json({
        success: false,
        error: result.error?.message || 'Erreur lors de l\'envoi de l\'email'
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
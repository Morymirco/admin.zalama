import { NextRequest, NextResponse } from 'next/server';

// Configuration email (à remplacer par un vrai service comme SendGrid, Resend, etc.)
const EMAIL_CONFIG = {
  from: 'noreply@zalama.com',
  service: 'simulation' // 'sendgrid', 'resend', 'nodemailer', etc.
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { to, subject, html, text } = body;

    // Validation des données
    if (!to || !subject || !html) {
      return NextResponse.json(
        { error: 'Les champs "to", "subject" et "html" sont requis' },
        { status: 400 }
      );
    }

    console.log('📧 Envoi email via API route:', {
      to,
      subject,
      htmlLength: html.length,
      textLength: text?.length || 0
    });

    // Simulation de l'envoi d'email
    // En production, remplacer par un vrai service d'email
    const emailData = {
      from: EMAIL_CONFIG.from,
      to: to,
      subject: subject,
      html: html,
      text: text || html.replace(/<[^>]*>/g, ''), // Extraire le texte si non fourni
      timestamp: new Date().toISOString()
    };

    // Simuler un délai d'envoi
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Simuler un succès (en production, ce serait le résultat du service d'email)
    const result = {
      success: true,
      messageId: `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      to: to,
      subject: subject,
      timestamp: new Date().toISOString()
    };

    console.log('✅ Email envoyé avec succès via API route:', result);
    
    return NextResponse.json({
      success: true,
      message: 'Email envoyé avec succès',
      data: result
    });

  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi de l\'email via API route:', error);
    
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
        details: error
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
      config: EMAIL_CONFIG,
      message: 'Service email configuré (simulation)'
    });
  } catch (error) {
    console.error('❌ Erreur vérification config email:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur lors de la vérification de la configuration email',
        details: error
      },
      { status: 500 }
    );
  }
} 
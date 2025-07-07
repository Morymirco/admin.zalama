import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

// Clé API Resend côté serveur (en dur pour éviter les problèmes de variables d'environnement)
const resend = new Resend('re_aQWgf3nW_Ht5jAsAUj6BzqspyDqxEcCwB');

// Configuration email (à remplacer par un vrai service comme SendGrid, Resend, etc.)
const EMAIL_CONFIG = {
  from: 'noreply@zalamagn.com',
  service: 'simulation' // 'sendgrid', 'resend', 'nodemailer', etc.
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { to, subject, html, text } = body;

    // Validation des données
    if (!to || !subject || !html) {
      return NextResponse.json(
        { error: 'Données manquantes: to, subject, html sont requis' },
        { status: 400 }
      );
    }

    console.log('📧 Email - Envoi vers:', to);
    console.log('📧 Email - Sujet:', subject);

    // Envoi de l'email via Resend
    const result = await resend.emails.send({
      from: 'ZaLaMa <noreply@zalamagn.com>',
      to: to,
      subject: subject,
      html: html,
      text: text
    });

    console.log('✅ Email envoyé avec succès:', result.data?.id);

    return NextResponse.json({
      success: true,
      id: result.data?.id,
      message: 'Email envoyé avec succès'
    });

  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi de l\'email:', error);
    
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
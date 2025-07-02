import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

// Initialiser Resend avec la clé API
const resend = new Resend(process.env.RESEND_API_KEY);

// Configuration email (à remplacer par un vrai service comme SendGrid, Resend, etc.)
const EMAIL_CONFIG = {
  from: 'noreply@zalama.com',
  service: 'simulation' // 'sendgrid', 'resend', 'nodemailer', etc.
};

export async function POST(request: NextRequest) {
  try {
    const { to, subject, html, text } = await request.json();

    if (!to || !subject || !html) {
      return NextResponse.json(
        { success: false, error: 'Destinataire, sujet et contenu HTML requis' },
        { status: 400 }
      );
    }

    console.log('📧 Email - Envoi vers:', to);
    console.log('📧 Email - Sujet:', subject);

    // Envoyer l'email via Resend
    const result = await resend.emails.send({
      from: 'ZaLaMa <noreply@zalamagn.com>',
      to: [to],
      subject: subject,
      html: html,
      text: text || html.replace(/<[^>]*>/g, ''), // Fallback au texte si pas fourni
    });

    console.log('📧 Test Email - Résultat:', result);

    if (result.data) {
      return NextResponse.json({
        success: true,
        message: 'Email envoyé avec succès',
        id: result.data.id
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.error?.message || 'Erreur lors de l\'envoi de l\'email',
        message: 'Échec de l\'envoi de l\'email'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('❌ Erreur API test Email:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
      message: 'Erreur lors de l\'envoi de l\'email'
    }, { status: 500 });
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
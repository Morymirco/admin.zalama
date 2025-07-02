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
    const { to, subject, message } = await request.json();

    if (!to || !subject || !message) {
      return NextResponse.json(
        { success: false, error: 'Destinataire, sujet et message requis' },
        { status: 400 }
      );
    }

    console.log('📧 Test Email - Envoi vers:', to);
    console.log('📧 Test Email - Sujet:', subject);

    // Envoyer l'email via Resend
    const result = await resend.emails.send({
      from: 'ZaLaMa <noreply@zalamagn.com>',
      to: [to],
      subject: subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">ZaLaMa</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Test Email</p>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <h2 style="color: #333; margin-bottom: 20px;">${subject}</h2>
            
            <div style="color: #666; line-height: 1.6; margin-bottom: 30px;">
              ${message.replace(/\n/g, '<br>')}
            </div>
            
            <div style="border-top: 1px solid #eee; padding-top: 20px; text-align: center; color: #999; font-size: 14px;">
              <p>Cet email a été envoyé depuis l'application ZaLaMa</p>
              <p>Date d'envoi: ${new Date().toLocaleString('fr-FR')}</p>
            </div>
          </div>
        </div>
      `,
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
import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { to, subject, html, from = 'contact@zalamagn.com' } = await request.json();

    // Validation des données
    if (!to || !subject || !html) {
      return NextResponse.json(
        { error: 'Les champs to, subject et html sont requis' },
        { status: 400 }
      );
    }

    // Validation de l'adresse email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      return NextResponse.json(
        { error: 'Adresse email invalide' },
        { status: 400 }
      );
    }

    // Envoi de l'email avec Resend
    const data = await resend.emails.send({
      from,
      to,
      subject,
      html,
    });

    console.log('✅ Email envoyé avec succès:', data);

    return NextResponse.json({
      success: true,
      data,
      message: 'Email envoyé avec succès'
    });

  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi de l\'email:', error);
    
    return NextResponse.json(
      { 
        error: 'Erreur lors de l\'envoi de l\'email',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
} 
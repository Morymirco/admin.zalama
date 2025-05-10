import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/firebase-admin';
import { sendPasswordResetEmail } from '@/lib/email-service';

export async function POST(request: NextRequest) {
  try {
    const { email, displayName, role, partenaireId } = await request.json();

    if (!email || !displayName) {
      return NextResponse.json(
        { error: 'Email et nom sont requis' },
        { status: 400 }
      );
    }

    // Générer un mot de passe temporaire
    const temporaryPassword = Math.random().toString(36).slice(-8);

    // Créer l'utilisateur dans Firebase Auth
    const userRecord = await auth.createUser({
      email,
      displayName,
      password: temporaryPassword,
      emailVerified: false,
    });

    // Définir les claims personnalisés pour l'utilisateur
    await auth.setCustomUserClaims(userRecord.uid, {
      role: role || 'employe',
      partenaireId,
    });

    // Envoyer un email de réinitialisation de mot de passe
    const resetLink = await auth.generatePasswordResetLink(email);
    
    // Envoyer l'email avec le lien de réinitialisation via Resend
    const emailSent = await sendPasswordResetEmail(email, displayName, resetLink);
    
    return NextResponse.json({
      success: true,
      userId: userRecord.uid,
      emailSent,
      // Ne pas inclure le resetLink en production pour des raisons de sécurité
      ...(process.env.NODE_ENV !== 'production' && { resetLink }),
    });
  } catch (error: any) {
    console.error('Erreur lors de la création de l\'utilisateur:', error);
    
    return NextResponse.json(
      { error: error.message || 'Une erreur est survenue' },
      { status: 500 }
    );
  }
} 
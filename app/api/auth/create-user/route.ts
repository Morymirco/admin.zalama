import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/firebase-admin';

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

    // Ici, vous pourriez utiliser un service d'envoi d'emails comme SendGrid, Mailjet, etc.
    // Pour l'exemple, nous allons simplement retourner le lien
    
    return NextResponse.json({
      success: true,
      userId: userRecord.uid,
      resetLink,
    });
  } catch (error: any) {
    console.error('Erreur lors de la création de l\'utilisateur:', error);
    
    return NextResponse.json(
      { error: error.message || 'Une erreur est survenue' },
      { status: 500 }
    );
  }
} 
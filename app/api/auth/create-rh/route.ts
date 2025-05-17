import { sendPasswordResetEmailRH } from '@/lib/email-service';
import db, { auth } from '@/lib/firebase-admin';
import { sendWelcomeSMS } from '@/lib/sms-service';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { 
      email, 
      displayName, 
      partenaireId, 
      phoneNumber,
      poste,
      departement 
    } = await request.json();

    if (!email || !displayName || !partenaireId) {
      return NextResponse.json(
        { error: 'Email, nom et ID du partenaire sont requis' },
        { status: 400 }
      );
    }

    // Générer un mot de passe temporaire sécurisé (12 caractères)
    const generateSecurePassword = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
      let password = '';
      for (let i = 0; i < 12; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return password;
    };
    
    const temporaryPassword = generateSecurePassword();
    console.log("Mot de passe temporaire généré:", temporaryPassword.length, "caractères");

    // Formater correctement le numéro de téléphone
    const formatPhoneNumber = (phone: string | null | undefined) => {
      if (!phone) return undefined;
      
      // Supprimer tous les caractères non numériques
      let cleaned = phone.replace(/\D/g, '');
      
      // S'assurer que le numéro commence par un +
      if (!cleaned.startsWith('+')) {
        // Si le numéro commence par un 0, le remplacer par le code pays (par défaut +33 pour la France)
        if (cleaned.startsWith('00')) {
          cleaned = '224' + cleaned.substring(2);
        }
        cleaned = '+' + cleaned;
      }
      
      return cleaned;
    };

    // Créer l'utilisateur dans Firebase Auth
    const userRecord = await auth.createUser({
      email,
      displayName,
      password: temporaryPassword,
      emailVerified: false,
      phoneNumber: phoneNumber ? formatPhoneNumber(phoneNumber) : undefined
    });

    // Définir les claims personnalisés pour l'utilisateur RH
    await auth.setCustomUserClaims(userRecord.uid, {
      role: 'rh',
      partenaireId,
    });

    // Récupérer le nom du partenaire depuis Firestore
    const partenaireDoc = await db.firestore().collection('partenaires').doc(partenaireId).get();
    const partenaireData = partenaireDoc.data();
    const partenaireNom = partenaireData?.nom || 'votre entreprise';

    // Stocker les informations supplémentaires du RH dans Firestore
    await db.firestore().collection('users').doc(userRecord.uid).set({
      email,
      displayName,
      role: 'rh',
      partenaireId,
      phoneNumber: phoneNumber ? formatPhoneNumber(phoneNumber) : null,
      poste: poste || 'Ressources Humaines',
      departement: departement || 'RH',
      createdAt: new Date(),
      lastLogin: null,
      active: true
    });

    // Mettre à jour le document du partenaire pour ajouter ce RH
    await db.firestore().collection('partenaires').doc(partenaireId).update({
      'rh.id': userRecord.uid,
      'rh.email': email,
      'rh.nom': displayName,
      'rh.phoneNumber': phoneNumber ? formatPhoneNumber(phoneNumber) : null,
      updatedAt: new Date()
    });

    // Envoyer un email de réinitialisation de mot de passe
    const resetLink = await auth.generatePasswordResetLink(email);
    
    // Envoyer l'email avec le lien de réinitialisation
    const emailSent = await sendPasswordResetEmailRH(email, displayName, partenaireNom, resetLink);
    
    // Envoyer un SMS si un numéro de téléphone est fourni
    let smsSent = false;
    if (phoneNumber) {
      smsSent = await sendWelcomeSMS(phoneNumber, displayName, 'rh');
      console.log('SMS envoyé avec succès:', smsSent);
    }
    
    // Créer une notification pour informer de la création du compte RH
    await db.firestore().collection('notifications').add({
      titre: `Nouveau compte RH créé`,
      message: `Un compte RH a été créé pour ${displayName} chez le partenaire ID: ${partenaireId}`,
      dateCreation: new Date(),
      lue: false,
      type: 'rh',
      lienId: userRecord.uid
    });
    
    return NextResponse.json({
      success: true,
      userId: userRecord.uid,
      emailSent,
      smsSent,
      // Ne pas inclure le resetLink en production pour des raisons de sécurité
      resetLink: process.env.NODE_ENV !== 'production' ? resetLink : undefined,
    });
  } catch (error: any) {
    console.error('Erreur lors de la création du compte RH:', error);
    
    return NextResponse.json(
      { 
        error: error.message || 'Une erreur est survenue lors de la création du compte RH',
        code: error.code
      },
      { status: 500 }
    );
  }
} 
import { sendWelcomeEmailToResponsable } from '@/lib/email-service';
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
      poste 
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
      
      // Vérifier si le numéro est suffisamment long
      if (cleaned.length < 8) {
        console.warn("Numéro de téléphone trop court:", cleaned);
        return undefined; // Numéro trop court, ne pas l'utiliser
      }
      
      // Vérifier si le numéro n'est pas trop long (max 15 chiffres selon E.164)
      if (cleaned.length > 15) {
        console.warn("Numéro de téléphone trop long:", cleaned);
        cleaned = cleaned.substring(0, 15); // Tronquer à 15 chiffres
      }
      
      // S'assurer que le numéro commence par un +
      if (!cleaned.startsWith('+')) {
        // Si le numéro commence par un 0, le remplacer par le code pays
        if (cleaned.startsWith('0')) {
          cleaned = '224' + cleaned.substring(1); // Code pays pour la Guinée
        } else if (cleaned.startsWith('00')) {
          // Si le numéro commence par 00, remplacer par +
          cleaned = cleaned.substring(2);
        } else {
          // Ajouter le code pays par défaut
          cleaned = '224' + cleaned; // Code pays pour la Guinée
        }
        cleaned = '+' + cleaned;
      }
      
      console.log("Numéro de téléphone formaté:", cleaned);
      return cleaned;
    };

    // Créer l'utilisateur dans Firebase Auth
    const createUserOptions: any = {
      email,
      displayName,
      password: temporaryPassword,
      emailVerified: false
    };

    // N'ajouter le numéro de téléphone que s'il est valide
    const formattedPhone = phoneNumber ? formatPhoneNumber(phoneNumber) : undefined;
    if (formattedPhone) {
      try {
        // Vérifier si le numéro est valide avant de l'ajouter
        createUserOptions.phoneNumber = formattedPhone;
      } catch (phoneError) {
        console.warn("Numéro de téléphone invalide, il ne sera pas utilisé:", phoneNumber);
        // Continuer sans ajouter le numéro de téléphone
      }
    }

    try {
      const userRecord = await auth.createUser(createUserOptions);

      // Définir les claims personnalisés pour l'utilisateur responsable
      await auth.setCustomUserClaims(userRecord.uid, {
        role: 'responsable',
        partenaireId,
      });

      // Récupérer le nom du partenaire depuis Firestore
      const partenaireDoc = await db.firestore().collection('partenaires').doc(partenaireId).get();
      const partenaireData = partenaireDoc.data();
      const partenaireNom = partenaireData?.nom || 'votre entreprise';

      // Stocker les informations supplémentaires du responsable dans Firestore
      await db.firestore().collection('users').doc(userRecord.uid).set({
        email,
        displayName,
        role: 'responsable',
        partenaireId,
        phoneNumber: formattedPhone || null,
        poste: poste || 'Responsable',
        createdAt: new Date(),
        lastLogin: null,
        active: true
      });

      // Mettre à jour le document du partenaire pour ajouter ce responsable
      await db.firestore().collection('partenaires').doc(partenaireId).update({
        'representant.id': userRecord.uid,
        'representant.email': email,
        'representant.nom': displayName,
        'representant.phoneNumber': formattedPhone || null,
        updatedAt: new Date()
      });

      // Envoyer un email de bienvenue au nouveau responsable
      const resetLink = await auth.generatePasswordResetLink(email);
      const emailSent = await sendWelcomeEmailToResponsable(email, displayName, partenaireNom, resetLink);
      
      if (!emailSent) {
        console.error('Erreur lors de l\'envoi de l\'email de bienvenue au nouveau responsable');
      }

      // Envoyer un SMS si un numéro de téléphone est fourni
      let smsSent = false;
      if (formattedPhone) {
        smsSent = await sendWelcomeSMS(formattedPhone, displayName, 'responsable');
        console.log('SMS envoyé avec succès:', smsSent);
      }

      // Créer une notification pour informer de la création du compte responsable
      await db.firestore().collection('notifications').add({
        titre: `Nouveau compte responsable créé`,
        message: `Un compte responsable a été créé pour ${displayName} chez le partenaire ${partenaireNom}`,
        dateCreation: new Date(),
        lue: false,
        type: 'responsable',
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
      // Si l'erreur est liée au numéro de téléphone, réessayer sans le numéro
      if (error.code === 'auth/invalid-phone-number' && formattedPhone) {
        console.warn("Erreur avec le numéro de téléphone, tentative sans numéro");
        delete createUserOptions.phoneNumber;
        
        const userRecord = await auth.createUser(createUserOptions);
        
        // Définir les claims personnalisés pour l'utilisateur responsable
        await auth.setCustomUserClaims(userRecord.uid, {
          role: 'responsable',
          partenaireId,
        });

        // Récupérer le nom du partenaire depuis Firestore
        const partenaireDoc = await db.firestore().collection('partenaires').doc(partenaireId).get();
        const partenaireData = partenaireDoc.data();
        const partenaireNom = partenaireData?.nom || 'votre entreprise';

        // Stocker les informations supplémentaires du responsable dans Firestore
        await db.firestore().collection('users').doc(userRecord.uid).set({
          email,
          displayName,
          role: 'responsable',
          partenaireId,
          phoneNumber: formattedPhone || null,
          poste: poste || 'Responsable',
          createdAt: new Date(),
          lastLogin: null,
          active: true
        });

        // Mettre à jour le document du partenaire pour ajouter ce responsable
        await db.firestore().collection('partenaires').doc(partenaireId).update({
          'representant.id': userRecord.uid,
          'representant.email': email,
          'representant.nom': displayName,
          'representant.phoneNumber': formattedPhone || null,
          updatedAt: new Date()
        });

        // Envoyer un email de bienvenue au nouveau responsable
        const resetLink = await auth.generatePasswordResetLink(email);
        const emailSent = await sendWelcomeEmailToResponsable(email, displayName, partenaireNom, resetLink);
        
        if (!emailSent) {
          console.error('Erreur lors de l\'envoi de l\'email de bienvenue au nouveau responsable');
        }

        // Envoyer un SMS si un numéro de téléphone est fourni
        let smsSent = false;
        if (formattedPhone) {
          smsSent = await sendWelcomeSMS(formattedPhone, displayName, 'responsable');
          console.log('SMS envoyé avec succès:', smsSent);
        }

        // Créer une notification pour informer de la création du compte responsable
        await db.firestore().collection('notifications').add({
          titre: `Nouveau compte responsable créé`,
          message: `Un compte responsable a été créé pour ${displayName} chez le partenaire ${partenaireNom}`,
          dateCreation: new Date(),
          lue: false,
          type: 'responsable',
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
      } else {
        // Propager l'erreur si ce n'est pas lié au numéro de téléphone
        throw error;
      }
    }
  } catch (error: any) {
    console.error('Erreur lors de la création du compte responsable:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Erreur lors de la création du compte responsable',
        code: error.code
      }, 
      { status: 500 }
    );
  }
}
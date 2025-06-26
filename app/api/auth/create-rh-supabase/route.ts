import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendPasswordResetEmailRH } from '@/lib/email-service';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Début création compte RH Supabase');
    
    const { email, displayName, partenaireId, phoneNumber, poste, departement, partenaireNom } = await request.json();
    
    // Validation des champs requis
    if (!email || !displayName || !partenaireId || !partenaireNom) {
      console.error('❌ Champs requis manquants:', { email, displayName, partenaireId, partenaireNom });
      return NextResponse.json({ 
        error: 'Email, nom, ID du partenaire et nom du partenaire sont requis' 
      }, { status: 400 });
    }

    console.log('📋 Données reçues:', { email, displayName, partenaireId, partenaireNom, poste, departement });

    // Générer un mot de passe temporaire sécurisé
    const temporaryPassword = Math.random().toString(36).slice(-12) + '!@#';
    console.log('🔐 Mot de passe temporaire généré (longueur):', temporaryPassword.length);

    // Créer l'utilisateur dans Supabase Auth
    console.log('👤 Création utilisateur dans Supabase Auth...');
    const { data: user, error } = await supabase.auth.admin.createUser({
      email,
      password: temporaryPassword,
      email_confirm: false,
      user_metadata: {
        displayName,
        partenaireId,
        role: 'rh',
        poste: poste || 'Responsable RH',
        departement: departement || 'RH',
        phoneNumber,
        partenaireNom,
        createdAt: new Date().toISOString(),
      },
    });

    if (error) {
      console.error('❌ Erreur création utilisateur Supabase:', error);
      throw new Error(`Erreur création utilisateur: ${error.message}`);
    }

    if (!user.user) {
      console.error('❌ Aucun utilisateur créé');
      throw new Error('Aucun utilisateur créé');
    }

    console.log('✅ Utilisateur créé avec succès:', user.user.id);

    // Générer le lien de réinitialisation de mot de passe
    console.log('🔗 Génération lien de réinitialisation...');
    const { data: resetData, error: resetError } = await supabase.auth.admin.generateLink({
      type: 'recovery',
      email,
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      },
    });

    if (resetError) {
      console.error('❌ Erreur génération lien de réinitialisation:', resetError);
      throw new Error(`Erreur génération lien: ${resetError.message}`);
    }

    const resetLink = resetData?.action_link;
    if (!resetLink) {
      console.error('❌ Aucun lien de réinitialisation généré');
      throw new Error('Aucun lien de réinitialisation généré');
    }

    console.log('✅ Lien de réinitialisation généré');

    // Envoyer l'email d'invitation
    console.log('📧 Envoi email d\'invitation...');
    const emailSent = await sendPasswordResetEmailRH(email, displayName, resetLink, partenaireNom);
    
    if (!emailSent) {
      console.warn('⚠️ Échec envoi email, mais compte créé');
    } else {
      console.log('✅ Email envoyé avec succès');
    }

    // Insérer les données dans la table users si elle existe
    try {
      const { error: insertError } = await supabase
        .from('users')
        .insert({
          id: user.user.id,
          email,
          display_name: displayName,
          role: 'rh',
          partenaire_id: partenaireId,
          phone_number: phoneNumber,
          poste: poste || 'Responsable RH',
          departement: departement || 'RH',
          partenaire_nom: partenaireNom,
          created_at: new Date().toISOString(),
          active: true
        });

      if (insertError) {
        console.warn('⚠️ Erreur insertion dans table users:', insertError.message);
        // Ne pas échouer si la table n'existe pas
      } else {
        console.log('✅ Données insérées dans table users');
      }
    } catch (dbError) {
      console.warn('⚠️ Erreur base de données (ignorée):', dbError);
    }

    console.log('🎉 Création compte RH terminée avec succès');

    return NextResponse.json({ 
      success: true, 
      userId: user.user.id, 
      emailSent,
      resetLink: process.env.NODE_ENV !== 'production' ? resetLink : undefined,
    });

  } catch (error: any) {
    console.error('❌ Erreur création RH Supabase:', error);
    return NextResponse.json({ 
      error: error.message || 'Erreur création RH Supabase',
      details: process.env.NODE_ENV !== 'production' ? error.stack : undefined
    }, { status: 500 });
  }
} 
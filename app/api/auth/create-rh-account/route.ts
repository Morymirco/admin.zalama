import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generatePassword, validateEmail } from '@/lib/utils';

// Configuration Supabase avec service role key pour les opérations admin
const supabaseUrl = 'https://mspmrzlqhwpdkkburjiw.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY is not defined');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { rhData } = body;

    // Validation des données
    if (!rhData.email) {
      return NextResponse.json(
        { success: false, error: 'L\'email est requis pour créer un compte de connexion' },
        { status: 400 }
      );
    }

    if (!validateEmail(rhData.email)) {
      return NextResponse.json(
        { success: false, error: 'Format d\'email invalide' },
        { status: 400 }
      );
    }

    if (!rhData.nom || !rhData.partenaire_id) {
      return NextResponse.json(
        { success: false, error: 'Le nom et l\'ID du partenaire sont requis' },
        { status: 400 }
      );
    }

    // Vérifier si l'email existe déjà dans admin_users
    const { data: existingUser, error: checkError } = await supabase
      .from('admin_users')
      .select('id, email')
      .eq('email', rhData.email)
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Erreur lors de la vérification de l\'email RH:', checkError);
      return NextResponse.json(
        { success: false, error: 'Erreur lors de la vérification de l\'email' },
        { status: 500 }
      );
    }

    if (existingUser) {
      console.log('❌ Email RH déjà existant dans admin_users:', rhData.email);
      return NextResponse.json(
        { success: false, error: 'Un utilisateur avec cette adresse email existe déjà' },
        { status: 409 }
      );
    }

    // Vérifier aussi dans Supabase Auth
    try {
      const { data: authUsers, error: authCheckError } = await supabase.auth.admin.listUsers();
      
      if (!authCheckError && authUsers.users) {
        const existingAuthUser = authUsers.users.find(user => user.email === rhData.email);
        if (existingAuthUser) {
          console.log('❌ Email RH déjà existant dans Supabase Auth:', rhData.email);
          return NextResponse.json(
            { success: false, error: 'Un utilisateur avec cette adresse email existe déjà' },
            { status: 409 }
          );
        }
      }
    } catch (authCheckError) {
      console.log('⚠️ Impossible de vérifier dans Supabase Auth:', authCheckError);
      // Continuer même si on ne peut pas vérifier dans Auth
    }

    // Générer un mot de passe sécurisé
    const password = generatePassword();

    // Créer le compte dans Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: rhData.email,
      password: password,
      email_confirm: true,
      user_metadata: {
        display_name: rhData.nom,
        role: 'rh',
        partenaire_id: rhData.partenaire_id
      }
    });

    if (authError) {
      console.error('Erreur lors de la création du compte auth RH:', authError);
      
      // Détecter spécifiquement les erreurs d'email en double
      if (authError.message.includes('already been registered') || 
          authError.message.includes('already exists') ||
          authError.message.includes('duplicate')) {
        return NextResponse.json(
          { success: false, error: 'Un utilisateur avec cette adresse email existe déjà' },
          { status: 409 }
        );
      }
      
      return NextResponse.json(
        { success: false, error: authError.message },
        { status: 500 }
      );
    }

    // Créer l'enregistrement dans admin_users
    const accountData = {
      id: authData.user.id,
      email: rhData.email,
      display_name: rhData.nom,
      role: 'rh',
      partenaire_id: rhData.partenaire_id,
      active: true
    };

    const { data: accountRecord, error: accountError } = await supabase
      .from('admin_users')
      .insert([accountData])
      .select()
      .single();

    if (accountError) {
      console.error('Erreur lors de la création du compte admin RH:', accountError);
      // Supprimer le compte auth créé en cas d'erreur
      await supabase.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json(
        { success: false, error: accountError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      account: {
        ...accountRecord,
        password: password // Retourner le mot de passe pour affichage temporaire
      }
    });

  } catch (error) {
    console.error('Erreur générale lors de la création du compte RH:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la création du compte RH' },
      { status: 500 }
    );
  }
} 
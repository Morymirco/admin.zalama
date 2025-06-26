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
    const { employeeData } = body;

    // Validation des données
    if (!employeeData.email) {
      return NextResponse.json(
        { success: false, error: 'L\'email est requis pour créer un compte de connexion' },
        { status: 400 }
      );
    }

    if (!validateEmail(employeeData.email)) {
      return NextResponse.json(
        { success: false, error: 'Format d\'email invalide' },
        { status: 400 }
      );
    }

    // Générer un mot de passe sécurisé
    const password = generatePassword();

    // Créer le compte dans Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: employeeData.email,
      password: password,
      email_confirm: true,
      user_metadata: {
        display_name: `${employeeData.prenom} ${employeeData.nom}`,
        role: 'user',
        partenaire_id: employeeData.partner_id,
        employee_id: employeeData.id
      }
    });

    if (authError) {
      console.error('Erreur lors de la création du compte auth:', authError);
      return NextResponse.json(
        { success: false, error: authError.message },
        { status: 500 }
      );
    }

    // Créer l'enregistrement dans admin_users
    const accountData = {
      id: authData.user.id,
      email: employeeData.email,
      display_name: `${employeeData.prenom} ${employeeData.nom}`,
      role: 'user',
      partenaire_id: employeeData.partner_id,
      active: true
    };

    const { data: accountRecord, error: accountError } = await supabase
      .from('admin_users')
      .insert([accountData])
      .select()
      .single();

    if (accountError) {
      console.error('Erreur lors de la création du compte admin:', accountError);
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
    console.error('Erreur générale lors de la création du compte:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la création du compte' },
      { status: 500 }
    );
  }
} 
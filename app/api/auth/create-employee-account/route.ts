import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generatePassword, validateEmail } from '@/lib/utils';

// Configuration Supabase
const supabaseUrl = 'https://mspmrzlqhwpdkkburjiw.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zcG1yemxxaHdwZGtrYnVyaml3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3ODcyNTgsImV4cCI6MjA2NjM2MzI1OH0.zr-TRpKjGJjW0nRtsyPcCLy4Us-c5tOGX71k5_3JJd0';

// Utiliser la clé service role si disponible, sinon la clé anon pour les tests
const supabaseKey = supabaseServiceKey || supabaseAnonKey;

const supabase = createClient(supabaseUrl, supabaseKey, {
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

    console.log('🔐 Tentative de création de compte pour:', employeeData.email);

    // Si nous n'avons pas la clé service role, simuler la création
    if (!supabaseServiceKey) {
      console.log('⚠️ Mode test: Simulation de création de compte (clé service role non disponible)');
      
      // Créer un compte simulé pour les tests
      const simulatedAccount = {
        id: `test_${Date.now()}`,
        email: employeeData.email,
        display_name: `${employeeData.prenom} ${employeeData.nom}`,
        role: 'user',
        partenaire_id: employeeData.partner_id,
        active: true,
        password: password
      };

      return NextResponse.json({
        success: true,
        account: simulatedAccount,
        message: 'Compte créé en mode test (simulation)'
      });
    }

    // Créer le compte dans Supabase Auth (avec clé service role)
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
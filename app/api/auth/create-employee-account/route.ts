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

    // Vérifier si l'email existe déjà dans admin_users
    const { data: existingUser, error: checkError } = await supabase
      .from('admin_users')
      .select('id, email')
      .eq('email', employeeData.email)
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Erreur lors de la vérification de l\'email:', checkError);
      return NextResponse.json(
        { success: false, error: 'Erreur lors de la vérification de l\'email' },
        { status: 500 }
      );
    }

    if (existingUser) {
      console.log('❌ Email déjà existant dans admin_users:', employeeData.email);
      return NextResponse.json(
        { success: false, error: 'Un utilisateur avec cette adresse email existe déjà' },
        { status: 409 }
      );
    }

    // Vérifier aussi dans Supabase Auth si possible
    if (supabaseServiceKey) {
      try {
        const { data: authUsers, error: authCheckError } = await supabase.auth.admin.listUsers();
        
        if (!authCheckError && authUsers.users) {
          const existingAuthUser = authUsers.users.find(user => user.email === employeeData.email);
          if (existingAuthUser) {
            console.log('❌ Email déjà existant dans Supabase Auth:', employeeData.email);
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

    // NOUVELLE APPROCHE: Créer d'abord le compte Auth, puis l'employé avec le user_id
    console.log('🔄 Création du compte Auth en premier...');

    // Créer le compte dans Supabase Auth (avec clé service role)
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: employeeData.email,
      password: password,
      email_confirm: true,
      user_metadata: {
        display_name: `${employeeData.prenom} ${employeeData.nom}`,
        role: 'user',
        partenaire_id: employeeData.partner_id
      }
    });

    if (authError) {
      console.error('Erreur lors de la création du compte auth:', authError);
      
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

    console.log('✅ Compte Auth créé avec succès:', authData.user.id);

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

    console.log('✅ Compte admin_users créé avec succès');

    // NOUVELLE LOGIQUE: Créer ou mettre à jour l'employé avec le user_id
    let employeeRecord;
    
    if (employeeData.id) {
      // Si l'employé existe déjà, le mettre à jour avec le user_id
      console.log('🔄 Mise à jour de l\'employé existant avec user_id...');
      
      const { data: updatedEmployee, error: updateError } = await supabase
        .from('employees')
        .update({ 
          user_id: authData.user.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', employeeData.id)
        .select()
        .single();

      if (updateError) {
        console.error('Erreur lors de la mise à jour de l\'employé:', updateError);
        // Nettoyer les comptes créés en cas d'erreur
        await supabase.auth.admin.deleteUser(authData.user.id);
        await supabase.from('admin_users').delete().eq('id', authData.user.id);
        return NextResponse.json(
          { success: false, error: 'Erreur lors de la mise à jour de l\'employé' },
          { status: 500 }
        );
      }
      
      employeeRecord = updatedEmployee;
      console.log('✅ Employé mis à jour avec user_id:', authData.user.id);
      
    } else {
      // Si l'employé n'existe pas encore, le créer avec le user_id
      console.log('🔄 Création de l\'employé avec user_id...');
      
      const employeeToCreate = {
        ...employeeData,
        user_id: authData.user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data: newEmployee, error: createError } = await supabase
        .from('employees')
        .insert([employeeToCreate])
        .select()
        .single();

      if (createError) {
        console.error('Erreur lors de la création de l\'employé:', createError);
        // Nettoyer les comptes créés en cas d'erreur
        await supabase.auth.admin.deleteUser(authData.user.id);
        await supabase.from('admin_users').delete().eq('id', authData.user.id);
        return NextResponse.json(
          { success: false, error: 'Erreur lors de la création de l\'employé' },
          { status: 500 }
        );
      }
      
      employeeRecord = newEmployee;
      console.log('✅ Employé créé avec user_id:', authData.user.id);
    }

    // Vérification finale que l'employé a bien un user_id
    if (!employeeRecord.user_id) {
      console.error('❌ ERREUR CRITIQUE: L\'employé n\'a pas de user_id après création/mise à jour');
      // Nettoyer les comptes créés
      await supabase.auth.admin.deleteUser(authData.user.id);
      await supabase.from('admin_users').delete().eq('id', authData.user.id);
      return NextResponse.json(
        { success: false, error: 'Erreur critique: user_id manquant' },
        { status: 500 }
      );
    }

    console.log('🎉 Processus de création terminé avec succès!');
    console.log(`   - Compte Auth: ${authData.user.id}`);
    console.log(`   - Compte Admin: ${accountRecord.id}`);
    console.log(`   - Employé: ${employeeRecord.id} avec user_id: ${employeeRecord.user_id}`);

    return NextResponse.json({
      success: true,
      account: {
        ...accountRecord,
        password: password // Retourner le mot de passe pour affichage temporaire
      },
      employee: employeeRecord
    });

  } catch (error) {
    console.error('Erreur générale lors de la création du compte:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la création du compte' },
      { status: 500 }
    );
  }
} 
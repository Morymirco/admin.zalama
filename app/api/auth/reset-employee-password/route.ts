import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { generatePassword } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const { employeeId } = await request.json();

    if (!employeeId) {
      return NextResponse.json(
        { success: false, error: 'ID de l\'employé requis' },
        { status: 400 }
      );
    }



    // Récupérer les informations de l'employé
    const { data: employee, error: employeeError } = await supabase
      .from('employees')
      .select('*')
      .eq('id', employeeId)
      .single();

    if (employeeError || !employee) {
      return NextResponse.json(
        { success: false, error: 'Employé non trouvé' },
        { status: 404 }
      );
    }

    // Si l'employé n'a pas de compte utilisateur, en créer un
    if (!employee.user_id) {
      console.log(`🔄 Création d'un compte utilisateur pour l'employé ${employee.email}`);
      
      // Vérifier que l'email est fourni
      if (!employee.email) {
        return NextResponse.json(
          { success: false, error: 'L\'email est requis pour créer un compte utilisateur' },
          { status: 400 }
        );
      }

      // Générer un mot de passe
      const password = generatePassword();

      // Créer le compte utilisateur dans Supabase Auth
      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email: employee.email,
        password: password,
        email_confirm: true,
        user_metadata: {
          nom: employee.nom,
          prenom: employee.prenom,
          role: 'employe',
          partenaire_id: employee.partner_id
        }
      });

      if (authError) {
        console.error('Erreur lors de la création du compte utilisateur:', authError);
        return NextResponse.json(
          { success: false, error: 'Erreur lors de la création du compte utilisateur' },
          { status: 500 }
        );
      }

      // Mettre à jour l'employé avec le user_id
      const { error: updateError } = await supabase
        .from('employees')
        .update({ user_id: authUser.user.id })
        .eq('id', employeeId);

      if (updateError) {
        console.error('Erreur lors de la mise à jour de l\'employé:', updateError);
        return NextResponse.json(
          { success: false, error: 'Erreur lors de la mise à jour de l\'employé' },
          { status: 500 }
        );
      }

      console.log(`✅ Compte utilisateur créé pour l'employé ${employee.email}`);
      return NextResponse.json({
        success: true,
        password: password,
        message: 'Compte utilisateur créé avec succès'
      });
    }

    // Générer un nouveau mot de passe
    const newPassword = generatePassword();

    // Mettre à jour le mot de passe dans Supabase Auth
    const { error: authError } = await supabase.auth.admin.updateUserById(
      employee.user_id,
      { password: newPassword }
    );

    if (authError) {
      console.error('Erreur lors de la mise à jour du mot de passe:', authError);
      return NextResponse.json(
        { success: false, error: 'Erreur lors de la réinitialisation du mot de passe' },
        { status: 500 }
      );
    }

    console.log(`✅ Mot de passe réinitialisé pour l'employé ${employee.email}`);

    return NextResponse.json({
      success: true,
      password: newPassword,
      message: 'Mot de passe réinitialisé avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de la réinitialisation du mot de passe:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur inattendue'
      },
      { status: 500 }
    );
  }
} 
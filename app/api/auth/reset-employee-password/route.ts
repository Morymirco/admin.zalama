import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generatePassword } from '@/lib/utils';

// Configuration Supabase avec la clé de service pour les opérations admin
const supabaseUrl = 'https://mspmrzlqhwpdkkburjiw.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zcG1yemxxaHdwZGtrYnVyaml3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDc4NzI1OCwiZXhwIjoyMDY2MzYzMjU4fQ.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    const { employeeId } = await request.json();

    if (!employeeId) {
      return NextResponse.json(
        { success: false, error: 'ID de l\'employé requis' },
        { status: 400 }
      );
    }

    console.log('🔄 Réinitialisation du mot de passe pour l\'employé:', employeeId);

    // Récupérer les informations de l'employé
    const { data: employee, error: employeeError } = await supabase
      .from('employees')
      .select('*')
      .eq('id', employeeId)
      .single();

    if (employeeError || !employee) {
      console.error('❌ Employé non trouvé:', employeeError);
      return NextResponse.json(
        { success: false, error: 'Employé non trouvé' },
        { status: 404 }
      );
    }

    console.log('✅ Employé trouvé:', employee.email);

    // Vérifier que l'email est fourni
    if (!employee.email) {
      return NextResponse.json(
        { success: false, error: 'L\'email est requis pour réinitialiser le mot de passe' },
        { status: 400 }
      );
    }

    let userId = employee.user_id;

    // Si l'employé n'a pas de user_id, chercher le compte existant par email
    if (!userId) {
      console.log(`🔍 Recherche du compte utilisateur existant pour: ${employee.email}`);
      
      try {
        // Chercher l'utilisateur par email
        const { data: existingUser, error: searchError } = await supabase.auth.admin.listUsers();
        
        if (searchError) {
          console.error('❌ Erreur lors de la recherche d\'utilisateur:', searchError);
          return NextResponse.json(
            { success: false, error: `Erreur lors de la recherche d'utilisateur: ${searchError.message}` },
            { status: 500 }
          );
        }

        // Chercher l'utilisateur avec cet email
        const userWithEmail = existingUser.users.find(user => user.email === employee.email);
        
        if (userWithEmail) {
          console.log(`✅ Compte utilisateur trouvé pour: ${employee.email}`);
          userId = userWithEmail.id;
          
          // Mettre à jour l'employé avec le user_id trouvé
          const { error: updateError } = await supabase
            .from('employees')
            .update({ user_id: userId })
            .eq('id', employeeId);

          if (updateError) {
            console.error('❌ Erreur lors de la mise à jour de l\'employé:', updateError);
            return NextResponse.json(
              { success: false, error: `Erreur lors de la mise à jour de l'employé: ${updateError.message}` },
              { status: 500 }
            );
          }
          
          console.log(`✅ user_id mis à jour pour l'employé: ${userId}`);
          
        } else {
          // AUCUN COMPTE TROUVÉ - RETOURNER UNE ERREUR AU LIEU DE CRÉER UN NOUVEAU COMPTE
          console.log(`❌ Aucun compte utilisateur trouvé pour: ${employee.email}`);
          return NextResponse.json(
            { 
              success: false, 
              error: `Aucun compte utilisateur trouvé pour l'email ${employee.email}. Veuillez d'abord créer un compte pour cet employé.`
            },
            { status: 404 }
          );
        }
        
      } catch (authError) {
        console.error('❌ Exception lors de la recherche d\'utilisateur:', authError);
        return NextResponse.json(
          { success: false, error: `Exception lors de la recherche d'utilisateur: ${authError instanceof Error ? authError.message : String(authError)}` },
          { status: 500 }
        );
      }
    }

    // Réinitialiser le mot de passe pour l'utilisateur existant
    console.log(`🔄 Réinitialisation du mot de passe pour l'utilisateur: ${userId}`);

    // Générer un nouveau mot de passe
    const newPassword = generatePassword();

    try {
      // Mettre à jour le mot de passe dans Supabase Auth
      const { error: authError } = await supabase.auth.admin.updateUserById(
        userId,
        { password: newPassword }
      );

      if (authError) {
        console.error('❌ Erreur lors de la mise à jour du mot de passe:', authError);
        return NextResponse.json(
          { success: false, error: `Erreur lors de la réinitialisation du mot de passe: ${authError.message}` },
          { status: 500 }
        );
      }

      console.log(`✅ Mot de passe réinitialisé pour l'employé ${employee.email}`);

      return NextResponse.json({
        success: true,
        password: newPassword,
        message: 'Mot de passe réinitialisé avec succès'
      });

    } catch (authError) {
      console.error('❌ Exception lors de la réinitialisation du mot de passe:', authError);
      return NextResponse.json(
        { success: false, error: `Exception lors de la réinitialisation du mot de passe: ${authError instanceof Error ? authError.message : String(authError)}` },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('❌ Erreur générale lors de la réinitialisation du mot de passe:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur inattendue'
      },
      { status: 500 }
    );
  }
} 
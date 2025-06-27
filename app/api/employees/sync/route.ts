import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generatePassword, validateEmail } from '@/lib/utils';

// Configuration Supabase avec clé service_role
const supabaseUrl = 'https://mspmrzlqhwpdkkburjiw.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY is required');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export async function GET() {
  try {
    // Récupérer le statut de synchronisation
    const { data: employees, error } = await supabase
      .from('employees')
      .select('id, nom, prenom, email, user_id, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    const stats = {
      total: employees?.length || 0,
      withUserId: employees?.filter(emp => emp.user_id).length || 0,
      withoutUserId: employees?.filter(emp => !emp.user_id).length || 0
    };

    return NextResponse.json({
      success: true,
      data: {
        stats,
        employees: employees || []
      }
    });
  } catch (error) {
    console.error('Erreur GET /api/employees/sync:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, employeeData, employeeId } = body;

    switch (action) {
      case 'create_with_auth':
        return await handleCreateWithAuth(employeeData);
      
      case 'sync_existing':
        return await handleSyncExisting(employeeId);
      
      case 'sync_all':
        return await handleSyncAll();
      
      default:
        return NextResponse.json(
          { success: false, error: 'Action non reconnue' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Erreur POST /api/employees/sync:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

async function handleCreateWithAuth(employeeData: any) {
  try {
    // Validation
    if (!employeeData.email) {
      return NextResponse.json({
        success: false,
        error: 'L\'email est requis'
      }, { status: 400 });
    }

    if (!validateEmail(employeeData.email)) {
      return NextResponse.json({
        success: false,
        error: 'Format d\'email invalide'
      }, { status: 400 });
    }

    // Vérifier si l'email existe déjà dans Auth
    const { data: authUsers, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) {
      return NextResponse.json({
        success: false,
        error: `Erreur vérification email: ${listError.message}`
      }, { status: 500 });
    }

    const emailExists = authUsers.users.some(user => user.email === employeeData.email);
    if (emailExists) {
      return NextResponse.json({
        success: false,
        error: 'Un compte avec cet email existe déjà'
      }, { status: 400 });
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
        partenaire_id: employeeData.partner_id
      }
    });

    if (authError) {
      return NextResponse.json({
        success: false,
        error: `Erreur création compte Auth: ${authError.message}`
      }, { status: 500 });
    }

    // Préparer les données pour l'insertion
    const employeeDataForInsert = {
      partner_id: employeeData.partner_id,
      nom: employeeData.nom,
      prenom: employeeData.prenom,
      genre: employeeData.genre || 'Homme',
      email: employeeData.email,
      telephone: employeeData.telephone,
      adresse: employeeData.adresse,
      poste: employeeData.poste,
      role: employeeData.role,
      type_contrat: employeeData.type_contrat || 'CDI',
      salaire_net: employeeData.salaire_net ? parseFloat(employeeData.salaire_net.toString()) : null,
      date_embauche: employeeData.date_embauche ? new Date(employeeData.date_embauche).toISOString().split('T')[0] : null,
      actif: employeeData.actif !== undefined ? employeeData.actif : true,
      user_id: authData.user.id
    };

    // Créer l'employé dans la base de données
    const { data: employee, error: insertError } = await supabase
      .from('employees')
      .insert([employeeDataForInsert])
      .select()
      .single();

    if (insertError) {
      // Supprimer le compte Auth créé en cas d'erreur
      await supabase.auth.admin.deleteUser(authData.user.id);
      
      return NextResponse.json({
        success: false,
        error: `Erreur création employé: ${insertError.message}`
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      result: {
        employee,
        userId: authData.user.id,
        password
      }
    });

  } catch (error) {
    console.error('Erreur handleCreateWithAuth:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 });
  }
}

async function handleSyncExisting(employeeId: string) {
  try {
    // Récupérer l'employé
    const { data: employee, error: fetchError } = await supabase
      .from('employees')
      .select('*')
      .eq('id', employeeId)
      .single();

    if (fetchError || !employee) {
      return NextResponse.json({
        success: false,
        error: 'Employé non trouvé'
      }, { status: 404 });
    }

    if (employee.user_id) {
      return NextResponse.json({
        success: false,
        error: 'L\'employé a déjà un user_id'
      }, { status: 400 });
    }

    if (!employee.email) {
      return NextResponse.json({
        success: false,
        error: 'L\'employé n\'a pas d\'email'
      }, { status: 400 });
    }

    // Vérifier si l'email existe déjà dans Auth
    const { data: authUsers, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) {
      return NextResponse.json({
        success: false,
        error: `Erreur vérification email: ${listError.message}`
      }, { status: 500 });
    }

    const existingUser = authUsers.users.find(user => user.email === employee.email);
    if (existingUser) {
      // Lier l'employé à l'utilisateur existant
      const { error: updateError } = await supabase
        .from('employees')
        .update({ user_id: existingUser.id })
        .eq('id', employeeId);

      if (updateError) {
        return NextResponse.json({
          success: false,
          error: `Erreur liaison employé: ${updateError.message}`
        }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        result: {
          action: 'LINKED_EXISTING',
          userId: existingUser.id
        }
      });
    }

    // Créer un nouveau compte Auth
    const password = generatePassword();
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: employee.email,
      password: password,
      email_confirm: true,
      user_metadata: {
        display_name: `${employee.prenom} ${employee.nom}`,
        role: 'user',
        partenaire_id: employee.partner_id
      }
    });

    if (authError) {
      return NextResponse.json({
        success: false,
        error: `Erreur création compte Auth: ${authError.message}`
      }, { status: 500 });
    }

    // Mettre à jour l'employé avec le user_id
    const { error: updateError } = await supabase
      .from('employees')
      .update({ user_id: authData.user.id })
      .eq('id', employeeId);

    if (updateError) {
      // Supprimer le compte Auth créé en cas d'erreur
      await supabase.auth.admin.deleteUser(authData.user.id);
      
      return NextResponse.json({
        success: false,
        error: `Erreur mise à jour employé: ${updateError.message}`
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      result: {
        action: 'CREATED_NEW',
        userId: authData.user.id,
        password
      }
    });

  } catch (error) {
    console.error('Erreur handleSyncExisting:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 });
  }
}

async function handleSyncAll() {
  try {
    // Récupérer tous les employés sans user_id
    const { data: employees, error: fetchError } = await supabase
      .from('employees')
      .select('*')
      .is('user_id', null);

    if (fetchError) {
      return NextResponse.json({
        success: false,
        error: `Erreur récupération employés: ${fetchError.message}`
      }, { status: 500 });
    }

    const results = [];
    let successful = 0;
    let failed = 0;

    for (const employee of employees || []) {
      try {
        if (!employee.email) {
          results.push({
            employeeId: employee.id,
            email: employee.email,
            success: false,
            error: 'Pas d\'email'
          });
          failed++;
          continue;
        }

        // Vérifier si l'email existe déjà dans Auth
        const { data: authUsers, error: listError } = await supabase.auth.admin.listUsers();
        if (listError) {
          results.push({
            employeeId: employee.id,
            email: employee.email,
            success: false,
            error: `Erreur vérification: ${listError.message}`
          });
          failed++;
          continue;
        }

        const existingUser = authUsers.users.find(user => user.email === employee.email);
        if (existingUser) {
          // Lier à l'utilisateur existant
          const { error: updateError } = await supabase
            .from('employees')
            .update({ user_id: existingUser.id })
            .eq('id', employee.id);

          if (updateError) {
            results.push({
              employeeId: employee.id,
              email: employee.email,
              success: false,
              error: `Erreur liaison: ${updateError.message}`
            });
            failed++;
          } else {
            results.push({
              employeeId: employee.id,
              email: employee.email,
              success: true,
              action: 'LINKED_EXISTING',
              userId: existingUser.id
            });
            successful++;
          }
        } else {
          // Créer un nouveau compte
          const password = generatePassword();
          const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email: employee.email,
            password: password,
            email_confirm: true,
            user_metadata: {
              display_name: `${employee.prenom} ${employee.nom}`,
              role: 'user',
              partenaire_id: employee.partner_id
            }
          });

          if (authError) {
            results.push({
              employeeId: employee.id,
              email: employee.email,
              success: false,
              error: `Erreur création Auth: ${authError.message}`
            });
            failed++;
            continue;
          }

          // Mettre à jour l'employé
          const { error: updateError } = await supabase
            .from('employees')
            .update({ user_id: authData.user.id })
            .eq('id', employee.id);

          if (updateError) {
            await supabase.auth.admin.deleteUser(authData.user.id);
            results.push({
              employeeId: employee.id,
              email: employee.email,
              success: false,
              error: `Erreur mise à jour: ${updateError.message}`
            });
            failed++;
          } else {
            results.push({
              employeeId: employee.id,
              email: employee.email,
              success: true,
              action: 'CREATED_NEW',
              userId: authData.user.id,
              password
            });
            successful++;
          }
        }
      } catch (error) {
        results.push({
          employeeId: employee.id,
          email: employee.email,
          success: false,
          error: error instanceof Error ? error.message : 'Erreur inconnue'
        });
        failed++;
      }
    }

    return NextResponse.json({
      success: true,
      result: {
        total: employees?.length || 0,
        successful,
        failed,
        results
      }
    });

  } catch (error) {
    console.error('Erreur handleSyncAll:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 });
  }
} 
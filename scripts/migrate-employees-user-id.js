const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = 'https://mspmrzlqhwpdkkburjiw.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY is not defined');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Fonction pour générer un mot de passe sécurisé
function generatePassword() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

async function migrateEmployeesUserId() {
  console.log('🔄 Début de la migration des user_id pour les employés...\n');

  try {
    // 1. Récupérer tous les employés qui ont un email mais pas de user_id
    console.log('📋 Récupération des employés sans user_id...');
    const { data: employees, error: employeesError } = await supabase
      .from('employees')
      .select('*')
      .is('user_id', null)
      .not('email', 'is', null);

    if (employeesError) {
      throw new Error(`Erreur lors de la récupération des employés: ${employeesError.message}`);
    }

    console.log(`📊 ${employees.length} employés trouvés sans user_id`);

    if (employees.length === 0) {
      console.log('✅ Aucun employé à migrer');
      return;
    }

    // 2. Pour chaque employé, créer un compte Auth et mettre à jour le user_id
    let updatedCount = 0;
    let errorCount = 0;
    const results = [];

    for (const employee of employees) {
      try {
        console.log(`\n🔄 Traitement de l'employé: ${employee.prenom} ${employee.nom} (${employee.email})`);

        // Vérifier si un compte Auth existe déjà avec cet email
        const { data: authUsers, error: listError } = await supabase.auth.admin.listUsers();
        if (listError) {
          throw new Error(`Erreur lors de la liste des utilisateurs Auth: ${listError.message}`);
        }

        const existingUser = authUsers.users.find(user => user.email === employee.email);
        
        if (existingUser) {
          console.log(`✅ Compte Auth existant trouvé pour ${employee.email}`);
          
          // Mettre à jour l'employé avec le user_id existant
          const { error: updateError } = await supabase
            .from('employees')
            .update({ user_id: existingUser.id })
            .eq('id', employee.id);

          if (updateError) {
            throw new Error(`Erreur lors de la mise à jour: ${updateError.message}`);
          }

          results.push({
            employeeId: employee.id,
            email: employee.email,
            action: 'SYNCED_EXISTING',
            userId: existingUser.id,
            success: true
          });
          updatedCount++;
          
        } else {
          console.log(`🆕 Création d'un nouveau compte Auth pour ${employee.email}`);
          
          // Générer un mot de passe sécurisé
          const password = generatePassword();

          // Créer le compte dans Supabase Auth
          const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email: employee.email,
            password: password,
            email_confirm: true,
            user_metadata: {
              display_name: `${employee.prenom} ${employee.nom}`,
              role: 'user',
              partenaire_id: employee.partner_id,
              employee_id: employee.id
            }
          });

          if (authError) {
            throw new Error(`Erreur lors de la création du compte Auth: ${authError.message}`);
          }

          // Mettre à jour l'employé avec le user_id
          const { error: updateError } = await supabase
            .from('employees')
            .update({ user_id: authData.user.id })
            .eq('id', employee.id);

          if (updateError) {
            // Supprimer le compte Auth créé en cas d'erreur
            await supabase.auth.admin.deleteUser(authData.user.id);
            throw new Error(`Erreur lors de la mise à jour: ${updateError.message}`);
          }

          results.push({
            employeeId: employee.id,
            email: employee.email,
            action: 'CREATED_NEW',
            userId: authData.user.id,
            password: password,
            success: true
          });
          updatedCount++;
          
          console.log(`✅ Compte Auth créé et employé mis à jour: ${authData.user.id}`);
        }

      } catch (error) {
        console.error(`❌ Erreur pour l'employé ${employee.email}:`, error.message);
        results.push({
          employeeId: employee.id,
          email: employee.email,
          action: 'FAILED',
          error: error.message,
          success: false
        });
        errorCount++;
      }
    }

    // 3. Afficher le résumé
    console.log('\n📊 Résumé de la migration:');
    console.log(`✅ Employés mis à jour avec succès: ${updatedCount}`);
    console.log(`❌ Erreurs: ${errorCount}`);
    console.log(`📋 Total traité: ${employees.length}`);

    // 4. Afficher les détails des résultats
    console.log('\n📋 Détails des résultats:');
    results.forEach((result, index) => {
      if (result.success) {
        console.log(`${index + 1}. ✅ ${result.email} - ${result.action} (${result.userId})`);
        if (result.password) {
          console.log(`   🔑 Mot de passe temporaire: ${result.password}`);
        }
      } else {
        console.log(`${index + 1}. ❌ ${result.email} - ${result.error}`);
      }
    });

    // 5. Vérifier qu'il n'y a plus d'employés sans user_id
    const { data: remainingEmployees, error: checkError } = await supabase
      .from('employees')
      .select('id, email')
      .is('user_id', null)
      .not('email', 'is', null);

    if (checkError) {
      console.error('❌ Erreur lors de la vérification finale:', checkError.message);
    } else {
      console.log(`\n🔍 Vérification finale: ${remainingEmployees.length} employés restent sans user_id`);
      if (remainingEmployees.length > 0) {
        console.log('⚠️ Employés restants sans user_id:');
        remainingEmployees.forEach(emp => {
          console.log(`   - ${emp.email}`);
        });
      }
    }

  } catch (error) {
    console.error('💥 Erreur générale lors de la migration:', error);
    process.exit(1);
  }
}

// Exécuter la migration
migrateEmployeesUserId()
  .then(() => {
    console.log('\n🎉 Migration terminée avec succès!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Migration échouée:', error);
    process.exit(1);
  }); 
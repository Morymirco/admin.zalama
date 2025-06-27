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

    // 2. Pour chaque employé, chercher le compte auth correspondant par email
    let updatedCount = 0;
    let errorCount = 0;

    for (const employee of employees) {
      try {
        console.log(`\n🔍 Traitement de l'employé: ${employee.prenom} ${employee.nom} (${employee.email})`);

        // Chercher le compte auth par email
        const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
        
        if (authError) {
          console.error(`❌ Erreur lors de la recherche du compte auth: ${authError.message}`);
          errorCount++;
          continue;
        }

        // Trouver l'utilisateur auth correspondant
        const authUser = authUsers.users.find(user => user.email === employee.email);
        
        if (!authUser) {
          console.log(`⚠️  Aucun compte auth trouvé pour l'email: ${employee.email}`);
          continue;
        }

        // Mettre à jour l'employé avec l'UID auth
        const { error: updateError } = await supabase
          .from('employees')
          .update({ user_id: authUser.id })
          .eq('id', employee.id);

        if (updateError) {
          console.error(`❌ Erreur lors de la mise à jour: ${updateError.message}`);
          errorCount++;
        } else {
          console.log(`✅ user_id mis à jour: ${authUser.id}`);
          updatedCount++;
        }

      } catch (error) {
        console.error(`❌ Erreur lors du traitement de l'employé ${employee.id}:`, error);
        errorCount++;
      }
    }

    console.log('\n📊 Résumé de la migration:');
    console.log(`✅ Employés mis à jour: ${updatedCount}`);
    console.log(`❌ Erreurs: ${errorCount}`);
    console.log(`📋 Total traité: ${employees.length}`);

  } catch (error) {
    console.error('💥 Erreur générale lors de la migration:', error);
  }
}

// Exécuter la migration
migrateEmployeesUserId()
  .then(() => {
    console.log('\n🏁 Migration terminée');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Erreur fatale:', error);
    process.exit(1);
  }); 
const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = 'https://mspmrzlqhwpdkkburjiw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zcG1yemxxaHdwZGtrYnVyaml3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3ODcyNTgsImV4cCI6MjA2NjM2MzI1OH0.zr-TRpKjGJjW0nRtsyPcCLy4Us-c5tOGX71k5_3JJd0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanupTestEmployee() {
  try {
    console.log('🧹 Nettoyage des données de test d\'employé...\n');

    // Supprimer l'employé de test
    const { data: testEmployees, error: employeesError } = await supabase
      .from('employees')
      .select('id, nom, prenom, email')
      .eq('email', 'test.employe@example.com');

    if (employeesError) {
      console.error('❌ Erreur lors de la récupération des employés de test:', employeesError);
      return;
    }

    if (testEmployees.length === 0) {
      console.log('✅ Aucun employé de test trouvé à supprimer');
    } else {
      console.log(`📋 ${testEmployees.length} employé(s) de test trouvé(s):`);
      testEmployees.forEach(emp => {
        console.log(`  - ${emp.prenom} ${emp.nom} (${emp.email})`);
      });

      // Supprimer les employés de test
      for (const employee of testEmployees) {
        const { error: deleteError } = await supabase
          .from('employees')
          .delete()
          .eq('id', employee.id);

        if (deleteError) {
          console.error(`❌ Erreur lors de la suppression de ${employee.prenom} ${employee.nom}:`, deleteError);
        } else {
          console.log(`✅ Employé ${employee.prenom} ${employee.nom} supprimé`);
        }
      }
    }

    // Supprimer les comptes utilisateur de test
    const { data: testUsers, error: usersError } = await supabase
      .from('admin_users')
      .select('id, email, display_name')
      .eq('email', 'test.employe@example.com');

    if (usersError) {
      console.error('❌ Erreur lors de la récupération des utilisateurs de test:', usersError);
    } else if (testUsers.length === 0) {
      console.log('✅ Aucun utilisateur de test trouvé à supprimer');
    } else {
      console.log(`📋 ${testUsers.length} utilisateur(s) de test trouvé(s):`);
      testUsers.forEach(user => {
        console.log(`  - ${user.display_name} (${user.email})`);
      });

      // Supprimer les utilisateurs de test
      for (const user of testUsers) {
        const { error: deleteError } = await supabase
          .from('admin_users')
          .delete()
          .eq('id', user.id);

        if (deleteError) {
          console.error(`❌ Erreur lors de la suppression de ${user.display_name}:`, deleteError);
        } else {
          console.log(`✅ Utilisateur ${user.display_name} supprimé`);
        }
      }
    }

    console.log('\n✅ Nettoyage terminé');

  } catch (error) {
    console.error('❌ Erreur lors du nettoyage:', error);
  }
}

// Exécuter le nettoyage
cleanupTestEmployee(); 
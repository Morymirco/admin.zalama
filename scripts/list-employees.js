require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = 'https://mspmrzlqhwpdkkburjiw.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zcG1yemxxaHdwZGtrYnVyaml3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3ODcyNTgsImV4cCI6MjA2NjM2MzI1OH0.zr-TRpKjGJjW0nRtsyPcCLy4Us-c5tOGX71k5_3JJd0';

console.log('📋 Liste des employés avec vérification des user_id');
console.log('📋 Variables d\'environnement:');
console.log('- SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅ Présent' : '❌ Manquant');

// Client Supabase
const supabaseKey = supabaseServiceKey || supabaseAnonKey;
const supabase = createClient(supabaseUrl, supabaseKey);

async function listEmployees() {
  try {
    console.log('\n🔄 Récupération de la liste des employés...');
    
    // Récupérer tous les employés avec les informations du partenaire
    const { data: employees, error } = await supabase
      .from('employees')
      .select(`
        *,
        partners:partner_id (
          id,
          nom
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Erreur lors de la récupération des employés:', error);
      return;
    }

    if (!employees || employees.length === 0) {
      console.log('📭 Aucun employé trouvé dans la base de données');
      return;
    }

    console.log(`\n📊 Statistiques générales:`);
    console.log(`- Total employés: ${employees.length}`);
    
    const withUserId = employees.filter(emp => emp.user_id);
    const withoutUserId = employees.filter(emp => !emp.user_id);
    const withEmail = employees.filter(emp => emp.email);
    const withoutEmail = employees.filter(emp => !emp.email);
    
    console.log(`- Employés avec user_id: ${withUserId.length} (${((withUserId.length / employees.length) * 100).toFixed(1)}%)`);
    console.log(`- Employés sans user_id: ${withoutUserId.length} (${((withoutUserId.length / employees.length) * 100).toFixed(1)}%)`);
    console.log(`- Employés avec email: ${withEmail.length} (${((withEmail.length / employees.length) * 100).toFixed(1)}%)`);
    console.log(`- Employés sans email: ${withoutEmail.length} (${((withoutEmail.length / employees.length) * 100).toFixed(1)}%)`);

    // Analyser par partenaire
    const partnerStats = {};
    employees.forEach(emp => {
      const partnerName = emp.partners?.nom || 'Partenaire inconnu';
      if (!partnerStats[partnerName]) {
        partnerStats[partnerName] = { total: 0, withUserId: 0, withoutUserId: 0 };
      }
      partnerStats[partnerName].total++;
      if (emp.user_id) {
        partnerStats[partnerName].withUserId++;
      } else {
        partnerStats[partnerName].withoutUserId++;
      }
    });

    console.log(`\n🏢 Répartition par partenaire:`);
    Object.entries(partnerStats).forEach(([partnerName, stats]) => {
      const percentage = ((stats.withUserId / stats.total) * 100).toFixed(1);
      console.log(`- ${partnerName}: ${stats.total} employés (${stats.withUserId} avec user_id, ${stats.withoutUserId} sans - ${percentage}%)`);
    });

    console.log(`\n📋 Liste détaillée des employés:`);
    console.log('─'.repeat(120));
    console.log('ID'.padEnd(38) + ' | ' + 'Nom'.padEnd(20) + ' | ' + 'Email'.padEnd(25) + ' | ' + 'Partenaire'.padEnd(20) + ' | ' + 'User ID'.padEnd(38) + ' | ' + 'Statut');
    console.log('─'.repeat(120));

    employees.forEach((emp, index) => {
      const partnerName = emp.partners?.nom || 'N/A';
      const userStatus = emp.user_id ? '✅' : '❌';
      const emailStatus = emp.email ? '📧' : '📭';
      const activeStatus = emp.actif ? '🟢' : '🔴';
      
      console.log(
        emp.id.padEnd(38) + ' | ' +
        `${emp.prenom} ${emp.nom}`.padEnd(20) + ' | ' +
        (emp.email || 'N/A').padEnd(25) + ' | ' +
        partnerName.padEnd(20) + ' | ' +
        (emp.user_id || 'NULL').padEnd(38) + ' | ' +
        `${userStatus} ${emailStatus} ${activeStatus}`
      );
    });

    console.log('─'.repeat(120));

    // Détail des employés sans user_id
    if (withoutUserId.length > 0) {
      console.log(`\n⚠️ Employés SANS user_id (${withoutUserId.length}):`);
      withoutUserId.forEach(emp => {
        const partnerName = emp.partners?.nom || 'N/A';
        console.log(`- ${emp.prenom} ${emp.nom} (${emp.email || 'Pas d\'email'}) - ${partnerName}`);
      });
    }

    // Détail des employés avec user_id
    if (withUserId.length > 0) {
      console.log(`\n✅ Employés AVEC user_id (${withUserId.length}):`);
      withUserId.forEach(emp => {
        const partnerName = emp.partners?.nom || 'N/A';
        console.log(`- ${emp.prenom} ${emp.nom} (${emp.email}) - ${partnerName} - User ID: ${emp.user_id}`);
      });
    }

    // Vérifier les comptes Auth correspondants
    if (supabaseServiceKey && withUserId.length > 0) {
      console.log(`\n🔍 Vérification des comptes Auth...`);
      
      try {
        const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
        
        if (authError) {
          console.error('❌ Erreur lors de la récupération des utilisateurs Auth:', authError);
        } else {
          const authUserIds = authUsers.users.map(user => user.id);
          const missingAuthUsers = withUserId.filter(emp => !authUserIds.includes(emp.user_id));
          
          if (missingAuthUsers.length > 0) {
            console.log(`⚠️ Employés avec user_id mais sans compte Auth (${missingAuthUsers.length}):`);
            missingAuthUsers.forEach(emp => {
              console.log(`- ${emp.prenom} ${emp.nom} - User ID: ${emp.user_id}`);
            });
          } else {
            console.log('✅ Tous les employés avec user_id ont un compte Auth correspondant');
          }
        }
      } catch (error) {
        console.log('⚠️ Impossible de vérifier les comptes Auth (permissions insuffisantes)');
      }
    }

    console.log(`\n🎉 Analyse terminée!`);

  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

// Exécuter le script
listEmployees(); 
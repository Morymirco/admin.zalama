const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = 'https://mspmrzlqhwpdkkburjiw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zcG1yemxxaHdwZGtrYnVyaml3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3ODcyNTgsImV4cCI6MjA2NjM2MzI1OH0.zr-TRpKjGJjW0nRtsyPcCLy4Us-c5tOGX71k5_3JJd0';

async function fixNotificationUserIds() {
  try {
    console.log('🔧 Vérification et correction des user_id dans les notifications...');
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // 1. Vérifier les notifications existantes avec des user_id invalides
    console.log('1. Vérification des notifications existantes...');
    const { data: notifications, error: notificationsError } = await supabase
      .from('notifications')
      .select('*');
    
    if (notificationsError) {
      console.error('❌ Erreur lors de la récupération des notifications:', notificationsError);
      return;
    }
    
    console.log(`📊 Nombre total de notifications: ${notifications?.length || 0}`);
    
    // 2. Vérifier quels user_id sont invalides
    const invalidNotifications = [];
    const validNotifications = [];
    
    for (const notification of notifications || []) {
      const { data: adminUser, error: adminError } = await supabase
        .from('admin_users')
        .select('id')
        .eq('id', notification.user_id)
        .single();
      
      if (adminError || !adminUser) {
        invalidNotifications.push(notification);
      } else {
        validNotifications.push(notification);
      }
    }
    
    console.log(`✅ Notifications valides: ${validNotifications.length}`);
    console.log(`❌ Notifications invalides: ${invalidNotifications.length}`);
    
    if (invalidNotifications.length > 0) {
      console.log('📋 Notifications invalides:');
      invalidNotifications.forEach(n => {
        console.log(`   - ID: ${n.id}, User ID: ${n.user_id}, Titre: ${n.titre}`);
      });
      
      // 3. Supprimer les notifications invalides
      console.log('3. Suppression des notifications invalides...');
      for (const notification of invalidNotifications) {
        const { error: deleteError } = await supabase
          .from('notifications')
          .delete()
          .eq('id', notification.id);
        
        if (deleteError) {
          console.error(`❌ Erreur lors de la suppression de la notification ${notification.id}:`, deleteError);
        } else {
          console.log(`✅ Notification ${notification.id} supprimée`);
        }
      }
    }
    
    // 4. Vérifier les employés avec des user_id invalides
    console.log('4. Vérification des employés avec des user_id invalides...');
    const { data: employees, error: employeesError } = await supabase
      .from('employees')
      .select('id, nom, prenom, user_id');
    
    if (employeesError) {
      console.error('❌ Erreur lors de la récupération des employés:', employeesError);
      return;
    }
    
    const employeesWithInvalidUserId = [];
    const employeesWithValidUserId = [];
    
    for (const employee of employees || []) {
      if (employee.user_id) {
        const { data: adminUser, error: adminError } = await supabase
          .from('admin_users')
          .select('id')
          .eq('id', employee.user_id)
          .single();
        
        if (adminError || !adminUser) {
          employeesWithInvalidUserId.push(employee);
        } else {
          employeesWithValidUserId.push(employee);
        }
      }
    }
    
    console.log(`✅ Employés avec user_id valide: ${employeesWithValidUserId.length}`);
    console.log(`❌ Employés avec user_id invalide: ${employeesWithInvalidUserId.length}`);
    
    if (employeesWithInvalidUserId.length > 0) {
      console.log('📋 Employés avec user_id invalide:');
      employeesWithInvalidUserId.forEach(e => {
        console.log(`   - ${e.nom} ${e.prenom} (ID: ${e.id}, User ID: ${e.user_id})`);
      });
      
      // 5. Corriger les user_id invalides (les mettre à NULL)
      console.log('5. Correction des user_id invalides...');
      for (const employee of employeesWithInvalidUserId) {
        const { error: updateError } = await supabase
          .from('employees')
          .update({ user_id: null })
          .eq('id', employee.id);
        
        if (updateError) {
          console.error(`❌ Erreur lors de la correction de l'employé ${employee.id}:`, updateError);
        } else {
          console.log(`✅ Employé ${employee.nom} ${employee.prenom} corrigé (user_id mis à NULL)`);
        }
      }
    }
    
    // 6. Vérifier les utilisateurs admin existants
    console.log('6. Vérification des utilisateurs admin...');
    const { data: adminUsers, error: adminUsersError } = await supabase
      .from('admin_users')
      .select('id, email, display_name, active');
    
    if (adminUsersError) {
      console.error('❌ Erreur lors de la récupération des utilisateurs admin:', adminUsersError);
      return;
    }
    
    console.log(`👥 Utilisateurs admin trouvés: ${adminUsers?.length || 0}`);
    console.log('📋 Liste des utilisateurs admin:');
    adminUsers?.forEach(user => {
      console.log(`   - ${user.display_name} (${user.email}) - Actif: ${user.active}`);
    });
    
    console.log('');
    console.log('🎉 Vérification terminée!');
    console.log('✅ Le système de notifications devrait maintenant fonctionner correctement');
    console.log('');
    console.log('📋 Prochaines étapes:');
    console.log('1. Réappliquer les triggers corrigés dans Supabase');
    console.log('2. Tester l\'approbation d\'une demande d\'avance');
    console.log('3. Vérifier que les notifications apparaissent correctement');
    
  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error);
    process.exit(1);
  }
}

// Exécuter le script
fixNotificationUserIds(); 
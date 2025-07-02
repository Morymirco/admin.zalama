const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = 'https://mspmrzlqhwpdkkburjiw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zcG1yemxxaHdwZGtrYnVyaml3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3ODcyNTgsImV4cCI6MjA2NjM2MzI1OH0.zr-TRpKjGJjW0nRtsyPcCLy4Us-c5tOGX71k5_3JJd0';

async function debugNotificationTriggers() {
  try {
    console.log('🔍 Débogage des triggers de notifications...');
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // 1. Vérifier les demandes d'avance existantes
    console.log('1. Vérification des demandes d\'avance existantes...');
    const { data: salaryRequests, error: salaryError } = await supabase
      .from('salary_advance_requests')
      .select('*')
      .order('date_creation', { ascending: false })
      .limit(5);
    
    if (salaryError) {
      console.error('❌ Erreur lors de la récupération des demandes:', salaryError);
      return;
    }
    
    console.log(`📊 Nombre de demandes d'avance: ${salaryRequests?.length || 0}`);
    if (salaryRequests && salaryRequests.length > 0) {
      console.log('📋 Dernières demandes:');
      salaryRequests.forEach((request, index) => {
        console.log(`   ${index + 1}. ID: ${request.id}`);
        console.log(`      Employé ID: ${request.employe_id}`);
        console.log(`      Montant: ${request.montant_demande} GNF`);
        console.log(`      Statut: ${request.statut}`);
        console.log(`      Date: ${request.date_creation}`);
        console.log('');
      });
    }
    
    // 2. Vérifier les notifications existantes
    console.log('2. Vérification des notifications existantes...');
    const { data: notifications, error: notificationsError } = await supabase
      .from('notifications')
      .select('*')
      .order('date_creation', { ascending: false })
      .limit(10);
    
    if (notificationsError) {
      console.error('❌ Erreur lors de la récupération des notifications:', notificationsError);
      return;
    }
    
    console.log(`📊 Nombre de notifications: ${notifications?.length || 0}`);
    if (notifications && notifications.length > 0) {
      console.log('📋 Dernières notifications:');
      notifications.forEach((notification, index) => {
        console.log(`   ${index + 1}. ID: ${notification.id}`);
        console.log(`      Titre: ${notification.titre}`);
        console.log(`      Type: ${notification.type}`);
        console.log(`      User ID: ${notification.user_id}`);
        console.log(`      Lu: ${notification.lu}`);
        console.log(`      Date: ${notification.date_creation}`);
        console.log('');
      });
    }
    
    // 3. Vérifier les utilisateurs admin actifs
    console.log('3. Vérification des utilisateurs admin actifs...');
    const { data: adminUsers, error: adminError } = await supabase
      .from('admin_users')
      .select('id, email, display_name, active')
      .eq('active', true);
    
    if (adminError) {
      console.error('❌ Erreur lors de la récupération des admins:', adminError);
      return;
    }
    
    console.log(`👥 Utilisateurs admin actifs: ${adminUsers?.length || 0}`);
    if (adminUsers && adminUsers.length > 0) {
      console.log('📋 Admins actifs:');
      adminUsers.forEach((admin, index) => {
        console.log(`   ${index + 1}. ${admin.display_name} (${admin.email}) - ID: ${admin.id}`);
      });
    }
    
    // 4. Tester la création manuelle d'une notification
    console.log('4. Test de création manuelle d\'une notification...');
    if (adminUsers && adminUsers.length > 0) {
      const testAdminId = adminUsers[0].id;
      
      const { data: testNotification, error: testError } = await supabase
        .rpc('create_notification', {
          p_user_id: testAdminId,
          p_titre: 'Test de notification manuelle',
          p_message: 'Ceci est un test pour vérifier que la fonction fonctionne',
          p_type: 'Information'
        });
      
      if (testError) {
        console.error('❌ Erreur lors de la création manuelle:', testError);
      } else {
        console.log('✅ Notification de test créée avec succès, ID:', testNotification);
        
        // Vérifier que la notification a été créée
        const { data: createdNotification, error: fetchError } = await supabase
          .from('notifications')
          .select('*')
          .eq('id', testNotification)
          .single();
        
        if (fetchError) {
          console.error('❌ Erreur lors de la récupération de la notification de test:', fetchError);
        } else {
          console.log('✅ Notification de test récupérée:', {
            id: createdNotification.id,
            titre: createdNotification.titre,
            message: createdNotification.message,
            type: createdNotification.type,
            user_id: createdNotification.user_id
          });
        }
        
        // Nettoyer la notification de test
        const { error: deleteError } = await supabase
          .from('notifications')
          .delete()
          .eq('id', testNotification);
        
        if (deleteError) {
          console.error('❌ Erreur lors de la suppression de la notification de test:', deleteError);
        } else {
          console.log('✅ Notification de test supprimée');
        }
      }
    }
    
    // 5. Vérifier les triggers dans la base de données
    console.log('5. Vérification des triggers...');
    console.log('⚠️  Pour vérifier les triggers, tu dois:');
    console.log('   1. Aller sur https://supabase.com/dashboard/project/mspmrzlqhwpdkkburjiw/sql');
    console.log('   2. Exécuter cette requête:');
    console.log('');
    console.log('   SELECT trigger_name, event_manipulation, event_object_table, action_statement');
    console.log('   FROM information_schema.triggers');
    console.log('   WHERE trigger_schema = \'public\'');
    console.log('   AND trigger_name LIKE \'trigger_%\';');
    console.log('');
    
    // 6. Suggestions de débogage
    console.log('6. Suggestions de débogage:');
    console.log('');
    console.log('🔍 Si les triggers ne fonctionnent pas:');
    console.log('   1. Vérifie que les triggers sont bien appliqués dans Supabase');
    console.log('   2. Vérifie les logs d\'erreur dans la console Supabase');
    console.log('   3. Teste la création d\'une nouvelle demande d\'avance');
    console.log('');
    console.log('🔍 Si les triggers fonctionnent mais pas les notifications:');
    console.log('   1. Vérifie que les utilisateurs admin existent');
    console.log('   2. Vérifie que les conditions dans les triggers sont remplies');
    console.log('   3. Teste la fonction create_notification manuellement');
    console.log('');
    console.log('🔍 Pour tester les triggers:');
    console.log('   1. Crée une nouvelle demande d\'avance via l\'interface');
    console.log('   2. Change le statut d\'une demande existante');
    console.log('   3. Vérifie que les notifications apparaissent');
    
  } catch (error) {
    console.error('❌ Erreur lors du débogage:', error);
    process.exit(1);
  }
}

// Exécuter le script
debugNotificationTriggers(); 
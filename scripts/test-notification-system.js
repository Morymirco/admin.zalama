const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = 'https://mspmrzlqhwpdkkburjiw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zcG1yemxxaHdwZGtrYnVyaml3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3ODcyNTgsImV4cCI6MjA2NjM2MzI1OH0.zr-TRpKjGJjW0nRtsyPcCLy4Us-c5tOGX71k5_3JJd0';

async function testNotificationSystem() {
  try {
    console.log('🧪 Test du système de notifications...');
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // 1. Vérifier que la table notifications existe
    console.log('1. Vérification de la table notifications...');
    const { data: notifications, error: notificationsError } = await supabase
      .from('notifications')
      .select('*')
      .limit(5);
    
    if (notificationsError) {
      console.error('❌ Erreur avec la table notifications:', notificationsError);
      return;
    }
    
    console.log('✅ Table notifications accessible');
    console.log(`📊 Nombre de notifications existantes: ${notifications?.length || 0}`);
    
    // 2. Vérifier qu'il y a des utilisateurs admin
    console.log('2. Vérification des utilisateurs admin...');
    const { data: adminUsers, error: adminError } = await supabase
      .from('admin_users')
      .select('id, email, display_name')
      .eq('active', true)
      .limit(5);
    
    if (adminError) {
      console.error('❌ Erreur avec la table admin_users:', adminError);
      return;
    }
    
    if (!adminUsers || adminUsers.length === 0) {
      console.error('❌ Aucun utilisateur admin trouvé');
      return;
    }
    
    console.log('✅ Utilisateurs admin trouvés:', adminUsers.length);
    console.log('👥 Admins:', adminUsers.map(u => `${u.display_name} (${u.email})`));
    
    // 3. Tester la création manuelle d'une notification
    console.log('3. Test de création manuelle d\'une notification...');
    const testAdminId = adminUsers[0].id;
    
    const { data: newNotification, error: createError } = await supabase
      .rpc('create_notification', {
        p_user_id: testAdminId,
        p_titre: 'Test de notification',
        p_message: 'Ceci est un test du système de notifications',
        p_type: 'Information'
      });
    
    if (createError) {
      console.error('❌ Erreur lors de la création de notification:', createError);
      return;
    }
    
    console.log('✅ Notification créée avec succès, ID:', newNotification);
    
    // 4. Vérifier que la notification a été créée
    const { data: createdNotification, error: fetchError } = await supabase
      .from('notifications')
      .select('*')
      .eq('id', newNotification)
      .single();
    
    if (fetchError) {
      console.error('❌ Erreur lors de la récupération de la notification:', fetchError);
      return;
    }
    
    console.log('✅ Notification récupérée:', {
      id: createdNotification.id,
      titre: createdNotification.titre,
      message: createdNotification.message,
      type: createdNotification.type,
      lu: createdNotification.lu,
      date_creation: createdNotification.date_creation
    });
    
    // 5. Tester le marquage comme lue
    console.log('5. Test du marquage comme lue...');
    const { data: markResult, error: markError } = await supabase
      .rpc('mark_notification_as_read', {
        p_notification_id: newNotification
      });
    
    if (markError) {
      console.error('❌ Erreur lors du marquage comme lue:', markError);
      return;
    }
    
    console.log('✅ Notification marquée comme lue:', markResult);
    
    // 6. Vérifier le statut après marquage
    const { data: updatedNotification, error: updateFetchError } = await supabase
      .from('notifications')
      .select('*')
      .eq('id', newNotification)
      .single();
    
    if (updateFetchError) {
      console.error('❌ Erreur lors de la récupération de la notification mise à jour:', updateFetchError);
      return;
    }
    
    console.log('✅ Statut après marquage:', {
      lu: updatedNotification.lu,
      date_lecture: updatedNotification.date_lecture
    });
    
    // 7. Tester les statistiques
    console.log('7. Test des statistiques...');
    const { data: stats, error: statsError } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', testAdminId);
    
    if (statsError) {
      console.error('❌ Erreur lors du calcul des statistiques:', statsError);
      return;
    }
    
    const totalNotifications = stats?.length || 0;
    const unreadNotifications = stats?.filter(n => !n.lu).length || 0;
    const notificationsByType = {};
    
    stats?.forEach(n => {
      notificationsByType[n.type] = (notificationsByType[n.type] || 0) + 1;
    });
    
    console.log('📊 Statistiques pour l\'utilisateur:');
    console.log(`   Total: ${totalNotifications}`);
    console.log(`   Non lues: ${unreadNotifications}`);
    console.log(`   Par type:`, notificationsByType);
    
    // 8. Nettoyer la notification de test
    console.log('8. Nettoyage de la notification de test...');
    const { error: deleteError } = await supabase
      .from('notifications')
      .delete()
      .eq('id', newNotification);
    
    if (deleteError) {
      console.error('❌ Erreur lors de la suppression de la notification de test:', deleteError);
      return;
    }
    
    console.log('✅ Notification de test supprimée');
    
    console.log('');
    console.log('🎉 Tests terminés avec succès!');
    console.log('✅ Le système de notifications fonctionne correctement');
    console.log('');
    console.log('📋 Prochaines étapes:');
    console.log('1. Appliquer les triggers via l\'interface SQL de Supabase');
    console.log('2. Tester les notifications automatiques en créant des demandes/transactions');
    console.log('3. Vérifier que les notifications apparaissent dans l\'interface utilisateur');
    
  } catch (error) {
    console.error('❌ Erreur lors des tests:', error);
    process.exit(1);
  }
}

// Exécuter les tests
testNotificationSystem(); 
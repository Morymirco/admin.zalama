const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = 'https://mspmrzlqhwpdkkburjiw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zcG1yemxxaHdwZGtrYnVyaml3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3ODcyNTgsImV4cCI6MjA2NjM2MzI1OH0.zr-TRpKjGJjW0nRtsyPcCLy4Us-c5tOGX71k5_3JJd0';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testNotificationService() {
  console.log('🧪 Test du service de notifications...\n');

  try {
    // 1. Récupérer un utilisateur de test
    console.log('1. Récupération d\'un utilisateur de test...');
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('id, email')
      .limit(1);

    if (userError || !users || users.length === 0) {
      console.error('❌ Aucun utilisateur trouvé pour le test');
      return;
    }

    const testUser = users[0];
    console.log(`✅ Utilisateur de test: ${testUser.email} (ID: ${testUser.id})\n`);

    // 2. Créer une notification de test
    console.log('2. Création d\'une notification de test...');
    const { data: notificationId, error: createError } = await supabase
      .rpc('create_notification', {
        p_user_id: testUser.id,
        p_titre: 'Test de notification',
        p_message: 'Ceci est un test pour vérifier les boucles infinies',
        p_type: 'Information'
      });

    if (createError) {
      console.error('❌ Erreur lors de la création de la notification:', createError);
      return;
    }

    console.log(`✅ Notification créée avec l'ID: ${notificationId}\n`);

    // 3. Récupérer les notifications de l'utilisateur
    console.log('3. Récupération des notifications...');
    const { data: notifications, error: fetchError } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', testUser.id)
      .order('date_creation', { ascending: false });

    if (fetchError) {
      console.error('❌ Erreur lors de la récupération des notifications:', fetchError);
      return;
    }

    console.log(`✅ ${notifications.length} notifications trouvées\n`);

    // 4. Récupérer les statistiques
    console.log('4. Récupération des statistiques...');
    const { data: stats, error: statsError } = await supabase
      .rpc('get_notification_stats', {
        p_user_id: testUser.id
      });

    if (statsError) {
      console.error('❌ Erreur lors de la récupération des statistiques:', statsError);
      return;
    }

    console.log('✅ Statistiques récupérées:', stats, '\n');

    // 5. Marquer la notification comme lue
    console.log('5. Marquage de la notification comme lue...');
    const { data: markResult, error: markError } = await supabase
      .rpc('mark_notification_as_read', {
        p_notification_id: notificationId
      });

    if (markError) {
      console.error('❌ Erreur lors du marquage:', markError);
      return;
    }

    console.log(`✅ Notification marquée comme lue: ${markResult}\n`);

    // 6. Vérifier les statistiques après marquage
    console.log('6. Vérification des statistiques après marquage...');
    const { data: statsAfter, error: statsAfterError } = await supabase
      .rpc('get_notification_stats', {
        p_user_id: testUser.id
      });

    if (statsAfterError) {
      console.error('❌ Erreur lors de la récupération des statistiques:', statsAfterError);
      return;
    }

    console.log('✅ Statistiques après marquage:', statsAfter, '\n');

    // 7. Nettoyer la notification de test
    console.log('7. Nettoyage de la notification de test...');
    const { error: deleteError } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId);

    if (deleteError) {
      console.error('❌ Erreur lors de la suppression:', deleteError);
      return;
    }

    console.log('✅ Notification de test supprimée\n');

    console.log('🎉 Tous les tests du service de notifications sont passés avec succès !');
    console.log('📝 Les boucles infinies devraient être résolues avec les optimisations apportées.');

  } catch (error) {
    console.error('❌ Erreur générale lors du test:', error);
  }
}

// Fonction pour tester les fonctions RPC
async function testRPCFunctions() {
  console.log('🔧 Test des fonctions RPC...\n');

  try {
    // Test de la fonction get_notification_stats
    console.log('Test de get_notification_stats...');
    const { data: users } = await supabase
      .from('users')
      .select('id')
      .limit(1);

    if (users && users.length > 0) {
      const { data, error } = await supabase
        .rpc('get_notification_stats', {
          p_user_id: users[0].id
        });

      if (error) {
        console.error('❌ Erreur get_notification_stats:', error);
      } else {
        console.log('✅ get_notification_stats fonctionne:', data);
      }
    }

  } catch (error) {
    console.error('❌ Erreur lors du test des fonctions RPC:', error);
  }
}

// Exécuter les tests
async function runTests() {
  console.log('🚀 Démarrage des tests de notifications...\n');
  
  await testRPCFunctions();
  console.log('\n' + '='.repeat(50) + '\n');
  await testNotificationService();
}

runTests().catch(console.error); 
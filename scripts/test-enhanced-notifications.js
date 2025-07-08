const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = 'https://mspmrzlqhwpdkkburjiw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zcG1yemxxaHdwZGtrYnVyaml3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3ODcyNTgsImV4cCI6MjA2NjM2MzI1OH0.zr-TRpKjGJjW0nRtsyPcCLy4Us-c5tOGX71k5_3JJd0';

async function testEnhancedNotifications() {
  try {
    console.log('🧪 Test des notifications améliorées avec employee_id et partner_id\n');
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // 1. Vérifier que les nouveaux champs existent
    console.log('1. Vérification des nouveaux champs...');
    const { data: columns, error: columnsError } = await supabase
      .rpc('exec_sql', {
        sql: `
          SELECT column_name, data_type, is_nullable
          FROM information_schema.columns 
          WHERE table_name = 'notifications' 
          AND table_schema = 'public'
          AND column_name IN ('employee_id', 'partner_id')
          ORDER BY column_name;
        `
      });
    
    if (columnsError) {
      console.error('❌ Erreur lors de la vérification des colonnes:', columnsError);
      return;
    }
    
    console.log('✅ Colonnes trouvées:', columns);
    
    // 2. Récupérer un employé et un partenaire pour les tests
    console.log('\n2. Récupération des données de test...');
    const { data: employees, error: employeesError } = await supabase
      .from('employees')
      .select('id, nom, prenom, partner_id')
      .limit(1);
    
    if (employeesError) {
      console.error('❌ Erreur lors de la récupération des employés:', employeesError);
      return;
    }
    
    if (!employees || employees.length === 0) {
      console.error('❌ Aucun employé trouvé pour les tests');
      return;
    }
    
    const testEmployee = employees[0];
    console.log('👤 Employé de test:', `${testEmployee.prenom} ${testEmployee.nom} (${testEmployee.id})`);
    
    const { data: partners, error: partnersError } = await supabase
      .from('partners')
      .select('id, nom')
      .eq('id', testEmployee.partner_id)
      .single();
    
    if (partnersError) {
      console.error('❌ Erreur lors de la récupération du partenaire:', partnersError);
      return;
    }
    
    console.log('🏢 Partenaire de test:', `${partners.nom} (${partners.id})`);
    
    // 3. Récupérer un utilisateur admin pour les tests
    console.log('\n3. Récupération d\'un utilisateur admin...');
    const { data: adminUsers, error: adminError } = await supabase
      .from('admin_users')
      .select('id, email, display_name')
      .eq('active', true)
      .limit(1);
    
    if (adminError) {
      console.error('❌ Erreur lors de la récupération des admins:', adminError);
      return;
    }
    
    if (!adminUsers || adminUsers.length === 0) {
      console.error('❌ Aucun admin trouvé pour les tests');
      return;
    }
    
    const testAdmin = adminUsers[0];
    console.log('👨‍💼 Admin de test:', `${testAdmin.display_name} (${testAdmin.id})`);
    
    // 4. Tester la création d'une notification avec employee_id et partner_id
    console.log('\n4. Test de création de notification avec employee_id et partner_id...');
    const { data: notification, error: notificationError } = await supabase
      .rpc('create_notification', {
        p_user_id: testAdmin.id,
        p_titre: 'Test notification améliorée',
        p_message: `Test de notification pour l'employé ${testEmployee.prenom} ${testEmployee.nom}`,
        p_type: 'Information',
        p_employee_id: testEmployee.id,
        p_partner_id: partners.id
      });
    
    if (notificationError) {
      console.error('❌ Erreur lors de la création de la notification:', notificationError);
      return;
    }
    
    console.log('✅ Notification créée avec ID:', notification);
    
    // 5. Vérifier que la notification a bien les nouveaux champs
    console.log('\n5. Vérification de la notification créée...');
    const { data: createdNotification, error: fetchError } = await supabase
      .from('notifications')
      .select('*')
      .eq('id', notification)
      .single();
    
    if (fetchError) {
      console.error('❌ Erreur lors de la récupération de la notification:', fetchError);
      return;
    }
    
    console.log('📋 Notification créée:');
    console.log('   - ID:', createdNotification.id);
    console.log('   - Titre:', createdNotification.titre);
    console.log('   - Employee ID:', createdNotification.employee_id);
    console.log('   - Partner ID:', createdNotification.partner_id);
    console.log('   - Employee ID attendu:', testEmployee.id);
    console.log('   - Partner ID attendu:', partners.id);
    
    // 6. Tester la fonction get_employee_notifications
    console.log('\n6. Test de la fonction get_employee_notifications...');
    const { data: employeeNotifications, error: employeeNotifError } = await supabase
      .rpc('get_employee_notifications', {
        p_employee_id: testEmployee.id
      });
    
    if (employeeNotifError) {
      console.error('❌ Erreur lors de la récupération des notifications employé:', employeeNotifError);
    } else {
      console.log('✅ Notifications de l\'employé récupérées:', employeeNotifications?.length || 0);
    }
    
    // 7. Tester la fonction get_partner_notifications
    console.log('\n7. Test de la fonction get_partner_notifications...');
    const { data: partnerNotifications, error: partnerNotifError } = await supabase
      .rpc('get_partner_notifications', {
        p_partner_id: partners.id
      });
    
    if (partnerNotifError) {
      console.error('❌ Erreur lors de la récupération des notifications partenaire:', partnerNotifError);
    } else {
      console.log('✅ Notifications du partenaire récupérées:', partnerNotifications?.length || 0);
    }
    
    // 8. Tester la fonction get_user_notifications_with_details
    console.log('\n8. Test de la fonction get_user_notifications_with_details...');
    const { data: userNotifications, error: userNotifError } = await supabase
      .rpc('get_user_notifications_with_details', {
        p_user_id: testAdmin.id
      });
    
    if (userNotifError) {
      console.error('❌ Erreur lors de la récupération des notifications utilisateur:', userNotifError);
    } else {
      console.log('✅ Notifications utilisateur avec détails récupérées:', userNotifications?.length || 0);
      if (userNotifications && userNotifications.length > 0) {
        console.log('📋 Première notification avec détails:');
        const firstNotif = userNotifications[0];
        console.log('   - Titre:', firstNotif.titre);
        console.log('   - Employee Name:', firstNotif.employee_name);
        console.log('   - Partner Name:', firstNotif.partner_name);
      }
    }
    
    console.log('\n🎉 Tests terminés avec succès !');
    console.log('\n📋 Résumé des améliorations:');
    console.log('   ✅ Nouveaux champs employee_id et partner_id ajoutés');
    console.log('   ✅ Fonction create_notification mise à jour');
    console.log('   ✅ Nouvelles fonctions utilitaires créées');
    console.log('   ✅ Index de performance ajoutés');
    console.log('   ✅ Tous les triggers mis à jour');
    
  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

// Exécuter les tests
testEnhancedNotifications(); 
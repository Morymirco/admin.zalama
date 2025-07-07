const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuration Supabase
const supabaseUrl = 'https://mspmrzlqhwpdkkburjiw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zcG1yemxxaHdwZGtrYnVyaml3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3ODcyNTgsImV4cCI6MjA2NjM2MzI1OH0.zr-TRpKjGJjW0nRtsyPcCLy4Us-c5tOGX71k5_3JJd0';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function applyNotificationTriggers() {
  console.log('🚀 Application des triggers de notifications...\n');

  try {
    // Lire le fichier SQL des triggers
    const triggersPath = path.join(__dirname, '../supabase/notification_triggers.sql');
    const sqlContent = fs.readFileSync(triggersPath, 'utf8');

    console.log('📄 Contenu du fichier SQL chargé');
    console.log('📊 Taille du fichier:', (sqlContent.length / 1024).toFixed(2), 'KB\n');

    // Diviser le SQL en sections pour un meilleur contrôle
    const sections = sqlContent.split('-- =====================================================');
    
    console.log('🔧 Application des triggers par sections...\n');

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < sections.length; i++) {
      const section = sections[i].trim();
      if (!section) continue;

      const sectionTitle = section.split('\n')[0]?.replace('--', '').trim() || `Section ${i + 1}`;
      console.log(`📋 Application de: ${sectionTitle}`);

      try {
        // Exécuter la section SQL
        const { error } = await supabase.rpc('exec_sql', { sql: section });
        
        if (error) {
          console.error(`❌ Erreur dans ${sectionTitle}:`, error.message);
          errorCount++;
        } else {
          console.log(`✅ ${sectionTitle} appliqué avec succès`);
          successCount++;
        }
      } catch (err) {
        console.error(`❌ Exception dans ${sectionTitle}:`, err.message);
        errorCount++;
      }
    }

    console.log('\n📊 Résumé de l\'application:');
    console.log(`✅ Sections réussies: ${successCount}`);
    console.log(`❌ Sections en erreur: ${errorCount}`);
    console.log(`📈 Taux de réussite: ${((successCount / (successCount + errorCount)) * 100).toFixed(1)}%`);

    if (errorCount === 0) {
      console.log('\n🎉 Tous les triggers de notifications ont été appliqués avec succès !');
    } else {
      console.log('\n⚠️  Certains triggers n\'ont pas pu être appliqués. Vérifiez les erreurs ci-dessus.');
    }

  } catch (error) {
    console.error('❌ Erreur générale lors de l\'application des triggers:', error);
  }
}

// Fonction alternative pour appliquer le SQL complet
async function applyCompleteSQL() {
  console.log('🚀 Application du SQL complet des triggers...\n');

  try {
    const triggersPath = path.join(__dirname, '../supabase/notification_triggers.sql');
    const sqlContent = fs.readFileSync(triggersPath, 'utf8');

    console.log('📄 Application du fichier SQL complet...');

    // Utiliser la méthode directe SQL
    const { error } = await supabase.rpc('exec_sql', { sql: sqlContent });

    if (error) {
      console.error('❌ Erreur lors de l\'application:', error);
    } else {
      console.log('✅ Tous les triggers ont été appliqués avec succès !');
    }

  } catch (error) {
    console.error('❌ Erreur lors de l\'application du SQL complet:', error);
  }
}

// Fonction pour vérifier les triggers existants
async function checkExistingTriggers() {
  console.log('🔍 Vérification des triggers existants...\n');

  try {
    // Vérifier les fonctions existantes
    const { data: functions, error: funcError } = await supabase
      .from('information_schema.routines')
      .select('routine_name')
      .eq('routine_type', 'FUNCTION')
      .like('routine_name', 'notify_%');

    if (funcError) {
      console.error('❌ Erreur lors de la vérification des fonctions:', funcError);
      return;
    }

    console.log('📋 Fonctions de notification existantes:');
    if (functions && functions.length > 0) {
      functions.forEach(func => {
        console.log(`  - ${func.routine_name}`);
      });
    } else {
      console.log('  Aucune fonction de notification trouvée');
    }

    // Vérifier les triggers existants
    const { data: triggers, error: triggerError } = await supabase
      .from('information_schema.triggers')
      .select('trigger_name, event_object_table')
      .like('trigger_name', 'trigger_%');

    if (triggerError) {
      console.error('❌ Erreur lors de la vérification des triggers:', triggerError);
      return;
    }

    console.log('\n📋 Triggers existants:');
    if (triggers && triggers.length > 0) {
      triggers.forEach(trigger => {
        console.log(`  - ${trigger.trigger_name} (table: ${trigger.event_object_table})`);
      });
    } else {
      console.log('  Aucun trigger trouvé');
    }

  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error);
  }
}

// Fonction pour tester les triggers
async function testTriggers() {
  console.log('🧪 Test des triggers de notifications...\n');

  try {
    // 1. Créer un utilisateur de test
    console.log('1. Création d\'un utilisateur de test...');
    const { data: testUser, error: userError } = await supabase
      .from('admin_users')
      .select('id, email')
      .limit(1);
    
    if (userError || !testUser || testUser.length === 0) {
      console.error('❌ Aucun utilisateur trouvé pour le test');
      return;
    }

    const userId = testUser[0].id;
    console.log(`✅ Utilisateur de test: ${testUser[0].email}\n`);

    // 2. Créer un partenaire de test
    console.log('2. Création d\'un partenaire de test...');
    const { data: partner, error: partnerError } = await supabase
      .from('partners')
      .insert({
        nom: 'Partenaire Test Notifications',
        type: 'Entreprise',
        secteur: 'Technologie',
        email: 'test@partenaire.com'
      })
      .select()
      .single();

    if (partnerError) {
      console.error('❌ Erreur lors de la création du partenaire:', partnerError);
      return;
    }

    console.log(`✅ Partenaire créé: ${partner.nom}\n`);

    // 3. Créer un employé de test
    console.log('3. Création d\'un employé de test...');
    const { data: employee, error: employeeError } = await supabase
      .from('employees')
      .insert({
        nom: 'Dupont',
        prenom: 'Jean',
        genre: 'Homme',
        poste: 'Développeur',
        type_contrat: 'CDI',
        partner_id: partner.id
      })
      .select()
      .single();

    if (employeeError) {
      console.error('❌ Erreur lors de la création de l\'employé:', employeeError);
      return;
    }
    
    console.log(`✅ Employé créé: ${employee.nom} ${employee.prenom}\n`);

    // 4. Vérifier les notifications créées
    console.log('4. Vérification des notifications créées...');
    const { data: notifications, error: notifError } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('date_creation', { ascending: false });

    if (notifError) {
      console.error('❌ Erreur lors de la vérification des notifications:', notifError);
      return;
    }

    console.log(`✅ ${notifications.length} notifications trouvées:`);
    notifications.forEach((notif, index) => {
      console.log(`  ${index + 1}. ${notif.titre} - ${notif.type}`);
    });

    // 5. Nettoyer les données de test
    console.log('\n5. Nettoyage des données de test...');
    await supabase.from('employees').delete().eq('id', employee.id);
    await supabase.from('partners').delete().eq('id', partner.id);
    await supabase.from('notifications').delete().eq('user_id', userId);

    console.log('✅ Données de test nettoyées\n');

    console.log('🎉 Test des triggers terminé avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  }
}

// Menu principal
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case 'apply':
      await applyNotificationTriggers();
      break;
    case 'apply-complete':
      await applyCompleteSQL();
      break;
    case 'check':
      await checkExistingTriggers();
      break;
    case 'test':
      await testTriggers();
      break;
    case 'all':
      console.log('🔄 Exécution de toutes les opérations...\n');
      await checkExistingTriggers();
      console.log('\n' + '='.repeat(50) + '\n');
      await applyNotificationTriggers();
      console.log('\n' + '='.repeat(50) + '\n');
      await testTriggers();
      break;
    default:
      console.log('📋 Usage: node apply-notification-triggers.js [command]');
      console.log('');
      console.log('Commandes disponibles:');
      console.log('  apply         - Appliquer les triggers par sections');
      console.log('  apply-complete - Appliquer le SQL complet');
      console.log('  check         - Vérifier les triggers existants');
      console.log('  test          - Tester les triggers');
      console.log('  all           - Exécuter toutes les opérations');
      console.log('');
      console.log('Exemple: node apply-notification-triggers.js all');
  }
}

// Exécuter le script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  applyNotificationTriggers,
  applyCompleteSQL,
  checkExistingTriggers,
  testTriggers
}; 
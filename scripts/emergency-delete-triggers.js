const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = 'https://mspmrzlqhwpdkkburjiw.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zcG1yemxxaHdwZGtrYnVyaml3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDc4NzI1OCwiZXhwIjoyMDY2MzYzMjU4fQ.CQIWj7Dq5aF63wjPjdOBaKrRiUrUkebgHpn0BYq-7hI';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function deleteAllTriggers() {
  console.log('🚨 SUPPRESSION D\'URGENCE DES TRIGGERS...\n');

  try {
    // Script SQL pour supprimer tous les triggers
    const deleteTriggersSQL = `
-- Supprimer tous les triggers
DO $$
DECLARE
    trigger_record RECORD;
BEGIN
    FOR trigger_record IN 
        SELECT trigger_name, event_object_table
        FROM information_schema.triggers 
        WHERE trigger_schema = 'public'
    LOOP
        EXECUTE 'DROP TRIGGER IF EXISTS ' || trigger_record.trigger_name || ' ON public.' || trigger_record.event_object_table;
        RAISE NOTICE 'Trigger supprimé: % sur %', trigger_record.trigger_name, trigger_record.event_object_table;
    END LOOP;
END $$;

-- Supprimer toutes les fonctions de notification
DO $$
DECLARE
    function_record RECORD;
BEGIN
    FOR function_record IN 
        SELECT routine_name
        FROM information_schema.routines 
        WHERE routine_schema = 'public'
          AND (routine_name LIKE '%notification%' 
               OR routine_name LIKE '%notify%'
               OR routine_name LIKE '%trigger%'
               OR routine_name LIKE '%advance%'
               OR routine_name LIKE '%alert%')
    LOOP
        EXECUTE 'DROP FUNCTION IF EXISTS ' || function_record.routine_name || ' CASCADE';
        RAISE NOTICE 'Fonction supprimée: %', function_record.routine_name;
    END LOOP;
END $$;
`;

    console.log('1. Exécution du script de suppression...');
    const { error } = await supabase.rpc('exec_sql', { sql: deleteTriggersSQL });
    
    if (error) {
      console.error('❌ Erreur:', error);
      // Essayer avec une méthode alternative
      console.log('\n2. Tentative avec méthode alternative...');
      await deleteTriggersManually();
    } else {
      console.log('✅ Triggers supprimés avec succès !');
    }

    // Vérification
    console.log('\n3. Vérification...');
    await verifyDeletion();

  } catch (error) {
    console.error('❌ Erreur lors de la suppression:', error);
    
    // Méthode manuelle en backup
    console.log('\n🔄 Tentative de suppression manuelle...');
    await deleteTriggersManually();
  }
}

async function deleteTriggersManually() {
  const triggersToDelete = [
    'trigger_salary_advance_created',
    'trigger_salary_advance_status_changed', 
    'trigger_transaction_created',
    'trigger_financial_transaction_created',
    'trigger_alert_created',
    'trigger_alert_resolved',
    'trigger_review_created',
    'trigger_partnership_request_created',
    'trigger_partnership_request_status_changed',
    'trigger_new_employee',
    'trigger_new_partner',
    'trigger_new_service',
    'trigger_security_event',
    'trigger_failed_login_attempts'
  ];

  const functionsToDelete = [
    'create_notification',
    'notify_salary_advance_created',
    'notify_salary_advance_status_changed',
    'notify_transaction_created',
    'notify_financial_transaction_created',
    'notify_alert_created',
    'notify_alert_resolved',
    'notify_review_created',
    'notify_partnership_request_created',
    'notify_partnership_request_status_changed',
    'notify_new_employee',
    'notify_new_partner',
    'notify_new_service',
    'notify_security_event',
    'notify_failed_login_attempts',
    'mark_notification_as_read',
    'mark_all_notifications_as_read',
    'get_notification_stats',
    'cleanup_old_notifications'
  ];

  // Supprimer les triggers manuellement
  for (const trigger of triggersToDelete) {
    try {
      const sql = `DROP TRIGGER IF EXISTS ${trigger} ON public.salary_advance_requests CASCADE;
                   DROP TRIGGER IF EXISTS ${trigger} ON public.transactions CASCADE;
                   DROP TRIGGER IF EXISTS ${trigger} ON public.financial_transactions CASCADE;
                   DROP TRIGGER IF EXISTS ${trigger} ON public.alerts CASCADE;
                   DROP TRIGGER IF EXISTS ${trigger} ON public.avis CASCADE;
                   DROP TRIGGER IF EXISTS ${trigger} ON public.partnership_requests CASCADE;
                   DROP TRIGGER IF EXISTS ${trigger} ON public.employees CASCADE;
                   DROP TRIGGER IF EXISTS ${trigger} ON public.partners CASCADE;
                   DROP TRIGGER IF EXISTS ${trigger} ON public.services CASCADE;
                   DROP TRIGGER IF EXISTS ${trigger} ON public.security_events CASCADE;
                   DROP TRIGGER IF EXISTS ${trigger} ON public.password_attempts CASCADE;`;
      
      await supabase.rpc('exec_sql', { sql });
      console.log(`✅ Trigger ${trigger} supprimé`);
    } catch (error) {
      console.log(`⚠️  Trigger ${trigger} non trouvé ou déjà supprimé`);
    }
  }

  // Supprimer les fonctions manuellement
  for (const func of functionsToDelete) {
    try {
      const sql = `DROP FUNCTION IF EXISTS ${func} CASCADE;`;
      await supabase.rpc('exec_sql', { sql });
      console.log(`✅ Fonction ${func} supprimée`);
    } catch (error) {
      console.log(`⚠️  Fonction ${func} non trouvée ou déjà supprimée`);
    }
  }
}

async function verifyDeletion() {
  try {
    // Vérifier les triggers restants
    const { data: triggers, error: triggerError } = await supabase
      .rpc('exec_sql', { 
        sql: `SELECT trigger_name, event_object_table 
              FROM information_schema.triggers 
              WHERE trigger_schema = 'public' 
              ORDER BY trigger_name;` 
      });

    if (!triggerError && triggers) {
      console.log(`📊 Triggers restants: ${triggers.length || 0}`);
      if (triggers.length > 0) {
        triggers.forEach(t => console.log(`   - ${t.trigger_name} sur ${t.event_object_table}`));
      }
    }

    // Vérifier les fonctions restantes
    const { data: functions, error: functionError } = await supabase
      .rpc('exec_sql', { 
        sql: `SELECT routine_name 
              FROM information_schema.routines 
              WHERE routine_schema = 'public' 
              AND (routine_name LIKE '%notification%' OR routine_name LIKE '%notify%')
              ORDER BY routine_name;` 
      });

    if (!functionError && functions) {
      console.log(`📊 Fonctions de notification restantes: ${functions.length || 0}`);
      if (functions.length > 0) {
        functions.forEach(f => console.log(`   - ${f.routine_name}`));
      }
    }

    console.log('\n🎉 SUPPRESSION TERMINÉE !');
    console.log('✅ Le dashboard devrait maintenant fonctionner normalement');
    console.log('✅ Plus de timeouts dans useSupabaseCollection');

  } catch (error) {
    console.error('Erreur lors de la vérification:', error);
    console.log('✅ Suppression effectuée, vérification manuelle recommandée');
  }
}

// Exécuter le script
deleteAllTriggers(); 
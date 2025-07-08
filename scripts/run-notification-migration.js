require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuration Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mspmrzlqhwpdkkburjiw.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY est requis !');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runNotificationMigration() {
  try {
    console.log('🚀 Migration des notifications avec employee_id et partner_id...\n');
    
    // 1. Lire le fichier de migration
    const migrationPath = path.join(__dirname, '../supabase/add_notification_fields.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('📋 Fichier de migration chargé:', migrationPath);
    
    // 2. Exécuter la migration
    console.log('🔄 Exécution de la migration...');
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: migrationSQL
    });
    
    if (error) {
      console.error('❌ Erreur lors de la migration:', error);
      return;
    }
    
    console.log('✅ Migration exécutée avec succès !');
    
    // 3. Vérifier que les champs ont été ajoutés
    console.log('\n🔍 Vérification des nouveaux champs...');
    const { data: columns, error: columnsError } = await supabase.rpc('exec_sql', {
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
      console.error('❌ Erreur lors de la vérification:', columnsError);
      return;
    }
    
    console.log('✅ Colonnes vérifiées:', columns);
    
    // 4. Vérifier les index
    console.log('\n🔍 Vérification des index...');
    const { data: indexes, error: indexesError } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT indexname, indexdef
        FROM pg_indexes
        WHERE tablename = 'notifications'
        AND indexname LIKE '%employee%' OR indexname LIKE '%partner%'
        ORDER BY indexname;
      `
    });
    
    if (indexesError) {
      console.error('❌ Erreur lors de la vérification des index:', indexesError);
    } else {
      console.log('✅ Index créés:', indexes?.length || 0);
      if (indexes) {
        indexes.forEach(index => {
          console.log(`   - ${index.indexname}`);
        });
      }
    }
    
    // 5. Vérifier les fonctions
    console.log('\n🔍 Vérification des fonctions...');
    const { data: functions, error: functionsError } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT routine_name, routine_type
        FROM information_schema.routines
        WHERE routine_schema = 'public'
        AND routine_name IN (
          'get_employee_notifications',
          'get_partner_notifications',
          'get_user_notifications_with_details',
          'migrate_existing_notifications'
        )
        ORDER BY routine_name;
      `
    });
    
    if (functionsError) {
      console.error('❌ Erreur lors de la vérification des fonctions:', functionsError);
    } else {
      console.log('✅ Fonctions créées:', functions?.length || 0);
      if (functions) {
        functions.forEach(func => {
          console.log(`   - ${func.routine_name} (${func.routine_type})`);
        });
      }
    }
    
    console.log('\n🎉 Migration terminée avec succès !');
    console.log('\n📋 Résumé des améliorations:');
    console.log('   ✅ Nouveaux champs employee_id et partner_id ajoutés');
    console.log('   ✅ Index de performance créés');
    console.log('   ✅ Fonctions utilitaires ajoutées');
    console.log('   ✅ Fonction de migration optionnelle disponible');
    console.log('\n💡 Prochaines étapes:');
    console.log('   1. Exécuter les triggers mis à jour');
    console.log('   2. Tester les nouvelles fonctionnalités');
    console.log('   3. Optionnel: migrer les notifications existantes');
    
  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

// Exécuter la migration
runNotificationMigration(); 
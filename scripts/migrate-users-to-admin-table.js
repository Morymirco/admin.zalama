const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement manquantes:');
  console.error('   - NEXT_PUBLIC_SUPABASE_URL');
  console.error('   - SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function migrateUsersToAdminTable() {
  console.log('🔄 Début de la migration des utilisateurs vers la table admin_users...');

  try {
    // Récupérer tous les utilisateurs de Supabase Auth
    const { data: users, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('❌ Erreur lors de la récupération des utilisateurs Auth:', authError);
      return;
    }

    console.log(`📊 ${users.users.length} utilisateurs trouvés dans Supabase Auth`);

    // Récupérer les utilisateurs existants dans admin_users
    const { data: existingUsers, error: dbError } = await supabase
      .from('admin_users')
      .select('id');

    if (dbError) {
      console.error('❌ Erreur lors de la récupération des utilisateurs existants:', dbError);
      return;
    }

    const existingUserIds = new Set(existingUsers.map(user => user.id));
    const usersToMigrate = users.users.filter(user => !existingUserIds.has(user.id));

    console.log(`📋 ${usersToMigrate.length} utilisateurs à migrer`);

    if (usersToMigrate.length === 0) {
      console.log('✅ Aucun utilisateur à migrer');
      return;
    }

    // Préparer les données pour l'insertion
    const usersToInsert = usersToMigrate.map(user => ({
      id: user.id,
      email: user.email,
      display_name: user.user_metadata?.displayName || user.email?.split('@')[0] || 'Utilisateur',
      role: user.user_metadata?.role || 'user',
      partenaire_id: user.user_metadata?.partenaireId || null,
      active: true,
      created_at: user.created_at,
      last_login: user.last_sign_in_at,
    }));

    // Insérer les utilisateurs dans admin_users
    const { data: insertedUsers, error: insertError } = await supabase
      .from('admin_users')
      .insert(usersToInsert)
      .select();

    if (insertError) {
      console.error('❌ Erreur lors de l\'insertion des utilisateurs:', insertError);
      return;
    }

    console.log(`✅ ${insertedUsers.length} utilisateurs migrés avec succès`);
    
    // Afficher les détails des utilisateurs migrés
    insertedUsers.forEach(user => {
      console.log(`   - ${user.email} (${user.role})`);
    });

  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
  }
}

// Exécuter la migration
migrateUsersToAdminTable()
  .then(() => {
    console.log('🎉 Migration terminée');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Erreur fatale:', error);
    process.exit(1);
  }); 
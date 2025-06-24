const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Configuration Supabase avec la clé service role (admin)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Erreur: Variables d\'environnement manquantes');
  console.error('Assurez-vous d\'avoir NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY dans votre .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createAdminUser() {
  console.log('🚀 Création de l\'admin par défaut...\n');

  try {
    // 1. Créer l'utilisateur dans Supabase Auth
    console.log('📝 Création de l\'utilisateur dans Supabase Auth...');
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: 'admin@zalama.com',
      password: 'admin123',
      email_confirm: true,
      user_metadata: {
        nom: 'Admin',
        prenom: 'ZaLaMa',
        type: 'Entreprise',
        statut: 'Actif',
        organisation: 'ZaLaMa Admin'
      }
    });

    if (authError) {
      console.error('❌ Erreur lors de la création dans Auth:', authError.message);
      return;
    }

    console.log('✅ Utilisateur créé dans Auth:', authData.user.email);

    // 2. Insérer dans la table users
    console.log('📝 Insertion dans la table users...');
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert([
        {
          id: authData.user.id, // Utiliser le même ID que Auth
          email: 'admin@zalama.com',
          password_hash: 'hashed_password_placeholder', // Placeholder car Auth gère le mot de passe
          nom: 'Admin',
          prenom: 'ZaLaMa',
          type: 'Entreprise',
          statut: 'Actif',
          organisation: 'ZaLaMa Admin',
          actif: true
        }
      ])
      .select();

    if (userError) {
      console.error('❌ Erreur lors de l\'insertion dans la table users:', userError.message);
      
      // Si l'utilisateur existe déjà dans la table, on le met à jour
      if (userError.code === '23505') { // Code d'erreur pour violation de contrainte unique
        console.log('🔄 Mise à jour de l\'utilisateur existant...');
        const { data: updateData, error: updateError } = await supabase
          .from('users')
          .update({
            nom: 'Admin',
            prenom: 'ZaLaMa',
            type: 'Entreprise',
            statut: 'Actif',
            organisation: 'ZaLaMa Admin',
            actif: true,
            updated_at: new Date().toISOString()
          })
          .eq('email', 'admin@zalama.com')
          .select();

        if (updateError) {
          console.error('❌ Erreur lors de la mise à jour:', updateError.message);
          return;
        }
        console.log('✅ Utilisateur mis à jour dans la table users');
      }
    } else {
      console.log('✅ Utilisateur inséré dans la table users');
    }

    console.log('\n🎉 Admin créé avec succès !');
    console.log('📧 Email: admin@zalama.com');
    console.log('🔑 Mot de passe: admin123');
    console.log('🆔 ID: ' + authData.user.id);
    console.log('\n💡 Vous pouvez maintenant vous connecter à l\'application');

  } catch (error) {
    console.error('❌ Erreur inattendue:', error.message);
  }
}

// Fonction pour vérifier si l'admin existe déjà
async function checkAdminExists() {
  console.log('🔍 Vérification de l\'existence de l\'admin...\n');

  try {
    // Vérifier dans Auth
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('❌ Erreur lors de la vérification Auth:', authError.message);
      return false;
    }

    const adminExists = authUsers.users.some(user => user.email === 'admin@zalama.com');
    
    if (adminExists) {
      console.log('⚠️  L\'admin existe déjà dans Supabase Auth');
      
      // Vérifier dans la table users
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', 'admin@zalama.com')
        .single();

      if (userError && userError.code !== 'PGRST116') { // PGRST116 = pas trouvé
        console.error('❌ Erreur lors de la vérification table users:', userError.message);
        return false;
      }

      if (userData) {
        console.log('⚠️  L\'admin existe déjà dans la table users');
        console.log('📧 Email: admin@zalama.com');
        console.log('🆔 ID: ' + userData.id);
        return true;
      } else {
        console.log('ℹ️  Admin existe dans Auth mais pas dans la table users');
        return false;
      }
    }

    console.log('✅ L\'admin n\'existe pas encore');
    return false;

  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error.message);
    return false;
  }
}

// Fonction principale
async function main() {
  console.log('🔧 Script de création de l\'admin ZaLaMa\n');

  const adminExists = await checkAdminExists();
  
  if (adminExists) {
    console.log('\n❓ Voulez-vous recréer l\'admin ? (y/N)');
    // Pour l'automatisation, on continue
    console.log('🔄 Recréation de l\'admin...\n');
  }

  await createAdminUser();
}

// Exécuter le script
main().catch(console.error); 
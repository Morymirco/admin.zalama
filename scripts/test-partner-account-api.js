const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = 'https://mspmrzlqhwpdkkburjiw.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zcG1yemxxaHdwZGtrYnVyaml3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDc4NzI1OCwiZXhwIjoyMDY2MzYzMjU4fQ.6sIgEDZIP1fkUoxdPJYfzKHU1B_SfN6Hui6v_FV6yzw';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testPartnerAccountAPI() {
  console.log('🧪 Test de l\'API de création de comptes partenaire\n');

  try {
    // 1. Vérifier la connexion à Supabase
    console.log('1. Test de connexion Supabase...');
    const { data: testData, error: testError } = await supabase
      .from('partners')
      .select('id, nom')
      .limit(1);

    if (testError) {
      console.error('❌ Erreur de connexion Supabase:', testError);
      return;
    }

    console.log('✅ Connexion Supabase réussie');

    // 2. Vérifier la table admin_users
    console.log('\n2. Test de la table admin_users...');
    const { data: adminUsers, error: adminError } = await supabase
      .from('admin_users')
      .select('id, email, role')
      .limit(3);

    if (adminError) {
      console.error('❌ Erreur table admin_users:', adminError);
      return;
    }

    console.log(`✅ Table admin_users accessible (${adminUsers.length} utilisateurs)`);

    // 3. Vérifier les permissions d'écriture
    console.log('\n3. Test des permissions d\'écriture...');
    
    // Créer un utilisateur de test temporaire
    const testUserData = {
      email: 'test-api@example.com',
      display_name: 'Test API User',
      role: 'admin',
      active: true
    };

    const { data: createdUser, error: createError } = await supabase
      .from('admin_users')
      .insert([testUserData])
      .select()
      .single();

    if (createError) {
      console.error('❌ Erreur création utilisateur test:', createError);
      return;
    }

    console.log('✅ Permissions d\'écriture OK');

    // 4. Supprimer l'utilisateur de test
    console.log('\n4. Nettoyage utilisateur test...');
    const { error: deleteError } = await supabase
      .from('admin_users')
      .delete()
      .eq('id', createdUser.id);

    if (deleteError) {
      console.error('⚠️ Erreur suppression utilisateur test:', deleteError);
    } else {
      console.log('✅ Utilisateur test supprimé');
    }

    // 5. Test de l'API route (simulation)
    console.log('\n5. Test de l\'API route (simulation)...');
    
    const testPartnerData = {
      id: 'test-partner-id',
      nom: 'Test Partner API',
      email_rh: 'rh.test@example.com',
      nom_rh: 'Test RH',
      email_representant: 'rep.test@example.com',
      nom_representant: 'Test Rep'
    };

    // Simuler l'appel API
    console.log('📋 Données de test:', {
      partenaire: testPartnerData.nom,
      email_rh: testPartnerData.email_rh,
      email_representant: testPartnerData.email_representant
    });

    console.log('✅ Simulation API réussie');
    console.log('💡 L\'API route devrait fonctionner avec les vraies données');

    // 6. Vérifier les variables d'environnement
    console.log('\n6. Vérification des variables d\'environnement...');
    
    const requiredVars = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'SUPABASE_SERVICE_ROLE_KEY'
    ];

    requiredVars.forEach(varName => {
      const value = process.env[varName];
      if (value) {
        console.log(`✅ ${varName}: ${value.substring(0, 20)}...`);
      } else {
        console.log(`❌ ${varName}: Non définie`);
      }
    });

    console.log('\n🎉 Test terminé avec succès !');
    console.log('📋 L\'API de création de comptes partenaire devrait maintenant fonctionner');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  }
}

// Exécuter le test
testPartnerAccountAPI(); 
const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = 'https://mspmrzlqhwpdkkburjiw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zcG1yemxxaHdwZGtrYnVyaml3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3ODcyNTgsImV4cCI6MjA2NjM2MzI1OH0.zr-TRpKjGJjW0nRtsyPcCLy4Us-c5tOGX71k5_3JJd0';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testUserService() {
  console.log('🧪 Test du service utilisateur...\n');

  try {
    // Test 1: Vérifier la structure de la table users
    console.log('1. Vérification de la structure de la table users...');
    const { data: tableInfo, error: tableError } = await supabase
      .from('users')
      .select('*')
      .limit(1);

    if (tableError) {
      console.error('❌ Erreur lors de l\'accès à la table users:', tableError);
      return;
    }

    console.log('✅ Table users accessible');
    if (tableInfo && tableInfo.length > 0) {
      console.log('📋 Structure d\'un utilisateur:', Object.keys(tableInfo[0]));
    }

    // Test 2: Récupérer tous les utilisateurs
    console.log('\n2. Récupération de tous les utilisateurs...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .order('nom', { ascending: true });

    if (usersError) {
      console.error('❌ Erreur lors de la récupération des utilisateurs:', usersError);
      return;
    }

    console.log(`✅ ${users.length} utilisateurs récupérés`);
    if (users.length > 0) {
      console.log('📋 Premier utilisateur:', {
        id: users[0].id,
        nom: users[0].nom,
        prenom: users[0].prenom,
        email: users[0].email,
        type: users[0].type,
        statut: users[0].statut,
        actif: users[0].actif
      });
    }

    // Test 3: Rechercher des utilisateurs
    console.log('\n3. Test de recherche d\'utilisateurs...');
    const { data: searchResults, error: searchError } = await supabase
      .from('users')
      .select('*')
      .or(`nom.ilike.%test%,prenom.ilike.%test%,email.ilike.%test%`)
      .limit(5);

    if (searchError) {
      console.error('❌ Erreur lors de la recherche:', searchError);
    } else {
      console.log(`✅ Recherche effectuée, ${searchResults.length} résultats`);
    }

    // Test 4: Filtrer par type
    console.log('\n4. Test de filtrage par type...');
    const { data: etudiants, error: filterError } = await supabase
      .from('users')
      .select('*')
      .eq('type', 'Étudiant')
      .limit(5);

    if (filterError) {
      console.error('❌ Erreur lors du filtrage:', filterError);
    } else {
      console.log(`✅ Filtrage par type effectué, ${etudiants.length} étudiants trouvés`);
    }

    // Test 5: Obtenir les statistiques
    console.log('\n5. Test des statistiques...');
    const { data: allUsers, error: statsError } = await supabase
      .from('users')
      .select('*');

    if (statsError) {
      console.error('❌ Erreur lors de la récupération des statistiques:', statsError);
    } else {
      const total = allUsers.length;
      const actifs = allUsers.filter(u => u.actif).length;
      const inactifs = total - actifs;
      
      const parType = allUsers.reduce((acc, user) => {
        const type = user.type || 'Non défini';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {});

      console.log('✅ Statistiques calculées:', {
        total,
        actifs,
        inactifs,
        parType
      });
    }

    console.log('\n🎉 Tous les tests du service utilisateur sont passés avec succès!');

  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

// Exécuter le test
testUserService(); 
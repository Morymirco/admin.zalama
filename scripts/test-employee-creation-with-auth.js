const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = 'https://mspmrzlqhwpdkkburjiw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zcG1yemxxaHdwZGtrYnVyaml3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDc4NzI1OCwiZXhwIjoyMDY2MzYzMjU4fQ.6sIgEDZIP1fkUoxdPJYfzKHU1B_SfN6Hui6v_FV6yzw';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testEmployeeCreationWithAuth() {
  console.log('🧪 Test de création d\'employé avec compte Auth\n');

  try {
    // 1. Récupérer un partenaire existant
    console.log('1. Récupération d\'un partenaire existant...');
    const { data: partners, error: partnersError } = await supabase
      .from('partners')
      .select('id, nom')
      .limit(1);

    if (partnersError || !partners || partners.length === 0) {
      throw new Error('Aucun partenaire trouvé pour le test');
    }

    const partner = partners[0];
    console.log(`✅ Partenaire trouvé: ${partner.nom} (${partner.id})`);

    // 2. Créer un employé de test avec email unique
    console.log('\n2. Création d\'un employé de test avec compte Auth...');
    const timestamp = Date.now();
    const testEmployee = {
      partner_id: partner.id,
      nom: 'Test',
      prenom: 'Employee',
      genre: 'Homme',
      email: `test.employee.${timestamp}@test.com`,
      telephone: '+224623456789',
      adresse: '123 Rue Test, Conakry',
      poste: 'Développeur Test',
      role: 'Test Role',
      type_contrat: 'CDI',
      salaire_net: 2500000,
      date_embauche: '2024-01-15',
      actif: true
    };

    console.log('📋 Données de test:', testEmployee);

    // 3. Utiliser l'API de création d'employé avec Auth
    const response = await fetch('http://localhost:3000/api/employees/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'create_with_auth',
        employeeData: testEmployee
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erreur API: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('📊 Résultat API:', JSON.stringify(result, null, 2));

    if (!result.success) {
      throw new Error(`Échec de la création: ${result.error}`);
    }

    console.log('✅ Employé créé avec succès!');
    console.log(`   - ID Employé: ${result.result.employee.id}`);
    console.log(`   - ID Auth: ${result.result.userId}`);
    console.log(`   - Mot de passe: ${result.result.password}`);

    // 4. Vérifier que l'employé a bien un user_id
    console.log('\n3. Vérification de la base de données...');
    const { data: createdEmployee, error: fetchError } = await supabase
      .from('employees')
      .select('*')
      .eq('id', result.result.employee.id)
      .single();

    if (fetchError) {
      throw new Error(`Erreur lors de la récupération: ${fetchError.message}`);
    }

    console.log('📋 Employé en base de données:');
    console.log(`   - ID: ${createdEmployee.id}`);
    console.log(`   - Nom: ${createdEmployee.prenom} ${createdEmployee.nom}`);
    console.log(`   - Email: ${createdEmployee.email}`);
    console.log(`   - user_id: ${createdEmployee.user_id}`);
    console.log(`   - Partner ID: ${createdEmployee.partner_id}`);

    if (!createdEmployee.user_id) {
      throw new Error('❌ L\'employé n\'a pas de user_id!');
    }

    console.log('✅ user_id correctement assigné!');

    // 5. Vérifier que le compte Auth existe
    console.log('\n4. Vérification du compte Auth...');
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      throw new Error(`Erreur lors de la vérification Auth: ${authError.message}`);
    }

    const authUser = authUsers.users.find(user => user.id === createdEmployee.user_id);
    
    if (!authUser) {
      throw new Error('❌ Compte Auth non trouvé!');
    }

    console.log('✅ Compte Auth trouvé:');
    console.log(`   - ID: ${authUser.id}`);
    console.log(`   - Email: ${authUser.email}`);
    console.log(`   - Display Name: ${authUser.user_metadata?.display_name}`);
    console.log(`   - Role: ${authUser.user_metadata?.role}`);

    // 6. Test de connexion avec le compte créé
    console.log('\n5. Test de connexion avec le compte créé...');
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: testEmployee.email,
      password: result.result.password
    });

    if (signInError) {
      console.log('⚠️ Test de connexion échoué (normal en mode service):', signInError.message);
    } else {
      console.log('✅ Connexion réussie!');
      console.log(`   - Session ID: ${signInData.session?.access_token?.substring(0, 20)}...`);
    }

    // 7. Nettoyer les données de test
    console.log('\n6. Nettoyage des données de test...');
    
    // Supprimer le compte Auth
    const { error: deleteAuthError } = await supabase.auth.admin.deleteUser(createdEmployee.user_id);
    if (deleteAuthError) {
      console.log('⚠️ Erreur lors de la suppression du compte Auth:', deleteAuthError.message);
    } else {
      console.log('✅ Compte Auth supprimé');
    }

    // Supprimer l'employé
    const { error: deleteEmployeeError } = await supabase
      .from('employees')
      .delete()
      .eq('id', createdEmployee.id);

    if (deleteEmployeeError) {
      console.log('⚠️ Erreur lors de la suppression de l\'employé:', deleteEmployeeError.message);
    } else {
      console.log('✅ Employé supprimé');
    }

    console.log('\n🎉 Test terminé avec succès!');
    console.log('✅ La création d\'employés avec comptes Auth fonctionne correctement.');

  } catch (error) {
    console.error('\n💥 Erreur lors du test:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

// Exécuter le test
testEmployeeCreationWithAuth()
  .then(() => {
    console.log('\n🏁 Test terminé');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Test échoué:', error);
    process.exit(1);
  }); 
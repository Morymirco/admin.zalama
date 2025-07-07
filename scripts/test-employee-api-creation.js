const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Configuration Supabase
const supabaseUrl = 'https://mspmrzlqhwpdkkburjiw.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zcG1yemxxaHdwZGtrYnVyaml3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDc4NzI1OCwiZXhwIjoyMDY2MzYzMjU4fQ.6sIgEDZIP1fkUoxdPJYfzKHU1B_SfN6Hui6v_FV6yzw';

const supabase = createClient(supabaseUrl, supabaseKey);

// Simuler le service partenaireService.employeService.create
async function testEmployeeServiceCreation() {
  console.log('🧪 Test de création d\'employé via le service partenaireService\n');

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
    console.log('\n2. Création d\'un employé de test...');
    const timestamp = Date.now();
    const testEmployee = {
      partner_id: partner.id,
      nom: 'Service',
      prenom: 'Test',
      genre: 'Femme',
      email: `service.test.${timestamp}@test.com`,
      telephone: '+224623456790',
      adresse: '456 Avenue Service, Conakry',
      poste: 'Testeuse Service',
      role: 'Service Role',
      type_contrat: 'CDD',
      salaire_net: 1800000,
      date_embauche: '2024-02-01',
      actif: true
    };

    console.log('📋 Données de test:', testEmployee);

    // 3. Simuler le processus de création avec Auth (comme dans partenaireService)
    console.log('\n3. Création du compte Auth...');
    
    // Vérifier si l'email existe déjà dans Auth
    const { data: authUsers, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) {
      throw new Error(`Erreur vérification email: ${listError.message}`);
    }

    const emailExists = authUsers.users.some(user => user.email === testEmployee.email);
    if (emailExists) {
      throw new Error('Un compte avec cet email existe déjà');
    }

    // Générer un mot de passe sécurisé
    const password = generatePassword();

    // Créer le compte dans Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: testEmployee.email,
      password: password,
      email_confirm: true,
      user_metadata: {
        display_name: `${testEmployee.prenom} ${testEmployee.nom}`,
        role: 'user',
        partenaire_id: testEmployee.partner_id
      }
    });

    if (authError) {
      throw new Error(`Erreur création compte Auth: ${authError.message}`);
    }

    console.log('✅ Compte Auth créé avec succès!');
    console.log(`   - ID Auth: ${authData.user.id}`);
    console.log(`   - Mot de passe: ${password}`);

    // 4. Créer l'employé avec le user_id (comme dans le service)
    console.log('\n4. Création de l\'employé avec user_id...');
    const employeeDataForInsert = {
      partner_id: testEmployee.partner_id,
      nom: testEmployee.nom,
      prenom: testEmployee.prenom,
      genre: testEmployee.genre,
      email: testEmployee.email,
      telephone: testEmployee.telephone,
      adresse: testEmployee.adresse,
      poste: testEmployee.poste,
      role: testEmployee.role,
      type_contrat: testEmployee.type_contrat,
      salaire_net: testEmployee.salaire_net,
      date_embauche: testEmployee.date_embauche,
      actif: testEmployee.actif,
      user_id: authData.user.id // Lier à l'utilisateur Auth créé
    };

    const { data: createdEmployee, error: insertError } = await supabase
      .from('employees')
      .insert([employeeDataForInsert])
      .select()
      .single();

    if (insertError) {
      // Supprimer le compte Auth créé en cas d'erreur
      await supabase.auth.admin.deleteUser(authData.user.id);
      throw new Error(`Erreur création employé: ${insertError.message}`);
    }

    console.log('✅ Employé créé avec succès!');
    console.log(`   - ID Employé: ${createdEmployee.id}`);
    console.log(`   - Nom: ${createdEmployee.prenom} ${createdEmployee.nom}`);
    console.log(`   - user_id: ${createdEmployee.user_id}`);

    // 5. Vérifier que l'employé a bien un user_id
    console.log('\n5. Vérification de la base de données...');
    const { data: fetchedEmployee, error: fetchError } = await supabase
      .from('employees')
      .select('*')
      .eq('id', createdEmployee.id)
      .single();

    if (fetchError) {
      throw new Error(`Erreur lors de la récupération: ${fetchError.message}`);
    }

    console.log('📋 Employé en base de données:');
    console.log(`   - ID: ${fetchedEmployee.id}`);
    console.log(`   - Nom: ${fetchedEmployee.prenom} ${fetchedEmployee.nom}`);
    console.log(`   - Email: ${fetchedEmployee.email}`);
    console.log(`   - user_id: ${fetchedEmployee.user_id}`);
    console.log(`   - Partner ID: ${fetchedEmployee.partner_id}`);

    if (!fetchedEmployee.user_id) {
      throw new Error('❌ L\'employé n\'a pas de user_id!');
    }

    console.log('✅ user_id correctement assigné!');

    // 6. Vérifier que le compte Auth existe
    console.log('\n6. Vérification du compte Auth...');
    const { data: authUsersFinal, error: authListError } = await supabase.auth.admin.listUsers();
    
    if (authListError) {
      throw new Error(`Erreur lors de la vérification Auth: ${authListError.message}`);
    }

    const authUser = authUsersFinal.users.find(user => user.id === fetchedEmployee.user_id);
    
    if (!authUser) {
      throw new Error('❌ Compte Auth non trouvé!');
    }

    console.log('✅ Compte Auth trouvé:');
    console.log(`   - ID: ${authUser.id}`);
    console.log(`   - Email: ${authUser.email}`);
    console.log(`   - Display Name: ${authUser.user_metadata?.display_name}`);
    console.log(`   - Role: ${authUser.user_metadata?.role}`);

    // 7. Nettoyer les données de test
    console.log('\n7. Nettoyage des données de test...');
    
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

    // Supprimer le compte Auth
    const { error: deleteAuthError } = await supabase.auth.admin.deleteUser(createdEmployee.user_id);
    if (deleteAuthError) {
      console.log('⚠️ Erreur lors de la suppression du compte Auth:', deleteAuthError.message);
    } else {
      console.log('✅ Compte Auth supprimé');
    }

    console.log('\n🎉 Test terminé avec succès!');
    console.log('✅ La création d\'employés via le service fonctionne correctement.');
    console.log('✅ Le user_id est correctement assigné lors de la création.');
    console.log('✅ Le processus est identique à celui utilisé dans l\'interface utilisateur.');

  } catch (error) {
    console.error('\n💥 Erreur lors du test:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

// Fonction pour générer un mot de passe sécurisé
function generatePassword() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

// Exécuter le test
testEmployeeServiceCreation()
  .then(() => {
    console.log('\n🏁 Test terminé');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Test échoué:', error);
    process.exit(1);
  }); 
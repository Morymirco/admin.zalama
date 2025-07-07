require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = 'https://mspmrzlqhwpdkkburjiw.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zcG1yemxxaHdwZGtrYnVyaml3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3ODcyNTgsImV4cCI6MjA2NjM2MzI1OH0.zr-TRpKjGJjW0nRtsyPcCLy4Us-c5tOGX71k5_3JJd0';

console.log('🔍 Début du test de débogage de création d\'employé');
console.log('📋 Variables d\'environnement:');
console.log('- SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅ Présent' : '❌ Manquant');
console.log('- SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅ Présent' : '❌ Manquant');

// Utiliser la clé service role si disponible, sinon la clé anon pour les tests
const supabaseKey = supabaseServiceKey || supabaseAnonKey;
console.log('- Clé utilisée:', supabaseServiceKey ? 'Service Role' : 'Anon');

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function testEmployeeCreation() {
  try {
    console.log('\n🔄 Test de création d\'employé avec Auth...');
    
    // Récupérer un vrai partner_id
    console.log('\n0️⃣ Récupération d\'un partner_id valide...');
    const { data: partners, error: partnersError } = await supabase
      .from('partners')
      .select('id, nom')
      .limit(1);
    
    if (partnersError || !partners || partners.length === 0) {
      console.error('❌ Erreur lors de la récupération des partenaires:', partnersError);
      console.log('💡 Création d\'un partenaire de test...');
      
      // Créer un partenaire de test
      const { data: newPartner, error: createPartnerError } = await supabase
        .from('partners')
        .insert([{
          nom: 'Partenaire Test Debug',
          email: 'test.debug@example.com',
          telephone: '+224625212115',
          adresse: 'Adresse Test',
          secteur: 'Technologie',
          type: 'Entreprise',
          statut: 'Actif'
        }])
        .select()
        .single();
      
      if (createPartnerError) {
        console.error('❌ Erreur création partenaire:', createPartnerError);
        return;
      }
      
      console.log('✅ Partenaire de test créé:', newPartner.id);
      var partnerId = newPartner.id;
    } else {
      console.log('✅ Partenaire trouvé:', partners[0].id, '-', partners[0].nom);
      var partnerId = partners[0].id;
    }
    
    // Données de test
    const testEmployee = {
      partner_id: partnerId,
      nom: 'Test',
      prenom: 'Debug',
      email: `test.debug.${Date.now()}@example.com`,
      telephone: '+224625212115',
      poste: 'Testeur',
      role: 'Testeur',
      type_contrat: 'CDI',
      salaire_net: 300000,
      date_embauche: new Date().toISOString().split('T')[0],
      actif: true,
      genre: 'Homme'
    };

    console.log('📝 Données de test:', testEmployee);

    // Étape 1: Vérifier si l'email existe déjà dans Auth
    console.log('\n1️⃣ Vérification de l\'email dans Auth...');
    const { data: authUsers, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      console.error('❌ Erreur lors de la liste des utilisateurs Auth:', listError);
      return;
    }

    const emailExists = authUsers.users.some(user => user.email === testEmployee.email);
    console.log(`📧 Email ${testEmployee.email} existe dans Auth:`, emailExists ? 'Oui' : 'Non');

    if (emailExists) {
      console.log('⚠️ Email déjà existant, test annulé');
      return;
    }

    // Étape 2: Créer le compte Auth
    console.log('\n2️⃣ Création du compte Auth...');
    const password = 'TestPassword123!';
    
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: testEmployee.email,
      password: password,
      email_confirm: true,
      user_metadata: {
        display_name: `${testEmployee.prenom} ${testEmployee.nom}`,
        role: 'user',
        partenaire_id: testEmployee.partner_id,
        employee_id: 'temp'
      }
    });

    if (authError) {
      console.error('❌ Erreur création compte Auth:', authError);
      return;
    }

    console.log('✅ Compte Auth créé avec succès');
    console.log('- User ID:', authData.user.id);
    console.log('- Email:', authData.user.email);

    // Étape 3: Créer l'employé dans la base de données
    console.log('\n3️⃣ Création de l\'employé dans la base de données...');
    
    const employeeDataForInsert = {
      partner_id: testEmployee.partner_id,
      nom: testEmployee.nom,
      prenom: testEmployee.prenom,
      genre: testEmployee.genre,
      email: testEmployee.email,
      telephone: testEmployee.telephone,
      poste: testEmployee.poste,
      role: testEmployee.role,
      type_contrat: testEmployee.type_contrat,
      salaire_net: testEmployee.salaire_net,
      date_embauche: testEmployee.date_embauche,
      actif: testEmployee.actif,
      user_id: authData.user.id // Lier à l'utilisateur Auth créé
    };

    console.log('📝 Données pour insertion:', employeeDataForInsert);

    const { data: employee, error: insertError } = await supabase
      .from('employees')
      .insert([employeeDataForInsert])
      .select()
      .single();

    if (insertError) {
      console.error('❌ Erreur insertion employé:', insertError);
      
      // Supprimer le compte Auth créé en cas d'erreur
      console.log('🧹 Suppression du compte Auth créé...');
      await supabase.auth.admin.deleteUser(authData.user.id);
      return;
    }

    console.log('✅ Employé créé avec succès');
    console.log('- Employee ID:', employee.id);
    console.log('- User ID:', employee.user_id);
    console.log('- Email:', employee.email);

    // Étape 4: Vérifier que l'employé a bien un user_id
    console.log('\n4️⃣ Vérification du user_id...');
    if (employee.user_id) {
      console.log('✅ SUCCÈS: L\'employé a un user_id:', employee.user_id);
    } else {
      console.log('❌ ÉCHEC: L\'employé n\'a pas de user_id');
    }

    // Étape 5: Nettoyer les données de test
    console.log('\n5️⃣ Nettoyage des données de test...');
    
    // Supprimer l'employé
    const { error: deleteEmployeeError } = await supabase
      .from('employees')
      .delete()
      .eq('id', employee.id);
    
    if (deleteEmployeeError) {
      console.error('⚠️ Erreur suppression employé:', deleteEmployeeError);
    } else {
      console.log('✅ Employé supprimé');
    }

    // Supprimer le compte Auth
    const { error: deleteAuthError } = await supabase.auth.admin.deleteUser(authData.user.id);
    
    if (deleteAuthError) {
      console.error('⚠️ Erreur suppression compte Auth:', deleteAuthError);
    } else {
      console.log('✅ Compte Auth supprimé');
    }

    console.log('\n🎉 Test terminé avec succès!');

  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

// Exécuter le test
testEmployeeCreation(); 
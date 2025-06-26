const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement Supabase manquantes');
  console.log('Assurez-vous que NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont définies dans .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testAccountCreation() {
  console.log('🧪 Test de création des comptes RH et Responsable\n');

  try {
    // Test 1: Vérifier la connexion Supabase
    console.log('1️⃣ Test de connexion Supabase...');
    const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('❌ Erreur de connexion Supabase:', authError.message);
      return;
    }
    
    console.log('✅ Connexion Supabase réussie');
    console.log(`   Utilisateurs existants: ${authData.users.length}\n`);

    // Test 2: Créer un compte RH de test
    console.log('2️⃣ Test de création d\'un compte RH...');
    const testRHData = {
      email: 'test-rh@example.com',
      displayName: 'Test RH',
      partenaireId: 'test-partenaire-id',
      phoneNumber: '+224123456789',
      poste: 'Responsable RH',
      departement: 'RH',
      partenaireNom: 'Entreprise Test'
    };

    const { data: rhUser, error: rhError } = await supabase.auth.admin.createUser({
      email: testRHData.email,
      password: 'TestPassword123!',
      email_confirm: true,
      user_metadata: {
        displayName: testRHData.displayName,
        partenaireId: testRHData.partenaireId,
        role: 'rh',
        poste: testRHData.poste,
        departement: testRHData.departement,
        phoneNumber: testRHData.phoneNumber,
      },
    });

    if (rhError) {
      console.error('❌ Erreur création compte RH:', rhError.message);
    } else {
      console.log('✅ Compte RH créé avec succès');
      console.log(`   ID: ${rhUser.user.id}`);
      console.log(`   Email: ${rhUser.user.email}`);
      
      // Supprimer le compte de test
      await supabase.auth.admin.deleteUser(rhUser.user.id);
      console.log('   🗑️ Compte de test supprimé\n');
    }

    // Test 3: Créer un compte Responsable de test
    console.log('3️⃣ Test de création d\'un compte Responsable...');
    const testResponsableData = {
      email: 'test-responsable@example.com',
      displayName: 'Test Responsable',
      partenaireId: 'test-partenaire-id',
      phoneNumber: '+224987654321',
      poste: 'Directeur Général',
      partenaireNom: 'Entreprise Test'
    };

    const { data: responsableUser, error: responsableError } = await supabase.auth.admin.createUser({
      email: testResponsableData.email,
      password: 'TestPassword123!',
      email_confirm: true,
      user_metadata: {
        displayName: testResponsableData.displayName,
        partenaireId: testResponsableData.partenaireId,
        role: 'responsable',
        poste: testResponsableData.poste,
        phoneNumber: testResponsableData.phoneNumber,
      },
    });

    if (responsableError) {
      console.error('❌ Erreur création compte Responsable:', responsableError.message);
    } else {
      console.log('✅ Compte Responsable créé avec succès');
      console.log(`   ID: ${responsableUser.user.id}`);
      console.log(`   Email: ${responsableUser.user.email}`);
      
      // Supprimer le compte de test
      await supabase.auth.admin.deleteUser(responsableUser.user.id);
      console.log('   🗑️ Compte de test supprimé\n');
    }

    // Test 4: Vérifier les endpoints API
    console.log('4️⃣ Test des endpoints API...');
    
    // Test endpoint RH
    try {
      const rhResponse = await fetch('http://localhost:3000/api/auth/create-rh-supabase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'test-api-rh@example.com',
          displayName: 'Test API RH',
          partenaireId: 'test-api-partenaire',
          phoneNumber: '+224111111111',
          poste: 'RH API Test',
          departement: 'RH',
          partenaireNom: 'Entreprise API Test'
        }),
      });

      if (rhResponse.ok) {
        const rhResult = await rhResponse.json();
        console.log('✅ Endpoint RH fonctionne');
        console.log(`   Réponse: ${JSON.stringify(rhResult, null, 2)}`);
        
        // Nettoyer le compte créé
        if (rhResult.userId) {
          await supabase.auth.admin.deleteUser(rhResult.userId);
          console.log('   🗑️ Compte API supprimé');
        }
      } else {
        console.error('❌ Endpoint RH échoué:', rhResponse.status, rhResponse.statusText);
      }
    } catch (apiError) {
      console.error('❌ Erreur endpoint RH:', apiError.message);
    }

    // Test endpoint Responsable
    try {
      const responsableResponse = await fetch('http://localhost:3000/api/auth/create-responsable-supabase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'test-api-responsable@example.com',
          displayName: 'Test API Responsable',
          partenaireId: 'test-api-partenaire',
          phoneNumber: '+224222222222',
          poste: 'Directeur API Test',
          partenaireNom: 'Entreprise API Test'
        }),
      });

      if (responsableResponse.ok) {
        const responsableResult = await responsableResponse.json();
        console.log('✅ Endpoint Responsable fonctionne');
        console.log(`   Réponse: ${JSON.stringify(responsableResult, null, 2)}`);
        
        // Nettoyer le compte créé
        if (responsableResult.userId) {
          await supabase.auth.admin.deleteUser(responsableResult.userId);
          console.log('   🗑️ Compte API supprimé');
        }
      } else {
        console.error('❌ Endpoint Responsable échoué:', responsableResponse.status, responsableResponse.statusText);
      }
    } catch (apiError) {
      console.error('❌ Erreur endpoint Responsable:', apiError.message);
    }

    console.log('\n🎉 Tests terminés !');

  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

// Exécuter les tests
testAccountCreation(); 
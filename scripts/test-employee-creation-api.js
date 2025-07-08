require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = 'https://mspmrzlqhwpdkkburjiw.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zcG1yemxxaHdwZGtrYnVyaml3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3ODcyNTgsImV4cCI6MjA2NjM2MzI1OH0.zr-TRpKjGJjW0nRtsyPcCLy4Us-c5tOGX71k5_3JJd0';

console.log('🔍 Test de création d\'employé via API route');
console.log('📋 Variables d\'environnement:');
console.log('- SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅ Présent' : '❌ Manquant');

// Client Supabase
const supabaseKey = supabaseServiceKey || supabaseAnonKey;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testEmployeeCreationAPI() {
  try {
    console.log('\n🔄 Test de création d\'employé via API route...');
    
    // Récupérer un vrai partner_id
    console.log('\n0️⃣ Récupération d\'un partner_id valide...');
    const { data: partners, error: partnersError } = await supabase
      .from('partners')
      .select('id, nom')
      .limit(1);
    
    if (partnersError || !partners || partners.length === 0) {
      console.error('❌ Erreur lors de la récupération des partenaires:', partnersError);
      return;
    }
    
    console.log('✅ Partenaire trouvé:', partners[0].id, '-', partners[0].nom);
    const partnerId = partners[0].id;
    
    // Étape 1: Créer d'abord un employé sans user_id
    console.log('\n1️⃣ Création d\'un employé sans user_id...');
    
    const testEmployee = {
      partner_id: partnerId,
      nom: 'Test',
      prenom: 'API',
      email: `test.api.${Date.now()}@example.com`,
      telephone: '+224625212115',
      poste: 'Testeur',
      role: 'Testeur',
      type_contrat: 'CDI',
      salaire_net: 300000,
      date_embauche: new Date().toISOString().split('T')[0],
      actif: true,
      genre: 'Homme'
    };

    const { data: employee, error: insertError } = await supabase
      .from('employees')
      .insert([testEmployee])
      .select()
      .single();

    if (insertError) {
      console.error('❌ Erreur lors de la création de l\'employé:', insertError);
      return;
    }

    console.log('✅ Employé créé:', employee.id);
    console.log('- User ID avant API:', employee.user_id);

    // Étape 2: Appeler l'API route pour créer le compte Auth
    console.log('\n2️⃣ Appel de l\'API route create-employee-accounts...');
    
    const apiUrl = 'http://localhost:3000/api/auth/create-employee-accounts';
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        employeeData: {
          ...testEmployee,
          id: employee.id // Important: passer l'ID de l'employé
        }
      }),
    });

    if (!response.ok) {
      console.error('❌ Erreur API:', response.status, response.statusText);
      const errorData = await response.text();
      console.error('Détails:', errorData);
      return;
    }

    const apiResult = await response.json();
    console.log('📊 Résultat API:', apiResult);

    if (!apiResult.success) {
      console.error('❌ Échec de l\'API:', apiResult.error);
      return;
    }

    console.log('✅ Compte Auth créé avec succès');
    console.log('- User ID du compte Auth:', apiResult.account.id);

    // Étape 3: Vérifier que l'employé a été mis à jour avec le user_id
    console.log('\n3️⃣ Vérification de la mise à jour de l\'employé...');
    
    const { data: updatedEmployee, error: fetchError } = await supabase
      .from('employees')
      .select('*')
      .eq('id', employee.id)
      .single();

    if (fetchError) {
      console.error('❌ Erreur lors de la récupération de l\'employé:', fetchError);
      return;
    }

    console.log('📊 Employé après mise à jour:');
    console.log('- Employee ID:', updatedEmployee.id);
    console.log('- User ID après API:', updatedEmployee.user_id);
    console.log('- Email:', updatedEmployee.email);

    // Étape 4: Vérifier que le user_id correspond
    if (updatedEmployee.user_id === apiResult.account.id) {
      console.log('✅ SUCCÈS: L\'employé a le bon user_id!');
    } else {
      console.log('❌ ÉCHEC: Le user_id ne correspond pas');
      console.log('   - Attendu:', apiResult.account.id);
      console.log('   - Trouvé:', updatedEmployee.user_id);
    }

    // Étape 5: Nettoyer les données de test
    console.log('\n4️⃣ Nettoyage des données de test...');
    
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
    if (supabaseServiceKey) {
      const { error: deleteAuthError } = await supabase.auth.admin.deleteUser(apiResult.account.id);
      
      if (deleteAuthError) {
        console.error('⚠️ Erreur suppression compte Auth:', deleteAuthError);
      } else {
        console.log('✅ Compte Auth supprimé');
      }
    }

    console.log('\n🎉 Test terminé!');

  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

// Exécuter le test
testEmployeeCreationAPI(); 
const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = 'https://mspmrzlqhwpdkkburjiw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zcG1yemxxaHdwZGtrYnVyaml3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3ODcyNTgsImV4cCI6MjA2NjM2MzI1OH0.zr-TRpKjGJjW0nRtsyPcCLy4Us-c5tOGX71k5_3JJd0';

// Clé de service (à remplacer par la vraie clé)
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'VOTRE_CLE_SERVICE_ICI';

console.log('🔍 Vérification de la configuration Supabase Admin...\n');

async function testSupabaseAdmin() {
  try {
    // Test avec la clé anonyme
    console.log('1️⃣ Test avec la clé anonyme...');
    const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey);
    
    const { data: employees, error: anonError } = await supabaseAnon
      .from('employees')
      .select('id, email, nom, prenom')
      .limit(1);
    
    if (anonError) {
      console.log('❌ Erreur avec la clé anonyme:', anonError.message);
    } else {
      console.log('✅ Lecture réussie avec la clé anonyme');
      console.log('   Employés trouvés:', employees?.length || 0);
    }

    // Test avec la clé de service
    console.log('\n2️⃣ Test avec la clé de service...');
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    
    // Test de lecture
    const { data: employeesAdmin, error: readError } = await supabaseAdmin
      .from('employees')
      .select('id, email, nom, prenom')
      .limit(1);
    
    if (readError) {
      console.log('❌ Erreur de lecture avec la clé de service:', readError.message);
    } else {
      console.log('✅ Lecture réussie avec la clé de service');
      console.log('   Employés trouvés:', employeesAdmin?.length || 0);
    }

    // Test de création d'utilisateur (si des employés existent)
    if (employeesAdmin && employeesAdmin.length > 0) {
      const testEmployee = employeesAdmin[0];
      console.log(`\n3️⃣ Test de création d'utilisateur pour: ${testEmployee.email}`);
      
      try {
        const { data: authUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email: `test-${Date.now()}@example.com`,
          password: 'TestPassword123!',
          email_confirm: true,
          user_metadata: {
            nom: 'Test',
            prenom: 'User',
            role: 'employe'
          }
        });

        if (createError) {
          console.log('❌ Erreur de création d\'utilisateur:', createError.message);
        } else {
          console.log('✅ Création d\'utilisateur réussie');
          console.log('   User ID:', authUser.user?.id);
          
          // Supprimer l'utilisateur de test
          if (authUser.user?.id) {
            const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(authUser.user.id);
            if (deleteError) {
              console.log('⚠️ Erreur lors de la suppression du test:', deleteError.message);
            } else {
              console.log('✅ Utilisateur de test supprimé');
            }
          }
        }
      } catch (error) {
        console.log('❌ Exception lors de la création d\'utilisateur:', error.message);
      }
    }

    // Instructions pour obtenir la clé de service
    console.log('\n📋 Instructions pour obtenir la clé de service:');
    console.log('1. Allez sur https://supabase.com/dashboard');
    console.log('2. Sélectionnez votre projet');
    console.log('3. Allez dans Settings > API');
    console.log('4. Copiez la "service_role" key');
    console.log('5. Ajoutez-la dans votre .env.local:');
    console.log('   SUPABASE_SERVICE_ROLE_KEY=votre_cle_service');

  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

// Test de l'API Next.js
async function testNextJSAPI() {
  console.log('\n🌐 Test de l\'API Next.js...');
  
  try {
    const response = await fetch('http://localhost:3000/api/auth/reset-employee-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        employeeId: 'test-id'
      }),
    });
    
    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', data);
    
  } catch (error) {
    console.log('❌ Erreur API Next.js:', error.message);
  }
}

// Exécuter les tests
async function runTests() {
  await testSupabaseAdmin();
  await testNextJSAPI();
}

runTests().catch(console.error); 
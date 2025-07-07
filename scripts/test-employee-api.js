require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = 'https://mspmrzlqhwpdkkburjiw.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zcG1yemxxaHdwZGtrYnVyaml3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3ODcyNTgsImV4cCI6MjA2NjM2MzI1OH0.zr-TRpKjGJjW0nRtsyPcCLy4Us-c5tOGX71k5_3JJd0';

console.log('🧪 Test de l\'API employees');
console.log('🧪 Variables d\'environnement:');
console.log('- SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅ Présent' : '❌ Manquant');

// Client Supabase
const supabaseKey = supabaseServiceKey || supabaseAnonKey;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testEmployeeAPI() {
  try {
    console.log('\n🔄 Test de l\'API GET /api/employees...');
    
    // Récupérer un partenaire pour le test
    const { data: partners, error: partnersError } = await supabase
      .from('partners')
      .select('id, nom')
      .limit(1);

    if (partnersError || !partners || partners.length === 0) {
      console.error('❌ Erreur lors de la récupération des partenaires:', partnersError);
      return;
    }

    const partner = partners[0];
    console.log(`📋 Partenaire sélectionné: ${partner.nom} (${partner.id})`);

    // Test 1: Récupérer tous les employés
    console.log('\n📊 Test 1: Récupérer tous les employés');
    try {
      const response1 = await fetch('http://localhost:3000/api/employees');
      const result1 = await response1.json();
      
      console.log(`   - Status: ${response1.status}`);
      console.log(`   - Success: ${result1.success}`);
      console.log(`   - Count: ${result1.count}`);
      
      if (result1.success) {
        console.log(`   ✅ SUCCÈS: ${result1.count} employés récupérés`);
      } else {
        console.log(`   ❌ ÉCHEC: ${result1.error}`);
      }
    } catch (error) {
      console.log(`   ❌ ERREUR: ${error.message}`);
    }

    // Test 2: Récupérer les employés d'un partenaire
    console.log('\n📊 Test 2: Récupérer les employés du partenaire');
    try {
      const response2 = await fetch(`http://localhost:3000/api/employees?partner_id=${partner.id}`);
      const result2 = await response2.json();
      
      console.log(`   - Status: ${response2.status}`);
      console.log(`   - Success: ${result2.success}`);
      console.log(`   - Count: ${result2.count}`);
      
      if (result2.success) {
        console.log(`   ✅ SUCCÈS: ${result2.count} employés du partenaire récupérés`);
        if (result2.employees && result2.employees.length > 0) {
          console.log(`   - Premier employé: ${result2.employees[0].prenom} ${result2.employees[0].nom}`);
        }
      } else {
        console.log(`   ❌ ÉCHEC: ${result2.error}`);
      }
    } catch (error) {
      console.log(`   ❌ ERREUR: ${error.message}`);
    }

    // Test 3: Recherche d'employés
    console.log('\n📊 Test 3: Recherche d\'employés');
    try {
      const response3 = await fetch(`http://localhost:3000/api/employees?search=test`);
      const result3 = await response3.json();
      
      console.log(`   - Status: ${response3.status}`);
      console.log(`   - Success: ${result3.success}`);
      console.log(`   - Count: ${result3.count}`);
      
      if (result3.success) {
        console.log(`   ✅ SUCCÈS: ${result3.count} employés trouvés pour "test"`);
      } else {
        console.log(`   ❌ ÉCHEC: ${result3.error}`);
      }
    } catch (error) {
      console.log(`   ❌ ERREUR: ${error.message}`);
    }

    // Test 4: Création d'un employé
    console.log('\n📊 Test 4: Création d\'un employé');
    
    // Données de test pour l'employé
    const testEmployeeData = {
      prenom: 'Test',
      nom: 'API Employee',
      email: `test.api.employee.${Date.now()}@example.com`,
      telephone: '+224123456789',
      poste: 'Développeur API Test',
      partner_id: partner.id,
      actif: true,
      genre: 'Homme', // Champ obligatoire
      role: 'Développeur',
      type_contrat: 'CDI',
      salaire_net: 500000,
      date_embauche: new Date().toISOString().split('T')[0]
    };

    console.log(`   - Données: ${testEmployeeData.prenom} ${testEmployeeData.nom} (${testEmployeeData.email})`);

    try {
      const response4 = await fetch('http://localhost:3000/api/employees', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testEmployeeData)
      });

      const result4 = await response4.json();
      
      console.log(`   - Status: ${response4.status}`);
      console.log(`   - Success: ${result4.success}`);
      
      if (result4.success) {
        console.log(`   ✅ SUCCÈS: Employé créé`);
        console.log(`   - Employee ID: ${result4.employee?.id}`);
        console.log(`   - User ID: ${result4.employee?.user_id || 'NULL'}`);
        console.log(`   - Account Results: ${result4.accountResults?.employe?.success ? '✅' : '❌'}`);
        
        if (result4.employee?.user_id) {
          console.log(`   ✅ SUCCÈS: user_id défini: ${result4.employee.user_id}`);
        } else {
          console.log(`   ❌ ÉCHEC: user_id manquant!`);
        }
        
        // Vérifier dans la base de données
        console.log(`\n🔍 Vérification dans la base de données...`);
        
        const { data: dbEmployee, error: dbError } = await supabase
          .from('employees')
          .select('*')
          .eq('id', result4.employee.id)
          .single();

        if (dbError) {
          console.log(`   ❌ Erreur DB: ${dbError.message}`);
        } else {
          console.log(`   ✅ Employé dans DB:`);
          console.log(`   - ID: ${dbEmployee.id}`);
          console.log(`   - Nom: ${dbEmployee.prenom} ${dbEmployee.nom}`);
          console.log(`   - Email: ${dbEmployee.email}`);
          console.log(`   - User ID: ${dbEmployee.user_id || 'NULL'}`);
          
          if (dbEmployee.user_id) {
            console.log(`   ✅ SUCCÈS: user_id présent dans DB: ${dbEmployee.user_id}`);
          } else {
            console.log(`   ❌ ÉCHEC: user_id manquant dans DB!`);
          }
        }
        
      } else {
        console.log(`   ❌ ÉCHEC: ${result4.error}`);
        if (result4.details) {
          console.log(`   - Détails:`, result4.details);
        }
      }
    } catch (error) {
      console.log(`   ❌ ERREUR: ${error.message}`);
    }

    console.log(`\n🎉 Tests terminés!`);

  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

// Exécuter les tests
testEmployeeAPI(); 
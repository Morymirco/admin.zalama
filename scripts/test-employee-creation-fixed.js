require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = 'https://mspmrzlqhwpdkkburjiw.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zcG1yemxxaHdwZGtrYnVyaml3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3ODcyNTgsImV4cCI6MjA2NjM2MzI1OH0.zr-TRpKjGJjW0nRtsyPcCLy4Us-c5tOGX71k5_3JJd0';

console.log('🧪 Test de création d\'employé avec user_id garanti');
console.log('🧪 Variables d\'environnement:');
console.log('- SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅ Présent' : '❌ Manquant');

// Client Supabase
const supabaseKey = supabaseServiceKey || supabaseAnonKey;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testEmployeeCreation() {
  try {
    console.log('\n🔄 Test de création d\'employé via API...');
    
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

    // Données de test pour l'employé
    const testEmployeeData = {
      prenom: 'Test',
      nom: 'Employé Corrigé',
      email: `test.employe.corrige.${Date.now()}@example.com`,
      telephone: '+224123456789',
      poste: 'Développeur Test',
      partner_id: partner.id,
      actif: true
    };

    console.log(`\n👤 Données de test:`);
    console.log(`   - Nom: ${testEmployeeData.prenom} ${testEmployeeData.nom}`);
    console.log(`   - Email: ${testEmployeeData.email}`);
    console.log(`   - Partenaire: ${partner.nom}`);

    // Appeler l'API de création d'employé
    console.log(`\n🔄 Appel de l'API /api/auth/create-employee-accounts...`);
    
    const response = await fetch('http://localhost:3000/api/auth/create-employee-accounts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        employeeData: testEmployeeData
      })
    });

    const result = await response.json();
    
    console.log(`\n📊 Résultat de l'API:`);
    console.log(`   - Status: ${response.status}`);
    console.log(`   - Success: ${result.success}`);
    
    if (result.success) {
      console.log(`   - Account ID: ${result.account?.id}`);
      console.log(`   - Password: ${result.account?.password}`);
      console.log(`   - Employee ID: ${result.employee?.id}`);
      console.log(`   - Employee User ID: ${result.employee?.user_id}`);
      
      // Vérifier que l'employé a bien un user_id
      if (result.employee?.user_id) {
        console.log(`✅ SUCCÈS: L'employé a un user_id: ${result.employee.user_id}`);
      } else {
        console.log(`❌ ÉCHEC: L'employé n'a pas de user_id!`);
      }
      
      // Vérifier dans la base de données
      console.log(`\n🔍 Vérification dans la base de données...`);
      
      const { data: dbEmployee, error: dbError } = await supabase
        .from('employees')
        .select('*')
        .eq('id', result.employee.id)
        .single();

      if (dbError) {
        console.error('❌ Erreur lors de la vérification DB:', dbError);
      } else {
        console.log(`📊 Employé dans la DB:`);
        console.log(`   - ID: ${dbEmployee.id}`);
        console.log(`   - Nom: ${dbEmployee.prenom} ${dbEmployee.nom}`);
        console.log(`   - Email: ${dbEmployee.email}`);
        console.log(`   - User ID: ${dbEmployee.user_id || 'NULL'}`);
        console.log(`   - Actif: ${dbEmployee.actif}`);
        
        if (dbEmployee.user_id) {
          console.log(`✅ SUCCÈS: user_id présent dans la DB: ${dbEmployee.user_id}`);
          
          // Vérifier le compte Auth
          console.log(`\n🔍 Vérification du compte Auth...`);
          
          try {
            const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
            
            if (authError) {
              console.error('❌ Erreur lors de la vérification Auth:', authError);
            } else {
              const authUser = authUsers.users.find(user => user.id === dbEmployee.user_id);
              
              if (authUser) {
                console.log(`✅ Compte Auth trouvé:`);
                console.log(`   - ID: ${authUser.id}`);
                console.log(`   - Email: ${authUser.email}`);
                console.log(`   - Créé le: ${authUser.created_at}`);
              } else {
                console.log(`❌ Compte Auth non trouvé pour user_id: ${dbEmployee.user_id}`);
              }
            }
          } catch (error) {
            console.log(`⚠️ Impossible de vérifier les comptes Auth: ${error.message}`);
          }
          
          // Vérifier admin_users
          console.log(`\n🔍 Vérification de admin_users...`);
          
          const { data: adminUser, error: adminError } = await supabase
            .from('admin_users')
            .select('*')
            .eq('id', dbEmployee.user_id)
            .single();

          if (adminError) {
            console.error('❌ Erreur lors de la vérification admin_users:', adminError);
          } else if (adminUser) {
            console.log(`✅ Entrée admin_users trouvée:`);
            console.log(`   - ID: ${adminUser.id}`);
            console.log(`   - Email: ${adminUser.email}`);
            console.log(`   - Role: ${adminUser.role}`);
            console.log(`   - Active: ${adminUser.active}`);
          } else {
            console.log(`❌ Entrée admin_users non trouvée`);
          }
          
        } else {
          console.log(`❌ ÉCHEC: user_id manquant dans la DB!`);
        }
      }
      
    } else {
      console.log(`❌ ÉCHEC: ${result.error}`);
    }

    console.log(`\n🎉 Test terminé!`);

  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

// Exécuter le test
testEmployeeCreation(); 
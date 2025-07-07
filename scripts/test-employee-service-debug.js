require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = 'https://mspmrzlqhwpdkkburjiw.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zcG1yemxxaHdwZGtrYnVyaml3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3ODcyNTgsImV4cCI6MjA2NjM2MzI1OH0.zr-TRpKjGJjW0nRtsyPcCLy4Us-c5tOGX71k5_3JJd0';

console.log('🔍 Debug du service employeeService');
console.log('🔍 Variables d\'environnement:');
console.log('- SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅ Présent' : '❌ Manquant');

// Client Supabase
const supabaseKey = supabaseServiceKey || supabaseAnonKey;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testEmployeeServiceDebug() {
  try {
    console.log('\n🔄 Test direct du service employeeService...');
    
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
      nom: 'Service Debug',
      email: `test.service.debug.${Date.now()}@example.com`,
      telephone: '+224123456789',
      poste: 'Développeur Debug',
      partner_id: partner.id,
      actif: true,
      genre: 'Homme',
      role: 'Développeur',
      type_contrat: 'CDI',
      salaire_net: 500000,
      date_embauche: new Date().toISOString().split('T')[0]
    };

    console.log(`\n👤 Données de test:`);
    console.log(`   - Nom: ${testEmployeeData.prenom} ${testEmployeeData.nom}`);
    console.log(`   - Email: ${testEmployeeData.email}`);
    console.log(`   - Partenaire: ${partner.nom}`);

    // Test direct avec Supabase (sans le service)
    console.log(`\n🔄 Test direct avec Supabase...`);
    
    try {
      // 1. Créer le compte Auth
      console.log(`   🔐 Création du compte Auth...`);
      
      const password = 'TestPassword123!';
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: testEmployeeData.email,
        password: password,
        email_confirm: true,
        user_metadata: {
          display_name: `${testEmployeeData.prenom} ${testEmployeeData.nom}`,
          role: 'user',
          partenaire_id: testEmployeeData.partner_id
        }
      });

      if (authError) {
        console.error(`   ❌ Erreur création Auth:`, authError);
        return;
      }

      console.log(`   ✅ Compte Auth créé: ${authData.user.id}`);

      // 2. Créer l'entrée admin_users
      console.log(`   🔐 Création de l'entrée admin_users...`);
      
      const accountData = {
        id: authData.user.id,
        email: testEmployeeData.email,
        display_name: `${testEmployeeData.prenom} ${testEmployeeData.nom}`,
        role: 'user',
        partenaire_id: testEmployeeData.partner_id,
        active: true
      };

      const { error: adminError } = await supabase
        .from('admin_users')
        .insert([accountData]);

      if (adminError) {
        console.error(`   ❌ Erreur création admin_users:`, adminError);
        // Nettoyer le compte Auth
        await supabase.auth.admin.deleteUser(authData.user.id);
        return;
      }

      console.log(`   ✅ Entrée admin_users créée`);

      // 3. Créer l'employé avec user_id
      console.log(`   👤 Création de l'employé avec user_id...`);
      
      const employeeData = {
        ...testEmployeeData,
        user_id: authData.user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data: employee, error: employeeError } = await supabase
        .from('employees')
        .insert([employeeData])
        .select()
        .single();

      if (employeeError) {
        console.error(`   ❌ Erreur création employé:`, employeeError);
        // Nettoyer les comptes créés
        await supabase.auth.admin.deleteUser(authData.user.id);
        await supabase.from('admin_users').delete().eq('id', authData.user.id);
        return;
      }

      console.log(`   ✅ Employé créé: ${employee.id}`);
      console.log(`   ✅ User ID: ${employee.user_id}`);

      // Vérification finale
      console.log(`\n🔍 Vérification finale:`);
      console.log(`   - Employé ID: ${employee.id}`);
      console.log(`   - User ID: ${employee.user_id}`);
      console.log(`   - Email: ${employee.email}`);
      console.log(`   - Actif: ${employee.actif}`);

      // Nettoyer les données de test
      console.log(`\n🧹 Nettoyage des données de test...`);
      await supabase.from('employees').delete().eq('id', employee.id);
      await supabase.auth.admin.deleteUser(authData.user.id);
      await supabase.from('admin_users').delete().eq('id', authData.user.id);
      console.log(`   ✅ Données de test supprimées`);

      console.log(`\n✅ Test direct réussi!`);

    } catch (error) {
      console.error(`   ❌ Erreur générale:`, error);
    }

  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

// Exécuter le test
testEmployeeServiceDebug(); 
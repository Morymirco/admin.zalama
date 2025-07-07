require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = 'https://mspmrzlqhwpdkkburjiw.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zcG1yemxxaHdwZGtrYnVyaml3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3ODcyNTgsImV4cCI6MjA2NjM2MzI1OH0.zr-TRpKjGJjW0nRtsyPcCLy4Us-c5tOGX71k5_3JJd0';

console.log('🔍 Analyse des employés avec user_id NULL');
console.log('🔍 Variables d\'environnement:');
console.log('- SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅ Présent' : '❌ Manquant');

// Client Supabase
const supabaseKey = supabaseServiceKey || supabaseAnonKey;
const supabase = createClient(supabaseUrl, supabaseKey);

async function analyzeNullUserId() {
  try {
    console.log('\n🔄 Récupération des employés avec user_id NULL...');
    
    // Récupérer les employés sans user_id
    const { data: employeesWithoutUserId, error } = await supabase
      .from('employees')
      .select(`
        *,
        partners:partner_id (
          id,
          nom
        )
      `)
      .is('user_id', null)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Erreur lors de la récupération:', error);
      return;
    }

    if (!employeesWithoutUserId || employeesWithoutUserId.length === 0) {
      console.log('✅ Aucun employé avec user_id NULL trouvé');
      return;
    }

    console.log(`\n📋 Employés avec user_id NULL (${employeesWithoutUserId.length}):`);
    console.log('─'.repeat(100));
    
    for (const emp of employeesWithoutUserId) {
      console.log(`\n👤 Employé: ${emp.prenom} ${emp.nom}`);
      console.log(`   ID: ${emp.id}`);
      console.log(`   Email: ${emp.email}`);
      console.log(`   Partenaire: ${emp.partners?.nom || 'N/A'}`);
      console.log(`   Créé le: ${emp.created_at}`);
      console.log(`   Modifié le: ${emp.updated_at}`);
      console.log(`   Actif: ${emp.actif ? 'Oui' : 'Non'}`);
      console.log(`   User ID: ${emp.user_id || 'NULL'}`);
      
      // Vérifier s'il existe un compte Auth avec cet email
      console.log(`\n🔍 Vérification du compte Auth...`);
      
      try {
        const { data: authUser, error: authError } = await supabase.auth.admin.listUsers();
        
        if (authError) {
          console.log(`   ❌ Erreur Auth: ${authError.message}`);
        } else {
          const matchingAuthUser = authUser.users.find(user => 
            user.email === emp.email || 
            user.email_confirm_at !== null
          );
          
          if (matchingAuthUser) {
            console.log(`   ✅ Compte Auth trouvé:`);
            console.log(`      - User ID: ${matchingAuthUser.id}`);
            console.log(`      - Email: ${matchingAuthUser.email}`);
            console.log(`      - Créé le: ${matchingAuthUser.created_at}`);
            console.log(`      - Confirmé: ${matchingAuthUser.email_confirmed_at ? 'Oui' : 'Non'}`);
            console.log(`      - Dernière connexion: ${matchingAuthUser.last_sign_in_at || 'Jamais'}`);
            
            // Vérifier s'il y a une entrée dans admin_users
            const { data: adminUser, error: adminError } = await supabase
              .from('admin_users')
              .select('*')
              .eq('id', matchingAuthUser.id)
              .single();
            
            if (adminError && adminError.code !== 'PGRST116') {
              console.log(`   ❌ Erreur admin_users: ${adminError.message}`);
            } else if (adminUser) {
              console.log(`   ✅ Entrée admin_users trouvée:`);
              console.log(`      - Role: ${adminUser.role}`);
              console.log(`      - Créé le: ${adminUser.created_at}`);
            } else {
              console.log(`   ❌ Pas d'entrée dans admin_users`);
            }
            
            // Problème identifié: Auth user existe mais pas lié à l'employé
            console.log(`   ⚠️ PROBLÈME IDENTIFIÉ: Le compte Auth existe mais n'est pas lié à l'employé!`);
            
          } else {
            console.log(`   ❌ Aucun compte Auth trouvé avec l'email: ${emp.email}`);
            
            // Vérifier s'il y a des comptes Auth similaires
            const similarAuthUsers = authUser.users.filter(user => 
              user.email.includes(emp.email.split('@')[0]) ||
              emp.email.includes(user.email.split('@')[0])
            );
            
            if (similarAuthUsers.length > 0) {
              console.log(`   🔍 Comptes Auth similaires trouvés:`);
              similarAuthUsers.forEach(user => {
                console.log(`      - ${user.email} (ID: ${user.id})`);
              });
            }
          }
        }
      } catch (error) {
        console.log(`   ⚠️ Impossible de vérifier les comptes Auth: ${error.message}`);
      }
      
      console.log('─'.repeat(100));
    }

    // Analyser les patterns
    console.log(`\n📊 Analyse des patterns:`);
    
    const creationDates = employeesWithoutUserId.map(emp => new Date(emp.created_at));
    const earliestDate = new Date(Math.min(...creationDates));
    const latestDate = new Date(Math.max(...creationDates));
    
    console.log(`- Période de création: ${earliestDate.toLocaleDateString()} à ${latestDate.toLocaleDateString()}`);
    console.log(`- Tous les employés ont un email: ${employeesWithoutUserId.every(emp => emp.email) ? 'Oui' : 'Non'}`);
    console.log(`- Tous les employés sont actifs: ${employeesWithoutUserId.every(emp => emp.actif) ? 'Oui' : 'Non'}`);
    
    // Vérifier les partenaires
    const partnerIds = [...new Set(employeesWithoutUserId.map(emp => emp.partner_id))];
    console.log(`- Partenaires concernés: ${partnerIds.length}`);
    partnerIds.forEach(partnerId => {
      const partnerEmps = employeesWithoutUserId.filter(emp => emp.partner_id === partnerId);
      const partnerName = partnerEmps[0].partners?.nom || 'Inconnu';
      console.log(`  * ${partnerName}: ${partnerEmps.length} employés`);
    });

    console.log(`\n💡 Recommandations:`);
    console.log(`1. Les employés sans user_id ont probablement été créés avant la correction`);
    console.log(`2. Il faut créer des comptes Auth pour ces employés et les lier`);
    console.log(`3. Ou mettre à jour les user_id existants si les comptes Auth existent déjà`);
    console.log(`4. Vérifier le processus de création utilisé pour ces employés`);

  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

// Exécuter le script
analyzeNullUserId(); 
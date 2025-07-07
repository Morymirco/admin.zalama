require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = 'https://mspmrzlqhwpdkkburjiw.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zcG1yemxxaHdwZGtrYnVyaml3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3ODcyNTgsImV4cCI6MjA2NjM2MzI1OH0.zr-TRpKjGJjW0nRtsyPcCLy4Us-c5tOGX71k5_3JJd0';

console.log('🔧 Correction des employés avec user_id NULL');
console.log('🔧 Variables d\'environnement:');
console.log('- SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅ Présent' : '❌ Manquant');

// Client Supabase
const supabaseKey = supabaseServiceKey || supabaseAnonKey;
const supabase = createClient(supabaseUrl, supabaseKey);

async function fixNullUserId() {
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
      console.log('✅ Aucun employé avec user_id NULL à corriger');
      return;
    }

    console.log(`\n📋 Employés à corriger (${employeesWithoutUserId.length}):`);
    
    // Récupérer tous les utilisateurs Auth
    console.log('\n🔍 Récupération des comptes Auth...');
    const { data: allAuthUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('❌ Erreur lors de la récupération des utilisateurs Auth:', authError);
      return;
    }

    console.log(`📊 Total comptes Auth: ${allAuthUsers.users.length}`);
    
    const corrections = [];
    
    for (const emp of employeesWithoutUserId) {
      console.log(`\n👤 Vérification: ${emp.prenom} ${emp.nom} (${emp.email})`);
      
      // Chercher le compte Auth correspondant
      const matchingAuthUser = allAuthUsers.users.find(user => user.email === emp.email);
      
      if (matchingAuthUser) {
        console.log(`   ✅ Compte Auth trouvé: ${matchingAuthUser.id}`);
        corrections.push({
          employeeId: emp.id,
          employeeName: `${emp.prenom} ${emp.nom}`,
          email: emp.email,
          authUserId: matchingAuthUser.id,
          partnerName: emp.partners?.nom || 'N/A'
        });
      } else {
        console.log(`   ❌ Aucun compte Auth trouvé pour: ${emp.email}`);
      }
    }

    if (corrections.length === 0) {
      console.log('\n❌ Aucune correction possible - pas de comptes Auth correspondants');
      return;
    }

    console.log(`\n🔧 Corrections à appliquer (${corrections.length}):`);
    corrections.forEach((correction, index) => {
      console.log(`${index + 1}. ${correction.employeeName} (${correction.email})`);
      console.log(`   → Mettre à jour user_id: ${correction.authUserId}`);
    });

    // Demander confirmation
    console.log(`\n⚠️ Voulez-vous appliquer ces corrections? (y/N)`);
    
    // Pour l'automatisation, on applique directement
    console.log(`\n🔄 Application des corrections...`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const correction of corrections) {
      try {
        console.log(`\n🔧 Correction de ${correction.employeeName}...`);
        
        // Mettre à jour l'employé avec le user_id
        const { data: updateResult, error: updateError } = await supabase
          .from('employees')
          .update({ 
            user_id: correction.authUserId,
            updated_at: new Date().toISOString()
          })
          .eq('id', correction.employeeId)
          .select();

        if (updateError) {
          console.error(`   ❌ Erreur lors de la mise à jour:`, updateError);
          errorCount++;
        } else {
          console.log(`   ✅ Employé mis à jour avec succès`);
          console.log(`      - User ID: ${correction.authUserId}`);
          console.log(`      - Partenaire: ${correction.partnerName}`);
          successCount++;
        }
        
      } catch (error) {
        console.error(`   ❌ Erreur générale:`, error);
        errorCount++;
      }
    }

    console.log(`\n📊 Résumé des corrections:`);
    console.log(`- Succès: ${successCount}`);
    console.log(`- Erreurs: ${errorCount}`);
    console.log(`- Total: ${corrections.length}`);

    if (successCount > 0) {
      console.log(`\n✅ ${successCount} employé(s) corrigé(s) avec succès!`);
      
      // Vérifier le résultat
      console.log(`\n🔍 Vérification du résultat...`);
      const { data: verificationResult, error: verificationError } = await supabase
        .from('employees')
        .select('id, prenom, nom, email, user_id')
        .is('user_id', null);

      if (verificationError) {
        console.error('❌ Erreur lors de la vérification:', verificationError);
      } else {
        const remainingNullUsers = verificationResult.length;
        console.log(`📊 Employés restants avec user_id NULL: ${remainingNullUsers}`);
        
        if (remainingNullUsers === 0) {
          console.log('🎉 Tous les employés ont maintenant un user_id!');
        } else {
          console.log('⚠️ Il reste encore des employés avec user_id NULL');
        }
      }
    }

  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

// Exécuter le script
fixNullUserId(); 
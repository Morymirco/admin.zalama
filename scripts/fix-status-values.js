const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = 'https://mspmrzlqhwpdkkburjiw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zcG1yemxxaHdwZGtrYnVyaml3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3ODcyNTgsImV4cCI6MjA2NjM2MzI1OH0.zr-TRpKjGJjW0nRtsyPcCLy4Us-c5tOGX71k5_3JJd0';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function fixStatusValues() {
  console.log('🔧 Correction des valeurs de statut...\n');

  try {
    // 1. Vérifier les statuts actuels
    console.log('1. Vérification des statuts actuels...');
    const { data: currentStatuses, error: statusError } = await supabase
      .from('salary_advance_requests')
      .select('id, statut, employe:employees(nom, prenom)');

    if (statusError) {
      console.error('❌ Erreur lors de la récupération des statuts:', statusError);
      return;
    }

    console.log('📋 Statuts actuels:');
    const statusCounts = {};
    currentStatuses.forEach(item => {
      statusCounts[item.statut] = (statusCounts[item.statut] || 0) + 1;
      console.log(`   - ${item.employe?.prenom} ${item.employe?.nom}: ${item.statut}`);
    });

    console.log('\n📊 Comptage des statuts:');
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`   ${status}: ${count}`);
    });

    // 2. Corriger les statuts
    console.log('\n2. Correction des statuts...');
    
    const statusMappings = {
      'Validé': 'Approuvée',
      'En attente': 'En attente',
      'Rejeté': 'Rejetée',
      'Approuvée': 'Approuvée',
      'Rejetée': 'Rejetée'
    };

    for (const request of currentStatuses) {
      const newStatus = statusMappings[request.statut];
      if (newStatus && newStatus !== request.statut) {
        console.log(`   Correction: ${request.statut} → ${newStatus} pour ${request.employe?.prenom} ${request.employe?.nom}`);
        
        const { error: updateError } = await supabase
          .from('salary_advance_requests')
          .update({ 
            statut: newStatus,
            updated_at: new Date().toISOString()
          })
          .eq('id', request.id);

        if (updateError) {
          console.error(`   ❌ Erreur lors de la correction:`, updateError);
        } else {
          console.log(`   ✅ Statut corrigé`);
        }
      }
    }

    // 3. Vérifier le résultat final
    console.log('\n3. Vérification du résultat final...');
    const { data: finalStatuses, error: finalError } = await supabase
      .from('salary_advance_requests')
      .select('id, statut, employe:employees(nom, prenom), montant_demande')
      .order('created_at', { ascending: false });

    if (finalError) {
      console.error('❌ Erreur lors de la vérification finale:', finalError);
    } else {
      console.log('📋 Statuts après correction:');
      const finalStatusCounts = {};
      finalStatuses.forEach(item => {
        finalStatusCounts[item.statut] = (finalStatusCounts[item.statut] || 0) + 1;
        console.log(`   - ${item.employe?.prenom} ${item.employe?.nom}: ${item.statut} (${item.montant_demande} GNF)`);
      });

      console.log('\n📊 Comptage final des statuts:');
      Object.entries(finalStatusCounts).forEach(([status, count]) => {
        console.log(`   ${status}: ${count}`);
      });
    }

  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

// Exécuter la correction
fixStatusValues().then(() => {
  console.log('\n✅ Correction des statuts terminée');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Erreur fatale:', error);
  process.exit(1);
}); 
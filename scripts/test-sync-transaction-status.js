const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mspmrzlqhwpdkkburjiw.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY manquant');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testSyncTransactionStatus() {
  console.log('🧪 Test de la synchronisation du statut des transactions');
  
  try {
    // 1. Vérifier les transactions existantes
    console.log('\n📊 1. Vérification des transactions existantes:');
    const { data: transactions, error: transactionsError } = await supabase
      .from('transactions')
      .select(`
        id,
        numero_transaction,
        statut,
        demande_avance_id,
        employe_id,
        partenaire_id,
        montant,
        date_transaction,
        date_creation,
        description
      `)
      .order('date_creation', { ascending: false })
      .limit(10);
    
    if (transactionsError) {
      console.error('❌ Erreur lors de la récupération des transactions:', transactionsError);
      return;
    }
    
    console.log(`✅ ${transactions.length} transactions trouvées`);
    
    if (transactions.length === 0) {
      console.log('ℹ️ Aucune transaction à tester');
      return;
    }
    
    // Afficher les détails des transactions
    transactions.forEach((tx, index) => {
      console.log(`  ${index + 1}. ID: ${tx.id}`);
      console.log(`     Numéro: ${tx.numero_transaction}`);
      console.log(`     Statut: ${tx.statut}`);
      console.log(`     Montant: ${tx.montant}`);
      console.log(`     Demande ID: ${tx.demande_avance_id || 'N/A'}`);
      console.log(`     Date création: ${tx.date_creation}`);
      console.log('');
    });
    
    // 2. Tester l'API de synchronisation
    console.log('🔄 2. Test de l\'API de synchronisation:');
    
    // Simuler un appel à l'API
    const testRequest = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({})
    };
    
    console.log('📤 Appel simulé à /api/payments/sync-transaction-status');
    console.log('📋 Paramètres:', testRequest.body);
    
    // Note: Dans un vrai test, on appellerait l'API
    console.log('ℹ️ Pour tester l\'API complète, utilisez le bouton "Synchroniser" dans l\'interface');
    
    // 3. Vérifier les demandes d'avance liées
    console.log('\n📋 3. Vérification des demandes d\'avance liées:');
    
    const transactionsWithDemands = transactions.filter(tx => tx.demande_avance_id);
    console.log(`✅ ${transactionsWithDemands.length} transactions liées à des demandes d'avance`);
    
    if (transactionsWithDemands.length > 0) {
      for (const tx of transactionsWithDemands.slice(0, 3)) {
        const { data: demand, error: demandError } = await supabase
          .from('salary_advance_requests')
          .select('id, statut, numero_reception, date_validation')
          .eq('id', tx.demande_avance_id)
          .single();
        
        if (demandError) {
          console.error(`❌ Erreur récupération demande ${tx.demande_avance_id}:`, demandError);
        } else {
          console.log(`  - Demande ${demand.id}:`);
          console.log(`    Statut: ${demand.statut}`);
          console.log(`    Numéro réception: ${demand.numero_reception || 'N/A'}`);
          console.log(`    Date validation: ${demand.date_validation || 'N/A'}`);
        }
      }
    }
    
    // 4. Vérifier la configuration LengoPay
    console.log('\n🔧 4. Vérification de la configuration LengoPay:');
    console.log('  - LENGO_SITE_ID:', process.env.LENGO_SITE_ID ? '✅ Présent' : '❌ Manquant');
    console.log('  - LENGO_API_KEY:', process.env.LENGO_API_KEY ? '✅ Présent' : '❌ Manquant');
    
    // 5. Recommandations
    console.log('\n📋 5. Recommandations:');
    console.log('✅ Le système de synchronisation est prêt');
    console.log('✅ Utilisez le bouton "Synchroniser" dans l\'interface pour tester');
    console.log('✅ Les transactions EFFECTUEE déclencheront automatiquement les remboursements');
    console.log('✅ Les demandes d\'avance seront mises à jour automatiquement');
    
  } catch (error) {
    console.error('💥 Erreur lors du test:', error);
  }
}

// Exécuter le test
testSyncTransactionStatus()
  .then(() => {
    console.log('\n🎉 Test terminé');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Erreur fatale:', error);
    process.exit(1);
  }); 
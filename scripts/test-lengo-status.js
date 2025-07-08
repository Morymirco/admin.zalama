const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mspmrzlqhwpdkkburjiw.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY manquant');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testLengoStatus() {
  console.log('🧪 Test de vérification du statut LengoPay');
  
  try {
    // 1. Récupérer la dernière transaction
    console.log('\n📊 1. Récupération de la dernière transaction...');
    const { data: transactions, error: errorTransactions } = await supabase
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1);
    
    if (errorTransactions) {
      console.error('❌ Erreur lors de la récupération des transactions:', errorTransactions);
      return;
    }
    
    if (!transactions || transactions.length === 0) {
      console.log('❌ Aucune transaction trouvée');
      return;
    }
    
    const lastTransaction = transactions[0];
    console.log('✅ Dernière transaction trouvée:', {
      id: lastTransaction.id,
      numero_transaction: lastTransaction.numero_transaction,
      statut: lastTransaction.statut,
      montant: lastTransaction.montant,
      date_creation: lastTransaction.date_creation
    });
    
    // 2. Vérifier le statut via l'API
    console.log('\n🔍 2. Vérification du statut via l\'API...');
    const response = await fetch('http://localhost:3000/api/payments/lengo-status', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        pay_id: lastTransaction.numero_transaction
      })
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      console.error('❌ Erreur API:', result);
      return;
    }
    
    console.log('✅ Réponse de l\'API:', {
      success: result.success,
      pay_id: result.pay_id,
      lengo_status: result.lengo_status,
      db_status: result.db_status,
      amount: result.amount,
      account: result.account,
      date: result.date
    });
    
    // 3. Vérifier que la transaction a été mise à jour
    console.log('\n💾 3. Vérification de la mise à jour en base...');
    const { data: updatedTransaction, error: errorUpdated } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', lastTransaction.id)
      .single();
    
    if (errorUpdated) {
      console.error('❌ Erreur lors de la récupération de la transaction mise à jour:', errorUpdated);
      return;
    }
    
    console.log('✅ Transaction mise à jour:', {
      id: updatedTransaction.id,
      numero_transaction: updatedTransaction.numero_transaction,
      statut: updatedTransaction.statut,
      date_transaction: updatedTransaction.date_transaction,
      updated_at: updatedTransaction.updated_at
    });
    
    // 4. Comparer les statuts
    console.log('\n📊 4. Comparaison des statuts:');
    console.log(`  - Statut avant: ${lastTransaction.statut}`);
    console.log(`  - Statut LengoPay: ${result.lengo_status}`);
    console.log(`  - Statut DB après: ${result.db_status}`);
    console.log(`  - Statut final: ${updatedTransaction.statut}`);
    console.log(`  - Montant LengoPay: ${result.amount}`);
    console.log(`  - Compte LengoPay: ${result.account}`);
    console.log(`  - Date LengoPay: ${result.date}`);
    
    if (updatedTransaction.statut !== lastTransaction.statut) {
      console.log('✅ Le statut a été mis à jour avec succès');
    } else {
      console.log('ℹ️ Le statut n\'a pas changé (normal si déjà à jour)');
    }
    
    console.log('\n🎉 Test terminé avec succès !');
    
  } catch (error) {
    console.error('💥 Erreur générale:', error);
  }
}

// Exécuter le test
testLengoStatus(); 
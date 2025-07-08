const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mspmrzlqhwpdkkburjiw.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY manquant');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testPaymentFlow() {
  console.log('🧪 Test du flux complet de paiement');
  
  try {
    // 1. Initier un paiement
    console.log('\n🚀 1. Initiation d\'un paiement...');
    const paymentResponse = await fetch('http://localhost:3000/api/payments/lengo-cashin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: 1000,
        phone: '620123456',
        description: 'Test de paiement automatique',
        type_account: 'lp-om-gn',
        partnerId: null
      })
    });
    
    const paymentData = await paymentResponse.json();
    
    if (!paymentResponse.ok) {
      console.error('❌ Erreur initiation paiement:', paymentData);
      return;
    }
    
    console.log('✅ Paiement initié avec succès:', {
      success: paymentData.success,
      pay_id: paymentData.pay_id,
      message: paymentData.message
    });
    
    if (!paymentData.pay_id) {
      console.error('❌ pay_id manquant dans la réponse');
      return;
    }
    
    // 2. Attendre 3 secondes (comme dans le frontend)
    console.log('\n⏰ 2. Attente de 3 secondes...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // 3. Vérifier le statut
    console.log('\n🔍 3. Vérification du statut...');
    const statusResponse = await fetch('http://localhost:3000/api/payments/lengo-status', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        pay_id: paymentData.pay_id
      })
    });
    
    const statusData = await statusResponse.json();
    
    if (!statusResponse.ok) {
      console.error('❌ Erreur vérification statut:', statusData);
      return;
    }
    
    console.log('✅ Statut vérifié avec succès:', {
      success: statusData.success,
      pay_id: statusData.pay_id,
      lengo_status: statusData.lengo_status,
      db_status: statusData.db_status,
      amount: statusData.amount,
      account: statusData.account,
      date: statusData.date
    });
    
    // 4. Vérifier la transaction en base
    console.log('\n💾 4. Vérification de la transaction en base...');
    const { data: transaction, error: transactionError } = await supabase
      .from('transactions')
      .select('*')
      .eq('numero_transaction', paymentData.pay_id)
      .single();
    
    if (transactionError) {
      console.error('❌ Erreur récupération transaction:', transactionError);
      return;
    }
    
    console.log('✅ Transaction trouvée en base:', {
      id: transaction.id,
      numero_transaction: transaction.numero_transaction,
      statut: transaction.statut,
      montant: transaction.montant,
      date_creation: transaction.date_creation,
      date_transaction: transaction.date_transaction
    });
    
    console.log('\n🎉 Test du flux complet terminé avec succès !');
    
  } catch (error) {
    console.error('💥 Erreur générale:', error);
  }
}

// Exécuter le test
testPaymentFlow(); 
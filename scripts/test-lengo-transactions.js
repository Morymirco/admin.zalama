require('dotenv').config();

async function testLengoTransactions() {
  console.log('🔍 Test de l\'API LengoPay - Récupération des transactions');
  
  const LENGO_LICENSE_KEY = process.env.LENGO_LICENSE_KEY;
  const LENGO_SITE_ID = process.env.LENGO_SITE_ID;
  
  console.log('📋 Variables d\'environnement:');
  console.log('  - LENGO_LICENSE_KEY:', LENGO_LICENSE_KEY ? '✅ Présent' : '❌ Manquant');
  console.log('  - LENGO_SITE_ID:', LENGO_SITE_ID ? '✅ Présent' : '❌ Manquant');
  
  if (!LENGO_LICENSE_KEY || !LENGO_SITE_ID) {
    console.error('❌ Variables d\'environnement manquantes');
    return;
  }
  
  try {
    const response = await fetch('https://portal.lengopay.com/api/v1/cashin/all-transactions', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${LENGO_LICENSE_KEY}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        websiteid: LENGO_SITE_ID
      })
    });
    
    console.log('📡 Statut de la réponse:', response.status, response.statusText);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erreur API:', errorText);
      return;
    }
    
    const transactions = await response.json();
    console.log('✅ Transactions récupérées:', transactions.length);
    
    if (transactions.length > 0) {
      console.log('📋 Détails des transactions:');
      transactions.forEach((tx, index) => {
        console.log(`  ${index + 1}. pay_id: ${tx.pay_id}`);
        console.log(`     date: ${tx.date}`);
        console.log(`     amount: ${tx.amount}`);
        console.log(`     account: ${tx.account}`);
        console.log(`     gateway: ${tx.gateway}`);
        console.log(`     status: ${tx.status}`);
        console.log('');
      });
    } else {
      console.log('📭 Aucune transaction trouvée dans LengoPay');
    }
    
    // Maintenant, vérifions notre base de données locale
    console.log('\n💾 Vérification de la base de données locale...');
    
    const { createClient } = require('@supabase/supabase-js');
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseServiceKey) {
      console.error('❌ SUPABASE_SERVICE_ROLE_KEY manquant');
      return;
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Compter les transactions locales
    const { count, error: countError } = await supabase
      .from('transactions')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('❌ Erreur comptage local:', countError);
      return;
    }
    
    console.log(`📊 Transactions locales: ${count}`);
    
    // Récupérer les transactions locales
    const { data: localTransactions, error: localError } = await supabase
      .from('transactions')
      .select('*')
      .order('date_creation', { ascending: false });
    
    if (localError) {
      console.error('❌ Erreur récupération locale:', localError);
      return;
    }
    
    console.log(`📋 Transactions locales récupérées: ${localTransactions.length}`);
    
    if (localTransactions.length > 0) {
      console.log('📋 Détails des transactions locales:');
      localTransactions.forEach((tx, index) => {
        console.log(`  ${index + 1}. ID: ${tx.id}`);
        console.log(`     numero_transaction: ${tx.numero_transaction}`);
        console.log(`     montant: ${tx.montant}`);
        console.log(`     statut: ${tx.statut}`);
        console.log(`     description: ${tx.description || 'N/A'}`);
        console.log(`     date_creation: ${tx.date_creation}`);
        console.log('');
      });
    }
    
    // Comparaison
    console.log('\n🔍 Comparaison LengoPay vs Base locale:');
    console.log(`  - LengoPay: ${transactions.length} transactions`);
    console.log(`  - Base locale: ${localTransactions.length} transactions`);
    
    if (transactions.length > 0 && localTransactions.length === 0) {
      console.log('⚠️  LengoPay a des transactions mais la base locale est vide');
      console.log('💡 Cela explique pourquoi l\'API retourne une liste vide');
    } else if (transactions.length === 0 && localTransactions.length === 0) {
      console.log('📭 Aucune transaction trouvée ni dans LengoPay ni en local');
    } else if (transactions.length > 0 && localTransactions.length > 0) {
      console.log('✅ Transactions trouvées dans les deux sources');
    }
    
  } catch (error) {
    console.error('💥 Erreur générale:', error);
  }
}

testLengoTransactions(); 
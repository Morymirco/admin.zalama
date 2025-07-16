// Script de test avec les vraies données
const API_BASE_URL = 'http://localhost:3000'; // ou https://admin.zalamasas.com en production
const API_KEY = 'zalama_partner_key_2024_secure_1';

// Données réelles fournies
const realData = {
  partner_id: "eabb0bd2-b7c7-4ad3-abb6-18dbd4ae3867",
  transaction_id: "e6692d53-0c7a-45be-9995-58d5ed421248",
  currency: "GNF",
  description: "Remboursement avance sur salaire",
  reference: "TXN-REF-2024-001",
  metadata: {
    motif: "Avance sur salaire",
    periode: "Janvier 2024"
  }
};

// Test de l'endpoint de debug d'abord
async function testDebugEndpoint() {
  console.log('🔍 Test de l\'endpoint debug...');
  console.log('================================');
  
  try {
    const debugResponse = await fetch(`${API_BASE_URL}/api/payments/lengo-external/debug?partner_id=${realData.partner_id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('📥 Debug Status:', debugResponse.status);
    
    if (debugResponse.ok) {
      const debugResult = await debugResponse.json();
      console.log('✅ Debug Response:', JSON.stringify(debugResult, null, 2));
      
      // Vérifier si la transaction existe
      const transaction = debugResult.data.transactions_effectuee.find(t => t.id === realData.transaction_id);
      if (transaction) {
        console.log('✅ Transaction trouvée:', transaction);
      } else {
        console.log('❌ Transaction non trouvée dans les transactions EFFECTUEE');
      }
      
      // Vérifier si elle est disponible pour remboursement
      const availableTransaction = debugResult.data.transactions_disponibles.find(t => t.id === realData.transaction_id);
      if (availableTransaction) {
        console.log('✅ Transaction disponible pour remboursement:', availableTransaction);
      } else {
        console.log('❌ Transaction non disponible pour remboursement');
      }
      
    } else {
      const errorResult = await debugResponse.json();
      console.log('❌ Debug Error:', errorResult);
    }
  } catch (error) {
    console.error('❌ Debug Network Error:', error.message);
  }
}

// Test de l'API de remboursement
async function testReimbursementAPI() {
  console.log('\n💰 Test de l\'API de remboursement...');
  console.log('=====================================');
  
  console.log('📤 Données envoyées:', JSON.stringify(realData, null, 2));

  try {
    const response = await fetch(`${API_BASE_URL}/api/payments/lengo-external`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(realData)
    });

    console.log('📥 Status:', response.status);
    console.log('📥 Status Text:', response.statusText);

    const result = await response.json();
    console.log('📥 Response:', JSON.stringify(result, null, 2));

    if (response.ok) {
      console.log('✅ Succès!');
      console.log('🔗 URL de paiement:', result.data?.payment_url);
      console.log('💰 Montant total:', result.data?.amount);
      console.log('👤 Employé:', result.data?.employe);
      console.log('📋 Transaction:', result.data?.transaction);
    } else {
      console.log('❌ Erreur:', result.error);
      
      // Suggestions basées sur l'erreur
      if (result.error?.includes('Transaction non trouvée')) {
        console.log('\n💡 Suggestions:');
        console.log('1. Vérifiez que la transaction existe');
        console.log('2. Vérifiez que la transaction appartient au partenaire');
        console.log('3. Vérifiez que la transaction a le statut "EFFECTUEE"');
        console.log('4. Vérifiez qu\'aucun remboursement n\'existe déjà');
      }
    }
  } catch (error) {
    console.error('❌ Network Error:', error.message);
  }
}

// Test principal
async function main() {
  console.log('🚀 Test avec les vraies données');
  console.log('===============================');
  console.log('Partner ID:', realData.partner_id);
  console.log('Transaction ID:', realData.transaction_id);
  console.log('');
  
  await testDebugEndpoint();
  await testReimbursementAPI();
  
  console.log('\n✅ Test terminé');
}

// Exécuter le test
main().catch(console.error); 
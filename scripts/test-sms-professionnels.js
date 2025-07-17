#!/usr/bin/env node

/**
 * Script de test pour les SMS professionnels ZaLaMa
 * Teste tous les types de notifications SMS
 */

const fetch = require('node-fetch');

// Configuration
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3003';
const TEST_REQUEST_ID = 'test-request-123';
const TEST_PAYMENT_ID = 'test-payment-456';

// Couleurs pour la console
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logHeader(message) {
  log(`\n${colors.bright}${colors.cyan}${'='.repeat(60)}${colors.reset}`);
  log(`${colors.bright}${colors.cyan}${message}${colors.reset}`);
  log(`${colors.bright}${colors.cyan}${'='.repeat(60)}${colors.reset}\n`);
}

/**
 * Test 1: SMS de Réception de Demande
 */
async function testRequestReceivedSMS() {
  logHeader('TEST 1: SMS de Réception de Demande');
  
  try {
    logInfo('Envoi du SMS de réception...');
    
    const response = await fetch(`${BASE_URL}/api/advance/notifications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'request_received',
        requestId: TEST_REQUEST_ID
      })
    });

    const result = await response.json();
    
    if (response.ok && result.success) {
      logSuccess('SMS de réception envoyé avec succès !');
      logInfo(`Détails: SMS=${result.sms_sent ? '✅' : '❌'}, Email=${result.email_sent ? '✅' : '❌'}`);
      if (result.details) {
        logInfo(`SMS employé: ${result.details.sms?.success ? '✅' : '❌'} ${result.details.sms?.error || ''}`);
      }
    } else {
      logError(`Échec de l'envoi: ${result.error || 'Erreur inconnue'}`);
    }
  } catch (error) {
    logError(`Erreur réseau: ${error.message}`);
  }
}

/**
 * Test 2: SMS d'Approbation
 */
async function testApprovalSMS() {
  logHeader('TEST 2: SMS d\'Approbation');
  
  try {
    logInfo('Envoi du SMS d\'approbation...');
    
    const response = await fetch(`${BASE_URL}/api/advance/notifications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'approval',
        requestId: TEST_REQUEST_ID
      })
    });

    const result = await response.json();
    
    if (response.ok && result.success) {
      logSuccess('SMS d\'approbation envoyé avec succès !');
      logInfo(`Détails: SMS=${result.sms_sent ? '✅' : '❌'}, Email=${result.email_sent ? '✅' : '❌'}`);
      if (result.details) {
        logInfo(`SMS employé: ${result.details.sms?.success ? '✅' : '❌'} ${result.details.sms?.error || ''}`);
      }
    } else {
      logError(`Échec de l'envoi: ${result.error || 'Erreur inconnue'}`);
    }
  } catch (error) {
    logError(`Erreur réseau: ${error.message}`);
  }
}

/**
 * Test 3: SMS de Rejet
 */
async function testRejectionSMS() {
  logHeader('TEST 3: SMS de Rejet');
  
  try {
    logInfo('Envoi du SMS de rejet...');
    
    const response = await fetch(`${BASE_URL}/api/advance/notifications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'rejection',
        requestId: TEST_REQUEST_ID,
        motif_rejet: 'Documents incomplets - Veuillez fournir les justificatifs manquants'
      })
    });

    const result = await response.json();
    
    if (response.ok && result.success) {
      logSuccess('SMS de rejet envoyé avec succès !');
      logInfo(`Détails: SMS=${result.sms_sent ? '✅' : '❌'}, Email=${result.email_sent ? '✅' : '❌'}`);
      if (result.details) {
        logInfo(`SMS employé: ${result.details.sms?.success ? '✅' : '❌'} ${result.details.sms?.error || ''}`);
      }
    } else {
      logError(`Échec de l'envoi: ${result.error || 'Erreur inconnue'}`);
    }
  } catch (error) {
    logError(`Erreur réseau: ${error.message}`);
  }
}

/**
 * Test 4: SMS de Paiement Réussi
 */
async function testPaymentSuccessSMS() {
  logHeader('TEST 4: SMS de Paiement Réussi');
  
  try {
    logInfo('Envoi du SMS de paiement réussi...');
    
    const response = await fetch(`${BASE_URL}/api/advance/notifications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'payment_success',
        paymentId: TEST_PAYMENT_ID
      })
    });

    const result = await response.json();
    
    if (response.ok && result.success) {
      logSuccess('SMS de paiement réussi envoyé avec succès !');
      logInfo(`Détails: SMS=${result.sms_sent ? '✅' : '❌'}, Email=${result.email_sent ? '✅' : '❌'}`);
      if (result.details) {
        logInfo(`SMS employé: ${result.details.sms?.success ? '✅' : '❌'} ${result.details.sms?.error || ''}`);
      }
    } else {
      logError(`Échec de l'envoi: ${result.error || 'Erreur inconnue'}`);
    }
  } catch (error) {
    logError(`Erreur réseau: ${error.message}`);
  }
}

/**
 * Test 5: SMS d'Échec de Paiement
 */
async function testPaymentFailureSMS() {
  logHeader('TEST 5: SMS d\'Échec de Paiement');
  
  try {
    logInfo('Envoi du SMS d\'échec de paiement...');
    
    const response = await fetch(`${BASE_URL}/api/advance/notifications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'payment_failure',
        paymentId: TEST_PAYMENT_ID,
        errorMessage: 'Solde insuffisant sur le compte de paiement'
      })
    });

    const result = await response.json();
    
    if (response.ok && result.success) {
      logSuccess('SMS d\'échec de paiement envoyé avec succès !');
      logInfo(`Détails: SMS=${result.sms_sent ? '✅' : '❌'}, Email=${result.email_sent ? '✅' : '❌'}`);
      if (result.details) {
        logInfo(`SMS employé: ${result.details.sms?.success ? '✅' : '❌'} ${result.details.sms?.error || ''}`);
      }
    } else {
      logError(`Échec de l'envoi: ${result.error || 'Erreur inconnue'}`);
    }
  } catch (error) {
    logError(`Erreur réseau: ${error.message}`);
  }
}

/**
 * Test 6: SMS Marketing Direct
 */
async function testMarketingSMS() {
  logHeader('TEST 6: SMS Marketing Direct');
  
  try {
    logInfo('Envoi du SMS marketing...');
    
    const response = await fetch(`${BASE_URL}/api/sms/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: ['+224123456789'], // Numéro de test
        message: 'ZaLaMa\nTest SMS Marketing - Votre plateforme d\'avances sur salaire.\nMerci pour votre confiance.',
        sender_name: 'ZaLaMa'
      })
    });

    const result = await response.json();
    
    if (response.ok && result.success) {
      logSuccess('SMS marketing envoyé avec succès !');
      logInfo(`Réponse: ${JSON.stringify(result.response, null, 2)}`);
    } else {
      logError(`Échec de l'envoi: ${result.error || 'Erreur inconnue'}`);
    }
  } catch (error) {
    logError(`Erreur réseau: ${error.message}`);
  }
}

/**
 * Test 7: Vérification du Solde SMS
 */
async function testSMSBalance() {
  logHeader('TEST 7: Vérification du Solde SMS');
  
  try {
    logInfo('Vérification du solde SMS...');
    
    const response = await fetch(`${BASE_URL}/api/sms/balance`);
    const result = await response.json();
    
    if (response.ok) {
      logSuccess(`Solde SMS vérifié avec succès !`);
      logInfo(`Solde: ${result.balance} ${result.currency || 'GNF'}`);
    } else {
      logError(`Échec de la vérification: ${result.error || 'Erreur inconnue'}`);
    }
  } catch (error) {
    logError(`Erreur réseau: ${error.message}`);
  }
}

/**
 * Test 8: Test de l'API Externe
 */
async function testExternalAPISMS() {
  logHeader('TEST 8: API Externe - SMS');
  
  try {
    logInfo('Test de l\'API externe pour SMS...');
    
    const response = await fetch(`${BASE_URL}/api/external/notifications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': 'zalama_external_key_2024'
      },
      body: JSON.stringify({
        type: 'sms',
        recipients: [
          {
            phone: '+224123456789',
            name: 'Test User'
          }
        ],
        message: {
          content: 'ZaLaMa\nTest API Externe - Notification SMS professionnelle.\nMerci pour votre confiance.'
        },
        template: 'custom'
      })
    });

    const result = await response.json();
    
    if (response.ok && result.success) {
      logSuccess('API externe SMS testée avec succès !');
      logInfo(`Résultats: ${result.results.success}/${result.results.total} réussis`);
      if (result.results.sms && result.results.sms.length > 0) {
        const smsResult = result.results.sms[0];
        logInfo(`SMS: ${smsResult.success ? '✅' : '❌'} ${smsResult.error || ''}`);
      }
    } else {
      logError(`Échec du test: ${result.error || 'Erreur inconnue'}`);
    }
  } catch (error) {
    logError(`Erreur réseau: ${error.message}`);
  }
}

/**
 * Fonction principale
 */
async function runAllTests() {
  logHeader('🚀 DÉMARRAGE DES TESTS SMS PROFESSIONNELS ZALAMA');
  
  logInfo(`URL de base: ${BASE_URL}`);
  logInfo(`ID de test demande: ${TEST_REQUEST_ID}`);
  logInfo(`ID de test paiement: ${TEST_PAYMENT_ID}`);
  
  // Attendre 2 secondes avant de commencer
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  try {
    // Tests séquentiels avec délai entre chaque
    await testSMSBalance();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await testRequestReceivedSMS();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await testApprovalSMS();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await testRejectionSMS();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await testPaymentSuccessSMS();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await testPaymentFailureSMS();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await testMarketingSMS();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await testExternalAPISMS();
    
  } catch (error) {
    logError(`Erreur lors des tests: ${error.message}`);
  }
  
  logHeader('🏁 FIN DES TESTS SMS PROFESSIONNELS ZALAMA');
  logInfo('Vérifiez les logs du serveur pour plus de détails sur les envois.');
}

// Exécuter les tests si le script est appelé directement
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = {
  testRequestReceivedSMS,
  testApprovalSMS,
  testRejectionSMS,
  testPaymentSuccessSMS,
  testPaymentFailureSMS,
  testMarketingSMS,
  testSMSBalance,
  testExternalAPISMS,
  runAllTests
}; 
const https = require('https');
const http = require('http');

// Configuration
const BASE_URL = 'http://localhost:3000';
const TEST_EMAIL = 'admin@zalamagn.com';
const TEST_PASSWORD = 'AdminZalama2024!';

// Fonction utilitaire pour faire des requêtes HTTP
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 3000),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Performance-Test/1.0',
        ...options.headers
      }
    };

    const req = client.request(requestOptions, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: data
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }

    req.end();
  });
}

// Test de performance de l'API session
async function testSessionAPI() {
  console.log('🔍 Test de l\'API session...');
  
  const startTime = Date.now();
  
  try {
    const response = await makeRequest(`${BASE_URL}/api/auth/session`);
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log(`✅ API Session: ${duration}ms (Status: ${response.statusCode})`);
    
    if (duration < 100) {
      console.log('   🟢 EXCELLENT: Très rapide');
    } else if (duration < 500) {
      console.log('   🟡 BON: Acceptable');
    } else if (duration < 1000) {
      console.log('   🟠 MOYEN: Lent');
    } else {
      console.log('   🔴 LENT: Très lent');
    }
    
    return duration;
  } catch (error) {
    console.error('❌ Erreur API Session:', error.message);
    return null;
  }
}

// Test de performance de la page dashboard
async function testDashboardPage() {
  console.log('\n📊 Test de la page dashboard...');
  
  const startTime = Date.now();
  
  try {
    const response = await makeRequest(`${BASE_URL}/dashboard`);
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log(`✅ Page Dashboard: ${duration}ms (Status: ${response.statusCode})`);
    
    // Analyser la taille de la réponse
    const responseSize = response.data.length;
    const sizeKB = (responseSize / 1024).toFixed(2);
    
    console.log(`   📦 Taille: ${sizeKB} KB`);
    
    if (duration < 1000) {
      console.log('   🟢 EXCELLENT: Chargement très rapide');
    } else if (duration < 3000) {
      console.log('   🟡 BON: Chargement acceptable');
    } else if (duration < 5000) {
      console.log('   🟠 MOYEN: Chargement lent');
    } else {
      console.log('   🔴 LENT: Chargement très lent');
    }
    
    return { duration, size: responseSize };
  } catch (error) {
    console.error('❌ Erreur Page Dashboard:', error.message);
    return null;
  }
}

// Test de performance des composants individuels
async function testComponents() {
  console.log('\n🧩 Test des composants...');
  
  const components = [
    { name: 'Statistiques Générales', path: '/api/employees' },
    { name: 'Performance Financière', path: '/api/transactions' },
    { name: 'Activité Partenaires', path: '/api/partners' },
    { name: 'Services', path: '/api/services' }
  ];
  
  const results = [];
  
  for (const component of components) {
    const startTime = Date.now();
    
    try {
      const response = await makeRequest(`${BASE_URL}${component.path}`);
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      console.log(`✅ ${component.name}: ${duration}ms`);
      results.push({ name: component.name, duration, status: response.statusCode });
    } catch (error) {
      console.log(`❌ ${component.name}: Erreur - ${error.message}`);
      results.push({ name: component.name, duration: null, status: 'ERROR' });
    }
  }
  
  return results;
}

// Test de performance de la base de données
async function testDatabasePerformance() {
  console.log('\n🗄️ Test de performance base de données...');
  
  const queries = [
    { name: 'Employés', path: '/api/employees' },
    { name: 'Partenaires', path: '/api/partners' },
    { name: 'Services', path: '/api/services' },
    { name: 'Transactions', path: '/api/transactions' }
  ];
  
  const results = [];
  
  for (const query of queries) {
    const startTime = Date.now();
    
    try {
      const response = await makeRequest(`${BASE_URL}${query.path}`);
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Compter les éléments retournés
      let itemCount = 0;
      try {
        const data = JSON.parse(response.data);
        itemCount = Array.isArray(data) ? data.length : 1;
      } catch (e) {
        itemCount = 0;
      }
      
      console.log(`✅ ${query.name}: ${duration}ms (${itemCount} éléments)`);
      results.push({ 
        name: query.name, 
        duration, 
        itemCount, 
        status: response.statusCode 
      });
    } catch (error) {
      console.log(`❌ ${query.name}: Erreur - ${error.message}`);
      results.push({ 
        name: query.name, 
        duration: null, 
        itemCount: 0, 
        status: 'ERROR' 
      });
    }
  }
  
  return results;
}

// Test de charge simple
async function testLoad() {
  console.log('\n⚡ Test de charge...');
  
  const concurrentRequests = 5;
  const results = [];
  
  console.log(`   Envoi de ${concurrentRequests} requêtes simultanées...`);
  
  const promises = Array.from({ length: concurrentRequests }, async (_, index) => {
    const startTime = Date.now();
    
    try {
      const response = await makeRequest(`${BASE_URL}/api/auth/session`);
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      return { index, duration, status: response.statusCode };
    } catch (error) {
      return { index, duration: null, status: 'ERROR', error: error.message };
    }
  });
  
  const responses = await Promise.all(promises);
  
  responses.forEach(result => {
    if (result.duration !== null) {
      console.log(`   Requête ${result.index + 1}: ${result.duration}ms`);
      results.push(result.duration);
    } else {
      console.log(`   Requête ${result.index + 1}: Erreur - ${result.error}`);
    }
  });
  
  if (results.length > 0) {
    const avgDuration = results.reduce((a, b) => a + b, 0) / results.length;
    const minDuration = Math.min(...results);
    const maxDuration = Math.max(...results);
    
    console.log(`\n📊 Statistiques de charge:`);
    console.log(`   Moyenne: ${avgDuration.toFixed(2)}ms`);
    console.log(`   Min: ${minDuration}ms`);
    console.log(`   Max: ${maxDuration}ms`);
  }
  
  return results;
}

// Test principal
async function runPerformanceTests() {
  console.log('🚀 Test de performance du dashboard ZaLaMa\n');
  console.log('=' .repeat(50));
  
  try {
    // Test 1: API Session
    const sessionTime = await testSessionAPI();
    
    // Test 2: Page Dashboard
    const dashboardResult = await testDashboardPage();
    
    // Test 3: Composants
    const componentResults = await testComponents();
    
    // Test 4: Base de données
    const dbResults = await testDatabasePerformance();
    
    // Test 5: Charge
    const loadResults = await testLoad();
    
    // Résumé final
    console.log('\n' + '=' .repeat(50));
    console.log('📋 RÉSUMÉ DES PERFORMANCES');
    console.log('=' .repeat(50));
    
    if (sessionTime) {
      console.log(`🔍 API Session: ${sessionTime}ms`);
    }
    
    if (dashboardResult) {
      console.log(`📊 Page Dashboard: ${dashboardResult.duration}ms (${(dashboardResult.size / 1024).toFixed(2)} KB)`);
    }
    
    // Moyenne des composants
    const validComponentTimes = componentResults.filter(r => r.duration !== null).map(r => r.duration);
    if (validComponentTimes.length > 0) {
      const avgComponentTime = validComponentTimes.reduce((a, b) => a + b, 0) / validComponentTimes.length;
      console.log(`🧩 Composants (moyenne): ${avgComponentTime.toFixed(2)}ms`);
    }
    
    // Moyenne des requêtes DB
    const validDBTimes = dbResults.filter(r => r.duration !== null).map(r => r.duration);
    if (validDBTimes.length > 0) {
      const avgDBTime = validDBTimes.reduce((a, b) => a + b, 0) / validDBTimes.length;
      console.log(`🗄️ Base de données (moyenne): ${avgDBTime.toFixed(2)}ms`);
    }
    
    // Évaluation globale
    const totalTime = (sessionTime || 0) + (dashboardResult?.duration || 0);
    
    console.log('\n🎯 ÉVALUATION GLOBALE:');
    if (totalTime < 2000) {
      console.log('🟢 EXCELLENT: Performance très bonne');
    } else if (totalTime < 4000) {
      console.log('🟡 BON: Performance acceptable');
    } else if (totalTime < 6000) {
      console.log('🟠 MOYEN: Performance à améliorer');
    } else {
      console.log('🔴 LENT: Performance problématique');
    }
    
    console.log('\n💡 Recommandations:');
    if (sessionTime && sessionTime > 500) {
      console.log('   - Optimiser l\'API session');
    }
    if (dashboardResult && dashboardResult.duration > 2000) {
      console.log('   - Implémenter le lazy loading des composants');
    }
    if (validDBTimes.length > 0 && Math.max(...validDBTimes) > 1000) {
      console.log('   - Optimiser les requêtes de base de données');
    }
    
  } catch (error) {
    console.error('❌ Erreur lors des tests:', error.message);
  }
}

// Vérifier si le serveur est en cours d'exécution
async function checkServer() {
  try {
    const response = await makeRequest(`${BASE_URL}/api/health`);
    console.log('✅ Serveur accessible');
    return true;
  } catch (error) {
    console.error('❌ Serveur non accessible. Assurez-vous que le serveur Next.js est en cours d\'exécution sur http://localhost:3000');
    return false;
  }
}

// Point d'entrée
async function main() {
  const serverAvailable = await checkServer();
  
  if (serverAvailable) {
    await runPerformanceTests();
  }
}

main(); 
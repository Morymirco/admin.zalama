const puppeteer = require('puppeteer');

async function testDashboardPerformance() {
  console.log('🚀 Test de performance du dashboard...\n');
  
  let browser;
  try {
    // Lancer le navigateur
    browser = await puppeteer.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Activer le monitoring des performances
    await page.setCacheEnabled(false);
    
    // Mesurer le temps de navigation
    console.log('📊 Test de navigation vers le dashboard...');
    
    const navigationStart = Date.now();
    
    // Aller à la page de connexion
    await page.goto('http://localhost:3000/login', { 
      waitUntil: 'networkidle0',
      timeout: 30000 
    });
    
    const loginPageLoad = Date.now() - navigationStart;
    console.log(`✅ Page de connexion chargée en ${loginPageLoad}ms`);
    
    // Se connecter
    console.log('\n🔐 Connexion...');
    const loginStart = Date.now();
    
    await page.type('input[name="email"]', 'admin@zalamagn.com');
    await page.type('input[name="password"]', 'AdminZalama2024!');
    await page.click('button[type="submit"]');
    
    // Attendre la redirection vers le dashboard
    await page.waitForNavigation({ 
      waitUntil: 'networkidle0',
      timeout: 30000 
    });
    
    const loginDuration = Date.now() - loginStart;
    console.log(`✅ Connexion et redirection en ${loginDuration}ms`);
    
    // Mesurer le temps de chargement du dashboard
    console.log('\n📊 Test de chargement du dashboard...');
    
    const dashboardStart = Date.now();
    
    // Attendre que la page soit complètement chargée
    await page.waitForSelector('.bg-\\[var\\(--zalama-card\\)\\]', { timeout: 30000 });
    
    // Attendre que tous les composants soient chargés
    await page.waitForFunction(() => {
      const loadingElements = document.querySelectorAll('.animate-spin');
      return loadingElements.length === 0;
    }, { timeout: 30000 });
    
    const dashboardLoad = Date.now() - dashboardStart;
    console.log(`✅ Dashboard chargé en ${dashboardLoad}ms`);
    
    // Mesurer les métriques de performance
    const performanceMetrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0];
      const paint = performance.getEntriesByType('paint');
      
      return {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        firstPaint: paint.find(p => p.name === 'first-paint')?.startTime || 0,
        firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
        totalTime: navigation.loadEventEnd - navigation.fetchStart
      };
    });
    
    console.log('\n📈 Métriques de performance:');
    console.log(`   DOM Content Loaded: ${performanceMetrics.domContentLoaded}ms`);
    console.log(`   Load Complete: ${performanceMetrics.loadComplete}ms`);
    console.log(`   First Paint: ${performanceMetrics.firstPaint}ms`);
    console.log(`   First Contentful Paint: ${performanceMetrics.firstContentfulPaint}ms`);
    console.log(`   Total Time: ${performanceMetrics.totalTime}ms`);
    
    // Compter les composants chargés
    const componentCount = await page.evaluate(() => {
      return document.querySelectorAll('.bg-\\[var\\(--zalama-card\\)\\]').length;
    });
    
    console.log(`\n📊 Composants chargés: ${componentCount}`);
    
    // Test de performance des interactions
    console.log('\n🖱️ Test d\'interactions...');
    
    const interactionStart = Date.now();
    
    // Cliquer sur un élément pour tester la réactivité
    await page.click('h2');
    
    const interactionTime = Date.now() - interactionStart;
    console.log(`✅ Temps de réponse aux interactions: ${interactionTime}ms`);
    
    // Résumé des performances
    console.log('\n📋 Résumé des performances:');
    console.log(`   Navigation initiale: ${loginPageLoad}ms`);
    console.log(`   Connexion + redirection: ${loginDuration}ms`);
    console.log(`   Chargement dashboard: ${dashboardLoad}ms`);
    console.log(`   Temps total: ${loginPageLoad + loginDuration + dashboardLoad}ms`);
    
    // Évaluation des performances
    const totalTime = loginPageLoad + loginDuration + dashboardLoad;
    
    if (totalTime < 2000) {
      console.log('   🟢 EXCELLENT: Chargement très rapide');
    } else if (totalTime < 4000) {
      console.log('   🟡 BON: Chargement acceptable');
    } else if (totalTime < 6000) {
      console.log('   🟠 MOYEN: Chargement lent, optimisations recommandées');
    } else {
      console.log('   🔴 LENT: Chargement très lent, optimisations nécessaires');
    }
    
    // Test de mémoire
    const memoryInfo = await page.evaluate(() => {
      if (performance.memory) {
        return {
          usedJSHeapSize: performance.memory.usedJSHeapSize,
          totalJSHeapSize: performance.memory.totalJSHeapSize,
          jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
        };
      }
      return null;
    });
    
    if (memoryInfo) {
      console.log('\n💾 Utilisation mémoire:');
      console.log(`   Utilisée: ${(memoryInfo.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`);
      console.log(`   Totale: ${(memoryInfo.totalJSHeapSize / 1024 / 1024).toFixed(2)} MB`);
      console.log(`   Limite: ${(memoryInfo.jsHeapSizeLimit / 1024 / 1024).toFixed(2)} MB`);
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

async function testComponentLoading() {
  console.log('\n🔍 Test de chargement des composants...\n');
  
  let browser;
  try {
    browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    
    // Aller directement au dashboard (en supposant qu'on est déjà connecté)
    await page.goto('http://localhost:3000/dashboard', { 
      waitUntil: 'networkidle0',
      timeout: 30000 
    });
    
    // Mesurer le temps de chargement de chaque composant
    const componentLoadTimes = await page.evaluate(() => {
      const components = document.querySelectorAll('.bg-\\[var\\(--zalama-card\\)\\]');
      const times = [];
      
      components.forEach((component, index) => {
        const rect = component.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          times.push({
            index,
            loaded: true,
            time: performance.now()
          });
        }
      });
      
      return times;
    });
    
    console.log(`📊 Composants chargés: ${componentLoadTimes.length}`);
    
    componentLoadTimes.forEach((comp, index) => {
      console.log(`   Composant ${index + 1}: ${comp.loaded ? '✅ Chargé' : '⏳ En cours'}`);
    });
    
  } catch (error) {
    console.error('❌ Erreur lors du test des composants:', error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Exécuter les tests
async function runTests() {
  try {
    await testDashboardPerformance();
    await testComponentLoading();
  } catch (error) {
    console.error('❌ Erreur lors des tests:', error);
  }
}

runTests(); 
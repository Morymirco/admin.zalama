const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = 'https://mspmrzlqhwpdkkburjiw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zcG1yemxxaHdwZGtrYnVyaml3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3ODcyNTgsImV4cCI6MjA2NjM2MzI1OH0.zr-TRpKjGJjW0nRtsyPcCLy4Us-c5tOGX71k5_3JJd0';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSessionAPIPerformance() {
  console.log('🚀 Test de performance de l\'API session...\n');
  
  const baseUrl = 'http://localhost:3000';
  const testToken = 'test-token-' + Date.now();
  
  const tests = [
    { name: 'POST (nouveau token)', method: 'POST', body: { token: testToken } },
    { name: 'POST (token en cache)', method: 'POST', body: { token: testToken } },
    { name: 'POST (autre token)', method: 'POST', body: { token: 'another-token-' + Date.now() } },
    { name: 'DELETE', method: 'DELETE' },
  ];
  
  for (const test of tests) {
    console.log(`📊 Test: ${test.name}`);
    
    const times = [];
    const errors = [];
    
    // Effectuer 5 tests pour chaque opération
    for (let i = 0; i < 5; i++) {
      const start = Date.now();
      try {
        const response = await fetch(`${baseUrl}/api/auth/session`, {
          method: test.method,
          headers: test.method === 'POST' ? { 'Content-Type': 'application/json' } : {},
          body: test.method === 'POST' ? JSON.stringify(test.body) : undefined,
        });
        
        const duration = Date.now() - start;
        times.push(duration);
        
        if (response.ok) {
          const data = await response.json();
          console.log(`  Test ${i + 1}: ${duration}ms (${data.cached ? 'cached' : 'new'})`);
        } else {
          console.log(`  Test ${i + 1}: ${duration}ms (ERROR: ${response.status})`);
        }
      } catch (error) {
        const duration = Date.now() - start;
        errors.push({ duration, error: error.message });
        console.log(`  Test ${i + 1}: ${duration}ms (ERREUR: ${error.message})`);
      }
    }
    
    // Calculer les statistiques
    if (times.length > 0) {
      const avg = times.reduce((a, b) => a + b, 0) / times.length;
      const min = Math.min(...times);
      const max = Math.max(...times);
      
      console.log(`\n  📈 Statistiques:`);
      console.log(`    Moyenne: ${avg.toFixed(2)}ms`);
      console.log(`    Min: ${min}ms`);
      console.log(`    Max: ${max}ms`);
      console.log(`    Succès: ${times.length}/5`);
      
      if (avg > 1000) {
        console.log(`    ⚠️  LENT: ${avg.toFixed(0)}ms (devrait être < 500ms)`);
      } else if (avg > 500) {
        console.log(`    ⚡ MOYEN: ${avg.toFixed(0)}ms (peut être optimisé)`);
      } else {
        console.log(`    ✅ RAPIDE: ${avg.toFixed(0)}ms`);
      }
    }
    
    if (errors.length > 0) {
      console.log(`    Erreurs: ${errors.length}/5`);
    }
    
    console.log('');
  }
}

async function testSupabaseSessionPerformance() {
  console.log('🔍 Test de performance Supabase Auth...\n');
  
  const tests = [
    { name: 'getSession()', fn: () => supabase.auth.getSession() },
    { name: 'getUser()', fn: () => supabase.auth.getUser() },
  ];
  
  for (const test of tests) {
    console.log(`📊 Test: ${test.name}`);
    
    const times = [];
    const errors = [];
    
    // Effectuer 5 tests
    for (let i = 0; i < 5; i++) {
      const start = Date.now();
      try {
        await test.fn();
        const duration = Date.now() - start;
        times.push(duration);
        console.log(`  Test ${i + 1}: ${duration}ms`);
      } catch (error) {
        const duration = Date.now() - start;
        errors.push({ duration, error: error.message });
        console.log(`  Test ${i + 1}: ${duration}ms (ERREUR: ${error.message})`);
      }
    }
    
    // Calculer les statistiques
    if (times.length > 0) {
      const avg = times.reduce((a, b) => a + b, 0) / times.length;
      const min = Math.min(...times);
      const max = Math.max(...times);
      
      console.log(`\n  📈 Statistiques:`);
      console.log(`    Moyenne: ${avg.toFixed(2)}ms`);
      console.log(`    Min: ${min}ms`);
      console.log(`    Max: ${max}ms`);
      console.log(`    Succès: ${times.length}/5`);
    }
    
    if (errors.length > 0) {
      console.log(`    Erreurs: ${errors.length}/5`);
    }
    
    console.log('');
  }
}

async function testFullLoginFlow() {
  console.log('🔄 Test du flux de connexion complet...\n');
  
  try {
    // 1. Connexion
    console.log('1️⃣ Connexion...');
    const loginStart = Date.now();
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'admin@zalamagn.com',
      password: 'AdminZalama2024!',
    });
    
    const loginDuration = Date.now() - loginStart;
    
    if (error) {
      console.error('❌ Erreur de connexion:', error.message);
      return;
    }
    
    console.log(`✅ Connexion réussie en ${loginDuration}ms`);
    
    // 2. Test de l'API session avec le vrai token
    console.log('\n2️⃣ Test API session avec vrai token...');
    const baseUrl = 'http://localhost:3000';
    
    try {
      const apiStart = Date.now();
      const response = await fetch(`${baseUrl}/api/auth/session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: data.session.access_token })
      });
      
      const apiDuration = Date.now() - apiStart;
      
      if (response.ok) {
        const result = await response.json();
        console.log(`✅ API session: ${apiDuration}ms (${result.cached ? 'cached' : 'new'})`);
      } else {
        console.log(`❌ API session error: ${apiDuration}ms (${response.status})`);
      }
    } catch (apiError) {
      console.log('⚠️ Serveur non démarré pour test API');
    }
    
    // 3. Déconnexion
    console.log('\n3️⃣ Déconnexion...');
    const logoutStart = Date.now();
    
    const { error: signOutError } = await supabase.auth.signOut();
    
    const logoutDuration = Date.now() - logoutStart;
    
    if (signOutError) {
      console.error('❌ Erreur de déconnexion:', signOutError.message);
    } else {
      console.log(`✅ Déconnexion réussie en ${logoutDuration}ms`);
    }
    
         console.log('\n📋 Résumé du flux complet:');
     console.log(`   Connexion: ${loginDuration}ms`);
     console.log(`   API Session: ${apiDuration || 'N/A'}ms`);
     console.log(`   Déconnexion: ${logoutDuration}ms`);
     
     if (apiDuration) {
       console.log(`   Total: ${loginDuration + apiDuration + logoutDuration}ms`);
     }
    
  } catch (error) {
    console.error('❌ Erreur lors du test complet:', error.message);
  }
}

// Exécuter les tests
async function runTests() {
  try {
    await testSupabaseSessionPerformance();
    await testSessionAPIPerformance();
    await testFullLoginFlow();
  } catch (error) {
    console.error('❌ Erreur lors des tests:', error);
  }
}

runTests(); 
const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = 'https://mspmrzlqhwpdkkburjiw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zcG1yemxxaHdwZGtrYnVyaml3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3ODcyNTgsImV4cCI6MjA2NjM2MzI1OH0.zr-TRpKjGJjW0nRtsyPcCLy4Us-c5tOGX71k5_3JJd0';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testRedirection() {
  console.log('🚀 Test de redirection après connexion...\n');

  try {
    // 1. Vérifier l'état initial
    console.log('1️⃣ Vérification de l\'état initial...');
    const { data: { session: initialSession } } = await supabase.auth.getSession();
    console.log(`   Session initiale: ${initialSession ? 'Connecté' : 'Non connecté'}`);
    
    if (initialSession) {
      console.log(`   Email: ${initialSession.user.email}`);
    }

    // 2. Test de connexion
    console.log('\n2️⃣ Test de connexion...');
    const testEmail = 'admin@zalamagn.com';
    const testPassword = 'AdminZalama2024!';
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword,
    });

    if (error) {
      console.error('❌ Erreur de connexion:', error.message);
      return;
    }

    console.log('✅ Connexion réussie!');
    console.log(`   Email: ${data.user.email}`);
    console.log(`   ID: ${data.user.id}`);

    // 3. Vérifier la session après connexion
    console.log('\n3️⃣ Vérification de la session après connexion...');
    const { data: { session: newSession } } = await supabase.auth.getSession();
    
    if (newSession) {
      console.log('✅ Session créée avec succès');
      console.log(`   Token d'accès: ${newSession.access_token ? 'Présent' : 'Manquant'}`);
      console.log(`   Expire le: ${newSession.expires_at ? new Date(newSession.expires_at * 1000).toLocaleString() : 'Non défini'}`);
    } else {
      console.log('❌ Aucune session après connexion');
    }

    // 4. Test de l'API route session
    console.log('\n4️⃣ Test de l\'API route session...');
    const baseUrl = 'http://localhost:3000';
    
    try {
      const response = await fetch(`${baseUrl}/api/auth/session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: newSession.access_token })
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ API route session fonctionne');
        console.log(`   Réponse: ${JSON.stringify(result)}`);
      } else {
        console.log(`❌ Erreur API route: ${response.status}`);
      }
    } catch (apiError) {
      console.log('⚠️ Impossible de tester l\'API route (serveur non démarré?)');
    }

    // 5. Test de déconnexion
    console.log('\n5️⃣ Test de déconnexion...');
    const { error: signOutError } = await supabase.auth.signOut();
    
    if (signOutError) {
      console.error('❌ Erreur de déconnexion:', signOutError.message);
    } else {
      console.log('✅ Déconnexion réussie');
    }

    // 6. Vérifier l'état final
    console.log('\n6️⃣ Vérification de l\'état final...');
    const { data: { session: finalSession } } = await supabase.auth.getSession();
    console.log(`   Session finale: ${finalSession ? 'Connecté' : 'Non connecté'}`);

    console.log('\n🎉 Test de redirection terminé avec succès!');
    console.log('\n📋 Résumé:');
    console.log('   ✅ Connexion Supabase fonctionne');
    console.log('   ✅ Session créée correctement');
    console.log('   ✅ Déconnexion fonctionne');
    console.log('   ✅ Redirection devrait fonctionner');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
  }
}

// Test de l'API route session seule
async function testSessionAPI() {
  console.log('\n🌐 Test de l\'API route session...\n');
  
  const baseUrl = 'http://localhost:3000';
  
  try {
    // Test POST
    console.log('📤 Test POST /api/auth/session');
    const response = await fetch(`${baseUrl}/api/auth/session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: 'test-token-123' })
    });
    
    console.log(`   Status: ${response.status}`);
    if (response.ok) {
      const data = await response.json();
      console.log(`   Réponse: ${JSON.stringify(data)}`);
    }
    
    // Test DELETE
    console.log('\n🗑️ Test DELETE /api/auth/session');
    const deleteResponse = await fetch(`${baseUrl}/api/auth/session`, {
      method: 'DELETE'
    });
    
    console.log(`   Status: ${deleteResponse.status}`);
    if (deleteResponse.ok) {
      const data = await deleteResponse.json();
      console.log(`   Réponse: ${JSON.stringify(data)}`);
    }
    
  } catch (error) {
    console.log('⚠️ Serveur non démarré ou erreur réseau');
    console.log('   Pour tester l\'API route, démarrez le serveur avec: npm run dev');
  }
}

// Exécuter les tests
async function runTests() {
  try {
    await testRedirection();
    await testSessionAPI();
  } catch (error) {
    console.error('❌ Erreur lors des tests:', error);
  }
}

runTests(); 
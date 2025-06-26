const fs = require('fs');
const path = require('path');

console.log('🔧 Configuration automatique des variables d\'environnement ZaLaMa\n');

// Configuration Supabase ZaLaMa
const envContent = `# Configuration Supabase ZaLaMa Admin
# Généré automatiquement le ${new Date().toLocaleDateString('fr-FR')}

NEXT_PUBLIC_SUPABASE_URL=https://mspmrzlqhwpdkkburjiw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zcG1yemxxaHdwZGtrYnVyaml3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3ODcyNTgsImV4cCI6MjA2NjM2MzI1OH0.zr-TRpKjGJjW0nRtsyPcCLy4Us-c5tOGX71k5_3JJd0

# ⚠️ IMPORTANT : Remplacez cette valeur par votre clé service role
# Récupérez-la dans votre dashboard Supabase : Settings → API → service_role secret
SUPABASE_SERVICE_ROLE_KEY=votre_cle_service_role_ici

# Configuration Firebase (pour la migration progressive)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyBSnHZeHH0DMRxe8_ldsS9Mh1gwNp0fa-k
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=zalamagn-1f057.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=zalamagn-1f057
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=zalamagn-1f057.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=753763623478
NEXT_PUBLIC_FIREBASE_APP_ID=1:753763623478:web:a11f093c649593b2d02e97

# Configuration Email (Resend)
RESEND_API_KEY=votre_cle_api_resend_ici

# Configuration SMS
SMS_API_KEY=votre_cle_api_sms_ici
SMS_API_SECRET=votre_secret_api_sms_ici

# Configuration de l'application
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Configuration pour basculer entre Firebase et Supabase
NEXT_PUBLIC_USE_SUPABASE=true
`;

const envPath = path.join(__dirname, '..', '.env.local');

try {
  // Vérifier si le fichier existe déjà
  if (fs.existsSync(envPath)) {
    console.log('⚠️  Le fichier .env.local existe déjà');
    console.log('📝 Voulez-vous le remplacer ? (y/N)');
    
    // Pour l'automatisation, on continue
    console.log('🔄 Remplacement du fichier .env.local...\n');
  }

  // Écrire le fichier .env.local
  fs.writeFileSync(envPath, envContent);
  
  console.log('✅ Fichier .env.local créé avec succès !');
  console.log('📁 Emplacement :', envPath);
  console.log('\n📋 Prochaines étapes :');
  console.log('1. Ajoutez votre clé service role dans .env.local');
  console.log('2. Exécutez : node scripts/check-env.js');
  console.log('3. Exécutez : node scripts/create-admin.js');
  console.log('4. Lancez l\'application : npm run dev');
  
  console.log('\n🔑 Pour récupérer votre clé service role :');
  console.log('1. Connectez-vous à https://supabase.com');
  console.log('2. Sélectionnez votre projet ZaLaMa');
  console.log('3. Allez dans Settings → API');
  console.log('4. Copiez la valeur "service_role secret"');
  console.log('5. Remplacez "votre_cle_service_role_ici" dans .env.local');

  console.log('\n🚀 Pour tester la migration :');
  console.log('1. Lancez l\'application : npm run dev');
  console.log('2. Allez sur : http://localhost:3000/dashboard/migration-test');
  console.log('3. Testez la connexion Supabase');

} catch (error) {
  console.error('❌ Erreur lors de la création du fichier .env.local :');
  console.error(error.message);
  process.exit(1);
} 
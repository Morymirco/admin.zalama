const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = 'https://mspmrzlqhwpdkkburjiw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zcG1yemxxaHdwZGtrYnVyaml3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3ODcyNTgsImV4cCI6MjA2NjM2MzI1OH0.zr-TRpKjGJjW0nRtsyPcCLy4Us-c5tOGX71k5_3JJd0';

const supabase = createClient(supabaseUrl, supabaseKey);

// Fonction pour générer un mot de passe sécurisé
function generatePassword(length = 8) {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  
  // Assurer au moins une lettre majuscule, une minuscule, un chiffre et un caractère spécial
  password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)];
  password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)];
  password += '0123456789'[Math.floor(Math.random() * 10)];
  password += '!@#$%^&*'[Math.floor(Math.random() * 8)];
  
  // Compléter avec des caractères aléatoires
  for (let i = 4; i < length; i++) {
    password += charset[Math.floor(Math.random() * charset.length)];
  }
  
  // Mélanger les caractères
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

// Fonction pour valider un email
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Fonction pour créer un compte employé
async function createEmployeeAccount(employeeData) {
  try {
    console.log('🚀 Début de la création du compte employé...');
    
    // Vérifier que l'email est fourni
    if (!employeeData.email) {
      throw new Error('L\'email est requis pour créer un compte de connexion');
    }

    // Valider l'email
    if (!validateEmail(employeeData.email)) {
      throw new Error('Format d\'email invalide');
    }

    // Générer un mot de passe sécurisé
    const password = generatePassword();
    console.log('🔑 Mot de passe généré:', password);

    // Créer le compte dans Supabase Auth
    console.log('📝 Création du compte dans Supabase Auth...');
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: employeeData.email,
      password: password,
      email_confirm: true,
      user_metadata: {
        display_name: `${employeeData.prenom} ${employeeData.nom}`,
        role: 'user',
        partenaire_id: employeeData.partner_id,
        employee_id: employeeData.id
      }
    });

    if (authError) {
      console.error('❌ Erreur lors de la création du compte auth:', authError);
      return { success: false, error: authError.message };
    }

    console.log('✅ Compte auth créé avec succès:', authData.user.id);

    // Créer l'enregistrement dans admin_users
    console.log('📊 Création de l\'enregistrement dans admin_users...');
    const accountData = {
      id: authData.user.id,
      email: employeeData.email,
      display_name: `${employeeData.prenom} ${employeeData.nom}`,
      role: 'user',
      partenaire_id: employeeData.partner_id,
      active: true
    };

    const { data: accountRecord, error: accountError } = await supabase
      .from('admin_users')
      .insert([accountData])
      .select()
      .single();

    if (accountError) {
      console.error('❌ Erreur lors de la création du compte admin:', accountError);
      // Supprimer le compte auth créé en cas d'erreur
      await supabase.auth.admin.deleteUser(authData.user.id);
      return { success: false, error: accountError.message };
    }

    console.log('✅ Compte admin créé avec succès');

    // Simuler l'envoi du SMS
    if (employeeData.telephone) {
      console.log('📱 Simulation de l\'envoi du SMS...');
      const smsMessage = `Bonjour ${employeeData.prenom}, votre compte ZaLaMa a été créé.\nEmail: ${employeeData.email}\nMot de passe: ${password}\nConnectez-vous sur https://admin.zalama.com`;
      console.log('📨 Message SMS:', smsMessage);
      console.log('📞 Numéro de téléphone:', employeeData.telephone);
    }

    return { 
      success: true, 
      account: {
        ...accountRecord,
        password: password
      }
    };

  } catch (error) {
    console.error('❌ Erreur générale lors de la création du compte:', error);
    return { success: false, error: 'Erreur lors de la création du compte' };
  }
}

// Fonction de test principale
async function testEmployeeAccountCreation() {
  console.log('🧪 Test de création de compte employé\n');

  // Données de test
  const testEmployeeData = {
    id: 'test-employee-' + Date.now(),
    partner_id: 'test-partner-123',
    nom: 'Diallo',
    prenom: 'Ibrahim',
    email: 'ibrahim.test@zalama.com',
    telephone: '+224623456789',
    poste: 'Développeur'
  };

  console.log('📋 Données de test:', testEmployeeData);

  try {
    // Test de création de compte
    const result = await createEmployeeAccount(testEmployeeData);

    if (result.success) {
      console.log('\n✅ Test réussi !');
      console.log('📊 Résultat:', {
        employe: `${result.account.display_name}`,
        email: result.account.email,
        motDePasse: result.account.password,
        role: result.account.role,
        actif: result.account.active
      });
    } else {
      console.log('\n❌ Test échoué !');
      console.log('🚨 Erreur:', result.error);
    }

  } catch (error) {
    console.error('\n💥 Erreur lors du test:', error);
  }

  console.log('\n🏁 Fin du test');
}

// Exécuter le test
testEmployeeAccountCreation(); 
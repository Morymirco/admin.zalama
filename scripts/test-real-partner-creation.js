require('dotenv').config({ path: '.env' });
const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = 'https://mspmrzlqhwpdkkburjiw.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY non définie');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function testRealPartnerCreation() {
  console.log('🧪 Test de création de partenaire avec de vraies adresses email...\n');

  // Données de test avec de vraies adresses email
  const testPartnerData = {
    nom: 'Entreprise Test Réel',
    type: 'PME',
    secteur: 'Technologie',
    adresse: '123 Rue Test, Conakry',
    telephone: '+224625212115',
    email: 'test@entreprise.com',
    actif: true,
    
    // Données RH avec vraie adresse email
    nom_rh: 'Mariama Diallo',
    email_rh: 'ibrahimadiallo@gmail.com', // Vraie adresse email
    telephone_rh: '+224625212115',
    
    // Données responsable avec vraie adresse email
    nom_representant: 'Ibrahima Diallo',
    email_representant: 'ibrahimadiallo@gmail.com', // Vraie adresse email
    telephone_representant: '+224625212115'
  };

  try {
    console.log('📝 Création du partenaire de test...');
    
    // Créer le partenaire
    const { data: partner, error: partnerError } = await supabase
      .from('partners')
      .insert([testPartnerData])
      .select()
      .single();

    if (partnerError) {
      console.error('❌ Erreur création partenaire:', partnerError);
      return;
    }

    console.log('✅ Partenaire créé:', partner.id);

    // Appeler l'API de création des comptes
    console.log('\n🔐 Création des comptes RH et responsable...');
    
    const response = await fetch('http://localhost:3000/api/auth/create-partner-accounts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        partenaireData: { ...testPartnerData, id: partner.id } 
      }),
    });

    if (!response.ok) {
      console.error('❌ Erreur API:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('Détails:', errorText);
      return;
    }

    const result = await response.json();
    
    console.log('\n📊 Résultats de création des comptes:');
    console.log('✅ Succès:', result.success);
    console.log('📄 Résultat complet:', JSON.stringify(result, null, 2));
    
    if (result.results) {
      console.log('\n👤 Compte RH:');
      if (result.results.rh && result.results.rh.account) {
        console.log('  - Création:', result.results.rh.account.success ? '✅' : '❌');
        console.log('  - SMS:', result.results.rh.sms?.success ? '✅' : '❌');
        console.log('  - Email:', result.results.rh.email?.success ? '✅' : '❌');
      } else {
        console.log('  - Création: ❌ (pas de données)');
      }
      
      if (result.results.rh.account.success) {
        console.log('  - Mot de passe:', result.results.rh.account.account?.password);
      }
      
      if (!result.results.rh.sms.success) {
        console.log('  - Erreur SMS:', result.results.rh.sms.error);
      }
      
      if (!result.results.rh.email.success) {
        console.log('  - Erreur Email:', result.results.rh.email.error);
      }
      
      console.log('\n👤 Compte Responsable:');
      if (result.results.responsable && result.results.responsable.account) {
        console.log('  - Création:', result.results.responsable.account.success ? '✅' : '❌');
        console.log('  - SMS:', result.results.responsable.sms?.success ? '✅' : '❌');
        console.log('  - Email:', result.results.responsable.email?.success ? '✅' : '❌');
      } else {
        console.log('  - Création: ❌ (pas de données)');
      }
      
      if (result.results.responsable.account.success) {
        console.log('  - Mot de passe:', result.results.responsable.account.account?.password);
      }
      
      if (!result.results.responsable.sms.success) {
        console.log('  - Erreur SMS:', result.results.responsable.sms.error);
      }
      
      if (!result.results.responsable.email.success) {
        console.log('  - Erreur Email:', result.results.responsable.email.error);
      }
    }

    console.log('\n📧 Vérifiez votre boîte email pour les emails de bienvenue !');
    console.log('📱 Vérifiez votre téléphone pour les SMS de bienvenue !');

    // Nettoyer - supprimer le partenaire de test
    console.log('\n🧹 Nettoyage - Suppression du partenaire de test...');
    await supabase
      .from('partners')
      .delete()
      .eq('id', partner.id);
    
    console.log('✅ Test terminé avec succès !');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  }
}

// Exécuter le test
testRealPartnerCreation(); 
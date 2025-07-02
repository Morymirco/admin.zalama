const { createClient } = require('@supabase/supabase-js');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

// Configuration Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement Supabase manquantes');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Import des services (simulation côté serveur)
const { smsService } = require('../services/smsService');
const { emailService } = require('../services/emailService');

// Fonction pour générer un mot de passe
function generatePassword() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

// Service de création de comptes partenaire
class PartnerAccountService {
  async createRHAccount(rhData) {
    try {
      // Vérifier si l'email existe déjà
      const { data: existingUser, error: checkError } = await supabase
        .from('admin_users')
        .select('id, email')
        .eq('email', rhData.email_rh)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        throw new Error(`Erreur vérification email: ${checkError.message}`);
      }

      if (existingUser) {
        return { success: false, error: 'Un utilisateur avec cette adresse email existe déjà' };
      }

      // Générer un mot de passe
      const password = generatePassword();

      // Créer le compte dans Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: rhData.email_rh,
        password: password,
        email_confirm: true,
        user_metadata: {
          display_name: rhData.nom_rh,
          role: 'rh',
          partenaire_id: rhData.id
        }
      });

      if (authError) {
        throw new Error(`Erreur création compte auth: ${authError.message}`);
      }

      // Créer l'enregistrement dans admin_users
      const accountData = {
        id: authData.user.id,
        email: rhData.email_rh,
        display_name: rhData.nom_rh,
        role: 'rh',
        partenaire_id: rhData.id,
        active: true
      };

      const { data: accountRecord, error: accountError } = await supabase
        .from('admin_users')
        .insert([accountData])
        .select()
        .single();

      if (accountError) {
        // Supprimer le compte auth créé en cas d'erreur
        await supabase.auth.admin.deleteUser(authData.user.id);
        throw new Error(`Erreur création compte admin: ${accountError.message}`);
      }

      return { 
        success: true, 
        account: {
          ...accountRecord,
          password: password
        }
      };

    } catch (error) {
      console.error('Erreur lors de la création du compte RH:', error);
      return { success: false, error: `Erreur création compte RH: ${error instanceof Error ? error.message : String(error)}` };
    }
  }

  async createResponsableAccount(responsableData) {
    try {
      // Vérifier si l'email existe déjà
      const { data: existingUser, error: checkError } = await supabase
        .from('admin_users')
        .select('id, email')
        .eq('email', responsableData.email_representant)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        throw new Error(`Erreur vérification email: ${checkError.message}`);
      }

      if (existingUser) {
        return { success: false, error: 'Un utilisateur avec cette adresse email existe déjà' };
      }

      // Générer un mot de passe
      const password = generatePassword();

      // Créer le compte dans Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: responsableData.email_representant,
        password: password,
        email_confirm: true,
        user_metadata: {
          display_name: responsableData.nom_representant,
          role: 'responsable',
          partenaire_id: responsableData.id
        }
      });

      if (authError) {
        throw new Error(`Erreur création compte auth: ${authError.message}`);
      }

      // Créer l'enregistrement dans admin_users
      const accountData = {
        id: authData.user.id,
        email: responsableData.email_representant,
        display_name: responsableData.nom_representant,
        role: 'responsable',
        partenaire_id: responsableData.id,
        active: true
      };

      const { data: accountRecord, error: accountError } = await supabase
        .from('admin_users')
        .insert([accountData])
        .select()
        .single();

      if (accountError) {
        // Supprimer le compte auth créé en cas d'erreur
        await supabase.auth.admin.deleteUser(authData.user.id);
        throw new Error(`Erreur création compte admin: ${accountError.message}`);
      }

      return { 
        success: true, 
        account: {
          ...accountRecord,
          password: password
        }
      };

    } catch (error) {
      console.error('Erreur lors de la création du compte responsable:', error);
      return { success: false, error: `Erreur création compte responsable: ${error instanceof Error ? error.message : String(error)}` };
    }
  }

  async createPartnerAccounts(partenaireData) {
    try {
      // Créer le compte RH
      const rhResult = await this.createRHAccount(partenaireData);
      
      // Créer le compte responsable
      const responsableResult = await this.createResponsableAccount(partenaireData);

      return {
        rh: rhResult,
        responsable: responsableResult
      };

    } catch (error) {
      console.error('Erreur lors de la création des comptes partenaire:', error);
      return {
        rh: { success: false, error: `Erreur générale: ${error instanceof Error ? error.message : String(error)}` },
        responsable: { success: false, error: `Erreur générale: ${error instanceof Error ? error.message : String(error)}` }
      };
    }
  }
}

async function testPartnerCreationWithSMS() {
  console.log('🧪 Test de création de partenaire avec envoi SMS/Email automatique');
  console.log('=' .repeat(60));

  try {
    // Données de test pour un nouveau partenaire
    const testPartnerData = {
      id: uuidv4(),
      nom: 'Test Partenaire SMS',
      secteur: 'Technologie',
      type: 'PME',
      adresse: '123 Rue Test, Conakry',
      telephone: '+224625212115',
      email: 'test@partenaire.com',
      actif: true,
      nom_rh: 'Test RH',
      email_rh: 'rh@testpartenaire.com',
      telephone_rh: '+224625212116',
      nom_representant: 'Test Responsable',
      email_representant: 'responsable@testpartenaire.com',
      telephone_representant: '+224625212117',
      logo_url: null,
      description: 'Partenaire de test pour vérifier l\'envoi SMS/Email'
    };

    console.log('📝 Données du partenaire de test:');
    console.log('  - ID:', testPartnerData.id);
    console.log('  - Nom:', testPartnerData.nom);
    console.log('  - Email RH:', testPartnerData.email_rh);
    console.log('  - Email Responsable:', testPartnerData.email_representant);
    console.log('  - Téléphone RH:', testPartnerData.telephone_rh);
    console.log('  - Téléphone Responsable:', testPartnerData.telephone_representant);

    // Créer les comptes directement
    console.log('\n🔄 Création des comptes partenaire...');
    
    const partnerAccountService = new PartnerAccountService();
    const results = await partnerAccountService.createPartnerAccounts(testPartnerData);

    console.log('✅ Résultats création comptes:', {
      rh: results.rh.success ? 'Succès' : results.rh.error,
      responsable: results.responsable.success ? 'Succès' : results.responsable.error
    });

    // Envoyer les SMS et emails avec les identifiants
    const smsResults = {
      rh: { success: false, message: '', error: '' },
      responsable: { success: false, message: '', error: '' }
    };

    const emailResults = {
      rh: { success: false, message: '', error: '' },
      responsable: { success: false, message: '', error: '' }
    };

    // Envoyer SMS et email au RH si le compte a été créé
    if (results.rh.success && results.rh.account) {
      try {
        console.log('\n📱 Envoi SMS au RH...');
        // SMS au RH
        const rhSMSMessage = `Compte RH créé pour ${testPartnerData.nom}. Email: ${testPartnerData.email_rh}, Mot de passe: ${results.rh.account.password}`;
        const rhSMSResult = await smsService.sendSMS({
          to: [testPartnerData.telephone_rh],
          message: rhSMSMessage
        });
        smsResults.rh = {
          success: rhSMSResult.success,
          message: rhSMSResult.success ? 'SMS RH envoyé' : '',
          error: rhSMSResult.error || rhSMSResult.message || ''
        };
        console.log('  SMS RH:', smsResults.rh.success ? '✅' : '❌', smsResults.rh.error);

        console.log('📧 Envoi email au RH...');
        // Email au RH
        const rhEmailSubject = `Compte RH créé - ${testPartnerData.nom}`;
        const rhEmailBody = `
          <h2>Votre compte RH a été créé</h2>
          <p><strong>Partenaire:</strong> ${testPartnerData.nom}</p>
          <p><strong>Email:</strong> ${testPartnerData.email_rh}</p>
          <p><strong>Mot de passe:</strong> ${results.rh.account.password}</p>
          <p>Vous pouvez maintenant vous connecter à l'interface d'administration.</p>
        `;
        const rhEmailResult = await emailService.sendEmail({
          to: testPartnerData.email_rh,
          subject: rhEmailSubject,
          html: rhEmailBody
        });
        emailResults.rh = {
          success: rhEmailResult.success,
          message: rhEmailResult.success ? 'Email RH envoyé' : '',
          error: rhEmailResult.error || rhEmailResult.message || ''
        };
        console.log('  Email RH:', emailResults.rh.success ? '✅' : '❌', emailResults.rh.error);
      } catch (error) {
        console.error('Erreur envoi SMS/email RH:', error);
        smsResults.rh.error = `Erreur SMS RH: ${error}`;
        emailResults.rh.error = `Erreur email RH: ${error}`;
      }
    }

    // Envoyer SMS et email au responsable si le compte a été créé
    if (results.responsable.success && results.responsable.account) {
      try {
        console.log('\n📱 Envoi SMS au responsable...');
        // SMS au responsable
        const responsableSMSMessage = `Compte responsable créé pour ${testPartnerData.nom}. Email: ${testPartnerData.email_representant}, Mot de passe: ${results.responsable.account.password}`;
        const responsableSMSResult = await smsService.sendSMS({
          to: [testPartnerData.telephone_representant],
          message: responsableSMSMessage
        });
        smsResults.responsable = {
          success: responsableSMSResult.success,
          message: responsableSMSResult.success ? 'SMS responsable envoyé' : '',
          error: responsableSMSResult.error || responsableSMSResult.message || ''
        };
        console.log('  SMS Responsable:', smsResults.responsable.success ? '✅' : '❌', smsResults.responsable.error);

        console.log('📧 Envoi email au responsable...');
        // Email au responsable
        const responsableEmailSubject = `Compte responsable créé - ${testPartnerData.nom}`;
        const responsableEmailBody = `
          <h2>Votre compte responsable a été créé</h2>
          <p><strong>Partenaire:</strong> ${testPartnerData.nom}</p>
          <p><strong>Email:</strong> ${testPartnerData.email_representant}</p>
          <p><strong>Mot de passe:</strong> ${results.responsable.account.password}</p>
          <p>Vous pouvez maintenant vous connecter à l'interface d'administration.</p>
        `;
        const responsableEmailResult = await emailService.sendEmail({
          to: testPartnerData.email_representant,
          subject: responsableEmailSubject,
          html: responsableEmailBody
        });
        emailResults.responsable = {
          success: responsableEmailResult.success,
          message: responsableEmailResult.success ? 'Email responsable envoyé' : '',
          error: responsableEmailResult.error || responsableEmailResult.message || ''
        };
        console.log('  Email Responsable:', emailResults.responsable.success ? '✅' : '❌', emailResults.responsable.error);
      } catch (error) {
        console.error('Erreur envoi SMS/email responsable:', error);
        smsResults.responsable.error = `Erreur SMS responsable: ${error}`;
        emailResults.responsable.error = `Erreur email responsable: ${error}`;
      }
    }

    console.log('\n📊 Résultats finaux:');
    console.log('📱 Résultats envoi SMS:', smsResults);
    console.log('📧 Résultats envoi emails:', emailResults);

    // Vérifier que les comptes ont été créés dans la base
    console.log('\n🔍 Vérification des comptes dans la base de données...');
    
    // Vérifier les comptes admin_users
    const { data: adminUsers, error: adminError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('partenaire_id', testPartnerData.id);

    if (adminError) {
      console.error('❌ Erreur récupération comptes admin:', adminError);
    } else {
      console.log('✅ Comptes trouvés dans admin_users:', adminUsers.length);
      adminUsers.forEach(user => {
        console.log(`  - ${user.role}: ${user.email} (${user.display_name})`);
      });
    }

    console.log('\n✅ Test terminé !');
    console.log('\n📋 Résumé:');
    console.log('  - Comptes créés:', results.rh.success && results.responsable.success ? '✅' : '❌');
    console.log('  - SMS envoyés:', smsResults.rh.success || smsResults.responsable.success ? '✅' : '❌');
    console.log('  - Emails envoyés:', emailResults.rh.success || emailResults.responsable.success ? '✅' : '❌');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  }
}

// Lancer le test
testPartnerCreationWithSMS(); 
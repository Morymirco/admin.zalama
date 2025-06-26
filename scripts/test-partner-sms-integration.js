const { createClient } = require('@supabase/supabase-js');
const { Client } = require('nimbasms');

// Configuration Supabase
const supabaseUrl = 'https://your-project.supabase.co';
const supabaseKey = 'your-anon-key';
const supabase = createClient(supabaseUrl, supabaseKey);

// Configuration Nimba SMS
const smsConfig = {
  SERVICE_ID: '9d83d5b67444c654c702f109dd837167',
  SECRET_TOKEN: 'qf_bpb4CVfEalTU5eVEFC05wpoqlo17M-mozkZVbIHT_3xfOIjB7Oac-lkXZ6Pg2VqO2LXVy6BUlYTZe73y411agSC0jVh3OcOU92s8Rplc',
};

const smsClient = new Client(smsConfig);

// Service SMS simplifié pour le test
class TestSMSService {
  constructor() {
    this.senderName = 'ZaLaMa';
  }

  formatPhoneNumber(phone) {
    let cleaned = phone.replace(/[^\d+]/g, '');
    if (cleaned.startsWith('+')) {
      cleaned = cleaned.substring(1);
    }
    if (!cleaned.startsWith('224')) {
      cleaned = '224' + cleaned;
    }
    if (cleaned.length > 12) {
      cleaned = cleaned.substring(0, 12);
    }
    return cleaned;
  }

  async sendSMS(message) {
    try {
      const body = {
        to: message.to,
        message: message.message,
        sender_name: message.sender_name || this.senderName,
      };

      console.log('Envoi SMS:', body);
      const response = await smsClient.messages.create(body);
      console.log('SMS envoyé:', response);
      return response;
    } catch (error) {
      console.error('Erreur SMS:', error);
      
      let errorMessage = 'Erreur inconnue';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (error && typeof error === 'object') {
        if ('message' in error) {
          errorMessage = String(error.message);
        } else if ('error' in error) {
          errorMessage = String(error.error);
        } else {
          errorMessage = JSON.stringify(error);
        }
      }
      
      const formattedError = new Error(errorMessage);
      formattedError.name = 'SMSError';
      throw formattedError;
    }
  }

  async sendWelcomeSMSToRepresentant(nomPartenaire, nomRepresentant, telephoneRepresentant, emailRepresentant) {
    const formattedPhone = this.formatPhoneNumber(telephoneRepresentant);
    
    const message = `Bonjour ${nomRepresentant},

Bienvenue dans la famille ZaLaMa ! 

Votre partenaire "${nomPartenaire}" a été créé avec succès dans notre système.

Vos informations de connexion :
- Email: ${emailRepresentant}
- Téléphone: ${telephoneRepresentant}

Vous recevrez bientôt vos identifiants de connexion par email.

Pour toute question, contactez-nous au +224 XXX XXX XXX.

Cordialement,
L'équipe ZaLaMa`;

    return this.sendSMS({
      to: [formattedPhone],
      message: message,
    });
  }

  async sendWelcomeSMSToRH(nomPartenaire, nomRH, telephoneRH, emailRH) {
    const formattedPhone = this.formatPhoneNumber(telephoneRH);
    
    const message = `Bonjour ${nomRH},

Bienvenue dans la famille ZaLaMa !

En tant que responsable RH de "${nomPartenaire}", vous avez accès à toutes les fonctionnalités de gestion des employés.

Vos informations de connexion :
- Email: ${emailRH}
- Téléphone: ${telephoneRH}

Vous recevrez bientôt vos identifiants de connexion par email.

Pour toute question RH, contactez-nous au +224 XXX XXX XXX.

Cordialement,
L'équipe ZaLaMa`;

    return this.sendSMS({
      to: [formattedPhone],
      message: message,
    });
  }

  async sendPartnerCreationNotification(nomPartenaire, typePartenaire, secteur) {
    const adminPhone = '+224625212115';
    const formattedPhone = this.formatPhoneNumber(adminPhone);
    
    const message = `🔔 Notification ZaLaMa

Nouveau partenaire créé :
- Nom: ${nomPartenaire}
- Type: ${typePartenaire}
- Secteur: ${secteur}
- Date: ${new Date().toLocaleDateString('fr-FR')}

Les SMS de bienvenue ont été envoyés aux contacts.`;

    return this.sendSMS({
      to: [formattedPhone],
      message: message,
    });
  }
}

// Test de création de partenaire avec SMS
async function testPartnerCreationWithSMS() {
  const smsService = new TestSMSService();
  
  // Données de test
  const partenaireData = {
    nom: 'Entreprise Test SMS',
    description: 'Test d\'intégration SMS',
    type: 'PME',
    secteur: 'Technologie',
    adresse: 'Conakry, Guinée',
    telephone: '+224625212115',
    email: 'test@zalama.com',
    nom_representant: 'John Doe',
    telephone_representant: '+224625212115',
    email_representant: 'john.doe@test.com',
    nom_rh: 'Jane Smith',
    telephone_rh: '+224625212115',
    email_rh: 'jane.smith@test.com',
    actif: true
  };

  console.log('=== Test de création de partenaire avec SMS ===\n');
  console.log('Données du partenaire:', partenaireData);

  // Résultats des SMS
  const smsResults = {
    representant: { success: false, message: '', error: '' },
    rh: { success: false, message: '', error: '' },
    admin: { success: false, message: '', error: '' }
  };

  // Test SMS représentant
  console.log('\n1. Test SMS représentant...');
  if (partenaireData.telephone_representant && partenaireData.nom_representant) {
    try {
      await smsService.sendWelcomeSMSToRepresentant(
        partenaireData.nom,
        partenaireData.nom_representant,
        partenaireData.telephone_representant,
        partenaireData.email_representant || ''
      );
      smsResults.representant = {
        success: true,
        message: `SMS envoyé au représentant ${partenaireData.nom_representant} (${partenaireData.telephone_representant})`
      };
      console.log('✅ SMS représentant envoyé');
    } catch (smsError) {
      console.error('❌ Erreur SMS représentant:', smsError);
      smsResults.representant = {
        success: false,
        error: `Erreur SMS représentant: ${smsError instanceof Error ? smsError.message : String(smsError)}`
      };
    }
  }

  // Test SMS RH
  console.log('\n2. Test SMS RH...');
  if (partenaireData.telephone_rh && partenaireData.nom_rh) {
    try {
      await smsService.sendWelcomeSMSToRH(
        partenaireData.nom,
        partenaireData.nom_rh,
        partenaireData.telephone_rh,
        partenaireData.email_rh || ''
      );
      smsResults.rh = {
        success: true,
        message: `SMS envoyé au responsable RH ${partenaireData.nom_rh} (${partenaireData.telephone_rh})`
      };
      console.log('✅ SMS RH envoyé');
    } catch (smsError) {
      console.error('❌ Erreur SMS RH:', smsError);
      smsResults.rh = {
        success: false,
        error: `Erreur SMS RH: ${smsError instanceof Error ? smsError.message : String(smsError)}`
      };
    }
  }

  // Test SMS admin
  console.log('\n3. Test SMS admin...');
  try {
    await smsService.sendPartnerCreationNotification(
      partenaireData.nom,
      partenaireData.type,
      partenaireData.secteur
    );
    smsResults.admin = {
      success: true,
      message: 'Notification admin envoyée'
    };
    console.log('✅ SMS admin envoyé');
  } catch (smsError) {
    console.error('❌ Erreur SMS admin:', smsError);
    smsResults.admin = {
      success: false,
      error: `Erreur SMS admin: ${smsError instanceof Error ? smsError.message : String(smsError)}`
    };
  }

  console.log('\n=== Résultats des SMS ===');
  console.log('Représentant:', smsResults.representant);
  console.log('RH:', smsResults.rh);
  console.log('Admin:', smsResults.admin);

  return smsResults;
}

// Exécuter le test
testPartnerCreationWithSMS()
  .then(results => {
    console.log('\n=== Test terminé ===');
    console.log('Résultats finaux:', results);
  })
  .catch(error => {
    console.error('Erreur lors du test:', error);
  }); 
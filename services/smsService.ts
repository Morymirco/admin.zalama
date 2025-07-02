// Service SMS utilisant l'API route Next.js pour éviter les problèmes CORS

// Configuration Nimba SMS - Utiliser les variables d'environnement
const config = {
  SERVICE_ID: process.env.NIMBA_SMS_SERVICE_ID || '9d83d5b67444c654c702f109dd837167',
  SECRET_TOKEN: process.env.NIMBA_SMS_SECRET_TOKEN || 'qf_bpb4CVfEalTU5eVEFC05wpoqlo17M-mozkZVbIHT_3xfOIjB7Oac-lkXZ6Pg2VqO2LXVy6BUlYTZe73y411agSC0jVh3OcOU92s8Rplc',
};

// Vérifier si la configuration est valide
const isSMSConfigured = config.SERVICE_ID && config.SECRET_TOKEN;

export interface SMSMessage {
  to: string[];
  message: string;
  sender_name?: string;
}

export interface SMSVerification {
  to: string;
  message: string;
  expiry_time?: number;
}

class SMSService {
  private senderName: string;

  constructor() {
    this.senderName = 'ZaLaMa'; // Utiliser le sendername configuré
  }

  /**
   * Envoyer un SMS simple selon le format Nimba SMS
   */
  async sendSMS(message: SMSMessage): Promise<any> {
    try {
      // Vérifier si le service SMS est configuré
      if (!isSMSConfigured) {
        console.warn('⚠️ Service SMS non configuré - SMS non envoyé');
        return {
          success: false,
          error: 'Service SMS non configuré',
          message: 'SMS non envoyé - service non configuré'
        };
      }

      // Utiliser l'API route Next.js pour éviter les problèmes CORS
      const smsData = {
        to: message.to,
        message: message.message,
        sender_name: message.sender_name || this.senderName,
      };

      console.log('📱 Envoi SMS via API route:', smsData);
      
      const response = await fetch('/api/sms/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(smsData),
      });

      if (!response.ok) {
        throw new Error(`Erreur API: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      
      console.log('✅ SMS envoyé avec succès via API route:', result);
      return {
        success: true,
        response: result,
        message: 'SMS envoyé avec succès'
      };
    } catch (error) {
      console.error('❌ Erreur lors de l\'envoi du SMS:', error);
      
      // Formater l'erreur de manière cohérente
      let errorMessage = 'Erreur inconnue';
      let isNetworkError = false;
      
      if (error instanceof Error) {
        errorMessage = error.message;
        isNetworkError = error.message.includes('Network') || error.message.includes('fetch');
      } else if (typeof error === 'string') {
        errorMessage = error;
        isNetworkError = error.includes('Network') || error.includes('fetch');
      } else if (error && typeof error === 'object') {
        // Essayer d'extraire le message d'erreur de l'objet
        if ('message' in error) {
          errorMessage = String(error.message);
          isNetworkError = errorMessage.includes('Network') || errorMessage.includes('fetch');
        } else if ('error' in error) {
          errorMessage = String(error.error);
          isNetworkError = errorMessage.includes('Network') || errorMessage.includes('fetch');
        } else if ('detail' in error) {
          errorMessage = String(error.detail);
          isNetworkError = errorMessage.includes('Network') || errorMessage.includes('fetch');
        } else {
          errorMessage = JSON.stringify(error);
        }
      }
      
      // Pour les erreurs réseau, retourner un objet d'erreur au lieu de throw
      if (isNetworkError) {
        console.warn('⚠️ Erreur réseau SMS - application continue sans SMS');
        return {
          success: false,
          error: 'Erreur réseau',
          message: 'SMS non envoyé - problème de connexion réseau',
          isNetworkError: true
        };
      }
      
      // Pour les autres erreurs, retourner un objet d'erreur
      return {
        success: false,
        error: errorMessage,
        message: 'SMS non envoyé',
        isNetworkError: false
      };
    }
  }

  /**
   * Envoyer un SMS de bienvenue au représentant d'un partenaire
   */
  async sendWelcomeSMSToRepresentant(
    nomPartenaire: string,
    nomRepresentant: string,
    telephoneRepresentant: string,
    emailRepresentant: string
  ): Promise<any> {
    // Formater le numéro de téléphone selon le format Nimba SMS
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

  /**
   * Envoyer un SMS de bienvenue au responsable RH
   */
  async sendWelcomeSMSToRH(
    nomPartenaire: string,
    nomRH: string,
    telephoneRH: string,
    emailRH: string
  ): Promise<any> {
    // Formater le numéro de téléphone selon le format Nimba SMS
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

  /**
   * Envoyer un SMS de notification de création de partenaire
   */
  async sendPartnerCreationNotification(
    nomPartenaire: string,
    typePartenaire: string,
    secteur: string
  ): Promise<any> {
    const adminPhone = '+224625212115'; // Numéro admin par défaut
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

  /**
   * Formater le numéro de téléphone selon le format Nimba SMS
   * Format attendu: 224XXXXXXXXX (sans le +)
   */
  private formatPhoneNumber(phone: string): string {
    // Supprimer tous les caractères non numériques sauf le +
    let cleaned = phone.replace(/[^\d+]/g, '');
    
    // Si le numéro commence par +, le supprimer
    if (cleaned.startsWith('+')) {
      cleaned = cleaned.substring(1);
    }
    
    // S'assurer que le numéro commence par 224 pour la Guinée
    if (!cleaned.startsWith('224')) {
      cleaned = '224' + cleaned;
    }
    
    // Limiter à 12 chiffres (224 + 9 chiffres)
    if (cleaned.length > 12) {
      cleaned = cleaned.substring(0, 12);
    }
    
    return cleaned;
  }

  /**
   * Envoyer un SMS de vérification selon le format Nimba SMS
   */
  async sendVerificationSMS(verification: SMSVerification): Promise<any> {
    try {
      // Formater le numéro de téléphone
      const formattedPhone = this.formatPhoneNumber(verification.to);
      
      // Format exact pour les vérifications Nimba SMS
      const verificationData = {
        to: formattedPhone, // String, pas array pour les vérifications
        message: verification.message,
        expiry_time: verification.expiry_time || 5, // En minutes
      };

      console.log('Envoi SMS de vérification:', verificationData);
      
      // Pour l'instant, utiliser l'envoi SMS normal car les vérifications ne sont pas supportées
      const response = await this.sendSMS({
        to: [formattedPhone],
        message: verification.message,
      });
      
      console.log('SMS de vérification envoyé:', response);
      return response;
    } catch (error) {
      console.error('Erreur lors de l\'envoi du SMS de vérification:', error);
      throw error;
    }
  }

  /**
   * Vérifier un code de vérification selon le format Nimba SMS
   */
  async verifyCode(verificationId: string, code: string): Promise<any> {
    try {
      console.log('Vérification du code non disponible via API route');
      return { success: false, message: 'Vérification non supportée' };
    } catch (error) {
      console.error('Erreur lors de la vérification du code:', error);
      throw error;
    }
  }

  /**
   * Vérifier le solde du compte
   */
  async checkBalance(): Promise<any> {
    try {
      // Vérifier si le service SMS est configuré
      if (!isSMSConfigured) {
        console.warn('⚠️ Service SMS non configuré - Impossible de vérifier le solde');
        return { balance: 0, message: 'Service SMS non configuré' };
      }

      // Utiliser l'API route Next.js pour éviter les problèmes CORS
      const response = await fetch('/api/sms/balance', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur API: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      
      console.log('Solde du compte SMS:', result.balance);
      return { balance: result.balance };
    } catch (error) {
      console.error('Erreur lors de la vérification du solde:', error);
      throw error;
    }
  }

  /**
   * Lister les messages envoyés selon le format Nimba SMS
   */
  async listMessages(limit?: number): Promise<any> {
    try {
      // Pour l'instant, on ne peut pas lister les messages via l'API route
      // car l'API Nimba SMS ne supporte pas cette fonctionnalité côté serveur
      console.log('Liste des messages non disponible via API route');
      return { count: 0, messages: [] };
    } catch (error) {
      console.error('Erreur lors de la récupération des messages:', error);
      throw error;
    }
  }

  /**
   * Obtenir les détails d'un message
   */
  async getMessage(messageId: string): Promise<any> {
    try {
      console.log('Détails du message non disponible via API route');
      return { messageId, status: 'unknown' };
    } catch (error) {
      console.error('Erreur lors de la récupération du message:', error);
      throw error;
    }
  }

  /**
   * Créer un contact selon le format Nimba SMS
   */
  async createContact(contactData: {
    numero: string;
    name?: string;
    groups?: string[];
  }): Promise<any> {
    try {
      const contact = {
        numero: this.formatPhoneNumber(contactData.numero),
        name: contactData.name || '',
        groups: contactData.groups || [],
      };

      console.log('Création du contact:', contact);
      console.log('Création de contact non disponible via API route');
      return { success: true, contact };
    } catch (error) {
      console.error('Erreur lors de la création du contact:', error);
      throw error;
    }
  }

  /**
   * Lister les contacts selon le format Nimba SMS
   */
  async listContacts(): Promise<any> {
    try {
      console.log('Liste des contacts non disponible via API route');
      return { count: 0, contacts: [] };
    } catch (error) {
      console.error('Erreur lors de la récupération des contacts:', error);
      throw error;
    }
  }

  /**
   * Envoyer un SMS de bienvenue avec identifiants à un employé
   */
  async sendWelcomeSMSToEmployee(
    nomEmploye: string,
    prenomEmploye: string,
    telephoneEmploye: string,
    emailEmploye: string,
    password: string
  ): Promise<any> {
    // Formater le numéro de téléphone selon le format Nimba SMS
    const formattedPhone = this.formatPhoneNumber(telephoneEmploye);
    
    const message = `Bonjour ${prenomEmploye},

Votre compte ZaLaMa a été créé avec succès !

🔐 Vos identifiants de connexion :
Email: ${emailEmploye}
Mot de passe: ${password}

🌐 Connectez-vous sur : https://admin.zalama.com

⚠️ Important : Changez votre mot de passe lors de votre première connexion.

Pour toute question, contactez-nous au +224 XXX XXX XXX.

Cordialement,
L'équipe ZaLaMa`;

    return this.sendSMS({
      to: [formattedPhone],
      message: message,
    });
  }
}

// Instance singleton
const smsService = new SMSService();

export default smsService; 
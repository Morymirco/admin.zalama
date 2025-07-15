import { Client } from 'nimbasms';

export interface SMSMessage {
  to: string[];
  message: string;
  sender_name?: string;
}

// Configuration Nimba SMS côté serveur
const config = {
  SERVICE_ID: process.env.NIMBA_SMS_SERVICE_ID || '9d83d5b67444c654c702f109dd837167',
  SECRET_TOKEN: process.env.NIMBA_SMS_SECRET_TOKEN || 'qf_bpb4CVfEalTU5eVEFC05wpoqlo17M-mozkZVbIHT_3xfOIjB7Oac-lkXZ6Pg2VqO2LXVy6BUlYTZe73y411agSC0jVh3OcOU92s8Rplc',
};

const client = new Client(config);

class ServerSmsService {
  private senderName: string;

  constructor() {
    this.senderName = 'ZaLaMa';
  }

  async sendSMS(message: SMSMessage): Promise<any> {
    try {
      console.log('📱 Envoi SMS côté serveur:', {
        to: message.to,
        message: message.message.substring(0, 50) + '...',
        sender_name: message.sender_name || this.senderName
      });

      // Utiliser le client Nimba SMS officiel
      const response = await client.messages.create({
        to: message.to,
        message: message.message,
        sender_name: message.sender_name || this.senderName,
      });

      console.log('✅ SMS envoyé avec succès côté serveur:', response);
      
      return {
        success: true,
        response: response,
        message: 'SMS envoyé avec succès'
      };
    } catch (error) {
      console.error('❌ Erreur lors de l\'envoi du SMS côté serveur:', error);
      
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
        console.warn('⚠️ Erreur réseau SMS côté serveur - application continue sans SMS');
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

  async checkBalance(): Promise<any> {
    try {
      console.log('💰 Vérification du solde SMS côté serveur...');
      
      const account = await client.accounts.get();
      console.log('✅ Solde SMS côté serveur:', account);
      
      return {
        success: true,
        balance: account.balance || 0,
        currency: 'GNF'
      };
    } catch (error) {
      console.error('❌ Erreur lors de la vérification du solde côté serveur:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
        balance: 0
      };
    }
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
}

const serverSmsService = new ServerSmsService();
export default serverSmsService; 
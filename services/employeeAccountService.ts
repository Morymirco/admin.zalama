import { generatePassword, sendSMS } from '@/lib/utils';
import smsService from './smsService';
import emailClientService from './emailClientService';

interface EmployeeAccountData {
  email: string;
  password: string;
  display_name: string;
  role: 'user' | 'rh' | 'responsable';
  partenaire_id: string;
  employee_id: string;
}

interface AccountResult {
  success: boolean;
  account?: any;
  error?: string;
}

interface SMSResult {
  success: boolean;
  error?: string;
}

interface EmailResult {
  success: boolean;
  error?: string;
}

class EmployeeAccountService {
  // Créer un compte employé avec mot de passe généré
  async createEmployeeAccount(employeeData: any): Promise<{ success: boolean; account?: any; error?: string }> {
    try {
      // Appeler l'API route pour créer le compte
      const response = await fetch('/api/auth/create-employee-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          employeeData: {
            ...employeeData,
            id: employeeData.id,
            partner_id: employeeData.partner_id
          }
        }),
      });

      const result = await response.json();

      // Gérer les erreurs HTTP
      if (!response.ok) {
        const errorMessage = result.error || result.message || `Erreur HTTP: ${response.status}`;
        console.warn('⚠️ Erreur lors de la création du compte employé:', errorMessage);
        return { success: false, error: errorMessage };
      }

      // Gérer les erreurs de l'API
      if (!result.success) {
        const errorMessage = result.error || result.message || 'Erreur inconnue lors de la création du compte';
        console.warn('⚠️ Échec de la création du compte employé:', errorMessage);
        return { success: false, error: errorMessage };
      }

      console.log('✅ Compte employé créé avec succès:', result.account?.email);
      return { 
        success: true, 
        account: result.account
      };

    } catch (error) {
      console.error('❌ Erreur lors de la création du compte:', error);
      
      // Gérer les erreurs spécifiques
      let errorMessage = 'Erreur inconnue lors de la création du compte';
      
      if (error instanceof Error) {
        errorMessage = error.message;
        
        // Gérer les erreurs de réseau
        if (error.message.includes('fetch') || error.message.includes('network')) {
          errorMessage = 'Erreur de connexion réseau. Vérifiez votre connexion internet.';
        }
        
        // Gérer les erreurs de timeout
        if (error.message.includes('timeout')) {
          errorMessage = 'Délai d\'attente dépassé. Veuillez réessayer.';
        }
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      return { success: false, error: errorMessage };
    }
  }

  // Formater le numéro de téléphone selon le format Nimba SMS
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

  // Envoyer SMS pour compte employé
  async sendEmployeeAccountSMS(employeeData: any, accountResult: AccountResult): Promise<SMSResult> {
    if (!accountResult.success || !employeeData.telephone) {
      return { success: false, error: 'Données manquantes pour l\'envoi SMS' };
    }

    try {
      // Formater le numéro de téléphone
      const formattedPhone = this.formatPhoneNumber(employeeData.telephone);
      
      const smsMessage = `Bonjour ${employeeData.prenom} ${employeeData.nom}, votre compte ZaLaMa a été créé avec succès.\nEmail: ${employeeData.email}\nMot de passe: ${accountResult.account?.password}\nConnectez-vous sur https://admin.zalama.com`;
      
      const smsResponse = await smsService.sendSMS({
        to: [formattedPhone],
        message: smsMessage,
        sender_name: 'ZaLaMa'
      });
      
      return {
        success: smsResponse.success,
        error: smsResponse.success ? undefined : (smsResponse.error || 'Échec de l\'envoi du SMS')
      };
    } catch (error) {
      console.error('Erreur lors de l\'envoi du SMS employé:', error);
      return {
        success: false,
        error: `Erreur SMS employé: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  // Envoyer email pour compte employé
  async sendEmployeeAccountEmail(employeeData: any, accountResult: AccountResult): Promise<EmailResult> {
    if (!accountResult.success || !employeeData.email) {
      return { success: false, error: 'Données manquantes pour l\'envoi email' };
    }

    try {
      const emailResult = await emailClientService.sendWelcomeEmailToEmployee({
        nom: `${employeeData.prenom} ${employeeData.nom}`,
        email: employeeData.email,
        password: accountResult.account?.password || '',
        role: 'employe',
        partenaireNom: employeeData.partenaireNom || 'Votre entreprise'
      });
      
      return {
        success: emailResult.success,
        error: emailResult.success ? undefined : (emailResult.error || 'Échec de l\'envoi de l\'email')
      };
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email employé:', error);
      return {
        success: false,
        error: `Erreur email employé: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  // Créer un compte employé avec envoi automatique de SMS et email
  async createEmployeeAccountWithNotifications(employeeData: any): Promise<{
    account: AccountResult;
    sms: SMSResult;
    email: EmailResult;
  }> {
    const results = {
      account: { success: false, error: '' } as AccountResult,
      sms: { success: false, error: '' } as SMSResult,
      email: { success: false, error: '' } as EmailResult
    };

    // Vérifier que l'email est fourni
    if (!employeeData.email) {
      results.account = { success: false, error: 'L\'email est requis pour créer un compte employé' };
      return results;
    }

    try {
      console.log('🔄 Création du compte employé:', employeeData.email);
      results.account = await this.createEmployeeAccount(employeeData);
      
      if (results.account.success) {
        console.log('✅ Compte créé, envoi des notifications...');
        
        // Envoyer SMS et email en parallèle
        const [smsResult, emailResult] = await Promise.allSettled([
          this.sendEmployeeAccountSMS(employeeData, results.account),
          this.sendEmployeeAccountEmail(employeeData, results.account)
        ]);
        
        results.sms = smsResult.status === 'fulfilled' ? smsResult.value : { success: false, error: 'Erreur lors de l\'envoi du SMS' };
        results.email = emailResult.status === 'fulfilled' ? emailResult.value : { success: false, error: 'Erreur lors de l\'envoi de l\'email' };
        
        console.log('📊 Résultats des notifications:');
        console.log('   SMS:', results.sms.success ? '✅' : '❌', results.sms.error || '');
        console.log('   Email:', results.email.success ? '✅' : '❌', results.email.error || '');
        
      } else {
        console.warn('⚠️ Échec de la création du compte, notifications annulées');
        
        // Gérer les erreurs spécifiques
        if (results.account.error?.includes('existe déjà')) {
          console.log('ℹ️ L\'employé existe déjà, pas de notifications envoyées');
        } else {
          console.error('❌ Erreur lors de la création du compte:', results.account.error);
        }
      }
    } catch (error) {
      console.error('❌ Erreur inattendue lors de la création du compte employé:', error);
      results.account = { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur inattendue lors de la création du compte'
      };
    }

    return results;
  }

  // Supprimer un compte employé
  async deleteEmployeeAccount(employeeId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch('/api/auth/delete-employee-account', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ employeeId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Erreur HTTP: ${response.status}`);
      }

      const result = await response.json();
      return { success: result.success, error: result.error };

    } catch (error) {
      console.error('Erreur lors de la suppression du compte:', error);
      return { success: false, error: `Erreur lors de la suppression du compte: ${error instanceof Error ? error.message : String(error)}` };
    }
  }

  // Désactiver/activer un compte employé
  async toggleEmployeeAccount(employeeId: string, active: boolean): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch('/api/auth/toggle-employee-account', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ employeeId, active }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Erreur HTTP: ${response.status}`);
      }

      const result = await response.json();
      return { success: result.success, error: result.error };

    } catch (error) {
      console.error('Erreur lors de la modification du compte:', error);
      return { success: false, error: `Erreur lors de la modification du compte: ${error instanceof Error ? error.message : String(error)}` };
    }
  }

  // Réinitialiser le mot de passe d'un employé
  async resetEmployeePassword(employeeId: string): Promise<{ success: boolean; password?: string; error?: string }> {
    try {
      const response = await fetch('/api/auth/reset-employee-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ employeeId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Erreur HTTP: ${response.status}`);
      }

      const result = await response.json();
      return { success: result.success, password: result.password, error: result.error };

    } catch (error) {
      console.error('Erreur lors de la réinitialisation du mot de passe:', error);
      return { success: false, error: `Erreur lors de la réinitialisation du mot de passe: ${error instanceof Error ? error.message : String(error)}` };
    }
  }

  // Renvoyer les identifiants à un employé existant
  async resendEmployeeCredentials(employeeData: any): Promise<{
    password: { success: boolean; password?: string; error?: string };
    sms: SMSResult;
    email: EmailResult;
  }> {
    const results = {
      password: { success: false, error: '' } as { success: boolean; password?: string; error?: string },
      sms: { success: false, error: '' } as SMSResult,
      email: { success: false, error: '' } as EmailResult
    };

    try {
      // Réinitialiser le mot de passe
      console.log('🔄 Réinitialisation du mot de passe pour:', employeeData.email);
      results.password = await this.resetEmployeePassword(employeeData.id);
      
      if (results.password.success && results.password.password) {
        console.log('✅ Mot de passe réinitialisé, envoi des notifications...');
        
        // Créer un objet avec le nouveau mot de passe pour les notifications
        const accountWithNewPassword = {
          success: true,
          account: {
            ...employeeData,
            password: results.password.password
          }
        };
        
        // Envoyer SMS et email en parallèle
        const [smsResult, emailResult] = await Promise.allSettled([
          this.sendEmployeeAccountSMS(employeeData, accountWithNewPassword),
          this.sendEmployeeAccountEmail(employeeData, accountWithNewPassword)
        ]);
        
        results.sms = smsResult.status === 'fulfilled' ? smsResult.value : { success: false, error: 'Erreur lors de l\'envoi du SMS' };
        results.email = emailResult.status === 'fulfilled' ? emailResult.value : { success: false, error: 'Erreur lors de l\'envoi de l\'email' };
        
        console.log('📊 Résultats des notifications:');
        console.log('   SMS:', results.sms.success ? '✅' : '❌', results.sms.error || '');
        console.log('   Email:', results.email.success ? '✅' : '❌', results.email.error || '');
        
      } else {
        console.warn('⚠️ Échec de la réinitialisation du mot de passe, notifications annulées');
      }
    } catch (error) {
      console.error('❌ Erreur inattendue lors de la réinitialisation des identifiants:', error);
      results.password = { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur inattendue lors de la réinitialisation'
      };
    }

    return results;
  }
}

export default new EmployeeAccountService(); 
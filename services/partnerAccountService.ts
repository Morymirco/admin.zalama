import { sendSMS } from '@/lib/utils';
import emailService from './emailService';

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

class PartnerAccountService {
  // Créer un compte RH
  async createRHAccount(rhData: any): Promise<AccountResult> {
    try {
      const response = await fetch('/api/auth/create-rh-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rhData: {
            email: rhData.email_rh,
            nom: rhData.nom_rh,
            partenaire_id: rhData.id
          }
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Erreur HTTP: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        return { success: false, error: result.error };
      }

      return { 
        success: true, 
        account: result.account
      };

    } catch (error) {
      console.error('Erreur lors de la création du compte RH:', error);
      return { success: false, error: `Erreur création compte RH: ${error instanceof Error ? error.message : String(error)}` };
    }
  }

  // Créer un compte responsable
  async createResponsableAccount(responsableData: any): Promise<AccountResult> {
    try {
      const response = await fetch('/api/auth/create-responsable-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          responsableData: {
            email: responsableData.email_representant,
            nom: responsableData.nom_representant,
            partenaire_id: responsableData.id
          }
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Erreur HTTP: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        return { success: false, error: result.error };
      }

      return { 
        success: true, 
        account: result.account
      };

    } catch (error) {
      console.error('Erreur lors de la création du compte responsable:', error);
      return { success: false, error: `Erreur création compte responsable: ${error instanceof Error ? error.message : String(error)}` };
    }
  }

  // Envoyer SMS pour compte RH
  async sendRHAccountSMS(rhData: any, accountResult: AccountResult): Promise<SMSResult> {
    if (!accountResult.success || !rhData.telephone_rh) {
      return { success: false, error: 'Données manquantes pour l\'envoi SMS' };
    }

    try {
      const smsMessage = `Bonjour ${rhData.nom_rh}, votre compte ZaLaMa RH a été créé avec succès.\nEmail: ${rhData.email_rh}\nMot de passe: ${accountResult.account?.password}\nConnectez-vous sur https://admin.zalama.com`;
      
      const smsSent = await sendSMS(rhData.telephone_rh, smsMessage);
      
      return {
        success: smsSent,
        error: smsSent ? undefined : 'Échec de l\'envoi du SMS'
      };
    } catch (error) {
      console.error('Erreur lors de l\'envoi du SMS RH:', error);
      return {
        success: false,
        error: `Erreur SMS RH: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  // Envoyer email pour compte RH
  async sendRHAccountEmail(rhData: any, accountResult: AccountResult): Promise<EmailResult> {
    if (!accountResult.success || !rhData.email_rh) {
      return { success: false, error: 'Données manquantes pour l\'envoi email' };
    }

    try {
      await emailService.sendWelcomeEmailToRH({
        nom: rhData.nom_rh,
        email: rhData.email_rh,
        password: accountResult.account?.password || '',
        role: 'rh',
        partenaireNom: rhData.nom
      });
      
      return {
        success: true,
        error: undefined
      };
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email RH:', error);
      return {
        success: false,
        error: `Erreur email RH: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  // Envoyer SMS pour compte responsable
  async sendResponsableAccountSMS(responsableData: any, accountResult: AccountResult): Promise<SMSResult> {
    if (!accountResult.success || !responsableData.telephone_representant) {
      return { success: false, error: 'Données manquantes pour l\'envoi SMS' };
    }

    try {
      const smsMessage = `Bonjour ${responsableData.nom_representant}, votre compte ZaLaMa responsable a été créé avec succès.\nEmail: ${responsableData.email_representant}\nMot de passe: ${accountResult.account?.password}\nConnectez-vous sur https://admin.zalama.com`;
      
      const smsSent = await sendSMS(responsableData.telephone_representant, smsMessage);
      
      return {
        success: smsSent,
        error: smsSent ? undefined : 'Échec de l\'envoi du SMS'
      };
    } catch (error) {
      console.error('Erreur lors de l\'envoi du SMS responsable:', error);
      return {
        success: false,
        error: `Erreur SMS responsable: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  // Envoyer email pour compte responsable
  async sendResponsableAccountEmail(responsableData: any, accountResult: AccountResult): Promise<EmailResult> {
    if (!accountResult.success || !responsableData.email_representant) {
      return { success: false, error: 'Données manquantes pour l\'envoi email' };
    }

    try {
      await emailService.sendWelcomeEmailToResponsable({
        nom: responsableData.nom_representant,
        email: responsableData.email_representant,
        password: accountResult.account?.password || '',
        role: 'responsable',
        partenaireNom: responsableData.nom
      });
      
      return {
        success: true,
        error: undefined
      };
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email responsable:', error);
      return {
        success: false,
        error: `Erreur email responsable: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  // Créer les comptes RH et responsable pour un partenaire
  async createPartnerAccounts(partenaireData: any): Promise<{
    rh: { account: AccountResult; sms: SMSResult; email: EmailResult };
    responsable: { account: AccountResult; sms: SMSResult; email: EmailResult };
  }> {
    const results = {
      rh: { 
        account: { success: false, error: 'Non tenté' }, 
        sms: { success: false, error: 'Non tenté' },
        email: { success: false, error: 'Non tenté' }
      },
      responsable: { 
        account: { success: false, error: 'Non tenté' }, 
        sms: { success: false, error: 'Non tenté' },
        email: { success: false, error: 'Non tenté' }
      }
    };

    // Créer le compte RH si les données sont fournies
    if (partenaireData.email_rh && partenaireData.nom_rh) {
      try {
        results.rh.account = await this.createRHAccount(partenaireData);
        
        if (results.rh.account.success) {
          // Envoyer SMS et email en parallèle
          const [smsResult, emailResult] = await Promise.allSettled([
            this.sendRHAccountSMS(partenaireData, results.rh.account),
            this.sendRHAccountEmail(partenaireData, results.rh.account)
          ]);
          
          results.rh.sms = smsResult.status === 'fulfilled' ? smsResult.value : { success: false, error: 'Erreur SMS' };
          results.rh.email = emailResult.status === 'fulfilled' ? emailResult.value : { success: false, error: 'Erreur email' };
        }
      } catch (error) {
        console.error('Erreur lors de la création du compte RH:', error);
        results.rh.account = { success: false, error: String(error) };
      }
    }

    // Créer le compte responsable si les données sont fournies
    if (partenaireData.email_representant && partenaireData.nom_representant) {
      try {
        results.responsable.account = await this.createResponsableAccount(partenaireData);
        
        if (results.responsable.account.success) {
          // Envoyer SMS et email en parallèle
          const [smsResult, emailResult] = await Promise.allSettled([
            this.sendResponsableAccountSMS(partenaireData, results.responsable.account),
            this.sendResponsableAccountEmail(partenaireData, results.responsable.account)
          ]);
          
          results.responsable.sms = smsResult.status === 'fulfilled' ? smsResult.value : { success: false, error: 'Erreur SMS' };
          results.responsable.email = emailResult.status === 'fulfilled' ? emailResult.value : { success: false, error: 'Erreur email' };
        }
      } catch (error) {
        console.error('Erreur lors de la création du compte responsable:', error);
        results.responsable.account = { success: false, error: String(error) };
      }
    }

    return results;
  }
}

export default new PartnerAccountService(); 
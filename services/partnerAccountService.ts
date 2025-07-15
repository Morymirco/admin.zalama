import { generatePassword } from '@/lib/utils';
import { createClient } from '@supabase/supabase-js';

// Configuration Supabase
const supabaseUrl = 'https://mspmrzlqhwpdkkburjiw.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.warn('⚠️ SUPABASE_SERVICE_ROLE_KEY non définie - mode test activé');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey || 'test-key', {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

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
  // Créer un compte RH directement avec Supabase
  async createRHAccount(rhData: any): Promise<AccountResult> {
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

  // Créer un compte responsable directement avec Supabase
  async createResponsableAccount(responsableData: any): Promise<AccountResult> {
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

  // Envoyer SMS pour compte RH
  async sendRHAccountSMS(rhData: any, accountResult: AccountResult): Promise<SMSResult> {
    if (!accountResult.success || !rhData.telephone_rh) {
      return { success: false, error: 'Données manquantes pour l\'envoi SMS' };
    }

    try {
      const smsMessage = `Bonjour ${rhData.nom_rh}, votre compte ZaLaMa RH a été créé avec succès.\nEmail: ${rhData.email_rh}\nMot de passe: ${accountResult.account?.password}\nConnectez-vous sur https://admin.zalama.com`;
      
      const smsResponse = await serverSmsService.sendSMS({
        to: [rhData.telephone_rh],
        message: smsMessage,
        sender_name: 'ZaLaMa'
      });
      
      return {
        success: smsResponse.success,
        error: smsResponse.success ? undefined : (smsResponse.error || 'Échec de l\'envoi du SMS')
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
              const subject = `Bienvenue sur ZaLaMa - ${rhData.nom}`;
      const html = `
        <h2>Bonjour ${rhData.nom_rh},</h2>
        <p>Votre compte ZaLaMa RH a été créé avec succès.</p>
        <p><strong>Email :</strong> ${rhData.email_rh}</p>
        <p><strong>Mot de passe :</strong> ${accountResult.account?.password || ''}</p>
        <p>Connectez-vous sur <a href="https://admin.zalama.com">https://admin.zalama.com</a></p>
      `;
      
      const response = await fetch('/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: [rhData.email_rh],
          subject: subject,
          html: html
        })
      });

      const emailResult = await response.json();
      if (!emailResult.success) {
        throw new Error(emailResult.error || 'Erreur lors de l\'envoi de l\'email');
      }
      
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
      
      const smsResponse = await serverSmsService.sendSMS({
        to: [responsableData.telephone_representant],
        message: smsMessage,
        sender_name: 'ZaLaMa'
      });
      
      return {
        success: smsResponse.success,
        error: smsResponse.success ? undefined : (smsResponse.error || 'Échec de l\'envoi du SMS')
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
              const subject = `Bienvenue sur ZaLaMa - ${responsableData.nom}`;
      const html = `
        <h2>Bonjour ${responsableData.nom_representant},</h2>
        <p>Votre compte ZaLaMa responsable a été créé avec succès.</p>
        <p><strong>Email :</strong> ${responsableData.email_representant}</p>
        <p><strong>Mot de passe :</strong> ${accountResult.account?.password || ''}</p>
        <p>Connectez-vous sur <a href="https://admin.zalama.com">https://admin.zalama.com</a></p>
      `;
      
      const response = await fetch('/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: [responsableData.email_representant],
          subject: subject,
          html: html
        })
      });

      const emailResult = await response.json();
      if (!emailResult.success) {
        throw new Error(emailResult.error || 'Erreur lors de l\'envoi de l\'email');
      }
      
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
        account: { success: false, error: 'Non tenté' } as AccountResult, 
        sms: { success: false, error: 'Non tenté' } as SMSResult,
        email: { success: false, error: 'Non tenté' } as EmailResult
      },
      responsable: { 
        account: { success: false, error: 'Non tenté' } as AccountResult, 
        sms: { success: false, error: 'Non tenté' } as SMSResult,
        email: { success: false, error: 'Non tenté' } as EmailResult
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
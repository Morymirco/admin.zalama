import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generatePassword } from '@/lib/utils';
import { Client } from 'nimbasms';
import { Resend } from 'resend';

// Configuration Supabase côté serveur
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Configuration Nimba SMS - Utiliser les variables d'environnement
const smsConfig = {
  SERVICE_ID: process.env.NIMBA_SMS_SERVICE_ID || '9d83d5b67444c654c702f109dd837167',
  SECRET_TOKEN: process.env.NIMBA_SMS_SECRET_TOKEN || 'qf_bpb4CVfEalTU5eVEFC05wpoqlo17M-mozkZVbIHT_3xfOIjB7Oac-lkXZ6Pg2VqO2LXVy6BUlYTZe73y411agSC0jVh3OcOU92s8Rplc',
};

// Configuration Resend Email
const emailConfig = {
  RESEND_API_KEY: process.env.RESEND_API_KEY || '',
};

interface SMSResult {
  success: boolean;
  response?: unknown;
  message: string;
  error?: string;
}

interface EmailResult {
  success: boolean;
  response?: unknown;
  message: string;
  error?: string;
}

// Service SMS direct (sans passer par l'API route)
class DirectSMSService {
  async sendSMS(to: string[], message: string): Promise<SMSResult> {
    try {
      // Vérifier si le service SMS est configuré
      if (!smsConfig.SERVICE_ID || !smsConfig.SECRET_TOKEN) {
        console.warn('⚠️ Service SMS non configuré - SMS non envoyé');
        return {
          success: false,
          error: 'Service SMS non configuré',
          message: 'SMS non envoyé - service non configuré'
        };
      }

      // Utiliser directement l'API Nimba SMS
      const client = new Client({
        SERVICE_ID: smsConfig.SERVICE_ID,
        SECRET_TOKEN: smsConfig.SECRET_TOKEN
      });

      const result = await client.messages.create({
        to: to,
        message: message,
        sender_name: 'ZaLaMa'
      });

      console.log('✅ SMS envoyé directement:', result);
      return {
        success: true,
        response: result,
        message: 'SMS envoyé avec succès'
      };
    } catch (error) {
      console.error('❌ Erreur lors de l\'envoi du SMS:', error);
      return {
        success: false,
        error: `Erreur SMS: ${error instanceof Error ? error.message : String(error)}`,
        message: 'SMS non envoyé'
      };
    }
  }
}

// Service Email direct (sans passer par l'API route)
class DirectEmailService {
  async sendEmail(to: string, subject: string, html: string): Promise<EmailResult> {
    try {
      // Vérifier si le service email est configuré
      if (!emailConfig.RESEND_API_KEY) {
        console.warn('⚠️ Service email non configuré - Email non envoyé');
        return {
          success: false,
          error: 'Service email non configuré',
          message: 'Email non envoyé - service non configuré'
        };
      }

      // Utiliser directement l'API Resend
      const resend = new Resend(emailConfig.RESEND_API_KEY);

      const result = await resend.emails.send({
        from: 'ZaLaMa <noreply@zalamagn.com>',
        to: [to],
        subject: subject,
        html: html
      });

      console.log('✅ Email envoyé directement:', result);
      return {
        success: true,
        response: result,
        message: 'Email envoyé avec succès'
      };
    } catch (error) {
      console.error('❌ Erreur lors de l\'envoi de l\'email:', error);
      return {
        success: false,
        error: `Erreur email: ${error instanceof Error ? error.message : String(error)}`,
        message: 'Email non envoyé'
      };
    }
  }
}

const directSmsService = new DirectSMSService();
const directEmailService = new DirectEmailService();

interface AccountResult {
  success: boolean;
  account?: {
    id: string;
    email: string;
    display_name: string;
    role: string;
    partenaire_id: string;
    active: boolean;
    last_login: string | null;
    created_at: string;
    updated_at: string;
    password: string;
  };
  error?: string;
}

interface PartnerData {
  id: string;
  nom: string;
  email_rh: string;
  email_representant: string;
  telephone_rh: string;
  telephone_representant: string;
  nom_rh: string;
  nom_representant: string;
}

class PartnerAccountService {
  // Créer un compte RH
  async createRHAccount(rhData: PartnerData): Promise<AccountResult> {
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

  // Créer un compte responsable
  async createResponsableAccount(responsableData: PartnerData): Promise<AccountResult> {
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

  // Créer tous les comptes partenaire
  async createPartnerAccounts(partenaireData: PartnerData): Promise<{
    rh: AccountResult;
    responsable: AccountResult;
  }> {
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

const partnerAccountService = new PartnerAccountService();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { partenaireData } = body;

    if (!partenaireData) {
      return NextResponse.json(
        { success: false, error: 'Données partenaire manquantes' },
        { status: 400 }
      );
    }

    console.log('🔄 Création des comptes partenaire...', {
      partenaire: partenaireData.nom,
      email_rh: partenaireData.email_rh,
      email_representant: partenaireData.email_representant
    });

    // Créer les comptes
    const results = await partnerAccountService.createPartnerAccounts(partenaireData);

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
        // SMS au RH
        const rhSMSMessage = `Compte RH créé pour ${partenaireData.nom}. Email: ${partenaireData.email_rh}, Mot de passe: ${results.rh.account.password}`;
        const rhSMSResult = await directSmsService.sendSMS([partenaireData.telephone_rh], rhSMSMessage);
        smsResults.rh = {
          success: rhSMSResult.success,
          message: rhSMSResult.success ? 'SMS RH envoyé' : '',
          error: rhSMSResult.error || rhSMSResult.message || ''
        };

        // Email au RH
        const rhEmailSubject = `Compte RH créé - ${partenaireData.nom}`;
        const rhEmailBody = `
          <h2>Votre compte RH a été créé</h2>
          <p><strong>Partenaire:</strong> ${partenaireData.nom}</p>
          <p><strong>Email:</strong> ${partenaireData.email_rh}</p>
          <p><strong>Mot de passe:</strong> ${results.rh.account.password}</p>
          <p>Vous pouvez maintenant vous connecter à l'interface d'administration.</p>
        `;
        const rhEmailResult = await directEmailService.sendEmail(partenaireData.email_rh, rhEmailSubject, rhEmailBody);
        emailResults.rh = {
          success: rhEmailResult.success,
          message: rhEmailResult.success ? 'Email RH envoyé' : '',
          error: rhEmailResult.error || rhEmailResult.message || ''
        };
      } catch (error) {
        console.error('Erreur envoi SMS/email RH:', error);
        smsResults.rh.error = `Erreur SMS RH: ${error}`;
        emailResults.rh.error = `Erreur email RH: ${error}`;
      }
    }

    // Envoyer SMS et email au responsable si le compte a été créé
    if (results.responsable.success && results.responsable.account) {
      try {
        // SMS au responsable
        const responsableSMSMessage = `Compte responsable créé pour ${partenaireData.nom}. Email: ${partenaireData.email_representant}, Mot de passe: ${results.responsable.account.password}`;
        const responsableSMSResult = await directSmsService.sendSMS([partenaireData.telephone_representant], responsableSMSMessage);
        smsResults.responsable = {
          success: responsableSMSResult.success,
          message: responsableSMSResult.success ? 'SMS responsable envoyé' : '',
          error: responsableSMSResult.error || responsableSMSResult.message || ''
        };

        // Email au responsable
        const responsableEmailSubject = `Compte responsable créé - ${partenaireData.nom}`;
        const responsableEmailBody = `
          <h2>Votre compte responsable a été créé</h2>
          <p><strong>Partenaire:</strong> ${partenaireData.nom}</p>
          <p><strong>Email:</strong> ${partenaireData.email_representant}</p>
          <p><strong>Mot de passe:</strong> ${results.responsable.account.password}</p>
          <p>Vous pouvez maintenant vous connecter à l'interface d'administration.</p>
        `;
        const responsableEmailResult = await directEmailService.sendEmail(partenaireData.email_representant, responsableEmailSubject, responsableEmailBody);
        emailResults.responsable = {
          success: responsableEmailResult.success,
          message: responsableEmailResult.success ? 'Email responsable envoyé' : '',
          error: responsableEmailResult.error || responsableEmailResult.message || ''
        };
      } catch (error) {
        console.error('Erreur envoi SMS/email responsable:', error);
        smsResults.responsable.error = `Erreur SMS responsable: ${error}`;
        emailResults.responsable.error = `Erreur email responsable: ${error}`;
      }
    }

    console.log('📱 Résultats envoi SMS:', smsResults);
    console.log('📧 Résultats envoi emails:', emailResults);

    return NextResponse.json({
      success: true,
      results,
      smsResults,
      emailResults
    });

  } catch (error) {
    console.error('❌ Erreur API création comptes partenaire:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: `Erreur serveur: ${error instanceof Error ? error.message : String(error)}`
      },
      { status: 500 }
    );
  }
} 
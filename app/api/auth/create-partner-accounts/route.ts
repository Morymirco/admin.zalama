import { getZalamaEmailTemplate } from '@/lib/email-template';
import { generatePassword } from '@/lib/utils';
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
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

        // Email au RH avec le design ZaLaMa moderne
        const rhEmailSubject = `🏢 Bienvenue dans l'équipe ZaLaMa - Compte RH créé`;
        
        // Utiliser le template ZaLaMa moderne
        const rhEmailBody = getZalamaEmailTemplate({
          title: `Votre compte RH est prêt !`,
          username: partenaireData.nom_rh,
          content: `
            <tr>
              <td style="padding: 12px 15px; color: #1f2937; font-size: 16px; line-height: 1.6; background-color: #ffffff; border-radius: 8px; margin-bottom: 10px; border: 1px solid #dbeafe;">
                <div style="text-align: center; margin-bottom: 30px;">
                  <div style="font-size: 64px; margin-bottom: 15px;">🏢</div>
                  <h1 style="color: #1e40af; margin: 0; font-size: 28px; font-weight: 700; text-shadow: 1px 1px 2px rgba(0,0,0,0.1);">
                    Votre compte RH a été créé !
                  </h1>
                  <p style="color: #6b7280; margin: 10px 0 0 0; font-size: 16px; font-style: italic;">
                    Gérez votre équipe avec ZaLaMa
                  </p>
                </div>
                
                <div style="background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); padding: 25px; border-radius: 16px; margin-bottom: 30px; border: 2px solid #10b981;">
                  <h3 style="color: #065f46; margin: 0 0 20px 0; font-size: 20px; font-weight: 600; border-bottom: 2px solid #059669; padding-bottom: 10px;">
                    🏢 Informations de votre entreprise
                  </h3>
                  <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                      <td style="padding: 10px 0; color: #374151; font-weight: 600; width: 35%;">🏪 Entreprise :</td>
                      <td style="padding: 10px 0; color: #1f2937; font-weight: 500;">${partenaireData.nom}</td>
                    </tr>
                    <tr style="background-color: rgba(16, 185, 129, 0.05);">
                      <td style="padding: 10px 0; color: #374151; font-weight: 600;">👤 Nom RH :</td>
                      <td style="padding: 10px 0; color: #1f2937; font-weight: 500;">${partenaireData.nom_rh}</td>
                    </tr>
                    <tr>
                      <td style="padding: 10px 0; color: #374151; font-weight: 600;">👔 Rôle :</td>
                      <td style="padding: 10px 0; color: #1f2937; font-weight: 500;">Responsable RH</td>
                    </tr>
                  </table>
                </div>
                
                <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); padding: 25px; border-radius: 16px; margin-bottom: 30px; border: 2px solid #0ea5e9;">
                  <h3 style="color: #1e40af; margin: 0 0 20px 0; font-size: 20px; font-weight: 600; border-bottom: 2px solid #3b82f6; padding-bottom: 10px;">
                    🔐 Vos identifiants de connexion
                  </h3>
                  <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                      <td style="padding: 10px 0; color: #374151; font-weight: 600; width: 35%;">📧 Email :</td>
                      <td style="padding: 10px 0; color: #1f2937; font-weight: 500;">${partenaireData.email_rh}</td>
                    </tr>
                    <tr style="background-color: rgba(59, 130, 246, 0.05);">
                      <td style="padding: 10px 0; color: #374151; font-weight: 600;">🔑 Mot de passe :</td>
                      <td style="padding: 10px 0;">
                        <code style="background-color: #e2e8f0; padding: 8px 12px; border-radius: 6px; font-family: 'Courier New', monospace; font-size: 14px; color: #1f2937; border: 1px solid #cbd5e1; letter-spacing: 1px;">
                          ${results.rh.account.password}
                        </code>
                      </td>
                    </tr>
                  </table>
                </div>
                
                <div style="background: linear-gradient(135deg, #fef3c7 0%, #fbbf24 20%); padding: 20px; border-radius: 12px; margin-bottom: 25px; border-left: 6px solid #f59e0b;">
                  <h3 style="color: #92400e; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">
                    🔐 Sécurité importante
                  </h3>
                  <p style="color: #78350f; margin: 0; line-height: 1.6; font-weight: 500;">
                    Pour votre sécurité, nous vous recommandons fortement de <strong>changer votre mot de passe</strong> lors de votre première connexion.
                  </p>
                </div>
                
                <div style="text-align: center; margin-bottom: 25px; padding: 25px; background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); border-radius: 12px;">
                  <h3 style="color: white; margin: 0 0 15px 0; font-size: 20px; font-weight: 600;">
                    🌐 Accès à la plateforme
                  </h3>
                  <p style="color: #bfdbfe; margin: 0 0 20px 0; font-size: 16px;">
                    Connectez-vous dès maintenant à l'interface d'administration ZaLaMa
                  </p>
                  <div style="background: rgba(255, 255, 255, 0.1); padding: 15px; border-radius: 8px; margin: 15px 0;">
                    <a href="https://admin.zalama.com" style="color: #ffffff; text-decoration: none; font-size: 18px; font-weight: 600; display: inline-block; padding: 12px 25px; background: rgba(255, 255, 255, 0.2); border-radius: 6px; border: 1px solid rgba(255, 255, 255, 0.3);">
                      ➜ Se connecter maintenant
                    </a>
                  </div>
                </div>
                
                <div style="background: #ecfdf5; padding: 20px; border-radius: 12px; margin-bottom: 25px; border: 1px solid #d1fae5;">
                  <h3 style="color: #065f46; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">
                    🚀 Fonctionnalités RH disponibles
                  </h3>
                  <ul style="margin: 0; padding-left: 20px; color: #064e3b;">
                    <li style="margin-bottom: 8px; font-weight: 500;">👥 Gestion des employés</li>
                    <li style="margin-bottom: 8px; font-weight: 500;">💰 Validation des demandes d'avance</li>
                    <li style="margin-bottom: 8px; font-weight: 500;">📊 Rapports et statistiques RH</li>
                    <li style="margin-bottom: 8px; font-weight: 500;">📧 Notifications et communications</li>
                    <li style="margin-bottom: 8px; font-weight: 500;">⚙️ Paramètres de l'entreprise</li>
                  </ul>
                </div>
                
                <div style="background: #f8fafc; padding: 20px; border-radius: 12px; margin-bottom: 25px; border: 1px solid #e2e8f0;">
                  <h3 style="color: #1e40af; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">
                    💬 Support technique
                  </h3>
                  <p style="color: #475569; margin: 0 0 15px 0; line-height: 1.6;">
                    Notre équipe est à votre disposition pour vous accompagner :
                  </p>
                  <div style="display: flex; flex-wrap: wrap; gap: 15px;">
                    <div style="flex: 1; min-width: 200px; background: white; padding: 15px; border-radius: 8px; border: 1px solid #d1d5db;">
                      <div style="color: #059669; font-weight: 600; margin-bottom: 5px;">📧 Email</div>
                      <div style="color: #374151;">support@zalamagn.com</div>
                    </div>
                    <div style="flex: 1; min-width: 200px; background: white; padding: 15px; border-radius: 8px; border: 1px solid #d1d5db;">
                      <div style="color: #059669; font-weight: 600; margin-bottom: 5px;">📱 Téléphone</div>
                      <div style="color: #374151;">+224 XXX XXX XXX</div>
                    </div>
                  </div>
                </div>
              </td>
            </tr>
          `
        });
        
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

        // Email au responsable avec le design ZaLaMa moderne
        const responsableEmailSubject = `🤝 Bienvenue dans l'écosystème ZaLaMa - Compte responsable créé`;
        
        // Utiliser le template ZaLaMa moderne
        const responsableEmailBody = getZalamaEmailTemplate({
          title: `Votre compte responsable est activé !`,
          username: partenaireData.nom_representant,
          content: `
            <tr>
              <td style="padding: 12px 15px; color: #1f2937; font-size: 16px; line-height: 1.6; background-color: #ffffff; border-radius: 8px; margin-bottom: 10px; border: 1px solid #dbeafe;">
                <div style="text-align: center; margin-bottom: 30px;">
                  <div style="font-size: 64px; margin-bottom: 15px;">🤝</div>
                  <h1 style="color: #1e40af; margin: 0; font-size: 28px; font-weight: 700; text-shadow: 1px 1px 2px rgba(0,0,0,0.1);">
                    Votre compte responsable a été créé !
                  </h1>
                  <p style="color: #6b7280; margin: 10px 0 0 0; font-size: 16px; font-style: italic;">
                    Pilotez votre partenariat avec ZaLaMa
                  </p>
                </div>
                
                <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); padding: 25px; border-radius: 16px; margin-bottom: 30px; border: 2px solid #f59e0b;">
                  <h3 style="color: #92400e; margin: 0 0 20px 0; font-size: 20px; font-weight: 600; border-bottom: 2px solid #f59e0b; padding-bottom: 10px;">
                    🤝 Informations du partenariat
                  </h3>
                  <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                      <td style="padding: 10px 0; color: #374151; font-weight: 600; width: 35%;">🏪 Entreprise :</td>
                      <td style="padding: 10px 0; color: #1f2937; font-weight: 500;">${partenaireData.nom}</td>
                    </tr>
                    <tr style="background-color: rgba(245, 158, 11, 0.05);">
                      <td style="padding: 10px 0; color: #374151; font-weight: 600;">👤 Responsable :</td>
                      <td style="padding: 10px 0; color: #1f2937; font-weight: 500;">${partenaireData.nom_representant}</td>
                    </tr>
                    <tr>
                      <td style="padding: 10px 0; color: #374151; font-weight: 600;">👔 Rôle :</td>
                      <td style="padding: 10px 0; color: #1f2937; font-weight: 500;">Représentant légal</td>
                    </tr>
                  </table>
                </div>
                
                <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); padding: 25px; border-radius: 16px; margin-bottom: 30px; border: 2px solid #0ea5e9;">
                  <h3 style="color: #1e40af; margin: 0 0 20px 0; font-size: 20px; font-weight: 600; border-bottom: 2px solid #3b82f6; padding-bottom: 10px;">
                    🔐 Vos identifiants de connexion
                  </h3>
                  <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                      <td style="padding: 10px 0; color: #374151; font-weight: 600; width: 35%;">📧 Email :</td>
                      <td style="padding: 10px 0; color: #1f2937; font-weight: 500;">${partenaireData.email_representant}</td>
                    </tr>
                    <tr style="background-color: rgba(59, 130, 246, 0.05);">
                      <td style="padding: 10px 0; color: #374151; font-weight: 600;">🔑 Mot de passe :</td>
                      <td style="padding: 10px 0;">
                        <code style="background-color: #e2e8f0; padding: 8px 12px; border-radius: 6px; font-family: 'Courier New', monospace; font-size: 14px; color: #1f2937; border: 1px solid #cbd5e1; letter-spacing: 1px;">
                          ${results.responsable.account.password}
                        </code>
                      </td>
                    </tr>
                  </table>
                </div>
                
                <div style="background: linear-gradient(135deg, #fef3c7 0%, #fbbf24 20%); padding: 20px; border-radius: 12px; margin-bottom: 25px; border-left: 6px solid #f59e0b;">
                  <h3 style="color: #92400e; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">
                    🔐 Sécurité importante
                  </h3>
                  <p style="color: #78350f; margin: 0; line-height: 1.6; font-weight: 500;">
                    Pour votre sécurité, nous vous recommandons fortement de <strong>changer votre mot de passe</strong> lors de votre première connexion.
                  </p>
                </div>
                
                <div style="text-align: center; margin-bottom: 25px; padding: 25px; background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); border-radius: 12px;">
                  <h3 style="color: white; margin: 0 0 15px 0; font-size: 20px; font-weight: 600;">
                    🌐 Accès à la plateforme
                  </h3>
                  <p style="color: #bfdbfe; margin: 0 0 20px 0; font-size: 16px;">
                    Connectez-vous dès maintenant à l'interface d'administration ZaLaMa
                  </p>
                  <div style="background: rgba(255, 255, 255, 0.1); padding: 15px; border-radius: 8px; margin: 15px 0;">
                    <a href="https://admin.zalama.com" style="color: #ffffff; text-decoration: none; font-size: 18px; font-weight: 600; display: inline-block; padding: 12px 25px; background: rgba(255, 255, 255, 0.2); border-radius: 6px; border: 1px solid rgba(255, 255, 255, 0.3);">
                      ➜ Se connecter maintenant
                    </a>
                  </div>
                </div>
                
                <div style="background: #ecfdf5; padding: 20px; border-radius: 12px; margin-bottom: 25px; border: 1px solid #d1fae5;">
                  <h3 style="color: #065f46; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">
                    🚀 Fonctionnalités responsable disponibles
                  </h3>
                  <ul style="margin: 0; padding-left: 20px; color: #064e3b;">
                    <li style="margin-bottom: 8px; font-weight: 500;">📊 Tableau de bord du partenariat</li>
                    <li style="margin-bottom: 8px; font-weight: 500;">💰 Suivi des transactions et remboursements</li>
                    <li style="margin-bottom: 8px; font-weight: 500;">📈 Rapports financiers détaillés</li>
                    <li style="margin-bottom: 8px; font-weight: 500;">⚙️ Paramètres du partenariat</li>
                    <li style="margin-bottom: 8px; font-weight: 500;">📧 Communications avec ZaLaMa</li>
                  </ul>
                </div>
                
                <div style="background: #f8fafc; padding: 20px; border-radius: 12px; margin-bottom: 25px; border: 1px solid #e2e8f0;">
                  <h3 style="color: #1e40af; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">
                    💬 Support dédié
                  </h3>
                  <p style="color: #475569; margin: 0 0 15px 0; line-height: 1.6;">
                    Votre équipe dédiée est à votre disposition :
                  </p>
                  <div style="display: flex; flex-wrap: wrap; gap: 15px;">
                    <div style="flex: 1; min-width: 200px; background: white; padding: 15px; border-radius: 8px; border: 1px solid #d1d5db;">
                      <div style="color: #059669; font-weight: 600; margin-bottom: 5px;">📧 Email</div>
                      <div style="color: #374151;">partenaires@zalamagn.com</div>
                    </div>
                    <div style="flex: 1; min-width: 200px; background: white; padding: 15px; border-radius: 8px; border: 1px solid #d1d5db;">
                      <div style="color: #059669; font-weight: 600; margin-bottom: 5px;">📱 Téléphone</div>
                      <div style="color: #374151;">+224 XXX XXX XXX</div>
                    </div>
                  </div>
                </div>
              </td>
            </tr>
          `
        });
        
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
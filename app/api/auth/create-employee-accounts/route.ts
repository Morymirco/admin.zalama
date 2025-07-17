import { getZalamaEmailTemplate } from '@/lib/email-template';
import { generatePassword, validateEmail } from '@/lib/utils';
import emailService from '@/services/emailService';
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Configuration Supabase
const supabaseUrl = 'https://mspmrzlqhwpdkkburjiw.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zcG1yemxxaHdwZGtrYnVyaml3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3ODcyNTgsImV4cCI6MjA2NjM2MzI1OH0.zr-TRpKjGJjW0nRtsyPcCLy4Us-c5tOGX71k5_3JJd0';

// Types pour améliorer la sécurité du code
interface EmployeeData {
  id?: string;
  prenom: string;
  nom: string;
  email: string;
  telephone?: string;
  partner_id: string;
}

interface AccountResult {
  success: boolean;
  account?: {
    id: string;
    email: string;
    display_name: string;
    role: string;
    partenaire_id: string;
    active: boolean;
    password: string;
  };
  error?: string;
}

// Utiliser la clé service role si disponible, sinon la clé anon pour les tests
const supabaseKey = supabaseServiceKey || supabaseAnonKey;

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Services directs pour éviter les appels API circulaires
const directSmsService = {
  async sendSMS(to: string[], message: string) {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/sms/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: to,
          message: message
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Erreur HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur SMS direct:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur SMS'
      };
    }
  }
};

const directEmailService = {
  async sendEmail(to: string, subject: string, html: string) {
    try {
      console.log('📧 Envoi email direct via emailService:', { to, subject });
      
      const result = await emailService.sendEmail({
        to: to,
        subject: subject,
        html: html
      });

      console.log('✅ Email envoyé avec succès:', result);
      return result;
    } catch (error) {
      console.error('❌ Erreur email direct:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur email'
      };
    }
  }
};

const employeeAccountService = {
  async createEmployeeAccount(employeeData: EmployeeData): Promise<AccountResult> {
    try {
      // Validation des données
      if (!employeeData.email) {
        return { success: false, error: 'L\'email est requis pour créer un compte de connexion' };
      }

      if (!validateEmail(employeeData.email)) {
        return { success: false, error: 'Format d\'email invalide' };
      }

      // Vérifier si l'email existe déjà dans admin_users
      const { data: existingUser, error: checkError } = await supabase
        .from('admin_users')
        .select('id, email')
        .eq('email', employeeData.email)
        .single();

      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Erreur lors de la vérification de l\'email:', checkError);
        return { success: false, error: 'Erreur lors de la vérification de l\'email' };
      }

      if (existingUser) {
        console.log('❌ Email déjà existant dans admin_users:', employeeData.email);
        return { success: false, error: 'Un utilisateur avec cette adresse email existe déjà' };
      }

      // Vérifier dans Supabase Auth de manière plus robuste
      if (supabaseServiceKey) {
        try {
          // Utiliser listUsers pour vérifier l'existence de l'email
          const { data: usersList, error: authCheckError } = await supabase.auth.admin.listUsers();
          
          if (authCheckError) {
            console.error('❌ Erreur lors de la vérification dans Supabase Auth:', authCheckError);
            return { success: false, error: 'Erreur lors de la vérification de l\'email dans Auth' };
          }
          
          const existingAuthUser = usersList.users.find(user => user.email === employeeData.email);
          if (existingAuthUser) {
            console.log('❌ Email déjà existant dans Supabase Auth:', employeeData.email);
            return { success: false, error: 'Un utilisateur avec cette adresse email existe déjà' };
          }
          
          console.log('✅ Email disponible dans Supabase Auth:', employeeData.email);
        } catch (authCheckError) {
          console.log('⚠️ Impossible de vérifier dans Supabase Auth:', authCheckError);
          // Continuer même si on ne peut pas vérifier dans Auth
        }
      }

      // Générer un mot de passe sécurisé
      const password = generatePassword();

      console.log('🔐 Tentative de création de compte pour:', employeeData.email);

      // Si nous n'avons pas la clé service role, simuler la création
      if (!supabaseServiceKey) {
        console.log('⚠️ Mode test: Simulation de création de compte (clé service role non disponible)');
        
        // Créer un compte simulé pour les tests
        const simulatedAccount = {
          id: `test_${Date.now()}`,
          email: employeeData.email,
          display_name: `${employeeData.prenom} ${employeeData.nom}`,
          role: 'user',
          partenaire_id: employeeData.partner_id,
          active: true,
          password: password
        };

        return { success: true, account: simulatedAccount };
      }

      // Créer le compte dans Supabase Auth (avec clé service role)
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: employeeData.email,
        password: password,
        email_confirm: true,
        user_metadata: {
          display_name: `${employeeData.prenom} ${employeeData.nom}`,
          role: 'user',
          partenaire_id: employeeData.partner_id,
          employee_id: employeeData.id
        }
      });

      if (authError) {
        console.error('❌ Erreur lors de la création du compte auth:', authError);
        
        // Détecter spécifiquement les erreurs d'email en double
        if (authError.message.includes('already been registered') || 
            authError.message.includes('already exists') ||
            authError.message.includes('duplicate') ||
            authError.message.includes('email_exists')) {
          console.log('❌ Email déjà existant dans Supabase Auth:', employeeData.email);
          return { success: false, error: 'Un utilisateur avec cette adresse email existe déjà' };
        }
        
        return { success: false, error: `Erreur création compte Auth: ${authError.message}` };
      }

      // Créer l'enregistrement dans admin_users
      const accountData = {
        id: authData.user.id,
        email: employeeData.email,
        display_name: `${employeeData.prenom} ${employeeData.nom}`,
        role: 'user',
        partenaire_id: employeeData.partner_id,
        active: true
      };

      const { data: accountRecord, error: accountError } = await supabase
        .from('admin_users')
        .insert([accountData])
        .select()
        .single();

      if (accountError) {
        console.error('Erreur lors de la création du compte admin:', accountError);
        // Supprimer le compte auth créé en cas d'erreur
        await supabase.auth.admin.deleteUser(authData.user.id);
        return { success: false, error: accountError.message };
      }

      return {
        success: true,
        account: {
          ...accountRecord,
          password: password // Retourner le mot de passe pour affichage temporaire
        }
      };

    } catch (error) {
      console.error('Erreur générale lors de la création du compte:', error);
      return { success: false, error: 'Erreur lors de la création du compte' };
    }
  }
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { employeeData }: { employeeData: EmployeeData } = body;

    if (!employeeData) {
      return NextResponse.json(
        { success: false, error: 'Données employé manquantes' },
        { status: 400 }
      );
    }

    console.log('🔄 Création du compte employé...', {
      employe: `${employeeData.prenom} ${employeeData.nom}`,
      email: employeeData.email,
      partenaire: employeeData.partner_id
    });

    // Créer le compte
    const results = await employeeAccountService.createEmployeeAccount(employeeData);

    console.log('✅ Résultats création compte:', {
      employe: results.success ? 'Succès' : results.error
    });

    // Envoyer les SMS et emails avec les identifiants
    const smsResults = {
      employe: { success: false, message: '', error: '' }
    };

    const emailResults = {
      employe: { success: false, message: '', error: '' }
    };

    // Envoyer SMS et email à l'employé si le compte a été créé
    if (results.success && results.account) {
      try {
        // SMS à l'employé (seulement si téléphone fourni)
        if (employeeData.telephone) {
        const employeSMSMessage = `Bonjour ${employeeData.prenom} ${employeeData.nom}, votre compte ZaLaMa a été créé avec succès.\nEmail: ${employeeData.email}\nMot de passe: ${results.account.password}\nConnectez-vous sur https://admin.zalama.com`;
        const employeSMSResult = await directSmsService.sendSMS([employeeData.telephone], employeSMSMessage);
        smsResults.employe = {
          success: employeSMSResult.success,
          message: employeSMSResult.success ? 'SMS employé envoyé' : '',
          error: employeSMSResult.error || employeSMSResult.message || ''
        };
          console.log('📱 SMS employé:', smsResults.employe.success ? '✅ Envoyé' : `❌ ${smsResults.employe.error}`);
        } else {
          smsResults.employe = {
            success: false,
            message: '',
            error: 'Aucun numéro de téléphone fourni'
          };
          console.log('⚠️ SMS employé: Aucun numéro de téléphone fourni');
        }

        // Email à l'employé avec le design ZaLaMa moderne
        if (employeeData.email) {
          const subject = `Création de votre compte ZaLaMa - Informations de connexion`;

          const html = getZalamaEmailTemplate({
            title: 'Bienvenue sur ZaLaMa',
            username: employeeData.prenom,
            content: `
              <tr>
                <td style="padding: 12px 15px; color: #1f2937; font-size: 16px; line-height: 1.6; background-color: #ffffff; border-radius: 8px; margin-bottom: 10px; border: 1px solid #dbeafe;">
                  <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #059669; margin: 0; font-size: 28px; font-weight: 700;">
                      Bienvenue sur ZaLaMa
                    </h1>
                    <p style="color: #6b7280; margin: 10px 0 0 0; font-size: 16px;">
                      Votre compte employé a été créé avec succès
                    </p>
                  </div>
                  
                  <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); padding: 25px; border-radius: 16px; margin-bottom: 30px; border: 2px solid #0ea5e9;">
                    <h3 style="color: #1e40af; margin: 0 0 20px 0; font-size: 20px; font-weight: 600; border-bottom: 2px solid #3b82f6; padding-bottom: 10px;">
                      Vos identifiants de connexion
                    </h3>
                    <table style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td style="padding: 8px 0; color: #374151; font-weight: 600; width: 30%;">Email :</td>
                        <td style="padding: 8px 0; color: #1f2937; font-weight: 500;">${employeeData.email}</td>
                      </tr>
                      <tr style="background-color: rgba(59, 130, 246, 0.05);">
                        <td style="padding: 8px 0; color: #374151; font-weight: 600;">Mot de passe :</td>
                        <td style="padding: 8px 0;">
                          <code style="background-color: #f1f5f9; padding: 4px 8px; border-radius: 4px; font-family: 'Courier New', monospace; color: #dc2626; font-weight: bold;">${results.account.password}</code>
                        </td>
                      </tr>
                    </table>
                  </div>
                  
                  <div style="background: linear-gradient(135deg, #fef3c7 0%, #fbbf24 20%); padding: 20px; border-radius: 12px; margin-bottom: 25px; border-left: 6px solid #f59e0b;">
                    <h3 style="color: #92400e; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">
                      Important - Sécurité
                    </h3>
                    <p style="color: #78350f; margin: 0; line-height: 1.6;">
                      Pour votre sécurité, nous vous recommandons vivement de modifier votre mot de passe lors de votre première connexion.
                    </p>
                  </div>
                  
                  <div style="text-align: center; margin-bottom: 30px;">
                    <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/login" 
                       style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(59, 130, 246, 0.25);">
                      Accéder à ZaLaMa
                    </a>
                  </div>
                  
                  <div style="background: #f8fafc; padding: 20px; border-radius: 12px; margin-bottom: 25px; border: 1px solid #e2e8f0;">
                    <h3 style="color: #1e40af; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">
                      Fonctionnalités disponibles
                    </h3>
                    <ul style="margin: 0; padding-left: 20px; color: #475569;">
                      <li style="margin-bottom: 8px;">Demandes d'avance sur salaire en temps réel</li>
                      <li style="margin-bottom: 8px;">Suivi de vos demandes et historique</li>
                      <li style="margin-bottom: 8px;">Notifications instantanées par email et SMS</li>
                      <li style="margin-bottom: 8px;">Interface simple et intuitive</li>
                    </ul>
                  </div>
                  
                  <div style="text-align: center; margin-top: 30px; padding: 20px; background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); border-radius: 12px; border: 1px solid #cbd5e1;">
                    <p style="color: #475569; margin: 0; font-size: 14px; line-height: 1.6;">
                      Besoin d'aide ? Contactez notre support technique : support@zalamagn.com
                    </p>
                  </div>
                </td>
              </tr>
            `
          });
          
        const employeEmailResult = await directEmailService.sendEmail(employeeData.email, subject, html);
        emailResults.employe = {
          success: employeEmailResult.success,
          message: employeEmailResult.success ? 'Email employé envoyé' : '',
          error: employeEmailResult.error || employeEmailResult.message || ''
        };
          console.log('📧 Email employé:', emailResults.employe.success ? '✅ Envoyé' : `❌ ${emailResults.employe.error}`);
        } else {
          emailResults.employe = {
            success: false,
            message: '',
            error: 'Aucun email fourni'
          };
          console.log('⚠️ Email employé: Aucun email fourni');
        }
      } catch (error) {
        console.error('Erreur envoi SMS/email employé:', error);
        smsResults.employe.error = `Erreur SMS employé: ${error}`;
        emailResults.employe.error = `Erreur email employé: ${error}`;
      }
    }

    // Si la création a échoué à cause d'un email existant, retourner une erreur 409
    if (!results.success && results.error && results.error.includes('existe déjà')) {
      return NextResponse.json({
        success: false,
        error: results.error,
        code: 'EMAIL_EXISTS'
      }, { status: 409 });
    }

    // Si la création a échoué pour une autre raison, retourner une erreur 500
    if (!results.success) {
      return NextResponse.json({
        success: false,
        error: results.error || 'Erreur lors de la création du compte',
        code: 'ACCOUNT_CREATION_ERROR'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      results: {
        account: results,
        smsResults,
        emailResults
      },
      message: 'Compte employé créé avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de la création du compte employé:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la création du compte employé' },
      { status: 500 }
    );
  }
} 
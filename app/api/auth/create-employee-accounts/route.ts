import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generatePassword, validateEmail } from '@/lib/utils';
import smsService from '@/services/smsService';
import emailService from '@/services/emailService';

// Configuration Supabase
const supabaseUrl = 'https://mspmrzlqhwpdkkburjiw.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zcG1yemxxaHdwZGtrYnVyaml3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3ODcyNTgsImV4cCI6MjA2NjM2MzI1OH0.zr-TRpKjGJjW0nRtsyPcCLy4Us-c5tOGX71k5_3JJd0';

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
  async createEmployeeAccount(employeeData: any): Promise<{ success: boolean; account?: any; error?: string }> {
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
          // Essayer de récupérer l'utilisateur directement par email
          const { data: existingAuthUser, error: authCheckError } = await supabase.auth.admin.getUserByEmail(employeeData.email);
          
          if (!authCheckError && existingAuthUser.user) {
            console.log('❌ Email déjà existant dans Supabase Auth:', employeeData.email);
            return { success: false, error: 'Un utilisateur avec cette adresse email existe déjà' };
          }
          
          // Si l'erreur n'est pas "user not found", c'est un vrai problème
          if (authCheckError && !authCheckError.message.includes('User not found')) {
            console.error('❌ Erreur lors de la vérification dans Supabase Auth:', authCheckError);
            return { success: false, error: 'Erreur lors de la vérification de l\'email dans Auth' };
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
    const { employeeData } = body;

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

        // Email à l'employé (seulement si email fourni)
        if (employeeData.email) {
        const employeEmailSubject = `Compte employé créé - ${employeeData.prenom} ${employeeData.nom}`;
        const employeEmailBody = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #3b82f6;">🎉 Votre compte employé a été créé avec succès</h2>
              
              <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #1e293b; margin-top: 0;">Informations de connexion</h3>
                <p><strong>Nom complet:</strong> ${employeeData.prenom} ${employeeData.nom}</p>
                <p><strong>Email de connexion:</strong> ${employeeData.email}</p>
                <p><strong>Mot de passe temporaire:</strong> <code style="background-color: #e2e8f0; padding: 2px 6px; border-radius: 4px;">${results.account.password}</code></p>
              </div>
              
              <div style="background-color: #ecfdf5; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <h4 style="color: #065f46; margin-top: 0;">🔐 Sécurité</h4>
                <p>Pour des raisons de sécurité, nous vous recommandons de changer votre mot de passe lors de votre première connexion.</p>
              </div>
              
              <div style="background-color: #eff6ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <h4 style="color: #1e40af; margin-top: 0;">🌐 Accès à la plateforme</h4>
                <p>Vous pouvez maintenant vous connecter à l'interface d'administration ZaLaMa :</p>
                <p><a href="https://admin.zalama.com" style="color: #3b82f6; text-decoration: none;">https://admin.zalama.com</a></p>
              </div>
              
              <p style="color: #64748b; font-size: 14px; margin-top: 30px;">
                Si vous avez des questions, n'hésitez pas à contacter votre administrateur.
              </p>
            </div>
        `;
        const employeEmailResult = await directEmailService.sendEmail(employeeData.email, employeEmailSubject, employeEmailBody);
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
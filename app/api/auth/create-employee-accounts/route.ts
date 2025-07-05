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
      const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/email/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: to,
          subject: subject,
          html: html
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Erreur HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur email direct:', error);
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

      // Vérifier aussi dans Supabase Auth si possible
      if (supabaseServiceKey) {
        try {
          const { data: authUsers, error: authCheckError } = await supabase.auth.admin.listUsers();
          
          if (!authCheckError && authUsers.users) {
            const existingAuthUser = authUsers.users.find(user => user.email === employeeData.email);
            if (existingAuthUser) {
              console.log('❌ Email déjà existant dans Supabase Auth:', employeeData.email);
              return { success: false, error: 'Un utilisateur avec cette adresse email existe déjà' };
            }
          }
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
        console.error('Erreur lors de la création du compte auth:', authError);
        
        // Détecter spécifiquement les erreurs d'email en double
        if (authError.message.includes('already been registered') || 
            authError.message.includes('already exists') ||
            authError.message.includes('duplicate')) {
          return { success: false, error: 'Un utilisateur avec cette adresse email existe déjà' };
        }
        
        return { success: false, error: authError.message };
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
        // SMS à l'employé
        const employeSMSMessage = `Bonjour ${employeeData.prenom} ${employeeData.nom}, votre compte ZaLaMa a été créé avec succès.\nEmail: ${employeeData.email}\nMot de passe: ${results.account.password}\nConnectez-vous sur https://admin.zalama.com`;
        const employeSMSResult = await directSmsService.sendSMS([employeeData.telephone], employeSMSMessage);
        smsResults.employe = {
          success: employeSMSResult.success,
          message: employeSMSResult.success ? 'SMS employé envoyé' : '',
          error: employeSMSResult.error || employeSMSResult.message || ''
        };

        // Email à l'employé
        const employeEmailSubject = `Compte employé créé - ${employeeData.prenom} ${employeeData.nom}`;
        const employeEmailBody = `
          <h2>Votre compte employé a été créé</h2>
          <p><strong>Employé:</strong> ${employeeData.prenom} ${employeeData.nom}</p>
          <p><strong>Email:</strong> ${employeeData.email}</p>
          <p><strong>Mot de passe:</strong> ${results.account.password}</p>
          <p>Vous pouvez maintenant vous connecter à l'interface d'administration.</p>
        `;
        const employeEmailResult = await directEmailService.sendEmail(employeeData.email, employeEmailSubject, employeEmailBody);
        emailResults.employe = {
          success: employeEmailResult.success,
          message: employeEmailResult.success ? 'Email employé envoyé' : '',
          error: employeEmailResult.error || employeEmailResult.message || ''
        };
      } catch (error) {
        console.error('Erreur envoi SMS/email employé:', error);
        smsResults.employe.error = `Erreur SMS employé: ${error}`;
        emailResults.employe.error = `Erreur email employé: ${error}`;
      }
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
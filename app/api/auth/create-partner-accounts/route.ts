import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generatePassword } from '@/lib/utils';

// Configuration Supabase côté serveur
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
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

class PartnerAccountService {
  // Créer un compte RH
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

  // Créer un compte responsable
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

  // Créer tous les comptes partenaire
  async createPartnerAccounts(partenaireData: any): Promise<{
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

    return NextResponse.json({
      success: true,
      results
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
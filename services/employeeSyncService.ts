import { createClient } from '@supabase/supabase-js';
import { Employe } from '@/types/partenaire';
import { generatePassword, validateEmail } from '@/lib/utils';

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

export interface SyncResult {
  success: boolean;
  employeeId: string;
  email: string;
  userId?: string;
  password?: string;
  error?: string;
  action: 'CREATED' | 'SYNCED' | 'FAILED' | 'ALREADY_EXISTS';
}

export interface BulkSyncResult {
  total: number;
  successful: number;
  failed: number;
  results: SyncResult[];
}

export const employeeSyncService = {
  /**
   * Vérifier si un email existe déjà dans Supabase Auth
   */
  async checkEmailExists(email: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.auth.admin.listUsers();
      
      if (error) {
        console.error('Erreur lors de la vérification de l\'email:', error);
        return false;
      }

      return data.users.some(user => user.email === email);
    } catch (error) {
      console.error('Erreur checkEmailExists:', error);
      return false;
    }
  },

  /**
   * Créer un compte Supabase Auth pour un employé
   */
  async createAuthAccount(employeeData: {
    email: string;
    nom: string;
    prenom: string;
    partner_id: string;
    employee_id: string;
  }): Promise<{ success: boolean; userId?: string; password?: string; error?: string }> {
    try {
      // Vérifier que l'email n'existe pas déjà
      const emailExists = await this.checkEmailExists(employeeData.email);
      if (emailExists) {
        return {
          success: false,
          error: 'Un compte avec cet email existe déjà dans Supabase Auth'
        };
      }

      // Générer un mot de passe sécurisé
      const password = generatePassword();

      // Créer le compte dans Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: employeeData.email,
        password: password,
        email_confirm: true,
        user_metadata: {
          display_name: `${employeeData.prenom} ${employeeData.nom}`,
          role: 'user',
          partenaire_id: employeeData.partner_id,
          employee_id: employeeData.employee_id
        }
      });

      if (authError) {
        console.error('Erreur lors de la création du compte auth:', authError);
        return {
          success: false,
          error: authError.message
        };
      }

      return {
        success: true,
        userId: authData.user.id,
        password: password
      };
    } catch (error) {
      console.error('Erreur createAuthAccount:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  /**
   * Créer un employé avec synchronisation automatique du compte Auth
   */
  async createEmployeeWithAuth(employeeData: Omit<Employe, 'id' | 'created_at' | 'updated_at'>): Promise<SyncResult> {
    try {
      // Validation
      if (!employeeData.email) {
        return {
          success: false,
          employeeId: '',
          email: '',
          error: 'L\'email est requis pour créer un compte de connexion',
          action: 'FAILED'
        };
      }

      if (!validateEmail(employeeData.email)) {
        return {
          success: false,
          employeeId: '',
          email: employeeData.email,
          error: 'Format d\'email invalide',
          action: 'FAILED'
        };
      }

      // Vérifier si l'email existe déjà dans Auth
      const emailExists = await this.checkEmailExists(employeeData.email);
      if (emailExists) {
        return {
          success: false,
          employeeId: '',
          email: employeeData.email,
          error: 'Un compte avec cet email existe déjà',
          action: 'ALREADY_EXISTS'
        };
      }

      // Créer le compte Auth d'abord
      const authResult = await this.createAuthAccount({
        email: employeeData.email,
        nom: employeeData.nom,
        prenom: employeeData.prenom,
        partner_id: employeeData.partner_id,
        employee_id: 'temp' // Sera mis à jour après création
      });

      if (!authResult.success) {
        return {
          success: false,
          employeeId: '',
          email: employeeData.email,
          error: authResult.error,
          action: 'FAILED'
        };
      }

      // Préparer les données pour l'insertion
      const employeeDataForInsert = {
        partner_id: employeeData.partner_id,
        nom: employeeData.nom,
        prenom: employeeData.prenom,
        genre: employeeData.genre || 'Homme',
        email: employeeData.email,
        telephone: employeeData.telephone,
        adresse: employeeData.adresse,
        poste: employeeData.poste,
        role: employeeData.role,
        type_contrat: employeeData.type_contrat || 'CDI',
        salaire_net: employeeData.salaire_net ? parseFloat(employeeData.salaire_net.toString()) : null,
        date_embauche: employeeData.date_embauche ? new Date(employeeData.date_embauche).toISOString().split('T')[0] : null,
        actif: employeeData.actif !== undefined ? employeeData.actif : true,
        user_id: authResult.userId // Lier à l'utilisateur Auth créé
      };

      // Créer l'employé dans la base de données
      const { data: employee, error } = await supabase
        .from('employees')
        .insert([employeeDataForInsert])
        .select()
        .single();

      if (error) {
        // Supprimer le compte Auth créé en cas d'erreur
        if (authResult.userId) {
          await supabase.auth.admin.deleteUser(authResult.userId);
        }
        
        return {
          success: false,
          employeeId: '',
          email: employeeData.email,
          error: error.message,
          action: 'FAILED'
        };
      }

      return {
        success: true,
        employeeId: employee.id,
        email: employeeData.email,
        userId: authResult.userId,
        password: authResult.password,
        action: 'CREATED'
      };
    } catch (error) {
      console.error('Erreur createEmployeeWithAuth:', error);
      return {
        success: false,
        employeeId: '',
        email: employeeData.email || '',
        error: error instanceof Error ? error.message : 'Erreur inconnue',
        action: 'FAILED'
      };
    }
  },

  /**
   * Synchroniser un employé existant avec un compte Auth
   */
  async syncExistingEmployee(employeeId: string): Promise<SyncResult> {
    try {
      // Récupérer l'employé
      const { data: employee, error: fetchError } = await supabase
        .from('employees')
        .select('*')
        .eq('id', employeeId)
        .single();

      if (fetchError || !employee) {
        return {
          success: false,
          employeeId: employeeId,
          email: '',
          error: 'Employé non trouvé',
          action: 'FAILED'
        };
      }

      if (!employee.email) {
        return {
          success: false,
          employeeId: employeeId,
          email: '',
          error: 'L\'employé n\'a pas d\'email',
          action: 'FAILED'
        };
      }

      // Vérifier si l'employé a déjà un user_id
      if (employee.user_id) {
        return {
          success: true,
          employeeId: employeeId,
          email: employee.email,
          userId: employee.user_id,
          action: 'ALREADY_EXISTS'
        };
      }

      // Vérifier si un compte Auth existe déjà pour cet email
      const emailExists = await this.checkEmailExists(employee.email);
      if (emailExists) {
        // Récupérer l'ID de l'utilisateur Auth
        const { data: authUsers } = await supabase.auth.admin.listUsers();
        const authUser = authUsers.users.find(user => user.email === employee.email);
        
        if (authUser) {
          // Mettre à jour l'employé avec le user_id
          const { error: updateError } = await supabase
            .from('employees')
            .update({ user_id: authUser.id })
            .eq('id', employeeId);

          if (updateError) {
            return {
              success: false,
              employeeId: employeeId,
              email: employee.email,
              error: updateError.message,
              action: 'FAILED'
            };
          }

          return {
            success: true,
            employeeId: employeeId,
            email: employee.email,
            userId: authUser.id,
            action: 'SYNCED'
          };
        }
      }

      // Créer un nouveau compte Auth
      const authResult = await this.createAuthAccount({
        email: employee.email,
        nom: employee.nom,
        prenom: employee.prenom,
        partner_id: employee.partner_id,
        employee_id: employee.id
      });

      if (!authResult.success) {
        return {
          success: false,
          employeeId: employeeId,
          email: employee.email,
          error: authResult.error,
          action: 'FAILED'
        };
      }

      // Mettre à jour l'employé avec le user_id
      const { error: updateError } = await supabase
        .from('employees')
        .update({ user_id: authResult.userId })
        .eq('id', employeeId);

      if (updateError) {
        // Supprimer le compte Auth créé en cas d'erreur
        if (authResult.userId) {
          await supabase.auth.admin.deleteUser(authResult.userId);
        }
        
        return {
          success: false,
          employeeId: employeeId,
          email: employee.email,
          error: updateError.message,
          action: 'FAILED'
        };
      }

      return {
        success: true,
        employeeId: employeeId,
        email: employee.email,
        userId: authResult.userId,
        password: authResult.password,
        action: 'SYNCED'
      };
    } catch (error) {
      console.error('Erreur syncExistingEmployee:', error);
      return {
        success: false,
        employeeId: employeeId,
        email: '',
        error: error instanceof Error ? error.message : 'Erreur inconnue',
        action: 'FAILED'
      };
    }
  },

  /**
   * Synchroniser tous les employés sans user_id
   */
  async syncAllEmployeesWithoutUserId(): Promise<BulkSyncResult> {
    try {
      // Récupérer tous les employés sans user_id
      const { data: employees, error } = await supabase
        .from('employees')
        .select('*')
        .is('user_id', null)
        .not('email', 'is', null);

      if (error) {
        throw error;
      }

      const results: SyncResult[] = [];
      let successful = 0;
      let failed = 0;

      for (const employee of employees || []) {
        const result = await this.syncExistingEmployee(employee.id);
        results.push(result);
        
        if (result.success) {
          successful++;
        } else {
          failed++;
        }
      }

      return {
        total: employees?.length || 0,
        successful,
        failed,
        results
      };
    } catch (error) {
      console.error('Erreur syncAllEmployeesWithoutUserId:', error);
      throw error;
    }
  },

  /**
   * Récupérer le statut de synchronisation de tous les employés
   */
  async getEmployeesSyncStatus(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('employees_sync_status')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Erreur getEmployeesSyncStatus:', error);
      throw error;
    }
  }
}; 
import { createClient } from '@supabase/supabase-js';
import { generatePassword, validateEmail } from '@/lib/utils';
import smsService from './smsService';
import emailService from './emailService';
import { Employe } from '@/types/partenaire';

// Configuration Supabase - Utiliser la clé service role directement
const supabaseUrl = 'https://mspmrzlqhwpdkkburjiw.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zcG1yemxxaHdwZGtrYnVyaml3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDc4NzI1OCwiZXhwIjoyMDY2MzYzMjU4fQ.6sIgEDZIP1fkUoxdPJYfzKHU1B_SfN6Hui6v_FV6yzw';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

interface EmployeeCreationResult {
  success: boolean;
  employee?: Employe;
  account?: {
    success: boolean;
    password?: string;
    error?: string;
  };
  sms?: {
    success: boolean;
    error?: string;
  };
  email?: {
    success: boolean;
    error?: string;
  };
  error?: string;
}

interface EmployeeValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

class EmployeeService {
  // Validation complète des données d'employé
  validateEmployeeData(data: any): EmployeeValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validation des champs obligatoires
    if (!data.nom || data.nom.trim().length === 0) {
      errors.push('Le nom est requis');
    } else if (data.nom.trim().length < 2) {
      errors.push('Le nom doit contenir au moins 2 caractères');
    }

    if (!data.prenom || data.prenom.trim().length === 0) {
      errors.push('Le prénom est requis');
    } else if (data.prenom.trim().length < 2) {
      errors.push('Le prénom doit contenir au moins 2 caractères');
    }

    if (!data.email) {
      errors.push('L\'email est requis');
    } else if (!validateEmail(data.email)) {
      errors.push('Format d\'email invalide');
    }

    if (!data.poste || data.poste.trim().length === 0) {
      errors.push('Le poste est requis');
    }

    if (!data.partner_id) {
      errors.push('L\'ID du partenaire est requis');
    }

    // Validation du genre
    const validGenres = ['Homme', 'Femme', 'Autre'];
    if (data.genre && !validGenres.includes(data.genre)) {
      errors.push(`Genre invalide. Valeurs acceptées: ${validGenres.join(', ')}`);
    }

    // Validation du type de contrat
    const validContrats = ['CDI', 'CDD', 'Consultant', 'Stage', 'Autre'];
    if (data.type_contrat && !validContrats.includes(data.type_contrat)) {
      errors.push(`Type de contrat invalide. Valeurs acceptées: ${validContrats.join(', ')}`);
    }

    // Validation du salaire
    if (data.salaire_net !== undefined && data.salaire_net !== null) {
      const salaire = parseFloat(data.salaire_net);
      if (isNaN(salaire) || salaire < 0) {
        errors.push('Le salaire doit être un nombre positif');
      }
    }

    // Validation de la date d'embauche
    if (data.date_embauche) {
      const date = new Date(data.date_embauche);
      if (isNaN(date.getTime())) {
        errors.push('Date d\'embauche invalide');
      } else if (date > new Date()) {
        warnings.push('La date d\'embauche est dans le futur');
      }
    }

    // Validation du téléphone
    if (data.telephone && !/^\+?[0-9\s\-\(\)]{8,}$/.test(data.telephone)) {
      warnings.push('Format de téléphone suspect');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  // Nettoyer les données d'employé
  cleanEmployeeData(data: any): Omit<Employe, 'id' | 'created_at' | 'updated_at'> {
    return {
      partner_id: data.partner_id,
      nom: data.nom?.trim(),
      prenom: data.prenom?.trim(),
      genre: data.genre || 'Homme',
      email: data.email?.trim().toLowerCase(),
      telephone: data.telephone?.trim() || undefined,
      adresse: data.adresse?.trim() || undefined,
      poste: data.poste?.trim(),
      role: data.role?.trim() || undefined,
      type_contrat: data.type_contrat || 'CDI',
      salaire_net: data.salaire_net ? parseFloat(data.salaire_net.toString()) : undefined,
      date_embauche: data.date_embauche ? new Date(data.date_embauche).toISOString().split('T')[0] : undefined,
      actif: data.actif !== undefined ? data.actif : true
    };
  }

  // Vérifier si l'email existe déjà
  async checkEmailExists(email: string): Promise<boolean> {
    try {
      // Vérifier dans la table employees
      const { data: existingEmployee, error: employeeError } = await supabase
        .from('employees')
        .select('id, email')
        .eq('email', email)
        .single();

      if (employeeError && employeeError.code !== 'PGRST116') {
        console.error('Erreur vérification email employee:', employeeError);
        return false;
      }

      if (existingEmployee) {
        return true;
      }

      // Vérifier dans Supabase Auth
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
      
      if (!authError && authUsers.users) {
        const existingAuthUser = authUsers.users.find(user => user.email === email);
        if (existingAuthUser) {
          return true;
        }
      }

      return false;
    } catch (error) {
      console.error('Erreur lors de la vérification email:', error);
      return false;
    }
  }

  // Créer un employé complet avec compte et notifications
  async createEmployee(employeeData: any): Promise<EmployeeCreationResult> {
    try {
      console.log('🔄 Début création employé:', employeeData);

      // Nettoyer et valider les données
      const cleanedData = this.cleanEmployeeData(employeeData);
      const validation = this.validateEmployeeData(cleanedData);

      if (!validation.isValid) {
        return {
          success: false,
          error: `Données invalides: ${validation.errors.join(', ')}`
        };
      }

      // Vérifier si l'email existe déjà
      const emailExists = await this.checkEmailExists(cleanedData.email!);
      if (emailExists) {
        return {
          success: false,
          error: 'Un employé avec cet email existe déjà'
        };
      }

      // Générer un mot de passe sécurisé
      const password = generatePassword();

      // Créer le compte dans Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: cleanedData.email,
        password: password,
        email_confirm: true,
        user_metadata: {
          display_name: `${cleanedData.prenom} ${cleanedData.nom}`,
          role: 'employee',
          partenaire_id: cleanedData.partner_id
        }
      });

      if (authError) {
        return {
          success: false,
          error: `Erreur création compte auth: ${authError.message}`
        };
      }

      // Préparer les données pour l'insertion avec l'ID du compte
      const employeeDataForInsert = {
        ...cleanedData,
        user_id: authData.user.id
      };

      // Créer l'employé dans la base de données
      const { data: employee, error: insertError } = await supabase
        .from('employees')
        .insert([employeeDataForInsert])
        .select()
        .single();

      if (insertError) {
        // Supprimer le compte Auth créé en cas d'erreur
        await supabase.auth.admin.deleteUser(authData.user.id);
        
        return {
          success: false,
          error: `Erreur création employé: ${insertError.message}`
        };
      }

      // Envoyer SMS et email en parallèle
      const [smsResult, emailResult] = await Promise.allSettled([
        this.sendWelcomeSMS(cleanedData, password),
        this.sendWelcomeEmail(cleanedData, password)
      ]);

      const sms = smsResult.status === 'fulfilled' ? smsResult.value : { success: false, error: 'Erreur SMS' };
      const email = emailResult.status === 'fulfilled' ? emailResult.value : { success: false, error: 'Erreur email' };

      console.log('✅ Employé créé avec succès:', employee);

      return {
        success: true,
        employee,
        account: {
          success: true,
          password: password,
          error: undefined
        },
        sms,
        email
      };

    } catch (error) {
      console.error('Erreur création employé:', error);
      return {
        success: false,
        error: `Erreur création employé: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  // Envoyer SMS de bienvenue
  async sendWelcomeSMS(employeeData: any, password: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    if (!employeeData.telephone) {
      return { success: false, error: 'Aucun numéro de téléphone fourni' };
    }

    try {
      const smsMessage = `Bonjour ${employeeData.prenom}, votre compte ZaLaMa a été créé avec succès.\nEmail: ${employeeData.email}\nMot de passe: ${password}\nConnectez-vous sur https://admin.zalama.com`;
      
      const smsResponse = await smsService.sendSMS({
        to: [employeeData.telephone],
        message: smsMessage,
        sender_name: 'ZaLaMa'
      });

      return {
        success: !!smsResponse,
        error: smsResponse ? undefined : 'Échec de l\'envoi du SMS'
      };
    } catch (error) {
      console.error('Erreur envoi SMS employé:', error);
      return {
        success: false,
        error: `Erreur SMS: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  // Envoyer email de bienvenue
  async sendWelcomeEmail(employeeData: any, password: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      await emailService.sendWelcomeEmailToEmployee({
        nom: employeeData.nom,
        email: employeeData.email,
        password: password,
        role: 'employe'
      });

      return { success: true };
    } catch (error) {
      console.error('Erreur envoi email employé:', error);
      return {
        success: false,
        error: `Erreur email: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  // Récupérer tous les employés d'un partenaire
  async getByPartnerId(partnerId: string): Promise<Employe[]> {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('partner_id', partnerId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur récupération employés:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Erreur getByPartnerId:', error);
      throw error;
    }
  }

  // Récupérer un employé par ID
  async getById(id: string): Promise<Employe | null> {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        console.error('Erreur récupération employé:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Erreur getById:', error);
      throw error;
    }
  }

  // Mettre à jour un employé
  async update(id: string, employeeData: Partial<Employe>): Promise<Employe> {
    try {
      const { data, error } = await supabase
        .from('employees')
        .update(employeeData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Erreur mise à jour employé:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Erreur update:', error);
      throw error;
    }
  }

  // Supprimer un employé
  async delete(id: string): Promise<void> {
    try {
      // Récupérer l'employé avant suppression
      const employee = await this.getById(id);
      if (!employee) {
        throw new Error('Employé non trouvé');
      }

      // Supprimer le compte Auth si il existe
      if (employee.user_id) {
        try {
          await supabase.auth.admin.deleteUser(employee.user_id);
        } catch (authError) {
          console.warn('Erreur suppression compte Auth:', authError);
        }
      }

      // Supprimer l'employé de la base
      const { error } = await supabase
        .from('employees')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erreur suppression employé:', error);
        throw error;
      }
    } catch (error) {
      console.error('Erreur delete:', error);
      throw error;
    }
  }

  // Rechercher des employés
  async search(searchTerm: string, partnerId?: string): Promise<Employe[]> {
    try {
      let query = supabase
        .from('employees')
        .select('*')
        .or(`nom.ilike.%${searchTerm}%,prenom.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,poste.ilike.%${searchTerm}%`);

      if (partnerId) {
        query = query.eq('partner_id', partnerId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur recherche employés:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Erreur search:', error);
      throw error;
    }
  }
}

export default new EmployeeService(); 
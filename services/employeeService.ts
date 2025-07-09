import { createClient } from '@supabase/supabase-js';
import { generatePassword, validateEmail } from '@/lib/utils';
import smsService from './smsService';
import emailClientService from './emailClientService';
import { Employe } from '@/types/partenaire';
import { Employee } from '@/types/employee';

// Configuration Supabase
const supabaseUrl = 'https://mspmrzlqhwpdkkburjiw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zcG1yemxxaHdwZGtrYnVyaml3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3ODcyNTgsImV4cCI6MjA2NjM2MzI1OH0.zr-TRpKjGJjW0nRtsyPcCLy4Us-c5tOGX71k5_3JJd0';

const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);

// Client pour les opérations admin (création de comptes Auth)
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey);

// Fonction utilitaire pour convertir les données de la DB vers l'interface
const convertFromDB = (dbEmployee: any): Employee => {
  return {
    id: dbEmployee.id,
    partner_id: dbEmployee.partner_id,
    nom: dbEmployee.nom,
    prenom: dbEmployee.prenom,
    genre: dbEmployee.genre,
    email: dbEmployee.email,
    telephone: dbEmployee.telephone,
    adresse: dbEmployee.adresse,
    poste: dbEmployee.poste,
    role: dbEmployee.role,
    type_contrat: dbEmployee.type_contrat,
    salaire_net: dbEmployee.salaire_net,
    date_embauche: dbEmployee.date_embauche,
    actif: dbEmployee.actif ?? true,
    created_at: dbEmployee.created_at,
    updated_at: dbEmployee.updated_at,
    user_id: dbEmployee.user_id
  };
};

// Fonction utilitaire pour convertir les données vers la DB
const convertToDB = (employee: Partial<Employee>): any => {
  return {
    partner_id: employee.partner_id,
    nom: employee.nom,
    prenom: employee.prenom,
    genre: employee.genre,
    email: employee.email,
    telephone: employee.telephone,
    adresse: employee.adresse,
    poste: employee.poste,
    role: employee.role,
    type_contrat: employee.type_contrat,
    salaire_net: employee.salaire_net,
    date_embauche: employee.date_embauche,
    actif: employee.actif,
    user_id: employee.user_id
  };
};

class EmployeeService {
  // Récupérer tous les employés
  async getAll(): Promise<Employee[]> {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []).map(convertFromDB);
    } catch (error) {
      console.error('Erreur lors de la récupération des employés:', error);
      throw error;
    }
  }

  // Récupérer un employé par ID
  async getById(id: string): Promise<Employee | null> {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data ? convertFromDB(data) : null;
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'employé:', error);
      throw error;
    }
  }

  // Récupérer les employés par partenaire
  async getByPartner(partnerId: string): Promise<Employee[]> {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('partner_id', partnerId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []).map(convertFromDB);
    } catch (error) {
      console.error('Erreur lors de la récupération des employés par partenaire:', error);
      throw error;
    }
  }

  // Créer un nouvel employé avec envoi automatique de SMS et email
  async create(employeeData: Partial<Employee>): Promise<{
    employee: Employee;
    smsResults: {
      employe: { success: boolean; message?: string; error?: string };
      admin: { success: boolean; message?: string; error?: string };
    };
    emailResults: {
      employe: { success: boolean; message?: string; error?: string };
    };
    accountResults: {
      employe: { success: boolean; password?: string; error?: string };
    };
  }> {
    try {
      console.log('🚀 Création de l\'employé:', `${employeeData.prenom} ${employeeData.nom}`);
      
      // Vérification obligatoire de l'email
      if (!employeeData.email) {
        throw new Error('Email obligatoire pour créer un employé avec un compte de connexion');
      }

      let userId: string | null = null;
      let password: string | null = null;

      // Créer le compte Auth obligatoirement
      try {
        console.log('🔐 Création du compte Auth...');
        
        // Générer un mot de passe sécurisé
        password = generatePassword();
        
        // Afficher les identifiants dans la console
        console.log('🔐 IDENTIFIANTS EMPLOYÉ CRÉÉ:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`👤 Nom: ${employeeData.prenom} ${employeeData.nom}`);
        console.log(`📧 Email: ${employeeData.email}`);
        console.log(`🔑 Mot de passe: ${password}`);
        console.log(`📱 Téléphone: ${employeeData.telephone || 'Non fourni'}`);
        console.log(`🌐 URL de connexion: https://admin.zalama.com`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        
        // Créer le compte dans Supabase Auth
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
          email: employeeData.email,
          password: password,
          email_confirm: true,
          user_metadata: {
            display_name: `${employeeData.prenom} ${employeeData.nom}`,
            role: 'user',
            partenaire_id: employeeData.partner_id
          }
        });

        if (authError) {
          console.error('❌ Erreur création compte Auth:', authError);
          throw new Error(`Erreur création compte Auth: ${authError.message}`);
        }

        userId = authData.user.id;
        console.log('✅ Compte Auth créé:', userId);
        
        // Créer l'entrée dans admin_users
        console.log('🔐 Création de l\'entrée admin_users...');
        const accountData = {
          id: authData.user.id,
          email: employeeData.email,
          display_name: `${employeeData.prenom} ${employeeData.nom}`,
          role: 'user',
          partenaire_id: employeeData.partner_id,
          active: true
        };

        const { error: adminError } = await supabase
          .from('admin_users')
          .insert([accountData]);

        if (adminError) {
          console.error('❌ Erreur création admin_users:', adminError);
          // Supprimer le compte Auth créé en cas d'erreur
          await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
          throw new Error(`Erreur création admin_users: ${adminError.message}`);
        }

        console.log('✅ Entrée admin_users créée');
        
      } catch (authError) {
        console.error('❌ Erreur lors de la création du compte Auth:', authError);
        // Ne pas continuer si la création du compte Auth échoue
        throw new Error(`Impossible de créer le compte de connexion: ${authError instanceof Error ? authError.message : 'Erreur inconnue'}`);
      }

      // Préparer les données pour l'insertion
      const dbData = convertToDB(employeeData);
      dbData.actif = employeeData.actif ?? true;
      
      // GARANTIR que user_id est défini (maintenant obligatoire)
      if (!userId) {
        throw new Error('user_id manquant - la création du compte Auth a échoué');
      }
      
      dbData.user_id = userId;
      console.log('✅ user_id défini pour l\'employé:', userId);

      // Insérer l'employé dans la base de données
      const { data, error } = await supabase
        .from('employees')
        .insert([dbData])
        .select()
        .single();

      if (error) {
        console.error('❌ Erreur lors de la création de l\'employé:', error);
        
        // Si l'employé n'a pas pu être créé et qu'un compte Auth a été créé, le supprimer
        if (userId) {
          try {
            console.log('🧹 Nettoyage des comptes créés suite à l\'échec...');
            await supabaseAdmin.auth.admin.deleteUser(userId);
            await supabase.from('admin_users').delete().eq('id', userId);
            console.log('✅ Comptes Auth et admin_users supprimés');
          } catch (deleteError) {
            console.error('⚠️ Erreur lors de la suppression des comptes:', deleteError);
          }
        }
        
        throw error;
      }

      console.log('✅ Employé créé avec succès:', data.id);
      console.log('📊 Vérification finale:');
      console.log('  - Employé ID:', data.id);
      console.log('  - User ID:', data.user_id || 'NULL');
      console.log('  - Email:', data.email);

      // Vérification critique que l'employé a bien un user_id (maintenant obligatoire)
      if (!data.user_id) {
        console.error('❌ ERREUR CRITIQUE: user_id manquant après création!');
        console.error('   - Compte Auth créé:', userId);
        console.error('   - Employé créé mais sans user_id');
        
        // Nettoyer et échouer
        try {
          await supabaseAdmin.auth.admin.deleteUser(userId);
          await supabase.from('admin_users').delete().eq('id', userId);
          await supabase.from('employees').delete().eq('id', data.id);
        } catch (cleanupError) {
          console.error('⚠️ Erreur lors du nettoyage:', cleanupError);
        }
        
        throw new Error('Erreur critique: user_id manquant après création de l\'employé');
      }

      // Résultats des SMS
      const smsResults = {
        employe: { success: false, message: '', error: '' },
        admin: { success: false, message: '', error: '' }
      };

      // Résultats des emails
      const emailResults = {
        employe: { success: false, message: '', error: '' }
      };

      // Résultats des comptes créés
      const accountResults = {
        employe: { 
          success: true, 
          password: password || undefined, 
          error: ''
        }
      };

      // Envoyer un SMS à l'administrateur
      try {
        const partenaireNom = employeeData.partner_id ? 
          (await supabase.from('partners').select('nom').eq('id', employeeData.partner_id).single()).data?.nom || 'Partenaire inconnu' : 
          'Aucun partenaire';
          
        const adminMessage = `Nouvel employé créé: ${employeeData.prenom} ${employeeData.nom} (${partenaireNom}). Email: ${employeeData.email || 'Non fourni'}. Compte employé: ${userId ? 'Créé' : 'Non créé'}.`;
        const adminSMSResult = await smsService.sendSMS({
          to: ['+224625212115'],
          message: adminMessage
        });
        smsResults.admin = {
          success: adminSMSResult.success,
          message: adminSMSResult.success ? 'SMS admin envoyé' : '',
          error: adminSMSResult.error || adminSMSResult.message || ''
        };
        
        // Afficher un message plus informatif selon le type d'erreur
        if (smsResults.admin.success) {
          console.log('📱 SMS admin: ✅ Envoyé');
        } else {
          const errorMsg = smsResults.admin.error;
          if (errorMsg.includes('solde insuffisant')) {
            console.log('📱 SMS admin: ⚠️ Solde insuffisant - SMS non envoyé');
          } else if (errorMsg.includes('Solde SMS insuffisant')) {
            console.log('📱 SMS admin: ⚠️ Solde SMS insuffisant - SMS non envoyé');
          } else {
            console.log(`📱 SMS admin: ❌ ${smsResults.admin.error}`);
          }
        }
      } catch (smsError) {
        smsResults.admin = {
          success: false,
          message: '',
          error: `Erreur SMS admin: ${smsError}`
        };
        console.log('❌ Erreur SMS admin:', smsError);
      }

      console.log('✅ Création employé terminée');
      console.log('📊 Résultats finaux:');
      console.log('  - Employé:', data.id);
      console.log('  - User ID:', data.user_id);
      console.log('  - Compte employé: ✅ Créé avec succès');

      return {
        employee: convertFromDB(data),
        smsResults,
        emailResults,
        accountResults
      };
    } catch (error) {
      console.error('❌ Erreur employeeService.create:', error);
      throw error;
    }
  }

  // Mettre à jour un employé
  async update(id: string, employeeData: Partial<Employee>): Promise<Employee> {
    try {
      const dbData = convertToDB(employeeData);
      const { data, error } = await supabase
        .from('employees')
        .update(dbData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return convertFromDB(data);
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'employé:', error);
      throw error;
    }
  }

  // Supprimer un employé
  async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('employees')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'employé:', error);
      throw error;
    }
  }

  // Rechercher des employés
  async search(term: string): Promise<Employee[]> {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .or(`nom.ilike.%${term}%,prenom.ilike.%${term}%,email.ilike.%${term}%,poste.ilike.%${term}%`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []).map(convertFromDB);
    } catch (error) {
      console.error('Erreur lors de la recherche d\'employés:', error);
      throw error;
    }
  }

  // Obtenir les statistiques des employés
  async getStatistics(): Promise<any> {
    try {
      const { data: employees, error } = await supabase
        .from('employees')
        .select('*');

      if (error) throw error;

      const totalEmployees = employees?.length || 0;
      const activeEmployees = employees?.filter(emp => emp.actif).length || 0;
      const inactiveEmployees = totalEmployees - activeEmployees;

      // Calculer les nouveaux employés ce mois
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const newEmployeesThisMonth = employees?.filter(emp => 
        new Date(emp.created_at) >= startOfMonth
      ).length || 0;

      return {
        totalEmployees,
        activeEmployees,
        inactiveEmployees,
        newEmployeesThisMonth,
        trend: newEmployeesThisMonth > 0 ? 'Hausse' : newEmployeesThisMonth === 0 ? 'Stable' : 'Baisse'
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      throw error;
    }
  }
}

export default new EmployeeService(); 
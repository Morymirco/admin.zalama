import { createClient } from '@supabase/supabase-js';
import { generatePassword, validateEmail } from '@/lib/utils';
import smsService from './smsService';
import emailService from './emailService';
import { Employe } from '@/types/partenaire';
import { Employee } from '@/types/employee';

// Configuration Supabase
const supabaseUrl = 'https://mspmrzlqhwpdkkburjiw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zcG1yemxxaHdwZGtrYnVyaml3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3ODcyNTgsImV4cCI6MjA2NjM2MzI1OH0.zr-TRpKjGJjW0nRtsyPcCLy4Us-c5tOGX71k5_3JJd0';

const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);

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
      
      const dbData = convertToDB(employeeData);
      dbData.actif = employeeData.actif ?? true;

      const { data, error } = await supabase
        .from('employees')
        .insert([dbData])
        .select()
        .single();

      if (error) {
        console.error('❌ Erreur lors de la création de l\'employé:', error);
        throw error;
      }

      console.log('✅ Employé créé avec succès:', data.id);

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
        employe: { success: false, password: undefined, error: '' }
      };

      // Créer le compte employé automatiquement via API si l'email est fourni
      if (employeeData.email) {
        try {
          console.log('🔐 Création automatique du compte employé...');
          
          // Récupérer le nom du partenaire pour l'email
          let partenaireNom = 'Votre entreprise';
          if (employeeData.partner_id) {
            try {
              const { data: partnerData } = await supabase
                .from('partners')
                .select('nom')
                .eq('id', employeeData.partner_id)
                .single();
              if (partnerData) {
                partenaireNom = partnerData.nom;
              }
            } catch (partnerError) {
              console.log('⚠️ Impossible de récupérer le nom du partenaire:', partnerError);
            }
          }
          
          const employeeWithId = { 
            ...employeeData, 
            id: data.id,
            partenaireNom 
          };
          
          // Appeler l'API route pour créer le compte
          const baseUrl = typeof window !== 'undefined' ? '' : 'http://localhost:3000';
          const response = await fetch(`${baseUrl}/api/auth/create-employee-accounts`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ employeeData: employeeWithId }),
          });

          if (!response.ok) {
            console.error('❌ Erreur API:', response.status, response.statusText);
            throw new Error(`Erreur API: ${response.status} ${response.statusText}`);
          }

          const apiResult = await response.json();
          
          if (!apiResult.success) {
            console.error('❌ Erreur API result:', apiResult);
            throw new Error(apiResult.error || 'Erreur création compte via API');
          }

          const accountCreationResults = apiResult.results;
          const apiSmsResults = accountCreationResults.smsResults || {};
          const apiEmailResults = accountCreationResults.emailResults || {};

          console.log('📊 Résultats API route:');
          console.log('  - Compte:', accountCreationResults.account);
          console.log('  - SMS:', apiSmsResults);
          console.log('  - Emails:', apiEmailResults);

          // Logs détaillés des résultats SMS/Email
          if (apiSmsResults.employe) {
            console.log('📱 SMS employé:', apiSmsResults.employe.success ? '✅ Envoyé' : `❌ ${apiSmsResults.employe.error}`);
          }
          if (apiEmailResults.employe) {
            console.log('📧 Email employé:', apiEmailResults.employe.success ? '✅ Envoyé' : `❌ ${apiEmailResults.employe.error}`);
          }

          // Traiter les résultats du compte employé
          if (accountCreationResults.account.success) {
            accountResults.employe = {
              success: true,
              password: accountCreationResults.account.account?.password,
              error: ''
            };
            
            console.log('✅ Compte employé créé avec succès');
            
            // Utiliser les résultats SMS/email de l'API
            smsResults.employe = apiSmsResults.employe || {
              success: false,
              message: '',
              error: 'Aucun résultat SMS de l\'API'
            };

            emailResults.employe = apiEmailResults.employe || {
              success: false,
              message: '',
              error: 'Aucun résultat email de l\'API'
            };
          } else {
            accountResults.employe = {
              success: false,
              password: undefined,
              error: accountCreationResults.account.error || 'Erreur création compte employé'
            };
            smsResults.employe = {
              success: false,
              message: '',
              error: accountResults.employe.error
            };
            emailResults.employe = {
              success: false,
              message: '',
              error: accountResults.employe.error
            };
            console.log('❌ Échec création compte employé:', accountResults.employe.error);
          }

        } catch (accountError) {
          console.error('❌ Erreur lors de la création du compte:', accountError);
          
          // NE PAS supprimer automatiquement l'employé
          // Laisser l'utilisateur décider s'il veut continuer ou annuler
          console.log('⚠️ Employé créé mais compte non créé. L\'utilisateur peut le créer manuellement.');
          
          // Mettre à jour les résultats d'erreur
          accountResults.employe = {
            success: false,
            password: undefined,
            error: `Erreur création compte: ${accountError instanceof Error ? accountError.message : String(accountError)}`
          };
        }
      }

      // Envoyer un SMS à l'administrateur
      try {
        const partenaireNom = employeeData.partner_id ? 
          (await supabase.from('partners').select('nom').eq('id', employeeData.partner_id).single()).data?.nom || 'Partenaire inconnu' : 
          'Aucun partenaire';
          
        const adminMessage = `Nouvel employé créé: ${employeeData.prenom} ${employeeData.nom} (${partenaireNom}). Email: ${employeeData.email}. Compte employé configuré.`;
        const adminSMSResult = await smsService.sendSMS({
          to: ['+224625212115'],
          message: adminMessage
        });
        smsResults.admin = {
          success: adminSMSResult.success,
          message: adminSMSResult.success ? 'SMS admin envoyé' : '',
          error: adminSMSResult.error || adminSMSResult.message || ''
        };
        console.log('📱 SMS admin:', smsResults.admin.success ? '✅ Envoyé' : `❌ ${smsResults.admin.error}`);
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
      console.log('  - Compte employé:', accountResults.employe.success ? '✅' : '❌');

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
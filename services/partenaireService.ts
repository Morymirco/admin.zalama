import { createClient } from '@supabase/supabase-js';
import { Employee, Partner } from '@/types/employee';
import smsService from './smsService';
import employeeAccountService from './employeeAccountService';
import { employeeSyncService } from './employeeSyncService';
import { generatePassword, validateEmail, sendSMS } from '@/lib/utils';
import employeeService from './employeeService';

// Configuration Supabase - Variables définies directement
const supabaseUrl = 'https://mspmrzlqhwpdkkburjiw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zcG1yemxxaHdwZGtrYnVyaml3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3ODcyNTgsImV4cCI6MjA2NjM2MzI1OH0.zr-TRpKjGJjW0nRtsyPcCLy4Us-c5tOGX71k5_3JJd0';

const supabase = createClient(supabaseUrl, supabaseKey);

// Service pour les partenaires
export const partenaireService = {
  // Récupérer tous les partenaires
  async getAll(): Promise<Partner[]> {
    try {
      const { data, error } = await supabase
        .from('partners')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur lors de la récupération des partenaires:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Erreur partenaireService.getAll:', error);
      throw error;
    }
  },

  // Récupérer un partenaire par ID avec ses employés
  async getByIdWithEmployees(id: string): Promise<Partner & { employees?: Employee[] } | null> {
    try {
      const { data, error } = await supabase
        .from('partners')
        .select(`
          *,
          employees (*)
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error('Erreur lors de la récupération du partenaire avec employés:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Erreur partenaireService.getByIdWithEmployees:', error);
      throw error;
    }
  },

  // Récupérer un partenaire par ID
  async getById(id: string): Promise<Partner | null> {
    try {
      const { data, error } = await supabase
        .from('partners')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Erreur lors de la récupération du partenaire:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Erreur partenaireService.getById:', error);
      throw error;
    }
  },

  // Créer un nouveau partenaire avec création automatique de comptes
  async create(partenaireData: Omit<Partner, 'id' | 'created_at' | 'updated_at'>): Promise<{
    partenaire: Partner;
    smsResults: {
      representant: { success: boolean; message?: string; error?: string };
      rh: { success: boolean; message?: string; error?: string };
      admin: { success: boolean; message?: string; error?: string };
    };
    emailResults: {
      rh: { success: boolean; message?: string; error?: string };
      responsable: { success: boolean; message?: string; error?: string };
    };
    accountResults: {
      rh: { success: boolean; password?: string; error?: string };
      responsable: { success: boolean; password?: string; error?: string };
    };
  }> {
    try {
      const { data, error } = await supabase
        .from('partners')
        .insert([partenaireData])
        .select()
        .single();

      if (error) {
        console.error('Erreur lors de la création du partenaire:', error);
        throw error;
      }

      // Résultats des SMS
      const smsResults = {
        representant: { success: false, message: '', error: '' },
        rh: { success: false, message: '', error: '' },
        admin: { success: false, message: '', error: '' }
      };

      // Résultats des emails
      const emailResults = {
        rh: { success: false, message: '', error: '' },
        responsable: { success: false, message: '', error: '' }
      };

      // Résultats des comptes créés
      const accountResults = {
        rh: { success: false, password: undefined, error: '' },
        responsable: { success: false, password: undefined, error: '' }
      };

      // Créer les comptes RH et responsable automatiquement via API
      try {
        console.log('🔐 Création automatique des comptes RH et responsable...');
        
        const partnerWithId = { ...partenaireData, id: data.id };
        
        // Appeler l'API route pour créer les comptes
        const response = await fetch('/api/auth/create-partner-accounts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ partenaireData: partnerWithId }),
        });

        if (!response.ok) {
          // Supprimer le partenaire créé
          await supabase.from('partners').delete().eq('id', data.id);
          throw new Error(`Erreur API: ${response.status} ${response.statusText}`);
        }

        const apiResult = await response.json();
        
        if (!apiResult.success) {
          // Supprimer le partenaire créé
          await supabase.from('partners').delete().eq('id', data.id);
          throw new Error(apiResult.error || 'Erreur création comptes via API');
        }

        const accountCreationResults = apiResult.results;

        // Si la création du compte RH ou responsable échoue, supprimer le partenaire
        if (!accountCreationResults.rh.success || !accountCreationResults.responsable.success) {
          await supabase.from('partners').delete().eq('id', data.id);
          let errorMsg = 'Erreur création comptes : ';
          if (!accountCreationResults.rh.success) errorMsg += 'RH: ' + (accountCreationResults.rh.error || '');
          if (!accountCreationResults.responsable.success) errorMsg += ' Responsable: ' + (accountCreationResults.responsable.error || '');
          throw new Error(errorMsg);
        }

        // Traiter les résultats RH
        if (accountCreationResults.rh.success) {
          accountResults.rh = {
            success: true,
            password: accountCreationResults.rh.account?.password,
            error: ''
          };
          
          // Pour l'instant, pas de SMS/email dans l'API, on met des valeurs par défaut
          smsResults.rh = {
            success: false,
            message: '',
            error: 'SMS non implémenté dans l\'API'
          };

          emailResults.rh = {
            success: false,
            message: '',
            error: 'Email non implémenté dans l\'API'
          };
        } else {
          accountResults.rh = {
            success: false,
            password: undefined,
            error: accountCreationResults.rh.error || 'Erreur création compte RH'
          };
          smsResults.rh = {
            success: false,
            message: '',
            error: accountResults.rh.error
          };
          emailResults.rh = {
            success: false,
            message: '',
            error: accountResults.rh.error
          };
        }

        // Traiter les résultats responsable
        if (accountCreationResults.responsable.success) {
          accountResults.responsable = {
            success: true,
            password: accountCreationResults.responsable.account?.password,
            error: ''
          };
          
          // Pour l'instant, pas de SMS/email dans l'API, on met des valeurs par défaut
          smsResults.representant = {
            success: false,
            message: '',
            error: 'SMS non implémenté dans l\'API'
          };

          emailResults.responsable = {
            success: false,
            message: '',
            error: 'Email non implémenté dans l\'API'
          };
        } else {
          accountResults.responsable = {
            success: false,
            password: undefined,
            error: accountCreationResults.responsable.error || 'Erreur création compte responsable'
          };
          smsResults.representant = {
            success: false,
            message: '',
            error: accountResults.responsable.error
          };
          emailResults.responsable = {
            success: false,
            message: '',
            error: accountResults.responsable.error
          };
        }

        // Envoyer un SMS à l'administrateur
        try {
          const adminMessage = `Nouveau partenaire créé: ${partenaireData.nom}. Comptes RH et responsable configurés.`;
          const adminSMSResult = await smsService.sendSMS('+224000000000', adminMessage);
          smsResults.admin = {
            success: adminSMSResult.success,
            message: adminSMSResult.success ? 'SMS admin envoyé' : '',
            error: adminSMSResult.error || ''
          };
        } catch (smsError) {
          smsResults.admin = {
            success: false,
            message: '',
            error: `Erreur SMS admin: ${smsError}`
          };
        }

      } catch (accountError) {
        console.error('Erreur lors de la création des comptes:', accountError);
        // Continuer même si la création des comptes échoue
      }

      return {
        partenaire: data,
        smsResults,
        emailResults,
        accountResults
      };
    } catch (error) {
      console.error('Erreur partenaireService.create:', error);
      throw error;
    }
  },

  // Mettre à jour un partenaire
  async update(id: string, partenaireData: Partial<Omit<Partner, 'id' | 'created_at' | 'updated_at'>>): Promise<Partner> {
    try {
      const { data, error } = await supabase
        .from('partners')
        .update(partenaireData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Erreur lors de la mise à jour du partenaire:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Erreur partenaireService.update:', error);
      throw error;
    }
  },

  // Supprimer un partenaire
  async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('partners')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erreur lors de la suppression du partenaire:', error);
        throw error;
      }
    } catch (error) {
      console.error('Erreur partenaireService.delete:', error);
      throw error;
    }
  },

  // Rechercher des partenaires
  async search(searchTerm: string): Promise<Partner[]> {
    try {
      const { data, error } = await supabase
        .from('partners')
        .select('*')
        .or(`nom.ilike.%${searchTerm}%,secteur.ilike.%${searchTerm}%,type.ilike.%${searchTerm}%`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur lors de la recherche des partenaires:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Erreur partenaireService.search:', error);
      throw error;
    }
  },

  // Récupérer les partenaires par type
  async getByType(type: string): Promise<Partner[]> {
    try {
      const { data, error } = await supabase
        .from('partners')
        .select('*')
        .eq('type', type)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur lors de la récupération des partenaires par type:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Erreur partenaireService.getByType:', error);
      throw error;
    }
  },

  // Récupérer les statistiques des partenaires
  async getStatistics(): Promise<{
    total_partenaires: number;
    partenaires_actifs: number;
    partenaires_inactifs: number;
    total_employes: number;
    salaire_total: number;
    moyenne_employes_par_partenaire: number;
    repartition_par_secteur: Array<{
      secteur: string;
      count: number;
    }>;
    repartition_par_type: Array<{
      type: string;
      count: number;
    }>;
  }> {
    try {
      // Récupérer tous les partenaires
      const partenaires = await this.getAll();

      // Récupérer tous les employés
      const allEmployees: Employee[] = [];
      for (const partenaire of partenaires) {
        try {
          const employes = await employeService.getByPartnerId(partenaire.id);
          allEmployees.push(...employes);
        } catch (err) {
          console.error(`Erreur lors du chargement des employés du partenaire ${partenaire.id}:`, err);
        }
      }

      const total_partenaires = partenaires.length;
      const partenaires_actifs = partenaires.filter(p => p.actif).length;
      const partenaires_inactifs = total_partenaires - partenaires_actifs;
      const total_employes = allEmployees.length;
      const salaire_total = allEmployees.reduce((sum, emp) => sum + (emp.salaire_net || 0), 0);
      const moyenne_employes_par_partenaire = total_partenaires > 0 ? total_employes / total_partenaires : 0;

      // Répartition par secteur
      const secteurCount: Record<string, number> = {};
      partenaires.forEach(p => {
        secteurCount[p.secteur] = (secteurCount[p.secteur] || 0) + 1;
      });
      const repartition_par_secteur = Object.entries(secteurCount).map(([secteur, count]) => ({
        secteur,
        count
      }));

      // Répartition par type
      const typeCount: Record<string, number> = {};
      partenaires.forEach(p => {
        typeCount[p.type] = (typeCount[p.type] || 0) + 1;
      });
      const repartition_par_type = Object.entries(typeCount).map(([type, count]) => ({
        type,
        count
      }));

      return {
        total_partenaires,
        partenaires_actifs,
        partenaires_inactifs,
        total_employes,
        salaire_total,
        moyenne_employes_par_partenaire,
        repartition_par_secteur,
        repartition_par_type
      };
    } catch (error) {
      console.error('Erreur partenaireService.getStatistics:', error);
      throw error;
    }
  },

  // Récupérer les partenaires actifs
  async getActive(): Promise<Partner[]> {
    try {
      const { data, error } = await supabase
        .from('partners')
        .select('*')
        .eq('actif', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur lors de la récupération des partenaires actifs:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Erreur partenaireService.getActive:', error);
      throw error;
    }
  },

  // Récupérer les partenaires inactifs
  async getInactive(): Promise<Partner[]> {
    try {
      const { data, error } = await supabase
        .from('partners')
        .select('*')
        .eq('actif', false)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur lors de la récupération des partenaires inactifs:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Erreur partenaireService.getInactive:', error);
      throw error;
    }
  },

  // Mettre à jour les statistiques d'un partenaire
  async updatePartnerStats(partnerId: string): Promise<void> {
    try {
      // Récupérer tous les employés du partenaire
      const employes = await employeService.getByPartnerId(partnerId);

      // Calculer les nouvelles statistiques
      const nombre_employes = employes.length;
      const salaire_net_total = employes.reduce((sum, emp) => sum + (emp.salaire_net || 0), 0);

      // Mettre à jour le partenaire
      const { error: updateError } = await supabase
        .from('partners')
        .update({
          nombre_employes,
          salaire_net_total,
          updated_at: new Date().toISOString()
        })
        .eq('id', partnerId);

      if (updateError) throw updateError;
    } catch (error) {
      console.error('Erreur partenaireService.updatePartnerStats:', error);
      throw error;
    }
  }
};

// Service pour les employés
export const employeService = {
  // Récupérer tous les employés d'un partenaire
  async getByPartnerId(partnerId: string): Promise<Employee[]> {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('partner_id', partnerId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur lors de la récupération des employés:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Erreur employeService.getByPartnerId:', error);
      throw error;
    }
  },

  // Récupérer un employé par ID
  async getById(id: string): Promise<Employee | null> {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Erreur lors de la récupération de l\'employé:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Erreur employeService.getById:', error);
      throw error;
    }
  },

  // Créer un nouvel employé avec compte de connexion automatique
  async create(employeData: Omit<Employee, 'id' | 'created_at' | 'updated_at'>): Promise<{
    employe: Employee;
    account?: {
      success: boolean;
      password?: string;
      error?: string;
    };
    sms?: {
      success: boolean;
      error?: string;
    };
  }> {
    try {
      console.log('🔄 Création d\'employé avec le nouveau service...');

      // Utiliser le nouveau service employeeService
      const result = await employeeService.createEmployee(employeData);

      if (!result.success) {
        throw new Error(result.error || 'Erreur lors de la création de l\'employé');
      }

      console.log('✅ Employé créé avec succès:', result.employee);

      // Mettre à jour les statistiques du partenaire
      await partenaireService.updatePartnerStats(employeData.partner_id || '');

      return {
        employe: result.employee!,
        account: result.account,
        sms: result.sms
      };
    } catch (error) {
      console.error('Erreur employeService.create:', error);
      throw error;
    }
  },

  // Mettre à jour un employé
  async update(id: string, employeData: Partial<Omit<Employee, 'id' | 'created_at' | 'updated_at'>>): Promise<Employee> {
    try {
      const { data, error } = await supabase
        .from('employees')
        .update(employeData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Erreur lors de la mise à jour de l\'employé:', error);
        throw error;
      }

      // Mettre à jour les statistiques du partenaire si l'employé a changé de partenaire
      if (data) {
        await partenaireService.updatePartnerStats(data.partner_id || '');
      }

      return data;
    } catch (error) {
      console.error('Erreur employeService.update:', error);
      throw error;
    }
  },

  // Supprimer un employé
  async delete(id: string): Promise<void> {
    try {
      // Récupérer l'employé avant suppression pour avoir le partner_id
      const employe = await this.getById(id);
      
      const { error } = await supabase
        .from('employees')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erreur lors de la suppression de l\'employé:', error);
        throw error;
      }

      // Mettre à jour les statistiques du partenaire
      if (employe) {
        await partenaireService.updatePartnerStats(employe.partner_id || '');
      }
    } catch (error) {
      console.error('Erreur employeService.delete:', error);
      throw error;
    }
  },

  // Créer plusieurs employés en lot
  async createBatch(employes: Omit<Employee, 'id' | 'created_at' | 'updated_at'>[]): Promise<Employee[]> {
    try {
      const { data, error } = await supabase
        .from('employees')
        .insert(employes)
        .select();

      if (error) {
        console.error('Erreur lors de la création en lot des employés:', error);
        throw error;
      }

      // Mettre à jour les statistiques du partenaire
      if (employes.length > 0) {
        await partenaireService.updatePartnerStats(employes[0].partner_id || '');
      }

      return data || [];
    } catch (error) {
      console.error('Erreur employeService.createBatch:', error);
      throw error;
    }
  },

  // Rechercher des employés
  async search(searchTerm: string, partnerId?: string): Promise<Employee[]> {
    try {
      let query = supabase
        .from('employees')
        .select('*')
        .or(`nom.ilike.%${searchTerm}%,prenom.ilike.%${searchTerm}%,poste.ilike.%${searchTerm}%`);

      if (partnerId) {
        query = query.eq('partner_id', partnerId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur lors de la recherche des employés:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Erreur employeService.search:', error);
      throw error;
    }
  }
};

export default partenaireService;

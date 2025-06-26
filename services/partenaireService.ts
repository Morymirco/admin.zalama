import { createClient } from '@supabase/supabase-js';
import { Partenaire, Employe, PartenaireAvecEmployes, StatistiquesPartenaire } from '@/types/partenaire';
import smsService from './smsService';
import employeeAccountService from './employeeAccountService';
import partnerAccountService from './partnerAccountService';
import { generatePassword, sendSMS, validateEmail } from '@/lib/utils';

// Configuration Supabase - Variables définies directement
const supabaseUrl = 'https://mspmrzlqhwpdkkburjiw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zcG1yemxxaHdwZGtrYnVyaml3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3ODcyNTgsImV4cCI6MjA2NjM2MzI1OH0.zr-TRpKjGJjW0nRtsyPcCLy4Us-c5tOGX71k5_3JJd0';

const supabase = createClient(supabaseUrl, supabaseKey);

// Service pour les partenaires
export const partenaireService = {
  // Récupérer tous les partenaires
  async getAll(): Promise<Partenaire[]> {
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
  async getByIdWithEmployees(id: string): Promise<PartenaireAvecEmployes | null> {
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
  async getById(id: string): Promise<Partenaire | null> {
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
  async create(partenaireData: Omit<Partenaire, 'id' | 'created_at' | 'updated_at'>): Promise<{
    partenaire: Partenaire;
    smsResults: {
      representant: { success: boolean; message?: string; error?: string };
      rh: { success: boolean; message?: string; error?: string };
      admin: { success: boolean; message?: string; error?: string };
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

      // Résultats des comptes créés
      const accountResults = {
        rh: { success: false, password: undefined, error: '' },
        responsable: { success: false, password: undefined, error: '' }
      };

      // Créer les comptes RH et responsable automatiquement
      try {
        console.log('🔐 Création automatique des comptes RH et responsable...');
        
        const partnerWithId = { ...partenaireData, id: data.id };
        const accountCreationResults = await partnerAccountService.createPartnerAccounts(partnerWithId);

        // Traiter les résultats RH
        if (accountCreationResults.rh.account.success) {
          accountResults.rh = {
            success: true,
            password: accountCreationResults.rh.account.account?.password,
            error: ''
          };
          
          if (accountCreationResults.rh.sms.success) {
            smsResults.rh = {
              success: true,
              message: `Compte RH créé et SMS envoyé à ${partenaireData.nom_rh} (${partenaireData.telephone_rh})`
            };
          } else {
            smsResults.rh = {
              success: false,
              error: `Compte RH créé mais SMS non envoyé: ${accountCreationResults.rh.sms.error}`
            };
          }
        } else {
          accountResults.rh = {
            success: false,
            password: undefined,
            error: accountCreationResults.rh.account.error || 'Erreur création compte RH'
          };
          smsResults.rh = {
            success: false,
            error: accountResults.rh.error
          };
        }

        // Traiter les résultats responsable
        if (accountCreationResults.responsable.account.success) {
          accountResults.responsable = {
            success: true,
            password: accountCreationResults.responsable.account.account?.password,
            error: ''
          };
          
          if (accountCreationResults.responsable.sms.success) {
            smsResults.representant = {
              success: true,
              message: `Compte responsable créé et SMS envoyé à ${partenaireData.nom_representant} (${partenaireData.telephone_representant})`
            };
          } else {
            smsResults.representant = {
              success: false,
              error: `Compte responsable créé mais SMS non envoyé: ${accountCreationResults.responsable.sms.error}`
            };
          }
        } else {
          accountResults.responsable = {
            success: false,
            password: undefined,
            error: accountCreationResults.responsable.account.error || 'Erreur création compte responsable'
          };
          smsResults.representant = {
            success: false,
            error: accountResults.responsable.error
          };
        }

        console.log('✅ Résultats création comptes:', accountResults);

      } catch (accountError) {
        console.error('❌ Erreur lors de la création des comptes:', accountError);
        accountResults.rh.error = `Erreur générale création compte RH: ${accountError instanceof Error ? accountError.message : String(accountError)}`;
        accountResults.responsable.error = `Erreur générale création compte responsable: ${accountError instanceof Error ? accountError.message : String(accountError)}`;
      }

      // SMS de notification à l'admin
      try {
        await smsService.sendPartnerCreationNotification(
          partenaireData.nom,
          partenaireData.type,
          partenaireData.secteur
        );
        smsResults.admin = {
          success: true,
          message: 'Notification admin envoyée'
        };
      } catch (smsError) {
        console.error('Erreur SMS admin détaillée:', smsError);
        smsResults.admin = {
          success: false,
          error: `Erreur SMS admin: ${smsError instanceof Error ? smsError.message : String(smsError)}`
        };
      }

      console.log('📊 Résultats finaux:', { smsResults, accountResults });

      return { partenaire: data, smsResults, accountResults };
    } catch (error) {
      console.error('Erreur partenaireService.create:', error);
      throw error;
    }
  },

  // Mettre à jour un partenaire
  async update(id: string, partenaireData: Partial<Omit<Partenaire, 'id' | 'created_at' | 'updated_at'>>): Promise<Partenaire> {
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

  // Supprimer un partenaire (supprime aussi ses employés via CASCADE)
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
  async search(searchTerm: string): Promise<Partenaire[]> {
    try {
      const { data, error } = await supabase
        .from('partners')
        .select('*')
        .or(`nom.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,secteur.ilike.%${searchTerm}%`)
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

  // Filtrer par type
  async getByType(type: string): Promise<Partenaire[]> {
    try {
      const { data, error } = await supabase
        .from('partners')
        .select('*')
        .eq('type', type)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur lors du filtrage par type:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Erreur partenaireService.getByType:', error);
      throw error;
    }
  },

  // Obtenir les statistiques des partenaires
  async getStatistics(): Promise<StatistiquesPartenaire> {
    try {
      // Récupérer les statistiques de base
      const { data: partners, error: partnersError } = await supabase
        .from('partners')
        .select('*');

      if (partnersError) throw partnersError;

      // Récupérer les employés
      const { data: employees, error: employeesError } = await supabase
        .from('employees')
        .select('*');

      if (employeesError) throw employeesError;

      // Calculer les statistiques
      const total_partenaires = partners?.length || 0;
      const partenaires_actifs = partners?.filter(p => p.actif).length || 0;
      const partenaires_inactifs = total_partenaires - partenaires_actifs;
      const total_employes = employees?.length || 0;
      const salaire_total = employees?.reduce((sum, emp) => sum + (emp.salaire_net || 0), 0) || 0;
      const moyenne_employes_par_partenaire = total_partenaires > 0 ? total_employes / total_partenaires : 0;

      // Répartition par secteur
      const secteurCounts: Record<string, number> = {};
      partners?.forEach(partner => {
        secteurCounts[partner.secteur] = (secteurCounts[partner.secteur] || 0) + 1;
      });

      // Répartition par type
      const typeCounts: Record<string, number> = {};
      partners?.forEach(partner => {
        typeCounts[partner.type] = (typeCounts[partner.type] || 0) + 1;
      });

      return {
        total_partenaires,
        partenaires_actifs,
        partenaires_inactifs,
        total_employes,
        salaire_total,
        moyenne_employes_par_partenaire,
        repartition_par_secteur: Object.entries(secteurCounts).map(([secteur, count]) => ({ secteur, count })),
        repartition_par_type: Object.entries(typeCounts).map(([type, count]) => ({ type, count }))
      };
    } catch (error) {
      console.error('Erreur partenaireService.getStatistics:', error);
      throw error;
    }
  },

  // Obtenir les partenaires actifs
  async getActive(): Promise<Partenaire[]> {
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

  // Obtenir les partenaires inactifs
  async getInactive(): Promise<Partenaire[]> {
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

  // Mettre à jour les statistiques d'un partenaire (nombre d'employés et salaire total)
  async updatePartnerStats(partnerId: string): Promise<void> {
    try {
      // Récupérer les employés du partenaire
      const { data: employees, error: employeesError } = await supabase
        .from('employees')
        .select('salaire_net')
        .eq('partner_id', partnerId)
        .eq('actif', true);

      if (employeesError) throw employeesError;

      // Calculer les nouvelles statistiques
      const nombre_employes = employees?.length || 0;
      const salaire_net_total = employees?.reduce((sum, emp) => sum + (emp.salaire_net || 0), 0) || 0;

      // Mettre à jour le partenaire
      const { error: updateError } = await supabase
        .from('partners')
        .update({
          nombre_employes,
          salaire_net_total
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
  async getByPartnerId(partnerId: string): Promise<Employe[]> {
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
  async getById(id: string): Promise<Employe | null> {
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
  async create(employeData: Omit<Employe, 'id' | 'created_at' | 'updated_at'>): Promise<{
    employe: Employe;
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
      // Vérifier que l'email est fourni pour la création du compte
      if (!employeData.email) {
        throw new Error('L\'email est requis pour créer un compte de connexion');
      }

      // Valider l'email
      if (!validateEmail(employeData.email)) {
        throw new Error('Format d\'email invalide');
      }

      // Créer l'employé dans la base de données
      const { data: employe, error } = await supabase
        .from('employees')
        .insert([employeData])
        .select()
        .single();

      if (error) {
        console.error('Erreur lors de la création de l\'employé:', error);
        throw error;
      }

      // Créer le compte de connexion automatiquement
      let accountResult = { success: false, error: 'Création de compte non tentée' };
      let smsResult = { success: false, error: 'SMS non envoyé' };

      try {
        // Préparer les données pour la création du compte
        const accountData = {
          ...employeData,
          id: employe.id, // ID de l'employé créé
          partner_id: employeData.partner_id
        };

        // Créer le compte avec mot de passe généré
        accountResult = await employeeAccountService.createEmployeeAccount(accountData);

        // Envoyer un SMS de confirmation si le compte a été créé avec succès
        if (accountResult.success && employeData.telephone) {
          console.log('📱 Préparation de l\'envoi SMS:', {
            telephone: employeData.telephone,
            prenom: employeData.prenom,
            email: employeData.email,
            password: accountResult.account?.password
          });
          
          const smsMessage = `Bonjour ${employeData.prenom}, votre compte ZaLaMa a été créé avec succès.\nEmail: ${employeData.email}\nMot de passe: ${accountResult.account?.password}\nConnectez-vous sur https://admin.zalama.com`;
          
          try {
            console.log('📤 Tentative d\'envoi SMS...');
            const smsSent = await sendSMS(employeData.telephone, smsMessage);
            console.log('📱 Résultat SMS:', smsSent);
            
            smsResult = {
              success: smsSent,
              error: smsSent ? undefined : 'Échec de l\'envoi du SMS'
            };
          } catch (smsError) {
            console.error('❌ Erreur lors de l\'envoi du SMS:', smsError);
            smsResult = {
              success: false,
              error: `Erreur SMS: ${smsError instanceof Error ? smsError.message : String(smsError)}`
            };
          }
        } else {
          console.log('📱 SMS non envoyé:', {
            accountSuccess: accountResult.success,
            hasTelephone: !!employeData.telephone,
            telephone: employeData.telephone
          });
        }

      } catch (accountError) {
        console.error('Erreur lors de la création du compte:', accountError);
        accountResult = {
          success: false,
          error: `Erreur création compte: ${accountError instanceof Error ? accountError.message : String(accountError)}`
        };
      }

      // Mettre à jour les statistiques du partenaire
      await partenaireService.updatePartnerStats(employeData.partner_id);

      return {
        employe,
        account: accountResult,
        sms: smsResult
      };
    } catch (error) {
      console.error('Erreur employeService.create:', error);
      throw error;
    }
  },

  // Mettre à jour un employé
  async update(id: string, employeData: Partial<Omit<Employe, 'id' | 'created_at' | 'updated_at'>>): Promise<Employe> {
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
        await partenaireService.updatePartnerStats(data.partner_id);
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
        await partenaireService.updatePartnerStats(employe.partner_id);
      }
    } catch (error) {
      console.error('Erreur employeService.delete:', error);
      throw error;
    }
  },

  // Créer plusieurs employés en lot
  async createBatch(employes: Omit<Employe, 'id' | 'created_at' | 'updated_at'>[]): Promise<Employe[]> {
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
        await partenaireService.updatePartnerStats(employes[0].partner_id);
      }

      return data || [];
    } catch (error) {
      console.error('Erreur employeService.createBatch:', error);
      throw error;
    }
  },

  // Rechercher des employés
  async search(searchTerm: string, partnerId?: string): Promise<Employe[]> {
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

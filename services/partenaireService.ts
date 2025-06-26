import { createClient } from '@supabase/supabase-js';
import { Partenaire, Employe, PartenaireAvecEmployes, StatistiquesPartenaire } from '@/types/partenaire';
import smsService from './smsService';

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

  // Créer un nouveau partenaire avec envoi de SMS
  async create(partenaireData: Omit<Partenaire, 'id' | 'created_at' | 'updated_at'>): Promise<{
    partenaire: Partenaire;
    smsResults: {
      representant: { success: boolean; message?: string; error?: string };
      rh: { success: boolean; message?: string; error?: string };
      admin: { success: boolean; message?: string; error?: string };
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

      // Envoyer les SMS de bienvenue après création réussie
      try {
        // SMS au représentant
        if (partenaireData.telephone_representant && partenaireData.nom_representant) {
          try {
            await smsService.sendWelcomeSMSToRepresentant(
              partenaireData.nom,
              partenaireData.nom_representant,
              partenaireData.telephone_representant,
              partenaireData.email_representant || ''
            );
            smsResults.representant = {
              success: true,
              message: `SMS envoyé au représentant ${partenaireData.nom_representant} (${partenaireData.telephone_representant})`
            };
          } catch (smsError) {
            console.error('Erreur SMS représentant détaillée:', smsError);
            smsResults.representant = {
              success: false,
              error: `Erreur SMS représentant: ${smsError instanceof Error ? smsError.message : String(smsError)}`
            };
          }
        } else {
          smsResults.representant = {
            success: false,
            error: 'Numéro de téléphone ou nom du représentant manquant'
          };
        }

        // SMS au responsable RH
        if (partenaireData.telephone_rh && partenaireData.nom_rh) {
          try {
            await smsService.sendWelcomeSMSToRH(
              partenaireData.nom,
              partenaireData.nom_rh,
              partenaireData.telephone_rh,
              partenaireData.email_rh || ''
            );
            smsResults.rh = {
              success: true,
              message: `SMS envoyé au responsable RH ${partenaireData.nom_rh} (${partenaireData.telephone_rh})`
            };
          } catch (smsError) {
            console.error('Erreur SMS RH détaillée:', smsError);
            smsResults.rh = {
              success: false,
              error: `Erreur SMS RH: ${smsError instanceof Error ? smsError.message : String(smsError)}`
            };
          }
        } else {
          smsResults.rh = {
            success: false,
            error: 'Numéro de téléphone ou nom du responsable RH manquant'
          };
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

        console.log('Résultats des SMS de bienvenue:', smsResults);
      } catch (smsError) {
        console.error('Erreur générale lors de l\'envoi des SMS de bienvenue:', smsError);
        // Marquer tous les SMS comme échoués
        smsResults.representant.error = 'Erreur générale SMS';
        smsResults.rh.error = 'Erreur générale SMS';
        smsResults.admin.error = 'Erreur générale SMS';
      }

      return { partenaire: data, smsResults };
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

  // Créer un nouvel employé
  async create(employeData: Omit<Employe, 'id' | 'created_at' | 'updated_at'>): Promise<Employe> {
    try {
      const { data, error } = await supabase
        .from('employees')
        .insert([employeData])
        .select()
        .single();

      if (error) {
        console.error('Erreur lors de la création de l\'employé:', error);
        throw error;
      }

      // Mettre à jour les statistiques du partenaire
      await partenaireService.updatePartnerStats(employeData.partner_id);

      return data;
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

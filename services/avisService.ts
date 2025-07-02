import { createClient } from '@supabase/supabase-js';
import { Avis, AvisStats } from '@/types/avis';

// Configuration Supabase
const supabaseUrl = 'https://mspmrzlqhwpdkkburjiw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zcG1yemxxaHdwZGtrYnVyaml3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3ODcyNTgsImV4cCI6MjA2NjM2MzI1OH0.zr-TRpKjGJjW0nRtsyPcCLy4Us-c5tOGX71k5_3JJd0';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const avisService = {
  // Récupérer tous les avis avec relations
  async getAll(): Promise<Avis[]> {
    try {
      const { data, error } = await supabase
        .from('avis')
        .select(`
          *,
          employee:employees!avis_employe_id_fkey(id, nom, prenom, email, poste),
          partner:partners(id, nom, type)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur lors de la récupération des avis:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Erreur avisService.getAll:', error);
      throw error;
    }
  },

  // Récupérer un avis par ID
  async getById(id: string): Promise<Avis | null> {
    try {
      const { data, error } = await supabase
        .from('avis')
        .select(`
          *,
          employee:employees!avis_employe_id_fkey(id, nom, prenom, email, poste),
          partner:partners(id, nom, type)
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error('Erreur lors de la récupération de l\'avis:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Erreur avisService.getById:', error);
      throw error;
    }
  },

  // Créer un nouvel avis
  async create(avisData: Omit<Avis, 'id' | 'created_at' | 'updated_at'>): Promise<Avis> {
    try {
      const { data, error } = await supabase
        .from('avis')
        .insert([avisData])
        .select()
        .single();

      if (error) {
        console.error('Erreur lors de la création de l\'avis:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Erreur avisService.create:', error);
      throw error;
    }
  },

  // Mettre à jour un avis
  async update(id: string, avisData: Partial<Omit<Avis, 'id' | 'created_at' | 'updated_at'>>): Promise<Avis> {
    try {
      const { data, error } = await supabase
        .from('avis')
        .update(avisData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Erreur lors de la mise à jour de l\'avis:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Erreur avisService.update:', error);
      throw error;
    }
  },

  // Supprimer un avis
  async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('avis')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erreur lors de la suppression de l\'avis:', error);
        throw error;
      }
    } catch (error) {
      console.error('Erreur avisService.delete:', error);
      throw error;
    }
  },

  // Approuver/Rejeter un avis
  async toggleApproval(id: string, approuve: boolean): Promise<Avis> {
    try {
      const { data, error } = await supabase
        .from('avis')
        .update({ approuve })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Erreur lors de la modification de l\'approbation:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Erreur avisService.toggleApproval:', error);
      throw error;
    }
  },

  // Rechercher des avis
  async search(searchTerm: string): Promise<Avis[]> {
    try {
      const { data, error } = await supabase
        .from('avis')
        .select(`
          *,
          employee:employees!avis_employe_id_fkey(id, nom, prenom, email, poste),
          partner:partners(id, nom, type)
        `)
        .or(`commentaire.ilike.%${searchTerm}%,employee.nom.ilike.%${searchTerm}%,employee.prenom.ilike.%${searchTerm}%,partner.nom.ilike.%${searchTerm}%`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur lors de la recherche d\'avis:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Erreur avisService.search:', error);
      throw error;
    }
  },

  // Filtrer par partenaire
  async getByPartner(partnerId: string): Promise<Avis[]> {
    try {
      const { data, error } = await supabase
        .from('avis')
        .select(`
          *,
          employee:employees!avis_employe_id_fkey(id, nom, prenom, email, poste),
          partner:partners(id, nom, type)
        `)
        .eq('partner_id', partnerId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur lors de la récupération des avis par partenaire:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Erreur avisService.getByPartner:', error);
      throw error;
    }
  },

  // Filtrer par employé
  async getByEmployee(employeeId: string): Promise<Avis[]> {
    try {
      const { data, error } = await supabase
        .from('avis')
        .select(`
          *,
          employee:employees!avis_employe_id_fkey(id, nom, prenom, email, poste),
          partner:partners(id, nom, type)
        `)
        .eq('employee_id', employeeId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur lors de la récupération des avis par employé:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Erreur avisService.getByEmployee:', error);
      throw error;
    }
  },

  // Récupérer les statistiques des avis
  async getStatistics(): Promise<AvisStats> {
    try {
      // Récupérer tous les avis avec les relations
      const { data: avis, error } = await supabase
        .from('avis')
        .select(`
          *,
          employee:employees(id, nom, prenom),
          partner:partners(id, nom)
        `);

      if (error) {
        console.error('Erreur lors de la récupération des avis pour stats:', error);
        throw error;
      }

      const avisList = avis || [];

      // Calculer les statistiques
      const total_avis = avisList.length;
      const moyenne_note = total_avis > 0 
        ? avisList.reduce((sum, avis) => sum + avis.note, 0) / total_avis 
        : 0;
      
      const avis_positifs = avisList.filter(avis => avis.type_retour === 'positif').length;
      const avis_negatifs = avisList.filter(avis => avis.type_retour === 'negatif').length;
      const avis_approuves = avisList.filter(avis => avis.approuve).length;
      const avis_en_attente = avisList.filter(avis => !avis.approuve).length;

      // Répartition par notes
      const repartition_notes = Array.from({ length: 5 }, (_, i) => {
        const note = i + 1;
        const count = avisList.filter(avis => avis.note === note).length;
        return { note, count };
      });

      // Répartition par partenaire
      const partnerStats = new Map();
      avisList.forEach(avis => {
        if (avis.partner_id && avis.partner) {
          if (!partnerStats.has(avis.partner_id)) {
            partnerStats.set(avis.partner_id, {
              partenaire_id: avis.partner_id,
              partenaire_nom: avis.partner.nom,
              count: 0,
              total_note: 0
            });
          }
          const stats = partnerStats.get(avis.partner_id);
          stats.count++;
          stats.total_note += avis.note;
        }
      });

      const repartition_par_partenaire = Array.from(partnerStats.values()).map(stats => ({
        partenaire_id: stats.partenaire_id,
        partenaire_nom: stats.partenaire_nom,
        count: stats.count,
        moyenne: stats.count > 0 ? Math.round((stats.total_note / stats.count) * 10) / 10 : 0
      }));

      // Répartition par employé
      const employeeStats = new Map();
      avisList.forEach(avis => {
        if (avis.employee_id && avis.employee) {
          if (!employeeStats.has(avis.employee_id)) {
            employeeStats.set(avis.employee_id, {
              employee_id: avis.employee_id,
              employee_nom: `${avis.employee.prenom} ${avis.employee.nom}`,
              count: 0,
              total_note: 0
            });
          }
          const stats = employeeStats.get(avis.employee_id);
          stats.count++;
          stats.total_note += avis.note;
        }
      });

      const repartition_par_employe = Array.from(employeeStats.values()).map(stats => ({
        employee_id: stats.employee_id,
        employee_nom: stats.employee_nom,
        count: stats.count,
        moyenne: stats.count > 0 ? Math.round((stats.total_note / stats.count) * 10) / 10 : 0
      }));

      return {
        total_avis,
        moyenne_note: Math.round(moyenne_note * 10) / 10,
        avis_positifs,
        avis_negatifs,
        avis_approuves,
        avis_en_attente,
        repartition_notes,
        repartition_par_partenaire,
        repartition_par_employe
      };
    } catch (error) {
      console.error('Erreur avisService.getStatistics:', error);
      throw error;
    }
  }
}; 
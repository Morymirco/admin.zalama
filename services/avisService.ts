import { createClient } from '@supabase/supabase-js';

// Configuration Supabase - Utiliser les mêmes clés que les autres services qui fonctionnent
const supabaseUrl = 'https://mspmrzlqhwpdkkburjiw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zcG1yemxxaHdwZGtrYnVyaml3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3ODcyNTgsImV4cCI6MjA2NjM2MzI1OH0.zr-TRpKjGJjW0nRtsyPcCLy4Us-c5tOGX71k5_3JJd0';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Avis {
  id: string;
  note: number;
  commentaire: string;
  type_retour: string;
  date_avis: string;
  approuve: boolean;
  created_at: string;
  updated_at: string;
  partner_id?: string;
  employee_id?: string;
  partner?: { id: string; nom: string };
  employee?: { id: string; nom: string; prenom: string };
  // ... autres champs si besoin
}

export interface AvisStats {
  total_avis: number;
  moyenne_note: number;
  avis_positifs: number;
  avis_negatifs: number;
  avis_approuves: number;
  avis_en_attente: number;
  repartition_notes: Array<{ note: number; count: number }>;
  repartition_par_partenaire: Array<{
    partenaire_id: string;
    partenaire_nom: string;
    count: number;
    moyenne: number;
  }>;
  repartition_par_employe: Array<{
    employee_id: string;
    employee_nom: string;
    count: number;
    moyenne: number;
  }>;
}

class AvisService {
  async getLastAvis(limit = 3): Promise<Avis[]> {
    const { data, error } = await supabase
      .from('avis')
      .select('*')
      .order('date_avis', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data || [];
  }

  async getAll(): Promise<Avis[]> {
    const { data, error } = await supabase
      .from('avis')
      .select('*')
      .order('date_avis', { ascending: false });
    
    if (error) throw error;
    
    // Enrichir avec les noms des partenaires et employés
    const avisWithNames = await this.enrichAvisWithNames(data || []);
    return avisWithNames;
  }

  async enrichAvisWithNames(avisList: Avis[]): Promise<Avis[]> {
    // Récupérer les IDs uniques
    const partnerIds = [...new Set(avisList.filter(avis => avis.partner_id).map(avis => avis.partner_id))];
    const employeeIds = [...new Set(avisList.filter(avis => avis.employee_id).map(avis => avis.employee_id))];

    // Récupérer les partenaires
    const partnerNames = new Map();
    if (partnerIds.length > 0) {
      const { data: partners, error: partnerError } = await supabase
        .from('partners')
        .select('id, nom')
        .in('id', partnerIds);
      
      if (!partnerError && partners) {
        partners.forEach(partner => {
          partnerNames.set(partner.id, partner);
        });
      }
    }

    // Récupérer les employés
    const employeeNames = new Map();
    if (employeeIds.length > 0) {
      const { data: employees, error: employeeError } = await supabase
        .from('employees')
        .select('id, nom, prenom')
        .in('id', employeeIds);
      
      if (!employeeError && employees) {
        employees.forEach(employee => {
          employeeNames.set(employee.id, employee);
        });
      }
    }

    // Enrichir les avis avec les noms
    return avisList.map(avis => ({
      ...avis,
      partner: avis.partner_id ? partnerNames.get(avis.partner_id) : undefined,
      employee: avis.employee_id ? employeeNames.get(avis.employee_id) : undefined
    }));
  }

  async getStatistics(): Promise<AvisStats> {
    try {
      const response = await fetch('/api/avis/statistics');
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des statistiques');
      }
      
      const result = await response.json();
      return result.statistics;
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      // Retourner des valeurs par défaut en cas d'erreur
      return {
        total_avis: 0,
        moyenne_note: 0,
        avis_positifs: 0,
        avis_negatifs: 0,
        avis_approuves: 0,
        avis_en_attente: 0,
        repartition_notes: [],
        repartition_par_partenaire: [],
        repartition_par_employe: []
      };
    }
  }

  async create(data: Omit<Avis, 'id' | 'created_at' | 'updated_at'>): Promise<Avis> {
    const { data: newAvis, error } = await supabase
      .from('avis')
      .insert([data])
      .select()
      .single();
    
    if (error) throw error;
    return newAvis;
  }

  async update(id: string, data: Partial<Omit<Avis, 'id' | 'created_at' | 'updated_at'>>): Promise<Avis> {
    const { data: updatedAvis, error } = await supabase
      .from('avis')
      .update(data)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return updatedAvis;
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('avis')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  async toggleApproval(id: string, approuve: boolean): Promise<Avis> {
    return this.update(id, { approuve });
  }

  async search(searchTerm: string): Promise<Avis[]> {
    const { data, error } = await supabase
      .from('avis')
      .select('*')
      .ilike('commentaire', `%${searchTerm}%`)
      .order('date_avis', { ascending: false });
    
    if (error) throw error;
    
    // Enrichir avec les noms
    const avisWithNames = await this.enrichAvisWithNames(data || []);
    return avisWithNames;
  }

  async getByPartner(partnerId: string): Promise<Avis[]> {
    const { data, error } = await supabase
      .from('avis')
      .select('*')
      .eq('partner_id', partnerId)
      .order('date_avis', { ascending: false });
    
    if (error) throw error;
    
    // Enrichir avec les noms
    const avisWithNames = await this.enrichAvisWithNames(data || []);
    return avisWithNames;
  }

  async getByEmployee(employeeId: string): Promise<Avis[]> {
    const { data, error } = await supabase
      .from('avis')
      .select('*')
      .eq('employee_id', employeeId)
      .order('date_avis', { ascending: false });
    
    if (error) throw error;
    
    // Enrichir avec les noms
    const avisWithNames = await this.enrichAvisWithNames(data || []);
    return avisWithNames;
  }
}

export const avisService = new AvisService(); 
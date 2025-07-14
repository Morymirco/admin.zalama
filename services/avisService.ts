import { supabase } from '@/lib/supabase';

export interface Avis {
  id: string;
  note: number;
  commentaire: string;
  type_retour: string;
  date_avis: string;
  approuve: boolean;
  created_at: string;
  updated_at: string;
  // ... autres champs si besoin
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

  async getAllAvis(): Promise<Avis[]> {
    const { data, error } = await supabase
      .from('avis')
      .select('*')
      .order('date_avis', { ascending: false });
    if (error) throw error;
    return data || [];
  }
}

export const avisService = new AvisService(); 
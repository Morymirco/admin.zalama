import { createSupabaseService } from './supabaseService';

// Interface pour les objectifs (à adapter selon vos besoins)
export interface Objectif {
  id: string;
  titre: string;
  description?: string;
  valeur_cible: number;
  valeur_actuelle: number;
  unite: string;
  date_creation: string;
  date_fin?: string;
  statut: 'en_cours' | 'atteint' | 'en_retard';
  created_at: string;
  updated_at: string;
}

const objectifsService = createSupabaseService<Objectif>('objectifs');

export { objectifsService }; 
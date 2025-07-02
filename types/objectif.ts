export interface Objectif {
  id: string;
  nom: string;
  description?: string;
  type: 'financier' | 'utilisateur' | 'partenaire' | 'service';
  valeur_cible: number;
  valeur_actuelle: number;
  unite: string;
  periode: 'quotidien' | 'hebdomadaire' | 'mensuel' | 'trimestriel' | 'annuel';
  date_debut: string;
  date_fin: string;
  statut: 'en_cours' | 'atteint' | 'depasse' | 'en_retard';
  priorite: 'basse' | 'moyenne' | 'haute';
  created_at: string;
  updated_at: string;
}

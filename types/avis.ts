export interface Avis {
  id: string;
  employee_id?: string;
  partner_id?: string;
  note: number;
  commentaire?: string;
  type_retour?: 'positif' | 'negatif';
  date_avis: string;
  approuve: boolean;
  created_at: string;
  updated_at: string;
  
  // Relations (optionnelles)
  employee?: {
    id: string;
    nom: string;
    prenom: string;
    email: string;
    poste: string;
  };
  partner?: {
    id: string;
    nom: string;
    type: string;
  };
}

export interface AvisStats {
  total_avis: number;
  moyenne_note: number;
  avis_positifs: number;
  avis_negatifs: number;
  avis_approuves: number;
  avis_en_attente: number;
  repartition_notes: {
    note: number;
    count: number;
  }[];
  repartition_par_partenaire: {
    partenaire_id: string;
    partenaire_nom: string;
    count: number;
    moyenne: number;
  }[];
  repartition_par_employe: {
    employee_id: string;
    employee_nom: string;
    count: number;
    moyenne: number;
  }[];
} 
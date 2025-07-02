export interface Representant {
  email: string;
  id: string;
  nom: string;
  phoneNumber: string;
  telephone: string;
}

export interface RH {
  email: string;
  id: string;
  nom: string;
  phoneNumber: string;
  telephone: string;
}

export interface Partenaire {
  id: string;
  nom: string;
  type: string;
  secteur: string;
  description?: string;
  
  // Représentant
  nom_representant?: string;
  email_representant?: string;
  telephone_representant?: string;
  
  // Responsable RH
  nom_rh?: string;
  email_rh?: string;
  telephone_rh?: string;
  
  // Informations légales
  rccm?: string;
  nif?: string;
  email: string;
  telephone: string;
  adresse?: string;
  site_web?: string;
  
  // Autres
  logo_url?: string;
  date_adhesion: string;
  actif: boolean;
  nombre_employes: number;
  salaire_net_total: number;
  
  created_at: string;
  updated_at: string;
}

export interface Employe {
  id: string;
  partner_id: string;
  user_id?: string;  // Référence vers l'UID de Supabase Auth
  nom: string;
  prenom: string;
  genre: 'Homme' | 'Femme' | 'Autre';
  email?: string;
  telephone?: string;
  adresse?: string;
  poste: string;
  role?: string;
  type_contrat: 'CDI' | 'CDD' | 'Consultant' | 'Stage' | 'Autre';
  salaire_net?: number;
  date_embauche?: string;
  actif: boolean;
  photo_url?: string;  // URL de la photo de l'employé
  user_id?: string;
  created_at: string;
  updated_at: string;
}

export interface PartenaireAvecEmployes extends Partenaire {
  employees?: Employe[];
}

export interface StatistiquesPartenaire {
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
}

export interface Employee {
  id: string;
  partner_id?: string;
  nom: string;
  prenom: string;
  genre: string;
  email?: string;
  telephone?: string;
  adresse?: string;
  poste: string;
  role?: string;
  type_contrat: string;
  salaire_net?: number;
  date_embauche?: string;
  actif: boolean;
  photo_url?: string;
  created_at?: string;
  updated_at?: string;
  user_id?: string;
}

export interface Partner {
  id: string;
  nom: string;
  type: string;
  secteur: string;
  description?: string;
  nom_representant?: string;
  email_representant?: string;
  telephone_representant?: string;
  nom_rh?: string;
  email_rh?: string;
  telephone_rh?: string;
  rccm?: string;
  nif?: string;
  email?: string;
  telephone?: string;
  adresse?: string;
  site_web?: string;
  logo_url?: string;
  date_adhesion?: string;
  actif: boolean;
  nombre_employes: number;
  salaire_net_total?: number;
  created_at?: string;
  updated_at?: string;
  poste_representant?: string;
}

export interface Service {
  id: string;
  nom: string;
  description?: string;
  categorie: string;
  frais_attribues?: number;
  pourcentage_max?: number;
  duree?: string;
  disponible: boolean;
  image_url?: string;
  date_creation?: string;
  created_at?: string;
  updated_at?: string;
}

export interface FinancialTransaction {
  id: string;
  montant: number;
  type: string;
  description?: string;
  partenaire_id?: string;
  utilisateur_id?: string;
  service_id?: string;
  statut: string;
  date_transaction?: string;
  date_validation?: string;
  reference?: string;
  created_at?: string;
  updated_at?: string;
  transaction_id?: number;
} 
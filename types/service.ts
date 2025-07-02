export interface Service {
  id: string;
  nom: string;
  description?: string;
  categorie: string;
  prix: number;
  duree?: string;
  disponible: boolean;
  image_url?: string;
  date_creation: string;
  created_at: string;
  updated_at: string;
}

// Type UIService avec createdAt optionnel pour la compatibilité
export type UIService = Omit<Service, 'createdAt'> & {
  dateCreation?: string;
  createdAt?: Timestamp;
  fraisAttribues?: number;
  pourcentageMax?: number;
};

export type ServiceFormData = Omit<Service, 'id' | 'createdAt' | 'date_creation'>;

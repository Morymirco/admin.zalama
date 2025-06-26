import { Timestamp } from 'firebase/firestore';

export interface Service {
  id: string;
  nom: string;
  description: string;
  categorie: string;
  pourcentage_max: number;
  duree: string;
  disponible: boolean;
  frais_attribues?: number;
  image_url?: string;
  date_creation?: Date;
  createdAt?: Timestamp;
}

// Type UIService avec createdAt optionnel pour la compatibilité
export type UIService = Omit<Service, 'createdAt'> & {
  dateCreation?: string;
  createdAt?: Timestamp;
  fraisAttribues?: number;
  pourcentageMax?: number;
};

export type ServiceFormData = Omit<Service, 'id' | 'createdAt' | 'date_creation'>;

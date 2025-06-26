import { Timestamp } from 'firebase/firestore';

export interface Service {
  id: string;
  nom: string;
  description: string;
  categorie: string;
  pourcentageMax: number;
  duree: string;
  disponible: boolean;
  fraisAttribues?: number; // Frais en FG
  createdAt: Timestamp;
}

// Type UIService avec createdAt optionnel pour la compatibilité
export type UIService = Omit<Service, 'createdAt'> & {
  dateCreation?: string; // Optionnel pour la compatibilité avec l'ancien code
  createdAt?: Timestamp; // Rendre createdAt optionnel
};

export type ServiceFormData = Omit<Service, 'id' | 'createdAt'>;

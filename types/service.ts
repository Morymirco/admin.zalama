import { Timestamp } from 'firebase/firestore';

export interface Service {
  id: string;
  nom: string;
  description: string;
  categorie: string;
  pourcentageMax: number;
  duree: string;
  disponible: boolean;
  createdAt: Timestamp;
}

export type ServiceFormData = Omit<Service, 'id' | 'createdAt'>;

import { Timestamp } from 'firebase/firestore';

export interface Alerte {
  id: string;
  titre: string;
  description: string;
  type: 'Critique' | 'Importante' | 'Information';
  statut: 'Résolue' | 'En cours' | 'Nouvelle';
  dateCreation: Timestamp;
  dateResolution?: Timestamp;
  source: string;
  assigneA?: string;
}

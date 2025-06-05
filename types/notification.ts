import { Timestamp } from 'firebase/firestore';

export interface Notification {
  id: string;
  titre: string;
  message: string;
  type: string;
  dateCreation: Timestamp;
  lue: boolean;
  lienId?: string;
  destinataireId?: string;
  priorite?: 'basse' | 'normale' | 'haute';
}

import { Timestamp } from 'firebase/firestore';

export type NotificationType = 'info' | 'warning' | 'success' | 'error';

export interface Notification {
  id: string;
  titre: string;
  message: string;
  type: string;
  dateCreation: Timestamp | string;
  lue: boolean;
  lienId?: string;
  destinataireId?: string;
  priorite?: 'basse' | 'normale' | 'haute';
}

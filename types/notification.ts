export interface Notification {
  id: string;
  titre: string;
  message: string;
  type: string;
  dateCreation: string;
  lue: boolean;
  lienId?: string;
  destinataireId?: string;
  priorite?: 'basse' | 'normale' | 'haute';
}

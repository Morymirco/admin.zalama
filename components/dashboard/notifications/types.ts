export interface Notification {
  id: string;
  user_id: string;
  titre: string;
  message?: string;
  type: 'Information' | 'Alerte' | 'Succès' | 'Erreur';
  lu: boolean;
  date_creation: string; // ISO string au lieu de Timestamp
  date_lecture?: string; // ISO string au lieu de Timestamp
}

export type NotificationType = 'Information' | 'Alerte' | 'Succès' | 'Erreur';

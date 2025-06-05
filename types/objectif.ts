import { Timestamp } from 'firebase/firestore';

export interface Objectif {
  id: string;
  nom: string;
  description?: string;
  valeurCible: number;
  valeurActuelle: number;
  unite: string;
  categorie: 'financier' | 'utilisateur' | 'partenariat' | 'performance' | 'autre';
  dateDebut: Timestamp;
  dateFin: Timestamp;
  statut: 'en cours' | 'atteint' | 'non atteint' | 'annule';
  responsableId?: string;
  equipeId?: string;
  metadata?: Record<string, any>;
}

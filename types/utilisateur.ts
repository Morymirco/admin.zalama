import { Timestamp } from 'firebase/firestore';

// Dans ListeUtilisateurs.tsx
export interface Utilisateur {
  id: string;
  displayName: string;
  email: string;
  phoneNumber: string;
  role: 'admin' | 'user' | 'manager' | 'rh';
  poste: string;
  departement: string;
  active: boolean;
  type: string;
  partenaireId: string;
  createdAt: any;
  lastLogin?: any;
  photoURL?: string;
  etablissement?: string;
  niveauEtudes?: string;
  organization?: string;
  address?: string;
  dateNaissance?: Timestamp;
  sexe?: string;
  region?: string;
  note?: number;
}
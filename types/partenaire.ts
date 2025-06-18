import { Timestamp } from 'firebase/firestore';

export interface Representant {
  email: string;
  id: string;
  nom: string;
  phoneNumber: string;
  telephone: string;
}

export interface RH {
  email: string;
  id: string;
  nom: string;
  phoneNumber: string;
  telephone: string;
}

export interface Partenaire {
  id: string;
  nom: string;
  type: string;
  email: string;
  telephone: string;
  adresse: string;
  actif: boolean;
  dateCreation: Timestamp;
  updatedAt?: Timestamp;
  datePartenariat?: string;
  logo?: string;
  secteur: string;
  description?: string;
  statut?: string;
  siteWeb?: string;
  totalEmployes?: number;
  representant?: Representant;
  rh?: RH;
  infoLegales?: {
    nif: string;
    rccm: string;
  };
  nif?: string;
  rccm?: string;
}

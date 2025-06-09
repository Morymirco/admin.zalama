import { Timestamp } from 'firebase/firestore';

export interface PartnerRequest {
  id: string;
  nomEntreprise: string;
  secteur: string;
  email: string;
  telephone: string;
  adresse: string;
  dateCreation: Timestamp;
  statut: 'en attente' | 'approuvée' | 'rejetée';
  nomContact: string;
  posteContact: string;
  emailContact: string;
  telephoneContact: string;
  description?: string;
  nombreEmployes?: number;
  siteWeb?: string;
  documents?: string[];
  commentaire?: string;
  traiteParId?: string;
  dateTraitement?: Timestamp;
}

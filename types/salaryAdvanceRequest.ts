import { Timestamp } from 'firebase/firestore';

export interface SalaryAdvanceRequest {
  id: string;
  utilisateurId: string;
  montant: number;
  devise: string;
  dateCreation: Timestamp;
  dateTraitement?: Timestamp;
  statut: 'en attente' | 'approuvée' | 'rejetée' | 'annulée' | 'traitée';
  motif?: string;
  commentaire?: string;
  partenaireId?: string;
  traiteParId?: string;
  referencePaiement?: string;
  methodePaiement?: string;
  documents?: string[];
}

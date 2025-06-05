import { Timestamp } from 'firebase/firestore';

export interface Transaction {
  id: string;
  montant: number;
  devise: string;
  type: 'p2p' | 'salaire' | 'avance' | 'autre' | 'entree' | 'sortie' | 'credit' | 'debit';
  statut: 'en cours' | 'completee' | 'annulee' | 'echouee';
  dateTransaction: Timestamp;
  utilisateurId: string;
  partenaireId?: string;
  description?: string;
  frais?: number;
  reference?: string;
  methodePaiement?: string;
  service?: string;
  metadata?: Record<string, any>;
}

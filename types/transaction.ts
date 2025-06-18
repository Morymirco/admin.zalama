import { Timestamp } from 'firebase/firestore';

export interface Transaction {
  id: string;
  montant: number;
  type: 'revenu' | 'depense' | 'p2p' | 'salaire' | 'avance' | 'autre' | 'entree' | 'sortie' | 'credit' | 'debit';
  statut: 'EFFECTUEE' | 'complete' | 'en cours' | 'annulee' | 'echouee';
  dateCreation?: string;
  dateTransaction: string | Timestamp;
  description?: string;
  categorie?: string;
  date?: string;
  
  // Champs spécifiques aux avances de salaire
  demandeAvanceId?: string;
  employeEmail?: string;
  employeId?: string;
  employeNom?: string;
  employePrenom?: string;
  entrepriseEmailRH?: string;
  entrepriseId?: string;
  entrepriseNom?: string;
  methodePaiement?: string;
  numeroCompte?: string;
  numeroTransaction?: string;
  recu?: string;
  
  // Champs optionnels de l'ancien modèle
  devise?: string;
  utilisateurId?: string;
  partenaireId?: string;
  frais?: number;
  reference?: string;
  service?: string;
  metadata?: Record<string, any>;
}

import { Timestamp } from 'firebase/firestore';

// Type pour les demandes d'avance sur salaire (correspond à la table demandes_avance_salaire)
export interface DemandeAvanceSalaire {
  id: string;
  employe_id: string;
  montant_demande: number;
  motif: string;
  date_demande: Date;
  statut: 'EN_ATTENTE' | 'APPROUVE' | 'REFUSE' | 'PAYE';
  commentaire?: string;
  date_traitement?: Date;
  numero_reception?: string;
  created_at: Date;
  updated_at: Date;
  
  // Relations (pour l'affichage)
  employe?: {
    id: string;
    nom: string;
    prenom: string;
    email: string;
    poste: string;
    salaire_net: number;
  };
  entreprise?: {
    id: string;
    nom: string;
    email: string;
    email_rh: string;
  };
}

// Type pour les transactions (correspond à la table transactions)
export interface Transaction {
  id: string;
  demande_avance_id: string;
  employe_id: string;
  entreprise_id: string;
  montant: number;
  numero_transaction: string;
  methode_paiement: 'VIREMENT_BANCAIRE' | 'MOBILE_MONEY' | 'ESPECES' | 'CHEQUE';
  numero_compte?: string;
  numero_reception?: string;
  date_transaction: Date;
  recu_url?: string;
  date_creation: Date;
  statut: 'EFFECTUEE' | 'ANNULEE';
  created_at: Date;
  updated_at: Date;
  
  // Relations (pour l'affichage)
  employe?: {
    id: string;
    nom: string;
    prenom: string;
    email: string;
  };
  entreprise?: {
    id: string;
    nom: string;
    email: string;
    email_rh: string;
  };
  demande_avance?: DemandeAvanceSalaire;
}

// Type pour les statistiques des demandes
export interface DemandesStatistiques {
  total_demandes: number;
  demandes_en_attente: number;
  demandes_approvees: number;
  demandes_refusees: number;
  demandes_payees: number;
  montant_total_demande: number;
  montant_moyen_demande: number;
}

// Type pour les statistiques des transactions
export interface TransactionsStatistiques {
  total_transactions: number;
  transactions_effectuees: number;
  transactions_annulees: number;
  montant_total_transactions: number;
  montant_moyen_transaction: number;
}

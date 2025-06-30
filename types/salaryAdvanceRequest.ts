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

export type TransactionStatus = 'En attente' | 'Validé' | 'Rejeté' | 'Annulé';
export type PaymentMethod = 'Mobile Money' | 'Virement bancaire' | 'Espèces' | 'Chèque';
export type TransactionStatut = 'EFFECTUEE' | 'EN_COURS' | 'ECHEC' | 'ANNULEE';

export interface SalaryAdvanceRequest {
  id: string;
  employe_id: string;
  partenaire_id: string;
  montant_demande: number;
  type_motif: string;
  motif: string;
  numero_reception?: string;
  frais_service: number;
  montant_total: number;
  salaire_disponible?: number;
  avance_disponible?: number;
  statut: TransactionStatus;
  date_creation: Date;
  date_validation?: Date;
  date_rejet?: Date;
  motif_rejet?: string;
  created_at: Date;
  updated_at: Date;
  // Relations
  employe?: Employee;
  partenaire?: Partner;
  transactions?: Transaction[];
}

export interface Transaction {
  id: string;
  demande_avance_id?: string;
  employe_id: string;
  entreprise_id: string;
  montant: number;
  numero_transaction: string;
  methode_paiement: PaymentMethod;
  numero_compte?: string;
  numero_reception?: string;
  date_transaction: Date;
  recu_url?: string;
  date_creation: Date;
  statut: TransactionStatut;
  created_at: Date;
  updated_at: Date;
  // Relations
  employe?: Employee;
  entreprise?: Partner;
  demande_avance?: SalaryAdvanceRequest;
}

export interface Employee {
  id: string;
  nom: string;
  prenom: string;
  email?: string;
  telephone?: string;
  poste: string;
  salaire_net?: number;
  partner_id?: string;
}

export interface Partner {
  id: string;
  nom: string;
  type: string;
  secteur: string;
  email?: string;
  telephone?: string;
}

export interface SalaryAdvanceRequestFormData {
  employe_id: string;
  partenaire_id: string;
  montant_demande: number;
  type_motif: string;
  motif: string;
  frais_service?: number;
  montant_total: number;
  salaire_disponible?: number;
  avance_disponible?: number;
}

export interface TransactionFormData {
  demande_avance_id?: string;
  employe_id: string;
  entreprise_id: string;
  montant: number;
  methode_paiement: PaymentMethod;
  numero_compte?: string;
  numero_reception?: string;
  recu_url?: string;
}

// Types pour l'interface utilisateur
export interface UISalaryAdvanceRequest extends Omit<SalaryAdvanceRequest, 'date_creation' | 'date_validation' | 'date_rejet' | 'created_at' | 'updated_at'> {
  dateCreation: string;
  dateValidation?: string;
  dateRejet?: string;
  createdAt: string;
  updatedAt: string;
  employeNom?: string;
  partenaireNom?: string;
  statutColor?: string;
  statutIcon?: string;
}

export interface UITransaction extends Omit<Transaction, 'date_transaction' | 'date_creation' | 'created_at' | 'updated_at'> {
  dateTransaction: string;
  dateCreation: string;
  createdAt: string;
  updatedAt: string;
  employeNom?: string;
  entrepriseNom?: string;
  statutColor?: string;
  statutIcon?: string;
}

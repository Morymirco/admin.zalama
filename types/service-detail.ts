import { Timestamp } from 'firebase/firestore';

export interface ServiceDetail {
  id: string;
  nom: string;
  description: string;
  responsable: string;
  emailResponsable: string;
  telephoneResponsable: string;
  dateCreation: string | Timestamp;
  actif: boolean;
  nombreDemandes: number;
  nombreTransactions: number;
  montantTotal: number;
  logo?: string;
  categorie?: string;
  statut: 'actif' | 'inactif' | 'en_maintenance';
  derniereMiseAJour?: string | Timestamp;
  // Propriétés de base du service
  pourcentageMax?: number;
  duree?: string;
  disponible?: boolean;
  createdAt?: Timestamp;
}

export interface DemandeService {
  id: string;
  reference: string;
  serviceId: string;
  serviceNom: string;
  demandeurId: string;
  demandeurNom: string;
  demandeurEmail: string;
  dateDemande: string | Timestamp;
  dateTraitement?: string | Timestamp;
  statut: 'EN_ATTENTE' | 'EN_COURS' | 'TRAITEE' | 'REJETEE' | 'ANNULEE';
  priorite: 'BASSE' | 'MOYENNE' | 'HAUTE' | 'URGENTE';
  description: string;
  commentaires?: string;
  documents?: Array<{
    nom: string;
    url: string;
    type: string;
  }>;
}

export interface TransactionService {
  id: string;
  reference: string;
  serviceId: string;
  serviceNom: string;
  demandeId: string;
  demandeurId: string;
  demandeurNom: string;
  demandeurEmail: string;
  montant: number;
  dateTransaction: string | Timestamp;
  statut: 'EN_ATTENTE' | 'VALIDEE' | 'REJETEE' | 'ANNULEE' | 'REMBOURSEE';
  typePaiement: string;
  referencePaiement?: string;
  justificatifUrl?: string;
  commentaire?: string;
}

export interface ServiceDetail {
  id: string;
  nom: string;
  description: string;
  responsable: string;
  emailResponsable: string;
  telephoneResponsable: string;
  dateCreation: string;
  actif: boolean;
  nombreDemandes: number;
  nombreTransactions: number;
  montantTotal: number;
  logo?: string;
  categorie: string;
  statut: 'actif' | 'inactif' | 'en_maintenance';
  derniereMiseAJour?: string;
  // Propriétés de base du service
  pourcentageMax?: number;
  duree: string;
  disponible: boolean;
  createdAt?: string;
  prix: number;
  dateModification?: string;
  imageUrl?: string;
}

export interface DemandeService {
  id: string;
  reference: string;
  serviceId: string;
  serviceNom: string;
  demandeurId: string;
  demandeurNom: string;
  demandeurEmail: string;
  dateDemande: string;
  dateTraitement?: string;
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
  dateTransaction: string;
  statut: 'EN_ATTENTE' | 'VALIDEE' | 'REJETEE' | 'ANNULEE' | 'REMBOURSEE';
  typePaiement: string;
  referencePaiement?: string;
  justificatifUrl?: string;
  commentaire?: string;
}

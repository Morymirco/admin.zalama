export interface Transaction {
  id: string;
  montant: number;
  type: 'Débloqué' | 'Récupéré' | 'Revenu' | 'Remboursement';
  description?: string;
  partenaire_id?: string;
  utilisateur_id?: string;
  service_id?: string;
  statut: 'En attente' | 'Validé' | 'Rejeté' | 'Annulé';
  date_transaction: string; // ISO string au lieu de Timestamp
  date_validation?: string; // ISO string au lieu de Timestamp
  reference?: string;
  created_at: string;
  updated_at: string;
}

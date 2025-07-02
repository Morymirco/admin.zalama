export interface PartnerRequest {
  id: string;
  nom_entreprise: string;
  email_contact: string;
  telephone_contact: string;
  nom_representant: string;
  secteur_activite: string;
  nombre_employes: number;
  description: string;
  statut: 'en_attente' | 'approuvee' | 'rejetee' | 'en_revision';
  date_demande: string;
  date_traitement?: string;
  commentaires?: string;
  created_at: string;
  updated_at: string;
}

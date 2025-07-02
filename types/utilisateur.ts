// Type pour les utilisateurs finaux (table users)
export interface Utilisateur {
  id: string;
  email: string;
  nom: string;
  prenom: string;
  telephone?: string;
  adresse?: string;
  type: 'Étudiant' | 'Salarié' | 'Entreprise';
  statut: 'Actif' | 'Inactif' | 'En attente';
  photo_url?: string;
  organisation?: string;
  poste?: string;
  niveau_etudes?: string;
  etablissement?: string;
  date_inscription: string;
  derniere_connexion?: string;
  actif: boolean;
  created_at: string;
  updated_at: string;
  
  // Propriétés pour la compatibilité UI (camelCase)
  displayName?: string; // Alias pour nom + prenom
  phoneNumber?: string; // Alias pour telephone
  active?: boolean; // Alias pour actif
  createdAt?: string; // ISO string au lieu de Timestamp
  lastLogin?: string; // Alias pour derniere_connexion
  photoURL?: string; // Alias pour photo_url
  organization?: string; // Alias pour organisation
  address?: string; // Alias pour adresse
  dateNaissance?: string; // ISO string au lieu de Timestamp
  sexe?: string;
  region?: string;
  note?: number;
  partenaireId?: string;
  role?: string;
  departement?: string;
}

// Type pour les administrateurs (table admin_users)
export interface AdminUser {
  id: string;
  email: string;
  display_name: string;
  role: 'admin' | 'user' | 'rh' | 'responsable';
  partenaire_id?: string;
  active: boolean;
  last_login?: string; // ISO string au lieu de Date
  created_at?: string; // ISO string au lieu de Date
  updated_at?: string; // ISO string au lieu de Date
}
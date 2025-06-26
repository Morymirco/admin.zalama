import { Timestamp } from 'firebase/firestore';

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
  date_inscription?: Date;
  derniere_connexion?: Date;
  actif: boolean;
  created_at?: Date;
  updated_at?: Date;
  
  // Propriétés pour la compatibilité UI (camelCase)
  displayName?: string; // Alias pour nom + prenom
  phoneNumber?: string; // Alias pour telephone
  active?: boolean; // Alias pour actif
  createdAt?: Timestamp; // Pour la compatibilité Firebase
  lastLogin?: any; // Alias pour derniere_connexion
  photoURL?: string; // Alias pour photo_url
  organization?: string; // Alias pour organisation
  address?: string; // Alias pour adresse
  dateNaissance?: Timestamp;
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
  last_login?: Date;
  created_at?: Date;
  updated_at?: Date;
}
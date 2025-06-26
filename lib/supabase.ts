import { createClient } from '@supabase/supabase-js'

// Configuration Supabase - Variables définies directement
const supabaseUrl = 'https://mspmrzlqhwpdkkburjiw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zcG1yemxxaHdwZGtrYnVyaml3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3ODcyNTgsImV4cCI6MjA2NjM2MzI1OH0.zr-TRpKjGJjW0nRtsyPcCLy4Us-c5tOGX71k5_3JJd0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types pour les données Supabase
export interface User {
  id: string
  email: string
  nom: string
  prenom: string
  telephone?: string
  adresse?: string
  type: 'Étudiant' | 'Salarié' | 'Entreprise'
  statut: 'Actif' | 'Inactif' | 'En attente'
  photo_url?: string
  organisation?: string
  poste?: string
  niveau_etudes?: string
  etablissement?: string
  date_inscription: string
  derniere_connexion?: string
  actif: boolean
  created_at: string
  updated_at: string
}

export interface Partner {
  id: string
  nom: string
  type: string
  secteur: string
  description?: string
  nom_representant?: string
  email_representant?: string
  telephone_representant?: string
  nom_rh?: string
  email_rh?: string
  telephone_rh?: string
  rccm?: string
  nif?: string
  email: string
  telephone: string
  adresse?: string
  site_web?: string
  logo_url?: string
  date_adhesion: string
  actif: boolean
  nombre_employes: number
  salaire_net_total: number
  created_at: string
  updated_at: string
}

export interface Employee {
  id: string
  partner_id: string
  nom: string
  prenom: string
  genre: 'Homme' | 'Femme' | 'Autre'
  email?: string
  telephone?: string
  adresse?: string
  poste: string
  role?: string
  type_contrat: 'CDI' | 'CDD' | 'Consultant' | 'Stage' | 'Autre'
  salaire_net?: number
  date_embauche?: string
  actif: boolean
  created_at: string
  updated_at: string
}

export interface Service {
  id: string
  nom: string
  description?: string
  categorie: string
  prix: number
  duree?: string
  disponible: boolean
  image_url?: string
  date_creation: string
  created_at: string
  updated_at: string
}

export interface Alert {
  id: string
  titre: string
  description?: string
  type: 'Critique' | 'Importante' | 'Information'
  statut: 'Résolue' | 'En cours' | 'Nouvelle'
  source?: string
  assigne_a?: string
  date_creation: string
  date_resolution?: string
  priorite: number
  created_at: string
  updated_at: string
}

export interface FinancialTransaction {
  id: string
  montant: number
  type: 'Débloqué' | 'Récupéré' | 'Revenu' | 'Remboursement'
  description?: string
  partenaire_id?: string
  utilisateur_id?: string
  service_id?: string
  statut: 'En attente' | 'Validé' | 'Rejeté' | 'Annulé'
  date_transaction: string
  date_validation?: string
  reference?: string
  created_at: string
  updated_at: string
}

export interface PerformanceMetric {
  id: string
  nom: string
  valeur: number
  unite?: string
  categorie?: string
  date_mesure: string
  periode: string
  created_at: string
}

export interface Notification {
  id: string
  user_id: string
  titre: string
  message?: string
  type: 'Information' | 'Alerte' | 'Succès' | 'Erreur'
  lu: boolean
  date_creation: string
  date_lecture?: string
} 
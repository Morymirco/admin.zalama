// =====================================================
// TYPES POUR LE SYSTÈME DE REMBOURSEMENT INTÉGRAL
// =====================================================
// Système basé sur les transactions réussies (statut EFFECTUEE)
// Paiement intégral unique (pas d'échéances)

// Types d'énumération pour les statuts et méthodes
export type RemboursementStatut = 
  | 'EN_ATTENTE' 
  | 'PAYE' 
  | 'EN_RETARD' 
  | 'ANNULE';

export type MethodeRemboursement = 
  | 'VIREMENT_BANCAIRE'
  | 'MOBILE_MONEY'
  | 'ESPECES'
  | 'CHEQUE'
  | 'PRELEVEMENT_SALAIRE'
  | 'COMPENSATION_AVANCE';

export type ActionHistorique = 
  | 'CREATION' 
  | 'PAIEMENT' 
  | 'MODIFICATION' 
  | 'ANNULEMENT';

// =====================================================
// INTERFACES PRINCIPALES
// =====================================================

// Interface principale pour un remboursement intégral
export interface Remboursement {
  id: string;
  
  // Références
  transaction_id: string; // Référence à la transaction EFFECTUEE
  demande_avance_id: string;
  employe_id: string;
  partenaire_id: string;
  
  // Montants (basés sur la transaction réussie)
  montant_transaction: number; // Montant de la transaction EFFECTUEE
  frais_service: number; // Frais de service (6.5%)
  montant_total_remboursement: number; // Montant total à rembourser (transaction + frais)
  
  // Informations de remboursement
  methode_remboursement: MethodeRemboursement;
  
  // Dates importantes
  date_creation: string;
  date_transaction_effectuee: string; // Date de la transaction réussie
  date_limite_remboursement: string; // Date limite pour le remboursement (30 jours)
  date_remboursement_effectue?: string; // Date du remboursement effectif
  
  // Statut et suivi
  statut: RemboursementStatut;
  
  // Informations de paiement
  numero_compte?: string;
  numero_reception?: string;
  reference_paiement?: string;
  numero_transaction_remboursement?: string;
  
  // Commentaires
  commentaire_partenaire?: string;
  commentaire_admin?: string;
  motif_retard?: string;
  
  // Métadonnées
  created_at: string;
  updated_at: string;
  
  // Relations (pour l'affichage)
  employe?: {
    id: string;
    nom: string;
    prenom: string;
    email: string;
    telephone: string;
  };
  partenaire?: {
    id: string;
    nom: string;
    email: string;
    email_rh: string;
    telephone: string;
  };
  demande_avance?: {
    id: string;
    montant_demande: number;
    motif: string;
    date_creation: string;
  };
  transaction?: {
    id: string;
    numero_transaction: string;
    methode_paiement: string;
    date_transaction: string;
    statut: string;
  };
  
  // Calculs
  jours_retard?: number; // Calculé automatiquement
}

// Interface pour l'historique des remboursements
export interface HistoriqueRemboursement {
  id: string;
  
  // Références
  remboursement_id: string;
  
  // Informations de l'action
  action: ActionHistorique;
  montant_avant?: number;
  montant_apres?: number;
  statut_avant?: string;
  statut_apres?: string;
  
  // Détails de l'action
  description: string;
  utilisateur_id?: string;
  
  // Métadonnées
  created_at: string;
  
  // Relations
  utilisateur?: {
    id: string;
    nom: string;
    prenom: string;
  };
}

// Interface pour les transactions réussies sans remboursement
export interface TransactionSansRemboursement {
  transaction_id: string;
  demande_avance_id: string;
  employe_id: string;
  employe_nom: string;
  employe_prenom: string;
  employe_email: string;
  partenaire_id: string;
  partenaire_nom: string;
  partenaire_email: string;
  partenaire_email_rh: string;
  montant: number;
  numero_transaction: string;
  methode_paiement: string;
  date_transaction: string;
  statut: string;
  created_at: string;
  motif: string;
  type_motif: string;
  frais_service: number;
  montant_total_remboursement: number; // Montant + frais
}

// =====================================================
// INTERFACES POUR LES FORMULAIRES
// =====================================================

// Données pour créer un remboursement (basé sur transaction)
export interface RemboursementFormData {
  transaction_id: string; // ID de la transaction EFFECTUEE
  demande_avance_id: string;
  employe_id: string;
  partenaire_id: string;
  montant_transaction: number; // Montant de la transaction réussie
  frais_service: number;
  methode_remboursement: MethodeRemboursement;
  commentaire_partenaire?: string;
}

// Données pour effectuer un remboursement intégral
export interface PaiementRemboursementData {
  remboursement_id: string;
  methode_remboursement: MethodeRemboursement;
  numero_transaction?: string;
  numero_reception?: string;
  reference_paiement?: string;
  commentaire?: string;
}

// =====================================================
// INTERFACES POUR LES STATISTIQUES
// =====================================================

// Statistiques de remboursement par partenaire
export interface StatistiquesRemboursementPartenaire {
  partenaire_id: string;
  partenaire_nom: string;
  total_remboursements: number;
  remboursements_en_attente: number;
  remboursements_payes: number;
  remboursements_en_retard: number;
  montant_total_transactions: number; // Basé sur les transactions réussies
  montant_total_a_rembourser: number; // Montant total à rembourser
  montant_total_rembourse: number; // Montant total remboursé
  montant_moyen_transaction: number;
  taux_remboursement: number;
  total_transactions_reussies: number;
  montant_total_transactions_reussies: number;
}

// Statistiques globales de remboursement
export interface StatistiquesRemboursementGlobales {
  total_remboursements: number;
  montant_total_transactions: number; // Basé sur les transactions réussies
  montant_total_a_rembourser: number; // Montant total à rembourser
  montant_total_rembourse: number; // Montant total remboursé
  taux_remboursement_global: number;
  remboursements_en_retard: number;
  montant_en_retard: number;
  total_transactions_reussies: number;
  transactions_sans_remboursement: number;
  par_statut: Record<RemboursementStatut, number>;
  par_methode: Record<MethodeRemboursement, number>;
  par_mois: Array<{
    mois: string;
    montant_transactions: number;
    montant_rembourse: number;
    nombre_remboursements: number;
  }>;
}

// =====================================================
// INTERFACES POUR LES FILTRES ET RECHERCHE
// =====================================================

// Filtres pour la recherche de remboursements
export interface FiltresRemboursement {
  partenaire_id?: string;
  employe_id?: string;
  statut?: RemboursementStatut;
  methode_remboursement?: MethodeRemboursement;
  date_debut?: string;
  date_fin?: string;
  montant_min?: number;
  montant_max?: number;
  en_retard?: boolean;
  recherche?: string; // Recherche textuelle
  transaction_id?: string; // Filtrer par transaction spécifique
}

// Options de tri pour les remboursements
export interface OptionsTriRemboursement {
  champ: 'date_creation' | 'montant_transaction' | 'montant_total_remboursement' | 'statut' | 'partenaire_nom' | 'employe_nom' | 'date_transaction_effectuee' | 'date_limite_remboursement';
  ordre: 'asc' | 'desc';
}

// =====================================================
// INTERFACES POUR LES NOTIFICATIONS
// =====================================================

// Données pour les notifications de remboursement
export interface NotificationRemboursement {
  type: 'remboursement_approche' | 'remboursement_retard' | 'remboursement_effectue' | 'nouveau_remboursement' | 'transaction_sans_remboursement';
  remboursement_id: string;
  transaction_id?: string;
  partenaire_id: string;
  employe_id: string;
  montant?: number;
  date_limite?: string;
  jours_retard?: number;
}

// =====================================================
// INTERFACES POUR LES RAPPORTS
// =====================================================

// Données pour un rapport de remboursement
export interface RapportRemboursement {
  periode: {
    debut: string;
    fin: string;
  };
  statistiques: StatistiquesRemboursementGlobales;
  remboursements_en_retard: Array<{
    id: string;
    employe_nom: string;
    partenaire_nom: string;
    montant_total_remboursement: number;
    jours_retard: number;
  }>;
  transactions_sans_remboursement: Array<{
    transaction_id: string;
    employe_nom: string;
    partenaire_nom: string;
    montant: number;
    date_transaction: string;
    jours_attente: number;
  }>;
  top_partenaires: Array<{
    partenaire_id: string;
    partenaire_nom: string;
    montant_total: number;
    taux_remboursement: number;
  }>;
  evolution_mensuelle: Array<{
    mois: string;
    nouvelles_transactions: number;
    remboursements_effectues: number;
    montant_transactions: number;
    montant_rembourse: number;
  }>;
}

// =====================================================
// INTERFACES POUR LES API RESPONSES
// =====================================================

// Réponse standard pour les opérations de remboursement
export interface ApiResponseRemboursement<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Réponse pour la création d'un remboursement
export interface CreateRemboursementResponse {
  remboursement: Remboursement;
  message: string;
}

// Réponse pour un paiement de remboursement intégral
export interface PaiementRemboursementResponse {
  remboursement: Remboursement;
  montant_rembourse: number;
  message: string;
}

// Réponse pour les transactions sans remboursement
export interface TransactionsSansRemboursementResponse {
  transactions: TransactionSansRemboursement[];
  total: number;
  message: string;
}

// =====================================================
// TYPES UTILITAIRES
// =====================================================

// Type pour les options de sélection
export interface Option {
  value: string;
  label: string;
  disabled?: boolean;
}

// Type pour les données de graphique
export interface DonneesGraphique {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
  }>;
}

// Type pour les métriques de tableau de bord
export interface MetriqueRemboursement {
  titre: string;
  valeur: number | string;
  unite?: string;
  variation?: number;
  couleur?: string;
  icone?: string;
}

// =====================================================
// INTERFACES POUR LES ACTIONS PARTENAIRE
// =====================================================

// Interface pour les actions que peut effectuer un partenaire
export interface ActionsPartenaire {
  peut_creer_remboursement: boolean;
  peut_effectuer_paiement: boolean;
  peut_modifier_remboursement: boolean;
  peut_annuler_remboursement: boolean;
  peut_voir_historique: boolean;
  peut_exporter_rapports: boolean;
}

// Interface pour les permissions de remboursement
export interface PermissionsRemboursement {
  partenaire_id: string;
  actions: ActionsPartenaire;
  limites?: {
    montant_max_remboursement: number;
    delai_max_remboursement: number; // en jours
  };
}

// =====================================================
// INTERFACES POUR LES REMBOURSEMENTS EN RETARD
// =====================================================

// Interface pour les remboursements en retard
export interface RemboursementEnRetard {
  id: string;
  transaction_id: string;
  employe_id: string;
  employe_nom: string;
  employe_prenom: string;
  partenaire_id: string;
  partenaire_nom: string;
  partenaire_email_rh: string;
  partenaire_telephone: string;
  montant_transaction: number;
  montant_total_remboursement: number;
  date_limite_remboursement: string;
  jours_retard: number;
}

// =====================================================
// ÉCHÉANCES DE REMBOURSEMENT
// =====================================================

// Interface pour une échéance de remboursement
export interface EcheanceRemboursement {
  id: string;
  remboursement_id: string;
  numero_echeance: number;
  montant_echeance: number;
  montant_paye: number;
  date_echeance: string;
  date_paiement?: string;
  statut: 'EN_ATTENTE' | 'PAYEE' | 'EN_RETARD' | 'ANNULEE';
  methode_paiement?: string;
  numero_transaction?: string;
  numero_reception?: string;
  commentaire?: string;
  created_at: string;
  updated_at?: string;
  remboursement?: Remboursement;
}

// Données pour créer une échéance
export interface EcheanceFormData {
  remboursement_id: string;
  numero_echeance: number;
  montant_echeance: number;
  date_echeance: string;
  commentaire?: string;
}

// Données pour payer une échéance
export interface PaiementEcheanceData {
  echeance_id: string;
  montant_paye: number;
  methode_paiement: string;
  numero_transaction: string;
  numero_reception?: string;
  commentaire?: string;
}

// Réponse pour un paiement d'échéance
export interface PaiementEcheanceResponse {
  echeance: EcheanceRemboursement;
  montant_paye: number;
  message: string;
}

// =====================================================
// INTÉGRATION LENGO PAY
// =====================================================

// Données pour l'initiation d'un paiement Lengo Pay
export interface PaiementLengoData {
  remboursement_id: string;
  amount: number;
  currency?: string; // Par défaut 'GNF'
}

// Réponse d'un paiement Lengo Pay
export interface PaiementLengoResponse {
  success: boolean;
  message: string;
  data: {
    pay_id: string;
    payment_url: string;
    amount: number;
    currency: string;
  };
}

// Données du callback Lengo Pay
export interface CallbackLengoData {
  pay_id: string;
  status: 'SUCCESS' | 'FAILED' | 'CANCELLED' | 'PENDING';
  amount: number;
  message: string;
  Client?: string;
}

// Configuration Lengo Pay
export interface LengoConfig {
  api_url: string;
  license_key: string;
  website_id: string;
  callback_url: string;
} 
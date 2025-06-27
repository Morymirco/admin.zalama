export interface PartnershipRequest {
  id: string;
  
  // Informations de l'entreprise (Étape 1)
  company_name: string;
  legal_status: string;
  rccm: string;
  nif: string;
  activity_domain: string;
  headquarters_address: string;
  phone: string;
  email: string;
  employees_count: number;
  payroll: string;
  cdi_count: number;
  cdd_count: number;
  payment_date: string;
  
  // Informations du représentant (Étape 2)
  rep_full_name: string;
  rep_position: string;
  rep_email: string;
  rep_phone: string;
  
  // Informations du responsable RH (Étape 3)
  hr_full_name: string;
  hr_email: string;
  hr_phone: string;
  agreement: boolean;
  
  // Statut et métadonnées
  status: 'pending' | 'approved' | 'rejected' | 'in_review';
  created_at: string;
  updated_at: string;
}

export interface PartnershipRequestStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  in_review: number;
  by_domain: {
    [key: string]: number;
  };
}

export interface PartnershipRequestFilters {
  status?: 'pending' | 'approved' | 'rejected' | 'in_review' | 'all';
  activity_domain?: string;
  search?: string;
} 
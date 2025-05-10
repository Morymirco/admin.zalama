// Types pour les partenaires et employés
export interface Employe {
  id: string;
  nom: string;
  prenom: string;
  genre: 'Homme' | 'Femme' | 'Autre';
  email: string;
  telephone: string;
  adresse: string;
  poste: string;
  role: string;
  typeContrat: 'CDI' | 'CDD' | 'Consultant' | 'Stage' | 'Autre';
  salaireNet: number;
  dateEmbauche: string;
}

export interface Partenaire {
  id: string;
  // Informations sur l'entreprise
  nom: string;
  type: string;
  secteur: string;
  description: string;
  
  // Représentant
  nomRepresentant: string;
  emailRepresentant: string;
  telephoneRepresentant: string;
  
  // Responsable RH
  nomRH: string;
  emailRH: string;
  telephoneRH: string;
  
  // Informations légales et contact
  rccm: string;
  nif: string;
  email: string;
  telephone: string;
  adresse: string;
  siteWeb: string;
  
  // Autres informations
  logo: string;
  dateAdhesion: string;
  actif: boolean;
  
  // Informations sur les employés
  nombreEmployes: number;
  employes: Employe[];
  salaireNetTotal: number;
  contratsCounts: Record<string, number>;
}

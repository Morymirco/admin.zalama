"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Building, Users, Briefcase, CreditCard, Calendar, Mail, Phone, MapPin, Globe, FileText, CheckCircle, XCircle, Edit, ArrowLeft, Download, Upload, UserPlus } from 'lucide-react';
import { Employe } from '@/components/dashboard/partenaires/types';
import ModaleModificationPartenaire from '@/components/dashboard/partenaires/ModaleModificationPartenaire';
import ModaleAjoutEmploye from '@/components/dashboard/partenaires/ModaleAjoutEmploye';
import toast from 'react-hot-toast';

// Types pour cette page
interface PartenaireDetail {
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

export default function PartenaireDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [partenaire, setPartenaire] = useState<PartenaireDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'infos' | 'employes'>('infos');
  const [showImportModal, setShowImportModal] = useState(false);
  const [showModificationModal, setShowModificationModal] = useState(false);
  const [showAjoutEmployeModal, setShowAjoutEmployeModal] = useState(false);

  // Récupération des données du partenaire
  useEffect(() => {
    const fetchPartenaire = async () => {
      setIsLoading(true);
      
      // Simulation d'une requête API (à remplacer par une vraie requête)
      setTimeout(() => {
        // Données fictives pour la démo en fonction de l'ID
        const mockPartenaires = {
          '1': {
            id: '1',
            nom: 'Banque Centrale de Guinée',
            type: 'Institution financière',
            secteur: 'Finance',
            description: 'Banque centrale et régulateur financier de la Guinée, chargée de la politique monétaire et de la supervision du secteur bancaire.',
            
            nomRepresentant: 'Karamo Kaba',
            emailRepresentant: 'k.kaba@bcg.gov.gn',
            telephoneRepresentant: '+224 622 123 456',
            
            nomRH: 'Fatoumata Sylla',
            emailRH: 'f.sylla@bcg.gov.gn',
            telephoneRH: '+224 622 456 789',
            
            rccm: 'RCCM/GN/1960/A/001',
            nif: 'NIF100000001',
            email: 'contact@bcg.gov.gn',
            telephone: '+224 123 456 789',
            adresse: 'Boulevard du Commerce, Conakry, Guinée',
            siteWeb: 'www.bcg.gov.gn',
            
            logo: '/images/partners/bcg.png',
            dateAdhesion: '2023-01-15',
            actif: true,
            
            nombreEmployes: 5,
            employes: [
              {
                id: '1',
                nom: 'Barry',
                prenom: 'Mamadou',
                genre: 'Homme',
                email: 'm.barry@bcg.gov.gn',
                telephone: '+224 622 111 222',
                adresse: 'Conakry, Guinée',
                poste: 'Analyste financier',
                role: 'Finance',
                typeContrat: 'CDI',
                salaireNet: 6000000
              },
              {
                id: '2',
                nom: 'Diallo',
                prenom: 'Aissatou',
                genre: 'Femme',
                email: 'a.diallo@bcg.gov.gn',
                telephone: '+224 622 333 444',
                adresse: 'Conakry, Guinée',
                poste: 'Comptable',
                role: 'Finance',
                typeContrat: 'CDI',
                salaireNet: 5500000
              },
              {
                id: '3',
                nom: 'Camara',
                prenom: 'Ibrahima',
                genre: 'Homme',
                email: 'i.camara@bcg.gov.gn',
                telephone: '+224 622 555 666',
                adresse: 'Conakry, Guinée',
                poste: 'Auditeur',
                role: 'Audit',
                typeContrat: 'CDI',
                salaireNet: 5800000
              },
              {
                id: '4',
                nom: 'Sylla',
                prenom: 'Mariama',
                genre: 'Femme',
                email: 'm.sylla@bcg.gov.gn',
                telephone: '+224 622 777 888',
                adresse: 'Conakry, Guinée',
                poste: 'Assistante RH',
                role: 'RH',
                typeContrat: 'CDD',
                salaireNet: 4200000
              },
              {
                id: '5',
                nom: 'Balde',
                prenom: 'Ousmane',
                genre: 'Homme',
                email: 'o.balde@bcg.gov.gn',
                telephone: '+224 622 999 000',
                adresse: 'Conakry, Guinée',
                poste: 'Analyste de risque',
                role: 'Risque',
                typeContrat: 'CDI',
                salaireNet: 6200000
              }
            ],
            salaireNetTotal: 27700000,
            contratsCounts: {
              'CDI': 4,
              'CDD': 1
            }
          },
          '2': {
            id: '2',
            nom: 'Orange Guinée',
            type: 'Entreprise',
            secteur: 'Télécommunications',
            description: 'Opérateur de téléphonie mobile et fournisseur de services financiers en Guinée.',
            
            nomRepresentant: 'Amadou Diallo',
            emailRepresentant: 'amadou.diallo@orange.gn',
            telephoneRepresentant: '+224 611 000 001',
            
            nomRH: 'Mariama Bah',
            emailRH: 'mariama.bah@orange.gn',
            telephoneRH: '+224 611 000 002',
            
            rccm: 'RCCM/GN/2007/B/1234',
            nif: 'NIF123456789',
            email: 'contact@orange.gn',
            telephone: '+224 611 000 000',
            adresse: 'Kaloum, Conakry, Guinée',
            siteWeb: 'www.orange.gn',
            
            logo: '/images/partners/orange.png',
            dateAdhesion: '2023-02-20',
            actif: true,
            
            nombreEmployes: 3,
            employes: [
              {
                id: '1',
                nom: 'Camara',
                prenom: 'Ibrahim',
                genre: 'Homme',
                email: 'ibrahim.camara@orange.gn',
                telephone: '+224 611 123 456',
                adresse: 'Conakry, Guinée',
                poste: 'Développeur',
                role: 'Technique',
                typeContrat: 'CDI',
                salaireNet: 5000000
              },
              {
                id: '2',
                nom: 'Bah',
                prenom: 'Fatoumata',
                genre: 'Femme',
                email: 'fatoumata.bah@orange.gn',
                telephone: '+224 622 789 012',
                adresse: 'Conakry, Guinée',
                poste: 'Comptable',
                role: 'Finance',
                typeContrat: 'CDD',
                salaireNet: 4000000
              },
              {
                id: '3',
                nom: 'Soumah',
                prenom: 'Mohamed',
                genre: 'Homme',
                email: 'mohamed.soumah@orange.gn',
                telephone: '+224 666 456 789',
                adresse: 'Conakry, Guinée',
                poste: 'Commercial',
                role: 'Ventes',
                typeContrat: 'CDI',
                salaireNet: 4500000
              }
            ],
            salaireNetTotal: 13500000,
            contratsCounts: {
              'CDI': 2,
              'CDD': 1
            }
          },
          '3': {
            id: '3',
            nom: 'Université Gamal Abdel Nasser',
            type: 'Université',
            secteur: 'Éducation',
            description: 'Institution d\'enseignement supérieur publique de Guinée, offrant des programmes dans divers domaines académiques.',
            
            nomRepresentant: 'Dr. Ousmane Balde',
            emailRepresentant: 'o.balde@uganc.edu.gn',
            telephoneRepresentant: '+224 628 111 222',
            
            nomRH: 'Mme. Kadiatou Diallo',
            emailRH: 'k.diallo@uganc.edu.gn',
            telephoneRH: '+224 628 333 444',
            
            rccm: 'N/A',
            nif: 'NIF300000001',
            email: 'info@uganc.edu.gn',
            telephone: '+224 628 123 456',
            adresse: 'Conakry, Guinée',
            siteWeb: 'www.uganc.edu.gn',
            
            logo: '/images/partners/uganc.png',
            dateAdhesion: '2023-03-10',
            actif: true,
            
            nombreEmployes: 4,
            employes: [
              {
                id: '1',
                nom: 'Toure',
                prenom: 'Mamoudou',
                genre: 'Homme',
                email: 'm.toure@uganc.edu.gn',
                telephone: '+224 628 555 666',
                adresse: 'Conakry, Guinée',
                poste: 'Professeur',
                role: 'Enseignement',
                typeContrat: 'CDI',
                salaireNet: 4800000
              },
              {
                id: '2',
                nom: 'Conde',
                prenom: 'Aminata',
                genre: 'Femme',
                email: 'a.conde@uganc.edu.gn',
                telephone: '+224 628 777 888',
                adresse: 'Conakry, Guinée',
                poste: 'Chercheur',
                role: 'Recherche',
                typeContrat: 'CDI',
                salaireNet: 5200000
              },
              {
                id: '3',
                nom: 'Keita',
                prenom: 'Sekou',
                genre: 'Homme',
                email: 's.keita@uganc.edu.gn',
                telephone: '+224 628 999 000',
                adresse: 'Conakry, Guinée',
                poste: 'Assistant administratif',
                role: 'Administration',
                typeContrat: 'CDD',
                salaireNet: 3500000
              },
              {
                id: '4',
                nom: 'Bangoura',
                prenom: 'Fanta',
                genre: 'Femme',
                email: 'f.bangoura@uganc.edu.gn',
                telephone: '+224 628 111 333',
                adresse: 'Conakry, Guinée',
                poste: 'Bibliothécaire',
                role: 'Support',
                typeContrat: 'CDI',
                salaireNet: 3800000
              }
            ],
            salaireNetTotal: 17300000,
            contratsCounts: {
              'CDI': 3,
              'CDD': 1
            }
          },
          '4': {
            id: '4',
            nom: 'Ministère de l\'Économie et des Finances',
            type: 'Gouvernement',
            secteur: 'Finance publique',
            description: 'Ministère en charge de l\'économie et des finances de la Guinée, responsable de la gestion des finances publiques et de la politique économique.',
            
            nomRepresentant: 'M. Moussa Conde',
            emailRepresentant: 'm.conde@mef.gov.gn',
            telephoneRepresentant: '+224 622 111 000',
            
            nomRH: 'Mme. Hawa Sylla',
            emailRH: 'h.sylla@mef.gov.gn',
            telephoneRH: '+224 622 222 000',
            
            rccm: 'N/A',
            nif: 'NIF400000001',
            email: 'contact@mef.gov.gn',
            telephone: '+224 622 987 654',
            adresse: 'Kaloum, Conakry, Guinée',
            siteWeb: 'www.mef.gov.gn',
            
            logo: '/images/partners/mef.png',
            dateAdhesion: '2023-04-05',
            actif: true,
            
            nombreEmployes: 3,
            employes: [
              {
                id: '1',
                nom: 'Kaba',
                prenom: 'Mamadou',
                genre: 'Homme',
                email: 'm.kaba@mef.gov.gn',
                telephone: '+224 622 333 000',
                adresse: 'Conakry, Guinée',
                poste: 'Directeur financier',
                role: 'Finance',
                typeContrat: 'CDI',
                salaireNet: 7000000
              },
              {
                id: '2',
                nom: 'Balde',
                prenom: 'Kadiatou',
                genre: 'Femme',
                email: 'k.balde@mef.gov.gn',
                telephone: '+224 622 444 000',
                adresse: 'Conakry, Guinée',
                poste: 'Analyste budgétaire',
                role: 'Budget',
                typeContrat: 'CDI',
                salaireNet: 6500000
              },
              {
                id: '3',
                nom: 'Diallo',
                prenom: 'Ibrahima',
                genre: 'Homme',
                email: 'i.diallo@mef.gov.gn',
                telephone: '+224 622 555 000',
                adresse: 'Conakry, Guinée',
                poste: 'Assistant administratif',
                role: 'Administration',
                typeContrat: 'CDD',
                salaireNet: 4000000
              }
            ],
            salaireNetTotal: 17500000,
            contratsCounts: {
              'CDI': 2,
              'CDD': 1
            }
          },
          '5': {
            id: '5',
            nom: 'MTN Guinée',
            type: 'Entreprise',
            secteur: 'Télécommunications',
            description: 'Opérateur de téléphonie mobile et services financiers en Guinée, offrant des solutions de communication et de paiement mobile.',
            
            nomRepresentant: 'M. Aliou Bah',
            emailRepresentant: 'a.bah@mtn.gn',
            telephoneRepresentant: '+224 655 111 222',
            
            nomRH: 'Mme. Fatou Camara',
            emailRH: 'f.camara@mtn.gn',
            telephoneRH: '+224 655 333 444',
            
            rccm: 'RCCM/GN/2005/B/5678',
            nif: 'NIF500000001',
            email: 'info@mtn.gn',
            telephone: '+224 655 123 456',
            adresse: 'Matam, Conakry, Guinée',
            siteWeb: 'www.mtn.gn',
            
            logo: '/images/partners/mtn.png',
            dateAdhesion: '2023-05-15',
            actif: false,
            
            nombreEmployes: 4,
            employes: [
              {
                id: '1',
                nom: 'Toure',
                prenom: 'Alpha',
                genre: 'Homme',
                email: 'a.toure@mtn.gn',
                telephone: '+224 655 555 666',
                adresse: 'Conakry, Guinée',
                poste: 'Ingénieur réseau',
                role: 'Technique',
                typeContrat: 'CDI',
                salaireNet: 5500000
              },
              {
                id: '2',
                nom: 'Diallo',
                prenom: 'Mariama',
                genre: 'Femme',
                email: 'm.diallo@mtn.gn',
                telephone: '+224 655 777 888',
                adresse: 'Conakry, Guinée',
                poste: 'Responsable marketing',
                role: 'Marketing',
                typeContrat: 'CDI',
                salaireNet: 6000000
              },
              {
                id: '3',
                nom: 'Camara',
                prenom: 'Mamadou',
                genre: 'Homme',
                email: 'm.camara@mtn.gn',
                telephone: '+224 655 999 000',
                adresse: 'Conakry, Guinée',
                poste: 'Développeur',
                role: 'IT',
                typeContrat: 'CDD',
                salaireNet: 4800000
              },
              {
                id: '4',
                nom: 'Sylla',
                prenom: 'Fatoumata',
                genre: 'Femme',
                email: 'f.sylla@mtn.gn',
                telephone: '+224 655 111 333',
                adresse: 'Conakry, Guinée',
                poste: 'Agent commercial',
                role: 'Commercial',
                typeContrat: 'CDI',
                salaireNet: 3500000
              }
            ],
            salaireNetTotal: 19800000,
            contratsCounts: {
              'CDI': 3,
              'CDD': 1
            }
          },
          '6': {
            id: '6',
            nom: 'ONG Développement Durable',
            type: 'ONG',
            secteur: 'Développement',
            description: 'Organisation non gouvernementale dédiée au développement durable et à la protection de l\'environnement en Guinée.',
            
            nomRepresentant: 'Dr. Sekou Conde',
            emailRepresentant: 's.conde@ongdd.org',
            telephoneRepresentant: '+224 666 111 222',
            
            nomRH: 'Mme. Aissatou Bah',
            emailRH: 'a.bah@ongdd.org',
            telephoneRH: '+224 666 333 444',
            
            rccm: 'RCCM/GN/2010/N/1234',
            nif: 'NIF600000001',
            email: 'contact@ongdd.org',
            telephone: '+224 666 789 123',
            adresse: 'Ratoma, Conakry, Guinée',
            siteWeb: 'www.ongdd.org',
            
            logo: '/images/partners/ongdd.png',
            dateAdhesion: '2023-06-20',
            actif: true,
            
            nombreEmployes: 3,
            employes: [
              {
                id: '1',
                nom: 'Barry',
                prenom: 'Ousmane',
                genre: 'Homme',
                email: 'o.barry@ongdd.org',
                telephone: '+224 666 555 666',
                adresse: 'Conakry, Guinée',
                poste: 'Chef de projet',
                role: 'Gestion de projet',
                typeContrat: 'CDI',
                salaireNet: 4500000
              },
              {
                id: '2',
                nom: 'Camara',
                prenom: 'Fatoumata',
                genre: 'Femme',
                email: 'f.camara@ongdd.org',
                telephone: '+224 666 777 888',
                adresse: 'Conakry, Guinée',
                poste: 'Chargée de communication',
                role: 'Communication',
                typeContrat: 'CDD',
                salaireNet: 3800000
              },
              {
                id: '3',
                nom: 'Diallo',
                prenom: 'Ibrahim',
                genre: 'Homme',
                email: 'i.diallo@ongdd.org',
                telephone: '+224 666 999 000',
                adresse: 'Conakry, Guinée',
                poste: 'Coordinateur terrain',
                role: 'Opérations',
                typeContrat: 'CDI',
                salaireNet: 4200000
              }
            ],
            salaireNetTotal: 12500000,
            contratsCounts: {
              'CDI': 2,
              'CDD': 1
            }
          },
          '7': {
            id: '7',
            nom: 'Société des Mines de Guinée',
            type: 'Entreprise',
            secteur: 'Mines',
            description: 'Entreprise spécialisée dans l\'exploitation minière en Guinée, principalement dans l\'extraction de bauxite et d\'or.',
            
            nomRepresentant: 'M. Amadou Bah',
            emailRepresentant: 'a.bah@smg.gn',
            telephoneRepresentant: '+224 677 111 222',
            
            nomRH: 'M. Mamadou Diallo',
            emailRH: 'm.diallo@smg.gn',
            telephoneRH: '+224 677 333 444',
            
            rccm: 'RCCM/GN/2008/B/5678',
            nif: 'NIF700000001',
            email: 'contact@smg.gn',
            telephone: '+224 677 789 123',
            adresse: 'Boké, Guinée',
            siteWeb: 'www.smg.gn',
            
            logo: '/images/partners/smg.png',
            dateAdhesion: '2023-07-05',
            actif: true,
            
            nombreEmployes: 5,
            employes: [
              {
                id: '1',
                nom: 'Camara',
                prenom: 'Sekou',
                genre: 'Homme',
                email: 's.camara@smg.gn',
                telephone: '+224 677 555 666',
                adresse: 'Boké, Guinée',
                poste: 'Ingénieur des mines',
                role: 'Technique',
                typeContrat: 'CDI',
                salaireNet: 7500000
              },
              {
                id: '2',
                nom: 'Bah',
                prenom: 'Mamadou',
                genre: 'Homme',
                email: 'm.bah@smg.gn',
                telephone: '+224 677 777 888',
                adresse: 'Boké, Guinée',
                poste: 'Géologue',
                role: 'Technique',
                typeContrat: 'CDI',
                salaireNet: 6800000
              },
              {
                id: '3',
                nom: 'Diallo',
                prenom: 'Aissatou',
                genre: 'Femme',
                email: 'a.diallo@smg.gn',
                telephone: '+224 677 999 000',
                adresse: 'Conakry, Guinée',
                poste: 'Comptable',
                role: 'Finance',
                typeContrat: 'CDI',
                salaireNet: 5200000
              },
              {
                id: '4',
                nom: 'Soumah',
                prenom: 'Ibrahima',
                genre: 'Homme',
                email: 'i.soumah@smg.gn',
                telephone: '+224 677 111 333',
                adresse: 'Boké, Guinée',
                poste: 'Technicien',
                role: 'Opérations',
                typeContrat: 'CDD',
                salaireNet: 4500000
              },
              {
                id: '5',
                nom: 'Barry',
                prenom: 'Mariama',
                genre: 'Femme',
                email: 'm.barry@smg.gn',
                telephone: '+224 677 222 444',
                adresse: 'Boké, Guinée',
                poste: 'Responsable sécurité',
                role: 'Sécurité',
                typeContrat: 'CDI',
                salaireNet: 5800000
              }
            ],
            salaireNetTotal: 29800000,
            contratsCounts: {
              'CDI': 4,
              'CDD': 1
            }
          }
        };
        
        // Récupérer les données du partenaire en fonction de l'ID
        const partenaireId = params.id as string;
        const partenaireData = mockPartenaires[partenaireId as keyof typeof mockPartenaires];
        
        if (partenaireData) {
          setPartenaire(partenaireData as PartenaireDetail);
        } else {
          // Si le partenaire n'existe pas, rediriger vers la liste des partenaires
          console.error(`Partenaire avec l'ID ${partenaireId} non trouvé`);
          toast.error(`Le partenaire avec l'ID ${partenaireId} n'existe pas`);
          // Redirection après un court délai
          setTimeout(() => {
            router.push('/dashboard/partenaires');
          }, 2000);
        }
        
        setIsLoading(false);
      }, 1000);
    };
    
    fetchPartenaire();
  }, [params.id]);

  // Retour à la liste des partenaires
  const handleRetour = () => {
    router.push('/dashboard/partenaires');
  };

  // Gestion de l'import d'employés via Excel
  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      // Afficher un toast de chargement
      const loadingToast = toast.loading('Importation des employés en cours...');
      
      // Simulation d'import (à remplacer par l'implémentation réelle)
      setTimeout(() => {
        // Remplacer le toast de chargement par un toast de succès
        toast.dismiss(loadingToast);
        toast.success('Employés importés avec succès!');
        setShowImportModal(false);
      }, 1000);
    }
  };

  // Export des données des employés au format Excel
  const handleExportExcel = () => {
    // Afficher un toast de chargement
    const loadingToast = toast.loading('Export des données des employés en cours...');
    
    // Simulation d'export (à remplacer par l'implémentation réelle)
    setTimeout(() => {
      // Remplacer le toast de chargement par un toast de succès
      toast.dismiss(loadingToast);
      toast.success('Données exportées avec succès!');
    }, 1500);
  };
  
  // Gestion de la modification du partenaire
  const handleModificationSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Récupération des données du formulaire
    const formData = (window as any).formData;
    
    // Afficher un toast de chargement
    const loadingToast = toast.loading('Mise à jour du partenaire en cours...');
    
    // Simulation de mise à jour (à remplacer par l'implémentation réelle)
    setTimeout(() => {
      // Mise à jour des données locales
      if (partenaire && formData) {
        setPartenaire({
          ...partenaire,
          nom: formData.nom,
          type: formData.type,
          secteur: formData.domaine,
          description: formData.description,
          nomRepresentant: formData.nomRepresentant,
          emailRepresentant: formData.emailRepresentant,
          telephoneRepresentant: formData.telephoneRepresentant,
          nomRH: formData.nomRH,
          emailRH: formData.emailRH,
          telephoneRH: formData.telephoneRH,
          rccm: formData.rccm,
          nif: formData.nif,
          email: formData.email,
          telephone: formData.telephone,
          adresse: formData.adresse,
          siteWeb: formData.siteWeb,
          dateAdhesion: formData.dateAdhesion,
          actif: formData.actif,
          // Conserver les données des employés
          nombreEmployes: partenaire.nombreEmployes,
          employes: partenaire.employes,
          salaireNetTotal: partenaire.salaireNetTotal,
          contratsCounts: partenaire.contratsCounts
        });
      }
      
      // Fermer la modale
      setShowModificationModal(false);
      
      // Remplacer le toast de chargement par un toast de succès
      toast.dismiss(loadingToast);
      toast.success('Partenaire modifié avec succès!');
    }, 1000);
  };
  
  // Gestion de l'ajout d'un employé
  const handleAjoutEmploye = (employe: Employe) => {
    // Afficher un toast de chargement
    const loadingToast = toast.loading('Ajout de l\'employé en cours...');
    
    // Simulation d'ajout (à remplacer par l'implémentation réelle)
    setTimeout(() => {
      if (partenaire) {
        // Mise à jour des données locales
        const newEmployes = [...partenaire.employes, employe];
        const newSalaireTotal = partenaire.salaireNetTotal + employe.salaireNet;
        
        // Mise à jour des compteurs de contrats
        const newContratsCounts = { ...partenaire.contratsCounts };
        newContratsCounts[employe.typeContrat] = (newContratsCounts[employe.typeContrat] || 0) + 1;
        
        setPartenaire({
          ...partenaire,
          nombreEmployes: partenaire.nombreEmployes + 1,
          employes: newEmployes,
          salaireNetTotal: newSalaireTotal,
          contratsCounts: newContratsCounts
        });
      }
      
      // Remplacer le toast de chargement par un toast de succès
      toast.dismiss(loadingToast);
      toast.success('Employé ajouté avec succès!');
    }, 1000);
  };

  if (isLoading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--zalama-blue)]"></div>
      </div>
    );
  }

  if (!partenaire) {
    return (
      <div className="p-6">
        <div className="bg-[var(--zalama-danger)]/10 text-[var(--zalama-danger)] p-4 rounded-lg">
          <h3 className="font-semibold">Partenaire non trouvé</h3>
          <p>Le partenaire que vous recherchez n'existe pas ou a été supprimé.</p>
          <button
            onClick={handleRetour}
            className="mt-4 flex items-center gap-2 px-4 py-2 bg-[var(--zalama-blue)] text-white rounded-lg hover:bg-[var(--zalama-blue-accent)] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour à la liste
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* En-tête avec actions */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <button
            onClick={handleRetour}
            className="p-2 rounded-full hover:bg-[var(--zalama-bg-lighter)] transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-[var(--zalama-text)]" />
          </button>
          <h2 className="text-2xl font-semibold text-[var(--zalama-text)]">{partenaire.nom}</h2>
          <span className={`px-2 py-0.5 text-xs rounded-full ${
            partenaire.actif 
              ? 'bg-[var(--zalama-success)]/20 text-[var(--zalama-success)]' 
              : 'bg-[var(--zalama-danger)]/20 text-[var(--zalama-danger)]'
          }`}>
            {partenaire.actif ? 'Actif' : 'Inactif'}
          </span>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setShowModificationModal(true)}
            className="flex items-center gap-1 px-4 py-2 border border-[var(--zalama-border)] rounded-lg hover:bg-[var(--zalama-bg-lighter)] transition-colors text-[var(--zalama-text)]"
          >
            <Edit className="h-4 w-4" />
            Modifier
          </button>
        </div>
      </div>
      
      {/* Carte d'informations principales */}
      <div className="flex gap-6 bg-[var(--zalama-card)] rounded-xl p-6 shadow-sm">
        <div className="w-32 h-32 rounded-lg overflow-hidden">
          <img 
            src={partenaire.logo} 
            alt={`Logo de ${partenaire.nom}`} 
            className="w-full h-full object-contain bg-white p-2"
          />
        </div>
        
        <div className="flex-1 grid grid-cols-3 gap-6">
          <div>
            <h3 className="text-sm text-[var(--zalama-text-secondary)] mb-1">Type</h3>
            <p className="font-medium text-[var(--zalama-text)]">{partenaire.type}</p>
          </div>
          
          <div>
            <h3 className="text-sm text-[var(--zalama-text-secondary)] mb-1">Secteur</h3>
            <p className="font-medium text-[var(--zalama-text)]">{partenaire.secteur}</p>
          </div>
          
          <div>
            <h3 className="text-sm text-[var(--zalama-text-secondary)] mb-1">Date d'adhésion</h3>
            <p className="font-medium text-[var(--zalama-text)]">
              {new Date(partenaire.dateAdhesion).toLocaleDateString('fr-FR')}
            </p>
          </div>
          
          <div>
            <h3 className="text-sm text-[var(--zalama-text-secondary)] mb-1">Email</h3>
            <p className="font-medium text-[var(--zalama-text)]">{partenaire.email}</p>
          </div>
          
          <div>
            <h3 className="text-sm text-[var(--zalama-text-secondary)] mb-1">Téléphone</h3>
            <p className="font-medium text-[var(--zalama-text)]">{partenaire.telephone}</p>
          </div>
          
          <div>
            <h3 className="text-sm text-[var(--zalama-text-secondary)] mb-1">Site Web</h3>
            <p className="font-medium text-[var(--zalama-text)]">{partenaire.siteWeb}</p>
          </div>
        </div>
      </div>
      
      {/* Statistiques des employés */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-[var(--zalama-card)] rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-[var(--zalama-blue)]/10">
              <Users className="h-5 w-5 text-[var(--zalama-blue)]" />
            </div>
            <h3 className="text-[var(--zalama-text-secondary)]">Employés</h3>
          </div>
          <p className="text-2xl font-semibold text-[var(--zalama-text)]">{partenaire.nombreEmployes}</p>
        </div>
        
        <div className="bg-[var(--zalama-card)] rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-[var(--zalama-success)]/10">
              <CreditCard className="h-5 w-5 text-[var(--zalama-success)]" />
            </div>
            <h3 className="text-[var(--zalama-text-secondary)]">Salaire total</h3>
          </div>
          <p className="text-2xl font-semibold text-[var(--zalama-text)]">
            {partenaire.salaireNetTotal.toLocaleString()} GNF
          </p>
        </div>
        
        <div className="bg-[var(--zalama-card)] rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-[var(--zalama-warning)]/10">
              <Briefcase className="h-5 w-5 text-[var(--zalama-warning)]" />
            </div>
            <h3 className="text-[var(--zalama-text-secondary)]">CDI</h3>
          </div>
          <p className="text-2xl font-semibold text-[var(--zalama-text)]">
            {partenaire.contratsCounts['CDI'] || 0}
          </p>
        </div>
        
        <div className="bg-[var(--zalama-card)] rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-[var(--zalama-danger)]/10">
              <Calendar className="h-5 w-5 text-[var(--zalama-danger)]" />
            </div>
            <h3 className="text-[var(--zalama-text-secondary)]">CDD</h3>
          </div>
          <p className="text-2xl font-semibold text-[var(--zalama-text)]">
            {partenaire.contratsCounts['CDD'] || 0}
          </p>
        </div>
      </div>
      
      {/* Onglets */}
      <div className="flex border-b border-[var(--zalama-border)]">
        <button
          type="button"
          onClick={() => setActiveTab('infos')}
          className={`flex-1 py-3 text-center font-medium transition-colors ${
            activeTab === 'infos' 
              ? 'text-[var(--zalama-blue)] border-b-2 border-[var(--zalama-blue)]' 
              : 'text-[var(--zalama-text-secondary)] hover:text-[var(--zalama-text)]'
          }`}
        >
          Informations détaillées
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('employes')}
          className={`flex-1 py-3 text-center font-medium transition-colors ${
            activeTab === 'employes' 
              ? 'text-[var(--zalama-blue)] border-b-2 border-[var(--zalama-blue)]' 
              : 'text-[var(--zalama-text-secondary)] hover:text-[var(--zalama-text)]'
          }`}
        >
          Employés
        </button>
      </div>
      
      {/* Contenu des onglets */}
      {activeTab === 'infos' && (
        <div className="grid grid-cols-2 gap-6">
          {/* Informations de l'entreprise */}
          <div className="bg-[var(--zalama-card)] rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-[var(--zalama-text)] mb-4">Informations de l'entreprise</h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="text-sm text-[var(--zalama-text-secondary)] mb-1">Description</h4>
                <p className="text-[var(--zalama-text)]">{partenaire.description}</p>
              </div>
              
              <div>
                <h4 className="text-sm text-[var(--zalama-text-secondary)] mb-1">Adresse</h4>
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-[var(--zalama-text-secondary)] mt-0.5" />
                  <p className="text-[var(--zalama-text)]">{partenaire.adresse}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm text-[var(--zalama-text-secondary)] mb-1">RCCM</h4>
                  <p className="text-[var(--zalama-text)]">{partenaire.rccm}</p>
                </div>
                
                <div>
                  <h4 className="text-sm text-[var(--zalama-text-secondary)] mb-1">NIF</h4>
                  <p className="text-[var(--zalama-text)]">{partenaire.nif}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Contacts */}
          <div className="space-y-6">
            {/* Représentant */}
            <div className="bg-[var(--zalama-card)] rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-[var(--zalama-text)] mb-4">Représentant</h3>
              
              <div className="space-y-3">
                <div>
                  <h4 className="text-sm text-[var(--zalama-text-secondary)] mb-1">Nom</h4>
                  <p className="text-[var(--zalama-text)]">{partenaire.nomRepresentant}</p>
                </div>
                
                <div>
                  <h4 className="text-sm text-[var(--zalama-text-secondary)] mb-1">Email</h4>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-[var(--zalama-text-secondary)]" />
                    <p className="text-[var(--zalama-text)]">{partenaire.emailRepresentant}</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm text-[var(--zalama-text-secondary)] mb-1">Téléphone</h4>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-[var(--zalama-text-secondary)]" />
                    <p className="text-[var(--zalama-text)]">{partenaire.telephoneRepresentant}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Responsable RH */}
            <div className="bg-[var(--zalama-card)] rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-[var(--zalama-text)] mb-4">Responsable RH</h3>
              
              <div className="space-y-3">
                <div>
                  <h4 className="text-sm text-[var(--zalama-text-secondary)] mb-1">Nom</h4>
                  <p className="text-[var(--zalama-text)]">{partenaire.nomRH}</p>
                </div>
                
                <div>
                  <h4 className="text-sm text-[var(--zalama-text-secondary)] mb-1">Email</h4>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-[var(--zalama-text-secondary)]" />
                    <p className="text-[var(--zalama-text)]">{partenaire.emailRH}</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm text-[var(--zalama-text-secondary)] mb-1">Téléphone</h4>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-[var(--zalama-text-secondary)]" />
                    <p className="text-[var(--zalama-text)]">{partenaire.telephoneRH}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Onglet Employés */}
      {activeTab === 'employes' && (
        <div>
          {/* Actions pour les employés */}
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-[var(--zalama-text)]">Liste des employés</h3>
            
            <div className="flex gap-2">
              <button
                onClick={handleExportExcel}
                className="flex items-center gap-1 px-3 py-1.5 border border-[var(--zalama-border)] rounded-lg hover:bg-[var(--zalama-bg-lighter)] transition-colors text-[var(--zalama-text)] text-sm"
              >
                <Download className="h-4 w-4" />
                Exporter Excel
              </button>
              
              <label
                htmlFor="import-excel"
                className="flex items-center gap-1 px-3 py-1.5 bg-[var(--zalama-success)] hover:bg-[var(--zalama-blue-accent)]  text-white rounded-lg transition-colors text-sm cursor-pointer"
              >
                <Upload className="h-4 w-4" />
                Importer Excel
                <input
                  type="file"
                  id="import-excel"
                  accept=".xlsx, .xls"
                  onChange={handleImportExcel}
                  className="hidden"
                />
              </label>
              
              <button
                onClick={() => setShowAjoutEmployeModal(true)}
                className="flex items-center gap-1 px-3 py-1.5 bg-[var(--zalama-blue)] hover:bg-[var(--zalama-blue-accent)] text-white rounded-lg transition-colors text-sm"
              >
                <UserPlus className="h-4 w-4" />
                Ajouter un employé
              </button>
            </div>
          </div>
          
          {/* Tableau des employés */}
          <div className="bg-[var(--zalama-card)] rounded-xl shadow-sm overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-[var(--zalama-bg-lighter)]">
                  <th className="px-4 py-3 text-left text-sm font-medium text-[var(--zalama-text)]">Nom & Prénom</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[var(--zalama-text)]">Genre</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[var(--zalama-text)]">Contact</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[var(--zalama-text)]">Poste</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[var(--zalama-text)]">Contrat</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-[var(--zalama-text)]">Salaire Net</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-[var(--zalama-text)]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--zalama-border)]">
                {partenaire.employes.map(employe => (
                  <tr key={employe.id} className="hover:bg-[var(--zalama-bg-lighter)]/50 transition-colors">
                    <td className="px-4 py-3 text-sm text-[var(--zalama-text)]">
                      {employe.nom} {employe.prenom}
                    </td>
                    <td className="px-4 py-3 text-sm text-[var(--zalama-text)]">{employe.genre}</td>
                    <td className="px-4 py-3 text-sm text-[var(--zalama-text)]">
                      <div className="flex flex-col">
                        <span>{employe.email}</span>
                        <span className="text-[var(--zalama-text-secondary)]">{employe.telephone}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-[var(--zalama-text)]">
                      <div className="flex flex-col">
                        <span>{employe.poste}</span>
                        <span className="text-[var(--zalama-text-secondary)]">{employe.role}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-0.5 text-xs rounded-full ${
                        employe.typeContrat === 'CDI' 
                          ? 'bg-[var(--zalama-success)]/20 text-[var(--zalama-success)]' 
                          : 'bg-[var(--zalama-warning)]/20 text-[var(--zalama-warning)]'
                      }`}>
                        {employe.typeContrat}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-[var(--zalama-text)] text-right">
                      {employe.salaireNet.toLocaleString()} GNF
                    </td>
                    <td className="px-4 py-3 text-sm text-center">
                      <button
                        onClick={() => router.push(`/dashboard/partenaires/${partenaire.id}/employes/${employe.id}/edit`)}
                        className="text-[var(--zalama-blue)] hover:text-[var(--zalama-blue-accent)] transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Message si aucun employé */}
          {partenaire.employes.length === 0 && (
            <div className="bg-[var(--zalama-card)] rounded-xl p-8 text-center">
              <p className="text-[var(--zalama-text-secondary)]">
                Aucun employé n'a été ajouté pour ce partenaire.
              </p>
              <button
                onClick={() => router.push(`/dashboard/partenaires/${partenaire.id}/employes/ajouter`)}
                className="mt-4 px-4 py-2 bg-[var(--zalama-blue)] text-white rounded-lg hover:bg-[var(--zalama-blue-accent)] transition-colors"
              >
                Ajouter un employé
              </button>
            </div>
          )}
        </div>
      )}
    
    
    {/* Modale de modification du partenaire */}
    <ModaleModificationPartenaire
      isOpen={showModificationModal}
      onClose={() => setShowModificationModal(false)}
      onSubmit={handleModificationSubmit}
      types={['Entreprise', 'ONG', 'Institution', 'Association']}
      partenaire={partenaire}
    />
    
    {/* Modale d'ajout d'employé */}
    <ModaleAjoutEmploye
      isOpen={showAjoutEmployeModal}
      onClose={() => setShowAjoutEmployeModal(false)}
      onSubmit={handleAjoutEmploye}
      partenaireId={partenaire?.id || ''}
    />
    </div>

  );
}
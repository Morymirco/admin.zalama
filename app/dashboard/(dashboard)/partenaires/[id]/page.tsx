"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Building, Users, Briefcase, CreditCard, Calendar, Mail, Phone, MapPin, Globe, FileText, CheckCircle, XCircle, Edit, ArrowLeft, Download, Upload, UserPlus } from 'lucide-react';
import { Employe } from '@/components/dashboard/partenaires/types';
import ModaleModificationPartenaire from '@/components/dashboard/partenaires/ModaleModificationPartenaire';
import ModaleAjoutEmploye from '@/components/dashboard/partenaires/ModaleAjoutEmploye';
import toast from 'react-hot-toast';
import { doc, getDoc, updateDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';

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
      
      try {
        const partenaireId = params.id as string;
        
        // Récupérer le document du partenaire depuis Firestore
        const partenaireRef = doc(db, 'partenaires', partenaireId);
        const partenaireSnap = await getDoc(partenaireRef);
        
        if (!partenaireSnap.exists()) {
          toast.error('Partenaire non trouvé');
          router.push('/dashboard/partenaires');
          return;
        }
        
        const partenaireData = partenaireSnap.data();
        
        // Récupérer les employés du partenaire (si vous avez une collection d'employés)
        let employes: Employe[] = [];
        let salaireNetTotal = 0;
        let contratsCounts: Record<string, number> = {};
        
        try {
          // Supposons que vous avez une collection 'employes' avec un champ 'partenaireId'
          const employesRef = collection(db, 'employes');
          const employesQuery = query(employesRef, where('partenaireId', '==', partenaireId));
          const employesSnap = await getDocs(employesQuery);
          
          employes = employesSnap.docs.map(doc => {
            const data = doc.data() as Employe;
            // Calculer le salaire total
            salaireNetTotal += data.salaireNet || 0;
            
            // Compter les types de contrats
            const typeContrat = data.typeContrat || 'Autre';
            contratsCounts[typeContrat] = (contratsCounts[typeContrat] || 0) + 1;
            
            return {
              ...data
            };
          });
        } catch (error) {
          console.error('Erreur lors de la récupération des employés:', error);
          // Continuer même si la récupération des employés échoue
        }
        
        // Construire l'objet partenaire complet
        const partenaireDetail: PartenaireDetail = {
          id: partenaireId,
          nom: partenaireData.nom || '',
          type: partenaireData.type || '',
          secteur: partenaireData.secteur || '',
          description: partenaireData.description || '',
          
          // Extraire les données du représentant
          nomRepresentant: partenaireData.representant?.nom || '',
          emailRepresentant: partenaireData.representant?.email || '',
          telephoneRepresentant: partenaireData.representant?.telephone || '',
          
          // Extraire les données RH
          nomRH: partenaireData.rh?.nom || '',
          emailRH: partenaireData.rh?.email || '',
          telephoneRH: partenaireData.rh?.telephone || '',
          
          // Extraire les informations légales
          rccm: partenaireData.infoLegales?.rccm || '',
          nif: partenaireData.infoLegales?.nif || '',
          
          // Informations de contact
          email: partenaireData.email || '',
          telephone: partenaireData.telephone || '',
          adresse: partenaireData.adresse || '',
          siteWeb: partenaireData.siteWeb || '',
          
          // Autres informations
          logo: partenaireData.logo || '/images/partners/default.png',
          dateAdhesion: partenaireData.datePartenariat || '',
          actif: partenaireData.actif || false,
          
          // Informations sur les employés
          nombreEmployes: employes.length,
          employes,
          salaireNetTotal,
          contratsCounts
        };
        
        setPartenaire(partenaireDetail);
      } catch (error) {
        console.error('Erreur lors de la récupération du partenaire:', error);
        toast.error('Erreur lors du chargement des données');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (params.id) {
      fetchPartenaire();
    }
  }, [params.id, router]);

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
  const handleModificationSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Récupération des données du formulaire
    const formData = (window as any).formData;
    
    if (!formData || !partenaire) {
      toast.error('Données du formulaire non disponibles');
      return;
    }
    
    // Afficher un toast de chargement
    const loadingToast = toast.loading('Mise à jour du partenaire en cours...');
    
    try {
      // Préparer les données à mettre à jour
      const partenaireUpdates = {
        nom: formData.nom,
        type: formData.type,
        secteur: formData.domaine,
        description: formData.description,
        adresse: formData.adresse,
        email: formData.email,
        telephone: formData.telephone,
        siteWeb: formData.siteWeb || '',
        datePartenariat: formData.dateAdhesion || '',
        actif: formData.actif,
        representant: {
          nom: formData.nomRepresentant || '',
          email: formData.emailRepresentant || '',
          telephone: formData.telephoneRepresentant || ''
        },
        rh: {
          nom: formData.nomRH || '',
          email: formData.emailRH || '',
          telephone: formData.telephoneRH || ''
        },
        infoLegales: {
          rccm: formData.rccm || '',
          nif: formData.nif || ''
        }
      };
      
      // Mettre à jour le document dans Firestore
      const partenaireRef = doc(db, 'partenaires', partenaire.id);
      await updateDoc(partenaireRef, partenaireUpdates);
      
      // Mettre à jour l'état local
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
      });
      
      // Fermer la modale
      setShowModificationModal(false);
      
      // Remplacer le toast de chargement par un toast de succès
      toast.dismiss(loadingToast);
      toast.success('Partenaire modifié avec succès!');
    } catch (error) {
      console.error('Erreur lors de la mise à jour du partenaire:', error);
      toast.dismiss(loadingToast);
      toast.error('Erreur lors de la mise à jour du partenaire');
    }
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
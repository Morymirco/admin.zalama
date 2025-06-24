"use client";

import React, { useState, useEffect } from 'react';
import { Building, Users, Globe } from 'lucide-react';

// Importation des composants
import {
  StatistiquesPartenaires,
  ResumePartenaires,
  ListePartenaires,
  ModaleAjoutPartenaire,
  ModaleEditionPartenaire,
  ModaleSuppressionPartenaire
} from '@/components/dashboard/partenaires';

// Types
interface Partenaire {
  id: string;
  nom: string;
  type: string;
  secteur: string;
  description: string;
  adresse: string;
  email: string;
  telephone: string;
  siteWeb: string;
  logo: string;
  datePartenariat: string;
  actif: boolean;
}

interface StatistiquePartenaire {
  type: string;
  nombre: number;
  nouveauxCeMois: number;
  actifs: number;
  inactifs: number;
  tendance: 'hausse' | 'stable' | 'baisse';
  icon: React.ReactNode;
}

export default function PartenairesPage() {
  // États
  const [partenaires, setPartenaires] = useState<Partenaire[]>([]);
  const [filteredPartenaires, setFilteredPartenaires] = useState<Partenaire[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentPartenaire, setCurrentPartenaire] = useState<Partenaire | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<string>('tous');
  const [statsLoading, setStatsLoading] = useState(true);
  const [statistiques, setStatistiques] = useState<StatistiquePartenaire[]>([]);

  // Liste des types de partenaires
  const types = ['tous', 'Entreprise', 'Institution financière', 'ONG', 'Gouvernement', 'Université'];

  // Données fictives pour la démo
  useEffect(() => {
    // Simuler un chargement depuis une API
    setTimeout(() => {
      const mockData: Partenaire[] = [
        { 
          id: '1', 
          nom: 'Banque Centrale de Guinée', 
          type: 'Institution financière', 
          secteur: 'Finance', 
          description: 'Banque centrale et régulateur financier', 
          adresse: 'Conakry, Guinée', 
          email: 'contact@bcg.gov.gn', 
          telephone: '+224 123 456 789', 
          siteWeb: 'www.bcg.gov.gn', 
          logo: '/images/partners/bcg.png', 
          datePartenariat: '2023-01-15', 
          actif: true 
        },
        { 
          id: '2', 
          nom: 'Orange Guinée', 
          type: 'Entreprise', 
          secteur: 'Télécommunications', 
          description: 'Opérateur de téléphonie mobile et fournisseur de services financiers', 
          adresse: 'Conakry, Guinée', 
          email: 'contact@orange.gn', 
          telephone: '+224 611 000 000', 
          siteWeb: 'www.orange.gn', 
          logo: '/images/partners/orange.png', 
          datePartenariat: '2023-02-20', 
          actif: true 
        }
      ];
      
      setPartenaires(mockData);
      setFilteredPartenaires(mockData);
      setIsLoading(false);
    }, 1000);

    // Données fictives pour les statistiques des partenaires
    setTimeout(() => {
      const statsMockData: StatistiquePartenaire[] = [
        {
          type: 'Entreprises',
          nombre: 24,
          nouveauxCeMois: 3,
          actifs: 20,
          inactifs: 4,
          tendance: 'hausse',
          icon: <Building className="h-6 w-6 text-[var(--zalama-blue)]" />
        },
        {
          type: 'Institutions financières',
          nombre: 12,
          nouveauxCeMois: 1,
          actifs: 10,
          inactifs: 2,
          tendance: 'stable',
          icon: <Users className="h-6 w-6 text-[var(--zalama-success)]" />
        },
        {
          type: 'Gouvernements',
          nombre: 5,
          nouveauxCeMois: 0,
          actifs: 5,
          inactifs: 0,
          tendance: 'stable',
          icon: <Globe className="h-6 w-6 text-[var(--zalama-warning)]" />
        }
      ];
      
      setStatistiques(statsMockData);
      setStatsLoading(false);
    }, 1500);
  }, []);

  // Filtrage des partenaires
  useEffect(() => {
    let result = [...partenaires];
    
    // Filtre par recherche
    if (searchTerm) {
      result = result.filter(partenaire => 
        partenaire.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        partenaire.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        partenaire.secteur.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filtre par type
    if (typeFilter !== 'tous') {
      result = result.filter(partenaire => partenaire.type === typeFilter);
    }
    
    setFilteredPartenaires(result);
    setCurrentPage(1); // Réinitialiser la pagination lors du filtrage
  }, [searchTerm, typeFilter, partenaires]);

  // Handlers
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleTypeFilterChange = (type: string) => {
    setTypeFilter(type);
    // Réinitialiser la pagination lors du changement de filtre
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handlers pour les opérations CRUD
  const handleAddPartenaire = () => {
    setShowAddModal(true);
  };

  const handleEditPartenaire = (partenaire: Partenaire) => {
    setCurrentPartenaire(partenaire);
    setShowEditModal(true);
  };

  const handleDeletePartenaire = (partenaire: Partenaire) => {
    setCurrentPartenaire(partenaire);
    setShowDeleteModal(true);
  };

  const handleSubmitAddPartenaire = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    try {
      // Récupération des données du formulaire depuis window.formData
      const formData = (window as any).formData;
      
      if (!formData) {
        console.error('Aucune donnée de formulaire trouvée');
        alert('Une erreur est survenue lors de la soumission du formulaire. Veuillez réessayer.');
        return;
      }
      
      // Génération d'un ID unique
      const newId = Date.now().toString();
      
      // Création du nouvel objet partenaire avec les données du formulaire
      const newPartenaire: Partenaire = {
        id: newId,
        nom: formData.nom,
        type: formData.type,
        secteur: formData.domaine,
        description: formData.description,
        adresse: formData.adresse,
        email: formData.email,
        telephone: formData.telephone,
        siteWeb: formData.siteWeb,
        logo: '/images/partners/default.png', // Logo par défaut, à remplacer par l'upload réel
        datePartenariat: formData.dateAdhesion || new Date().toISOString().split('T')[0],
        actif: formData.actif,
      };
      
      // Ajout du nouveau partenaire à la liste
      const updatedPartenaires = [...partenaires, newPartenaire];
      setPartenaires(updatedPartenaires);
      setFilteredPartenaires(updatedPartenaires);
      setShowAddModal(false);
      
      // Notification de succès
      console.log('Partenaire ajouté avec succès:', newPartenaire);
      alert('Partenaire ajouté avec succès!');
      
      // Redirection vers la page de détail du partenaire
      // Cette ligne est commentée car elle nécessite l'accès au router
      // router.push(`/dashboard/partenaires/${newId}`);
      
      // Nettoyage des données temporaires
      delete (window as any).formData;
    } catch (error) {
      console.error('Erreur lors de l\'ajout du partenaire:', error);
      alert('Une erreur est survenue lors de l\'ajout du partenaire. Veuillez réessayer.');
    }
  };

  const handleSubmitEditPartenaire = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!currentPartenaire) return;
    
    const form = e.currentTarget;
    
    const updatedPartenaire: Partenaire = {
      ...currentPartenaire,
      nom: (form.querySelector('#edit-nom') as HTMLInputElement).value,
      type: (form.querySelector('#edit-type') as HTMLSelectElement).value,
      secteur: (form.querySelector('#edit-secteur') as HTMLInputElement).value,
      description: (form.querySelector('#edit-description') as HTMLTextAreaElement).value,
      adresse: (form.querySelector('#edit-adresse') as HTMLInputElement).value,
      email: (form.querySelector('#edit-email') as HTMLInputElement).value,
      telephone: (form.querySelector('#edit-telephone') as HTMLInputElement).value,
      siteWeb: (form.querySelector('#edit-siteWeb') as HTMLInputElement).value,
      actif: (form.querySelector('#edit-actif') as HTMLInputElement).checked,
    };
    
    const updatedPartenaires = partenaires.map(p => p.id === currentPartenaire.id ? updatedPartenaire : p);
    setPartenaires(updatedPartenaires);
    setFilteredPartenaires(updatedPartenaires);
    setShowEditModal(false);
    setCurrentPartenaire(null);
    
    // Notification de succès (à implémenter)
    console.log('Partenaire mis à jour avec succès:', updatedPartenaire);
  };

  const handleConfirmDelete = () => {
    if (!currentPartenaire) return;
    
    const updatedPartenaires = partenaires.filter(p => p.id !== currentPartenaire.id);
    setPartenaires(updatedPartenaires);
    setFilteredPartenaires(updatedPartenaires);
    setShowDeleteModal(false);
    setCurrentPartenaire(null);
    
    // Notification de succès (à implémenter)
    console.log('Partenaire supprimé avec succès:', currentPartenaire);
  };

  return (
    <div className="p-6">
      {/* Section des statistiques */}
      <StatistiquesPartenaires 
        statistiques={statistiques} 
        isLoading={statsLoading} 
      />
      
      {/* Résumé des partenaires */}
      <ResumePartenaires 
        totalPartenaires={partenaires.length}
        partenairesActifs={partenaires.filter(p => p.actif).length}
        typesPartenaires={types}
      />
      
      {/* Liste des partenaires avec filtres et pagination */}
      <ListePartenaires 
        partenaires={partenaires}
        filteredPartenaires={filteredPartenaires}
        searchTerm={searchTerm}
        typeFilter={typeFilter}
        types={types}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        isLoading={isLoading}
        onSearch={handleSearch}
        onTypeFilterChange={handleTypeFilterChange}
        onPageChange={handlePageChange}
        onAddClick={handleAddPartenaire}
        onEditClick={handleEditPartenaire}
        onDeleteClick={handleDeletePartenaire}
      />
      
      {/* Modales pour les opérations CRUD */}
      <ModaleAjoutPartenaire 
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleSubmitAddPartenaire}
        types={types}
      />
      
      <ModaleEditionPartenaire 
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setCurrentPartenaire(null);
        }}
        onSubmit={handleSubmitEditPartenaire}
        partenaire={currentPartenaire}
        types={types}
      />
      
      <ModaleSuppressionPartenaire 
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setCurrentPartenaire(null);
        }}
        onConfirm={handleConfirmDelete}
        partenaire={currentPartenaire}
      />
    </div>
  );
}

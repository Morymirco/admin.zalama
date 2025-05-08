"use client";

import React, { useState, useEffect } from 'react';
import { DollarSign, Users, ArrowUpCircle } from 'lucide-react';

// Importation des composants
import {
  StatistiquesServices,
  ResumeServices,
  ListeServices,
  ModaleAjoutService,
  ModaleEditionService,
  ModaleSuppressionService
} from '@/components/dashboard/services';

// Types
interface Service {
  id: string;
  nom: string;
  description: string;
  categorie: string;
  prix: number;
  duree: string;
  disponible: boolean;
  dateCreation: string;
}

interface DemandeStats {
  type: string;
  nombre: number;
  approuvees: number;
  enCours: number;
  refusees: number;
  delaiMoyen: number; // en heures
  tendance: 'hausse' | 'stable' | 'baisse';
  icon: React.ReactNode;
}

export default function ServicesPage() {
  // États
  const [services, setServices] = useState<Service[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentService, setCurrentService] = useState<Service | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [categorieFilter, setCategorieFilter] = useState<string>('toutes');
  const [statsLoading, setStatsLoading] = useState(true);
  const [demandeStats, setDemandeStats] = useState<DemandeStats[]>([]);

  // Liste des catégories
  const categories = ['toutes', 'Finance', 'Conseil', 'Marketing', 'RH', 'Technologie', 'Stratégie'];

  // Données fictives pour la démo
  useEffect(() => {
    // Simuler un chargement depuis une API
    setTimeout(() => {
      const mockData: Service[] = [
        { id: '1', nom: 'Demande d\'avance', description: 'Avance sur salaire pour les employés', categorie: 'Finance', prix: 15000, duree: '2 jours', disponible: true, dateCreation: '2025-01-15' },
        { id: '2', nom: 'Prêt P2P', description: 'Prêt entre particuliers via la plateforme', categorie: 'Finance', prix: 25000, duree: '5 jours', disponible: true, dateCreation: '2025-01-20' },
        { id: '3', nom: 'Paiement de salaire', description: 'Service de paiement anticipé de salaire', categorie: 'Finance', prix: 20000, duree: '3 jours', disponible: true, dateCreation: '2025-02-05' },
        { id: '4', nom: 'Conseil financier', description: 'Consultation avec un conseiller financier', categorie: 'Conseil', prix: 50000, duree: '1 jour', disponible: true, dateCreation: '2025-02-10' },
        { id: '5', nom: 'Marketing digital', description: 'Services de marketing pour entreprises', categorie: 'Marketing', prix: 300000, duree: '1 semaine', disponible: true, dateCreation: '2025-02-15' },
        { id: '6', nom: 'Assistance fiscale', description: 'Conseil et optimisation fiscale', categorie: 'Finance', prix: 200000, duree: '2 jours', disponible: false, dateCreation: '2025-03-01' },
        { id: '7', nom: 'Recrutement personnel', description: 'Service de recrutement et sélection de candidats', categorie: 'RH', prix: 350000, duree: '3 semaines', disponible: true, dateCreation: '2025-03-10' },
        { id: '8', nom: 'Maintenance informatique', description: 'Service de maintenance des équipements informatiques', categorie: 'Technologie', prix: 100000, duree: '1 jour', disponible: true, dateCreation: '2025-03-15' },
        { id: '9', nom: 'Formation leadership', description: 'Formation au leadership et management d\'équipe', categorie: 'RH', prix: 180000, duree: '2 jours', disponible: true, dateCreation: '2025-03-20' },
        { id: '10', nom: 'Conseil stratégique', description: 'Consultation sur la stratégie d\'entreprise', categorie: 'Stratégie', prix: 400000, duree: '1 semaine', disponible: true, dateCreation: '2025-04-01' },
      ];
      
      setServices(mockData);
      setFilteredServices(mockData);
      setIsLoading(false);
    }, 1000);

    // Données fictives pour les statistiques des demandes
    setTimeout(() => {
      const statsMockData: DemandeStats[] = [
        {
          type: 'Demandes d\'avance',
          nombre: 156,
          approuvees: 124,
          enCours: 22,
          refusees: 10,
          delaiMoyen: 12, // heures
          tendance: 'hausse',
          icon: <DollarSign className="h-6 w-6 text-[var(--zalama-blue)]" />
        },
        {
          type: 'Prêts P2P',
          nombre: 89,
          approuvees: 65,
          enCours: 18,
          refusees: 6,
          delaiMoyen: 24, // heures
          tendance: 'stable',
          icon: <Users className="h-6 w-6 text-[var(--zalama-success)]" />
        },
        {
          type: 'Paiements de salaire',
          nombre: 210,
          approuvees: 195,
          enCours: 12,
          refusees: 3,
          delaiMoyen: 8, // heures
          tendance: 'hausse',
          icon: <ArrowUpCircle className="h-6 w-6 text-[var(--zalama-warning)]" />
        }
      ];
      
      setDemandeStats(statsMockData);
      setStatsLoading(false);
    }, 1500);
  }, []);

  // Filtrage des services
  useEffect(() => {
    let result = [...services];
    
    // Filtre par recherche
    if (searchTerm) {
      result = result.filter(service => 
        service.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.categorie.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filtre par catégorie
    if (categorieFilter !== 'toutes') {
      result = result.filter(service => service.categorie === categorieFilter);
    }
    
    setFilteredServices(result);
    setCurrentPage(1); // Réinitialiser la pagination lors du filtrage
  }, [searchTerm, categorieFilter, services]);

  // Handlers
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleCategorieFilterChange = (categorie: string) => {
    setCategorieFilter(categorie);
    // Réinitialiser la pagination lors du changement de filtre
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handlers pour les opérations CRUD
  const handleAddService = () => {
    setShowAddModal(true);
  };

  const handleEditService = (service: Service) => {
    setCurrentService(service);
    setShowEditModal(true);
  };

  const handleDeleteService = (service: Service) => {
    setCurrentService(service);
    setShowDeleteModal(true);
  };

  const handleSubmitAddService = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    
    // Génération d'un ID unique
    const newId = Date.now().toString();
    
    const newService: Service = {
      id: newId,
      nom: (form.querySelector('#nom') as HTMLInputElement).value,
      description: (form.querySelector('#description') as HTMLTextAreaElement).value,
      categorie: (form.querySelector('#categorie') as HTMLInputElement).value,
      prix: parseFloat((form.querySelector('#prix') as HTMLInputElement).value),
      duree: (form.querySelector('#duree') as HTMLInputElement).value,
      disponible: (form.querySelector('#disponible') as HTMLInputElement).checked,
      dateCreation: new Date().toISOString().split('T')[0],
    };
    
    setServices([...services, newService]);
    setFilteredServices([...services, newService]);
    setShowAddModal(false);
    
    // Notification de succès (à implémenter)
    console.log('Service ajouté avec succès:', newService);
  };

  const handleSubmitEditService = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!currentService) return;
    
    const form = e.currentTarget;
    
    const updatedService: Service = {
      ...currentService,
      nom: (form.querySelector('#edit-nom') as HTMLInputElement).value,
      description: (form.querySelector('#edit-description') as HTMLTextAreaElement).value,
      categorie: (form.querySelector('#edit-categorie') as HTMLInputElement).value,
      prix: parseFloat((form.querySelector('#edit-prix') as HTMLInputElement).value),
      duree: (form.querySelector('#edit-duree') as HTMLInputElement).value,
      disponible: (form.querySelector('#edit-disponible') as HTMLInputElement).checked,
    };
    
    const updatedServices = services.map(s => s.id === currentService.id ? updatedService : s);
    setServices(updatedServices);
    setFilteredServices(updatedServices);
    setShowEditModal(false);
    setCurrentService(null);
    
    // Notification de succès (à implémenter)
    console.log('Service mis à jour avec succès:', updatedService);
  };

  const handleConfirmDelete = () => {
    if (!currentService) return;
    
    const updatedServices = services.filter(s => s.id !== currentService.id);
    setServices(updatedServices);
    setFilteredServices(updatedServices);
    setShowDeleteModal(false);
    setCurrentService(null);
    
    // Notification de succès (à implémenter)
    console.log('Service supprimé avec succès:', currentService);
  };

  return (
    <div className="p-6">
      {/* Section des statistiques */}
      <StatistiquesServices 
        demandeStats={demandeStats} 
        isLoading={statsLoading} 
      />
      
      {/* Résumé des services */}
      <ResumeServices 
        totalServices={services.length}
        servicesDisponibles={services.filter(s => s.disponible).length}
        categories={categories}
      />
      
      {/* Liste des services avec filtres et pagination */}
      <ListeServices 
        services={services}
        filteredServices={filteredServices}
        searchTerm={searchTerm}
        categorieFilter={categorieFilter}
        categories={categories}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        isLoading={isLoading}
        onSearch={handleSearch}
        onCategorieFilterChange={handleCategorieFilterChange}
        onPageChange={handlePageChange}
        onAddClick={handleAddService}
        onEditClick={handleEditService}
        onDeleteClick={handleDeleteService}
      />
      
      {/* Modales pour les opérations CRUD */}
      <ModaleAjoutService 
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleSubmitAddService}
      />
      
      <ModaleEditionService 
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setCurrentService(null);
        }}
        onSubmit={handleSubmitEditService}
        service={currentService}
      />
      
      <ModaleSuppressionService 
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setCurrentService(null);
        }}
        onConfirm={handleConfirmDelete}
        service={currentService}
      />
    </div>
  );
}

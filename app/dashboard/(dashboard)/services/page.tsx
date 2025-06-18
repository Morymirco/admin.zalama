"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { DollarSign, Users, ArrowUpCircle } from 'lucide-react';
import { Timestamp } from 'firebase/firestore';

// Importation des composants
import {
  StatistiquesServices,
  ResumeServices,
  ListeServices,
  ModaleAjoutService,
  ModaleEditionService,
  ModaleSuppressionService
} from '@/components/dashboard/services';

// Le type UIService est maintenant importé depuis @/types/service

// Importation des services Firebase
import { useFirebaseCollection } from '@/hooks/useFirebaseCollection';
import serviceService, { getAvailableServices, getCategoriesWithCount } from '@/services/serviceService';
import salaryAdvanceService from '@/services/salaryAdvanceService';
import transactionService from '@/services/transactionService';

// Types
import { Service, ServiceFormData, UIService } from '@/types/service';
import { SalaryAdvanceRequest } from '@/types/salaryAdvanceRequest';
import { Transaction } from '@/types/transaction';

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
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentService, setCurrentService] = useState<Service | null>(null);
  const [categorieFilter, setCategorieFilter] = useState<string>('toutes');
  const [statsLoading, setStatsLoading] = useState(true);
  const [demandeStats, setDemandeStats] = useState<DemandeStats[]>([]);
  const [categories, setCategories] = useState<string[]>(['toutes']);

  // Utilisation de notre hook pour récupérer les services depuis Firestore
  const { data: services, loading: isLoading } = useFirebaseCollection<Service>(serviceService);
  
  // Récupération des demandes d'avance sur salaire pour les statistiques
  const { data: demandes, loading: loadingDemandes } = useFirebaseCollection<SalaryAdvanceRequest>(salaryAdvanceService);
  
  // Récupération des transactions pour les statistiques
  const { data: transactions, loading: loadingTransactions } = useFirebaseCollection<Transaction>(transactionService);

  // Filtrer les services en fonction de la recherche et de la catégorie
  const filteredServices = useMemo(() => {
    return services.filter(service => {
      const matchesSearch = searchTerm === '' || 
        service.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = categorieFilter === 'toutes' || service.categorie === categorieFilter;
      
      return matchesSearch && matchesCategory;
    });
  }, [services, searchTerm, categorieFilter]);

  // Récupérer les catégories uniques à partir des services
  useEffect(() => {
    if (!isLoading && services.length > 0) {
      const uniqueCategories = ['toutes', ...new Set(services.map(service => service.categorie))];
      setCategories(uniqueCategories);
    }
  }, [services, isLoading]);

  // Calculer les statistiques des demandes
  useEffect(() => {
    if (!loadingDemandes && !loadingTransactions) {
      // Statistiques pour les avances sur salaire
      const avancesStats: DemandeStats = {
        type: 'Avances sur salaire',
        nombre: demandes.length,
        approuvees: demandes.filter(d => d.statut === 'approuvée').length,
        enCours: demandes.filter(d => d.statut === 'en attente').length,
        refusees: demandes.filter(d => d.statut === 'rejetée').length,
        delaiMoyen: 24, // À calculer à partir des timestamps
        tendance: demandes.length > 100 ? 'hausse' as const : 'stable' as const,
        icon: <DollarSign className="h-5 w-5" />
      };
      
      // Statistiques pour les transactions financières
      const transactionsStats: DemandeStats = {
        type: 'Transactions',
        nombre: transactions.length,
        approuvees: transactions.filter(t => t.statut === 'complete' || t.statut === 'EFFECTUEE').length,
        enCours: transactions.filter(t => t.statut === 'en cours').length,
        refusees: transactions.filter(t => t.statut === 'annulee' || t.statut === 'echouee').length,
        delaiMoyen: 12, // À calculer à partir des timestamps
        tendance: transactions.length > 80 ? 'hausse' as const : 'stable' as const,
        icon: <Users className="h-5 w-5" />
      };
      
      // Statistiques pour les services financiers
      const servicesFinanciers: DemandeStats = {
        type: 'Services financiers',
        nombre: services.filter(s => s.categorie === 'Finance').length,
        approuvees: services.filter(s => s.categorie === 'Finance' && s.disponible).length,
        enCours: 0,
        refusees: services.filter(s => s.categorie === 'Finance' && !s.disponible).length,
        delaiMoyen: 0,
        tendance: services.filter(s => s.categorie === 'Finance').length > 5 ? 'hausse' as const : 'stable' as const,
        icon: <ArrowUpCircle className="h-5 w-5" />
      };
      
      setDemandeStats([avancesStats, transactionsStats, servicesFinanciers]);
      setStatsLoading(false);
    }
  }, [demandes, transactions, services, loadingDemandes, loadingTransactions, isLoading]);

  // Réinitialiser la pagination lors du filtrage
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, categorieFilter]);

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

  const handleEditService = (service: UIService) => {
    // Convertir UIService en Service pour la cohérence interne
    const serviceWithCreatedAt: Service = {
      ...service,
      createdAt: service.createdAt || Timestamp.now() // Utiliser createdAt s'il existe, sinon utiliser maintenant
    };
    setCurrentService(serviceWithCreatedAt);
    setShowEditModal(true);
  };

  const handleDeleteService = (service: UIService) => {
    // Convertir UIService en Service pour la cohérence interne
    const serviceWithCreatedAt: Service = {
      ...service,
      createdAt: service.createdAt || Timestamp.now() // Utiliser createdAt s'il existe, sinon utiliser maintenant
    };
    setCurrentService(serviceWithCreatedAt);
    setShowDeleteModal(true);
  };

  const handleSubmitAddService = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const form = e.currentTarget;
    
    try {
      // Préparer les données du nouveau service
      const serviceData = {
        nom: (form.querySelector('#add-nom') as HTMLInputElement).value,
        description: (form.querySelector('#add-description') as HTMLTextAreaElement).value,
        categorie: (form.querySelector('#add-categorie') as HTMLInputElement).value,
        pourcentageMax: parseFloat((form.querySelector('#add-pourcentage') as HTMLInputElement).value),
        duree: (form.querySelector('#add-duree') as HTMLInputElement).value,
        disponible: (form.querySelector('#add-disponible') as HTMLInputElement).checked,
        createdAt: Timestamp.now(), // Ajouter le timestamp de création
      };
      
      // Ajouter le service à Firestore
      await serviceService.create(serviceData);
      
      setShowAddModal(false);
      
      // Notification de succès (à implémenter)
      console.log('Service ajouté avec succès');
    } catch (error) {
      console.error('Erreur lors de l\'ajout du service:', error);
      // Notification d'erreur (à implémenter)
    }
  }, []);

  const handleSubmitEditService = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!currentService) return;
    
    const form = e.currentTarget;
    
    try {
      // Préparer les données mises à jour
      const updatedData = {
        nom: (form.querySelector('#edit-nom') as HTMLInputElement).value,
        description: (form.querySelector('#edit-description') as HTMLTextAreaElement).value,
        categorie: (form.querySelector('#edit-categorie') as HTMLInputElement).value,
        pourcentageMax: parseFloat((form.querySelector('#edit-pourcentage') as HTMLInputElement).value),
        duree: (form.querySelector('#edit-duree') as HTMLInputElement).value,
        disponible: (form.querySelector('#edit-disponible') as HTMLInputElement).checked,
      };
      
      // Mettre à jour le service dans Firestore
      await serviceService.update(currentService.id, updatedData);
      
      setShowEditModal(false);
      setCurrentService(null);
      
      // Notification de succès (à implémenter)
      console.log('Service mis à jour avec succès');
    } catch (error) {
      console.error('Erreur lors de la mise à jour du service:', error);
      // Notification d'erreur (à implémenter)
    }
  }, [currentService]);

  const handleConfirmDelete = useCallback(async () => {
    if (!currentService) return;
    
    try {
      // Supprimer le service de Firestore
      await serviceService.delete(currentService.id);
      
      setShowDeleteModal(false);
      setCurrentService(null);
      
      // Notification de succès (à implémenter)
      console.log('Service supprimé avec succès');
    } catch (error) {
      console.error('Erreur lors de la suppression du service:', error);
      // Notification d'erreur (à implémenter)
    }
  }, [currentService]);

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

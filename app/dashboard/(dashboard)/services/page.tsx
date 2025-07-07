"use client";

import React, { useState, useCallback } from 'react';
import { Search, Plus, Filter } from 'lucide-react';
import { toast } from 'react-hot-toast';

// Importation des composants
import {
  StatistiquesServices,
  ResumeServices,
  ListeServices,
  ModaleAjoutService,
  ModaleEditionService,
  ModaleSuppressionService
} from '@/components/dashboard/services';

// Importation du hook Supabase
import { useSupabaseServices } from '@/hooks/useSupabaseServices';
import { Service, ServiceFormData, UIService } from '@/types/service';

export default function ServicesPage() {
  // Utilisation du hook Supabase pour les services
  const {
    filteredServices,
    isLoading,
    stats,
    statsLoading,
    searchTerm,
    categorieFilter,
    currentPage,
    totalPages,
    categories,
    setSearchTerm,
    setCategorieFilter,
    setCurrentPage,
    createService,
    updateService,
    deleteService
  } = useSupabaseServices(8);

  // États pour les modales
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentService, setCurrentService] = useState<UIService | null>(null);

  // Handlers
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleCategorieFilterChange = (categorie: string) => {
    setCategorieFilter(categorie);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleAddService = () => {
    setShowAddModal(true);
  };

  const handleEditService = (service: UIService) => {
    setCurrentService(service);
    setShowEditModal(true);
  };

  const handleDeleteService = (service: UIService) => {
    setCurrentService(service);
    setShowDeleteModal(true);
  };

  // Formulaire d'ajout de service
  const handleSubmitAddService = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    try {
      const form = e.currentTarget;
      
      const serviceData: ServiceFormData = {
        nom: (form.querySelector('#add-nom') as HTMLInputElement)?.value || '',
        description: (form.querySelector('#add-description') as HTMLTextAreaElement)?.value || '',
        categorie: (form.querySelector('#add-categorie') as HTMLInputElement)?.value || '',
        frais_attribues: parseFloat((form.querySelector('#add-frais') as HTMLInputElement)?.value || '0'),
        pourcentage_max: parseFloat((form.querySelector('#add-pourcentage') as HTMLInputElement)?.value || '0'),
        duree: (form.querySelector('#add-duree') as HTMLInputElement)?.value || '',
        disponible: (form.querySelector('#add-disponible') as HTMLInputElement)?.checked || false,
      };

      await createService(serviceData);
      
      setShowAddModal(false);
      toast.success('Service ajouté avec succès');
      
    } catch (error) {
      console.error('Erreur lors de l\'ajout du service:', error);
      toast.error('Erreur lors de l\'ajout du service');
    }
  }, [createService]);

  // Formulaire d'édition de service
  const handleSubmitEditService = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!currentService) return;
    
    try {
      const form = e.currentTarget;
      
      const serviceData = {
        nom: (form.querySelector('#edit-nom') as HTMLInputElement)?.value || '',
        description: (form.querySelector('#edit-description') as HTMLTextAreaElement)?.value || '',
        categorie: (form.querySelector('#edit-categorie') as HTMLInputElement)?.value || '',
        frais_attribues: parseFloat((form.querySelector('#edit-frais') as HTMLInputElement)?.value || '0'),
        pourcentage_max: parseFloat((form.querySelector('#edit-pourcentage') as HTMLInputElement)?.value || '0'),
        duree: (form.querySelector('#edit-duree') as HTMLInputElement)?.value || '',
        disponible: (form.querySelector('#edit-disponible') as HTMLInputElement)?.checked || false,
      };

      await updateService(currentService.id, serviceData);
      
      setShowEditModal(false);
      setCurrentService(null);
      toast.success('Service mis à jour avec succès');
      
    } catch (error) {
      console.error('Erreur lors de la mise à jour du service:', error);
      toast.error('Erreur lors de la mise à jour du service');
    }
  }, [currentService, updateService]);

  // Confirmation de suppression
  const handleConfirmDelete = useCallback(async () => {
    if (!currentService) return;
    
    try {
      await deleteService(currentService.id);
      
      setShowDeleteModal(false);
      setCurrentService(null);
      toast.success('Service supprimé avec succès');
      
    } catch (error) {
      console.error('Erreur lors de la suppression du service:', error);
      toast.error('Erreur lors de la suppression du service');
    }
  }, [currentService, deleteService]);

  // Calculer les éléments de la page courante
  const startIndex = (currentPage - 1) * 8;
  const endIndex = startIndex + 8;
  const currentItems = filteredServices.slice(startIndex, endIndex);

  // Vérification de sécurité pour categories
  const safeCategories = categories || ['toutes'];
  const safeFilteredServices = filteredServices || [];

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      {/* En-tête avec recherche et filtres */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-[var(--zalama-text)]">Services</h1>
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-[var(--zalama-text-secondary)]" />
            <input
              type="text"
              placeholder="Rechercher un service..."
              className="px-3 py-1 text-sm border border-[var(--zalama-border)] rounded-lg bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)]"
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-[var(--zalama-text-secondary)]" />
            <select
              value={categorieFilter}
              onChange={(e) => handleCategorieFilterChange(e.target.value)}
              className="px-3 py-1 text-sm border border-[var(--zalama-border)] rounded-lg bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)]"
            >
              {safeCategories.map((categorie) => (
                <option key={categorie} value={categorie}>
                  {categorie === 'toutes' ? 'Toutes les catégories' : categorie}
                </option>
              ))}
            </select>
          </div>
          
          <button
            onClick={handleAddService}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-[var(--zalama-blue)] text-white rounded-lg hover:bg-[var(--zalama-blue-accent)] transition-colors"
          >
            <Plus className="h-4 w-4" />
            Ajouter
          </button>
        </div>
      </div>

      {/* Section des statistiques */}
      <StatistiquesServices 
        serviceStats={stats}
        isLoading={statsLoading}
      />
      
      {/* Résumé des services */}
      <ResumeServices 
        totalServices={safeFilteredServices.length}
        servicesDisponibles={safeFilteredServices.filter(s => s.disponible).length}
        categories={safeCategories}
      />
      
      {/* Liste des services */}
      <ListeServices 
        services={filteredServices || []}
        filteredServices={filteredServices || []}
        searchTerm={searchTerm}
        categorieFilter={categorieFilter}
        categories={safeCategories}
        currentPage={currentPage}
        itemsPerPage={8}
        isLoading={isLoading}
        onSearch={handleSearch}
        onCategorieFilterChange={handleCategorieFilterChange}
        onPageChange={handlePageChange}
        onAddClick={handleAddService}
        onEditClick={handleEditService}
        onDeleteClick={handleDeleteService}
      />
      
      {/* Modales */}
      <ModaleAjoutService 
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleSubmitAddService}
      />
      
      {showEditModal && currentService && (
        <ModaleEditionService 
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setCurrentService(null);
          }}
          onSubmit={handleSubmitEditService}
          service={currentService}
        />
      )}
      
      {showDeleteModal && currentService && (
        <ModaleSuppressionService 
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setCurrentService(null);
          }}
          onConfirm={handleConfirmDelete}
          service={currentService}
        />
      )}
    </div>
  );
}

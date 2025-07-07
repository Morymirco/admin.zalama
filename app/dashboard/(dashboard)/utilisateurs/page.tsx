"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Search, Plus, Filter, Users, Building, Briefcase, UserCheck, UserX } from 'lucide-react';
import { toast } from 'react-hot-toast';

// Importation des composants
import {
  StatistiquesUtilisateurs,
  ListeUtilisateurs,
  ModaleAjoutUtilisateur,
  ModaleEditionUtilisateur,
  ModaleSuppressionUtilisateur
} from '@/components/dashboard/utilisateurs';

// Importation du hook Supabase pour les employés
import { useSupabaseEmployees } from '@/hooks/useSupabaseEmployees';
import { Employee } from '@/types/employee';
import { Partner } from '@/types/employee';

export default function EmployesPage() {
  const [isInitialized, setIsInitialized] = useState(false);

  // Utilisation du hook Supabase pour les employés
  const {
    filteredEmployees: filteredEmployes,
    partners,
    isLoading,
    stats,
    statsLoading,
    searchTerm,
    partnerFilter,
    currentPage,
    totalPages,
    setSearchTerm,
    setPartnerFilter,
    setCurrentPage,
    createEmployee,
    updateEmployee,
    deleteEmployee
  } = useSupabaseEmployees(10);

  // Initialisation progressive pour éviter le flash
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialized(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // États pour les modales
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentEmploye, setCurrentEmploye] = useState<Employee | null>(null);

  // Fonction pour transformer les statistiques en format attendu
  const transformStats = () => {
    if (!stats) return [];
    
    return [
      {
        type: 'Total Employés',
        nombre: stats.total,
        nouveauxCeMois: 0, // À calculer si nécessaire
        actifs: stats.actifs,
        inactifs: stats.inactifs,
        tendance: 'stable' as const,
        icon: <Users className="h-6 w-6 text-[var(--zalama-blue)]" />
      },
      {
        type: 'Employés Actifs',
        nombre: stats.actifs,
        nouveauxCeMois: 0,
        actifs: stats.actifs,
        inactifs: 0,
        tendance: 'stable' as const,
        icon: <UserCheck className="h-6 w-6 text-[var(--zalama-green)]" />
      },
      {
        type: 'Employés Inactifs',
        nombre: stats.inactifs,
        nouveauxCeMois: 0,
        actifs: 0,
        inactifs: stats.inactifs,
        tendance: 'stable' as const,
        icon: <UserX className="h-6 w-6 text-[var(--zalama-orange)]" />
      }
    ];
  };

  // Handlers
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handlePartnerFilterChange = (partnerId: string) => {
    setPartnerFilter(partnerId);
  };

  const handleAddUser = () => {
    setShowAddModal(true);
  };

  const handleEditUser = (employe: Employee) => {
    setCurrentEmploye(employe);
    setShowEditModal(true);
  };

  const handleDeleteUser = (employe: Employee) => {
    setCurrentEmploye(employe);
    setShowDeleteModal(true);
  };

  // Formulaire d'ajout d'employé
  const handleSubmitAddUser = async (formData: FormData) => {
    try {
      const employeeData = {
        partner_id: formData.get('partner_id') as string,
        nom: formData.get('nom') as string,
        prenom: formData.get('prenom') as string,
        email: formData.get('email') as string,
        telephone: formData.get('telephone') as string,
        adresse: formData.get('adresse') as string,
        poste: formData.get('poste') as string,
        role: formData.get('role') as string,
        type_contrat: formData.get('type_contrat') as 'CDI' | 'CDD' | 'Consultant' | 'Stage' | 'Autre',
        salaire_net: parseFloat(formData.get('salaire_net') as string) || 0,
        date_embauche: formData.get('date_embauche') as string,
        actif: true,
        genre: formData.get('genre') as 'Homme' | 'Femme' | 'Autre'
      };

      await createEmployee(employeeData);
      
      setShowAddModal(false);
      toast.success('Employé ajouté avec succès');
      
    } catch (error) {
      console.error("Erreur lors de l'ajout de l'employé:", error);
      toast.error('Erreur lors de l\'ajout de l\'employé');
    }
  };

  // Formulaire d'édition d'employé
  const handleSubmitEditUser = async (formData: FormData) => {
    if (!currentEmploye) return;
    
    try {
      const employeeData = {
        nom: formData.get('nom') as string,
        prenom: formData.get('prenom') as string,
        email: formData.get('email') as string,
        telephone: formData.get('telephone') as string,
        adresse: formData.get('adresse') as string,
        poste: formData.get('poste') as string,
        role: formData.get('role') as string,
        type_contrat: formData.get('type_contrat') as 'CDI' | 'CDD' | 'Consultant' | 'Stage' | 'Autre',
        salaire_net: parseFloat(formData.get('salaire_net') as string) || 0,
        date_embauche: formData.get('date_embauche') as string,
        genre: formData.get('genre') as 'Homme' | 'Femme' | 'Autre'
      };

      await updateEmployee(currentEmploye.id, employeeData);
      
      setShowEditModal(false);
      setCurrentEmploye(null);
      toast.success('Employé mis à jour avec succès');
      
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'employé:", error);
      toast.error('Erreur lors de la mise à jour de l\'employé');
    }
  };

  const handleConfirmDelete = async () => {
    if (!currentEmploye) return;
    
    try {
      await deleteEmployee(currentEmploye.id);
      
      setShowDeleteModal(false);
      setCurrentEmploye(null);
      toast.success('Employé supprimé avec succès');
      
    } catch (error) {
      console.error("Erreur lors de la suppression de l'employé:", error);
      toast.error('Erreur lors de la suppression de l\'employé');
    }
  };

  // Calculer les éléments de la page courante avec optimisation
  const currentItems = useMemo(() => {
    const startIndex = (currentPage - 1) * 10;
    const endIndex = startIndex + 10;
    return (filteredEmployes || []).slice(startIndex, endIndex);
  }, [filteredEmployes, currentPage]);

  // Préparer les options de filtre par partenaire avec optimisation
  const partnerOptions = useMemo(() => [
    { value: 'tous', label: 'Tous les partenaires' },
    ...(partners || []).map(partner => ({
      value: partner.id,
      label: partner.nom
    }))
  ], [partners]);

  // Afficher un skeleton pendant le chargement initial
  if (!isInitialized || isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          {/* Skeleton pour l'en-tête */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div className="flex items-center gap-4">
              <div className="h-8 w-32 bg-[var(--zalama-bg)] rounded"></div>
              <div className="h-8 w-48 bg-[var(--zalama-bg)] rounded"></div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-8 w-32 bg-[var(--zalama-bg)] rounded"></div>
              <div className="h-8 w-40 bg-[var(--zalama-blue)] rounded"></div>
            </div>
          </div>
          
          {/* Skeleton pour les statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="bg-[var(--zalama-card)] rounded-xl shadow-sm p-5 border border-[var(--zalama-border)]">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="h-4 w-20 bg-[var(--zalama-bg)] rounded mb-2"></div>
                    <div className="h-8 w-16 bg-[var(--zalama-bg)] rounded"></div>
                  </div>
                  <div className="h-12 w-12 bg-[var(--zalama-bg)] rounded-full"></div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Skeleton pour la table */}
          <div className="bg-[var(--zalama-card)] rounded-xl shadow-sm border border-[var(--zalama-border)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--zalama-border)]">
                    {Array.from({ length: 8 }).map((_, index) => (
                      <th key={index} className="px-6 py-3 text-left">
                        <div className="h-4 w-20 bg-[var(--zalama-bg)] rounded"></div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--zalama-border)]">
                  {Array.from({ length: 5 }).map((_, rowIndex) => (
                    <tr key={rowIndex}>
                      {Array.from({ length: 8 }).map((_, colIndex) => (
                        <td key={colIndex} className="px-6 py-4">
                          <div className="h-4 w-24 bg-[var(--zalama-bg)] rounded"></div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* En-tête avec recherche et filtres */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-[var(--zalama-text)]">Employés</h1>
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-[var(--zalama-text-secondary)]" />
            <input
              type="text"
              placeholder="Rechercher un employé..."
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
              value={partnerFilter}
              onChange={(e) => handlePartnerFilterChange(e.target.value)}
              className="px-3 py-1 text-sm border border-[var(--zalama-border)] rounded-lg bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)]"
            >
              {partnerOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          <button
            onClick={handleAddUser}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-[var(--zalama-blue)] text-white rounded-lg hover:bg-[var(--zalama-blue-accent)] transition-colors"
          >
            <Plus className="h-4 w-4" />
            Ajouter un employé
          </button>
        </div>
      </div>

      {/* Section des statistiques */}
      <StatistiquesUtilisateurs 
        statistiques={transformStats()}
        isLoading={statsLoading}
      />
      
      {/* Liste des employés */}
      <ListeUtilisateurs 
        utilisateurs={currentItems}
        filteredUtilisateurs={filteredEmployes || []}
        searchTerm={searchTerm}
        typeFilter={partnerFilter}
        types={partnerOptions.map(p => p.value)}
        currentPage={currentPage}
        itemsPerPage={10}
        isLoading={isLoading}
        partners={partners}
        onSearch={handleSearch}
        onTypeFilterChange={handlePartnerFilterChange}
        onPageChange={handlePageChange}
        onAddClick={handleAddUser}
        onEditClick={handleEditUser}
        onDeleteClick={handleDeleteUser}
      />
      
      {/* Modales */}
      <ModaleAjoutUtilisateur 
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleSubmitAddUser}
        types={partnerOptions.filter(p => p.value !== 'tous').map(p => p.value)}
        partners={partners}
      />
      
      {showEditModal && currentEmploye && (
        <ModaleEditionUtilisateur 
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setCurrentEmploye(null);
          }}
          onSubmit={handleSubmitEditUser}
          utilisateur={currentEmploye}
          types={partnerOptions.filter(p => p.value !== 'tous').map(p => p.value)}
          partners={partners}
        />
      )}
      
      {showDeleteModal && currentEmploye && (
        <ModaleSuppressionUtilisateur 
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setCurrentEmploye(null);
          }}
          onConfirm={handleConfirmDelete}
          utilisateur={currentEmploye}
        />
      )}
    </div>
  );
}
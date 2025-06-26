"use client";

import React, { useState } from 'react';
import { Search, Plus, Filter } from 'lucide-react';
import { toast } from 'react-hot-toast';

// Importation des composants
import {
  StatistiquesUtilisateurs,
  ResumeUtilisateurs,
  ListeUtilisateurs,
  ModaleAjoutUtilisateur,
  ModaleEditionUtilisateur,
  ModaleSuppressionUtilisateur
} from '@/components/dashboard/utilisateurs';

// Importation du hook Supabase
import { useSupabaseUsers } from '@/hooks/useSupabaseUsers';
import { Utilisateur } from '@/types/utilisateur';

export default function UtilisateursPage() {
  // Utilisation du hook Supabase pour les utilisateurs
  const {
    filteredUsers: filteredUtilisateurs,
    isLoading,
    stats,
    statsLoading,
    searchTerm,
    typeFilter,
    currentPage,
    totalPages,
    setSearchTerm,
    setTypeFilter,
    setCurrentPage,
    createUser,
    updateUser,
    deleteUser
  } = useSupabaseUsers(10);

  // États pour les modales
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentUtilisateur, setCurrentUtilisateur] = useState<Utilisateur | null>(null);

  // Types d'utilisateurs disponibles
  const types = ['tous', 'etudiant', 'salaries', 'pension'];

  // Handlers
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleTypeFilterChange = (type: string) => {
    setTypeFilter(type);
  };

  const handleAddUser = () => {
    setShowAddModal(true);
  };

  const handleEditUser = (user: Utilisateur) => {
    setCurrentUtilisateur(user);
    setShowEditModal(true);
  };

  const handleDeleteUser = (user: Utilisateur) => {
    setCurrentUtilisateur(user);
    setShowDeleteModal(true);
  };

  // Formulaire d'ajout d'utilisateur
  const handleSubmitAddUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    try {
      const form = e.currentTarget;
      
      const userData = {
        displayName: (form.querySelector('#displayName') as HTMLInputElement)?.value || '',
        email: (form.querySelector('#email') as HTMLInputElement)?.value || '',
        phoneNumber: (form.querySelector('#phoneNumber') as HTMLInputElement)?.value || '',
        role: (form.querySelector('#role') as HTMLSelectElement)?.value || 'user',
        poste: (form.querySelector('#poste') as HTMLInputElement)?.value || '',
        departement: (form.querySelector('#departement') as HTMLInputElement)?.value || '',
        active: (form.querySelector('#active') as HTMLInputElement)?.checked || false,
        type: (form.querySelector('#type') as HTMLSelectElement)?.value || '',
        partenaireId: (form.querySelector('#partenaireId') as HTMLInputElement)?.value || '',
        photoURL: (form.querySelector('#photoURL') as HTMLInputElement)?.value || '',
        etablissement: (form.querySelector('#etablissement') as HTMLInputElement)?.value || '',
        niveauEtudes: (form.querySelector('#niveauEtudes') as HTMLSelectElement)?.value || '',
      };

      await createUser(userData);
      
      setShowAddModal(false);
      toast.success('Utilisateur ajouté avec succès');
      
    } catch (error) {
      console.error("Erreur lors de l'ajout de l'utilisateur:", error);
      toast.error('Erreur lors de l\'ajout de l\'utilisateur');
    }
  };

  // Formulaire d'édition d'utilisateur
  const handleSubmitEditUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!currentUtilisateur) return;
    
    try {
      const form = e.currentTarget;
      
      const userData = {
        displayName: (form.querySelector('#edit-displayName') as HTMLInputElement)?.value || '',
        email: (form.querySelector('#edit-email') as HTMLInputElement)?.value || '',
        phoneNumber: (form.querySelector('#edit-phoneNumber') as HTMLInputElement)?.value || '',
        role: (form.querySelector('#edit-role') as HTMLSelectElement)?.value || 'user',
        poste: (form.querySelector('#edit-poste') as HTMLInputElement)?.value || '',
        departement: (form.querySelector('#edit-departement') as HTMLInputElement)?.value || '',
        active: (form.querySelector('#edit-active') as HTMLInputElement)?.checked || false,
        type: (form.querySelector('#edit-type') as HTMLSelectElement)?.value || '',
        partenaireId: (form.querySelector('#edit-partenaireId') as HTMLInputElement)?.value || '',
        etablissement: (form.querySelector('#edit-etablissement') as HTMLInputElement)?.value || '',
        niveauEtudes: (form.querySelector('#edit-niveauEtudes') as HTMLSelectElement)?.value || '',
      };

      await updateUser(currentUtilisateur.id, userData);
      
      setShowEditModal(false);
      setCurrentUtilisateur(null);
      toast.success('Utilisateur mis à jour avec succès');
      
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'utilisateur:", error);
      toast.error('Erreur lors de la mise à jour de l\'utilisateur');
    }
  };

  const handleConfirmDelete = async () => {
    if (!currentUtilisateur) return;
    
    try {
      await deleteUser(currentUtilisateur.id);
      
      setShowDeleteModal(false);
      setCurrentUtilisateur(null);
      toast.success('Utilisateur supprimé avec succès');
      
    } catch (error) {
      console.error("Erreur lors de la suppression de l'utilisateur:", error);
      toast.error('Erreur lors de la suppression de l\'utilisateur');
    }
  };

  // Calculer les éléments de la page courante
  const startIndex = (currentPage - 1) * 10;
  const endIndex = startIndex + 10;
  const currentItems = (filteredUtilisateurs || []).slice(startIndex, endIndex);

  return (
    <div className="p-6">
      {/* En-tête avec recherche et filtres */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-[var(--zalama-text)]">Utilisateurs</h1>
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-[var(--zalama-text-secondary)]" />
            <input
              type="text"
              placeholder="Rechercher un utilisateur..."
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
              value={typeFilter}
              onChange={(e) => handleTypeFilterChange(e.target.value)}
              className="px-3 py-1 text-sm border border-[var(--zalama-border)] rounded-lg bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)]"
            >
              {types.map((type) => (
                <option key={type} value={type}>
                  {type === 'tous' ? 'Tous les types' : type}
                </option>
              ))}
            </select>
          </div>
          
          <button
            onClick={handleAddUser}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-[var(--zalama-blue)] text-white rounded-lg hover:bg-[var(--zalama-blue-accent)] transition-colors"
          >
            <Plus className="h-4 w-4" />
            Ajouter
          </button>
        </div>
      </div>

      {/* Section des statistiques */}
      <StatistiquesUtilisateurs 
        stats={stats}
        isLoading={statsLoading}
      />
      
      {/* Résumé des utilisateurs */}
      <ResumeUtilisateurs 
        totalUtilisateurs={filteredUtilisateurs.length}
        utilisateursActifs={filteredUtilisateurs.filter(u => u.active).length}
        utilisateursInactifs={filteredUtilisateurs.filter(u => !u.active).length}
        isLoading={isLoading}
      />
      
      {/* Liste des utilisateurs */}
      <ListeUtilisateurs 
        utilisateurs={currentItems}
        filteredUtilisateurs={filteredUtilisateurs || []}
        searchTerm={searchTerm}
        typeFilter={typeFilter}
        types={types}
        currentPage={currentPage}
        itemsPerPage={10}
        isLoading={isLoading}
        onSearch={handleSearch}
        onTypeFilterChange={handleTypeFilterChange}
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
        types={types.filter(t => t !== 'tous')}
      />
      
      {showEditModal && currentUtilisateur && (
        <ModaleEditionUtilisateur 
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setCurrentUtilisateur(null);
          }}
          onSubmit={handleSubmitEditUser}
          utilisateur={currentUtilisateur}
          types={types.filter(t => t !== 'tous')}
        />
      )}
      
      {showDeleteModal && currentUtilisateur && (
        <ModaleSuppressionUtilisateur 
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setCurrentUtilisateur(null);
          }}
          onConfirm={handleConfirmDelete}
          utilisateur={currentUtilisateur}
        />
      )}
    </div>
  );
}
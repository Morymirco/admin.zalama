"use client";
import React, { useState } from 'react';
import { useUsers } from '@/hooks/useDatabase';
import { User } from '@/lib/supabase';
import { Users, Search, Plus, Edit, Trash2, RefreshCw, ChevronLeft, ChevronRight, Briefcase, GraduationCap, Building } from 'lucide-react';
import Image from 'next/image';

interface Utilisateur {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  adresse: string;
  type: 'Étudiant' | 'Salarié' | 'Entreprise';
  statut: 'Actif' | 'Inactif' | 'En attente';
  dateInscription: string;
  photo: string;
  organisation?: string;
  poste?: string;
  niveauEtudes?: string;
  etablissement?: string;
}

interface ListeUtilisateursProps {
  utilisateurs: Utilisateur[];
  filteredUtilisateurs: Utilisateur[];
  searchTerm: string;
  typeFilter: string;
  types: string[];
  currentPage: number;
  itemsPerPage: number;
  isLoading: boolean;
  onSearch: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onTypeFilterChange: (type: string) => void;
  onPageChange: (page: number) => void;
  onAddClick: () => void;
  onEditClick: (utilisateur: Utilisateur) => void;
  onDeleteClick: (utilisateur: Utilisateur) => void;
}

const ListeUtilisateurs: React.FC<ListeUtilisateursProps> = ({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  utilisateurs,
  filteredUtilisateurs,
  searchTerm,
  typeFilter,
  types,
  currentPage,
  itemsPerPage,
  isLoading,
  onSearch,
  onTypeFilterChange,
  onPageChange,
  onAddClick,
  onEditClick,
  onDeleteClick
}) => {
  const { users, loading, error, deleteUser } = useUsers();
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Filtrer les utilisateurs
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.prenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || user.type === filterType;
    const matchesStatus = filterStatus === 'all' || user.statut === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleDeleteUser = async (userId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      try {
        await deleteUser(userId);
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        alert('Erreur lors de la suppression de l\'utilisateur');
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Actif':
        return 'bg-green-100 text-green-800';
      case 'Inactif':
        return 'bg-red-100 text-red-800';
      case 'En attente':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Étudiant':
        return 'bg-blue-100 text-blue-800';
      case 'Salarié':
        return 'bg-purple-100 text-purple-800';
      case 'Entreprise':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredUtilisateurs.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredUtilisateurs.length / itemsPerPage);

  // Fonction pour obtenir l'icône en fonction du type d'utilisateur
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Étudiant':
        return <GraduationCap className="h-4 w-4" />;
      case 'Salarié':
        return <Briefcase className="h-4 w-4" />;
      case 'Entreprise':
        return <Building className="h-4 w-4" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--zalama-blue)]"></div>
        <span className="ml-2 text-[var(--zalama-text-secondary)]">Chargement des utilisateurs...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500 text-center">
          <p>Erreur lors du chargement des utilisateurs</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtres et recherche */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Rechercher par nom, prénom ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-[var(--zalama-border)] rounded-lg bg-[var(--zalama-bg)] text-[var(--zalama-text)] focus:outline-none focus:ring-2 focus:ring-[var(--zalama-blue)]"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border border-[var(--zalama-border)] rounded-lg bg-[var(--zalama-bg)] text-[var(--zalama-text)] focus:outline-none focus:ring-2 focus:ring-[var(--zalama-blue)]"
          >
            <option value="all">Tous les types</option>
            <option value="Étudiant">Étudiants</option>
            <option value="Salarié">Salariés</option>
            <option value="Entreprise">Entreprises</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-[var(--zalama-border)] rounded-lg bg-[var(--zalama-bg)] text-[var(--zalama-text)] focus:outline-none focus:ring-2 focus:ring-[var(--zalama-blue)]"
          >
            <option value="all">Tous les statuts</option>
            <option value="Actif">Actifs</option>
            <option value="Inactif">Inactifs</option>
            <option value="En attente">En attente</option>
          </select>
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[var(--zalama-bg-light)] p-4 rounded-lg">
          <div className="text-2xl font-bold text-[var(--zalama-text)]">{users.length}</div>
          <div className="text-sm text-[var(--zalama-text-secondary)]">Total</div>
        </div>
        <div className="bg-[var(--zalama-bg-light)] p-4 rounded-lg">
          <div className="text-2xl font-bold text-[var(--zalama-text)]">
            {users.filter(u => u.statut === 'Actif').length}
          </div>
          <div className="text-sm text-[var(--zalama-text-secondary)]">Actifs</div>
        </div>
        <div className="bg-[var(--zalama-bg-light)] p-4 rounded-lg">
          <div className="text-2xl font-bold text-[var(--zalama-text)]">
            {users.filter(u => u.type === 'Étudiant').length}
          </div>
          <div className="text-sm text-[var(--zalama-text-secondary)]">Étudiants</div>
        </div>
        <div className="bg-[var(--zalama-bg-light)] p-4 rounded-lg">
          <div className="text-2xl font-bold text-[var(--zalama-text)]">
            {users.filter(u => u.type === 'Entreprise').length}
          </div>
          <div className="text-sm text-[var(--zalama-text-secondary)]">Entreprises</div>
        </div>
      </div>

      {/* Liste des utilisateurs */}
      <div className="bg-[var(--zalama-bg)] rounded-lg border border-[var(--zalama-border)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[var(--zalama-bg-light)]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--zalama-text-secondary)] uppercase tracking-wider">
                  Utilisateur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--zalama-text-secondary)] uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--zalama-text-secondary)] uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--zalama-text-secondary)] uppercase tracking-wider">
                  Date d'inscription
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--zalama-text-secondary)] uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--zalama-border)]">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-[var(--zalama-bg-light)]">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-[var(--zalama-blue)] flex items-center justify-center">
                            <span className="text-white font-medium">
                              {user.prenom?.[0]}{user.nom?.[0]}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-[var(--zalama-text)]">
                            {user.prenom} {user.nom}
                          </div>
                          <div className="text-sm text-[var(--zalama-text-secondary)]">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(user.type)}`}>
                        {user.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(user.statut)}`}>
                        {user.statut}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--zalama-text-secondary)]">
                      {new Date(user.date_inscription).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {/* TODO: Ouvrir modal d'édition */}}
                          className="text-[var(--zalama-blue)] hover:text-[var(--zalama-blue-dark)]"
                        >
                          Modifier
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-[var(--zalama-text-secondary)]">
                    {searchTerm || filterType !== 'all' || filterStatus !== 'all' 
                      ? 'Aucun utilisateur ne correspond aux critères de recherche'
                      : 'Aucun utilisateur trouvé'
                    }
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {filteredUsers.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-[var(--zalama-text-secondary)]">
            Affichage de {filteredUsers.length} utilisateur(s)
          </div>
          <div className="flex space-x-2">
            <button className="px-3 py-1 text-sm border border-[var(--zalama-border)] rounded bg-[var(--zalama-bg)] text-[var(--zalama-text)] hover:bg-[var(--zalama-bg-light)]">
              Précédent
            </button>
            <button className="px-3 py-1 text-sm border border-[var(--zalama-border)] rounded bg-[var(--zalama-bg)] text-[var(--zalama-text)] hover:bg-[var(--zalama-bg-light)]">
              Suivant
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListeUtilisateurs;

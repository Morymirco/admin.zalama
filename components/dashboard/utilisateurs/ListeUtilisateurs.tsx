import React from 'react';
import { Users, Search, Plus, Edit, Trash2, RefreshCw, ChevronLeft, ChevronRight, Briefcase, GraduationCap, Building } from 'lucide-react';
import Image from 'next/image';
import { Utilisateur } from '@/types/utilisateur';

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
  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredUtilisateurs.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredUtilisateurs.length / itemsPerPage);

  // Fonction pour obtenir l'icône en fonction du type d'utilisateur
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'etudiant':
        return <GraduationCap className="h-4 w-4" />;
      case 'salaries':
        return <Briefcase className="h-4 w-4" />;
      case 'pension':
        return <Building className="h-4 w-4" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  // Fonction pour obtenir la couleur du statut
  const getStatusColor = (statut: string) => {
    switch (statut) {
      case 'Actif':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'Inactif':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'En attente':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  return (
    <>
      {/* Barre d'outils et filtres */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-2">
        <div className="relative w-full md:w-64">
          <input
            type="text"
            placeholder="Rechercher..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)]"
            value={searchTerm}
            onChange={onSearch}
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-[var(--zalama-text-secondary)]" />
        </div>
        
        <div className="flex flex-wrap gap-2">
          <button 
            className="flex items-center gap-2 px-4 py-2 bg-[var(--zalama-blue)] hover:bg-[var(--zalama-blue-accent)] text-white rounded-lg transition-colors"
            onClick={onAddClick}
          >
            <Plus className="h-4 w-4" />
            Ajouter
          </button>
          
          <div className="flex items-center">
            <span className="mr-2 text-[var(--zalama-text)]">Type:</span>
            <select 
              value={typeFilter}
              onChange={(e) => onTypeFilterChange(e.target.value)}
              className="px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)]"
            >
              {types.map(type => (
                <option key={type} value={type}>
                  {type === 'tous' ? 'Tous les types' : type}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      {/* Liste des utilisateurs */}
      <div className="bg-[var(--zalama-card)] rounded-xl shadow-sm border border-[var(--zalama-border)] overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin text-[var(--zalama-blue)]" />
            <span className="ml-2 text-[var(--zalama-text)]">Chargement...</span>
          </div>
        ) : filteredUtilisateurs.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-[var(--zalama-text-secondary)]">Aucun utilisateur trouvé</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--zalama-border)]">
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--zalama-text-secondary)] uppercase tracking-wider">Utilisateur</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--zalama-text-secondary)] uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--zalama-text-secondary)] uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--zalama-text-secondary)] uppercase tracking-wider">Statut</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--zalama-text-secondary)] uppercase tracking-wider">Date d&apos;inscription</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-[var(--zalama-text-secondary)] uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--zalama-border)]">
                {currentItems.map((utilisateur) => (
                  <tr key={utilisateur.id} className="hover:bg-[var(--zalama-bg-lighter)]">
                    <td className="px-2 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <Image 
                            className="h-10 w-10 rounded-full object-cover" 
                            src={utilisateur.photoURL || '/images/avatar-placeholder.png'} 
                            width={40}
                            height={40}
                            alt={`${utilisateur.displayName}`}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/images/avatar-placeholder.png';
                            }}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-[var(--zalama-text)]">{utilisateur.displayName}</div>
                          {utilisateur.type === 'salaries' && utilisateur.poste && utilisateur.departement && (
                            <div className="text-xs text-[var(--zalama-text-secondary)]">{utilisateur.poste} - {utilisateur.departement}</div>
                          )}
                          {utilisateur.type === 'etudiant' && utilisateur.niveauEtudes && utilisateur.etablissement && (
                            <div className="text-xs text-[var(--zalama-text-secondary)]">{utilisateur.niveauEtudes} - {utilisateur.etablissement}</div>
                          )}
                          {utilisateur.type === 'pension' && utilisateur.departement && (
                            <div className="text-xs text-[var(--zalama-text-secondary)]">{utilisateur.departement}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-2 py-4 whitespace-nowrap">
                      <div className="text-sm text-[var(--zalama-text)]">{utilisateur.email}</div>
                      <div className="text-xs text-[var(--zalama-text-secondary)]">{utilisateur.phoneNumber}</div>
                    </td>
                    <td className="px-2 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-[var(--zalama-bg-lighter)]">
                          {getTypeIcon(utilisateur.type)}
                          <span>{utilisateur.type}</span>
                        </span>
                      </div>
                    </td>
                    <td className="px-2 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(utilisateur.active ? 'Actif' : 'Inactif')}`}>
                        {utilisateur.active ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className="px-2 py-4 whitespace-nowrap text-sm text-[var(--zalama-text)]">
                      {new Date(utilisateur.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-2 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => onEditClick(utilisateur)}
                          className="p-2 text-[var(--zalama-blue)] hover:bg-[var(--zalama-blue)]/10 rounded"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => onDeleteClick(utilisateur)}
                          className="p-2 text-[var(--zalama-danger)] hover:bg-[var(--zalama-danger)]/10 rounded"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <div className="flex gap-1">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`p-2 rounded ${
                currentPage === 1 
                  ? 'text-[var(--zalama-text-secondary)] cursor-not-allowed' 
                  : 'text-[var(--zalama-text)] hover:bg-[var(--zalama-bg-lighter)]'
              }`}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`px-3 py-1 rounded ${
                  currentPage === page 
                    ? 'bg-[var(--zalama-blue)] text-white' 
                    : 'text-[var(--zalama-text)] hover:bg-[var(--zalama-bg-lighter)]'
                }`}
              >
                {page}
              </button>
            ))}
            
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`p-2 rounded ${
                currentPage === totalPages 
                  ? 'text-[var(--zalama-text-secondary)] cursor-not-allowed' 
                  : 'text-[var(--zalama-text)] hover:bg-[var(--zalama-bg-lighter)]'
              }`}
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ListeUtilisateurs;

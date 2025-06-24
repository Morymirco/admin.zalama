"use client";
import React, { useState } from 'react';
import { useServices } from '@/hooks/useDatabase';
import { Service } from '@/lib/supabase';
import { Search, Plus, Edit, Trash2, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';

interface ListeServicesProps {
  services: Service[];
  filteredServices: Service[];
  searchTerm: string;
  categorieFilter: string;
  categories: string[];
  currentPage: number;
  itemsPerPage: number;
  isLoading: boolean;
  onSearch: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCategorieFilterChange: (categorie: string) => void;
  onPageChange: (page: number) => void;
  onAddClick: () => void;
  onEditClick: (service: Service) => void;
  onDeleteClick: (service: Service) => void;
}

const ListeServices: React.FC<ListeServicesProps> = ({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  services,
  filteredServices,
  searchTerm,
  categorieFilter,
  categories,
  currentPage,
  itemsPerPage,
  isLoading,
  onSearch,
  onCategorieFilterChange,
  onPageChange,
  onAddClick,
  onEditClick,
  onDeleteClick
}) => {
  const { deleteService } = useServices();
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredServices.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredServices.length / itemsPerPage);

  const handleDeleteService = async (serviceId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce service ?')) {
      try {
        await deleteService(serviceId);
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        alert('Erreur lors de la suppression du service');
      }
    }
  };

  const getStatusColor = (disponible: boolean) => {
    return disponible ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const getCategoryColor = (categorie: string) => {
    switch (categorie) {
      case 'Formation':
        return 'bg-blue-100 text-blue-800';
      case 'Consultation':
        return 'bg-purple-100 text-purple-800';
      case 'Support':
        return 'bg-orange-100 text-orange-800';
      case 'Développement':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Filtres et recherche */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Rechercher par nom ou description..."
            value={searchTerm}
            onChange={(e) => onSearch(e)}
            className="w-full px-4 py-2 border border-[var(--zalama-border)] rounded-lg bg-[var(--zalama-bg)] text-[var(--zalama-text)] focus:outline-none focus:ring-2 focus:ring-[var(--zalama-blue)]"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={categorieFilter}
            onChange={(e) => onCategorieFilterChange(e.target.value)}
            className="px-4 py-2 border border-[var(--zalama-border)] rounded-lg bg-[var(--zalama-bg)] text-[var(--zalama-text)] focus:outline-none focus:ring-2 focus:ring-[var(--zalama-blue)]"
          >
            <option value="all">Toutes les catégories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-[var(--zalama-border)] rounded-lg bg-[var(--zalama-bg)] text-[var(--zalama-text)] focus:outline-none focus:ring-2 focus:ring-[var(--zalama-blue)]"
          >
            <option value="all">Tous les statuts</option>
            <option value="Disponible">Disponibles</option>
            <option value="Indisponible">Indisponibles</option>
          </select>
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[var(--zalama-bg-light)] p-4 rounded-lg">
          <div className="text-2xl font-bold text-[var(--zalama-text)]">{services.length}</div>
          <div className="text-sm text-[var(--zalama-text-secondary)]">Total</div>
        </div>
        <div className="bg-[var(--zalama-bg-light)] p-4 rounded-lg">
          <div className="text-2xl font-bold text-[var(--zalama-text)]">
            {services.filter(s => s.disponible).length}
          </div>
          <div className="text-sm text-[var(--zalama-text-secondary)]">Disponibles</div>
        </div>
        <div className="bg-[var(--zalama-bg-light)] p-4 rounded-lg">
          <div className="text-2xl font-bold text-[var(--zalama-text)]">
            {categories.length}
          </div>
          <div className="text-sm text-[var(--zalama-text-secondary)]">Catégories</div>
        </div>
        <div className="bg-[var(--zalama-bg-light)] p-4 rounded-lg">
          <div className="text-2xl font-bold text-[var(--zalama-text)]">
            {services.reduce((sum, service) => sum + service.prix, 0).toLocaleString()} FCFA
          </div>
          <div className="text-sm text-[var(--zalama-text-secondary)]">Valeur totale</div>
        </div>
      </div>

      {/* Liste des services */}
      <div className="bg-[var(--zalama-bg)] rounded-lg border border-[var(--zalama-border)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[var(--zalama-bg-light)]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--zalama-text-secondary)] uppercase tracking-wider">
                  Service
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--zalama-text-secondary)] uppercase tracking-wider">
                  Catégorie
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--zalama-text-secondary)] uppercase tracking-wider">
                  Prix
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--zalama-text-secondary)] uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--zalama-text-secondary)] uppercase tracking-wider">
                  Date de création
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--zalama-text-secondary)] uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--zalama-border)]">
              {filteredServices.length > 0 ? (
                filteredServices.map((service) => (
                  <tr key={service.id} className="hover:bg-[var(--zalama-bg-light)]">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-lg bg-[var(--zalama-blue)] flex items-center justify-center">
                            <span className="text-white font-medium">
                              {service.nom?.[0]}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-[var(--zalama-text)]">
                            {service.nom}
                          </div>
                          {service.description && (
                            <div className="text-sm text-[var(--zalama-text-secondary)] truncate max-w-xs">
                              {service.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(service.categorie)}`}>
                        {service.categorie}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-[var(--zalama-text)]">
                        {service.prix.toLocaleString()} FCFA
                      </div>
                      {service.duree && (
                        <div className="text-sm text-[var(--zalama-text-secondary)]">
                          {service.duree}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(service.disponible)}`}>
                        {service.disponible ? 'Disponible' : 'Indisponible'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--zalama-text-secondary)]">
                      {new Date(service.date_creation).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => onEditClick(service)}
                          className="text-[var(--zalama-blue)] hover:text-[var(--zalama-blue-dark)]"
                        >
                          Modifier
                        </button>
                        <button
                          onClick={() => handleDeleteService(service.id)}
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
                  <td colSpan={6} className="px-6 py-8 text-center text-[var(--zalama-text-secondary)]">
                    {searchTerm || categorieFilter !== 'all' || filterStatus !== 'all' 
                      ? 'Aucun service ne correspond aux critères de recherche'
                      : 'Aucun service trouvé'
                    }
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {filteredServices.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-[var(--zalama-text-secondary)]">
            Affichage de {filteredServices.length} service(s)
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-3 py-1 text-sm border border-[var(--zalama-border)] rounded bg-[var(--zalama-bg)] text-[var(--zalama-text)] hover:bg-[var(--zalama-bg-light)]`}
            >
              Précédent
            </button>
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`px-3 py-1 text-sm border border-[var(--zalama-border)] rounded bg-[var(--zalama-bg)] text-[var(--zalama-text)] hover:bg-[var(--zalama-bg-light)]`}
            >
              Suivant
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListeServices;

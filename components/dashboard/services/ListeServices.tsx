import React from 'react';
import { Search, Plus, Edit, Trash2, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';

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
  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredServices.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredServices.length / itemsPerPage);

  return (
    <>
      {/* Barre d'outils et filtres */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
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
            <span className="mr-2 text-[var(--zalama-text)]">Catégorie:</span>
            <select 
              value={categorieFilter}
              onChange={(e) => onCategorieFilterChange(e.target.value)}
              className="px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)]"
            >
              {categories.map(categorie => (
                <option key={categorie} value={categorie}>
                  {categorie === 'toutes' ? 'Toutes les catégories' : categorie}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      {/* Grille des services */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {isLoading ? (
          <div className="col-span-full flex justify-center items-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin text-[var(--zalama-blue)]" />
            <span className="ml-2 text-[var(--zalama-text)]">Chargement...</span>
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="col-span-full py-12 text-center">
            <p className="text-[var(--zalama-text-secondary)]">Aucun service trouvé</p>
          </div>
        ) : (
          currentItems.map((service) => (
            <div key={service.id} className="bg-[var(--zalama-card)] rounded-xl shadow-sm overflow-hidden border border-[var(--zalama-border)]">
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-semibold text-[var(--zalama-text)] mb-2">{service.nom}</h3>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    service.disponible 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                      : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                  }`}>
                    {service.disponible ? 'Disponible' : 'Indisponible'}
                  </span>
                </div>
                
                <p className="text-[var(--zalama-text-secondary)] text-sm mb-4 line-clamp-2">{service.description}</p>
                
                <div className="flex flex-col space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span className="text-[var(--zalama-text-secondary)] text-sm">Catégorie:</span>
                    <span className="text-[var(--zalama-text)] text-sm font-medium">{service.categorie}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--zalama-text-secondary)] text-sm">Prix:</span>
                    <span className="text-[var(--zalama-text)] text-sm font-medium">{service.prix.toLocaleString()} GNF</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--zalama-text-secondary)] text-sm">Durée:</span>
                    <span className="text-[var(--zalama-text)] text-sm font-medium">{service.duree}</span>
                  </div>
                </div>
                
                <div className="flex justify-end gap-2 pt-2 border-t border-[var(--zalama-border)]">
                  <button 
                    onClick={() => onEditClick(service)}
                    className="p-2 text-[var(--zalama-blue)] hover:bg-[var(--zalama-blue)]/10 rounded"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => onDeleteClick(service)}
                    className="p-2 text-[var(--zalama-danger)] hover:bg-[var(--zalama-danger)]/10 rounded"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
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

export default ListeServices;

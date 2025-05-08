import React from 'react';
import { Search, Plus, Edit, Trash2, RefreshCw, ChevronLeft, ChevronRight, Mail, Phone, Globe } from 'lucide-react';
import Image from 'next/image';

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

interface ListePartenairesProps {
  partenaires: Partenaire[];
  filteredPartenaires: Partenaire[];
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
  onEditClick: (partenaire: Partenaire) => void;
  onDeleteClick: (partenaire: Partenaire) => void;
}

const ListePartenaires: React.FC<ListePartenairesProps> = ({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  partenaires,
  filteredPartenaires,
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
  const currentItems = filteredPartenaires.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredPartenaires.length / itemsPerPage);

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
      
      {/* Grille des partenaires */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full flex justify-center items-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin text-[var(--zalama-blue)]" />
            <span className="ml-2 text-[var(--zalama-text)]">Chargement...</span>
          </div>
        ) : filteredPartenaires.length === 0 ? (
          <div className="col-span-full py-12 text-center">
            <p className="text-[var(--zalama-text-secondary)]">Aucun partenaire trouvé</p>
          </div>
        ) : (
          currentItems.map((partenaire) => (
            <div key={partenaire.id} className="bg-[var(--zalama-card)] rounded-xl shadow-sm overflow-hidden border border-[var(--zalama-border)]">
              <div className="relative h-32 bg-gradient-to-r from-[var(--zalama-blue)]/20 to-[var(--zalama-blue)]/5">
                <div className="absolute top-4 right-4">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    partenaire.actif 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                      : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                  }`}>
                    {partenaire.actif ? 'Actif' : 'Inactif'}
                  </span>
                </div>
                <div className="absolute -bottom-10 left-4">
                  <div className="w-20 h-20 rounded-xl bg-white shadow-md flex items-center justify-center p-1">
                    <Image 
                      src={partenaire.logo} 
                      alt={`Logo ${partenaire.nom}`}
                      height={80}
                      width={80}
                      className="max-w-full max-h-full object-contain"
                      onError={(e) => {
                        // Fallback si l'image ne charge pas
                        (e.target as HTMLImageElement).src = '/images/partners/default.png';
                      }}
                    />
                  </div>
                </div>
              </div>
              
              <div className="p-4 pt-12">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-[var(--zalama-text)] mb-1">{partenaire.nom}</h3>
                    <div className="flex items-center text-xs text-[var(--zalama-text-secondary)]">
                      <span className="px-2 py-0.5 bg-[var(--zalama-bg-lighter)] rounded-full">{partenaire.type}</span>
                      <span className="mx-1">•</span>
                      <span>{partenaire.secteur}</span>
                    </div>
                  </div>
                </div>
                
                <p className="text-[var(--zalama-text-secondary)] text-sm mt-3 mb-4 line-clamp-2">{partenaire.description}</p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm">
                    <Mail className="h-4 w-4 text-[var(--zalama-text-secondary)] mr-2" />
                    <a href={`mailto:${partenaire.email}`} className="text-[var(--zalama-blue)] hover:underline truncate">{partenaire.email}</a>
                  </div>
                  <div className="flex items-center text-sm">
                    <Phone className="h-4 w-4 text-[var(--zalama-text-secondary)] mr-2" />
                    <span className="text-[var(--zalama-text)]">{partenaire.telephone}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Globe className="h-4 w-4 text-[var(--zalama-text-secondary)] mr-2" />
                    <a href={`https://${partenaire.siteWeb}`} target="_blank" rel="noopener noreferrer" className="text-[var(--zalama-blue)] hover:underline truncate">{partenaire.siteWeb}</a>
                  </div>
                </div>
                
                <div className="flex justify-end gap-2 pt-2 border-t border-[var(--zalama-border)]">
                  <button 
                    onClick={() => onEditClick(partenaire)}
                    className="p-2 text-[var(--zalama-blue)] hover:bg-[var(--zalama-blue)]/10 rounded"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => onDeleteClick(partenaire)}
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

export default ListePartenaires;

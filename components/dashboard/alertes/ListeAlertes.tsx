import React from 'react';
import { Search, Plus, Edit, Trash2, RefreshCw, ChevronLeft, ChevronRight, AlertTriangle, AlertCircle, BellRing, CheckCircle, Clock } from 'lucide-react';

interface Alerte {
  id: string;
  titre: string;
  description: string;
  type: 'Critique' | 'Importante' | 'Information';
  statut: 'Résolue' | 'En cours' | 'Nouvelle';
  dateCreation: string;
  dateResolution?: string;
  source: string;
  assigneA?: string;
}

interface ListeAlertesProps {
  alertes: Alerte[];
  filteredAlertes: Alerte[];
  searchTerm: string;
  typeFilter: string;
  types: string[];
  statutFilter: string;
  statuts: string[];
  currentPage: number;
  itemsPerPage: number;
  isLoading: boolean;
  onSearch: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onTypeFilterChange: (type: string) => void;
  onStatutFilterChange: (statut: string) => void;
  onPageChange: (page: number) => void;
  onAddClick: () => void;
  onEditClick: (alerte: Alerte) => void;
  onDeleteClick: (alerte: Alerte) => void;
  onResolveClick: (alerte: Alerte) => void;
}

const ListeAlertes: React.FC<ListeAlertesProps> = ({
  filteredAlertes,
  searchTerm,
  typeFilter,
  types,
  statutFilter,
  statuts,
  currentPage,
  itemsPerPage,
  isLoading,
  onSearch,
  onTypeFilterChange,
  onStatutFilterChange,
  onPageChange,
  onAddClick,
  onEditClick,
  onDeleteClick,
  onResolveClick
}) => {
  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredAlertes.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredAlertes.length / itemsPerPage);

  // Fonction pour obtenir l'icône en fonction du type d'alerte
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Critique':
        return <AlertTriangle className="h-4 w-4 text-[var(--zalama-danger)]" />;
      case 'Importante':
        return <AlertCircle className="h-4 w-4 text-[var(--zalama-warning)]" />;
      case 'Information':
        return <BellRing className="h-4 w-4 text-[var(--zalama-info)]" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  // Fonction pour obtenir la couleur du statut
  const getStatusColor = (statut: string) => {
    switch (statut) {
      case 'Résolue':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'En cours':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'Nouvelle':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  // Fonction pour obtenir l'icône du statut
  const getStatusIcon = (statut: string) => {
    switch (statut) {
      case 'Résolue':
        return <CheckCircle className="h-4 w-4 text-[var(--zalama-success)]" />;
      case 'En cours':
        return <Clock className="h-4 w-4 text-[var(--zalama-warning)]" />;
      case 'Nouvelle':
        return <AlertCircle className="h-4 w-4 text-[var(--zalama-info)]" />;
      default:
        return null;
    }
  };

  return (
    <>
      {/* Barre d'outils et filtres */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div className="relative w-full md:w-64 ">
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
          
          <div className="flex items-center">
            <span className="mr-2 text-[var(--zalama-text)]">Statut:</span>
            <select 
              value={statutFilter}
              onChange={(e) => onStatutFilterChange(e.target.value)}
              className="px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)]"
            >
              {statuts.map(statut => (
                <option key={statut} value={statut}>
                  {statut === 'tous' ? 'Tous les statuts' : statut}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      {/* Liste des alertes */}
      <div className="bg-[var(--zalama-card)] rounded-xl shadow-sm border border-[var(--zalama-border)] overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin text-[var(--zalama-blue)]" />
            <span className="text-[var(--zalama-text)]">Chargement...</span>
          </div>
        ) : filteredAlertes.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-[var(--zalama-text-secondary)]">Aucune alerte trouvée</p>
          </div>
        ) : (
          <div className="">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--zalama-border)]">
                  <th className="px-2 py-3 text-left text-xs font-medium text-[var(--zalama-text-secondary)] uppercase tracking-wider">Alerte</th>
                  <th className="px-2 py-3 text-left text-xs font-medium text-[var(--zalama-text-secondary)] uppercase tracking-wider">Type</th>
                  <th className="px-2 py-3 text-left text-xs font-medium text-[var(--zalama-text-secondary)] uppercase tracking-wider">Statut</th>
                  <th className="px-2 py-3 text-left text-xs font-medium text-[var(--zalama-text-secondary)] uppercase tracking-wider">Source</th>
                  <th className="px-2 py-3 text-left text-xs font-medium text-[var(--zalama-text-secondary)] uppercase tracking-wider">Date</th>
                  <th className="px-2 py-3 text-right text-xs font-medium text-[var(--zalama-text-secondary)] uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--zalama-border)]">
                {currentItems.map((alerte) => (
                  <tr key={alerte.id} className="hover:bg-[var(--zalama-bg-lighter)]">
                    <td className="px-2 py-4 whitespace-nowrap">
                      <div className="flex items-start">
                        <div className="ml-0">
                          <div className="text-sm font-medium text-[var(--zalama-text)]">{alerte.titre}</div>
                          <div className="text-xs text-[var(--zalama-text-secondary)] max-w-md truncate">{alerte.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-2 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-[var(--zalama-bg-lighter)]">
                          {getTypeIcon(alerte.type)}
                          <span>{alerte.type}</span>
                        </span>
                      </div>
                    </td>
                    <td className="px-2 py-4 whitespace-nowrap">
                      <span className={`flex items-center gap-1 px-2 py-1 text-xs rounded-full ${getStatusColor(alerte.statut)}`}>
                        {getStatusIcon(alerte.statut)}
                        <span>{alerte.statut}</span>
                      </span>
                    </td>
                    <td className="px-2 py-4 whitespace-wrap text-sm text-[var(--zalama-text)]">
                      {alerte.source}
                    </td>
                    <td className="px-2 py-4 whitespace-nowrap text-sm text-[var(--zalama-text)]">
                      {new Date(alerte.dateCreation).toLocaleDateString()}
                    </td>
                    <td className="px-2 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        {alerte.statut !== 'Résolue' && (
                          <button 
                            onClick={() => onResolveClick(alerte)}
                            className="p-2 text-[var(--zalama-success)] hover:bg-[var(--zalama-success)]/10 rounded"
                            title="Marquer comme résolue"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                        )}
                        <button 
                          onClick={() => onEditClick(alerte)}
                          className="p-2 text-[var(--zalama-blue)] hover:bg-[var(--zalama-blue)]/10 rounded"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => onDeleteClick(alerte)}
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

export default ListeAlertes;

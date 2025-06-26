import React from 'react';
import { Users, Search, Plus, Edit, Trash2, RefreshCw, ChevronLeft, ChevronRight, Briefcase, Building, UserCheck, UserX } from 'lucide-react';
import Image from 'next/image';
import { Employe } from '@/types/partenaire';
import { Partenaire } from '@/types/partenaire';

interface ListeUtilisateursProps {
  utilisateurs: Employe[];
  filteredUtilisateurs: Employe[];
  searchTerm: string;
  typeFilter: string;
  types?: string[];
  currentPage: number;
  itemsPerPage: number;
  isLoading: boolean;
  partners?: Partenaire[];
  onSearch: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onTypeFilterChange: (type: string) => void;
  onPageChange: (page: number) => void;
  onAddClick: () => void;
  onEditClick: (utilisateur: Employe) => void;
  onDeleteClick: (utilisateur: Employe) => void;
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
  partners,
  onSearch,
  onTypeFilterChange,
  onPageChange,
  onAddClick,
  onEditClick,
  onDeleteClick
}) => {
  // Vérification de sécurité pour toutes les props critiques
  const safeFilteredUtilisateurs = filteredUtilisateurs || [];
  const safeTypes = types || ['tous'];
  const safeSearchTerm = searchTerm || '';
  const safeTypeFilter = typeFilter || 'tous';
  const safeCurrentPage = currentPage || 1;
  const safeItemsPerPage = itemsPerPage || 10;
  const safePartners = partners || [];
  
  // Vérification des handlers
  const safeOnSearch = onSearch || (() => {});
  const safeOnTypeFilterChange = onTypeFilterChange || (() => {});
  const safeOnPageChange = onPageChange || (() => {});
  const safeOnAddClick = onAddClick || (() => {});
  const safeOnEditClick = onEditClick || (() => {});
  const safeOnDeleteClick = onDeleteClick || (() => {});
  
  // Pagination
  const indexOfLastItem = safeCurrentPage * safeItemsPerPage;
  const indexOfFirstItem = indexOfLastItem - safeItemsPerPage;
  const currentItems = safeFilteredUtilisateurs.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(safeFilteredUtilisateurs.length / safeItemsPerPage);

  // Fonction pour obtenir le nom du partenaire
  const getPartnerName = (partnerId: string) => {
    const partner = safePartners.find(p => p.id === partnerId);
    return partner?.nom || 'Partenaire inconnu';
  };

  // Fonction pour obtenir l'icône en fonction du poste
  const getPosteIcon = (poste: string) => {
    if (poste?.toLowerCase().includes('manager') || poste?.toLowerCase().includes('directeur')) {
      return <Briefcase className="h-4 w-4" />;
    }
    return <Users className="h-4 w-4" />;
  };

  // Fonction pour obtenir la couleur du statut
  const getStatusColor = (actif: boolean) => {
    return actif 
      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
      : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
  };

  // Fonction pour formater le salaire
  const formatSalary = (salary: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'GNF'
    }).format(salary);
  };

  return (
    <>
      {/* Barre d'outils et filtres */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-2">
        <div className="relative w-full md:w-64">
          <input
            type="text"
            placeholder="Rechercher un employé..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)]"
            value={safeSearchTerm}
            onChange={safeOnSearch}
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-[var(--zalama-text-secondary)]" />
        </div>
        
        <div className="flex flex-wrap gap-2">
          <button 
            className="flex items-center gap-2 px-4 py-2 bg-[var(--zalama-blue)] hover:bg-[var(--zalama-blue-accent)] text-white rounded-lg transition-colors"
            onClick={safeOnAddClick}
          >
            <Plus className="h-4 w-4" />
            Ajouter un employé
          </button>
          
          <div className="flex items-center">
            <span className="mr-2 text-[var(--zalama-text)]">Partenaire:</span>
            <select 
              value={safeTypeFilter}
              onChange={(e) => safeOnTypeFilterChange(e.target.value)}
              className="px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)]"
            >
              {safeTypes.map(type => (
                <option key={type} value={type}>
                  {type === 'tous' ? 'Tous les partenaires' : getPartnerName(type)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      {/* Liste des employés */}
      <div className="bg-[var(--zalama-card)] rounded-xl shadow-sm border border-[var(--zalama-border)] overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin text-[var(--zalama-blue)]" />
            <span className="ml-2 text-[var(--zalama-text)]">Chargement...</span>
          </div>
        ) : safeFilteredUtilisateurs.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-[var(--zalama-text-secondary)]">Aucun employé trouvé</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--zalama-border)]">
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--zalama-text-secondary)] uppercase tracking-wider">Employé</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--zalama-text-secondary)] uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--zalama-text-secondary)] uppercase tracking-wider">Partenaire</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--zalama-text-secondary)] uppercase tracking-wider">Poste</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--zalama-text-secondary)] uppercase tracking-wider">Salaire</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--zalama-text-secondary)] uppercase tracking-wider">Statut</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--zalama-text-secondary)] uppercase tracking-wider">Date d'embauche</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-[var(--zalama-text-secondary)] uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--zalama-border)]">
                {currentItems.map((employe) => (
                  <tr key={employe.id} className="hover:bg-[var(--zalama-bg-lighter)]">
                    <td className="px-2 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <Image 
                            className="h-10 w-10 rounded-full object-cover" 
                            src={employe.photo_url || '/images/avatar-placeholder.png'} 
                            width={40}
                            height={40}
                            alt={`${employe.prenom} ${employe.nom}`}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/images/avatar-placeholder.png';
                            }}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-[var(--zalama-text)]">
                            {employe.prenom} {employe.nom}
                          </div>
                          <div className="text-xs text-[var(--zalama-text-secondary)]">
                            {employe.role || 'Employé'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-2 py-4 whitespace-nowrap">
                      <div className="text-sm text-[var(--zalama-text)]">{employe.email}</div>
                      <div className="text-xs text-[var(--zalama-text-secondary)]">{employe.telephone}</div>
                    </td>
                    <td className="px-2 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-[var(--zalama-bg-lighter)]">
                          <Building className="h-4 w-4" />
                          <span>{getPartnerName(employe.partner_id)}</span>
                        </span>
                      </div>
                    </td>
                    <td className="px-2 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-[var(--zalama-bg-lighter)]">
                          {getPosteIcon(employe.poste)}
                          <span>{employe.poste}</span>
                        </span>
                      </div>
                    </td>
                    <td className="px-2 py-4 whitespace-nowrap text-sm text-[var(--zalama-text)]">
                      {formatSalary(employe.salaire_net || 0)}
                    </td>
                    <td className="px-2 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(employe.actif)}`}>
                        {employe.actif ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className="px-2 py-4 whitespace-nowrap text-sm text-[var(--zalama-text-secondary)]">
                      {employe.date_embauche ? new Date(employe.date_embauche).toLocaleDateString('fr-FR') : 'N/A'}
                    </td>
                    <td className="px-2 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => safeOnEditClick(employe)}
                          className="p-2 text-[var(--zalama-blue)] hover:bg-[var(--zalama-blue)]/10 rounded"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => safeOnDeleteClick(employe)}
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
              onClick={() => safeOnPageChange(safeCurrentPage - 1)}
              disabled={safeCurrentPage === 1}
              className={`p-2 rounded ${
                safeCurrentPage === 1 
                  ? 'text-[var(--zalama-text-secondary)] cursor-not-allowed' 
                  : 'text-[var(--zalama-text)] hover:bg-[var(--zalama-bg-lighter)]'
              }`}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => safeOnPageChange(page)}
                className={`px-3 py-1 rounded ${
                  safeCurrentPage === page 
                    ? 'bg-[var(--zalama-blue)] text-white' 
                    : 'text-[var(--zalama-text)] hover:bg-[var(--zalama-bg-lighter)]'
                }`}
              >
                {page}
              </button>
            ))}
            
            <button
              onClick={() => safeOnPageChange(safeCurrentPage + 1)}
              disabled={safeCurrentPage === totalPages}
              className={`p-2 rounded ${
                safeCurrentPage === totalPages 
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


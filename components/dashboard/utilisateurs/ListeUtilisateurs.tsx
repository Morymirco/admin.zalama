import React from 'react';
import { Users, Search, Plus, Edit, Trash2, ChevronLeft, ChevronRight, Briefcase, Building, UserCheck, UserX } from 'lucide-react';
import Image from 'next/image';
import { Employee, Partner } from '@/types/employee';
import { TableSkeleton } from '@/components/ui/skeleton';

interface ListeUtilisateursProps {
  utilisateurs: Employee[];
  filteredUtilisateurs: Employee[];
  searchTerm: string;
  typeFilter: string;
  types?: string[];
  currentPage: number;
  itemsPerPage: number;
  isLoading: boolean;
  partners?: Partner[];
  onSearch: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onTypeFilterChange: (type: string) => void;
  onPageChange: (page: number) => void;
  onAddClick: () => void;
  onEditClick: (utilisateur: Employee) => void;
  onDeleteClick: (utilisateur: Employee) => void;
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
      {/* Informations sur les résultats */}
      <div className="mb-4 flex items-center justify-between">
        <div className="text-sm text-[var(--zalama-text-secondary)]">
          {safeFilteredUtilisateurs.length} employé{safeFilteredUtilisateurs.length !== 1 ? 's' : ''} trouvé{safeFilteredUtilisateurs.length !== 1 ? 's' : ''}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-[var(--zalama-text-secondary)]">Partenaire:</span>
          <select 
            value={safeTypeFilter}
            onChange={(e) => safeOnTypeFilterChange(e.target.value)}
            className="px-3 py-1 text-sm rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)]"
          >
            {safeTypes.map(type => (
              <option key={type} value={type}>
                {type === 'tous' ? 'Tous les partenaires' : getPartnerName(type)}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Liste des employés */}
      {isLoading ? (
        <TableSkeleton rows={8} />
      ) : safeFilteredUtilisateurs.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-[var(--zalama-text-secondary)]">Aucun employé trouvé</p>
          </div>
        ) : (
          <div className="bg-[var(--zalama-card)] rounded-xl shadow-sm border border-[var(--zalama-border)] overflow-hidden">
            <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--zalama-border)]">
                  <th className="px-4 py-3 text-left text-xs font-medium text-[var(--zalama-text-secondary)] uppercase tracking-wider w-1/4">Employé</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[var(--zalama-text-secondary)] uppercase tracking-wider w-1/5">Contact</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[var(--zalama-text-secondary)] uppercase tracking-wider w-1/6">Partenaire & Poste</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[var(--zalama-text-secondary)] uppercase tracking-wider w-1/6">Salaire & Statut</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[var(--zalama-text-secondary)] uppercase tracking-wider w-1/6">Date d'embauche</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-[var(--zalama-text-secondary)] uppercase tracking-wider w-20">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--zalama-border)]">
                {currentItems.map((employe) => (
                  <tr key={employe.id} className="hover:bg-[var(--zalama-bg-lighter)]">
                    <td className="px-4 py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0 relative">
                          <Image 
                            className="h-10 w-10 rounded-full object-cover border-2 border-[var(--zalama-border)] shadow-sm" 
                            src={employe.photo_url || '/images/avatar-placeholder.svg'} 
                            width={40}
                            height={40}
                            alt={`Photo de ${employe.prenom} ${employe.nom}`}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/images/avatar-placeholder.svg';
                            }}
                          />
                          {/* Indicateur de statut en ligne */}
                          <div className={`absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-white ${
                            employe.actif ? 'bg-green-500' : 'bg-gray-400'
                          }`}></div>
                        </div>
                        <div className="ml-3 min-w-0 flex-1">
                          <div className="text-sm font-semibold text-[var(--zalama-text)] truncate">
                            {employe.prenom} {employe.nom}
                          </div>
                          <div className="text-xs text-[var(--zalama-text-secondary)] truncate">
                            {employe.role || 'Employé'}
                            {employe.genre && (
                              <span className="ml-1">• {employe.genre}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm text-[var(--zalama-text)] truncate">{employe.email}</div>
                      <div className="text-xs text-[var(--zalama-text-secondary)] truncate">{employe.telephone}</div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1">
                          <Building className="h-3 w-3 text-[var(--zalama-text-secondary)]" />
                          <span className="text-xs text-[var(--zalama-text)] truncate">
                            {getPartnerName(employe.partner_id || '')}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          {getPosteIcon(employe.poste)}
                          <span className="text-xs text-[var(--zalama-text-secondary)] truncate">
                            {employe.poste}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="space-y-1">
                        <div className="text-sm font-medium text-[var(--zalama-text)]">
                          {formatSalary(employe.salaire_net || 0)}
                        </div>
                        <span className={`inline-block px-2 py-1 text-xs rounded-full ${getStatusColor(employe.actif)}`}>
                          {employe.actif ? 'Actif' : 'Inactif'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-[var(--zalama-text-secondary)]">
                      {employe.date_embauche ? new Date(employe.date_embauche).toLocaleDateString('fr-FR') : 'N/A'}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex justify-end gap-1">
                        <button 
                          onClick={() => safeOnEditClick(employe)}
                          className="p-1.5 text-[var(--zalama-blue)] hover:bg-[var(--zalama-blue)]/10 rounded transition-colors"
                          title="Modifier"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => safeOnDeleteClick(employe)}
                          className="p-1.5 text-[var(--zalama-danger)] hover:bg-[var(--zalama-danger)]/10 rounded transition-colors"
                          title="Supprimer"
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
          </div>
        )}
      
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


import React from 'react';
import { Search, Plus, Edit, Trash2, RefreshCw, ChevronLeft, ChevronRight, Mail, Phone, Globe, ExternalLink } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

import { Partenaire } from '@/types/partenaire';

interface ListePartenairesProps {
  partenaires: Partenaire[];
  onEdit: (partenaire: Partenaire) => void;
  onDelete: (partenaire: Partenaire) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading: boolean;
}

const ListePartenaires: React.FC<ListePartenairesProps> = ({
  partenaires,
  onEdit,
  onDelete,
  currentPage,
  totalPages,
  onPageChange,
  isLoading
}) => {
  const router = useRouter();
  
  // Fonction pour naviguer vers la page de détail d'un partenaire
  const handleViewDetails = (id: string) => {
    router.push(`/dashboard/partenaires/${id}`);
  };

  return (
    <>
      {/* Grille des partenaires */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full flex justify-center items-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin text-[var(--zalama-blue)]" />
            <span className="ml-2 text-[var(--zalama-text)]">Chargement...</span>
          </div>
        ) : partenaires.length === 0 ? (
          <div className="col-span-full py-12 text-center">
            <p className="text-[var(--zalama-text-secondary)]">Aucun partenaire trouvé</p>
          </div>
        ) : (
          partenaires.map((partenaire) => (
            <div 
              key={partenaire.id} 
              className="bg-[var(--zalama-card)] rounded-xl shadow-sm overflow-hidden border border-[var(--zalama-border)] hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleViewDetails(partenaire.id)}
            >
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
                      priority
                      src={partenaire.logo_url || '/images/partners/default.svg'} 
                      alt={`Logo ${partenaire.nom}`}
                      height={80}
                      width={80}
                      className="max-w-full max-h-full object-contain"
                      onError={(e) => {
                        // Fallback si l'image ne charge pas
                        (e.target as HTMLImageElement).src = '/images/partners/default.svg';
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
                    <a href={`https://${partenaire.site_web}`} target="_blank" rel="noopener noreferrer" className="text-[var(--zalama-blue)] hover:underline truncate">{partenaire.site_web}</a>
                  </div>
                </div>
                
                <div className="flex justify-end gap-2 pt-2 border-t border-[var(--zalama-border)]">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation(); // Empêcher la propagation pour éviter de déclencher le onClick du parent
                      handleViewDetails(partenaire.id);
                    }}
                    className="p-2 text-[var(--zalama-text)] hover:bg-[var(--zalama-bg-lighter)] rounded"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation(); // Empêcher la propagation
                      onEdit(partenaire);
                    }}
                    className="p-2 text-[var(--zalama-blue)] hover:bg-[var(--zalama-blue)]/10 rounded"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation(); // Empêcher la propagation
                      onDelete(partenaire);
                    }}
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
              className="px-3 py-1 rounded-md border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)] disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`px-3 py-1 rounded-md ${
                  currentPage === page
                    ? 'bg-[var(--zalama-blue)] text-white'
                    : 'border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)]'
                }`}
              >
                {page}
              </button>
            ))}
            
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded-md border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)] disabled:opacity-50"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ListePartenaires;

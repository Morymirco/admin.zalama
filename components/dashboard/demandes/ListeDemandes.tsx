"use client";

import React from 'react';
import { UISalaryAdvanceRequest } from '@/types/salaryAdvanceRequest';
import { Eye, CheckCircle, XCircle, Clock, DollarSign, MoreHorizontal, Edit, Trash2 } from 'lucide-react';

interface ListeDemandesProps {
  requests: UISalaryAdvanceRequest[];
  isLoading: boolean;
  onView: (request: UISalaryAdvanceRequest) => void;
  onApprove: (request: UISalaryAdvanceRequest) => void;
  onReject: (request: UISalaryAdvanceRequest) => void;
  onDelete: (request: UISalaryAdvanceRequest) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const ListeDemandes: React.FC<ListeDemandesProps> = ({
  requests,
  isLoading,
  onView,
  onApprove,
  onReject,
  onDelete,
  currentPage,
  totalPages,
  onPageChange
}) => {
  const getStatusIcon = (statut: string) => {
    switch (statut) {
      case 'En attente':
        return <Clock className="w-4 h-4 text-[var(--zalama-warning)]" />;
      case 'Validé':
        return <CheckCircle className="w-4 h-4 text-[var(--zalama-success)]" />;
      case 'Rejeté':
        return <XCircle className="w-4 h-4 text-[var(--zalama-danger)]" />;
      default:
        return <Eye className="w-4 h-4 text-[var(--zalama-text-secondary)]" />;
    }
  };

  const getStatusColor = (statut: string) => {
    switch (statut) {
      case 'En attente':
        return 'bg-yellow-100 text-yellow-800';
      case 'Validé':
        return 'bg-green-100 text-green-800';
      case 'Rejeté':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'GNF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="bg-[var(--zalama-bg-light)] rounded-lg border border-[var(--zalama-border)]">
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-[var(--zalama-border)] rounded mb-4"></div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-[var(--zalama-border)] rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--zalama-bg-light)] rounded-lg border border-[var(--zalama-border)]">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-[var(--zalama-text)]">
            Liste des demandes
          </h3>
          <div className="text-sm text-[var(--zalama-text-secondary)]">
            {requests.length} demande(s)
          </div>
        </div>

        {requests.length === 0 ? (
          <div className="text-center py-8">
            <DollarSign className="w-12 h-12 text-[var(--zalama-text-secondary)] mx-auto mb-4" />
            <p className="text-[var(--zalama-text-secondary)]">Aucune demande trouvée</p>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {requests.map((request) => (
                <div key={request.id} className="flex items-center justify-between p-4 bg-[var(--zalama-bg-lighter)] rounded-lg hover:bg-[var(--zalama-bg)] transition-colors">
                  <div className="flex items-center gap-4 flex-1">
                    {getStatusIcon(request.statut)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-medium text-[var(--zalama-text)]">
                          {request.employeNom || 'Employé inconnu'}
                        </p>
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(request.statut)}`}>
                          {request.statut}
                        </span>
                      </div>
                      <p className="text-xs text-[var(--zalama-text-secondary)]">
                        {request.partenaireNom || 'Partenaire inconnu'} • {formatDate(request.dateCreation)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-medium text-[var(--zalama-text)]">
                        {formatCurrency(request.montant_demande)}
                      </p>
                      <p className="text-xs text-[var(--zalama-text-secondary)]">
                        {request.type_motif}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onView(request)}
                        className="p-2 text-[var(--zalama-text-secondary)] hover:text-[var(--zalama-text)] hover:bg-[var(--zalama-bg)] rounded-lg transition-colors"
                        title="Voir les détails"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      
                      {request.statut === 'En attente' && (
                        <>
                          <button
                            onClick={() => onApprove(request)}
                            className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors"
                            title="Approuver"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onReject(request)}
                            className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                            title="Rejeter"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      
                      <button
                        onClick={() => onDelete(request)}
                        className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-[var(--zalama-border)]">
                <div className="text-sm text-[var(--zalama-text-secondary)]">
                  Page {currentPage} sur {totalPages}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1 text-sm border border-[var(--zalama-border)] rounded-lg bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--zalama-bg)] transition-colors"
                  >
                    Précédent
                  </button>
                  <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 text-sm border border-[var(--zalama-border)] rounded-lg bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--zalama-bg)] transition-colors"
                  >
                    Suivant
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ListeDemandes; 
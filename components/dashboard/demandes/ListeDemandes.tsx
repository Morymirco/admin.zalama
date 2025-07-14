"use client";

import { canBePaid, getPaymentStatusFromTransactions, hasSuccessfulPayment } from '@/lib/utils';
import { UISalaryAdvanceRequest } from '@/types/salaryAdvanceRequest';
import { CheckCircle, Clock, CreditCard, DollarSign, Eye, Loader2, RefreshCw, Shield, Trash2, XCircle } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';

interface ListeDemandesProps {
  requests: UISalaryAdvanceRequest[];
  isLoading: boolean;
  onView: (request: UISalaryAdvanceRequest) => void;
  onApprove: (request: UISalaryAdvanceRequest) => void;
  onReject: (request: UISalaryAdvanceRequest) => void;
  onDelete: (request: UISalaryAdvanceRequest) => void;
  onPay?: (request: UISalaryAdvanceRequest) => void;
  onRefresh?: () => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSortChange?: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
}

const ListeDemandes: React.FC<ListeDemandesProps> = ({
  requests,
  isLoading,
  onView,
  onApprove,
  onReject,
  onDelete,
  onPay,
  onRefresh,
  currentPage,
  totalPages,
  onPageChange,
  sortBy = 'date_creation',
  sortOrder = 'desc',
  onSortChange
}) => {
  const [syncingId, setSyncingId] = useState<string | null>(null);

  // Fonction pour obtenir l'icône et la couleur du statut de paiement
  const getPaymentStatusDisplay = (request: UISalaryAdvanceRequest) => {
    const paymentStatus = getPaymentStatusFromTransactions(request);
    
    let icon, color;
    switch (paymentStatus.statusCode) {
      case 'PAID':
        icon = <Shield className="w-4 h-4 text-[var(--zalama-success)]" />;
        color = 'bg-green-100 text-green-800';
        break;
      case 'CANCELLED':
        icon = <XCircle className="w-4 h-4 text-[var(--zalama-danger)]" />;
        color = 'bg-red-100 text-red-800';
        break;
      case 'FAILED':
        icon = <XCircle className="w-4 h-4 text-[var(--zalama-danger)]" />;
        color = 'bg-red-100 text-red-800';
        break;
      case 'PROCESSING':
        icon = <Clock className="w-4 h-4 text-[var(--zalama-warning)]" />;
        color = 'bg-yellow-100 text-yellow-800';
        break;
      default:
        icon = <Clock className="w-4 h-4 text-[var(--zalama-text-secondary)]" />;
        color = 'bg-gray-100 text-gray-800';
    }
    
    return { icon, color, status: paymentStatus.status, transactionId: paymentStatus.transactionId };
  };

  const handleSyncPaymentStatus = async (request: UISalaryAdvanceRequest) => {
    setSyncingId(request.id);
    try {
      console.log('🔄 Synchronisation du statut de paiement pour la demande:', request.id);
      
      const response = await fetch('/api/payments/sync-payment-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestId: request.id
        }),
      });

      const result = await response.json();
      
      if (response.ok) {
        console.log('✅ Synchronisation réussie:', result);
        toast.success(`Synchronisation réussie: ${result.updatedCount} mise(s) à jour`);
        
        // Rafraîchir les données
        if (onRefresh) {
          onRefresh();
        }
      } else {
        console.error('❌ Erreur synchronisation:', result);
        toast.error(result.error || 'Erreur lors de la synchronisation');
      }
    } catch (error) {
      console.error('💥 Erreur lors de la synchronisation:', error);
      toast.error('Erreur réseau lors de la synchronisation');
    } finally {
      setSyncingId(null);
    }
  };

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

  // Fonction pour gérer le changement de tri
  const handleSortChange = (newSortBy: string) => {
    if (onSortChange) {
      const newSortOrder = sortBy === newSortBy && sortOrder === 'desc' ? 'asc' : 'desc';
      onSortChange(newSortBy, newSortOrder);
    }
  };

  // Fonction pour obtenir l'icône de tri
  const getSortIcon = (field: string) => {
    if (sortBy !== field) return <span className="text-[var(--zalama-text-secondary)]">↕</span>;
    return sortOrder === 'desc' ? <span className="text-[var(--zalama-blue)]">↓</span> : <span className="text-[var(--zalama-blue)]">↑</span>;
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
          <div className="flex items-center gap-4">
            {/* Sélecteur de tri */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-[var(--zalama-text-secondary)]">Trier par:</span>
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-');
                  if (onSortChange) {
                    onSortChange(field, order as 'asc' | 'desc');
                  }
                }}
                className="text-sm bg-[var(--zalama-bg)] border border-[var(--zalama-border)] rounded-lg px-2 py-1 text-[var(--zalama-text)] focus:outline-none focus:ring-2 focus:ring-[var(--zalama-blue)]/20"
              >
                <option value="date_creation-desc">Date (récentes)</option>
                <option value="date_creation-asc">Date (anciennes)</option>
                <option value="montant_demande-desc">Montant (élevé)</option>
                <option value="montant_demande-asc">Montant (faible)</option>
                <option value="statut-asc">Statut (A-Z)</option>
                <option value="statut-desc">Statut (Z-A)</option>
              </select>
            </div>
            <div className="text-sm text-[var(--zalama-text-secondary)]">
              {requests.length} demande(s)
            </div>
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
                      <div className="flex items-center gap-2 mb-1">
                        {(() => {
                          const paymentDisplay = getPaymentStatusDisplay(request);
                          return (
                            <>
                              <span className={`px-2 py-1 text-xs rounded-full ${paymentDisplay.color}`}>
                                {paymentDisplay.icon}
                                <span className="ml-1">{paymentDisplay.status}</span>
                              </span>
                              {paymentDisplay.transactionId && (
                                <span className="text-xs text-[var(--zalama-text-secondary)]">
                                  N° {paymentDisplay.transactionId.slice(0, 8)}...
                                </span>
                              )}
                            </>
                          );
                        })()}
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
                      
                      {/* Bouton de synchronisation pour les demandes validées sans paiement réussi */}
                      {request.statut === 'Validé' && !hasSuccessfulPayment(request) && (
                        <button
                          onClick={() => handleSyncPaymentStatus(request)}
                          disabled={syncingId === request.id}
                          className="p-2 text-[var(--zalama-blue)] hover:text-[var(--zalama-blue-dark)] hover:bg-[var(--zalama-blue-light)] rounded-lg transition-colors disabled:opacity-50"
                          title="Synchroniser le statut de paiement"
                        >
                          {syncingId === request.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <RefreshCw className="w-4 h-4" />
                          )}
                        </button>
                      )}
                      
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
                      
                      {/* Bouton Payer : affiché seulement si la demande peut être payée */}
                      {canBePaid(request) && onPay && (
                        <button
                          onClick={() => onPay(request)}
                          className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Payer"
                        >
                          <CreditCard className="w-4 h-4" />
                        </button>
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
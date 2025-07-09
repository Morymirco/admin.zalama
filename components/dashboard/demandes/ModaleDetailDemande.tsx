"use client";

import React from 'react';
import { X, Eye, CheckCircle, XCircle, Clock, DollarSign, User, Building, Calendar, FileText } from 'lucide-react';
import { UISalaryAdvanceRequest } from '@/types/salaryAdvanceRequest';

interface ModaleDetailDemandeProps {
  isOpen: boolean;
  onClose: () => void;
  request: UISalaryAdvanceRequest | null;
  isLoading?: boolean;
}

const ModaleDetailDemande: React.FC<ModaleDetailDemandeProps> = ({
  isOpen,
  onClose,
  request,
  isLoading = false
}) => {
  if (!isOpen || !request) return null;

  const getStatusIcon = (statut: string) => {
    switch (statut) {
      case 'En attente':
        return <Clock className="w-5 h-5 text-[var(--zalama-warning)]" />;
      case 'Validé':
        return <CheckCircle className="w-5 h-5 text-[var(--zalama-success)]" />;
      case 'Rejeté':
        return <XCircle className="w-5 h-5 text-[var(--zalama-danger)]" />;
      default:
        return <Eye className="w-5 h-5 text-[var(--zalama-text-secondary)]" />;
    }
  };

  const getStatusColor = (statut: string) => {
    switch (statut) {
      case 'En attente':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Validé':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Rejeté':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
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
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-[var(--zalama-bg-light)] rounded-xl shadow-xl border border-[var(--zalama-border)] w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[var(--zalama-border)]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[var(--zalama-blue)]/10 rounded-lg">
              <Eye className="w-5 h-5 text-[var(--zalama-blue)]" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-[var(--zalama-text)]">
                Détails de la demande
              </h2>
              <p className="text-sm text-[var(--zalama-text-secondary)]">
                Demande #{request.id.slice(0, 8)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[var(--zalama-text-secondary)] hover:text-[var(--zalama-text)] hover:bg-[var(--zalama-bg)] rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[calc(90vh-120px)] overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--zalama-blue)]"></div>
              <span className="ml-3 text-[var(--zalama-text-secondary)]">Chargement...</span>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Status */}
              <div className="flex items-center justify-between p-4 bg-[var(--zalama-bg-lighter)] rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(request.statut)}
                  <div>
                    <p className="text-sm font-medium text-[var(--zalama-text)]">Statut</p>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(request.statut)}`}>
                      {request.statut}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-[var(--zalama-text-secondary)]">Créée le</p>
                  <p className="text-sm font-medium text-[var(--zalama-text)]">
                    {formatDate(request.dateCreation)}
                  </p>
                </div>
              </div>

              {/* Employee and Partner Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-[var(--zalama-bg-lighter)] rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <User className="w-5 h-5 text-[var(--zalama-blue)]" />
                    <h3 className="font-medium text-[var(--zalama-text)]">Employé</h3>
                  </div>
                  <p className="text-sm text-[var(--zalama-text)] font-medium">
                    {request.employeNom || 'Nom non disponible'}
                  </p>
                  <p className="text-xs text-[var(--zalama-text-secondary)]">
                    ID: {request.employe_id}
                  </p>
                </div>

                <div className="p-4 bg-[var(--zalama-bg-lighter)] rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <Building className="w-5 h-5 text-[var(--zalama-blue)]" />
                    <h3 className="font-medium text-[var(--zalama-text)]">Partenaire</h3>
                  </div>
                  <p className="text-sm text-[var(--zalama-text)] font-medium">
                    {request.partenaireNom || 'Partenaire non disponible'}
                  </p>
                  <p className="text-xs text-[var(--zalama-text-secondary)]">
                    ID: {request.partenaire_id}
                  </p>
                </div>
              </div>

              {/* Financial Details */}
              <div className="p-4 bg-[var(--zalama-bg-lighter)] rounded-lg">
                <div className="flex items-center gap-3 mb-4">
                  <DollarSign className="w-5 h-5 text-[var(--zalama-blue)]" />
                  <h3 className="font-medium text-[var(--zalama-text)]">Détails financiers</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-[var(--zalama-text-secondary)]">Montant demandé</p>
                    <p className="text-lg font-semibold text-[var(--zalama-text)]">
                      {formatCurrency(request.montant_demande)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-[var(--zalama-text-secondary)]">Frais de service</p>
                    <p className="text-lg font-semibold text-[var(--zalama-text)]">
                      {formatCurrency(request.frais_service || 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-[var(--zalama-text-secondary)]">Montant total</p>
                    <p className="text-lg font-semibold text-[var(--zalama-success)]">
                      {formatCurrency(request.montant_total)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-[var(--zalama-text-secondary)]">Salaire disponible</p>
                    <p className="text-sm font-medium text-[var(--zalama-text)]">
                      {formatCurrency(request.salaire_disponible || 0)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Request Details */}
              <div className="p-4 bg-[var(--zalama-bg-lighter)] rounded-lg">
                <div className="flex items-center gap-3 mb-4">
                  <FileText className="w-5 h-5 text-[var(--zalama-blue)]" />
                  <h3 className="font-medium text-[var(--zalama-text)]">Détails de la demande</h3>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-[var(--zalama-text-secondary)]">Type de motif</p>
                    <p className="text-sm font-medium text-[var(--zalama-text)]">
                      {request.type_motif || 'Non spécifié'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-[var(--zalama-text-secondary)]">Motif détaillé</p>
                    <p className="text-sm text-[var(--zalama-text)] bg-[var(--zalama-bg)] p-3 rounded-lg">
                      {request.motif || 'Aucun motif fourni'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Additional Info */}
              {request.avance_disponible && (
                <div className="p-4 bg-[var(--zalama-bg-lighter)] rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <DollarSign className="w-5 h-5 text-[var(--zalama-blue)]" />
                    <h3 className="font-medium text-[var(--zalama-text)]">Avance disponible</h3>
                  </div>
                  <p className="text-lg font-semibold text-[var(--zalama-success)]">
                    {formatCurrency(request.avance_disponible)}
                  </p>
                  <p className="text-xs text-[var(--zalama-text-secondary)] mt-1">
                    50% du salaire disponible
                  </p>
                </div>
              )}

              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-[var(--zalama-bg-lighter)] rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <Calendar className="w-5 h-5 text-[var(--zalama-blue)]" />
                    <h3 className="font-medium text-[var(--zalama-text)]">Date de création</h3>
                  </div>
                  <p className="text-sm text-[var(--zalama-text)]">
                    {formatDate(request.dateCreation)}
                  </p>
                </div>

                {request.dateModification && (
                  <div className="p-4 bg-[var(--zalama-bg-lighter)] rounded-lg">
                    <div className="flex items-center gap-3 mb-3">
                      <Calendar className="w-5 h-5 text-[var(--zalama-blue)]" />
                      <h3 className="font-medium text-[var(--zalama-text)]">Dernière modification</h3>
                    </div>
                    <p className="text-sm text-[var(--zalama-text)]">
                      {formatDate(request.dateModification)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-[var(--zalama-border)]">
          <button
            onClick={onClose}
            className="px-4 py-2 text-[var(--zalama-text)] bg-[var(--zalama-bg-lighter)] hover:bg-[var(--zalama-bg)] rounded-lg transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModaleDetailDemande; 
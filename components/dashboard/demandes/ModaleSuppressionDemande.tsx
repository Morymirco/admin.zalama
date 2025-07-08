"use client";

import React from 'react';
import { X, Trash2, DollarSign, User, Building, AlertTriangle } from 'lucide-react';
import { UISalaryAdvanceRequest } from '@/types/salaryAdvanceRequest';

interface ModaleSuppressionDemandeProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  request: UISalaryAdvanceRequest | null;
  isLoading: boolean;
}

const ModaleSuppressionDemande: React.FC<ModaleSuppressionDemandeProps> = ({
  isOpen,
  onClose,
  onConfirm,
  request,
  isLoading
}) => {
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

  if (!isOpen || !request) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999]">
      <div className="bg-[var(--zalama-card)] border border-[var(--zalama-border)] rounded-lg shadow-2xl max-w-md w-full mx-4">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-[var(--zalama-text)] flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-[var(--zalama-danger)]" />
              Supprimer la demande
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-[var(--zalama-text-secondary)] hover:text-[var(--zalama-text)] hover:bg-[var(--zalama-bg-lighter)] rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Avertissement critique */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <p className="text-sm font-medium text-red-800">
                Attention: Action irréversible
              </p>
            </div>
            <p className="text-sm text-red-700 mt-2">
              Cette demande sera définitivement supprimée de la base de données. Cette action ne peut pas être annulée.
            </p>
          </div>

          {/* Détails de la demande */}
          <div className="space-y-4 mb-6">
            <div className="bg-[var(--zalama-bg-lighter)] rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <User className="w-4 h-4 text-[var(--zalama-text-secondary)]" />
                <span className="text-sm font-medium text-[var(--zalama-text)]">
                  {request.employeNom || 'Employé inconnu'}
                </span>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <Building className="w-4 h-4 text-[var(--zalama-text-secondary)]" />
                <span className="text-sm text-[var(--zalama-text-secondary)]">
                  {request.partenaireNom || 'Partenaire inconnu'}
                </span>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-4 h-4 text-[var(--zalama-text-secondary)]" />
                <span className="text-sm font-medium text-[var(--zalama-text)]">
                  {formatCurrency(request.montant_demande)}
                </span>
              </div>
              <div className="text-xs text-[var(--zalama-text-secondary)]">
                Demande créée le {formatDate(request.dateCreation)}
              </div>
            </div>

            <div>
              <p className="text-sm text-[var(--zalama-text-secondary)] mb-1">Statut actuel:</p>
              <span className={`px-2 py-1 text-xs rounded-full ${
                request.statut === 'En attente' ? 'bg-yellow-100 text-yellow-800' :
                request.statut === 'Approuvée' ? 'bg-green-100 text-green-800' :
                request.statut === 'Rejetée' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {request.statut}
              </span>
            </div>

            <div>
              <p className="text-sm text-[var(--zalama-text-secondary)] mb-1">Type de motif:</p>
              <p className="text-sm font-medium text-[var(--zalama-text)]">{request.type_motif}</p>
            </div>

            <div>
              <p className="text-sm text-[var(--zalama-text-secondary)] mb-1">Motif détaillé:</p>
              <p className="text-sm text-[var(--zalama-text)] bg-[var(--zalama-bg-lighter)] p-3 rounded-lg">
                {request.motif}
              </p>
            </div>
          </div>

          {/* Confirmation */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-yellow-800">
              <strong>Êtes-vous sûr de vouloir supprimer cette demande ?</strong>
            </p>
            <p className="text-sm text-yellow-700 mt-1">
              Toutes les données associées à cette demande seront perdues définitivement.
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--zalama-border)]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm border border-[var(--zalama-border)] rounded-lg bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)] hover:bg-[var(--zalama-bg)] transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className="px-4 py-2 text-sm bg-[var(--zalama-danger)] text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Suppression...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  Supprimer définitivement
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModaleSuppressionDemande; 
"use client";

import { UISalaryAdvanceRequest } from '@/types/salaryAdvanceRequest';
import { Building, CheckCircle, DollarSign, User, X } from 'lucide-react';
import React, { useState } from 'react';

interface ModaleApprobationDemandeProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (motif?: string) => void;
  request: UISalaryAdvanceRequest | null;
  isLoading: boolean;
}

const ModaleApprobationDemande: React.FC<ModaleApprobationDemandeProps> = ({
  isOpen,
  onClose,
  onConfirm,
  request,
  isLoading
}) => {
  const [motif, setMotif] = useState('');

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
      <div className="bg-[var(--zalama-card)] border border-[var(--zalama-border)] rounded-lg shadow-2xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[var(--zalama-text)] flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-[var(--zalama-success)]" />
              Approuver la demande
            </h2>
            <button
              onClick={onClose}
              className="p-1 text-[var(--zalama-text-secondary)] hover:text-[var(--zalama-text)] hover:bg-[var(--zalama-bg-lighter)] rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Détails de la demande */}
          <div className="space-y-3 mb-4">
            <div className="bg-[var(--zalama-bg-lighter)] rounded-lg p-3">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-1">
                  <User className="w-3 h-3 text-[var(--zalama-text-secondary)]" />
                  <span className="font-medium text-[var(--zalama-text)] truncate">
                    {request.employeNom || 'Employé inconnu'}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <DollarSign className="w-3 h-3 text-[var(--zalama-text-secondary)]" />
                  <span className="font-medium text-[var(--zalama-text)]">
                    {formatCurrency(request.montant_demande)}
                  </span>
                </div>
                <div className="flex items-center gap-1 col-span-2">
                  <Building className="w-3 h-3 text-[var(--zalama-text-secondary)]" />
                  <span className="text-[var(--zalama-text-secondary)] truncate">
                    {request.partenaireNom || 'Partenaire inconnu'}
                  </span>
                </div>
              </div>
            </div>

            <div className="text-xs">
              <p className="text-[var(--zalama-text-secondary)] mb-1">Motif:</p>
              <p className="text-[var(--zalama-text)] bg-[var(--zalama-bg-lighter)] p-2 rounded text-xs">
                {request.motif}
              </p>
            </div>
          </div>

          {/* Motif d'approbation (optionnel) */}
          <div className="mb-4">
            <label htmlFor="approval-motif" className="block text-xs font-medium text-[var(--zalama-text)] mb-1">
              Commentaire (optionnel)
            </label>
            <textarea
              id="approval-motif"
              rows={2}
              value={motif}
              onChange={(e) => setMotif(e.target.value)}
              className="w-full px-2 py-1 text-xs border border-[var(--zalama-border)] rounded bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)] focus:outline-none focus:ring-1 focus:ring-[var(--zalama-success)]"
              placeholder="Commentaire d'approbation..."
            />
          </div>

          {/* Information sur les notifications automatiques */}
          <div className="mb-4 p-2 bg-blue-50 border border-blue-200 rounded">
            <div className="flex items-center gap-2">
              <svg className="w-3 h-3 text-blue-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-xs font-medium text-blue-800">
                  Notifications automatiques: SMS + Email
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--zalama-border)]">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1 text-xs border border-[var(--zalama-border)] rounded bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)] hover:bg-[var(--zalama-bg)] transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={() => onConfirm(motif || undefined)}
              disabled={isLoading}
              className="px-3 py-1 text-xs bg-[var(--zalama-success)] text-white rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
            >
              {isLoading ? (
                <>
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Approbation...
                </>
              ) : (
                <>
                  <CheckCircle className="w-3 h-3" />
                  Approuver
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModaleApprobationDemande; 
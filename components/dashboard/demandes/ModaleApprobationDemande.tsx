"use client";

import React, { useState } from 'react';
import { X, CheckCircle, DollarSign, User, Building } from 'lucide-react';
import { UISalaryAdvanceRequest } from '@/types/salaryAdvanceRequest';

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
      <div className="bg-[var(--zalama-card)] border border-[var(--zalama-border)] rounded-lg shadow-2xl max-w-md w-full mx-4">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-[var(--zalama-text)] flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-[var(--zalama-success)]" />
              Approuver la demande
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-[var(--zalama-text-secondary)] hover:text-[var(--zalama-text)] hover:bg-[var(--zalama-bg-lighter)] rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
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

          {/* Motif d'approbation (optionnel) */}
          <div className="mb-6">
            <label htmlFor="approval-motif" className="block text-sm font-medium text-[var(--zalama-text)] mb-2">
              Motif d'approbation (optionnel)
            </label>
            <textarea
              id="approval-motif"
              rows={3}
              value={motif}
              onChange={(e) => setMotif(e.target.value)}
              className="w-full px-3 py-2 border border-[var(--zalama-border)] rounded-lg bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)] focus:outline-none focus:ring-2 focus:ring-[var(--zalama-success)]"
              placeholder="Ajoutez un commentaire d'approbation..."
            />
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
              onClick={() => onConfirm(motif || undefined)}
              disabled={isLoading}
              className="px-4 py-2 text-sm bg-[var(--zalama-success)] text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Approbation...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
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
"use client";

import React, { useState } from 'react';
import { X, XCircle, DollarSign, User, Building, AlertTriangle } from 'lucide-react';
import { UISalaryAdvanceRequest } from '@/types/salaryAdvanceRequest';

interface ModaleRejetDemandeProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (motif_rejet: string) => void;
  request: UISalaryAdvanceRequest | null;
  isLoading: boolean;
}

const ModaleRejetDemande: React.FC<ModaleRejetDemandeProps> = ({
  isOpen,
  onClose,
  onConfirm,
  request,
  isLoading
}) => {
  const [motifRejet, setMotifRejet] = useState('');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'GNF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

 

  if (!isOpen || !request) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999]">
      <div className="bg-[var(--zalama-card)] border border-[var(--zalama-border)] rounded-lg shadow-2xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[var(--zalama-text)] flex items-center gap-2">
              <XCircle className="w-4 h-4 text-[var(--zalama-danger)]" />
              Rejeter la demande
            </h2>
            <button
              onClick={onClose}
              className="p-1 text-[var(--zalama-text-secondary)] hover:text-[var(--zalama-text)] hover:bg-[var(--zalama-bg-lighter)] rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Avertissement */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <p className="text-xs font-medium text-red-800">
                Action irréversible - L&apos;employé sera notifié
              </p>
            </div>
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

          {/* Motif de rejet (obligatoire) */}
          <div className="mb-4">
            <label htmlFor="rejection-motif" className="block text-xs font-medium text-[var(--zalama-text)] mb-1">
              Motif de rejet *
            </label>
            <textarea
              id="rejection-motif"
              required
              rows={2}
              value={motifRejet}
              onChange={(e) => setMotifRejet(e.target.value)}
              className="w-full px-2 py-1 text-xs border border-[var(--zalama-border)] rounded bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)] focus:outline-none focus:ring-1 focus:ring-[var(--zalama-danger)]"
              placeholder="Expliquez pourquoi cette demande est rejetée..."
            />
          </div>

          {/* Information sur les notifications automatiques */}
          <div className="mb-4 p-2 bg-orange-50 border border-orange-200 rounded">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-3 h-3 text-orange-600 flex-shrink-0" />
              <div>
                <p className="text-xs font-medium text-orange-800">
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
              onClick={() => onConfirm(motifRejet)}
              disabled={isLoading || !motifRejet.trim()}
              className="px-3 py-1 text-xs bg-[var(--zalama-danger)] text-white rounded hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
            >
              {isLoading ? (
                <>
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Rejet...
                </>
              ) : (
                <>
                  <XCircle className="w-3 h-3" />
                  Rejeter
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModaleRejetDemande; 
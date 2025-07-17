"use client";

import { Button } from '@/components/ui/button';
import { UISalaryAdvanceRequest } from '@/types/salaryAdvanceRequest';
import { Building, CheckCircle, DollarSign, User, X } from 'lucide-react';
import React, { useState } from 'react';

interface ModaleApprobationDemandeProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (motif?: string) => void;
  request: UISalaryAdvanceRequest | null;
  isLoading?: boolean;
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

  const handleSubmit = () => {
    onConfirm(motif.trim() || undefined);
    setMotif('');
  };

  if (!isOpen || !request) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-[var(--zalama-bg-light)] rounded-xl shadow-xl border border-[var(--zalama-border)] w-full max-w-lg max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[var(--zalama-border)] flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-100/10 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[var(--zalama-text)]">
                Approuver la demande
              </h2>
              <p className="text-sm text-[var(--zalama-text-secondary)]">
                Demande #{request.id.slice(0, 8)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[var(--zalama-text-secondary)] hover:text-[var(--zalama-text)] hover:bg-[var(--zalama-bg)] rounded-lg transition-colors"
            aria-label="Fermer le modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Notice d'approbation */}
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-green-800 dark:text-green-300">
                  Validation de la demande
                </p>
                <p className="text-sm text-green-700 dark:text-green-400 mt-1">
                  L'employé sera automatiquement notifié de l'approbation de sa demande.
                </p>
              </div>
            </div>
          </div>

          {/* Détails de la demande */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-[var(--zalama-text)]">Détails de la demande</h3>
            
            <div className="bg-[var(--zalama-bg-lighter)] rounded-lg p-4 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-[var(--zalama-text-secondary)] flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-[var(--zalama-text-secondary)]">Employé</p>
                    <p className="text-sm font-medium text-[var(--zalama-text)] truncate">
                      {request.employeNom || 'Employé inconnu'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-[var(--zalama-text-secondary)] flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-[var(--zalama-text-secondary)]">Montant</p>
                    <p className="text-sm font-medium text-[var(--zalama-text)]">
                      {formatCurrency(request.montant_demande)}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-[var(--zalama-text-secondary)] flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-[var(--zalama-text-secondary)]">Partenaire</p>
                  <p className="text-sm text-[var(--zalama-text)] truncate">
                    {request.partenaireNom || 'Partenaire inconnu'}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <p className="text-xs text-[var(--zalama-text-secondary)] mb-2">Motif de la demande</p>
              <div className="bg-[var(--zalama-bg)] border border-[var(--zalama-border)] rounded-lg p-3">
                <p className="text-sm text-[var(--zalama-text)]">
                  {request.motif || 'Aucun motif spécifié'}
                </p>
              </div>
            </div>
          </div>

          {/* Motif d'approbation (optionnel) */}
          <div>
            <label className="block text-sm font-medium text-[var(--zalama-text)] mb-2">
              Commentaire d'approbation (optionnel)
            </label>
            <textarea
              value={motif}
              onChange={(e) => setMotif(e.target.value)}
              placeholder="Ajouter un commentaire pour cette approbation..."
              className="w-full p-3 border border-[var(--zalama-border)] bg-[var(--zalama-bg)] text-[var(--zalama-text)] placeholder-[var(--zalama-text-secondary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 resize-none transition-colors"
              rows={3}
            />
            <p className="text-xs text-[var(--zalama-text-secondary)] mt-1">
              Ce commentaire sera visible dans l'historique de la demande.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-[var(--zalama-border)] flex-shrink-0">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="min-w-[100px]"
          >
            Annuler
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className="min-w-[120px] bg-green-600 hover:bg-green-700 text-white"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Approbation...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                <span>Approuver</span>
              </div>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ModaleApprobationDemande; 
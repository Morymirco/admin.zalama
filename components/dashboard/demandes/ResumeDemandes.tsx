"use client";

import React from 'react';
import { UISalaryAdvanceRequest } from '@/types/salaryAdvanceRequest';
import { Eye, CheckCircle, XCircle, Clock, DollarSign } from 'lucide-react';

interface ResumeDemandesProps {
  requests: UISalaryAdvanceRequest[];
  isLoading: boolean;
}

const ResumeDemandes: React.FC<ResumeDemandesProps> = ({ requests, isLoading }) => {
  if (isLoading) {
    return (
      <div className="bg-[var(--zalama-bg-light)] rounded-lg p-6 border border-[var(--zalama-border)]">
        <div className="animate-pulse">
          <div className="h-4 bg-[var(--zalama-border)] rounded mb-4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-12 bg-[var(--zalama-border)] rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const recentRequests = requests.slice(0, 5);

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
    <div className="bg-[var(--zalama-bg-light)] rounded-lg p-6 border border-[var(--zalama-border)]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-[var(--zalama-text)]">
          Demandes récentes
        </h3>
        <div className="flex items-center gap-2 text-sm text-[var(--zalama-text-secondary)]">
          <DollarSign className="w-4 h-4" />
          <span>Total: {formatCurrency(requests.reduce((sum, req) => sum + req.montant_demande, 0))}</span>
        </div>
      </div>

      {recentRequests.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-[var(--zalama-text-secondary)]">Aucune demande récente</p>
        </div>
      ) : (
        <div className="space-y-3">
          {recentRequests.map((request) => (
            <div key={request.id} className="flex items-center justify-between p-3 bg-[var(--zalama-bg-lighter)] rounded-lg">
              <div className="flex items-center gap-3">
                {getStatusIcon(request.statut)}
                <div>
                  <p className="text-sm font-medium text-[var(--zalama-text)]">
                    {request.employeNom || 'Employé inconnu'}
                  </p>
                  <p className="text-xs text-[var(--zalama-text-secondary)]">
                    {request.partenaireNom || 'Partenaire inconnu'} • {formatDate(request.dateCreation)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-[var(--zalama-text)]">
                  {formatCurrency(request.montant_demande)}
                </p>
                <p className="text-xs text-[var(--zalama-text-secondary)]">
                  {request.statut}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {requests.length > 5 && (
        <div className="mt-4 pt-4 border-t border-[var(--zalama-border)]">
          <p className="text-sm text-[var(--zalama-text-secondary)] text-center">
            Et {requests.length - 5} autres demandes...
          </p>
        </div>
      )}
    </div>
  );
};

export default ResumeDemandes; 
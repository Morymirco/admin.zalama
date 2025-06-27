"use client";

import React from 'react';
import { PartnershipRequestStats } from '@/types/partnershipRequest';
import { FileText, CheckCircle, XCircle, Clock, Eye } from 'lucide-react';

interface StatistiquesDemandesProps {
  stats: PartnershipRequestStats;
}

const StatistiquesDemandes: React.FC<StatistiquesDemandesProps> = ({ stats }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'text-[var(--zalama-success)]';
      case 'rejected':
        return 'text-[var(--zalama-danger)]';
      case 'pending':
        return 'text-[var(--zalama-warning)]';
      case 'in_review':
        return 'text-[var(--zalama-blue)]';
      default:
        return 'text-[var(--zalama-text-secondary)]';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-5 h-5" />;
      case 'rejected':
        return <XCircle className="w-5 h-5" />;
      case 'pending':
        return <Clock className="w-5 h-5" />;
      case 'in_review':
        return <Eye className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Approuvées';
      case 'rejected':
        return 'Rejetées';
      case 'pending':
        return 'En attente';
      case 'in_review':
        return 'En révision';
      default:
        return status;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[var(--zalama-text)]">
          Statistiques des Demandes
        </h3>
        <div className="text-sm text-[var(--zalama-text-secondary)]">
          Total: {stats.total} demandes
        </div>
      </div>

      {/* Cartes de statistiques */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total */}
        <div className="bg-[var(--zalama-bg-light)] rounded-lg p-4 border border-[var(--zalama-border)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[var(--zalama-text-secondary)]">Total</p>
              <p className="text-2xl font-bold text-[var(--zalama-text)]">{stats.total}</p>
            </div>
            <div className="text-[var(--zalama-blue)]">
              <FileText className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* En attente */}
        <div className="bg-[var(--zalama-bg-light)] rounded-lg p-4 border border-[var(--zalama-border)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[var(--zalama-text-secondary)]">En attente</p>
              <p className="text-2xl font-bold text-[var(--zalama-warning)]">{stats.pending}</p>
            </div>
            <div className="text-[var(--zalama-warning)]">
              <Clock className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Approuvées */}
        <div className="bg-[var(--zalama-bg-light)] rounded-lg p-4 border border-[var(--zalama-border)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[var(--zalama-text-secondary)]">Approuvées</p>
              <p className="text-2xl font-bold text-[var(--zalama-success)]">{stats.approved}</p>
            </div>
            <div className="text-[var(--zalama-success)]">
              <CheckCircle className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Rejetées */}
        <div className="bg-[var(--zalama-bg-light)] rounded-lg p-4 border border-[var(--zalama-border)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[var(--zalama-text-secondary)]">Rejetées</p>
              <p className="text-2xl font-bold text-[var(--zalama-danger)]">{stats.rejected}</p>
            </div>
            <div className="text-[var(--zalama-danger)]">
              <XCircle className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Répartition par domaine d'activité */}
      {Object.keys(stats.by_domain).length > 0 && (
        <div className="bg-[var(--zalama-bg-light)] rounded-lg p-4 border border-[var(--zalama-border)]">
          <h4 className="text-sm font-medium text-[var(--zalama-text)] mb-3">
            Répartition par domaine d'activité
          </h4>
          <div className="space-y-2">
            {Object.entries(stats.by_domain)
              .sort(([,a], [,b]) => b - a)
              .slice(0, 5)
              .map(([domain, count]) => (
                <div key={domain} className="flex items-center justify-between">
                  <span className="text-sm text-[var(--zalama-text-secondary)]">{domain}</span>
                  <span className="text-sm font-medium text-[var(--zalama-text)]">{count}</span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Barres de progression */}
      <div className="bg-[var(--zalama-bg-light)] rounded-lg p-4 border border-[var(--zalama-border)]">
        <h4 className="text-sm font-medium text-[var(--zalama-text)] mb-3">
          Répartition des statuts
        </h4>
        <div className="space-y-3">
          {[
            { key: 'pending', label: 'En attente', color: 'bg-[var(--zalama-warning)]' },
            { key: 'in_review', label: 'En révision', color: 'bg-[var(--zalama-blue)]' },
            { key: 'approved', label: 'Approuvées', color: 'bg-[var(--zalama-success)]' },
            { key: 'rejected', label: 'Rejetées', color: 'bg-[var(--zalama-danger)]' }
          ].map(({ key, label, color }) => {
            const count = stats[key as keyof PartnershipRequestStats] as number;
            const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
            
            return (
              <div key={key} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[var(--zalama-text-secondary)]">{label}</span>
                  <span className="text-[var(--zalama-text)] font-medium">{count}</span>
                </div>
                <div className="w-full bg-[var(--zalama-border)] rounded-full h-2">
                  <div 
                    className={`${color} h-2 rounded-full transition-all duration-300`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default StatistiquesDemandes; 
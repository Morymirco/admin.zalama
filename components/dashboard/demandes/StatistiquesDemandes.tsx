"use client";

import React from 'react';
import { FileText, CheckCircle, XCircle, Clock, DollarSign, TrendingUp } from 'lucide-react';

interface StatistiquesDemandesProps {
  requestStats: {
    total: number;
    enAttente: number;
    approuvees: number;
    rejetees: number;
    montantTotal: number;
    montantMoyen: number;
    parStatut: Record<string, number>;
    parPartenaire: Record<string, number>;
  } | null;
  isLoading: boolean;
}

const StatistiquesDemandes: React.FC<StatistiquesDemandesProps> = ({ requestStats, isLoading }) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-[var(--zalama-text)]">
            Statistiques des Demandes
          </h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-[var(--zalama-bg-light)] rounded-lg p-4 border border-[var(--zalama-border)] animate-pulse">
              <div className="h-4 bg-[var(--zalama-border)] rounded mb-2"></div>
              <div className="h-6 bg-[var(--zalama-border)] rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!requestStats) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-[var(--zalama-text)]">
            Statistiques des Demandes
          </h3>
        </div>
        <div className="bg-[var(--zalama-bg-light)] rounded-lg p-4 border border-[var(--zalama-border)]">
          <p className="text-[var(--zalama-text-secondary)]">Aucune donnée disponible</p>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'GNF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[var(--zalama-text)]">
          Statistiques des Demandes d'Avance
        </h3>
        <div className="text-sm text-[var(--zalama-text-secondary)]">
          Total: {requestStats.total} demandes
        </div>
      </div>

      {/* Cartes de statistiques */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Total */}
        <div className="bg-[var(--zalama-bg-light)] rounded-lg p-4 border border-[var(--zalama-border)]">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs md:text-sm text-[var(--zalama-text-secondary)] truncate">Total</p>
              <p className="text-xl md:text-2xl font-bold text-[var(--zalama-text)]">{requestStats.total}</p>
            </div>
            <div className="text-[var(--zalama-blue)] flex-shrink-0 ml-2">
              <FileText className="w-5 h-5 md:w-6 md:h-6" />
            </div>
          </div>
        </div>

        {/* En attente */}
        <div className="bg-[var(--zalama-bg-light)] rounded-lg p-4 border border-[var(--zalama-border)]">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs md:text-sm text-[var(--zalama-text-secondary)] truncate">En attente</p>
              <p className="text-xl md:text-2xl font-bold text-[var(--zalama-warning)]">{requestStats.enAttente}</p>
            </div>
            <div className="text-[var(--zalama-warning)] flex-shrink-0 ml-2">
              <Clock className="w-5 h-5 md:w-6 md:h-6" />
            </div>
          </div>
        </div>

        {/* Approuvées */}
        <div className="bg-[var(--zalama-bg-light)] rounded-lg p-4 border border-[var(--zalama-border)]">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs md:text-sm text-[var(--zalama-text-secondary)] truncate">Approuvées</p>
              <p className="text-xl md:text-2xl font-bold text-[var(--zalama-success)]">{requestStats.approuvees}</p>
            </div>
            <div className="text-[var(--zalama-success)] flex-shrink-0 ml-2">
              <CheckCircle className="w-5 h-5 md:w-6 md:h-6" />
            </div>
          </div>
        </div>

        {/* Rejetées */}
        <div className="bg-[var(--zalama-bg-light)] rounded-lg p-4 border border-[var(--zalama-border)]">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs md:text-sm text-[var(--zalama-text-secondary)] truncate">Rejetées</p>
              <p className="text-xl md:text-2xl font-bold text-[var(--zalama-danger)]">{requestStats.rejetees}</p>
            </div>
            <div className="text-[var(--zalama-danger)] flex-shrink-0 ml-2">
              <XCircle className="w-5 h-5 md:w-6 md:h-6" />
            </div>
          </div>
        </div>

        {/* Montant total */}
        <div className="bg-[var(--zalama-bg-light)] rounded-lg p-4 border border-[var(--zalama-border)]">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs md:text-sm text-[var(--zalama-text-secondary)] truncate">Montant total</p>
              <p className="text-sm md:text-lg font-bold text-[var(--zalama-text)] leading-tight">{formatCurrency(requestStats.montantTotal)}</p>
            </div>
            <div className="text-[var(--zalama-green)] flex-shrink-0 ml-2">
              <DollarSign className="w-5 h-5 md:w-6 md:h-6" />
            </div>
          </div>
        </div>

        {/* Montant moyen */}
        <div className="bg-[var(--zalama-bg-light)] rounded-lg p-4 border border-[var(--zalama-border)]">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs md:text-sm text-[var(--zalama-text-secondary)] truncate">Montant moyen</p>
              <p className="text-sm md:text-lg font-bold text-[var(--zalama-text)] leading-tight">{formatCurrency(requestStats.montantMoyen)}</p>
            </div>
            <div className="text-[var(--zalama-blue)] flex-shrink-0 ml-2">
              <TrendingUp className="w-5 h-5 md:w-6 md:h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Répartition par partenaire */}
      {Object.keys(requestStats.parPartenaire).length > 0 && (
        <div className="bg-[var(--zalama-bg-light)] rounded-lg p-4 border border-[var(--zalama-border)]">
          <h4 className="text-sm font-medium text-[var(--zalama-text)] mb-3">
            Répartition par partenaire
          </h4>
          <div className="space-y-2">
            {Object.entries(requestStats.parPartenaire)
              .sort(([,a], [,b]) => b - a)
              .slice(0, 5)
              .map(([partenaire, count]) => (
                <div key={partenaire} className="flex items-center justify-between">
                  <span className="text-sm text-[var(--zalama-text-secondary)]">{partenaire}</span>
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
            { key: 'En attente', label: 'En attente', color: 'bg-[var(--zalama-warning)]', count: requestStats.enAttente },
            { key: 'Validé', label: 'Validées', color: 'bg-[var(--zalama-success)]', count: requestStats.approuvees },
            { key: 'Rejeté', label: 'Rejetées', color: 'bg-[var(--zalama-danger)]', count: requestStats.rejetees }
          ].map(({ key, label, color, count }) => {
            const percentage = requestStats.total > 0 ? (count / requestStats.total) * 100 : 0;
            
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
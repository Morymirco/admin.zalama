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
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Total */}
        <div className="bg-[var(--zalama-bg-light)] rounded-lg p-4 border border-[var(--zalama-border)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[var(--zalama-text-secondary)]">Total</p>
              <p className="text-2xl font-bold text-[var(--zalama-text)]">{requestStats.total}</p>
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
              <p className="text-2xl font-bold text-[var(--zalama-warning)]">{requestStats.enAttente}</p>
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
              <p className="text-2xl font-bold text-[var(--zalama-success)]">{requestStats.approuvees}</p>
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
              <p className="text-2xl font-bold text-[var(--zalama-danger)]">{requestStats.rejetees}</p>
            </div>
            <div className="text-[var(--zalama-danger)]">
              <XCircle className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Montant total */}
        <div className="bg-[var(--zalama-bg-light)] rounded-lg p-4 border border-[var(--zalama-border)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[var(--zalama-text-secondary)]">Montant total</p>
              <p className="text-lg font-bold text-[var(--zalama-text)]">{formatCurrency(requestStats.montantTotal)}</p>
            </div>
            <div className="text-[var(--zalama-green)]">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Montant moyen */}
        <div className="bg-[var(--zalama-bg-light)] rounded-lg p-4 border border-[var(--zalama-border)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[var(--zalama-text-secondary)]">Montant moyen</p>
              <p className="text-lg font-bold text-[var(--zalama-text)]">{formatCurrency(requestStats.montantMoyen)}</p>
            </div>
            <div className="text-[var(--zalama-blue)]">
              <TrendingUp className="w-6 h-6" />
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
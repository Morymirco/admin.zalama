import React from 'react';
import { FinanceStats } from '@/services/financeService';
import { TrendingUp, TrendingDown, DollarSign, Users, Calendar, BarChart3 } from 'lucide-react';

interface FinanceStatsProps {
  stats: FinanceStats;
  loading?: boolean;
}

const FinanceStats: React.FC<FinanceStatsProps> = ({ stats, loading = false }) => {
  const formatMontant = (montant: number) => {
    return new Intl.NumberFormat('fr-FR').format(montant) + ' GNF';
  };

  const formatPourcentage = (pourcentage: number) => {
    return Math.round(pourcentage) + '%';
  };

  if (loading) {
    return (
      <div className="bg-[var(--zalama-card)] rounded-xl shadow-sm p-5 border border-[var(--zalama-border)] mb-6">
        <h2 className="text-xl font-bold mb-4 text-[var(--zalama-text)]">Performance financière</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="border border-[var(--zalama-border)] rounded-lg p-4 animate-pulse">
              <div className="h-4 bg-[var(--zalama-bg-lighter)] rounded mb-2"></div>
              <div className="h-6 bg-[var(--zalama-bg-lighter)] rounded mb-2"></div>
              <div className="h-3 bg-[var(--zalama-bg-lighter)] rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--zalama-card)] rounded-xl shadow-sm p-5 border border-[var(--zalama-border)] mb-6">
      <h2 className="text-xl font-bold mb-4 text-[var(--zalama-text)]">Performance financière</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Première ligne */}
        <div className="border border-[var(--zalama-border)] rounded-lg p-4">
          <p className="text-sm text-[var(--zalama-text-secondary)] mb-1">Montant total de départ</p>
          <p className="text-xl font-bold text-[var(--zalama-text)]">{formatMontant(stats.capitalInitial)}</p>
          <div className="mt-2 flex items-center">
            <span className="text-xs text-[var(--zalama-text-secondary)]">Capital initial</span>
          </div>
        </div>
        
        <div className="border border-[var(--zalama-border)] rounded-lg p-4">
          <p className="text-sm text-[var(--zalama-text-secondary)] mb-1">Montant total débloqué</p>
          <p className="text-xl font-bold text-[var(--zalama-text)]">{formatMontant(stats.montantDebloque)}</p>
          <div className="mt-2 flex items-center">
            <span className="text-xs text-[var(--zalama-text-secondary)]">Avances, prêts, salaires</span>
          </div>
        </div>
        
        <div className="border border-[var(--zalama-border)] rounded-lg p-4">
          <p className="text-sm text-[var(--zalama-text-secondary)] mb-1">Montant total actuel</p>
          <p className="text-xl font-bold text-[var(--zalama-blue)]">{formatMontant(stats.soldeDisponible)}</p>
          <div className="mt-2 flex items-center">
            <span className="text-xs text-[var(--zalama-text-secondary)]">Solde disponible</span>
          </div>
        </div>
        
        <div className="border border-[var(--zalama-border)] rounded-lg p-4">
          <p className="text-sm text-[var(--zalama-text-secondary)] mb-1">Montant total récupéré</p>
          <p className="text-xl font-bold text-[var(--zalama-success)]">{formatMontant(stats.montantRecupere)}</p>
          <div className="mt-2 flex items-center">
            <span className="text-xs text-[var(--zalama-text-secondary)]">Remboursements</span>
          </div>
        </div>
        
        {/* Deuxième ligne */}
        <div className="border border-[var(--zalama-border)] rounded-lg p-4">
          <p className="text-sm text-[var(--zalama-text-secondary)] mb-1">Taux de remboursement</p>
          <p className="text-xl font-bold text-[var(--zalama-text)]">{formatPourcentage(stats.tauxRemboursement)}</p>
          <div className="mt-2 w-full bg-[var(--zalama-bg-lighter)] h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-[var(--zalama-success)] h-full rounded-full transition-all duration-500" 
              style={{ width: `${Math.min(stats.tauxRemboursement, 100)}%` }}
            ></div>
          </div>
        </div>
        
        <div className="border border-[var(--zalama-border)] rounded-lg p-4">
          <p className="text-sm text-[var(--zalama-text-secondary)] mb-1">Revenus par commissions</p>
          <p className="text-xl font-bold text-[var(--zalama-text)]">{formatMontant(stats.revenusCommissions)}</p>
          <div className="mt-2 flex items-center gap-2">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-[var(--zalama-blue)]"></div>
              <span className="text-xs text-[var(--zalama-text-secondary)]">Étudiants: 40%</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-[var(--zalama-success)]"></div>
              <span className="text-xs text-[var(--zalama-text-secondary)]">Salariés: 35%</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-[var(--zalama-warning)]"></div>
              <span className="text-xs text-[var(--zalama-text-secondary)]">Entreprises: 25%</span>
            </div>
          </div>
        </div>
        
        <div className="border border-[var(--zalama-border)] rounded-lg p-4 col-span-1 md:col-span-2 lg:col-span-2">
          <p className="text-sm text-[var(--zalama-text-secondary)] mb-1">Bénéfice net / Perte</p>
          <div className="flex items-center gap-2">
            <p className={`text-xl font-bold ${stats.beneficeNet >= 0 ? 'text-[var(--zalama-success)]' : 'text-[var(--zalama-danger)]'}`}>
              {stats.beneficeNet >= 0 ? '+' : ''}{formatMontant(stats.beneficeNet)}
            </p>
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              stats.beneficeNet >= 0 
                ? 'bg-[var(--zalama-success)]/10 text-[var(--zalama-success)]' 
                : 'bg-[var(--zalama-danger)]/10 text-[var(--zalama-danger)]'
            }`}>
              {stats.beneficeNet >= 0 ? '+' : ''}{formatPourcentage((stats.beneficeNet / stats.capitalInitial) * 100)}
            </span>
          </div>
          <div className="mt-2 flex items-center">
            <span className="text-xs text-[var(--zalama-text-secondary)]">Calculé sur la base des revenus moins les dépenses</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinanceStats; 
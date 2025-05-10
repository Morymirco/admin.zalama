import React from 'react';
import { TrendingUp, ArrowUpRight, ArrowDownRight, DollarSign, PiggyBank, BarChart3 } from 'lucide-react';

export default function PerformanceFinanciere() {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4 text-[var(--zalama-blue)]">Performance financière</h2>
      
      {/* Carte principale avec le montant total */}
      <div className="bg-[var(--zalama-bg-light)] rounded-lg p-3 mb-4 border border-[var(--zalama-border)]">
        <div className="flex justify-between items-center">
          <div>
            <div className="text-sm text-[var(--zalama-text-secondary)]">Montants Financiers</div>
            <div className="text-2xl font-bold text-[var(--zalama-text)]">25,000,000 GNF</div>
          </div>
          <div className="bg-[var(--zalama-blue-light)] p-2 rounded-full">
            <DollarSign className="h-6 w-6 text-[var(--zalama-blue)]" />
          </div>
        </div>
      </div>
      
      {/* Grille de statistiques financières */}
      <div className="grid grid-cols-2 gap-3">
        {/* Montant Débloqué */}
        <div className="bg-[var(--zalama-bg-light)] rounded-lg p-3 border border-[var(--zalama-border)]">
          <div className="flex justify-between items-center mb-1">
            <div className="text-sm text-[var(--zalama-text-secondary)]">Montant Débloqué</div>
            <div className="bg-[var(--zalama-success-light)] p-1 rounded-full">
              <ArrowUpRight className="h-4 w-4 text-[var(--zalama-success)]" />
            </div>
          </div>
          <div className="text-lg font-bold text-[var(--zalama-text)]">950,000 GNF</div>
        </div>
        
        {/* Montant Récupéré */}
        <div className="bg-[var(--zalama-bg-light)] rounded-lg p-3 border border-[var(--zalama-border)]">
          <div className="flex justify-between items-center mb-1">
            <div className="text-sm text-[var(--zalama-text-secondary)]">Montant Récupéré</div>
            <div className="bg-[var(--zalama-blue-light)] p-1 rounded-full">
              <PiggyBank className="h-4 w-4 text-[var(--zalama-blue)]" />
            </div>
          </div>
          <div className="text-lg font-bold text-[var(--zalama-text)]">75,000 GNF</div>
        </div>
        
        {/* Revenus Générés */}
        <div className="bg-[var(--zalama-bg-light)] rounded-lg p-3 border border-[var(--zalama-border)]">
          <div className="flex justify-between items-center mb-1">
            <div className="text-sm text-[var(--zalama-text-secondary)]">Revenus Générés</div>
            <div className="bg-[var(--zalama-warning-light)] p-1 rounded-full">
              <TrendingUp className="h-4 w-4 text-[var(--zalama-warning)]" />
            </div>
          </div>
          <div className="text-lg font-bold text-[var(--zalama-text)]">50,000 GNF</div>
        </div>
        
        {/* Taux Remboursement */}
        <div className="bg-[var(--zalama-bg-light)] rounded-lg p-3 border border-[var(--zalama-border)]">
          <div className="flex justify-between items-center mb-1">
            <div className="text-sm text-[var(--zalama-text-secondary)]">Taux Remboursement</div>
            <div className="bg-[var(--zalama-success-light)] p-1 rounded-full">
              <BarChart3 className="h-4 w-4 text-[var(--zalama-success)]" />
            </div>
          </div>
          <div className="text-lg font-bold text-[var(--zalama-text)]">90%</div>
        </div>
      </div>
    </div>
  );
}

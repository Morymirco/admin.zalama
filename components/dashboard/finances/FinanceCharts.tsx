import React from 'react';
import { ChartData } from '@/services/financeService';
import { PieChart, BarChart, TrendingUp } from 'lucide-react';

interface FinanceChartsProps {
  chartData: ChartData;
  loading?: boolean;
}

const FinanceCharts: React.FC<FinanceChartsProps> = ({ chartData, loading = false }) => {
  const formatMontant = (montant: number) => {
    return new Intl.NumberFormat('fr-FR').format(montant) + ' GNF';
  };

  // Calculate pie chart percentages
  const totalRevenue = chartData.evolutionMensuelle.reduce((sum, m) => sum + m.revenus, 0);
  const totalExpenses = chartData.evolutionMensuelle.reduce((sum, m) => sum + m.depenses, 0);
  const total = totalRevenue + totalExpenses;
  const revenuePercentage = total > 0 ? (totalRevenue / total) * 100 : 0;
  const expensePercentage = total > 0 ? (totalExpenses / total) * 100 : 0;

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-[var(--zalama-card)] rounded-xl shadow-sm p-5 border border-[var(--zalama-border)] animate-pulse">
            <div className="h-6 bg-[var(--zalama-bg-lighter)] rounded mb-4"></div>
            <div className="h-64 bg-[var(--zalama-bg-lighter)] rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      {/* Graphique de répartition revenus/dépenses */}
      <div className="bg-[var(--zalama-card)] rounded-xl shadow-sm p-5 border border-[var(--zalama-border)]">
        <h3 className="text-lg font-semibold text-[var(--zalama-text)] mb-4">Répartition Revenus/Dépenses</h3>
        <div className="flex items-center justify-center h-64">
          <div className="relative w-48 h-48">
            {/* Cercle représentant le graphique en camembert */}
            <div className="absolute inset-0 rounded-full overflow-hidden">
              <div 
                className="absolute top-0 left-0 bg-[var(--zalama-blue)] h-full transition-all duration-500" 
                style={{ width: revenuePercentage + '%' }}
              />
              <div 
                className="absolute top-0 right-0 bg-[var(--zalama-danger)] h-full transition-all duration-500" 
                style={{ width: expensePercentage + '%' }}
              />
            </div>
            <div className="absolute inset-0 flex items-center justify-center flex-col">
              <PieChart className="h-10 w-10 text-[var(--zalama-text-secondary)] mb-2" />
              <span className="text-sm font-medium text-[var(--zalama-text)]">
                {Math.round(revenuePercentage)}% / {Math.round(expensePercentage)}%
              </span>
            </div>
          </div>
        </div>
        <div className="flex justify-center gap-6 mt-4">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-[var(--zalama-blue)] mr-2" />
            <span className="text-sm text-[var(--zalama-text)]">Revenus</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-[var(--zalama-danger)] mr-2" />
            <span className="text-sm text-[var(--zalama-text)]">Dépenses</span>
          </div>
        </div>
      </div>
      
      {/* Graphique d'évolution mensuelle */}
      <div className="bg-[var(--zalama-card)] rounded-xl shadow-sm p-5 border border-[var(--zalama-border)]">
        <h3 className="text-lg font-semibold text-[var(--zalama-text)] mb-4">Évolution Mensuelle</h3>
        <div className="h-64 flex items-end justify-between gap-2 pt-5">
          {/* Barres du graphique */}
          {chartData.evolutionMensuelle.map((month) => {
            const total = month.revenus + month.depenses;
            const maxValue = Math.max(...chartData.evolutionMensuelle.map(m => m.revenus + m.depenses));
            
            const revenueHeight = total > 0 ? (month.revenus / maxValue) * 100 : 0;
            const expenseHeight = total > 0 ? (month.depenses / maxValue) * 100 : 0;
            
            return (
              <div key={month.mois} className="flex flex-col items-center flex-1">
                <div className="w-full flex justify-center gap-1">
                  <div 
                    className="w-5 bg-[var(--zalama-blue)] rounded-t transition-all duration-500" 
                    style={{ height: `${revenueHeight}%` }}
                  />
                  <div 
                    className="w-5 bg-[var(--zalama-danger)] rounded-t transition-all duration-500" 
                    style={{ height: `${expenseHeight}%` }}
                  />
                </div>
                <span className="text-xs text-[var(--zalama-text-secondary)] mt-2">{month.mois}</span>
              </div>
            );
          })}
        </div>
        <div className="flex justify-center gap-6 mt-4">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-sm bg-[var(--zalama-blue)] mr-2" />
            <span className="text-sm text-[var(--zalama-text)]">Revenus</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-sm bg-[var(--zalama-danger)] mr-2" />
            <span className="text-sm text-[var(--zalama-text)]">Dépenses</span>
          </div>
        </div>
      </div>
      
      {/* Graphique des catégories de dépenses */}
      <div className="bg-[var(--zalama-card)] rounded-xl shadow-sm p-5 border border-[var(--zalama-border)]">
        <h3 className="text-lg font-semibold text-[var(--zalama-text)] mb-4">Répartition par Catégorie</h3>
        <div className="h-64 flex flex-col gap-3 overflow-y-auto pr-2">
          {/* Barres horizontales pour chaque catégorie */}
          {chartData.repartitionCategories.map((category) => (
            <div key={category.categorie} className="flex flex-col">
              <div className="flex justify-between mb-1">
                <span className="text-sm text-[var(--zalama-text)]">{category.categorie}</span>
                <span className="text-sm font-medium text-[var(--zalama-text)]">{Math.round(category.pourcentage)}%</span>
              </div>
              <div className="w-full h-2 bg-[var(--zalama-bg-lighter)] rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    category.type === 'revenu' ? 'bg-[var(--zalama-blue)]' : 'bg-[var(--zalama-danger)]'
                  }`} 
                  style={{ width: `${category.pourcentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-center mt-4">
          <BarChart className="h-5 w-5 text-[var(--zalama-text-secondary)] mr-2" />
          <span className="text-sm text-[var(--zalama-text)]">Basé sur les 6 derniers mois</span>
        </div>
      </div>
      
      {/* Tendances et prévisions */}
      <div className="bg-[var(--zalama-card)] rounded-xl shadow-sm p-5 border border-[var(--zalama-border)]">
        <h3 className="text-lg font-semibold text-[var(--zalama-text)] mb-4">Tendances et Prévisions</h3>
        <div className="h-64 flex items-center justify-center">
          <div className="w-full h-40 relative">
            {/* Ligne de tendance */}
            <div className="absolute inset-0 flex items-center">
              <div className="w-full h-px bg-[var(--zalama-border)] relative">
                {/* Points sur la ligne */}
                {chartData.evolutionMensuelle.map((month, i) => {
                  const position = (i / (chartData.evolutionMensuelle.length - 1)) * 100;
                  const value = (month.revenus / Math.max(...chartData.evolutionMensuelle.map(m => m.revenus))) * 100;
                  
                  return (
                    <div 
                      key={i} 
                      className="absolute w-2 h-2 rounded-full bg-[var(--zalama-blue)] transform -translate-x-1 -translate-y-1 transition-all duration-500" 
                      style={{ left: `${position}%`, top: `${100 - value}%` }}
                    />
                  );
                })}
                
                {/* Ligne reliant les points */}
                <svg className="absolute inset-0 w-full h-full" style={{ top: '-50%', height: '200%' }}>
                  <polyline 
                    points={chartData.evolutionMensuelle.map((month, i) => {
                      const x = (i / (chartData.evolutionMensuelle.length - 1)) * 100;
                      const y = 100 - (month.revenus / Math.max(...chartData.evolutionMensuelle.map(m => m.revenus))) * 100;
                      return `${x},${y}`;
                    }).join(' ')}
                    fill="none" 
                    stroke="var(--zalama-blue)" 
                    strokeWidth="2"
                  />
                </svg>
              </div>
            </div>
            
            {/* Indicateur de tendance */}
            <div className="absolute bottom-0 right-0 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-[var(--zalama-success)]" />
              <span className="text-sm font-medium text-[var(--zalama-success)]">
                {chartData.tendances.croissance >= 0 ? '+' : ''}{Math.round(chartData.tendances.croissance)}% prévus
              </span>
            </div>
          </div>
        </div>
        <div className="flex justify-between mt-4">
          {chartData.evolutionMensuelle.slice(0, 6).map((month, i) => (
            <span key={i} className="text-xs text-[var(--zalama-text-secondary)]">{month.mois}</span>
          ))}
          <span className="text-xs text-[var(--zalama-text-secondary)] font-medium">
            {chartData.evolutionMensuelle[6]?.mois} (prév.)
          </span>
        </div>
      </div>
    </div>
  );
};

export default FinanceCharts; 
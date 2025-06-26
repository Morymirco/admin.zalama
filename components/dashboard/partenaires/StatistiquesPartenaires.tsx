import React from 'react';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Building, Users, Globe, RefreshCw } from 'lucide-react';

interface StatistiquePartenaire {
  type: string;
  nombre: number;
  nouveauxCeMois: number;
  actifs: number;
  inactifs: number;
  tendance: 'hausse' | 'stable' | 'baisse';
  icon: React.ReactNode;
}

interface StatistiquesPartenairesProps {
  statistiques: StatistiquePartenaire[];
  isLoading?: boolean;
}

const StatistiquesPartenaires: React.FC<StatistiquesPartenairesProps> = ({ statistiques, isLoading = false }) => {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4 text-[var(--zalama-text)]">Activité par type de partenaire</h2>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <RefreshCw className="h-8 w-8 animate-spin text-[var(--zalama-blue)]" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {statistiques.map((stat, index) => (
            <div key={index} className="bg-[var(--zalama-card)] rounded-xl shadow-sm p-5 border border-[var(--zalama-border)] hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center">
                  <div className="p-2 bg-[var(--zalama-blue)]/10 rounded-lg mr-3">
                    {stat.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-[var(--zalama-text)] text-lg">{stat.type}</h3>
                    <div className="flex items-center mt-1">
                      <span className="text-xs text-[var(--zalama-text-secondary)]">
                        {stat.nouveauxCeMois} nouveau{stat.nouveauxCeMois > 1 ? 'x' : ''} ce mois
                      </span>
                      <span className={`ml-2 text-xs ${stat.tendance === 'hausse' ? 'text-[var(--zalama-success)]' : stat.tendance === 'baisse' ? 'text-[var(--zalama-danger)]' : 'text-[var(--zalama-text-secondary)]'}`}>
                        {stat.tendance === 'hausse' ? '↗' : stat.tendance === 'baisse' ? '↘' : '→'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-3xl font-bold text-[var(--zalama-text)]">{stat.nombre}</span>
                  <p className="text-xs text-[var(--zalama-text-secondary)]">total</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex flex-col">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-[var(--zalama-text-secondary)]">Actifs</span>
                    <span className="text-sm font-medium text-[var(--zalama-success)]">{stat.actifs}</span>
                  </div>
                  <div className="w-full bg-[var(--zalama-bg-lighter)] rounded-full h-2">
                    <div 
                      className="bg-[var(--zalama-success)] h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${stat.nombre > 0 ? (stat.actifs / stat.nombre) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="flex flex-col">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-[var(--zalama-text-secondary)]">Inactifs</span>
                    <span className="text-sm font-medium text-[var(--zalama-danger)]">{stat.inactifs}</span>
                  </div>
                  <div className="w-full bg-[var(--zalama-bg-lighter)] rounded-full h-2">
                    <div 
                      className="bg-[var(--zalama-danger)] h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${stat.nombre > 0 ? (stat.inactifs / stat.nombre) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StatistiquesPartenaires;

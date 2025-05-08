import React from 'react';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { RefreshCw, DollarSign, Users, ArrowUpCircle } from 'lucide-react';

interface DemandeStats {
  type: string;
  nombre: number;
  approuvees: number;
  enCours: number;
  refusees: number;
  delaiMoyen: number; // en heures
  tendance: 'hausse' | 'stable' | 'baisse';
  icon: React.ReactNode;
}

interface StatistiquesServicesProps {
  demandeStats: DemandeStats[];
  isLoading: boolean;
}

const StatistiquesServices: React.FC<StatistiquesServicesProps> = ({ demandeStats, isLoading }) => {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4 text-[var(--zalama-text)]">Activité par service (ce mois-ci)</h2>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <RefreshCw className="h-8 w-8 animate-spin text-[var(--zalama-blue)]" />
        </div>
      ) : (
        <div>
          {/* Cartes des statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {demandeStats.map((stat, index) => (
              <div key={index} className="bg-[var(--zalama-card)] rounded-xl shadow-sm p-5 border border-[var(--zalama-border)]">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center">
                    <div className="mr-3">
                      {stat.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-[var(--zalama-text)]">{stat.type}</h3>
                      <div className="flex items-center mt-1">
                        <span className="text-xs text-[var(--zalama-text-secondary)]">
                          Délai moyen: {stat.delaiMoyen}h
                        </span>
                        <span className={`ml-2 text-xs ${stat.tendance === 'hausse' ? 'text-[var(--zalama-success)]' : stat.tendance === 'baisse' ? 'text-[var(--zalama-danger)]' : 'text-[var(--zalama-text-secondary)]'}`}>
                          {stat.tendance === 'hausse' ? '↑' : stat.tendance === 'baisse' ? '↓' : '→'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-[var(--zalama-text)]">{stat.nombre}</span>
                    <p className="text-xs text-[var(--zalama-text-secondary)]">demandes</p>
                  </div>
                </div>
                
                <div className="flex flex-col space-y-2">
                  <div className="flex flex-col">
                    <div className="flex justify-between mb-1">
                      <span className="text-xs text-[var(--zalama-text-secondary)]">Approuvées</span>
                      <span className="text-xs font-medium text-[var(--zalama-success)]">{stat.approuvees}</span>
                    </div>
                    <div className="w-full bg-[var(--zalama-bg-lighter)] rounded-full h-1.5">
                      <div 
                        className="bg-[var(--zalama-success)] h-1.5 rounded-full" 
                        style={{ width: `${(stat.approuvees / stat.nombre) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col">
                    <div className="flex justify-between mb-1">
                      <span className="text-xs text-[var(--zalama-text-secondary)]">En cours</span>
                      <span className="text-xs font-medium text-[var(--zalama-warning)]">{stat.enCours}</span>
                    </div>
                    <div className="w-full bg-[var(--zalama-bg-lighter)] rounded-full h-1.5">
                      <div 
                        className="bg-[var(--zalama-warning)] h-1.5 rounded-full" 
                        style={{ width: `${(stat.enCours / stat.nombre) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col">
                    <div className="flex justify-between mb-1">
                      <span className="text-xs text-[var(--zalama-text-secondary)]">Refusées</span>
                      <span className="text-xs font-medium text-[var(--zalama-danger)]">{stat.refusees}</span>
                    </div>
                    <div className="w-full bg-[var(--zalama-bg-lighter)] rounded-full h-1.5">
                      <div 
                        className="bg-[var(--zalama-danger)] h-1.5 rounded-full" 
                        style={{ width: `${(stat.refusees / stat.nombre) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StatistiquesServices;

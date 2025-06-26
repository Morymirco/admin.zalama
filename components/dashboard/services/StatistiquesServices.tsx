import React from 'react';
import { RefreshCw, DollarSign, Users, ArrowUpCircle, FileText, Clock, CheckCircle } from 'lucide-react';

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

interface ServiceStats {
  total: number;
  disponibles: number;
  indisponibles: number;
  parCategorie: Record<string, number>;
}

interface StatistiquesServicesProps {
  demandeStats?: DemandeStats[];
  serviceStats?: ServiceStats;
  isLoading?: boolean;
}

const StatistiquesServices: React.FC<StatistiquesServicesProps> = ({ 
  demandeStats, 
  serviceStats,
  isLoading = false 
}) => {
  // Créer des données de démonstration si aucune donnée n'est disponible
  const createDemoStats = (): DemandeStats[] => {
    return [
      {
        type: 'Avance sur salaire',
        nombre: 45,
        approuvees: 32,
        enCours: 8,
        refusees: 5,
        delaiMoyen: 24,
        tendance: 'hausse' as const,
        icon: <DollarSign className="h-6 w-6 text-[var(--zalama-success)]" />
      },
      {
        type: 'Demande de congé',
        nombre: 28,
        approuvees: 25,
        enCours: 2,
        refusees: 1,
        delaiMoyen: 48,
        tendance: 'stable' as const,
        icon: <Clock className="h-6 w-6 text-[var(--zalama-warning)]" />
      },
      {
        type: 'Attestation de travail',
        nombre: 67,
        approuvees: 65,
        enCours: 1,
        refusees: 1,
        delaiMoyen: 12,
        tendance: 'hausse' as const,
        icon: <FileText className="h-6 w-6 text-[var(--zalama-blue)]" />
      }
    ];
  };

  // Déterminer les données à afficher
  const statsToDisplay = demandeStats || createDemoStats();

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4 text-[var(--zalama-text)]">Activité par service (ce mois-ci)</h2>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <RefreshCw className="h-8 w-8 animate-spin text-[var(--zalama-blue)]" />
        </div>
      ) : statsToDisplay.length === 0 ? (
        <div className="flex justify-center items-center h-40">
          <div className="text-center">
            <p className="text-[var(--zalama-text-secondary)] mb-2">Aucune donnée disponible</p>
            <p className="text-sm text-[var(--zalama-text-secondary)]">Les statistiques des services apparaîtront ici</p>
          </div>
        </div>
      ) : (
        <div>
          {/* Cartes des statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {statsToDisplay.map((stat, index) => (
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

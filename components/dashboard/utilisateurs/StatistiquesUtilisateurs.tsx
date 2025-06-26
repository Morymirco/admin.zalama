import React from 'react';
import { RefreshCw, Users, GraduationCap, Briefcase, Building } from 'lucide-react';

interface StatistiqueUtilisateur {
  type: string;
  nombre: number;
  nouveauxCeMois: number;
  actifs: number;
  inactifs: number;
  tendance: 'hausse' | 'stable' | 'baisse';
  icon: React.ReactNode;
}

interface StatistiquesUtilisateursProps {
  statistiques?: StatistiqueUtilisateur[];
  isLoading?: boolean;
}

const StatistiquesUtilisateurs: React.FC<StatistiquesUtilisateursProps> = ({ 
  statistiques = [], 
  isLoading = false 
}) => {
  // Données par défaut si aucune statistique n'est fournie
  const defaultStats: StatistiqueUtilisateur[] = [
    {
      type: 'Étudiants',
      nombre: 0,
      nouveauxCeMois: 0,
      actifs: 0,
      inactifs: 0,
      tendance: 'stable',
      icon: <GraduationCap className="h-6 w-6 text-[var(--zalama-blue)]" />
    },
    {
      type: 'Salariés',
      nombre: 0,
      nouveauxCeMois: 0,
      actifs: 0,
      inactifs: 0,
      tendance: 'stable',
      icon: <Briefcase className="h-6 w-6 text-[var(--zalama-green)]" />
    },
    {
      type: 'Entreprises',
      nombre: 0,
      nouveauxCeMois: 0,
      actifs: 0,
      inactifs: 0,
      tendance: 'stable',
      icon: <Building className="h-6 w-6 text-[var(--zalama-orange)]" />
    }
  ];

  // Utiliser les statistiques fournies ou les données par défaut
  const statsToDisplay = statistiques && statistiques.length > 0 ? statistiques : defaultStats;

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4 text-[var(--zalama-text)]">Activité par type d&apos;utilisateur</h2>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <RefreshCw className="h-8 w-8 animate-spin text-[var(--zalama-blue)]" />
        </div>
      ) : (
        <div>
          {/* Cartes des statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {statsToDisplay.map((stat, index) => (
              <div key={index} className="bg-[var(--zalama-card)] rounded-xl shadow-sm p-3 border border-[var(--zalama-border)]">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center">
                    <div className="mr-3">
                      {stat.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-[var(--zalama-text)]">{stat.type}</h3>
                      <div className="flex items-center mt-1">
                        <span className="text-xs text-[var(--zalama-text-secondary)]">
                          {stat.tendance === 'hausse' ? '+' : stat.tendance === 'baisse' ? '-' : ''}{stat.nouveauxCeMois} ce mois
                        </span>
                        <span className={`ml-2 text-xs ${stat.tendance === 'hausse' ? 'text-[var(--zalama-success)]' : stat.tendance === 'baisse' ? 'text-[var(--zalama-danger)]' : 'text-[var(--zalama-text-secondary)]'}`}>
                          {stat.tendance === 'hausse' ? '↑' : stat.tendance === 'baisse' ? '↓' : '→'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-[var(--zalama-text)]">{stat.nombre}</span>
                    <p className="text-xs text-[var(--zalama-text-secondary)]">total</p>
                  </div>
                </div>
                
                <div className="flex flex-col space-y-2">
                  <div className="flex flex-col">
                    <div className="flex justify-between mb-1">
                      <span className="text-xs text-[var(--zalama-text-secondary)]">Actifs</span>
                      <span className="text-xs font-medium text-[var(--zalama-success)]">{stat.actifs}</span>
                    </div>
                    <div className="w-full bg-[var(--zalama-bg-lighter)] rounded-full h-1.5">
                      <div 
                        className="bg-[var(--zalama-success)] h-1.5 rounded-full" 
                        style={{ width: `${stat.nombre > 0 ? (stat.actifs / stat.nombre) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col">
                    <div className="flex justify-between mb-1">
                      <span className="text-xs text-[var(--zalama-text-secondary)]">Inactifs</span>
                      <span className="text-xs font-medium text-[var(--zalama-danger)]">{stat.inactifs}</span>
                    </div>
                    <div className="w-full bg-[var(--zalama-bg-lighter)] rounded-full h-1.5">
                      <div 
                        className="bg-[var(--zalama-danger)] h-1.5 rounded-full" 
                        style={{ width: `${stat.nombre > 0 ? (stat.inactifs / stat.nombre) * 100 : 0}%` }}
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

export default StatistiquesUtilisateurs;

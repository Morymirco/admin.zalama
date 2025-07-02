import React from 'react';
import { Users, Briefcase, Building, UserCheck, UserX } from 'lucide-react';
import { CardSkeleton } from '@/components/ui/skeleton';

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
      type: 'Total Employés',
      nombre: 0,
      nouveauxCeMois: 0,
      actifs: 0,
      inactifs: 0,
      tendance: 'stable',
      icon: <Users className="h-6 w-6 text-[var(--zalama-blue)]" />
    },
    {
      type: 'Employés Actifs',
      nombre: 0,
      nouveauxCeMois: 0,
      actifs: 0,
      inactifs: 0,
      tendance: 'stable',
      icon: <UserCheck className="h-6 w-6 text-[var(--zalama-green)]" />
    },
    {
      type: 'Employés Inactifs',
      nombre: 0,
      nouveauxCeMois: 0,
      actifs: 0,
      inactifs: 0,
      tendance: 'stable',
      icon: <UserX className="h-6 w-6 text-[var(--zalama-orange)]" />
    }
  ];

  // Utiliser les statistiques fournies ou les données par défaut
  const statsToDisplay = statistiques && statistiques.length > 0 ? statistiques : defaultStats;

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4 text-[var(--zalama-text)]">Statistiques des employés</h2>
      
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, index) => (
            <CardSkeleton key={index} />
          ))}
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

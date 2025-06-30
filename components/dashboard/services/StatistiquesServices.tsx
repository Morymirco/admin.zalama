import React from 'react';
import { RefreshCw, DollarSign, Users, ArrowUpCircle, FileText, Clock, CheckCircle, XCircle } from 'lucide-react';

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
  fraisTotal?: number;
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
  // Créer des données par défaut si aucune statistique n'est disponible
  const createDefaultStats = (): ServiceStats => {
    return {
      total: 0,
      disponibles: 0,
      indisponibles: 0,
      parCategorie: {},
      fraisTotal: 0
    };
  };

  // Utiliser les statistiques fournies ou les données par défaut
  const stats = serviceStats || createDefaultStats();

  // Créer les cartes de statistiques
  const statsCards = [
    {
      title: 'Total Services',
      value: stats.total,
      icon: <FileText className="h-6 w-6 text-[var(--zalama-blue)]" />,
      color: 'text-[var(--zalama-blue)]',
      bgColor: 'bg-[var(--zalama-blue)]/10'
    },
    {
      title: 'Services Disponibles',
      value: stats.disponibles,
      icon: <CheckCircle className="h-6 w-6 text-[var(--zalama-success)]" />,
      color: 'text-[var(--zalama-success)]',
      bgColor: 'bg-[var(--zalama-success)]/10'
    },
    {
      title: 'Services Indisponibles',
      value: stats.indisponibles,
      icon: <XCircle className="h-6 w-6 text-[var(--zalama-danger)]" />,
      color: 'text-[var(--zalama-danger)]',
      bgColor: 'bg-[var(--zalama-danger)]/10'
    }
  ];

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4 text-[var(--zalama-text)]">Statistiques des services</h2>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <RefreshCw className="h-8 w-8 animate-spin text-[var(--zalama-blue)]" />
        </div>
      ) : (
        <div>
          {/* Cartes des statistiques principales */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {statsCards.map((card, index) => (
              <div key={index} className="bg-[var(--zalama-card)] rounded-xl shadow-sm p-5 border border-[var(--zalama-border)]">
                <div className="flex items-center justify-between">
                    <div>
                    <p className="text-sm text-[var(--zalama-text-secondary)]">{card.title}</p>
                    <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
                  </div>
                  <div className={`p-3 rounded-full ${card.bgColor}`}>
                    {card.icon}
                  </div>
                </div>
                    </div>
            ))}
                  </div>
                  
          {/* Répartition par catégorie */}
          {Object.keys(stats.parCategorie).length > 0 && (
            <div className="bg-[var(--zalama-card)] rounded-xl shadow-sm p-5 border border-[var(--zalama-border)]">
              <h3 className="text-lg font-semibold mb-4 text-[var(--zalama-text)]">Répartition par catégorie</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(stats.parCategorie).map(([categorie, count]) => (
                  <div key={categorie} className="flex items-center justify-between p-3 bg-[var(--zalama-bg-lighter)] rounded-lg">
                    <span className="text-sm font-medium text-[var(--zalama-text)]">{categorie}</span>
                    <span className="text-sm text-[var(--zalama-text-secondary)]">{count} service{count > 1 ? 's' : ''}</span>
                  </div>
                ))}
                    </div>
                  </div>
          )}

          {/* Frais total si disponible */}
          {stats.fraisTotal !== undefined && stats.fraisTotal > 0 && (
            <div className="mt-6 bg-[var(--zalama-card)] rounded-xl shadow-sm p-5 border border-[var(--zalama-border)]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[var(--zalama-text-secondary)]">Frais totaux attribués</p>
                  <p className="text-2xl font-bold text-[var(--zalama-success)]">
                    {new Intl.NumberFormat('fr-FR', {
                      style: 'currency',
                      currency: 'GNF'
                    }).format(stats.fraisTotal)}
                  </p>
                </div>
                <div className="p-3 bg-[var(--zalama-success)]/10 rounded-full">
                  <DollarSign className="h-6 w-6 text-[var(--zalama-success)]" />
                </div>
              </div>
          </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StatistiquesServices;

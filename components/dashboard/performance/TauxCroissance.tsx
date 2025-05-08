import React from 'react';
import { RefreshCw, TrendingUp, ArrowUp, ArrowDown, ArrowRight } from 'lucide-react';

interface DonneeCroissance {
  mois: string;
  valeur: number;
  variation: number;
}

interface TauxCroissanceProps {
  titre: string;
  description: string;
  donnees: DonneeCroissance[];
  unite: string;
  isLoading: boolean;
}

const TauxCroissance: React.FC<TauxCroissanceProps> = ({
  titre,
  description,
  donnees,
  unite,
  isLoading
}) => {
  // Trouver la valeur maximale pour l'échelle des barres
  const maxValeur = Math.max(...donnees.map(d => d.valeur));
  
  // Fonction pour déterminer la couleur et l'icône de la variation
  const determinerVariation = (variation: number): { couleur: string; icone: React.ReactNode } => {
    if (variation > 0) {
      return {
        couleur: 'text-[var(--zalama-success)]',
        icone: <ArrowUp className="h-4 w-4" />
      };
    } else if (variation < 0) {
      return {
        couleur: 'text-[var(--zalama-danger)]',
        icone: <ArrowDown className="h-4 w-4" />
      };
    } else {
      return {
        couleur: 'text-[var(--zalama-text-secondary)]',
        icone: <ArrowRight className="h-4 w-4" />
      };
    }
  };
  
  return (
    <div className="bg-[var(--zalama-card)] rounded-xl shadow-sm p-5 border border-[var(--zalama-border)] h-full">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-semibold text-[var(--zalama-text)] flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-[var(--zalama-blue)]" />
            {titre}
          </h3>
          <p className="text-xs text-[var(--zalama-text-secondary)]">{description}</p>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <RefreshCw className="h-8 w-8 animate-spin text-[var(--zalama-blue)]" />
        </div>
      ) : (
        <div className="mt-4">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--zalama-border)]">
                  <th className="px-4 py-3 text-left text-xs font-medium text-[var(--zalama-text-secondary)] uppercase tracking-wider">Mois</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[var(--zalama-text-secondary)] uppercase tracking-wider">Valeur</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[var(--zalama-text-secondary)] uppercase tracking-wider">Croissance</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[var(--zalama-text-secondary)] uppercase tracking-wider">Graphique</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--zalama-border)]">
                {donnees.map((donnee, index) => {
                  const { couleur, icone } = determinerVariation(donnee.variation);
                  return (
                    <tr key={index} className="hover:bg-[var(--zalama-bg-lighter)]">
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-[var(--zalama-text)]">
                        {donnee.mois}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-[var(--zalama-text)]">
                        {donnee.valeur}{unite}
                      </td>
                      <td className={`px-4 py-3 whitespace-nowrap text-sm ${couleur} flex items-center`}>
                        {icone}
                        <span className="ml-1">{donnee.variation > 0 ? '+' : ''}{donnee.variation}%</span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="w-full bg-[var(--zalama-bg-lighter)] rounded-full h-1.5">
                          <div 
                            className="bg-[var(--zalama-blue)] h-1.5 rounded-full" 
                            style={{ width: `${(donnee.valeur / maxValeur) * 100}%` }}
                          ></div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          <div className="mt-6">
            <h4 className="text-sm font-medium text-[var(--zalama-text)] mb-2">Tendance de croissance</h4>
            <div className="relative h-40">
              <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
                {/* Lignes de grille horizontales */}
                {[0, 25, 50, 75, 100].map(y => (
                  <line
                    key={`grid-h-${y}`}
                    x1="0"
                    y1={y}
                    x2="100"
                    y2={y}
                    stroke="var(--zalama-border)"
                    strokeWidth="0.2"
                    strokeDasharray={y === 0 || y === 100 ? "none" : "1,1"}
                  />
                ))}
                
                {/* Ligne de tendance */}
                <path
                  d={`M ${donnees.map((d, i) => `${(i / (donnees.length - 1)) * 100} ${100 - (d.valeur / maxValeur) * 80}`).join(' L ')}`}
                  fill="none"
                  stroke="var(--zalama-blue)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                
                {/* Points sur la ligne */}
                {donnees.map((d, i) => (
                  <circle
                    key={`point-${i}`}
                    cx={(i / (donnees.length - 1)) * 100}
                    cy={100 - (d.valeur / maxValeur) * 80}
                    r="2"
                    fill="var(--zalama-blue)"
                    stroke="var(--zalama-card)"
                    strokeWidth="1"
                  />
                ))}
              </svg>
              
              {/* Étiquettes axe X */}
              <div className="flex justify-between mt-2">
                {donnees.map((d, i) => (
                  <span key={`label-${i}`} className="text-xs text-[var(--zalama-text-secondary)]">
                    {d.mois}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TauxCroissance;

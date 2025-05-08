import React from 'react';
import { RefreshCw, LineChart } from 'lucide-react';

interface PointDonnee {
  label: string;
  valeur: number;
}

interface SerieDonnees {
  nom: string;
  donnees: PointDonnee[];
  couleur: string;
}

interface GraphiqueLigneProps {
  titre: string;
  description: string;
  series: SerieDonnees[];
  unite: string;
  isLoading: boolean;
}

const GraphiqueLigne: React.FC<GraphiqueLigneProps> = ({
  titre,
  description,
  series,
  unite,
  isLoading
}) => {
  // Trouver toutes les étiquettes uniques (axe X)
  const toutesEtiquettes = Array.from(
    new Set(series.flatMap(serie => serie.donnees.map(point => point.label)))
  ).sort();
  
  // Trouver les valeurs min et max pour l'échelle (axe Y)
  const toutesValeurs = series.flatMap(serie => serie.donnees.map(point => point.valeur));
  const minValeur = Math.min(...toutesValeurs);
  const maxValeur = Math.max(...toutesValeurs);
  const plage = maxValeur - minValeur;
  
  // Calculer les coordonnées pour chaque point
  const calculerPoints = (serie: SerieDonnees) => {
    return serie.donnees.map(point => {
      const indexX = toutesEtiquettes.indexOf(point.label);
      const x = (indexX / (toutesEtiquettes.length - 1)) * 100;
      const y = 100 - ((point.valeur - minValeur) / plage) * 80; // 80% de hauteur, laissant de la marge
      
      return {
        ...point,
        x,
        y
      };
    }).sort((a, b) => a.x - b.x); // Trier par position X
  };
  
  // Créer le chemin SVG pour une ligne
  const creerCheminLigne = (points: (PointDonnee & { x: number; y: number })[]) => {
    if (points.length === 0) return '';
    
    let chemin = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      chemin += ` L ${points[i].x} ${points[i].y}`;
    }
    
    return chemin;
  };
  
  return (
    <div className="bg-[var(--zalama-card)] rounded-xl shadow-sm p-5 border border-[var(--zalama-border)] h-full">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-semibold text-[var(--zalama-text)] flex items-center">
            <LineChart className="h-5 w-5 mr-2 text-[var(--zalama-blue)]" />
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
        <div className="mt-6">
          <div className="relative h-60">
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
              
              {/* Lignes de grille verticales */}
              {toutesEtiquettes.map((label, index) => {
                const x = (index / (toutesEtiquettes.length - 1)) * 100;
                return (
                  <line
                    key={`grid-v-${index}`}
                    x1={x}
                    y1="0"
                    x2={x}
                    y2="100"
                    stroke="var(--zalama-border)"
                    strokeWidth="0.2"
                    strokeDasharray={index === 0 || index === toutesEtiquettes.length - 1 ? "none" : "1,1"}
                  />
                );
              })}
              
              {/* Lignes pour chaque série */}
              {series.map((serie, index) => {
                const points = calculerPoints(serie);
                return (
                  <path
                    key={`line-${index}`}
                    d={creerCheminLigne(points)}
                    fill="none"
                    stroke={serie.couleur}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                );
              })}
              
              {/* Points pour chaque série */}
              {series.map((serie, serieIndex) => {
                const points = calculerPoints(serie);
                return points.map((point, pointIndex) => (
                  <circle
                    key={`point-${serieIndex}-${pointIndex}`}
                    cx={point.x}
                    cy={point.y}
                    r="1.5"
                    fill={serie.couleur}
                    stroke="var(--zalama-card)"
                    strokeWidth="1"
                    className="hover:r-2 transition-all cursor-pointer"
                  />
                ));
              })}
            </svg>
            
            {/* Étiquettes axe X */}
            <div className="flex justify-between mt-2">
              {toutesEtiquettes.map((label, index) => (
                <span key={`label-${index}`} className="text-xs text-[var(--zalama-text-secondary)]">
                  {label}
                </span>
              ))}
            </div>
            
            {/* Étiquettes axe Y */}
            <div className="absolute top-0 left-0 h-full flex flex-col justify-between pointer-events-none">
              <span className="text-xs text-[var(--zalama-text-secondary)]">{maxValeur}{unite}</span>
              <span className="text-xs text-[var(--zalama-text-secondary)]">{minValeur}{unite}</span>
            </div>
          </div>
          
          {/* Légende */}
          <div className="flex flex-wrap gap-4 mt-4 justify-center">
            {series.map((serie, index) => (
              <div key={`legend-${index}`} className="flex items-center">
                <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: serie.couleur }}></div>
                <span className="text-sm text-[var(--zalama-text)]">{serie.nom}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GraphiqueLigne;

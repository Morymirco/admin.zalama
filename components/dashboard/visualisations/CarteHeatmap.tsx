import React from 'react';
import { RefreshCw, Grid } from 'lucide-react';

interface CelluleHeatmap {
  x: string;
  y: string;
  valeur: number;
}

interface CarteHeatmapProps {
  titre: string;
  description: string;
  donnees: CelluleHeatmap[];
  etiquettesX: string[];
  etiquettesY: string[];
  couleurMin: string;
  couleurMax: string;
  unite: string;
  isLoading: boolean;
}

const CarteHeatmap: React.FC<CarteHeatmapProps> = ({
  titre,
  description,
  donnees,
  etiquettesX,
  etiquettesY,
  couleurMin,
  couleurMax,
  unite,
  isLoading
}) => {
  // Trouver les valeurs min et max pour l'échelle de couleur
  const valeurs = donnees.map(cellule => cellule.valeur);
  const minValeur = Math.min(...valeurs);
  const maxValeur = Math.max(...valeurs);
  
  // Fonction pour obtenir la couleur en fonction de la valeur
  const obtenirCouleur = (valeur: number): string => {
    // Convertir les couleurs hex en composantes RGB
    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : { r: 0, g: 0, b: 0 };
    };
    
    const rgbMin = hexToRgb(couleurMin);
    const rgbMax = hexToRgb(couleurMax);
    
    // Calculer le ratio entre min et max
    const ratio = maxValeur === minValeur ? 0 : (valeur - minValeur) / (maxValeur - minValeur);
    
    // Interpoler les composantes RGB
    const r = Math.round(rgbMin.r + ratio * (rgbMax.r - rgbMin.r));
    const g = Math.round(rgbMin.g + ratio * (rgbMax.g - rgbMin.g));
    const b = Math.round(rgbMin.b + ratio * (rgbMax.b - rgbMin.b));
    
    return `rgb(${r}, ${g}, ${b})`;
  };
  
  // Fonction pour obtenir la valeur d'une cellule
  const obtenirValeur = (x: string, y: string): number | null => {
    const cellule = donnees.find(c => c.x === x && c.y === y);
    return cellule ? cellule.valeur : null;
  };
  
  return (
    <div className="bg-[var(--zalama-card)] rounded-xl shadow-sm p-5 border border-[var(--zalama-border)] h-full">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-semibold text-[var(--zalama-text)] flex items-center">
            <Grid className="h-5 w-5 mr-2 text-[var(--zalama-blue)]" />
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
        <div className="mt-6 overflow-x-auto">
          <div className="flex">
            {/* Espace vide pour l'alignement avec les étiquettes Y */}
            <div className="w-16"></div>
            
            {/* Étiquettes X */}
            <div className="flex-1 flex">
              {etiquettesX.map((etiquette, index) => (
                <div key={`x-${index}`} className="flex-1 text-center">
                  <span className="text-xs text-[var(--zalama-text-secondary)]">{etiquette}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Grille de la heatmap */}
          <div className="mt-2">
            {etiquettesY.map((etiquetteY, indexY) => (
              <div key={`row-${indexY}`} className="flex items-center mb-1">
                {/* Étiquette Y */}
                <div className="w-16 pr-2 text-right">
                  <span className="text-xs text-[var(--zalama-text-secondary)]">{etiquetteY}</span>
                </div>
                
                {/* Cellules */}
                <div className="flex-1 flex">
                  {etiquettesX.map((etiquetteX, indexX) => {
                    const valeur = obtenirValeur(etiquetteX, etiquetteY);
                    return (
                      <div 
                        key={`cell-${indexY}-${indexX}`} 
                        className="flex-1 aspect-square relative group"
                      >
                        <div 
                          className="w-full h-full rounded-sm border border-[var(--zalama-bg)]"
                          style={{ backgroundColor: valeur !== null ? obtenirCouleur(valeur) : 'transparent' }}
                        ></div>
                        
                        {/* Tooltip */}
                        {valeur !== null && (
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="bg-[var(--zalama-bg)] text-[var(--zalama-text)] text-xs px-2 py-1 rounded shadow-md">
                              {valeur}{unite}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          
          {/* Légende */}
          <div className="mt-4 flex justify-center items-center">
            <div className="flex items-center">
              <span className="text-xs text-[var(--zalama-text-secondary)]">{minValeur}{unite}</span>
              <div className="w-24 h-2 mx-2 rounded-full" style={{
                background: `linear-gradient(to right, ${couleurMin}, ${couleurMax})`
              }}></div>
              <span className="text-xs text-[var(--zalama-text-secondary)]">{maxValeur}{unite}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CarteHeatmap;

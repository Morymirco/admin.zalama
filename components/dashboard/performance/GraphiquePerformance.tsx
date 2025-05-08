import React from 'react';
import { RefreshCw } from 'lucide-react';

interface DonneeGraphique {
  date: string;
  valeur: number;
}

interface GraphiquePerformanceProps {
  titre: string;
  description: string;
  donnees: DonneeGraphique[];
  couleur: string;
  unite: string;
  isLoading: boolean;
}

const GraphiquePerformance: React.FC<GraphiquePerformanceProps> = ({
  titre,
  description,
  donnees,
  couleur,
  unite,
  isLoading
}) => {
  // Trouver les valeurs min et max pour l'échelle
  const valeurs = donnees.map(d => d.valeur);
  const min = Math.min(...valeurs);
  const max = Math.max(...valeurs);
  
  // Calculer la hauteur relative de chaque barre
  const calculerHauteur = (valeur: number): string => {
    const plage = max - min;
    if (plage === 0) return '50%'; // Si toutes les valeurs sont égales
    const pourcentage = ((valeur - min) / plage) * 70 + 10; // Entre 10% et 80% de hauteur
    return `${pourcentage}%`;
  };
  
  return (
    <div className="bg-[var(--zalama-card)] rounded-xl shadow-sm p-5 border border-[var(--zalama-border)] h-full">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-semibold text-[var(--zalama-text)]">{titre}</h3>
          <p className="text-xs text-[var(--zalama-text-secondary)]">{description}</p>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <RefreshCw className="h-8 w-8 animate-spin text-[var(--zalama-blue)]" />
        </div>
      ) : (
        <div className="mt-6">
          <div className="flex items-end h-40 gap-1">
            {donnees.map((donnee, index) => (
              <div key={index} className="flex-1 flex flex-col items-center group">
                <div className="relative w-full">
                  <div 
                    className={`w-full rounded-t-sm ${couleur}`} 
                    style={{ height: calculerHauteur(donnee.valeur) }}
                  ></div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-[var(--zalama-bg)] text-[var(--zalama-text)] text-xs px-2 py-1 rounded shadow-md">
                      {donnee.valeur}{unite}
                    </div>
                  </div>
                </div>
                <span className="text-xs text-[var(--zalama-text-secondary)] mt-1">
                  {new Date(donnee.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </span>
              </div>
            ))}
          </div>
          
          <div className="flex justify-between mt-4">
            <div className="text-xs text-[var(--zalama-text-secondary)]">
              Min: {min}{unite}
            </div>
            <div className="text-xs text-[var(--zalama-text-secondary)]">
              Max: {max}{unite}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GraphiquePerformance;

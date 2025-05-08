import React from 'react';
import { RefreshCw, Target } from 'lucide-react';

interface Objectif {
  nom: string;
  valeurActuelle: number;
  valeurCible: number;
  unite: string;
  couleur: string;
}

interface ProgressionObjectifsProps {
  titre: string;
  description: string;
  objectifs: Objectif[];
  moisEnCours: string;
  isLoading: boolean;
}

const ProgressionObjectifs: React.FC<ProgressionObjectifsProps> = ({
  titre,
  description,
  objectifs,
  moisEnCours,
  isLoading
}) => {
  // Calculer le pourcentage de progression pour chaque objectif
  const calculerPourcentage = (objectif: Objectif): number => {
    return Math.min(Math.round((objectif.valeurActuelle / objectif.valeurCible) * 100), 100);
  };
  
  return (
    <div className="bg-[var(--zalama-card)] rounded-xl shadow-sm p-5 border border-[var(--zalama-border)] h-full">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-semibold text-[var(--zalama-text)] flex items-center">
            <Target className="h-5 w-5 mr-2 text-[var(--zalama-blue)]" />
            {titre}
          </h3>
          <p className="text-xs text-[var(--zalama-text-secondary)]">{description} - {moisEnCours}</p>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <RefreshCw className="h-8 w-8 animate-spin text-[var(--zalama-blue)]" />
        </div>
      ) : (
        <div className="space-y-6 mt-4">
          {objectifs.map((objectif, index) => {
            const pourcentage = calculerPourcentage(objectif);
            return (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-[var(--zalama-text)]">{objectif.nom}</span>
                  <div className="flex items-center">
                    <span className="text-sm text-[var(--zalama-text)]">
                      {objectif.valeurActuelle}{objectif.unite} / {objectif.valeurCible}{objectif.unite}
                    </span>
                    <span 
                      className={`ml-2 text-sm font-medium ${
                        pourcentage >= 100 
                          ? 'text-[var(--zalama-success)]' 
                          : pourcentage >= 75 
                            ? 'text-[var(--zalama-info)]' 
                            : pourcentage >= 50 
                              ? 'text-[var(--zalama-warning)]' 
                              : 'text-[var(--zalama-danger)]'
                      }`}
                    >
                      {pourcentage}%
                    </span>
                  </div>
                </div>
                
                <div className="w-full bg-[var(--zalama-bg-lighter)] rounded-full h-2.5">
                  <div 
                    className={`h-2.5 rounded-full`} 
                    style={{ 
                      width: `${pourcentage}%`,
                      backgroundColor: objectif.couleur
                    }}
                  ></div>
                </div>
                
                {/* Étapes de progression */}
                <div className="flex justify-between text-xs text-[var(--zalama-text-secondary)]">
                  <span>0%</span>
                  <span>25%</span>
                  <span>50%</span>
                  <span>75%</span>
                  <span>100%</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ProgressionObjectifs;

import React from 'react';
import { RefreshCw, BarChart2 } from 'lucide-react';

interface DonneeGraphique {
  label: string;
  valeur: number;
  couleur?: string;
}

interface GraphiqueBarresProps {
  titre: string;
  description: string;
  donnees: DonneeGraphique[];
  unite: string;
  isLoading: boolean;
}

const GraphiqueBarres: React.FC<GraphiqueBarresProps> = ({
  titre,
  description,
  donnees,
  unite,
  isLoading
}) => {
  // Trouver la valeur maximale pour l'échelle
  const maxValeur = Math.max(...donnees.map(d => d.valeur));
  
  // Couleurs par défaut si non spécifiées
  const couleursDefaut = [
    'bg-[var(--zalama-blue)]',
    'bg-[var(--zalama-success)]',
    'bg-[var(--zalama-warning)]',
    'bg-[var(--zalama-danger)]',
    'bg-[var(--zalama-info)]'
  ];
  
  return (
    <div className="bg-[var(--zalama-card)] rounded-xl shadow-sm p-5 border border-[var(--zalama-border)] h-full">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-semibold text-[var(--zalama-text)] flex items-center">
            <BarChart2 className="h-5 w-5 mr-2 text-[var(--zalama-blue)]" />
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
        <div className="mt-6 space-y-4">
          {donnees.map((donnee, index) => (
            <div key={index} className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-sm text-[var(--zalama-text)]">{donnee.label}</span>
                <span className="text-sm font-medium text-[var(--zalama-text)]">
                  {donnee.valeur}{unite}
                </span>
              </div>
              <div className="w-full bg-[var(--zalama-bg-lighter)] rounded-full h-2.5">
                <div 
                  className={`h-2.5 rounded-full ${donnee.couleur || couleursDefaut[index % couleursDefaut.length]}`} 
                  style={{ width: `${(donnee.valeur / maxValeur) * 100}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GraphiqueBarres;

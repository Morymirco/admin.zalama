import React from 'react';
import { RefreshCw, PieChart } from 'lucide-react';

interface DonneeGraphique {
  label: string;
  valeur: number;
  couleur: string;
}

interface GraphiqueCirculaireProps {
  titre: string;
  description: string;
  donnees: DonneeGraphique[];
  isLoading: boolean;
}

const GraphiqueCirculaire: React.FC<GraphiqueCirculaireProps> = ({
  titre,
  description,
  donnees,
  isLoading
}) => {
  // Calculer le total pour les pourcentages
  const total = donnees.reduce((acc, donnee) => acc + donnee.valeur, 0);
  
  // Calculer les angles pour chaque segment
  const calculerSegments = () => {
    let angleDepart = 0;
    return donnees.map((donnee) => {
      const pourcentage = (donnee.valeur / total) * 100;
      const angle = (pourcentage / 100) * 360;
      const segment = {
        label: donnee.label,
        valeur: donnee.valeur,
        pourcentage,
        angleDepart,
        angleFin: angleDepart + angle,
        couleur: donnee.couleur
      };
      angleDepart += angle;
      return segment;
    });
  };
  
  const segments = calculerSegments();
  
  // Créer le chemin SVG pour un segment
  const creerCheminSegment = (angleDepart: number, angleFin: number, rayon: number) => {
    const x1 = 50 + rayon * Math.cos((angleDepart - 90) * Math.PI / 180);
    const y1 = 50 + rayon * Math.sin((angleDepart - 90) * Math.PI / 180);
    const x2 = 50 + rayon * Math.cos((angleFin - 90) * Math.PI / 180);
    const y2 = 50 + rayon * Math.sin((angleFin - 90) * Math.PI / 180);
    
    const grandArc = angleFin - angleDepart > 180 ? 1 : 0;
    
    return `M 50 50 L ${x1} ${y1} A ${rayon} ${rayon} 0 ${grandArc} 1 ${x2} ${y2} Z`;
  };
  
  return (
    <div className="bg-[var(--zalama-card)] rounded-xl shadow-sm p-5 border border-[var(--zalama-border)] h-full">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-semibold text-[var(--zalama-text)] flex items-center">
            <PieChart className="h-5 w-5 mr-2 text-[var(--zalama-blue)]" />
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
        <div className="flex flex-col md:flex-row items-center justify-between mt-4">
          <div className="relative w-40 h-40">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              {segments.map((segment, index) => (
                <path
                  key={index}
                  d={creerCheminSegment(segment.angleDepart, segment.angleFin, 40)}
                  fill={segment.couleur}
                  stroke="var(--zalama-card)"
                  strokeWidth="1"
                  className="hover:opacity-90 transition-opacity cursor-pointer"
                />
              ))}
              <circle cx="50" cy="50" r="20" fill="var(--zalama-card)" />
            </svg>
          </div>
          
          <div className="mt-4 md:mt-0 md:ml-6 space-y-2">
            {segments.map((segment, index) => (
              <div key={index} className="flex items-center">
                <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: segment.couleur }}></div>
                <span className="text-sm text-[var(--zalama-text)]">{segment.label}</span>
                <span className="text-sm font-medium text-[var(--zalama-text)] ml-2">
                  {segment.valeur} ({segment.pourcentage.toFixed(1)}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GraphiqueCirculaire;

import React from 'react';
import { RefreshCw, Users } from 'lucide-react';
import Image from 'next/image';

interface MembreEquipe {
  nom: string;
  avatar: string;
  poste: string;
  metriques: {
    tempsReponse: number;
    satisfactionClient: number;
    tauxResolution: number;
  };
}

interface MetriqueEquipe {
  nom: string;
  valeur: number;
  unite: string;
  icone: React.ReactNode;
  couleur: string;
  objectif: number;
}

interface PerformanceEquipeProps {
  titre: string;
  description: string;
  membres: MembreEquipe[];
  metriquesGlobales: MetriqueEquipe[];
  isLoading: boolean;
}

const PerformanceEquipe: React.FC<PerformanceEquipeProps> = ({
  titre,
  description,
  membres,
  metriquesGlobales,
  isLoading
}) => {
  // Calculer la note globale pour un membre (moyenne des trois métriques)
  const calculerNoteGlobale = (membre: MembreEquipe): number => {
    // Normaliser chaque métrique sur 100
    const noteTempsReponse = Math.max(0, 100 - (membre.metriques.tempsReponse / 60) * 100); // 0 min = 100%, 60 min = 0%
    const noteSatisfaction = membre.metriques.satisfactionClient; // Déjà sur 100
    const noteResolution = membre.metriques.tauxResolution; // Déjà sur 100
    
    // Moyenne des trois notes
    return Math.round((noteTempsReponse + noteSatisfaction + noteResolution) / 3);
  };
  
  // Déterminer la couleur en fonction de la note
  const determinerCouleur = (note: number): string => {
    if (note >= 90) return 'text-[var(--zalama-success)]';
    if (note >= 75) return 'text-[var(--zalama-info)]';
    if (note >= 60) return 'text-[var(--zalama-warning)]';
    return 'text-[var(--zalama-danger)]';
  };
  
  return (
    <div className="bg-[var(--zalama-card)] rounded-xl shadow-sm p-5 border border-[var(--zalama-border)] h-full">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-semibold text-[var(--zalama-text)] flex items-center">
            <Users className="h-5 w-5 mr-2 text-[var(--zalama-blue)]" />
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
        <div>
          {/* Métriques globales de l'équipe */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {metriquesGlobales.map((metrique, index) => {
              const pourcentage = Math.min(Math.round((metrique.valeur / metrique.objectif) * 100), 100);
              return (
                <div key={index} className="bg-[var(--zalama-bg-lighter)] rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <div className={`p-2 rounded-full ${metrique.couleur}`}>
                      {metrique.icone}
                    </div>
                    <h4 className="ml-2 text-sm font-medium text-[var(--zalama-text)]">{metrique.nom}</h4>
                  </div>
                  <div className="flex justify-between items-end">
                    <span className="text-2xl font-bold text-[var(--zalama-text)]">
                      {metrique.valeur}{metrique.unite}
                    </span>
                    <span className="text-xs text-[var(--zalama-text-secondary)]">
                      Objectif: {metrique.objectif}{metrique.unite}
                    </span>
                  </div>
                  <div className="w-full bg-[var(--zalama-bg)] rounded-full h-1.5 mt-2">
                    <div 
                      className={`h-1.5 rounded-full ${metrique.couleur}`} 
                      style={{ width: `${pourcentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Performance individuelle des membres */}
          <h4 className="text-sm font-medium text-[var(--zalama-text)] mb-3">Performance individuelle</h4>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--zalama-border)]">
                  <th className="px-4 py-3 text-left text-xs font-medium text-[var(--zalama-text-secondary)] uppercase tracking-wider">Membre</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-[var(--zalama-text-secondary)] uppercase tracking-wider">Temps de réponse</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-[var(--zalama-text-secondary)] uppercase tracking-wider">Satisfaction client</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-[var(--zalama-text-secondary)] uppercase tracking-wider">Taux de résolution</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-[var(--zalama-text-secondary)] uppercase tracking-wider">Note globale</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--zalama-border)]">
                {membres.map((membre, index) => {
                  const noteGlobale = calculerNoteGlobale(membre);
                  const couleurNote = determinerCouleur(noteGlobale);
                  
                  return (
                    <tr key={index} className="hover:bg-[var(--zalama-bg-lighter)]">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-8 w-8 flex-shrink-0">
                            <Image
                              className="h-8 w-8 rounded-full object-cover" 
                              src={membre.avatar} 
                              alt={membre.nom}
                              width={50}
                              height={50}
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/images/avatar-placeholder.svg';
                              }}
                            />
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-[var(--zalama-text)]">{membre.nom}</div>
                            <div className="text-xs text-[var(--zalama-text-secondary)]">{membre.poste}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-center">
                        <div className="flex flex-col items-center">
                          <span className="text-[var(--zalama-text)]">{membre.metriques.tempsReponse} min</span>
                          <div className="w-16 bg-[var(--zalama-bg)] rounded-full h-1 mt-1">
                            <div 
                              className="bg-[var(--zalama-info)] h-1 rounded-full" 
                              style={{ width: `${Math.max(0, 100 - (membre.metriques.tempsReponse / 60) * 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-center">
                        <div className="flex flex-col items-center">
                          <span className="text-[var(--zalama-text)]">{membre.metriques.satisfactionClient}%</span>
                          <div className="w-16 bg-[var(--zalama-bg)] rounded-full h-1 mt-1">
                            <div 
                              className="bg-[var(--zalama-success)] h-1 rounded-full" 
                              style={{ width: `${membre.metriques.satisfactionClient}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-center">
                        <div className="flex flex-col items-center">
                          <span className="text-[var(--zalama-text)]">{membre.metriques.tauxResolution}%</span>
                          <div className="w-16 bg-[var(--zalama-bg)] rounded-full h-1 mt-1">
                            <div 
                              className="bg-[var(--zalama-warning)] h-1 rounded-full" 
                              style={{ width: `${membre.metriques.tauxResolution}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-center">
                        <div className={`text-lg font-bold ${couleurNote}`}>
                          {noteGlobale}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default PerformanceEquipe;

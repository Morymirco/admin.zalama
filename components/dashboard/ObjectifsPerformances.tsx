'use client';

import React, { useState, useEffect } from 'react';
import { Target, Award, Clock } from 'lucide-react';
import { useFirebaseCollection } from '@/hooks/useFirebaseCollection';
import objectifsService, { 
  getObjectifsMensuels, 
  getTauxCroissanceMensuel, 
  getPerformancesEquipe, 
  getSatisfactionGlobale,
  ObjectifProgression,
  TauxCroissance,
  PerformanceEquipe,
  SatisfactionGlobale
} from '@/services/objectifsService';

export default function ObjectifsPerformances() {
  // États pour stocker les données
  const [objectifs, setObjectifs] = useState<ObjectifProgression[]>([]);
  const [tauxCroissance, setTauxCroissance] = useState<TauxCroissance | null>(null);
  const [performances, setPerformances] = useState<PerformanceEquipe[]>([]);
  const [satisfaction, setSatisfaction] = useState<SatisfactionGlobale | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Charger les données
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [objectifsData, tauxData, performancesData, satisfactionData] = await Promise.all([
          getObjectifsMensuels(),
          getTauxCroissanceMensuel(),
          getPerformancesEquipe(),
          getSatisfactionGlobale()
        ]);
        
        setObjectifs(objectifsData);
        setTauxCroissance(tauxData);
        setPerformances(performancesData);
        setSatisfaction(satisfactionData);
        setError(null);
      } catch (err) {
        console.error('Erreur lors du chargement des objectifs et performances:', err);
        setError('Erreur lors du chargement des données');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Afficher un spinner pendant le chargement
  if (loading) {
    return (
      <div className="w-full">
        <h2 className="text-xl font-semibold mb-6 text-[var(--zalama-blue)]">Objectifs & Performances</h2>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--zalama-primary)]"></div>
        </div>
      </div>
    );
  }

  // Afficher un message d'erreur si nécessaire
  if (error) {
    return (
      <div className="w-full">
        <h2 className="text-xl font-semibold mb-6 text-[var(--zalama-blue)]">Objectifs & Performances</h2>
        <div className="p-4 text-center bg-red-50 dark:bg-red-900/20 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <h2 className="text-xl font-semibold mb-6 text-[var(--zalama-blue)]">Objectifs & Performances</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">
        <div className="flex flex-col space-y-6 w-full">
          <div className="flex items-start space-y-6">
            <div className="p-2 rounded-full bg-[var(--zalama-blue-accent)]/10 mr-4">
              <Target size={24} className="text-[var(--zalama-blue)]" />
            </div>
            <div>
              <div className="text-sm font-medium mb-1 text-[var(--zalama-text)]">Progression des objectifs mensuels</div>
              <div className="mt-3 space-y-3">
                {objectifs.map((objectif, index) => (
                  <div key={index} className="w-[320px]">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-[var(--zalama-text)]">{objectif.nom}</span>
                      <span className="text-[var(--zalama-text)]">{objectif.pourcentage}%</span>
                    </div>
                    <div className="h-2.5 bg-[var(--zalama-bg-darker)] rounded-full overflow-hidden w-full">
                      <div 
                        className="h-full bg-[var(--zalama-blue)] rounded-full" 
                        style={{ width: `${objectif.pourcentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="p-2 rounded-full bg-[var(--zalama-blue-accent)]/10 mr-4">
              <Award size={24} className="text-[var(--zalama-blue)]" />
            </div>
            <div>
              <div className="text-sm font-medium mb-1 text-[var(--zalama-text)]">Taux de croissance mensuel</div>
              <div className="flex items-end mt-2">
                <div className="text-2xl font-bold text-[var(--zalama-text)]">
                  {tauxCroissance && tauxCroissance.valeur > 0 ? '+' : ''}{tauxCroissance?.valeur}%
                </div>
                <div className={`text-xs ml-2 mb-1 ${tauxCroissance && tauxCroissance.variation > 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {tauxCroissance && tauxCroissance.variation > 0 ? '+' : ''}{tauxCroissance?.variation}% vs mois précédent
                </div>
              </div>
              <div className="text-xs text-[var(--zalama-text-secondary)] mt-1">
                Progression constante depuis {tauxCroissance?.periode}
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col space-y-6">
          <div className="flex items-start">
            <div className="p-2 rounded-full bg-[var(--zalama-blue-accent)]/10 mr-4">
              <Clock size={24} className="text-[var(--zalama-blue)]" />
            </div>
            <div>
              <div className="text-sm font-medium mb-1 text-[var(--zalama-text)]">Performance des équipes</div>
              <div className="mt-3 space-y-3">
                {performances.map((performance, index) => (
                  <div key={index} className="w-[320px]">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-[var(--zalama-text)]">{performance.nom}</span>
                      <span className="text-[var(--zalama-text)]">{performance.pourcentage}%</span>
                    </div>
                    <div className="h-2.5 bg-[var(--zalama-bg-darker)] rounded-full overflow-hidden w-full">
                      <div 
                        className={`h-full ${index === 0 ? 'bg-[var(--zalama-blue)]' : 'bg-[var(--zalama-green)]'} rounded-full`}
                        style={{ width: `${performance.pourcentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="p-2 rounded-full bg-[var(--zalama-blue-accent)]/10 mr-4">
              <Award size={24} className="text-[var(--zalama-blue)]" />
            </div>
            <div>
              <div className="text-sm font-medium mb-1 text-[var(--zalama-text)] dark:text-[var(--zalama-text-secondary)]">Satisfaction globale</div>
              <div className="flex items-center mt-2">
                <div className="relative w-20 h-20">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-bold">{satisfaction?.pourcentage}%</span>
                  </div>
                  <div 
                    className="w-20 h-20 rounded-full" 
                    style={{ background: `conic-gradient(var(--zalama-green) ${satisfaction?.pourcentage || 0}%, var(--zalama-bg-darker) 0)` }}
                  ></div>
                </div>
                <div className="ml-4 text-xs text-[var(--zalama-text)] dark:text-[var(--zalama-text-secondary)]">
                  <div>Basé sur les retours clients</div>
                  <div className="mt-1 text-green-500">
                    {satisfaction && satisfaction.variation > 0 ? '+' : ''}{satisfaction?.variation}% vs {satisfaction?.periode}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

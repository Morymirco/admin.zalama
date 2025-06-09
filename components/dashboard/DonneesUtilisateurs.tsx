'use client';

import React, { useState, useEffect } from 'react';
import { Star, MapPin } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import dynamic from 'next/dynamic';
import { useFirebaseCollection } from '@/hooks/useFirebaseCollection';
import userService from '@/services/userService';
import { Utilisateur } from '@/types/utilisateur';
import demographieService, { getUtilisateursParAge, getUtilisateursParRegion, getUtilisateursParType, getNoteMoyenne } from '@/services/demographieService';

// Chargement dynamique du composant de carte pour éviter les problèmes de rendu côté serveur
const GuineaMap = dynamic(() => import('./GuineaMap'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full w-full bg-[var(--zalama-bg-light)] rounded-lg">
      <div className="text-sm text-[var(--zalama-text-secondary)]">Chargement de la carte...</div>
    </div>
  )
});

export default function DonneesUtilisateurs() {
  // Utiliser notre hook pour récupérer les utilisateurs
  const { data: utilisateurs, loading: loadingUtilisateurs } = useFirebaseCollection<Utilisateur>(userService);
  
  // États pour les statistiques démographiques
  const [ageStats, setAgeStats] = useState<{
    tranches: Record<string, number>;
    pourcentages: Record<string, number>;
  }>({ tranches: {}, pourcentages: {} });
  
  const [regionStats, setRegionStats] = useState<{
    regions: Record<string, number>;
    pourcentages: Record<string, number>;
  }>({ regions: {}, pourcentages: {} });
  
  const [typeStats, setTypeStats] = useState<{
    types: Record<string, number>;
    pourcentages: Record<string, number>;
  }>({ types: {}, pourcentages: {} });
  
  const [noteMoyenne, setNoteMoyenne] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Couleurs personnalisées pour le graphique
  const COLORS = ['#4f46e5', '#60a5fa', '#34d399', '#f97316', '#ec4899'];
  
  // Données pour le graphique circulaire des types d'utilisateurs
  const [typeUtilisateursData, setTypeUtilisateursData] = useState<Array<{ name: string; value: number; color: string }>>([]);

  // Charger les données démographiques à partir des utilisateurs
  useEffect(() => {
    const loadDemographicData = async () => {
      try {
        // Si les utilisateurs sont chargés depuis le hook, nous pouvons les utiliser directement
        if (!loadingUtilisateurs && utilisateurs.length > 0) {
          // Calculer les statistiques à partir des utilisateurs
          const [ageData, regionData, typeData, noteData] = await Promise.all([
            getUtilisateursParAge(),
            getUtilisateursParRegion(),
            getUtilisateursParType(),
            getNoteMoyenne()
          ]);
          
          setAgeStats(ageData);
          setRegionStats(regionData);
          setTypeStats(typeData);
          setNoteMoyenne(noteData);
          
          // Préparer les données pour le graphique circulaire
          const typesData = Object.entries(typeData.types).map(([type, count], index) => ({
            name: type.charAt(0).toUpperCase() + type.slice(1),
            value: count,
            color: COLORS[index % COLORS.length]
          }));
          
          setTypeUtilisateursData(typesData);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données démographiques:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadDemographicData();
  }, [utilisateurs, loadingUtilisateurs]);

  // Afficher un spinner pendant le chargement
  if (loading) {
    return (
      <div>
        <h2 className="text-xl font-semibold mb-4 text-[var(--zalama-blue)]">Données utilisateurs</h2>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--zalama-primary)]"></div>
        </div>
      </div>
    );
  }

  return (
    <div>
        <h2 className="text-xl font-semibold mb-4 text-[var(--zalama-blue)]">Données utilisateurs</h2>
        <div className="flex flex-col space-y-4">
          <div>
            <h3 className="text-sm font-medium mb-2 text-[var(--zalama-text)]">Répartition par âge</h3>
            <div className="space-y-2">
              {Object.entries(ageStats.pourcentages).map(([tranche, pourcentage]) => (
                <div key={tranche}>
                  <div className="flex justify-between mb-1">
                    <span className="text-xs text-[var(--zalama-text)]">{tranche} ans</span>
                    <span className="text-xs text-[var(--zalama-text-secondary)]">{Math.round(pourcentage)}%</span>
                  </div>
                  <div className="w-full bg-[var(--zalama-bg-light)] h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-[var(--zalama-blue)] h-full" 
                      style={{ width: `${pourcentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium mb-2 text-[var(--zalama-text)]">Localisation géographique</h3>
            <div className="relative h-64 w-full bg-[var(--zalama-bg-light)] rounded-lg overflow-hidden">
              {/* Carte interactive de la Guinée Conakry */}
              <GuineaMap />
              
              {/* Légende de la carte avec données dynamiques */}
              <div className="absolute bottom-2 right-2 bg-white bg-opacity-80 p-2 rounded-md text-xs z-[1000]">
                <div className="font-semibold mb-1">Répartition par région</div>
                {Object.entries(regionStats.pourcentages)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 3)
                  .map(([region, pourcentage], index) => (
                    <div key={region} className="flex items-center gap-1">
                      <div 
                        className="w-2 h-2 rounded-full" 
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      ></div>
                      <div>{region}: {Math.round(pourcentage)}%</div>
                    </div>
                  ))
                }
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 mt-2">
            <div className="text-2xl font-bold text-[var(--zalama-text)]">{noteMoyenne.toFixed(1)}</div>
            <div className="text-sm text-[var(--zalama-text-secondary)]">stars</div>
            <div className="flex ml-1">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={`w-3 h-3 ${i < Math.round(noteMoyenne) ? 'text-[var(--zalama-blue)]' : 'text-gray-300'}`} 
                  fill={i < Math.round(noteMoyenne) ? 'currentColor' : 'none'}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
  );
}

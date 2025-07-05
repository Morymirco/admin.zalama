'use client';

import React, { useState, useEffect } from 'react';
import { Star, MapPin } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import dynamic from 'next/dynamic';
import { useSupabaseCollection } from '@/hooks/useSupabaseCollection';
import employeeService from '@/services/employeeService';
import { partnerService } from '@/services/partnerService';

// Chargement dynamique du composant de carte pour éviter les problèmes de rendu côté serveur
const GuineaMap = dynamic(() => import('./GuineaMap'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full w-full bg-[var(--zalama-bg-light)] rounded-lg">
      <div className="text-sm text-[var(--zalama-text-secondary)]">Chargement de la carte...</div>
    </div>
  )
});

export default function DonneesEmployes() {
  // Utiliser notre hook pour récupérer les employés
  const { data: employees, loading: loadingEmployees } = useSupabaseCollection(employeeService);
  const { data: partners, loading: loadingPartners } = useSupabaseCollection(partnerService);
  
  // États pour les statistiques démographiques
  const [genreStats, setGenreStats] = useState<{
    genres: Record<string, number>;
    pourcentages: Record<string, number>;
  }>({ genres: {}, pourcentages: {} });
  
  const [contratStats, setContratStats] = useState<{
    contrats: Record<string, number>;
    pourcentages: Record<string, number>;
  }>({ contrats: {}, pourcentages: {} });
  
  const [salaireMoyen, setSalaireMoyen] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Couleurs personnalisées pour le graphique
  const COLORS = ['#4f46e5', '#60a5fa', '#34d399', '#f97316', '#ec4899'];
  
  // Données pour le graphique circulaire des genres d'employés
  const [genreEmployeesData, setGenreEmployeesData] = useState<Array<{ name: string; value: number; color: string }>>([]);

  // Charger les données démographiques à partir des employés
  useEffect(() => {
    const loadDemographicData = async () => {
      try {
        // Si les employés sont chargés depuis le hook, nous pouvons les utiliser directement
        if (!loadingEmployees && employees.length > 0) {
          // Calculer les statistiques à partir des employés
          const totalEmployees = employees.length;
          
          // Statistiques par genre
          const genres = employees.reduce((acc, emp) => {
            acc[emp.genre] = (acc[emp.genre] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);
          
          const genrePourcentages = Object.keys(genres).reduce((acc, genre) => {
            acc[genre] = (genres[genre] / totalEmployees) * 100;
            return acc;
          }, {} as Record<string, number>);
          
          // Statistiques par type de contrat
          const contrats = employees.reduce((acc, emp) => {
            acc[emp.type_contrat] = (acc[emp.type_contrat] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);
          
          const contratPourcentages = Object.keys(contrats).reduce((acc, contrat) => {
            acc[contrat] = (contrats[contrat] / totalEmployees) * 100;
            return acc;
          }, {} as Record<string, number>);
          
          // Salaire moyen
          const salaires = employees
            .filter(emp => emp.salaire_net && emp.salaire_net > 0)
            .map(emp => emp.salaire_net!);
          
          const salaireMoyen = salaires.length > 0 
            ? salaires.reduce((sum, salaire) => sum + salaire, 0) / salaires.length 
            : 0;
          
          setGenreStats({ genres, pourcentages: genrePourcentages });
          setContratStats({ contrats, pourcentages: contratPourcentages });
          setSalaireMoyen(salaireMoyen);
          
          // Préparer les données pour le graphique circulaire
          const genresData = Object.entries(genres).map(([genre, count], index) => ({
            name: genre.charAt(0).toUpperCase() + genre.slice(1),
            value: count,
            color: COLORS[index % COLORS.length]
          }));
          
          setGenreEmployeesData(genresData);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données démographiques:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadDemographicData();
  }, [employees, loadingEmployees]);

  // Afficher un spinner pendant le chargement
  if (loading) {
    return (
      <div>
        <h2 className="text-xl font-semibold mb-4 text-[var(--zalama-blue)]">Données employés</h2>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--zalama-primary)]"></div>
        </div>
      </div>
    );
  }

  return (
    <div>
        <h2 className="text-xl font-semibold mb-4 text-[var(--zalama-blue)]">Données employés</h2>
        <div className="flex flex-col space-y-4">
          <div>
            <h3 className="text-sm font-medium mb-2 text-[var(--zalama-text)]">Répartition par genre</h3>
            <div className="space-y-2">
              {Object.entries(genreStats.pourcentages).map(([genre, pourcentage]) => (
                <div key={genre}>
                  <div className="flex justify-between mb-1">
                    <span className="text-xs text-[var(--zalama-text)]">{genre}</span>
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
            <h3 className="text-sm font-medium mb-2 text-[var(--zalama-text)]">Répartition par type de contrat</h3>
            <div className="space-y-2">
              {Object.entries(contratStats.pourcentages).map(([contrat, pourcentage]) => (
                <div key={contrat}>
                  <div className="flex justify-between mb-1">
                    <span className="text-xs text-[var(--zalama-text)]">{contrat}</span>
                    <span className="text-xs text-[var(--zalama-text-secondary)]">{Math.round(pourcentage)}%</span>
                  </div>
                  <div className="w-full bg-[var(--zalama-bg-light)] h-2 rounded-full overflow-hidden">
                      <div 
                      className="bg-[var(--zalama-green)] h-full" 
                      style={{ width: `${pourcentage}%` }}
                      ></div>
                    </div>
              </div>
              ))}
            </div>
          </div>
          
          <div className="flex items-center gap-2 mt-2">
            <div className="text-2xl font-bold text-[var(--zalama-text)]">{salaireMoyen.toLocaleString('fr-FR', { style: 'currency', currency: 'GNF' })}</div>
            <div className="text-sm text-[var(--zalama-text-secondary)]">salaire moyen</div>
            </div>
          
          <div className="flex items-center gap-2">
            <div className="text-2xl font-bold text-[var(--zalama-text)]">{employees.length}</div>
            <div className="text-sm text-[var(--zalama-text-secondary)]">employés total</div>
          </div>
        </div>
      </div>
  );
}

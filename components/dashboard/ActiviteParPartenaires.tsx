'use client';

import React, { useMemo } from 'react';
import { useSupabaseCollection } from '@/hooks/useSupabaseCollection';
import { partenaireService } from '@/services/partenaireService';
import { Partenaire } from '@/types/partenaire';

// Interfaces déplacées vers types/partenaire.ts

export default function ActiviteParPartenaires() {
  // Utiliser notre hook pour récupérer tous les partenaires
  const { data: partenaires, loading, error } = useSupabaseCollection<Partenaire>(partenaireService);

  // Calculer les statistiques à partir des données des partenaires
  const stats = useMemo(() => {
    if (loading || !partenaires.length) {
      return {
        totalPartenaires: 0,
        totalEmployes: 0,
        nouveauxPartenaires: 0,
        employesParEntreprise: [] as Array<{
          nom: string;
          count: number;
          pourcentage: number;
        }>
      };
    }

    // Date du début du mois courant
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Compter les nouveaux partenaires du mois
    const nouveauxPartenaires = partenaires.filter(p => {
      if (!p.created_at) return false;
      const dateCreation = new Date(p.created_at);
      return dateCreation >= firstDayOfMonth;
    }).length;

    // Calculer le nombre total d'employés et préparer les données du graphique
    const employesParEntreprise = partenaires
      .filter(p => p.nombre_employes && p.nombre_employes > 0) // Ne garder que les partenaires avec des employés
      .sort((a, b) => (b.nombre_employes || 0) - (a.nombre_employes || 0)) // Trier par nombre d'employés décroissant
      .slice(0, 5) // Prendre les 5 premiers
      .map(p => ({
        nom: p.nom,
        count: p.nombre_employes || 0,
        pourcentage: 0 // Sera calculé après
      }));
      
    // Calculer le total des employés pour tous les partenaires
    const totalEmployes = partenaires.reduce((sum, p) => sum + (p.nombre_employes || 0), 0);
    
    // Calculer le pourcentage de chaque entreprise par rapport au total des entreprises affichées
    const totalEmployesAffiches = employesParEntreprise.reduce((sum, p) => sum + p.count, 0);
    
    // Mettre à jour les pourcentages
    employesParEntreprise.forEach(p => {
      p.pourcentage = totalEmployesAffiches > 0 
        ? Math.round((p.count / totalEmployesAffiches) * 100) 
        : 0;
    });
    
    // Ajuster le dernier pourcentage pour que la somme fasse exactement 100%
    if (employesParEntreprise.length > 0) {
      const sum = employesParEntreprise.reduce((s, p) => s + p.pourcentage, 0);
      if (sum !== 100) {
        employesParEntreprise[employesParEntreprise.length - 1].pourcentage += 100 - sum;
      }
    }

    return {
      totalPartenaires: partenaires.length,
      totalEmployes,
      nouveauxPartenaires,
      employesParEntreprise
    };
  }, [partenaires, loading]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--zalama-primary)]"></div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4 text-[var(--zalama-blue)]">Activité des partenaires</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="flex flex-col p-6 bg-white dark:bg-[var(--zalama-bg-light)] rounded-lg border border-gray-200 dark:border-[#2c5282] shadow-sm dark:shadow-md">
          <div className="text-3xl font-bold text-gray-900 dark:text-white">
            {stats.totalPartenaires.toLocaleString()}
          </div>
          <div className="text-sm text-gray-600 dark:text-blue-200">Total partenaires</div>
        </div>
        
        <div className="flex flex-col p-6 bg-white dark:bg-[var(--zalama-bg-light)] rounded-lg border border-gray-200 dark:border-[#2c5282] shadow-sm dark:shadow-md">
          <div className="text-3xl font-bold text-gray-900 dark:text-white">
            {stats.totalEmployes.toLocaleString()}
          </div>
          <div className="text-sm text-gray-600 dark:text-blue-200">Total Employés</div>
        </div>

        <div className="flex flex-col p-6 bg-white dark:bg-[var(--zalama-bg-light)] rounded-lg border border-gray-200 dark:border-[#2c5282] shadow-sm dark:shadow-md">
          <div className="text-3xl font-bold text-gray-900 dark:text-white">
            +{stats.nouveauxPartenaires}
          </div>
          <div className="text-sm text-gray-600 dark:text-blue-200">Nouveaux Partenaires</div>
        </div>
      </div>
      
      <div className="mt-8">
        <h3 className="text-sm font-medium mb-4 text-[var(--zalama-text)]">Employés par entreprise</h3>
        <div className="space-y-5">
          {stats.employesParEntreprise.length > 0 ? (
            stats.employesParEntreprise
              .sort((a, b) => b.pourcentage - a.pourcentage) // Trier par pourcentage décroissant
              .map((entreprise, index) => {
                // Calculer la largeur de la barre en fonction du pourcentage le plus élevé
                const maxPercentage = Math.max(...stats.employesParEntreprise.map(e => e.pourcentage));
                const widthPercentage = maxPercentage > 0 
                  ? (entreprise.pourcentage / maxPercentage) * 100 
                  : 0;
                  
                return (
                  <div key={index} className="group">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-[var(--zalama-text)] truncate pr-2">
                        {entreprise.nom}
                      </span>
                      <span className="text-sm font-medium text-[var(--zalama-text-secondary)] whitespace-nowrap">
                        {entreprise.count} <span className="opacity-75">({entreprise.pourcentage}%)</span>
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                      <div 
                        className="bg-blue-500 h-full rounded-full transition-all duration-700 ease-out"
                        style={{
                          width: `${entreprise.pourcentage}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                );
              })
          ) : (
            <div className="p-4 text-center bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-sm text-[var(--zalama-text-secondary)]">
                Aucune donnée d'entreprise disponible
              </p>
            </div>
          )}
        </div>
        
        <style jsx global>{`
          @keyframes gradient {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
        `}</style>
      </div>
    </div>
  );
}

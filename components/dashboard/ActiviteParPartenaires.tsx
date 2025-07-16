'use client';

import { useSupabaseCollection } from '@/hooks/useSupabaseCollection';
import { partnerService } from '@/services/partnerService';
import { Partner } from '@/types/employee';
import { createClient } from '@supabase/supabase-js';
import { useEffect, useMemo, useState } from 'react';

// Configuration Supabase - Utiliser les mêmes clés que les autres services qui fonctionnent
const supabaseUrl = 'https://mspmrzlqhwpdkkburjiw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zcG1yemxxaHdwZGtrYnVyaml3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3ODcyNTgsImV4cCI6MjA2NjM2MzI1OH0.zr-TRpKjGJjW0nRtsyPcCLy4Us-c5tOGX71k5_3JJd0';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function ActiviteParPartenaires() {
  // Utiliser notre hook pour récupérer tous les partenaires
  const { data: partenaires, loading, error } = useSupabaseCollection(partnerService);
  const [totalEmployesActifs, setTotalEmployesActifs] = useState<number>(0);
  const [loadingEmployes, setLoadingEmployes] = useState(true);
  const [employes, setEmployes] = useState<any[]>([]);

  // Charger le nombre d'employés actifs et la liste des employés
  useEffect(() => {
    async function loadEmployesActifs() {
      try {
        setLoadingEmployes(true);
        const nombre = await partnerService.getNombreEmployesActifs();
        setTotalEmployesActifs(nombre as number);
        
        // Charger aussi la liste des employés actifs pour les calculs
        const { data: employeesData } = await supabase
          .from('employees')
          .select('*')
          .eq('actif', true);
        setEmployes(employeesData || []);
      } catch (error) {
        console.error('Erreur lors du chargement des employés actifs:', error);
        setTotalEmployesActifs(0);
        setEmployes([]);
      } finally {
        setLoadingEmployes(false);
      }
    }
    
    if (!loading) {
      loadEmployesActifs();
    }
  }, [loading]);

  // Calculer les statistiques à partir des données des partenaires
  const stats = useMemo(() => {
    if (loading || !partenaires.length) {
      return {
        totalPartenaires: 0,
        totalEmployes: 0,
        totalEmployesActifs: 0,
        nouveauxPartenaires: 0,
        employesParEntreprise: [] as Array<{
          nom: string;
          employesActifs: number;
          nombreDeclare: number;
          pourcentage: number;
        }>
      };
    }

    // Date du début du mois courant
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Compter les nouveaux partenaires du mois
    const nouveauxPartenaires = (partenaires as Partner[]).filter(p => {
      if (!p.created_at) return false;
      const dateCreation = new Date(p.created_at);
      return dateCreation >= firstDayOfMonth;
    }).length;

    // Calculer les données pour les 3 dernières entreprises créées
    const last3Partenaires = (partenaires as Partner[])
      .slice(0, 3); // Prendre les 3 premiers (déjà triés par date de création décroissante)
    
    const employesParEntreprise = last3Partenaires.map(p => {
      // Compter les employés actifs pour ce partenaire
      const employesActifs = (employes as any[]).filter((e: any) => e.partner_id === p.id).length;
      const nombreDeclare = p.nombre_employes || 0;
      
      return {
        nom: p.nom,
        employesActifs,
        nombreDeclare,
        pourcentage: nombreDeclare > 0 ? Math.round((employesActifs / nombreDeclare) * 100) : 0
      };
    });
      
    // Calculer le total des employés pour tous les partenaires
    const totalEmployes = (partenaires as Partner[]).reduce((sum, p) => sum + (p.nombre_employes || 0), 0);

    return {
      totalPartenaires: partenaires.length,
      totalEmployes,
      totalEmployesActifs,
      nouveauxPartenaires,
      employesParEntreprise
    };
  }, [partenaires, loading, totalEmployesActifs, employes]);

  if (loading || loadingEmployes) {
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
            {stats.totalEmployesActifs} / {stats.totalEmployes.toLocaleString()}
          </div>
          <div className="text-sm text-gray-600 dark:text-blue-200">Employés actifs</div>
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
                        {entreprise.employesActifs} / {entreprise.nombreDeclare} <span className="opacity-75">({entreprise.pourcentage}%)</span>
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

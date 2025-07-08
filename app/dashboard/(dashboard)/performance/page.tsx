"use client";

import React, { useState, useEffect } from 'react';
import { Clock, MessageSquare, ThumbsUp } from 'lucide-react';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const ProgressionObjectifs = require('@/components/dashboard/performance/ProgressionObjectifs').default;
// eslint-disable-next-line @typescript-eslint/no-require-imports
const TauxCroissance = require('@/components/dashboard/performance/TauxCroissance').default;
// eslint-disable-next-line @typescript-eslint/no-require-imports
const PerformanceEquipe = require('@/components/dashboard/performance/PerformanceEquipe').default;

export default function PerformancePage() {
  // États
  const [isLoading, setIsLoading] = useState(true);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [derniereMiseAJour, setDerniereMiseAJour] = useState(new Date().toISOString());
  
  // Données fictives pour la démo
  useEffect(() => {
    // Simuler un chargement depuis une API
    setTimeout(() => {
      setIsLoading(false);
      setDerniereMiseAJour(new Date().toISOString());
    }, 1000);
    
    // Mise à jour périodique des données (toutes les 30 secondes)
    const intervalId = setInterval(() => {
      setDerniereMiseAJour(new Date().toISOString());
    }, 30000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  // Données pour les objectifs mensuels
  const objectifsMensuels = [
    {
      nom: 'Nouveaux utilisateurs',
      valeurActuelle: 850,
      valeurCible: 1000,
      unite: '',
      couleur: 'var(--zalama-blue)'
    },
    {
      nom: 'Chiffre d\'affaires',
      valeurActuelle: 42500,
      valeurCible: 50000,
      unite: '€',
      couleur: 'var(--zalama-success)'
    },
    {
      nom: 'Taux de conversion',
      valeurActuelle: 3.2,
      valeurCible: 4.0,
      unite: '%',
      couleur: 'var(--zalama-warning)'
    },
    {
      nom: 'Tickets résolus',
      valeurActuelle: 178,
      valeurCible: 200,
      unite: '',
      couleur: 'var(--zalama-info)'
    }
  ];
  
  // Données pour le taux de croissance mensuel
  const donneesCroissance = [
    { mois: 'Janvier', valeur: 5.2, variation: 0 },
    { mois: 'Février', valeur: 5.8, variation: 11.5 },
    { mois: 'Mars', valeur: 6.5, variation: 12.1 },
    { mois: 'Avril', valeur: 7.2, variation: 10.8 },
    { mois: 'Mai', valeur: 8.5, variation: 18.1 }
  ];
  
  // Données pour la performance de l'équipe
  const membresEquipe = [
    {
      nom: 'Mamadou Diallo',
              avatar: '/images/avatars/avatar-1.svg',
      poste: 'Service client',
      metriques: {
        tempsReponse: 12,
        satisfactionClient: 95,
        tauxResolution: 92
      }
    },
    {
      nom: 'Fatoumata Camara',
              avatar: '/images/avatars/avatar-2.svg',
      poste: 'Support technique',
      metriques: {
        tempsReponse: 18,
        satisfactionClient: 88,
        tauxResolution: 85
      }
    },
    {
      nom: 'Ibrahim Soumah',
              avatar: '/images/avatars/avatar-3.svg',
      poste: 'Service client',
      metriques: {
        tempsReponse: 15,
        satisfactionClient: 92,
        tauxResolution: 88
      }
    },
    {
      nom: 'Aissatou Barry',
              avatar: '/images/avatars/avatar-4.svg',
      poste: 'Support technique',
      metriques: {
        tempsReponse: 20,
        satisfactionClient: 85,
        tauxResolution: 90
      }
    },
    {
      nom: 'Ousmane Sylla',
              avatar: '/images/avatars/avatar-5.svg',
      poste: 'Service client',
      metriques: {
        tempsReponse: 10,
        satisfactionClient: 98,
        tauxResolution: 95
      }
    }
  ];
  
  const metriquesGlobalesEquipe = [
    {
      nom: 'Temps de réponse moyen',
      valeur: 18,
      unite: 'min',
      icone: <Clock className="h-5 w-5 text-white" />,
      couleur: 'bg-[var(--zalama-info)]/20 text-[var(--zalama-info)]',
      objectif: 15
    },
    {
      nom: 'Satisfaction client',
      valeur: 92,
      unite: '%',
      icone: <ThumbsUp className="h-5 w-5 text-white" />,
      couleur: 'bg-[var(--zalama-success)]/20 text-[var(--zalama-success)]',
      objectif: 95
    },
    {
      nom: 'Taux de résolution',
      valeur: 88,
      unite: '%',
      icone: <MessageSquare className="h-5 w-5 text-white" />,
      couleur: 'bg-[var(--zalama-warning)]/20 text-[var(--zalama-warning)]',
      objectif: 90
    }
  ];
  
  return (
    <div className="p-4 md:p-6 w-full">
      <h1 className="text-2xl font-bold mb-6 text-[var(--zalama-text)]">Objectifs & Performances</h1>
      
      {/* Progression des objectifs mensuels */}
      <div className="mb-6">
        <ProgressionObjectifs
          titre="Progression par rapport aux objectifs mensuels"
          description="Suivi de la progression vers les objectifs fixés"
          objectifs={objectifsMensuels}
          moisEnCours="Mai 2025"
          isLoading={isLoading}
        />
      </div>
      
      {/* Taux de croissance mensuel */}
      <div className="mb-6">
        <TauxCroissance
          titre="Taux de croissance mensuel"
          description="Évolution du taux de croissance sur les 5 derniers mois"
          donnees={donneesCroissance}
          unite="%"
          isLoading={isLoading}
        />
      </div>
      
      {/* Performance de l'équipe interne */}
      <div className="mb-6">
        <PerformanceEquipe
          titre="Performance de l'équipe interne"
          description="Métriques de performance de l'équipe (réactivité, service client)"
          membres={membresEquipe}
          metriquesGlobales={metriquesGlobalesEquipe}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}

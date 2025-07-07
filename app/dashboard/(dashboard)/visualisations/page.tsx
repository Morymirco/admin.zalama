"use client";

import React, { useState, useEffect } from 'react';
import {
  GraphiqueBarres,
  GraphiqueCirculaire,
  GraphiqueLigne,
  CarteHeatmap
} from '@/components/dashboard/visualisations';

export default function VisualisationsPage() {
  // États
  const [isLoading, setIsLoading] = useState(true);
  
  // Données fictives pour la démo
  useEffect(() => {
    // Simuler un chargement depuis une API
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, []);
  
  // Données pour le graphique à barres
  const donneesBarres = [
    { label: 'Janvier', valeur: 1250, couleur: 'bg-[var(--zalama-blue)]' },
    { label: 'Février', valeur: 1420, couleur: 'bg-[var(--zalama-blue)]' },
    { label: 'Mars', valeur: 1680, couleur: 'bg-[var(--zalama-blue)]' },
    { label: 'Avril', valeur: 1580, couleur: 'bg-[var(--zalama-blue)]' },
    { label: 'Mai', valeur: 1920, couleur: 'bg-[var(--zalama-blue)]' }
  ];
  
  // Données pour le graphique circulaire
  const donneesCirculaire = [
    { label: 'Étudiants', valeur: 42, couleur: '#4CAF50' },
    { label: 'Salariés', valeur: 28, couleur: '#2196F3' },
    { label: 'Entreprises', valeur: 18, couleur: '#FFC107' },
    { label: 'Autres', valeur: 12, couleur: '#9E9E9E' }
  ];
  
  // Données pour le graphique linéaire
  const donneesLigne = [
    {
      nom: 'Utilisateurs',
      couleur: '#2196F3',
      donnees: [
        { label: 'Jan', valeur: 1250 },
        { label: 'Fév', valeur: 1420 },
        { label: 'Mar', valeur: 1680 },
        { label: 'Avr', valeur: 1580 },
        { label: 'Mai', valeur: 1920 }
      ]
    },
    {
      nom: 'Visiteurs',
      couleur: '#4CAF50',
      donnees: [
        { label: 'Jan', valeur: 2450 },
        { label: 'Fév', valeur: 2320 },
        { label: 'Mar', valeur: 2780 },
        { label: 'Avr', valeur: 2980 },
        { label: 'Mai', valeur: 3120 }
      ]
    }
  ];
  
  // Données pour la carte de chaleur
  const donneesHeatmap = [
    { x: 'Lun', y: '8h', valeur: 12 },
    { x: 'Lun', y: '10h', valeur: 25 },
    { x: 'Lun', y: '12h', valeur: 37 },
    { x: 'Lun', y: '14h', valeur: 30 },
    { x: 'Lun', y: '16h', valeur: 20 },
    
    { x: 'Mar', y: '8h', valeur: 15 },
    { x: 'Mar', y: '10h', valeur: 29 },
    { x: 'Mar', y: '12h', valeur: 42 },
    { x: 'Mar', y: '14h', valeur: 35 },
    { x: 'Mar', y: '16h', valeur: 22 },
    
    { x: 'Mer', y: '8h', valeur: 18 },
    { x: 'Mer', y: '10h', valeur: 32 },
    { x: 'Mer', y: '12h', valeur: 45 },
    { x: 'Mer', y: '14h', valeur: 38 },
    { x: 'Mer', y: '16h', valeur: 25 },
    
    { x: 'Jeu', y: '8h', valeur: 20 },
    { x: 'Jeu', y: '10h', valeur: 35 },
    { x: 'Jeu', y: '12h', valeur: 48 },
    { x: 'Jeu', y: '14h', valeur: 40 },
    { x: 'Jeu', y: '16h', valeur: 28 },
    
    { x: 'Ven', y: '8h', valeur: 17 },
    { x: 'Ven', y: '10h', valeur: 30 },
    { x: 'Ven', y: '12h', valeur: 40 },
    { x: 'Ven', y: '14h', valeur: 32 },
    { x: 'Ven', y: '16h', valeur: 18 }
  ];
  
  const etiquettesX = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven'];
  const etiquettesY = ['8h', '10h', '12h', '14h', '16h'];
  
  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Graphique à barres */}
        <GraphiqueBarres
          titre="Nombre d'utilisateurs par mois"
          description="Évolution du nombre d'utilisateurs sur les 5 derniers mois"
          donnees={donneesBarres}
          unite=""
          isLoading={isLoading}
        />
        
        {/* Graphique circulaire */}
        <GraphiqueCirculaire
          titre="Répartition des utilisateurs"
          description="Répartition des utilisateurs par catégorie"
          donnees={donneesCirculaire}
          isLoading={isLoading}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Graphique linéaire */}
        <GraphiqueLigne
          titre="Tendances d'utilisation"
          description="Évolution du nombre d'utilisateurs et de visiteurs"
          series={donneesLigne}
          unite=""
          isLoading={isLoading}
        />
        
        {/* Carte de chaleur */}
        <CarteHeatmap
          titre="Activité par heure et jour"
          description="Nombre de connexions par heure et jour de la semaine"
          donnees={donneesHeatmap}
          etiquettesX={etiquettesX}
          etiquettesY={etiquettesY}
          couleurMin="#e3f2fd"
          couleurMax="#1565c0"
          unite=""
          isLoading={isLoading}
        />
      </div>
      
      <div className="bg-[var(--zalama-card)] rounded-xl shadow-sm p-5 border border-[var(--zalama-border)] mb-6">
        <h2 className="text-lg font-semibold mb-4 text-[var(--zalama-text)]">Personnalisation des visualisations</h2>
        <p className="text-[var(--zalama-text)]">
          Cette page présente différents types de visualisations de données. Vous pouvez personnaliser ces graphiques en fonction de vos besoins spécifiques.
        </p>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[var(--zalama-bg-lighter)] p-4 rounded-lg">
            <h3 className="text-md font-medium mb-2 text-[var(--zalama-text)]">Fonctionnalités disponibles :</h3>
            <ul className="list-disc pl-5 text-[var(--zalama-text)]">
              <li>Graphiques à barres pour les comparaisons</li>
              <li>Graphiques circulaires pour les proportions</li>
              <li>Graphiques linéaires pour les tendances</li>
              <li>Cartes de chaleur pour les données bidimensionnelles</li>
            </ul>
          </div>
          <div className="bg-[var(--zalama-bg-lighter)] p-4 rounded-lg">
            <h3 className="text-md font-medium mb-2 text-[var(--zalama-text)]">Prochainement :</h3>
            <ul className="list-disc pl-5 text-[var(--zalama-text)]">
              <li>Export des données en CSV et Excel</li>
              <li>Graphiques interactifs avec zoom</li>
              <li>Tableaux de bord personnalisables</li>
              <li>Intégration avec des sources de données externes</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

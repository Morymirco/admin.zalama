import React from 'react';
import { Star, MapPin } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import dynamic from 'next/dynamic';

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
  // Données pour le graphique circulaire des types d'utilisateurs
  const typeUtilisateursData = [
    { name: 'Employés', value: 45, color: '#4f46e5' },
    { name: 'Pensionnaires', value: 30, color: '#60a5fa' },
    { name: 'Étudiants', value: 25, color: '#34d399' },
  ];

  // Couleurs personnalisées pour le graphique
  const COLORS = ['#4f46e5', '#60a5fa', '#34d399'];

  return (
    <div>
        <h2 className="text-xl font-semibold mb-4 text-[var(--zalama-blue)]">Données utilisateurs</h2>
        <div className="flex flex-col space-y-4">
          <div>
            <h3 className="text-sm font-medium mb-2 text-[var(--zalama-text)]">Répartition par âge, sexe, région</h3>
            <div className="space-y-2">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-xs text-[var(--zalama-text)]">18-25 ans</span>
                </div>
                <div className="w-full bg-[var(--zalama-bg-light)] h-2 rounded-full overflow-hidden">
                  <div className="bg-[var(--zalama-blue)] h-full" style={{ width: '75%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-xs text-[var(--zalama-text)]">26-40 ans</span>
                </div>
                <div className="w-full bg-[var(--zalama-bg-light)] h-2 rounded-full overflow-hidden">
                  <div className="bg-[var(--zalama-blue)] h-full" style={{ width: '90%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-xs text-[var(--zalama-text)]">(en idhnk balanæ et</span>
                </div>
                <div className="w-full bg-[var(--zalama-bg-light)] h-2 rounded-full overflow-hidden">
                  <div className="bg-[var(--zalama-blue)] h-full" style={{ width: '50%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-xs text-[var(--zalama-text)]">pensionnes)</span>
                </div>
                <div className="w-full bg-[var(--zalama-bg-light)] h-2 rounded-full overflow-hidden">
                  <div className="bg-[var(--zalama-blue)] h-full" style={{ width: '30%' }}></div>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium mb-2 text-[var(--zalama-text)]">Localisation géographique</h3>
            <div className="relative h-64 w-full bg-[var(--zalama-bg-light)] rounded-lg overflow-hidden">
              {/* Carte interactive de la Guinée Conakry */}
              <GuineaMap />
              
              {/* Légende de la carte */}
              <div className="absolute bottom-2 right-2 bg-white bg-opacity-80 p-2 rounded-md text-xs z-[1000]">
                <div className="font-semibold mb-1">Répartition par région</div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-[var(--zalama-blue)]"></div>
                  <div>Conakry: 45%</div>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-[var(--zalama-success)]"></div>
                  <div>Autres régions: 55%</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 mt-2">
            <div className="text-2xl font-bold text-[var(--zalama-text)]">4,7</div>
            <div className="text-sm text-[var(--zalama-text-secondary)]">stars</div>
            <div className="flex ml-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3 h-3 text-[var(--zalama-blue)]" />
              ))}
            </div>
          </div>
        </div>
      </div>
  );
}

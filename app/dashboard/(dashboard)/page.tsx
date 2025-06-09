"use client";
import React from 'react';
import StatistiquesGenerales from '@/components/dashboard/StatistiquesGenerales';
import PerformanceFinanciere from '@/components/dashboard/PerformanceFinanciere';
import ActiviteParPartenaires from '@/components/dashboard/ActiviteParPartenaires';
import ActiviteParService from '@/components/dashboard/ActiviteParService';
import DonneesUtilisateurs from '@/components/dashboard/DonneesUtilisateurs';
import AlertesRisques from '@/components/dashboard/AlertesRisques';
import GraphiquesVisualisations from '@/components/dashboard/GraphiquesVisualisations';
import ObjectifsPerformances from '@/components/dashboard/ObjectifsPerformances';


export default function DashboardPage() {
  return (
    <div className="p-4 md:p-6">
      
      <div className="grid grid-cols-1 md:grid-cols-2 lm:grid-cols-3 gap-6">
        {/* Première rangée - Cartes principales */}
        <div className="bg-[var(--zalama-card)] rounded-xl shadow-sm p-5 border border-[var(--zalama-border)]">
          <StatistiquesGenerales />
        </div>
        
        <div className="bg-[var(--zalama-card)] rounded-xl shadow-sm p-5 border border-[var(--zalama-border)]">
          <PerformanceFinanciere />
        </div>
        
        {/* Deuxième rangée */}
        <div className="bg-[var(--zalama-card)] rounded-xl shadow-sm p-5 border border-[var(--zalama-border)]">
          <ActiviteParPartenaires />
        </div>
        
        <div className="bg-[var(--zalama-card)] rounded-xl shadow-sm p-5 border border-[var(--zalama-border)]">
          <ActiviteParService />
        </div>
        
        {/* Troisième rangée */}
        <div className="lg:col-span-2 bg-[var(--zalama-card)] rounded-xl shadow-sm p-5 border border-[var(--zalama-border)]">
          <DonneesUtilisateurs />
        </div>
        
        <div className="bg-[var(--zalama-card)] rounded-xl shadow-sm p-5 border border-[var(--zalama-border)]">
          <AlertesRisques />
        </div>
        
        {/* Quatrième rangée */}
        <div className="bg-[var(--zalama-card)] rounded-xl shadow-sm p-5 border border-[var(--zalama-border)]">
          <GraphiquesVisualisations />
        </div>
        
        <div className="lg:col-span-2 bg-[var(--zalama-card)] rounded-xl shadow-sm p-5 border border-[var(--zalama-border)]">
          <ObjectifsPerformances />
        </div>
        

      </div>
    </div>
  );
}

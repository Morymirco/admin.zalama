"use client";
import React, { Suspense, lazy } from 'react';

// Composants critiques - chargement immédiat
import StatistiquesGenerales from '@/components/dashboard/StatistiquesGenerales';

// Composants lourds - chargement différé
const PerformanceFinanciere = lazy(() => import('@/components/dashboard/PerformanceFinanciere'));
const ActiviteParPartenaires = lazy(() => import('@/components/dashboard/ActiviteParPartenaires'));
const ActiviteParService = lazy(() => import('@/components/dashboard/ActiviteParService'));
const DonneesEmployes = lazy(() => import('@/components/dashboard/DonneesUtilisateurs'));
const AlertesRisques = lazy(() => import('@/components/dashboard/AlertesRisques'));
const GraphiquesVisualisations = lazy(() => import('@/components/dashboard/GraphiquesVisualisations'));
/* const ObjectifsPerformances = lazy(() => import('@/components/dashboard/ObjectifsPerformances')); */

// Composant Skeleton pour le chargement
const DashboardSkeleton = ({ className = "" }: { className?: string }) => (
  <div className={`bg-[var(--zalama-card)] rounded-xl shadow-sm p-5 border border-[var(--zalama-border)] ${className}`}>
    <div className="animate-pulse">
      <div className="h-6 bg-[var(--zalama-bg-lighter)] rounded mb-4 w-3/4"></div>
      <div className="space-y-3">
        <div className="h-4 bg-[var(--zalama-bg-lighter)] rounded w-full"></div>
        <div className="h-4 bg-[var(--zalama-bg-lighter)] rounded w-5/6"></div>
        <div className="h-4 bg-[var(--zalama-bg-lighter)] rounded w-4/6"></div>
      </div>
      <div className="mt-4 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--zalama-blue)]"></div>
      </div>
    </div>
  </div>
);

export default function DashboardPage() {
  return (
    <div className="p-4 md:p-6 w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 lm:grid-cols-3 gap-6">
        {/* Première rangée - Composants critiques (chargement immédiat) */}
        <div className="bg-[var(--zalama-card)] rounded-xl shadow-sm p-5 border border-[var(--zalama-border)]">
          <StatistiquesGenerales />
        </div>
        
        <Suspense fallback={<DashboardSkeleton />}>
          <div className="bg-[var(--zalama-card)] rounded-xl shadow-sm p-5 border border-[var(--zalama-border)]">
            <PerformanceFinanciere />
          </div>
        </Suspense>
        
        {/* Deuxième rangée - Composants lourds avec Suspense */}
        <Suspense fallback={<DashboardSkeleton />}>
          <div className="bg-[var(--zalama-card)] rounded-xl shadow-sm p-5 border border-[var(--zalama-border)]">
            <ActiviteParPartenaires />
          </div>
        </Suspense>
        
        <Suspense fallback={<DashboardSkeleton />}>
          <div className="bg-[var(--zalama-card)] rounded-xl shadow-sm p-5 border border-[var(--zalama-border)]">
            <ActiviteParService />
          </div>
        </Suspense>
        
        {/* Troisième rangée - Composants très lourds */}
        <Suspense fallback={<DashboardSkeleton className="lg:col-span-2" />}>
          <div className="lg:col-span-2 bg-[var(--zalama-card)] rounded-xl shadow-sm p-5 border border-[var(--zalama-border)]">
            <DonneesEmployes />
          </div>
        </Suspense>
        
        <Suspense fallback={<DashboardSkeleton />}>
          <div className="bg-[var(--zalama-card)] rounded-xl shadow-sm p-5 border border-[var(--zalama-border)]">
            <AlertesRisques />
          </div>
        </Suspense>
        
        {/* Quatrième rangée - Composants graphiques lourds */}
        <Suspense fallback={<DashboardSkeleton />}>
          <div className="bg-[var(--zalama-card)] rounded-xl shadow-sm p-5 border border-[var(--zalama-border)]">
            <GraphiquesVisualisations />
          </div>
        </Suspense>
        
       {/*  <Suspense fallback={<DashboardSkeleton className="lg:col-span-2" />}>
          <div className="lg:col-span-2 bg-[var(--zalama-card)] rounded-xl shadow-sm p-5 border border-[var(--zalama-border)]">
            <ObjectifsPerformances />
          </div>
        </Suspense> */}
      </div>
    </div>
  );
}

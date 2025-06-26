"use client";

import React from 'react';
import MigrationTest from '@/components/MigrationTest';

export default function MigrationTestPage() {
  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--zalama-text)] mb-2">
          Test de Migration vers Supabase
        </h1>
        <p className="text-[var(--zalama-text-secondary)]">
          Cette page permet de tester la migration progressive de Firebase vers Supabase.
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MigrationTest />
        
        <div className="p-6 bg-[var(--zalama-card)] rounded-xl border border-[var(--zalama-border)]">
          <h2 className="text-xl font-semibold mb-4 text-[var(--zalama-text)]">
            Plan de Migration
          </h2>
          
          <div className="space-y-4">
            <div className="p-3 bg-[var(--zalama-bg-light)] rounded-lg">
              <h3 className="font-medium text-[var(--zalama-text)] mb-2">Phase 1: Configuration ✅</h3>
              <ul className="text-sm text-[var(--zalama-text-secondary)] space-y-1">
                <li>• Installation des packages Supabase</li>
                <li>• Configuration de la connexion</li>
                <li>• Création des services de base</li>
                <li>• Hook d'authentification</li>
              </ul>
            </div>
            
            <div className="p-3 bg-[var(--zalama-bg-light)] rounded-lg">
              <h3 className="font-medium text-[var(--zalama-text)] mb-2">Phase 2: Authentification 🔄</h3>
              <ul className="text-sm text-[var(--zalama-text-secondary)] space-y-1">
                <li>• Migration de l'auth Firebase vers Supabase</li>
                <li>• Test de connexion/déconnexion</li>
                <li>• Gestion des sessions</li>
                <li>• Protection des routes</li>
              </ul>
            </div>
            
            <div className="p-3 bg-[var(--zalama-bg-light)] rounded-lg">
              <h3 className="font-medium text-[var(--zalama-text)] mb-2">Phase 3: Base de Données 🔄</h3>
              <ul className="text-sm text-[var(--zalama-text-secondary)] space-y-1">
                <li>• Création des tables Supabase</li>
                <li>• Migration des données</li>
                <li>• Test des services CRUD</li>
                <li>• Optimisation des requêtes</li>
              </ul>
            </div>
            
            <div className="p-3 bg-[var(--zalama-bg-light)] rounded-lg">
              <h3 className="font-medium text-[var(--zalama-text)] mb-2">Phase 4: Storage 🔄</h3>
              <ul className="text-sm text-[var(--zalama-text-secondary)] space-y-1">
                <li>• Migration Firebase Storage vers Supabase Storage</li>
                <li>• Upload de fichiers</li>
                <li>• Gestion des permissions</li>
                <li>• URLs publiques</li>
              </ul>
            </div>
            
            <div className="p-3 bg-[var(--zalama-bg-light)] rounded-lg">
              <h3 className="font-medium text-[var(--zalama-text)] mb-2">Phase 5: Finalisation 🔄</h3>
              <ul className="text-sm text-[var(--zalama-text-secondary)] space-y-1">
                <li>• Tests complets</li>
                <li>• Nettoyage du code Firebase</li>
                <li>• Documentation</li>
                <li>• Déploiement</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
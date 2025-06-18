"use client";

import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useFirebaseCollection } from '@/hooks/useFirebaseCollection';
import userService from '@/services/userService';
import { Utilisateur } from '@/types/utilisateur';
import { format } from 'date-fns/format';
import { fr } from 'date-fns/locale/fr';

export default function StatistiquesUtilisateurs() {
  // Utiliser notre hook pour récupérer les utilisateurs
  const { data: utilisateurs, loading, error } = useFirebaseCollection<Utilisateur>(userService);
  // Calcul des statistiques avec useMemo pour optimiser les performances
  const {
    totalUtilisateurs,
    utilisateursActifs,
    utilisateursInactifs,
    statutData,
    roleData,
    evolutionData
  } = useMemo(() => {
    if (!utilisateurs || utilisateurs.length === 0) {
      return {
        totalUtilisateurs: 0,
        utilisateursActifs: 0,
        utilisateursInactifs: 0,
        statutData: [],
        roleData: [],
        evolutionData: []
      };
    }
    
    // Calcul des statistiques de base
    const total = utilisateurs.length;
    const actifs = utilisateurs.filter(user => user.active).length;
    const inactifs = utilisateurs.filter(user => !user.active).length;
    
    // Données pour le graphique en camembert (statut)
    const statut = [
      { name: 'Actifs', value: actifs },
      { name: 'Inactifs', value: inactifs },
    ];
    
    // Données pour le graphique en barres (rôles)
    const roleCount: Record<string, number> = {};
    utilisateurs.forEach(user => {
      if (user.role) {
        roleCount[user.role] = (roleCount[user.role] || 0) + 1;
      }
    });
    
    const roles = Object.keys(roleCount).map(role => ({
      name: role,
      value: roleCount[role]
    }));
    
    // Données pour le graphique d'évolution (inscriptions par mois)
    const monthsData: Record<string, number> = {};
    utilisateurs.forEach(user => {
      if (user.createdAt) {
        // Convertir le Timestamp Firebase en Date
        const date = user.createdAt.toDate ? user.createdAt.toDate() : new Date(user.createdAt);
        const month = format(date, 'yyyy-MM');
        monthsData[month] = (monthsData[month] || 0) + 1;
      }
    });
    
    // Trier les mois chronologiquement
    const sortedMonths = Object.keys(monthsData).sort();
    const evolution = sortedMonths.map(month => {
      // Convertir YYYY-MM en format plus lisible (Jan 2025, Fév 2025, etc.)
      const date = new Date(month + '-01');
      const monthName = format(date, 'MMM', { locale: fr });
      const year = date.getFullYear();
      
      return {
        name: `${monthName} ${year}`,
        value: monthsData[month]
      };
    });
    
    return {
      totalUtilisateurs: total,
      utilisateursActifs: actifs,
      utilisateursInactifs: inactifs,
      statutData: statut,
      roleData: roles,
      evolutionData: evolution
    };
  }, [utilisateurs]);
  
  // Couleurs pour les graphiques
  const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'];
  
  // Afficher un spinner pendant le chargement
  if (loading) {
    return (
      <div className="bg-[var(--zalama-card)] rounded-xl shadow-sm p-5 border border-[var(--zalama-border)] mb-6">
        <h2 className="text-xl font-semibold mb-4 text-[var(--zalama-text)]">Statistiques des utilisateurs</h2>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--zalama-primary)]"></div>
        </div>
      </div>
    );
  }
  
  // Afficher un message d'erreur si nécessaire
  if (error) {
    return (
      <div className="bg-[var(--zalama-card)] rounded-xl shadow-sm p-5 border border-[var(--zalama-border)] mb-6">
        <h2 className="text-xl font-semibold mb-4 text-[var(--zalama-text)]">Statistiques des utilisateurs</h2>
        <div className="p-4 text-center bg-red-50 dark:bg-red-900/20 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">Erreur lors du chargement des données utilisateurs</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-[var(--zalama-card)] rounded-xl shadow-sm p-5 border border-[var(--zalama-border)] mb-6">
      <h2 className="text-xl font-semibold mb-4 text-[var(--zalama-text)]">Statistiques des utilisateurs</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-[var(--zalama-bg-lighter)] rounded-lg p-4 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-[var(--zalama-blue)]">{totalUtilisateurs}</span>
          <span className="text-sm text-[var(--zalama-text-secondary)]">Total utilisateurs</span>
        </div>
        
        <div className="bg-[var(--zalama-bg-lighter)] rounded-lg p-4 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-[var(--zalama-success)]">{utilisateursActifs}</span>
          <span className="text-sm text-[var(--zalama-text-secondary)]">Utilisateurs actifs</span>
        </div>
        
        <div className="bg-[var(--zalama-bg-lighter)] rounded-lg p-4 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-[var(--zalama-danger)]">{utilisateursInactifs}</span>
          <span className="text-sm text-[var(--zalama-text-secondary)]">Utilisateurs inactifs</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Graphique en camembert - Statut */}
        <div>
          <h3 className="text-sm font-medium mb-2 text-[var(--zalama-text)]">Répartition par statut</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statutData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statutData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [`${value} utilisateurs`, 'Nombre']}
                  contentStyle={{ backgroundColor: 'var(--zalama-bg-darker)', borderColor: 'var(--zalama-border)', color: 'var(--zalama-text)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Graphique en barres - Rôles */}
        <div>
          <h3 className="text-sm font-medium mb-2 text-[var(--zalama-text)]">Répartition par rôle</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={roleData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="name" stroke="var(--zalama-text-secondary)" fontSize={12} />
                <YAxis stroke="var(--zalama-text-secondary)" fontSize={12} />
                <Tooltip 
                  formatter={(value) => [`${value} utilisateurs`, 'Nombre']}
                  contentStyle={{ backgroundColor: 'var(--zalama-bg-darker)', borderColor: 'var(--zalama-border)', color: 'var(--zalama-text)' }}
                />
                <Bar dataKey="value" fill="var(--zalama-blue)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Graphique d'évolution - Inscriptions par mois */}
        <div className="lg:col-span-3">
          <h3 className="text-sm font-medium mb-2 text-[var(--zalama-text)]">Évolution des inscriptions</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={evolutionData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="name" stroke="var(--zalama-text-secondary)" fontSize={12} />
                <YAxis stroke="var(--zalama-text-secondary)" fontSize={12} />
                <Tooltip 
                  formatter={(value) => [`${value} inscriptions`, 'Nombre']}
                  contentStyle={{ backgroundColor: 'var(--zalama-bg-darker)', borderColor: 'var(--zalama-border)', color: 'var(--zalama-text)' }}
                />
                <Bar dataKey="value" fill="var(--zalama-green)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

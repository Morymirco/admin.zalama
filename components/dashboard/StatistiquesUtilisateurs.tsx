"use client";

import React from 'react';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface StatistiquesProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  utilisateurs: any[];
}

export default function StatistiquesUtilisateurs({ utilisateurs }: StatistiquesProps) {
  // Calcul des statistiques
  const totalUtilisateurs = utilisateurs.length;
  const utilisateursActifs = utilisateurs.filter(user => user.statut === 'actif').length;
  const utilisateursInactifs = utilisateurs.filter(user => user.statut === 'inactif').length;
  
  // Données pour le graphique en camembert (statut)
  const statutData = [
    { name: 'Actifs', value: utilisateursActifs },
    { name: 'Inactifs', value: utilisateursInactifs },
  ];
  
  // Données pour le graphique en barres (rôles)
  const roleCount: Record<string, number> = {};
  utilisateurs.forEach(user => {
    roleCount[user.role] = (roleCount[user.role] || 0) + 1;
  });
  
  const roleData = Object.keys(roleCount).map(role => ({
    name: role,
    value: roleCount[role]
  }));
  
  // Données pour le graphique d'évolution (inscriptions par mois)
  const monthsData: Record<string, number> = {};
  utilisateurs.forEach(user => {
    const month = user.dateCreation.substring(0, 7); // Format YYYY-MM
    monthsData[month] = (monthsData[month] || 0) + 1;
  });
  
  // Trier les mois chronologiquement
  const sortedMonths = Object.keys(monthsData).sort();
  const evolutionData = sortedMonths.map(month => {
    // Convertir YYYY-MM en format plus lisible (Jan 2025, Fév 2025, etc.)
    const date = new Date(month + '-01');
    const monthName = date.toLocaleDateString('fr-FR', { month: 'short' });
    const year = date.getFullYear();
    
    return {
      name: `${monthName} ${year}`,
      value: monthsData[month]
    };
  });
  
  // Couleurs pour les graphiques
  const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'];
  
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

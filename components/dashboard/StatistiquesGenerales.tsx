'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { where, orderBy, Timestamp } from 'firebase/firestore';
import { useFirebaseCollection } from '@/hooks/useFirebaseCollection';
import userService from '@/services/userService';
import { Utilisateur } from '@/types/utilisateur';

interface UserStats {
  totalUsers: number;
  activeUsers: number;
  newUsersThisMonth: number;
  userTypeData: Array<{ name: string; value: number; count: number }>;
}

export default function StatistiquesGenerales() {
  // Utiliser notre hook pour récupérer tous les utilisateurs
  const { data: users, loading, error } = useFirebaseCollection<Utilisateur>(userService);

  // Calculer les statistiques à partir des données utilisateurs
  const stats = useMemo(() => {
    if (loading || !users.length) {
      return {
        totalUsers: 0,
        activeUsers: 0,
        newUsersThisMonth: 0,
        userTypeData: [
          { name: 'Étudiants', value: 0, count: 0 },
          { name: 'Salariés', value: 0, count: 0 },
          { name: 'Pensionnés', value: 0, count: 0 },
        ]
      };
    }

    // Date du début du mois courant
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Calculer le nombre d'utilisateurs actifs
    const activeUsers = users.filter(user => user.active).length;
    
    // Calculer le nombre de nouveaux utilisateurs ce mois-ci
    const newUsersThisMonth = users.filter(user => {
      if (!user.createdAt) return false;
      const createdAt = user.createdAt instanceof Timestamp 
        ? user.createdAt.toDate() 
        : new Date(user.createdAt);
      return createdAt >= firstDayOfMonth;
    }).length;
    
    // Compter les utilisateurs par type
    const typeCounts = users.reduce((acc, user) => {
      if (user.type) {
        acc[user.type] = (acc[user.type] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);
    
    // Calculer les totaux
    const totalWithTypes = (typeCounts.etudiant || 0) + (typeCounts.salaries || 0) + (typeCounts.pension || 0);
    
    // Calculer les pourcentages
    const calculatePercentage = (count: number) => (count / (totalWithTypes || 1)) * 100;
    
    // Créer un tableau des types avec leurs comptes et pourcentages
    const types = [
      { key: 'etudiant', name: 'Étudiants', count: typeCounts.etudiant || 0 },
      { key: 'salaries', name: 'Salariés', count: typeCounts.salaries || 0 },
      { key: 'pension', name: 'Pensionnés', count: typeCounts.pension || 0 }
    ];
    
    // Trier par ordre décroissant de compte
    types.sort((a, b) => b.count - a.count);
    
    // Calculer les pourcentages entiers
    let remainingPercentage = 100;
    const userTypeData = types.map((type, index) => {
      // Pour le dernier élément, on prend tout le reste
      if (index === types.length - 1) {
        return {
          ...type,
          value: remainingPercentage
        };
      }
      
      // Calculer le pourcentage arrondi
      const exactPercentage = calculatePercentage(type.count);
      const roundedPercentage = Math.round(exactPercentage);
      remainingPercentage -= roundedPercentage;
      
      return {
        ...type,
        value: roundedPercentage
      };
    });
    
    return {
      totalUsers: users.length,
      activeUsers,
      newUsersThisMonth,
      userTypeData
    };
  }, [users, loading]);

  // Données pour le graphique circulaire des types d'utilisateurs
  const { userTypeData } = stats;
  console.log('Rendu avec userTypeData:', userTypeData);
  
  // Couleurs personnalisées pour le graphique
  const COLORS = ['#3b82f6', '#10b981', '#6366f1', '#f59e0b', '#ef4444', '#8b5cf6'];

  // Fonction pour formater les labels du graphique
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }: any) => {
    if (percent < 0.05) return null; // Ne pas afficher les pourcentages trop petits
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.7;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor="middle" 
        dominantBaseline="central"
        fontWeight="bold"
        style={{
          fontSize: '12px',
          textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
        }}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };



  // Vérifier si on a des données à afficher
  const hasData = userTypeData.some((item: any) => item.count > 0);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4 text-[var(--zalama-blue)]">Statistiques générales</h2>
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex flex-col space-y-4 md:space-y-6 md:w-1/2">
          <div className="flex flex-col">
            <div className="text-2xl md:text-3xl font-bold text-[var(--zalama-text)]">
              {loading ? '...' : stats.totalUsers.toLocaleString()}
            </div>
            <div className="text-xs md:text-sm text-[var(--zalama-text-secondary)]">Utilisateurs inscrits</div>
          </div>
          <div className="flex flex-col">
            <div className="text-2xl md:text-3xl font-bold text-[var(--zalama-text)]">
              {loading ? '...' : stats.activeUsers.toLocaleString()}
            </div>
            <div className="text-xs md:text-sm text-[var(--zalama-text-secondary)]">Utilisateurs actifs</div>
          </div>
          <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
            <div className="flex flex-col">
              <div className="text-2xl md:text-3xl font-bold text-[var(--zalama-text)]">
                {loading ? '...' : stats.newUsersThisMonth.toLocaleString()}
              </div>
              <div className="text-xs md:text-sm text-[var(--zalama-text-secondary)]">Nouveaux inscrits ce mois-ci</div>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-center mt-6 md:mt-0 md:w-1/2">
          <div className="h-64 w-full flex items-center justify-center">
            {hasData ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={userTypeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomizedLabel}
                    outerRadius={80}
                    innerRadius={40}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {userTypeData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={COLORS[index % COLORS.length]} 
                        stroke="#ffffff"
                        strokeWidth={1}
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value, name, props) => {
                      const count = props.payload.count;
                      return [`${value}% (${count} utilisateur${count > 1 ? 's' : ''})`, name];
                    }}
                    labelFormatter={(name) => `Type: ${name}`}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-500">Aucune donnée à afficher</p>
                <p className="text-sm text-gray-400">Ajoutez des utilisateurs avec leur type</p>
              </div>
            )}
          </div>
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            {userTypeData.map((entry, index) => (
              <div 
                key={`legend-${index}`} 
                className="flex items-center px-3 py-1 rounded-md bg-[var(--zalama-bg-light)]"
              >
                <div 
                  className="w-3 h-3 rounded-full mr-2" 
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                ></div>
                <span className="text-sm font-medium text-[var(--zalama-text)]">{entry.name} ({entry.value}%)</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

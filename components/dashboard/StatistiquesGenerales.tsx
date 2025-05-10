import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

export default function StatistiquesGenerales() {
  // Données pour le graphique circulaire des types d'utilisateurs
  const userTypeData = [
    { name: 'Étudiants', value: 45 },
    { name: 'Salariés', value: 40 },
    { name: 'Pensionnés', value: 15 },
  ];

  // Couleurs personnalisées pour le graphique
  const COLORS = ['#3b82f6', '#10b981', '#6366f1'];

  // Fonction pour formater les labels du graphique
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }: {
    cx: number;
    cy: number;
    midAngle: number;
    innerRadius: number;
    outerRadius: number;
    percent: number;
    index: number;
    name: string;
  }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
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
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4 text-[var(--zalama-blue)]">Statistiques générales</h2>
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex flex-col space-y-4 md:space-y-6 md:w-1/2">
          <div className="flex flex-col">
            <div className="text-2xl md:text-3xl font-bold text-[var(--zalama-text)]">25,840</div>
            <div className="text-xs md:text-sm text-[var(--zalama-text-secondary)]">Utilisateurs inscrits</div>
          </div>
          <div className="flex flex-col">
            <div className="text-2xl md:text-3xl font-bold text-[var(--zalama-text)]">5,200</div>
            <div className="text-xs md:text-sm text-[var(--zalama-text-secondary)]">Utilisateurs actifs</div>
          </div>
          <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
            <div className="flex flex-col">
              <div className="text-2xl md:text-3xl font-bold text-[var(--zalama-text)]">870</div>
              <div className="text-xs md:text-sm text-[var(--zalama-text-secondary)]">Nouveaux inscrits ce mois-ci</div>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-center mt-6 md:mt-0 md:w-1/2">
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={userTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {userTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} utilisateurs`, 'Nombre']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
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

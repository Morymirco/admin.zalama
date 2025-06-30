'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useSupabaseCollection } from '@/hooks/useSupabaseCollection';
import { employeeService } from '@/services/employeeService';
import { partnerService } from '@/services/partnerService';
import { serviceService } from '@/services/serviceService';
import { transactionService } from '@/services/transactionService';

interface EmployeeStats {
  totalEmployees: number;
  activeEmployees: number;
  newEmployeesThisMonth: number;
  employeeTypeData: Array<{ name: string; value: number; count: number }>;
}

interface DashboardStats {
  employees: EmployeeStats;
  partners: {
    total: number;
    actifs: number;
    totalEmployes: number;
  };
  services: {
    total: number;
    disponibles: number;
  };
  transactions: {
    total: number;
    montantTotal: number;
    transactionsCeMois: number;
    montantCeMois: number;
  };
}

export default function StatistiquesGenerales() {
  // Utiliser nos hooks pour récupérer les données
  const { data: employees, loading: loadingEmployees } = useSupabaseCollection(employeeService);
  const { data: partners, loading: loadingPartners } = useSupabaseCollection(partnerService);
  const { data: services, loading: loadingServices } = useSupabaseCollection(serviceService);
  const { data: transactions, loading: loadingTransactions } = useSupabaseCollection(transactionService);

  // Calculer les statistiques à partir des données
  const stats = useMemo(() => {
    const loading = loadingEmployees || loadingPartners || loadingServices || loadingTransactions;
    
    if (loading || !employees.length) {
      return {
        employees: {
          totalEmployees: 0,
          activeEmployees: 0,
          newEmployeesThisMonth: 0,
          employeeTypeData: [
            { name: 'CDI', value: 0, count: 0 },
            { name: 'CDD', value: 0, count: 0 },
            { name: 'Stagiaire', value: 0, count: 0 },
          ]
        },
        partners: {
          total: 0,
          actifs: 0,
          totalEmployes: 0
        },
        services: {
          total: 0,
          disponibles: 0
        },
        transactions: {
          total: 0,
          montantTotal: 0,
          transactionsCeMois: 0,
          montantCeMois: 0
        }
      };
    }

    // Date du début du mois courant
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Statistiques des employés
    const activeEmployees = employees.filter(emp => emp.actif).length;
    
    const newEmployeesThisMonth = employees.filter(emp => {
      if (!emp.created_at) return false;
      const createdAt = new Date(emp.created_at);
      return createdAt >= firstDayOfMonth;
    }).length;
    
    // Compter les employés par type de contrat
    const contractCounts = employees.reduce((acc, emp) => {
      if (emp.type_contrat) {
        acc[emp.type_contrat] = (acc[emp.type_contrat] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);
    
    // Calculer les totaux
    const totalWithContracts = (contractCounts.CDI || 0) + (contractCounts.CDD || 0) + (contractCounts.Stagiaire || 0);
    
    // Calculer les pourcentages
    const calculatePercentage = (count: number) => (count / (totalWithContracts || 1)) * 100;
    
    // Créer un tableau des types avec leurs comptes et pourcentages
    const contractTypes = [
      { key: 'CDI', name: 'CDI', count: contractCounts.CDI || 0 },
      { key: 'CDD', name: 'CDD', count: contractCounts.CDD || 0 },
      { key: 'Stagiaire', name: 'Stagiaire', count: contractCounts.Stagiaire || 0 }
    ];
    
    // Trier par ordre décroissant de compte
    contractTypes.sort((a, b) => b.count - a.count);
    
    // Calculer les pourcentages entiers
    let remainingPercentage = 100;
    const employeeTypeData = contractTypes.map((type, index) => {
      // Pour le dernier élément, on prend tout le reste
      if (index === contractTypes.length - 1) {
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

    // Statistiques des partenaires
    const activePartners = partners.filter(partner => partner.actif).length;
    const totalEmployesFromPartners = partners.reduce((sum, partner) => sum + (partner.nombre_employes || 0), 0);

    // Statistiques des services
    const availableServices = services.filter(service => service.disponible).length;

    // Statistiques des transactions
    const montantTotal = transactions.reduce((sum, transaction) => sum + (transaction.montant || 0), 0);
    
    const transactionsCeMois = transactions.filter(transaction => {
      if (!transaction.date_transaction) return false;
      const transactionDate = new Date(transaction.date_transaction);
      return transactionDate >= firstDayOfMonth;
    });
    
    const montantCeMois = transactionsCeMois.reduce((sum, transaction) => sum + (transaction.montant || 0), 0);
    
    return {
      employees: {
        totalEmployees: employees.length,
        activeEmployees,
        newEmployeesThisMonth,
        employeeTypeData
      },
      partners: {
        total: partners.length,
        actifs: activePartners,
        totalEmployes: totalEmployesFromPartners
      },
      services: {
        total: services.length,
        disponibles: availableServices
      },
      transactions: {
        total: transactions.length,
        montantTotal,
        transactionsCeMois: transactionsCeMois.length,
        montantCeMois
      }
    };
  }, [employees, partners, services, transactions, loadingEmployees, loadingPartners, loadingServices, loadingTransactions]);

  // Données pour le graphique circulaire des types d'employés
  const { employeeTypeData } = stats.employees;
  
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
  const hasData = employeeTypeData.some((item: any) => item.count > 0);
  const loading = loadingEmployees || loadingPartners || loadingServices || loadingTransactions;

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4 text-[var(--zalama-blue)]">Statistiques générales</h2>
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex flex-col space-y-4 md:space-y-6 md:w-1/2">
          <div className="flex flex-col">
            <div className="text-2xl md:text-3xl font-bold text-[var(--zalama-text)]">
              {loading ? '...' : stats.employees.totalEmployees.toLocaleString()}
            </div>
            <div className="text-xs md:text-sm text-[var(--zalama-text-secondary)]">Employés inscrits</div>
          </div>
          <div className="flex flex-col">
            <div className="text-2xl md:text-3xl font-bold text-[var(--zalama-text)]">
              {loading ? '...' : stats.employees.activeEmployees.toLocaleString()}
            </div>
            <div className="text-xs md:text-sm text-[var(--zalama-text-secondary)]">Employés actifs</div>
          </div>
          <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
            <div className="flex flex-col">
              <div className="text-2xl md:text-3xl font-bold text-[var(--zalama-text)]">
                {loading ? '...' : stats.employees.newEmployeesThisMonth.toLocaleString()}
              </div>
              <div className="text-xs md:text-sm text-[var(--zalama-text-secondary)]">Nouveaux employés ce mois-ci</div>
            </div>
            <div className="flex flex-col">
              <div className="text-2xl md:text-3xl font-bold text-[var(--zalama-text)]">
                {loading ? '...' : stats.partners.total.toLocaleString()}
              </div>
              <div className="text-xs md:text-sm text-[var(--zalama-text-secondary)]">Partenaires</div>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-center mt-6 md:mt-0 md:w-1/2">
          <div className="h-64 w-full flex items-center justify-center">
            {hasData ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={employeeTypeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomizedLabel}
                    outerRadius={80}
                    innerRadius={40}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {employeeTypeData.map((entry, index) => (
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
                      return [`${value}% (${count} employé${count > 1 ? 's' : ''})`, name];
                    }}
                    labelFormatter={(name) => `Type de contrat: ${name}`}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-[var(--zalama-text-secondary)]">
                <div className="text-sm">Aucune donnée disponible</div>
                <div className="text-xs">Les types de contrats apparaîtront ici</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

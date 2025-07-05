'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useSupabaseCollection } from '@/hooks/useSupabaseCollection';
import employeeService from '@/services/employeeService';
import { partnerService } from '@/services/partnerService';
import serviceService from '@/services/serviceService';
import { transactionService } from '@/services/transactionService';
import { Employee, Partner, Service, FinancialTransaction } from '@/types/employee';

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
  const [isInitialized, setIsInitialized] = useState(false);

  // Utiliser nos hooks pour récupérer les données avec priorisation
  const { data: employees, loading: loadingEmployees } = useSupabaseCollection<Employee>(employeeService);
  const { data: partners, loading: loadingPartners } = useSupabaseCollection<Partner>(partnerService);
  const { data: services, loading: loadingServices } = useSupabaseCollection<Service>(serviceService);
  const { data: transactions, loading: loadingTransactions } = useSupabaseCollection<FinancialTransaction>(transactionService);

  // Initialisation progressive
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialized(true);
    }, 100); // Délai minimal pour éviter le flash

    return () => clearTimeout(timer);
  }, []);

  // Calculer les statistiques à partir des données avec optimisation
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
    
    // Statistiques des employés (optimisé)
    const activeEmployees = employees.filter((emp: Employee) => emp.actif).length;
    
    const newEmployeesThisMonth = employees.filter((emp: Employee) => {
      if (!emp.created_at) return false;
      const createdAt = new Date(emp.created_at);
      return createdAt >= firstDayOfMonth;
    }).length;
    
    // Compter les employés par type de contrat (optimisé)
    const contractCounts = employees.reduce((acc: Record<string, number>, emp: Employee) => {
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

    // Statistiques des partenaires (optimisé)
    const activePartners = partners.filter((partner: Partner) => partner.actif).length;
    const totalEmployesFromPartners = partners.reduce((sum: number, partner: Partner) => sum + (partner.nombre_employes || 0), 0);

    // Statistiques des services (optimisé)
    const availableServices = services.filter((service: Service) => service.disponible).length;

    // Statistiques des transactions (optimisé)
    const montantTotal = transactions.reduce((sum: number, transaction: FinancialTransaction) => sum + (transaction.montant || 0), 0);
    
    const transactionsCeMois = transactions.filter((transaction: FinancialTransaction) => {
      if (!transaction.date_transaction) return false;
      const transactionDate = new Date(transaction.date_transaction);
      return transactionDate >= firstDayOfMonth;
    });
    
    const montantCeMois = transactionsCeMois.reduce((sum: number, transaction: FinancialTransaction) => sum + (transaction.montant || 0), 0);
    
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
        fontSize="12"
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  // Fonction pour formater les montants
  const formatMontant = (montant: number) => {
    return new Intl.NumberFormat('fr-FR', { 
      style: 'currency', 
      currency: 'GNF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(montant);
  };

  // Afficher un skeleton pendant le chargement initial
  if (!isInitialized || loadingEmployees) {
    return (
      <div>
        <h2 className="text-xl font-semibold mb-4 text-[var(--zalama-blue)]">Statistiques générales</h2>
        <div className="animate-pulse">
          <div className="grid grid-cols-2 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-[var(--zalama-bg-lighter)] rounded-lg p-4">
                <div className="h-4 bg-[var(--zalama-bg)] rounded mb-2"></div>
                <div className="h-6 bg-[var(--zalama-bg)] rounded"></div>
              </div>
            ))}
          </div>
          <div className="h-48 bg-[var(--zalama-bg-lighter)] rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4 text-[var(--zalama-blue)]">Statistiques générales</h2>
      
      {/* Cartes de statistiques */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-[var(--zalama-bg-light)] rounded-lg p-4">
          <div className="text-sm text-[var(--zalama-text-secondary)] mb-1">Total employés</div>
          <div className="text-2xl font-bold text-[var(--zalama-text)]">
            {stats.employees.totalEmployees}
          </div>
          <div className="text-xs text-[var(--zalama-success)] mt-1">
            +{stats.employees.newEmployeesThisMonth} ce mois
          </div>
        </div>
        
        <div className="bg-[var(--zalama-bg-light)] rounded-lg p-4">
          <div className="text-sm text-[var(--zalama-text-secondary)] mb-1">Partenaires actifs</div>
          <div className="text-2xl font-bold text-[var(--zalama-text)]">
            {stats.partners.actifs}/{stats.partners.total}
          </div>
          <div className="text-xs text-[var(--zalama-info)] mt-1">
            {stats.partners.totalEmployes} employés
          </div>
        </div>
        
        <div className="bg-[var(--zalama-bg-light)] rounded-lg p-4">
          <div className="text-sm text-[var(--zalama-text-secondary)] mb-1">Services disponibles</div>
          <div className="text-2xl font-bold text-[var(--zalama-text)]">
            {stats.services.disponibles}/{stats.services.total}
          </div>
        </div>
        
        <div className="bg-[var(--zalama-bg-light)] rounded-lg p-4">
          <div className="text-sm text-[var(--zalama-text-secondary)] mb-1">Transactions ce mois</div>
          <div className="text-2xl font-bold text-[var(--zalama-text)]">
            {stats.transactions.transactionsCeMois}
          </div>
          <div className="text-xs text-[var(--zalama-success)] mt-1">
            {formatMontant(stats.transactions.montantCeMois)}
          </div>
        </div>
      </div>
      
      {/* Graphique circulaire des types d'employés */}
      <div className="bg-[var(--zalama-bg-light)] rounded-lg p-4">
        <h3 className="text-lg font-medium mb-4 text-[var(--zalama-text)]">Répartition par type de contrat</h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={employeeTypeData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {employeeTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: any, name: any) => [
                  `${value}% (${employeeTypeData.find(item => item.name === name)?.count || 0} employés)`,
                  name
                ]}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

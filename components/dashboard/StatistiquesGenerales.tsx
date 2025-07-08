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
  const { data: employees, loading: loadingEmployees, error: errorEmployees } = useSupabaseCollection<Employee>(employeeService);
  const { data: partners, loading: loadingPartners, error: errorPartners } = useSupabaseCollection<Partner>(partnerService);
  const { data: services, loading: loadingServices, error: errorServices } = useSupabaseCollection<Service>(serviceService);
  const { data: transactions, loading: loadingTransactions, error: errorTransactions } = useSupabaseCollection<FinancialTransaction>(transactionService);

  // Logs de débogage
  useEffect(() => {
    console.log('🔍 StatistiquesGenerales - État des données:');
    console.log('Employees:', { data: employees, loading: loadingEmployees, error: errorEmployees });
    console.log('Partners:', { data: partners, loading: loadingPartners, error: errorPartners });
    console.log('Services:', { data: services, loading: loadingServices, error: errorServices });
    console.log('Transactions:', { data: transactions, loading: loadingTransactions, error: errorTransactions });
  }, [employees, partners, services, transactions, loadingEmployees, loadingPartners, loadingServices, loadingTransactions, errorEmployees, errorPartners, errorServices, errorTransactions]);

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
    
    console.log('📊 Calcul des statistiques:', {
      loading,
      employeesCount: employees?.length || 0,
      partnersCount: partners?.length || 0,
      servicesCount: services?.length || 0,
      transactionsCount: transactions?.length || 0
    });
    
    if (loading || !employees?.length) {
      console.log('⚠️ Données non disponibles ou en cours de chargement');
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
    const activePartners = partners?.filter((partner: Partner) => partner.actif).length || 0;
    const totalEmployesFromPartners = partners?.reduce((sum: number, partner: Partner) => sum + (partner.nombre_employes || 0), 0) || 0;

    // Statistiques des services (optimisé)
    const availableServices = services?.filter((service: Service) => service.disponible).length || 0;

    // Statistiques des transactions (optimisé)
    const montantTotal = transactions?.reduce((sum: number, transaction: FinancialTransaction) => sum + (transaction.montant || 0), 0) || 0;
    
    const transactionsCeMois = transactions?.filter((transaction: FinancialTransaction) => {
      if (!transaction.date_transaction) return false;
      const transactionDate = new Date(transaction.date_transaction);
      return transactionDate >= firstDayOfMonth;
    }) || [];
    
    const montantCeMois = transactionsCeMois.reduce((sum: number, transaction: FinancialTransaction) => sum + (transaction.montant || 0), 0);
    
    const result = {
      employees: {
        totalEmployees: employees.length,
        activeEmployees,
        newEmployeesThisMonth,
        employeeTypeData
      },
      partners: {
        total: partners?.length || 0,
        actifs: activePartners,
        totalEmployes: totalEmployesFromPartners
      },
      services: {
        total: services?.length || 0,
        disponibles: availableServices
      },
      transactions: {
        total: transactions?.length || 0,
        montantTotal,
        transactionsCeMois: transactionsCeMois.length,
        montantCeMois
      }
    };

    console.log('✅ Statistiques calculées:', result);
    return result;
  }, [employees, partners, services, transactions, loadingEmployees, loadingPartners, loadingServices, loadingTransactions]);

  // Données pour le graphique circulaire des types d'employés
  const { employeeTypeData } = stats.employees;
  
  // Couleurs personnalisées pour le graphique
  const COLORS = ['#3b82f6', '#10b981', '#6366f1', '#f59e0b', '#ef4444', '#8b5cf6'];

  // Fonction pour formater les labels du graphique
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }: any) => {
    if (percent < 0.05) return null; // Ne pas afficher les pourcentages trop petits
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
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
      maximumFractionDigits: 0,
    }).format(montant);
  };

  // Afficher les erreurs si elles existent
  const hasErrors = errorEmployees || errorPartners || errorServices || errorTransactions;
  const isLoading = loadingEmployees || loadingPartners || loadingServices || loadingTransactions;

  if (hasErrors) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-red-800 mb-2">Erreurs de chargement des données</h3>
        <div className="space-y-2 text-sm text-red-700">
          {errorEmployees && <div>❌ Employés: {errorEmployees.message}</div>}
          {errorPartners && <div>❌ Partenaires: {errorPartners.message}</div>}
          {errorServices && <div>❌ Services: {errorServices.message}</div>}
          {errorTransactions && <div>❌ Transactions: {errorTransactions.message}</div>}
        </div>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Recharger la page
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
        <div className="text-center text-gray-500">Chargement des statistiques...</div>
      </div>
    );
  }

  // Afficher un message si aucune donnée n'est disponible
  if (!employees?.length && !partners?.length && !services?.length && !transactions?.length) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-400 mb-4">
          <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune donnée disponible</h3>
        <p className="text-gray-500">Les statistiques apparaîtront ici une fois que des données seront ajoutées à la base de données.</p>
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

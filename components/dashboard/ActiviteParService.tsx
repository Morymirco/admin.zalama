'use client';

import React, { useState, useEffect } from 'react';
import { CreditCard, Wallet, LineChart, BarChart, CheckCircle, XCircle, Clock, Activity } from 'lucide-react';
import { useFirebaseCollection } from '@/hooks/useFirebaseCollection';
import transactionService from '@/services/transactionService';
import salaryAdvanceService from '@/services/salaryAdvanceService';
import { Transaction } from '@/types/transaction';
import { SalaryAdvanceRequest } from '@/types/salaryAdvanceRequest';
import serviceActivityService, { getTransactionsParService, getDemandeStats, ServiceActivity, DemandeStats } from '@/services/serviceActivityService';

export default function ActiviteParService() {
  // Utiliser nos hooks pour récupérer les transactions et demandes
  const { data: transactions, loading: loadingTransactions } = useFirebaseCollection<Transaction>(transactionService);
  const { data: demandes, loading: loadingDemandes } = useFirebaseCollection<SalaryAdvanceRequest>(salaryAdvanceService);
  
  // États pour les statistiques d'activité par service
  const [servicesActivity, setServicesActivity] = useState<ServiceActivity[]>([]);
  const [demandeStats, setDemandeStats] = useState<DemandeStats>({ approuvees: 0, rejetees: 0, enCours: 0 });
  const [loading, setLoading] = useState<boolean>(true);
  
  // Charger les données d'activité par service
  useEffect(() => {
    const loadServiceActivity = async () => {
      try {
        const [servicesData, demandesData] = await Promise.all([
          getTransactionsParService(),
          getDemandeStats()
        ]);
        
        setServicesActivity(servicesData);
        setDemandeStats(demandesData);
      } catch (error) {
        console.error('Erreur lors du chargement des données d\'activité par service:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (!loadingTransactions && !loadingDemandes) {
      loadServiceActivity();
    }
  }, [transactions, demandes, loadingTransactions, loadingDemandes]);
  
  // Fonction pour obtenir l'icône appropriée en fonction du nom du service
  const getServiceIcon = (iconName: string) => {
    switch (iconName) {
      case 'CreditCard':
        return <CreditCard className="h-4 w-4 text-[var(--zalama-blue)]" />;
      case 'Wallet':
        return <Wallet className="h-4 w-4 text-[var(--zalama-success)]" />;
      case 'LineChart':
        return <LineChart className="h-4 w-4 text-[var(--zalama-warning)]" />;
      case 'BarChart':
        return <BarChart className="h-4 w-4 text-[var(--zalama-purple)]" />;
      default:
        return <Activity className="h-4 w-4 text-[var(--zalama-blue)]" />;
    }
  };
  
  // Fonction pour obtenir la couleur appropriée en fonction du nom de la couleur
  const getColorClass = (colorName: string) => {
    switch (colorName) {
      case 'blue':
        return {
          bg: 'bg-[var(--zalama-blue-light)]',
          text: 'text-[var(--zalama-blue)]',
          bar: 'bg-[var(--zalama-blue)]'
        };
      case 'success':
        return {
          bg: 'bg-[var(--zalama-success-light)]',
          text: 'text-[var(--zalama-success)]',
          bar: 'bg-[var(--zalama-success)]'
        };
      case 'warning':
        return {
          bg: 'bg-[var(--zalama-warning-light)]',
          text: 'text-[var(--zalama-warning)]',
          bar: 'bg-[var(--zalama-warning)]'
        };
      case 'purple':
        return {
          bg: 'bg-[var(--zalama-purple-light)]',
          text: 'text-[var(--zalama-purple)]',
          bar: 'bg-[var(--zalama-purple)]'
        };
      default:
        return {
          bg: 'bg-[var(--zalama-blue-light)]',
          text: 'text-[var(--zalama-blue)]',
          bar: 'bg-[var(--zalama-blue)]'
        };
    }
  };
  
  // Calculer le total des activités pour les pourcentages
  const totalActivities = servicesActivity.reduce((sum, service) => sum + service.count, 0);
  
  // Afficher un spinner pendant le chargement
  if (loading) {
    return (
      <div>
        <h2 className="text-xl font-semibold mb-4 text-[var(--zalama-blue)]">Activité par service</h2>
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[var(--zalama-primary)]"></div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4 text-[var(--zalama-blue)]">Activité par service</h2>
      
      {/* Grille des services */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {servicesActivity.slice(0, 4).map((service, index) => {
          const colorClasses = getColorClass(service.color);
          const percentage = totalActivities > 0 ? (service.count / totalActivities) * 100 : 0;
          
          return (
            <div key={index} className="bg-[var(--zalama-bg-light)] rounded-lg p-3 border border-[var(--zalama-border)]">
              <div className="flex justify-between items-center mb-1">
                <div className="text-sm text-[var(--zalama-text-secondary)]">{service.nom}</div>
                <div className={`${colorClasses.bg} p-1 rounded-full`}>
                  {getServiceIcon(service.icon)}
                </div>
              </div>
              <div className="text-xl font-bold text-[var(--zalama-text)]">{service.count}</div>
              <div className="w-full bg-[var(--zalama-bg)] h-1.5 rounded-full mt-2 overflow-hidden">
                <div className={`${colorClasses.bar} h-full`} style={{ width: `${percentage}%` }}></div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Statut des demandes */}
      <div className="bg-[var(--zalama-bg-light)] rounded-lg p-3 border border-[var(--zalama-border)]">
        <div className="text-sm font-medium mb-3 text-[var(--zalama-text)]">Statut des demandes</div>
        <div className="grid grid-cols-3 gap-2">
          {/* Approuvés */}
          <div className="flex items-center gap-2">
            <div className="bg-[var(--zalama-success-light)] p-1 rounded-full">
              <CheckCircle className="h-4 w-4 text-[var(--zalama-success)]" />
            </div>
            <div>
              <div className="text-base font-bold text-[var(--zalama-text)]">{demandeStats.approuvees}</div>
              <div className="text-xs text-[var(--zalama-text-secondary)]">Approuvés</div>
            </div>
          </div>
          
          {/* Rejetés */}
          <div className="flex items-center gap-2">
            <div className="bg-[var(--zalama-danger-light)] p-1 rounded-full">
              <XCircle className="h-4 w-4 text-[var(--zalama-danger)]" />
            </div>
            <div>
              <div className="text-base font-bold text-[var(--zalama-text)]">{demandeStats.rejetees}</div>
              <div className="text-xs text-[var(--zalama-text-secondary)]">Rejetés</div>
            </div>
          </div>
          
          {/* En Cours */}
          <div className="flex items-center gap-2">
            <div className="bg-[var(--zalama-warning-light)] p-1 rounded-full">
              <Clock className="h-4 w-4 text-[var(--zalama-warning)]" />
            </div>
            <div>
              <div className="text-base font-bold text-[var(--zalama-text)]">{demandeStats.enCours}</div>
              <div className="text-xs text-[var(--zalama-text-secondary)]">En Cours</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { CreditCard, Wallet, LineChart, BarChart, CheckCircle, XCircle, Clock, Activity } from 'lucide-react';
import { useSupabaseCollection } from '@/hooks/useSupabaseCollection';
import serviceService from '@/services/serviceService';
import { transactionService } from '@/services/transactionService';

export default function ActiviteParService() {
  const [nbDemandesAvance, setNbDemandesAvance] = useState<number>(0);

  useEffect(() => {
    async function fetchNbDemandes() {
      const nb = await serviceService.getNombreDemandesAvanceSalaire();
      setNbDemandesAvance(nb);
    }
    fetchNbDemandes();
  }, []);
  
  // Utiliser nos hooks pour récupérer les services et transactions
  const { data: services, loading: loadingServices } = useSupabaseCollection(serviceService);
  const { data: transactions, loading: loadingTransactions } = useSupabaseCollection(transactionService);
  
  // Calculer les statistiques d'activité par service
  const stats = useMemo(() => {
    if (loadingServices || loadingTransactions || !services.length) {
      return {
        servicesActivity: [],
        demandeStats: { approuvees: 0, rejetees: 0, enCours: 0 }
      };
    }

    // Calculer l'activité par service
    const servicesActivity = services.map(service => {
      // Compter les transactions pour ce service
      const serviceTransactions = transactions.filter(t => t.service_id === service.id);
      const count = serviceTransactions.length;
      
      // Déterminer l'icône et la couleur en fonction de la catégorie
      let icon = 'Activity';
      let color = 'blue';
      
      switch (service.categorie?.toLowerCase()) {
        case 'finance':
          icon = 'CreditCard';
          color = 'blue';
          break;
        case 'avance':
          icon = 'Wallet';
          color = 'success';
          break;
        case 'analyse':
          icon = 'LineChart';
          color = 'warning';
          break;
        case 'rapport':
          icon = 'BarChart';
          color = 'purple';
          break;
        default:
          icon = 'Activity';
          color = 'blue';
      }
      
      return {
        nom: service.nom,
        count,
        icon,
        color
      };
    }).sort((a, b) => b.count - a.count).slice(0, 4);

    // Calculer les statistiques des demandes (basées sur les transactions)
    const approuvees = transactions.filter(t => t.statut === 'Validé' || t.statut === 'Effectué').length;
    const rejetees = transactions.filter(t => t.statut === 'Rejeté').length;
    const enCours = transactions.filter(t => t.statut === 'En attente').length;

    return {
      servicesActivity,
      demandeStats: { approuvees, rejetees, enCours }
    };
  }, [services, transactions, loadingServices, loadingTransactions]);
  
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
  const totalActivities = stats.servicesActivity.reduce((sum, service) => sum + service.count, 0);
  
  // Afficher un spinner pendant le chargement
  if (loadingServices || loadingTransactions) {
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
      
      {/* Affichage du nombre de demandes d'avance sur salaire */}
      <div className="my-4">
        <div className="bg-[var(--zalama-bg-light)] rounded-lg p-3 border border-[var(--zalama-border)] flex items-center gap-3">
          <span className="text-base font-bold text-[var(--zalama-text)]">{nbDemandesAvance}</span>
          <span className="text-xs text-[var(--zalama-text-secondary)]">demandes d'avance sur salaire</span>
        </div>
      </div>
      {/* Grille des services */}
      <h2 className="text-xl font-semibold mb-4 text-[var(--zalama-blue)]">Nos services</h2>
      <div className="grid grid-cols-2 gap-3 mb-4">
        
        {stats.servicesActivity.map((service, index) => {
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
              {/* <div className="text-xl font-bold text-[var(--zalama-text)]">{service.count}</div> */}
              <div className="w-full bg-[var(--zalama-bg)] h-1.5 rounded-full mt-2 overflow-hidden">
                <div className={`${colorClasses.bar} h-full`} style={{ width: `${percentage}%` }}></div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Statut des demandes */}
      <div className="bg-[var(--zalama-bg-light)] rounded-lg p-3 border border-[var(--zalama-border)]">
        <div className="text-sm font-medium mb-3 text-[var(--zalama-text)]">Statut des transactions</div>
        <div className="grid grid-cols-3 gap-2">
          {/* Approuvés */}
          <div className="flex items-center gap-2">
            <div className="bg-[var(--zalama-success-light)] p-1 rounded-full">
              <CheckCircle className="h-4 w-4 text-[var(--zalama-success)]" />
            </div>
            <div>
              <div className="text-base font-bold text-[var(--zalama-text)]">{stats.demandeStats.approuvees}</div>
              <div className="text-xs text-[var(--zalama-text-secondary)]">Validés</div>
            </div>
          </div>
          
          {/* Rejetés */}
          <div className="flex items-center gap-2">
            <div className="bg-[var(--zalama-danger-light)] p-1 rounded-full">
              <XCircle className="h-4 w-4 text-[var(--zalama-danger)]" />
            </div>
            <div>
              <div className="text-base font-bold text-[var(--zalama-text)]">{stats.demandeStats.rejetees}</div>
              <div className="text-xs text-[var(--zalama-text-secondary)]">Rejetés</div>
            </div>
          </div>
          
          {/* En Cours */}
          <div className="flex items-center gap-2">
            <div className="bg-[var(--zalama-warning-light)] p-1 rounded-full">
              <Clock className="h-4 w-4 text-[var(--zalama-warning)]" />
            </div>
            <div>
              <div className="text-base font-bold text-[var(--zalama-text)]">{stats.demandeStats.enCours}</div>
              <div className="text-xs text-[var(--zalama-text-secondary)]">En Attente</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

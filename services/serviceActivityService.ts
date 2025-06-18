import { createFirebaseService } from './firebaseService';
import { where, orderBy, limit, Timestamp } from 'firebase/firestore';
import { Transaction } from '@/types/transaction';
import { SalaryAdvanceRequest } from '@/types/salaryAdvanceRequest';
import transactionService from './transactionService';
import salaryAdvanceService from './salaryAdvanceService';

// Interface pour les statistiques d'activité par service
export interface ServiceActivity {
  nom: string;
  count: number;
  icon: string;
  color: string;
}

// Interface pour les statistiques de statut des demandes
export interface DemandeStats {
  approuvees: number;
  rejetees: number;
  enCours: number;
}

const serviceActivityService = createFirebaseService<Transaction>('transactions');

// Fonction pour obtenir le nombre de transactions par service
export const getTransactionsParService = async (): Promise<ServiceActivity[]> => {
  const transactions = await transactionService.getAll();
  
  // Regrouper les transactions par service
  const serviceMap: Record<string, number> = {};
  
  transactions.forEach(transaction => {
    if (transaction.service) {
      serviceMap[transaction.service] = (serviceMap[transaction.service] || 0) + 1;
    }
  });
  
  // Définir les icônes et couleurs pour chaque service
  const serviceIcons: Record<string, { icon: string; color: string }> = {
    'avance': { icon: 'CreditCard', color: 'blue' },
    'pret': { icon: 'Wallet', color: 'success' },
    'conseil': { icon: 'LineChart', color: 'warning' },
    'marketing': { icon: 'BarChart', color: 'purple' },
    'default': { icon: 'Activity', color: 'blue' }
  };
  
  // Convertir en tableau et trier par nombre de transactions décroissant
  const servicesArray = Object.entries(serviceMap).map(([nom, count]) => {
    const iconInfo = serviceIcons[nom.toLowerCase()] || serviceIcons.default;
    
    return {
      nom,
      count,
      icon: iconInfo.icon,
      color: iconInfo.color
    };
  });
  
  // Trier par nombre de transactions décroissant
  servicesArray.sort((a, b) => b.count - a.count);
  
  return servicesArray;
};

// Fonction pour obtenir les statistiques des demandes par statut
export const getDemandeStats = async (): Promise<DemandeStats> => {
  // Récupérer les demandes d'avance sur salaire
  const demandes = await salaryAdvanceService.getAll();
  
  // Compter les demandes par statut
  const stats: DemandeStats = {
    approuvees: 0,
    rejetees: 0,
    enCours: 0
  };
  
  demandes.forEach(demande => {
    if (demande.statut === 'approuvée') {
      stats.approuvees++;
    } else if (demande.statut === 'rejetée') {
      stats.rejetees++;
    } else {
      stats.enCours++;
    }
  });
  
  return stats;
};

export default serviceActivityService;

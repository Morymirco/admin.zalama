import { createFirebaseService } from './firebaseService';
import { where, orderBy, limit, Timestamp } from 'firebase/firestore';
import { Objectif } from '@/types/objectif';
import { Transaction } from '@/types/transaction';
import { SalaryAdvanceRequest } from '@/types/salaryAdvanceRequest';
import { Utilisateur } from '@/types/utilisateur';
import transactionService from './transactionService';
import userService from './userService';
import salaryAdvanceService from './salaryAdvanceService';

// Interface pour les statistiques de progression d'objectifs
export interface ObjectifProgression {
  nom: string;
  progression: number;
  objectif: number;
  pourcentage: number;
}

// Interface pour les taux de croissance
export interface TauxCroissance {
  valeur: number;
  variation: number;
  periode: string;
}

// Interface pour les performances d'équipe
export interface PerformanceEquipe {
  nom: string;
  valeur: number;
  pourcentage: number;
}

// Interface pour la satisfaction globale
export interface SatisfactionGlobale {
  pourcentage: number;
  variation: number;
  periode: string;
}

const objectifsService = createFirebaseService<Objectif>('objectifs');

// Fonction pour calculer la progression des objectifs mensuels
export const getObjectifsMensuels = async (): Promise<ObjectifProgression[]> => {
  const currentDate = new Date();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const timestampFirstDay = Timestamp.fromDate(firstDayOfMonth);
  
  // Récupérer les données nécessaires
  const [users, transactions] = await Promise.all([
    userService.getAll(),
    transactionService.getAll()
  ]);
  
  // Nouveaux utilisateurs ce mois
  const nouveauxUtilisateurs = users.filter(user => {
    const dateCreation = user.createdAt?.toDate();
    return dateCreation && dateCreation >= firstDayOfMonth;
  }).length;
  
  // Volume de prêts
  const volumePrets = transactions
    .filter(transaction => 
      transaction.type === 'p2p' && 
      transaction.dateTransaction.toDate() >= firstDayOfMonth
    )
    .reduce((sum, transaction) => sum + transaction.montant, 0);
  
  // Partenariats (simulé - à remplacer par une vraie logique)
  const partenariats = 6; // Nombre de partenariats actuels
  
  // Objectifs (à remplacer par des objectifs réels depuis Firestore)
  const objectifUtilisateurs = 100;
  const objectifVolumePrets = 10000000;
  const objectifPartenariats = 10;
  
  return [
    {
      nom: 'Nouveaux utilisateurs',
      progression: nouveauxUtilisateurs,
      objectif: objectifUtilisateurs,
      pourcentage: Math.min(Math.round((nouveauxUtilisateurs / objectifUtilisateurs) * 100), 100)
    },
    {
      nom: 'Volume de prêts',
      progression: volumePrets,
      objectif: objectifVolumePrets,
      pourcentage: Math.min(Math.round((volumePrets / objectifVolumePrets) * 100), 100)
    },
    {
      nom: 'Partenariats',
      progression: partenariats,
      objectif: objectifPartenariats,
      pourcentage: Math.min(Math.round((partenariats / objectifPartenariats) * 100), 100)
    }
  ];
};

// Fonction pour calculer le taux de croissance mensuel
export const getTauxCroissanceMensuel = async (): Promise<TauxCroissance> => {
  const currentDate = new Date();
  const firstDayCurrentMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const firstDayPreviousMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
  const firstDayTwoMonthsAgo = new Date(currentDate.getFullYear(), currentDate.getMonth() - 2, 1);
  
  const timestampCurrentMonth = Timestamp.fromDate(firstDayCurrentMonth);
  const timestampPreviousMonth = Timestamp.fromDate(firstDayPreviousMonth);
  const timestampTwoMonthsAgo = Timestamp.fromDate(firstDayTwoMonthsAgo);
  
  // Récupérer toutes les transactions
  const allTransactions = await transactionService.getAll();
  
  // Calculer le volume pour chaque mois
  const volumeCurrentMonth = allTransactions
    .filter(t => t.dateTransaction.toDate() >= firstDayCurrentMonth)
    .reduce((sum, t) => sum + t.montant, 0);
  
  const volumePreviousMonth = allTransactions
    .filter(t => 
      t.dateTransaction.toDate() >= firstDayPreviousMonth && 
      t.dateTransaction.toDate() < firstDayCurrentMonth
    )
    .reduce((sum, t) => sum + t.montant, 0);
  
  const volumeTwoMonthsAgo = allTransactions
    .filter(t => 
      t.dateTransaction.toDate() >= firstDayTwoMonthsAgo && 
      t.dateTransaction.toDate() < firstDayPreviousMonth
    )
    .reduce((sum, t) => sum + t.montant, 0);
  
  // Calculer les taux de croissance
  const croissanceActuelle = volumePreviousMonth > 0 
    ? ((volumeCurrentMonth - volumePreviousMonth) / volumePreviousMonth) * 100 
    : 0;
  
  const croissancePrecedente = volumeTwoMonthsAgo > 0 
    ? ((volumePreviousMonth - volumeTwoMonthsAgo) / volumeTwoMonthsAgo) * 100 
    : 0;
  
  const variation = croissanceActuelle - croissancePrecedente;
  
  return {
    valeur: parseFloat(croissanceActuelle.toFixed(1)),
    variation: parseFloat(variation.toFixed(1)),
    periode: '3 mois'
  };
};

// Fonction pour calculer les performances des équipes
export const getPerformancesEquipe = async (): Promise<PerformanceEquipe[]> => {
  const demandes = await salaryAdvanceService.getAll();
  
  // Calculer le temps moyen de réponse pour le service client (simulé)
  const reactiviteServiceClient = 92; // Pourcentage de réactivité
  
  // Calculer le pourcentage de demandes traitées dans les délais
  const totalDemandes = demandes.length;
  const demandesTraitees = demandes.filter(d => d.statut !== 'en attente').length;
  const pourcentageTraitement = totalDemandes > 0 
    ? Math.round((demandesTraitees / totalDemandes) * 100) 
    : 0;
  
  // Calculer le taux de résolution des problèmes (simulé)
  const resolutionProblemes = 78; // Pourcentage de résolution
  
  return [
    {
      nom: 'Réactivité service client',
      valeur: reactiviteServiceClient,
      pourcentage: reactiviteServiceClient
    },
    {
      nom: 'Traitement des demandes',
      valeur: demandesTraitees,
      pourcentage: pourcentageTraitement
    },
    {
      nom: 'Résolution des problèmes',
      valeur: resolutionProblemes,
      pourcentage: resolutionProblemes
    }
  ];
};

// Fonction pour calculer la satisfaction globale
export const getSatisfactionGlobale = async (): Promise<SatisfactionGlobale> => {
  // Simulé - à remplacer par des données réelles
  return {
    pourcentage: 87,
    variation: 5,
    periode: 'trimestre précédent'
  };
};

export default objectifsService;

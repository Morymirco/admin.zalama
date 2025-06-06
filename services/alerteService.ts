import { Alerte } from '@/types/alerte';
import { createFirebaseService } from './firebaseService';
import { where, orderBy, limit, Timestamp } from 'firebase/firestore';

const alerteService = createFirebaseService<Alerte>('alertes');

// Fonctions spécifiques pour les alertes
export const getRecentAlertes = async (count: number = 10) => {
  return alerteService.query([
    orderBy('dateCreation', 'desc'),
    limit(count)
  ]);
};

export const getAlertesByType = async (type: Alerte['type']) => {
  return alerteService.query([
    where('type', '==', type),
    orderBy('dateCreation', 'desc')
  ]);
};

export const getAlertesByStatut = async (statut: Alerte['statut']) => {
  return alerteService.query([
    where('statut', '==', statut),
    orderBy('dateCreation', 'desc')
  ]);
};

export const getAlertesNonResolues = async () => {
  return alerteService.query([
    where('statut', 'in', ['Nouvelle', 'En cours']),
    orderBy('dateCreation', 'desc')
  ]);
};

export const getAlertesResolues = async () => {
  return alerteService.query([
    where('statut', '==', 'Résolue'),
    orderBy('dateCreation', 'desc')
  ]);
};

export const getAlertesThisMonthCount = async () => {
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  return alerteService.count([
    where('dateCreation', '>=', Timestamp.fromDate(firstDayOfMonth))
  ]);
};

export default alerteService;

import { Partenaire } from '@/types/partenaire';
import { createFirebaseService } from './firebaseService';
import { where, orderBy, limit, Timestamp } from 'firebase/firestore';

const partenaireService = createFirebaseService<Partenaire>('partenaires');

// Fonctions spécifiques pour les partenaires
export const getPartenairesByStatus = async (statut: Partenaire['statut']) => {
  return partenaireService.query([where('statut', '==', statut)]);
};

export const getActivePartenaires = async () => {
  return partenaireService.query([where('statut', '==', 'actif')]);
};

export const getRecentPartenaires = async (count: number = 5) => {
  return partenaireService.query([
    orderBy('dateCreation', 'desc'),
    limit(count)
  ]);
};

export const getPartenairesByType = async (type: string) => {
  return partenaireService.query([where('type', '==', type)]);
};

export const getPartenairesCount = async () => {
  return partenaireService.count();
};

export const getActivePartenairesCount = async () => {
  return partenaireService.count([where('statut', '==', 'actif')]);
};

export const getNewPartenairesThisMonthCount = async () => {
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  return partenaireService.count([
    where('dateCreation', '>=', Timestamp.fromDate(firstDayOfMonth))
  ]);
};

export default partenaireService;

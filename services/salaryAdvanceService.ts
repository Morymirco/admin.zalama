import { SalaryAdvanceRequest } from '@/types/salaryAdvanceRequest';
import { createFirebaseService } from './firebaseService';
import { where, orderBy, limit, Timestamp } from 'firebase/firestore';

const salaryAdvanceService = createFirebaseService<SalaryAdvanceRequest>('salary_advance_requests');

// Fonctions spécifiques pour les demandes d'avance sur salaire
export const getRequestsByStatus = async (statut: SalaryAdvanceRequest['statut']) => {
  return salaryAdvanceService.query([
    where('statut', '==', statut),
    orderBy('dateCreation', 'desc')
  ]);
};

export const getRequestsByUser = async (utilisateurId: string) => {
  return salaryAdvanceService.query([
    where('utilisateurId', '==', utilisateurId),
    orderBy('dateCreation', 'desc')
  ]);
};

export const getRequestsByPartner = async (partenaireId: string) => {
  return salaryAdvanceService.query([
    where('partenaireId', '==', partenaireId),
    orderBy('dateCreation', 'desc')
  ]);
};

export const getRecentRequests = async (count: number = 10) => {
  return salaryAdvanceService.query([
    orderBy('dateCreation', 'desc'),
    limit(count)
  ]);
};

export const getPendingRequestsCount = async () => {
  return salaryAdvanceService.count([where('statut', '==', 'en attente')]);
};

export const getApprovedRequestsCount = async () => {
  return salaryAdvanceService.count([where('statut', '==', 'approuvée')]);
};

export const getTotalRequestsAmount = async (statut?: SalaryAdvanceRequest['statut']) => {
  const constraints = statut ? [where('statut', '==', statut)] : [];
  const requests = await salaryAdvanceService.query(constraints);
  return requests.reduce((total, request) => total + request.montant, 0);
};

export default salaryAdvanceService;

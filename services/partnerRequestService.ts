import { PartnerRequest } from '@/types/partnerRequest';
import { createFirebaseService } from './firebaseService';
import { where, orderBy, limit, Timestamp } from 'firebase/firestore';

const partnerRequestService = createFirebaseService<PartnerRequest>('partner_requests');

// Fonctions spécifiques pour les demandes de partenariat
export const getRequestsByStatus = async (statut: PartnerRequest['statut']) => {
  return partnerRequestService.query([
    where('statut', '==', statut),
    orderBy('dateCreation', 'desc')
  ]);
};

export const getRecentRequests = async (count: number = 10) => {
  return partnerRequestService.query([
    orderBy('dateCreation', 'desc'),
    limit(count)
  ]);
};

export const getPendingRequestsCount = async () => {
  return partnerRequestService.count([where('statut', '==', 'en attente')]);
};

export const getRequestsBySector = async (secteur: string) => {
  return partnerRequestService.query([
    where('secteur', '==', secteur),
    orderBy('dateCreation', 'desc')
  ]);
};

export const getRequestsThisMonth = async () => {
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const firstDayTimestamp = Timestamp.fromDate(firstDayOfMonth);
  
  return partnerRequestService.query([
    where('dateCreation', '>=', firstDayTimestamp),
    orderBy('dateCreation', 'desc')
  ]);
};

export const getRequestsCountBySector = async () => {
  const requests = await partnerRequestService.getAll();
  const sectorCounts: Record<string, number> = {};
  
  requests.forEach(request => {
    const secteur = request.secteur;
    if (secteur) {
      sectorCounts[secteur] = (sectorCounts[secteur] || 0) + 1;
    }
  });
  
  return sectorCounts;
};

export default partnerRequestService;

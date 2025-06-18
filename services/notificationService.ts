import { Notification } from '@/types/notification';
import { createFirebaseService } from './firebaseService';
import { where, orderBy, limit, Timestamp } from 'firebase/firestore';

const notificationService = createFirebaseService<Notification>('notifications');

// Fonctions spécifiques pour les notifications
export const getRecentNotifications = async (count: number = 5) => {
  console.log(`Récupération des ${count} notifications les plus récentes`);
  try {
    const result = await notificationService.query([
      orderBy('dateCreation', 'desc'),
      limit(count)
    ]);
    console.log(`Résultat de getRecentNotifications: ${result.length} notifications trouvées`);
    return result;
  } catch (error) {
    console.error('Erreur dans getRecentNotifications:', error);
    return [];
  }
};

export const getUnreadNotifications = async () => {
  return notificationService.query([
    where('lue', '==', false),
    orderBy('dateCreation', 'desc')
  ]);
};

export const getNotificationsByType = async (type: string) => {
  return notificationService.query([
    where('type', '==', type),
    orderBy('dateCreation', 'desc')
  ]);
};

export const getNotificationsForUser = async (userId: string) => {
  return notificationService.query([
    where('destinataireId', '==', userId),
    orderBy('dateCreation', 'desc')
  ]);
};

export const getUnreadNotificationsCount = async () => {
  return notificationService.count([where('lue', '==', false)]);
};

export default notificationService;

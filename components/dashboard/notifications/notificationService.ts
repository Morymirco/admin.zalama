import { Notification } from './types';
import { getUnreadNotifications, getNotificationsByType, getRecentNotifications } from '@/services/notificationService';
import { doc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';


// Fonction pour récupérer les notifications non lues
export const fetchUnreadNotifications = async (): Promise<Notification[]> => {
  try {
    console.log('Début de fetchUnreadNotifications');
    // Récupérer toutes les notifications récentes (lues et non lues)
    const allNotifications = await getRecentNotifications(50);
    console.log('Notifications récupérées:', allNotifications.length, allNotifications);
    return allNotifications;
  } catch (error) {
    console.error('Erreur lors de la récupération des notifications:', error);
    return [];
  }
};

// Fonction pour récupérer uniquement le nombre de notifications non lues
export const getUnreadNotificationsCount = async (): Promise<number> => {
  try {
    // Solution directe avec Firestore
    const notificationsRef = collection(db, 'notifications');
    const q = query(notificationsRef, where('lue', '==', false));
    const snapshot = await getDocs(q);
    const count = snapshot.size;
    console.log('Nombre de notifications non lues:', count);
    return count;
  } catch (error) {
    console.error('Erreur lors du comptage des notifications non lues:', error);
    
    // Solution de secours si l'index n'est pas créé
    try {
      const allNotifications = await getRecentNotifications(50);
      const unreadCount = allNotifications.filter(notification => !notification.lue).length;
      console.log('Nombre de notifications non lues (méthode alternative):', unreadCount);
      return unreadCount;
    } catch (secondError) {
      console.error('Erreur lors du comptage alternatif des notifications:', secondError);
      return 0;
    }
  }
};

// Fonction pour récupérer les notifications par type
export const fetchNotificationsByType = async (type: string): Promise<Notification[]> => {
  try {
    console.log(`Début de fetchNotificationsByType pour le type: ${type}`);
    // Solution temporaire : récupérer toutes les notifications récentes et filtrer côté client
    // En attendant que l'index soit créé
    const allNotifications = await getRecentNotifications(100); // Augmenter la limite pour voir plus de notifications
    console.log('Notifications récupérées:', allNotifications.length, allNotifications);
    
    const typedNotifications = allNotifications.filter(notification => notification.type === type);
    console.log(`Notifications de type ${type}:`, typedNotifications.length);
    
    return typedNotifications;
  } catch (error) {
    console.error(`Erreur lors de la récupération des notifications de type ${type}:`, error);
    return [];
  }
};

// Fonction pour récupérer les notifications récentes
export const fetchRecentNotifications = async (count: number = 5): Promise<Notification[]> => {
  try {
    return await getRecentNotifications(count);
  } catch (error) {
    console.error('Erreur lors de la récupération des notifications récentes:', error);
    return [];
  }
};

// Fonction pour marquer une notification comme lue
export const markNotificationAsRead = async (notificationId: string): Promise<boolean> => {
  try {
    const notificationRef = doc(db, 'notifications', notificationId);
    await updateDoc(notificationRef, {
      lue: true
    });
    return true;
  } catch (error) {
    console.error(`Erreur lors du marquage de la notification ${notificationId} comme lue:`, error);
    return false;
  }
};

// Fonction pour marquer toutes les notifications comme lues
export const markAllNotificationsAsRead = async (notificationIds: string[]): Promise<boolean> => {
  try {
    const updatePromises = notificationIds.map(id => {
      const notificationRef = doc(db, 'notifications', id);
      return updateDoc(notificationRef, { lue: true });
    });
    
    await Promise.all(updatePromises);
    return true;
  } catch (error) {
    console.error('Erreur lors du marquage de toutes les notifications comme lues:', error);
    return false;
  }
};


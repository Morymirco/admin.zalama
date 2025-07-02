import { useState, useEffect, useCallback } from 'react';
import { notificationService, Notification, NotificationStats } from '../services/notificationService';
import { useAuth } from './useAuth';

export const useNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadNotifications, setUnreadNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<NotificationStats>({
    total: 0,
    non_lues: 0,
    par_type: {},
    recentes: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Charger les notifications
  const loadNotifications = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);

      const [allNotifications, unread, notificationStats] = await Promise.all([
        notificationService.getUserNotifications(user.id),
        notificationService.getUnreadNotifications(user.id),
        notificationService.getNotificationStats(user.id)
      ]);

      setNotifications(allNotifications);
      setUnreadNotifications(unread);
      setStats(notificationStats);
    } catch (err) {
      console.error('Erreur lors du chargement des notifications:', err);
      setError('Erreur lors du chargement des notifications');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Marquer une notification comme lue
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const success = await notificationService.markAsRead(notificationId);
      if (success) {
        // Mettre à jour l'état local
        setNotifications(prev => 
          prev.map(n => 
            n.id === notificationId 
              ? { ...n, lu: true, date_lecture: new Date().toISOString() }
              : n
          )
        );
        setUnreadNotifications(prev => 
          prev.filter(n => n.id !== notificationId)
        );
        setStats(prev => ({
          ...prev,
          non_lues: Math.max(0, prev.non_lues - 1)
        }));
      }
    } catch (err) {
      console.error('Erreur lors du marquage de la notification:', err);
      setError('Erreur lors du marquage de la notification');
    }
  }, []);

  // Marquer toutes les notifications comme lues
  const markAllAsRead = useCallback(async () => {
    if (!user?.id) return;

    try {
      const updatedCount = await notificationService.markAllAsRead(user.id);
      if (updatedCount > 0) {
        // Mettre à jour l'état local
        setNotifications(prev => 
          prev.map(n => ({ ...n, lu: true, date_lecture: new Date().toISOString() }))
        );
        setUnreadNotifications([]);
        setStats(prev => ({
          ...prev,
          non_lues: 0
        }));
      }
    } catch (err) {
      console.error('Erreur lors du marquage de toutes les notifications:', err);
      setError('Erreur lors du marquage de toutes les notifications');
    }
  }, [user?.id]);

  // Supprimer une notification
  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      await notificationService.deleteNotification(notificationId);
      
      // Mettre à jour l'état local
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      setUnreadNotifications(prev => prev.filter(n => n.id !== notificationId));
      
      // Recalculer les stats
      const newStats = await notificationService.getNotificationStats(user?.id!);
      setStats(newStats);
    } catch (err) {
      console.error('Erreur lors de la suppression de la notification:', err);
      setError('Erreur lors de la suppression de la notification');
    }
  }, [user?.id]);

  // Ajouter une nouvelle notification (pour les notifications en temps réel)
  const addNotification = useCallback((notification: Notification) => {
    setNotifications(prev => [notification, ...prev]);
    if (!notification.lu) {
      setUnreadNotifications(prev => [notification, ...prev]);
      setStats(prev => ({
        ...prev,
        total: prev.total + 1,
        non_lues: prev.non_lues + 1,
        par_type: {
          ...prev.par_type,
          [notification.type]: (prev.par_type[notification.type] || 0) + 1
        },
        recentes: prev.recentes + 1
      }));
    }
  }, []);

  // S'abonner aux notifications en temps réel
  useEffect(() => {
    if (!user?.id) return;

    const subscription = notificationService.subscribeToNotifications(user.id, addNotification);

    return () => {
      notificationService.unsubscribeFromNotifications(user.id);
    };
  }, [user?.id, addNotification]);

  // Charger les notifications au montage et quand l'utilisateur change
  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  // Recharger les notifications toutes les 5 minutes
  useEffect(() => {
    const interval = setInterval(loadNotifications, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [loadNotifications]);

  // Nettoyer les anciennes notifications quotidiennement
  useEffect(() => {
    const cleanup = async () => {
      try {
        await notificationService.cleanupOldNotifications();
      } catch (err) {
        console.error('Erreur lors du nettoyage des notifications:', err);
      }
    };

    // Nettoyer une fois par jour à 2h du matin
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(2, 0, 0, 0);

    const timeUntilCleanup = tomorrow.getTime() - now.getTime();
    const timeout = setTimeout(cleanup, timeUntilCleanup);

    return () => clearTimeout(timeout);
  }, []);

  return {
    notifications,
    unreadNotifications,
    stats,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    loadNotifications,
    addNotification
  };
}; 
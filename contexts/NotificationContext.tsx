"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getUnreadNotificationsCount, markNotificationAsRead, markAllNotificationsAsRead } from '@/components/dashboard/notifications/notificationService';
import { Notification } from '@/components/dashboard/notifications/types';

interface NotificationContextType {
  unreadCount: number;
  notifications: Notification[];
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
  refreshUnreadCount: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications doit être utilisé à l\'intérieur d\'un NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider = ({ children }: NotificationProviderProps) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const refreshUnreadCount = async () => {
    try {
      const count = await getUnreadNotificationsCount();
      setUnreadCount(count);
    } catch (error) {
      console.error('Erreur lors du rafraîchissement du compteur de notifications:', error);
    }
  };
  
  // Marquer une notification comme lue
  const markAsRead = async (id: string) => {
    const success = await markNotificationAsRead(id);
    
    if (success) {
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => 
          notification.id === id ? { ...notification, lue: true } : notification
        )
      );
      // Rafraîchir le compteur après avoir marqué comme lu
      refreshUnreadCount();
    }
  };
  
  // Marquer toutes les notifications comme lues
  const markAllAsRead = async () => {
    const unreadNotificationIds = notifications
      .filter(notification => !notification.lue)
      .map(notification => notification.id);
    
    if (unreadNotificationIds.length === 0) return;
    
    const success = await markAllNotificationsAsRead(unreadNotificationIds);
    
    if (success) {
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => ({
          ...notification,
          lue: true
        }))
      );
      // Rafraîchir le compteur après avoir tout marqué comme lu
      refreshUnreadCount();
    }
  };

  useEffect(() => {
    refreshUnreadCount();
    
    // Rafraîchir le compteur toutes les 60 secondes
    const interval = setInterval(refreshUnreadCount, 60000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <NotificationContext.Provider value={{ 
      unreadCount, 
      notifications, 
      setNotifications, 
      refreshUnreadCount, 
      markAsRead, 
      markAllAsRead 
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

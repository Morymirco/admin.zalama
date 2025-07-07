"use client"

import React, { createContext, useContext, ReactNode, useCallback, useMemo } from 'react';
import { useNotifications as useNotificationsHook } from '@/hooks/useNotifications';
import { Notification } from '@/services/notificationService';

interface NotificationContextType {
  unreadCount: number;
  notifications: Notification[];
  stats: {
    total: number;
    non_lues: number;
    par_type: Record<string, number>;
    recentes: number;
  };
  loading: boolean;
  error: string | null;
  refreshUnreadCount: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
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
  const {
    notifications,
    unreadNotifications,
    stats,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    loadNotifications
  } = useNotificationsHook();

  const refreshUnreadCount = useCallback(async () => {
    await loadNotifications();
  }, [loadNotifications]);

  const contextValue = useMemo(() => ({
    unreadCount: stats.non_lues,
    notifications, 
    stats,
    loading,
    error,
    refreshUnreadCount, 
    markAsRead, 
    markAllAsRead,
    deleteNotification
  }), [
    stats.non_lues,
    notifications,
    stats,
    loading,
    error,
    refreshUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification
  ]);

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};

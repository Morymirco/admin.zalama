'use client';

import React from 'react';
import { AlertTriangle, Shield, Activity, TrendingUp, Bell } from 'lucide-react';
import { orderBy, limit, Timestamp } from 'firebase/firestore';
import { useFirebaseCollection } from '@/hooks/useFirebaseCollection';
import notificationService from '@/services/notificationService';
import { Notification } from '@/types/notification';

// Interface déplacée vers types/notification.ts

export default function AlertesRisques() {
  // Utiliser notre hook pour récupérer les notifications récentes
  const { data: notifications, loading, error } = useFirebaseCollection<Notification>(
    notificationService,
    [orderBy('dateCreation', 'desc'), limit(3)]
  );

  const markAsRead = async (id: string) => {
    try {
      await notificationService.update(id, { lue: true });
    } catch (error) {
      console.error('Erreur lors du marquage comme lue:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'responsable':
        return <Shield className="mt-1" />;
      case 'activite':
        return <Activity className="mt-1" />;
      case 'transaction':
        return <TrendingUp className="mt-1" />;
      default:
        return <Bell className="mt-1" />;
    }
  };

  const formatDate = (timestamp: Timestamp) => {
    if (!timestamp?.toDate) return '';
    return new Date(timestamp.toDate()).toLocaleString('fr-FR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[var(--zalama-primary)]"></div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4 text-[var(--zalama-blue)]">
        Alertes et notifications
        {notifications.some(n => !n.lue) && (
          <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs font-semibold text-white bg-[var(--zalama-danger)] rounded-full">
            {notifications.filter(n => !n.lue).length}
          </span>
        )}
      </h2>
      
      <div className="space-y-3">
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <div 
              key={notification.id}
              className={`relative p-5 rounded-xl transition-all duration-300 overflow-hidden group
                ${notification.lue 
                  ? 'bg-[var(--zalama-card)] border border-[var(--zalama-border)] shadow-sm hover:shadow-md' 
                  : 'bg-gradient-to-r from-[var(--zalama-bg-lighter)] to-[var(--zalama-bg-light)] border-l-4 border-[var(--zalama-blue)] shadow-md hover:shadow-lg'}
              `}
            >
              {/* Effet de surbrillance au survol */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[var(--zalama-blue-accent)]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              <div className="relative z-10 flex items-start gap-4">
                {/* Cercle de l'icône avec fond subtil */}
                <div className={`flex-shrink-0 mt-0.5 flex items-center justify-center h-10 w-10 rounded-full ${
                  notification.lue 
                    ? 'bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text-secondary)]' 
                    : 'bg-[var(--zalama-blue)]/10 text-[var(--zalama-blue)]'
                }`}>
                  {getNotificationIcon(notification.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <h3 className={`text-base font-medium leading-snug ${
                      notification.lue 
                        ? 'text-[var(--zalama-text)]' 
                        : 'text-[var(--zalama-blue)] font-semibold'
                    }`}>
                      {notification.titre}
                    </h3>
                    <span className="flex-shrink-0 text-xs text-[var(--zalama-text-secondary)] whitespace-nowrap ml-2">
                      {formatDate(notification.dateCreation)}
                    </span>
                  </div>
                  
                  <p className="mt-1.5 text-sm text-[var(--zalama-text-secondary)] leading-relaxed">
                    {notification.message}
                  </p>
                  
                  {!notification.lue && (
                    <div className="mt-3 flex items-center">
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="inline-flex items-center text-xs font-medium text-[var(--zalama-blue)] hover:text-[var(--zalama-blue-accent)] transition-colors group/button"
                      >
                        <span className="relative flex h-2 w-2 mr-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--zalama-blue)] opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--zalama-blue)]"></span>
                        </span>
                        <span className="group-hover/button:underline">Marquer comme lue</span>
                        <svg className="ml-1 w-3.5 h-3.5 transition-transform group-hover/button:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-[var(--zalama-text-secondary)]">
            Aucune notification pour le moment
          </div>
        )}

      </div>
    </div>
  );
}
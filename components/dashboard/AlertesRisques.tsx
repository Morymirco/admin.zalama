'use client';

import React, { useState } from 'react';
import { AlertTriangle, Shield, Activity, TrendingUp, Bell, ChevronDown, ChevronUp } from 'lucide-react';
import { useSupabaseCollection } from '@/hooks/useSupabaseCollection';
import { notificationService } from '@/services/notificationService';
import { Notification } from '@/services/notificationService';

// Interface déplacée vers types/notification.ts

export default function AlertesRisques() {
  const [showAll, setShowAll] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [allNotifications, setAllNotifications] = useState<Notification[]>([]);
  const [loadingMore, setLoadingMore] = useState(false);
  
  // Utiliser notre hook pour récupérer les notifications récentes
  const { data: notifications, loading, error, refresh } = useSupabaseCollection<Notification>(
    notificationService, 
    [], 
    { 
      cacheKey: 'recent-notifications',
      enableCache: true 
    }
  );

  // Limiter le nombre de notifications affichées
  const maxNotifications = 3;
  const displayedNotifications = showAll ? allNotifications : notifications.slice(0, maxNotifications);
  const hasMoreNotifications = showAll ? false : notifications.length > maxNotifications;

  const markAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      // Rafraîchir les données après le marquage
      window.location.reload();
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

  const formatDate = (timestamp: string | Date) => {
    if (!timestamp) return '';
    const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
    return date.toLocaleString('fr-FR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Charger toutes les notifications quand l'utilisateur clique sur "Voir plus"
  const loadAllNotifications = async () => {
    if (showAll) {
      setShowAll(false);
      setAllNotifications([]);
      return;
    }

    setLoadingMore(true);
    try {
      const allNotifs = await notificationService.getAll(3);
      setAllNotifications(allNotifs);
      setShowAll(true);
    } catch (error) {
      console.error('Erreur lors du chargement de toutes les notifications:', error);
    } finally {
      setLoadingMore(false);
    }
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
        {notifications.some(n => !n.lu) && (
          <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs font-semibold text-white bg-[var(--zalama-danger)] rounded-full">
            {notifications.filter(n => !n.lu).length}
          </span>
        )}
      </h2>
      
      <div className="space-y-3">
        {notifications.length > 0 ? (
          <>
            {/* Notifications affichées */}
            {displayedNotifications.map((notification) => (
              <div 
                key={notification.id}
                className={`relative p-5 rounded-xl transition-all duration-300 overflow-hidden group
                  ${notification.lu 
                    ? 'bg-[var(--zalama-card)] border border-[var(--zalama-border)] shadow-sm hover:shadow-md' 
                    : 'bg-gradient-to-r from-[var(--zalama-bg-lighter)] to-[var(--zalama-bg-light)] border-l-4 border-[var(--zalama-blue)] shadow-md hover:shadow-lg'}
                `}
              >
                {/* Effet de surbrillance au survol */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[var(--zalama-blue-accent)]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <div className="relative z-10 flex items-start gap-4">
                  {/* Cercle de l'icône avec fond subtil */}
                  <div className={`flex-shrink-0 mt-0.5 flex items-center justify-center h-10 w-10 rounded-full ${
                    notification.lu 
                      ? 'bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text-secondary)]' 
                      : 'bg-[var(--zalama-blue)]/10 text-[var(--zalama-blue)]'
                  }`}>
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <h3 className={`text-base font-medium leading-snug ${
                        notification.lu 
                          ? 'text-[var(--zalama-text)]' 
                          : 'text-[var(--zalama-blue)] font-semibold'
                      }`}>
                        {notification.titre}
                      </h3>
                      <span className="flex-shrink-0 text-xs text-[var(--zalama-text-secondary)] whitespace-nowrap ml-2">
                        {formatDate(notification.date_creation)}
                      </span>
                    </div>
                    
                    <p className="mt-1.5 text-sm text-[var(--zalama-text-secondary)] leading-relaxed">
                      {notification.message}
                    </p>
                    
                    {!notification.lu && (
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
            ))}

            {/* Bouton "Voir plus" ou "Voir moins" */}
            {hasMoreNotifications && (
              <div className="flex justify-center pt-2">
                <button
                  onClick={loadAllNotifications}
                  disabled={loadingMore}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-[var(--zalama-blue)] hover:text-[var(--zalama-blue-accent)] transition-colors rounded-lg hover:bg-[var(--zalama-bg-lighter)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loadingMore ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[var(--zalama-blue)]"></div>
                      Chargement...
                    </>
                  ) : showAll ? (
                    <>
                      <ChevronUp className="w-4 h-4" />
                      Voir moins
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4" />
                      Voir {notifications.length - maxNotifications} notification{notifications.length - maxNotifications > 1 ? 's' : ''} de plus
                    </>
                  )}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8 text-[var(--zalama-text-secondary)]">
            Aucune notification pour le moment
          </div>
        )}
      </div>
    </div>
  );
}
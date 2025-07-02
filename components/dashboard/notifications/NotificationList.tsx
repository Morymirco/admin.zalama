import React from 'react';
import { Notification } from '@/services/notificationService';
import { CheckCircle, X, AlertTriangle, Info } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface NotificationListProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  loading: boolean;
}

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'Succès':
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    case 'Erreur':
      return <AlertTriangle className="w-5 h-5 text-red-500" />;
    case 'Alerte':
      return <AlertTriangle className="w-5 h-5 text-orange-500" />;
    case 'Information':
    default:
      return <Info className="w-5 h-5 text-blue-500" />;
  }
};

const getNotificationColor = (type: string) => {
  switch (type) {
    case 'Succès':
      return 'border-l-green-500 bg-green-50 dark:bg-green-900/10';
    case 'Erreur':
      return 'border-l-red-500 bg-red-50 dark:bg-red-900/10';
    case 'Alerte':
      return 'border-l-orange-500 bg-orange-50 dark:bg-orange-900/10';
    case 'Information':
    default:
      return 'border-l-blue-500 bg-blue-50 dark:bg-blue-900/10';
  }
};

export default function NotificationList({ notifications, onMarkAsRead, onDelete, loading }: NotificationListProps) {
  if (loading) {
    return (
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-20 bg-[var(--zalama-bg-light)] rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <Info className="w-12 h-12 text-[var(--zalama-text-secondary)] mx-auto mb-4" />
          <p className="text-[var(--zalama-text-secondary)]">Aucune notification</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="space-y-1 p-2">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`relative p-4 rounded-lg border-l-4 transition-all duration-200 hover:shadow-md ${
              notification.lu 
                ? 'bg-[var(--zalama-bg-light)] border-l-[var(--zalama-border)]' 
                : getNotificationColor(notification.type)
            }`}
          >
            <div className="flex items-start gap-3">
              {/* Icône */}
              <div className="flex-shrink-0 mt-1">
                {getNotificationIcon(notification.type)}
              </div>
              
              {/* Contenu */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h4 className={`text-sm font-medium ${
                    notification.lu 
                      ? 'text-[var(--zalama-text-secondary)]' 
                      : 'text-[var(--zalama-text)]'
                  }`}>
                    {notification.titre}
                  </h4>
                  <div className="flex items-center gap-1">
                    {!notification.lu && (
                      <button
                        onClick={() => onMarkAsRead(notification.id)}
                        className="p-1 rounded-full hover:bg-[var(--zalama-bg-lighter)] transition-colors"
                        title="Marquer comme lue"
                      >
                        <CheckCircle className="w-4 h-4 text-[var(--zalama-success)]" />
                      </button>
                    )}
                    <button
                      onClick={() => onDelete(notification.id)}
                      className="p-1 rounded-full hover:bg-[var(--zalama-bg-lighter)] transition-colors"
                      title="Supprimer"
                    >
                      <X className="w-4 h-4 text-[var(--zalama-danger)]" />
                    </button>
                  </div>
                </div>
                
                <p className={`text-sm mt-1 ${
                  notification.lu 
                    ? 'text-[var(--zalama-text-secondary)]' 
                    : 'text-[var(--zalama-text)]'
                }`}>
                  {notification.message}
                </p>
                
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-[var(--zalama-text-secondary)]">
                    {formatDistanceToNow(new Date(notification.date_creation), { 
                      addSuffix: true, 
                      locale: fr 
                    })}
                  </span>
                  
                  {notification.date_lecture && (
                    <span className="text-xs text-[var(--zalama-text-secondary)]">
                      Lu {formatDistanceToNow(new Date(notification.date_lecture), { 
                        addSuffix: true, 
                        locale: fr 
                      })}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

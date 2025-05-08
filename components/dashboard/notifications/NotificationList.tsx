import React from 'react';
import { Notification, NotificationType } from './types';
import { CheckCircle, AlertTriangle, Info, AlertCircle, Check } from 'lucide-react';
import Link from 'next/link';
import { useTheme } from '@/contexts/ThemeContext';

interface NotificationListProps {
  notifications: Notification[];
  onMarkAsRead: (id: number) => void;
}

export default function NotificationList({ notifications, onMarkAsRead }: NotificationListProps) {
  const { theme } = useTheme();
  // Fonction pour formater la date
  const formatDate = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMins < 60) {
      return `Il y a ${diffMins} min`;
    } else if (diffHours < 24) {
      return `Il y a ${diffHours} h`;
    } else if (diffDays < 7) {
      return `Il y a ${diffDays} j`;
    } else {
      return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
    }
  };
  
  // Fonction pour obtenir l'icône selon le type
  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'info':
        return <Info className="w-5 h-5 text-blue-500" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-1" style={{scrollbarWidth: 'none'}}>
      {notifications.length === 0 ? (
        <div className={`flex flex-col items-center justify-center h-full ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
          <Info className="w-12 h-12 mb-2" />
          <p className="text-lg font-medium">Aucune notification</p>
          <p className="text-sm">Vous n&apos;avez aucune notification pour le moment</p>
        </div>
      ) : (
        <ul className="space-y-1">
          {notifications.map((notification) => (
            <li 
              key={notification.id} 
              className={`p-3 rounded-lg transition-colors ${
                notification.read 
                  ? 'bg-transparent hover:bg-[var(--zalama-bg-light)]' 
                  : 'bg-[var(--zalama-blue)]/5 hover:bg-[var(--zalama-blue)]/10'
              }`}
            >
              <div className="flex gap-3">
                <div className="flex-shrink-0 mt-1">
                  {getIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className={`text-sm font-medium ${notification.read ? (theme === 'dark' ? 'text-white' : 'text-gray-800') : 'text-blue-600'}`}>
                      {notification.title}
                    </h3>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <span className={`text-xs whitespace-nowrap ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        {formatDate(notification.timestamp)}
                      </span>
                      {!notification.read && (
                        <button
                          onClick={() => onMarkAsRead(notification.id)}
                          className={`p-1 rounded-full ${theme === 'dark' ? 'hover:bg-gray-700 text-gray-400 hover:text-white' : 'hover:bg-gray-200 text-gray-500 hover:text-gray-800'}`}
                          aria-label="Marquer comme lu"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                  <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                    {notification.message}
                  </p>
                  {notification.link && (
                    <Link 
                      href={notification.link}
                      className="inline-block mt-2 text-xs font-medium text-blue-600 hover:underline"
                    >
                      Voir les détails
                    </Link>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

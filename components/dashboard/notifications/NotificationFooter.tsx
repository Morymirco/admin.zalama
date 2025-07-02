import React from 'react';
import { CheckCircle, Trash2 } from 'lucide-react';

interface NotificationFooterProps {
  onMarkAllAsRead: () => Promise<void>;
  totalCount: number;
  unreadCount: number;
}

export default function NotificationFooter({ onMarkAllAsRead, totalCount, unreadCount }: NotificationFooterProps) {
  return (
    <div className="p-4 border-t border-[var(--zalama-border)] bg-[var(--zalama-bg-light)]">
      <div className="flex items-center justify-between">
        <div className="text-sm text-[var(--zalama-text-secondary)]">
          {totalCount} notification{totalCount > 1 ? 's' : ''}
          {unreadCount > 0 && (
            <span className="ml-2 text-[var(--zalama-blue)] font-medium">
              ({unreadCount} non lue{unreadCount > 1 ? 's' : ''})
            </span>
          )}
        </div>
        
        {unreadCount > 0 && (
          <button
            onClick={onMarkAllAsRead}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-[var(--zalama-blue)] hover:bg-[var(--zalama-blue)]/10 rounded-lg transition-colors"
          >
            <CheckCircle className="w-4 h-4" />
            Tout marquer comme lu
          </button>
        )}
      </div>
    </div>
  );
}

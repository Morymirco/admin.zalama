"use client";

import React from 'react';
import { MessageSquare, RefreshCw, Calendar } from 'lucide-react';

interface SMSMessage {
  id: string;
  to: string;
  message: string;
  sender_name: string;
  status: string;
  created_at: string;
  cost?: number;
}

interface ListeMessagesProps {
  messages: SMSMessage[];
  isLoading: boolean;
  smsBalance: { balance: number; currency: string } | null;
  onRefresh: () => void;
}

const ListeMessages: React.FC<ListeMessagesProps> = ({
  messages,
  isLoading,
  smsBalance,
  onRefresh
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'failed':
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'pending':
      case 'queued':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-[var(--zalama-card)] rounded-xl p-4 border border-[var(--zalama-border)]">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-[var(--zalama-text)]">Messages récents</h2>
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="flex items-center gap-1 px-2 py-1 text-xs bg-[var(--zalama-blue)] text-white rounded-md hover:bg-[var(--zalama-blue-accent)] transition-colors"
        >
          <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
          Actualiser
        </button>
      </div>
      
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-[var(--zalama-bg-lighter)] rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-[var(--zalama-bg-lighter)] rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : messages.length > 0 ? (
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {messages.map((message) => (
            <div key={message.id} className="p-2 bg-[var(--zalama-bg-lighter)] rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-medium text-[var(--zalama-text)] truncate">{message.to}</span>
                <span className={`px-1 py-0.5 text-xs rounded-full ${getStatusColor(message.status)}`}>
                  {message.status}
                </span>
              </div>
              <p className="text-xs text-[var(--zalama-text-secondary)] truncate mb-1">{message.message}</p>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[var(--zalama-text-secondary)] flex items-center gap-1">
                  <Calendar className="h-2 w-2" />
                  {formatDate(message.created_at)}
                </span>
                {message.cost && (
                  <span className="text-xs text-[var(--zalama-text-secondary)]">
                    {message.cost} {smsBalance?.currency}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-4 text-[var(--zalama-text-secondary)]">
          <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-xs">Aucun message récent</p>
        </div>
      )}
    </div>
  );
};

export default ListeMessages; 
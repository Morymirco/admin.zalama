"use client";

import React from 'react';
import { MessageSquare, Send, AlertCircle, RefreshCw } from 'lucide-react';

interface SMSBalance {
  balance: number;
  currency: string;
}

interface MessageStats {
  total: number;
  sent: number;
  failed: number;
  pending: number;
}

interface StatistiquesMarketingProps {
  smsBalance: SMSBalance | null;
  messageStats: MessageStats;
  loadingBalance: boolean;
  onRefreshBalance: () => void;
}

const StatistiquesMarketing: React.FC<StatistiquesMarketingProps> = ({
  smsBalance,
  messageStats,
  loadingBalance,
  onRefreshBalance
}) => {
  return (
    <div className="space-y-4">
      <div className="bg-[var(--zalama-card)] rounded-xl p-4 border border-[var(--zalama-border)]">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <MessageSquare className="h-5 w-5 text-[var(--zalama-blue)]" />
            <h3 className="text-sm font-semibold text-[var(--zalama-text)]">Solde SMS</h3>
          </div>
          <button
            onClick={onRefreshBalance}
            disabled={loadingBalance}
            className="p-1 hover:bg-[var(--zalama-bg-lighter)] rounded-md transition-colors"
          >
            <RefreshCw className={`h-3 w-3 text-[var(--zalama-text-secondary)] ${loadingBalance ? 'animate-spin' : ''}`} />
          </button>
        </div>
        {loadingBalance ? (
          <div className="animate-pulse">
            <div className="h-6 bg-[var(--zalama-bg-lighter)] rounded w-16"></div>
          </div>
        ) : (
          <div className="text-lg font-bold text-[var(--zalama-text)]">
            {smsBalance ? `${smsBalance.balance} ${smsBalance.currency}` : 'N/A'}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[var(--zalama-card)] rounded-xl p-4 border border-[var(--zalama-border)]">
          <div className="flex items-center gap-2 mb-1">
            <Send className="h-4 w-4 text-[var(--zalama-success)]" />
            <h3 className="text-xs font-medium text-[var(--zalama-text)]">Envoyés</h3>
          </div>
          <div className="text-lg font-bold text-[var(--zalama-success)]">{messageStats.sent}</div>
        </div>

        <div className="bg-[var(--zalama-card)] rounded-xl p-4 border border-[var(--zalama-border)]">
          <div className="flex items-center gap-2 mb-1">
            <AlertCircle className="h-4 w-4 text-[var(--zalama-warning)]" />
            <h3 className="text-xs font-medium text-[var(--zalama-text)]">Échoués</h3>
          </div>
          <div className="text-lg font-bold text-[var(--zalama-warning)]">{messageStats.failed}</div>
        </div>
      </div>
    </div>
  );
};

export default StatistiquesMarketing; 
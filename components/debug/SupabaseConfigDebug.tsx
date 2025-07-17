"use client";

import { supabaseConfig } from '@/lib/supabase-config';

export default function SupabaseConfigDebug() {
  return (
    <div className="fixed bottom-4 right-4 p-4 bg-[var(--zalama-bg)] border border-[var(--zalama-border)] rounded-lg shadow-lg max-w-sm">
      <h3 className="text-sm font-bold text-[var(--zalama-text)] mb-2">🔧 Supabase Config Debug</h3>
      <div className="text-xs text-[var(--zalama-text-secondary)] space-y-1">
        <div>
          <span className="font-medium">URL:</span>
          <div className="font-mono text-[var(--zalama-text)] break-all">
            {supabaseConfig.url}
          </div>
        </div>
        <div>
          <span className="font-medium">Anon Key (début):</span>
          <div className="font-mono text-[var(--zalama-text)]">
            {supabaseConfig.anonKey.substring(0, 20)}...
          </div>
        </div>
        <div>
          <span className="font-medium">Service Key (début):</span>
          <div className="font-mono text-[var(--zalama-text)]">
            {supabaseConfig.serviceKey.substring(0, 20)}...
          </div>
        </div>
        <div className="mt-2 pt-2 border-t border-[var(--zalama-border)]">
          <span className="text-xs text-green-400">✅ Configuration chargée</span>
        </div>
      </div>
    </div>
  );
} 
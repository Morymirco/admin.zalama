import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  accent?: string;
}

export default function StatCard({ label, value, icon, accent = 'bg-blue-600' }: StatCardProps) {
  return (
    <div className={`flex items-center gap-4 p-6 rounded-xl shadow-md bg-[var(--zalama-card)] border border-[var(--zalama-border)] min-w-[200px]`}>  
      <div className={`w-12 h-12 flex items-center justify-center rounded-full ${accent} bg-opacity-20 text-[var(--zalama-blue)] text-2xl`}>{icon}</div>
      <div>
        <div className="text-2xl font-bold text-[var(--zalama-text)]">{value}</div>
        <div className="text-[var(--zalama-text)]/70 text-sm">{label}</div>
      </div>
    </div>
  );
}

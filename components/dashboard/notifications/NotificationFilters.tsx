import React from 'react';
import { Badge } from '@/components/ui/badge';

interface NotificationFiltersProps {
  currentFilter: string;
  onFilterChange: (filter: string) => void;
  stats: {
    total: number;
    non_lues: number;
    par_type: Record<string, number>;
    recentes: number;
  };
}

const filterOptions = [
  { value: 'all', label: 'Toutes', color: 'bg-blue-100 text-blue-800' },
  { value: 'Information', label: 'Informations', color: 'bg-blue-100 text-blue-800' },
  { value: 'Alerte', label: 'Alertes', color: 'bg-red-100 text-red-800' },
  { value: 'Succès', label: 'Succès', color: 'bg-green-100 text-green-800' },
  { value: 'Erreur', label: 'Erreurs', color: 'bg-orange-100 text-orange-800' }
];

export default function NotificationFilters({ currentFilter, onFilterChange, stats }: NotificationFiltersProps) {
  return (
    <div className="p-4 border-b border-[var(--zalama-border)]">
      <div className="flex flex-wrap gap-2">
        {filterOptions.map((option) => {
          const count = option.value === 'all' 
            ? stats.total 
            : stats.par_type[option.value] || 0;
          
          return (
            <button
              key={option.value}
              onClick={() => onFilterChange(option.value)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                currentFilter === option.value
                  ? 'bg-[var(--zalama-blue)] text-white'
                  : 'bg-[var(--zalama-bg-light)] text-[var(--zalama-text-secondary)] hover:bg-[var(--zalama-bg-lighter)]'
              }`}
            >
              {option.label}
              {count > 0 && (
                <Badge 
                  variant="secondary" 
                  className="ml-1 text-xs"
                >
                  {count > 99 ? '99+' : count}
                </Badge>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

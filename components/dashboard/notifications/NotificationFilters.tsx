import React from 'react';
import { Filter, CheckCircle, AlertTriangle, Info, AlertCircle } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

interface NotificationFiltersProps {
  currentFilter: string;
  onFilterChange: (filter: string) => void;
}

export default function NotificationFilters({ currentFilter, onFilterChange }: NotificationFiltersProps) {
  const { theme } = useTheme();
  const filters = [
    { id: 'all', label: 'Toutes', icon: Filter },
    { id: 'info', label: 'Info', icon: Info, color: 'text-blue-500' },
    { id: 'success', label: 'Succès', icon: CheckCircle, color: 'text-green-500' },
    { id: 'warning', label: 'Avertissement', icon: AlertTriangle, color: 'text-amber-500' },
    { id: 'error', label: 'Erreur', icon: AlertCircle, color: 'text-red-500' }
  ];

  return (
    <div className="p-2 border-b border-[var(--zalama-border)] bg-[var(--zalama-bg-light)]/50">
      <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-hide" style={{scrollbarWidth: 'none'}}>
        {filters.map((filter) => {
          const isActive = currentFilter === filter.id;
          const Icon = filter.icon;
          
          return (
            <button
              key={filter.id}
              onClick={() => onFilterChange(filter.id)}
              className={`flex items-center px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${
                isActive 
                  ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' 
                  : theme === 'dark'
                    ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
              }`}
            >
              <Icon className={`w-4 h-4 mr-1.5 ${filter.color || ''}`} />
              {filter.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

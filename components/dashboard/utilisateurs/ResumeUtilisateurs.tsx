import React from 'react';
import { Users, UserCheck, UserPlus } from 'lucide-react';
import { ResumeSkeleton } from '@/components/ui/skeleton';

interface ResumeUtilisateursProps {
  totalUtilisateurs: number;
  utilisateursActifs: number;
  utilisateursInactifs: number;
  isLoading?: boolean;
}

const ResumeUtilisateurs: React.FC<ResumeUtilisateursProps> = ({ 
  totalUtilisateurs, 
  utilisateursActifs, 
  utilisateursInactifs,
  isLoading = false
}) => {
  if (isLoading) {
    return <ResumeSkeleton />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <div className="bg-[var(--zalama-card)] rounded-xl shadow-sm p-5 border border-[var(--zalama-border)]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-[var(--zalama-text-secondary)]">Total Employés</p>
            <p className="text-2xl font-bold text-[var(--zalama-text)]">{totalUtilisateurs}</p>
          </div>
          <div className="p-3 bg-[var(--zalama-blue)]/10 rounded-full">
            <Users className="h-6 w-6 text-[var(--zalama-blue)]" />
          </div>
        </div>
      </div>
      
      <div className="bg-[var(--zalama-card)] rounded-xl shadow-sm p-5 border border-[var(--zalama-border)]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-[var(--zalama-text-secondary)]">Employés Actifs</p>
            <p className="text-2xl font-bold text-[var(--zalama-success)]">
              {utilisateursActifs}
            </p>
          </div>
          <div className="p-3 bg-[var(--zalama-success)]/10 rounded-full">
            <UserCheck className="h-6 w-6 text-[var(--zalama-success)]" />
          </div>
        </div>
      </div>
      
      <div className="bg-[var(--zalama-card)] rounded-xl shadow-sm p-5 border border-[var(--zalama-border)]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-[var(--zalama-text-secondary)]">Employés Inactifs</p>
            <p className="text-2xl font-bold text-[var(--zalama-orange)]">
              {utilisateursInactifs}
            </p>
          </div>
          <div className="p-3 bg-[var(--zalama-orange)]/10 rounded-full">
            <UserPlus className="h-6 w-6 text-[var(--zalama-orange)]" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeUtilisateurs;

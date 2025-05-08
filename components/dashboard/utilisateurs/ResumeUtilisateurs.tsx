import React from 'react';
import { Users, UserCheck, UserPlus } from 'lucide-react';

interface ResumeUtilisateursProps {
  totalUtilisateurs: number;
  utilisateursActifs: number;
  nouveauxUtilisateurs: number;
}

const ResumeUtilisateurs: React.FC<ResumeUtilisateursProps> = ({ 
  totalUtilisateurs, 
  utilisateursActifs, 
  nouveauxUtilisateurs 
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <div className="bg-[var(--zalama-card)] rounded-xl shadow-sm p-5 border border-[var(--zalama-border)]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-[var(--zalama-text-secondary)]">Total Utilisateurs</p>
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
            <p className="text-sm text-[var(--zalama-text-secondary)]">Utilisateurs Actifs</p>
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
            <p className="text-sm text-[var(--zalama-text-secondary)]">Nouveaux ce mois</p>
            <p className="text-2xl font-bold text-[var(--zalama-warning)]">
              {nouveauxUtilisateurs}
            </p>
          </div>
          <div className="p-3 bg-[var(--zalama-warning)]/10 rounded-full">
            <UserPlus className="h-6 w-6 text-[var(--zalama-warning)]" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeUtilisateurs;

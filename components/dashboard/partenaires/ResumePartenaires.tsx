import React from 'react';
import { Building, Users, Tag, TrendingUp } from 'lucide-react';

interface ResumePartenairesProps {
  totalPartenaires: number;
  partenairesActifs: number;
  partenairesInactifs: number;
  nouveauxCeMois?: number;
  isLoading?: boolean;
}

const ResumePartenaires: React.FC<ResumePartenairesProps> = ({ 
  totalPartenaires, 
  partenairesActifs,
  partenairesInactifs,
  nouveauxCeMois = 0,
  isLoading = false
}) => {
  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold mb-4 text-[var(--zalama-text)]">Vue d'ensemble</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[var(--zalama-card)] rounded-xl shadow-sm p-5 border border-[var(--zalama-border)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[var(--zalama-text-secondary)]">Total Partenaires</p>
              <p className="text-2xl font-bold text-[var(--zalama-text)]">{totalPartenaires}</p>
            </div>
            <div className="p-3 bg-[var(--zalama-blue)]/10 rounded-full">
              <Building className="h-6 w-6 text-[var(--zalama-blue)]" />
            </div>
          </div>
        </div>
        
        <div className="bg-[var(--zalama-card)] rounded-xl shadow-sm p-5 border border-[var(--zalama-border)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[var(--zalama-text-secondary)]">Partenaires Actifs</p>
              <p className="text-2xl font-bold text-[var(--zalama-success)]">
                {partenairesActifs}
              </p>
            </div>
            <div className="p-3 bg-[var(--zalama-success)]/10 rounded-full">
              <Users className="h-6 w-6 text-[var(--zalama-success)]" />
            </div>
          </div>
        </div>
        
        <div className="bg-[var(--zalama-card)] rounded-xl shadow-sm p-5 border border-[var(--zalama-border)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[var(--zalama-text-secondary)]">Partenaires Inactifs</p>
              <p className="text-2xl font-bold text-[var(--zalama-danger)]">
                {partenairesInactifs}
              </p>
            </div>
            <div className="p-3 bg-[var(--zalama-danger)]/10 rounded-full">
              <Tag className="h-6 w-6 text-[var(--zalama-danger)]" />
            </div>
          </div>
        </div>

        <div className="bg-[var(--zalama-card)] rounded-xl shadow-sm p-5 border border-[var(--zalama-border)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[var(--zalama-text-secondary)]">Nouveaux ce mois</p>
              <p className="text-2xl font-bold text-[var(--zalama-warning)]">
                {nouveauxCeMois}
              </p>
            </div>
            <div className="p-3 bg-[var(--zalama-warning)]/10 rounded-full">
              <TrendingUp className="h-6 w-6 text-[var(--zalama-warning)]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumePartenaires;

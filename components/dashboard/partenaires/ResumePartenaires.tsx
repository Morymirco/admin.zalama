import React from 'react';
import { Building, Users, Tag } from 'lucide-react';

interface ResumePartenairesProps {
  totalPartenaires: number;
  partenairesActifs: number;
  partenairesInactifs: number;
  isLoading?: boolean;
}

const ResumePartenaires: React.FC<ResumePartenairesProps> = ({ 
  totalPartenaires, 
  partenairesActifs,
  partenairesInactifs,
  isLoading = false
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
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
    </div>
  );
};

export default ResumePartenaires;

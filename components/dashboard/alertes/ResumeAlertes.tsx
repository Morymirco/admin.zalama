import React from 'react';
import { AlertTriangle, CheckCircle, Clock } from 'lucide-react';

interface ResumeAlertesProps {
  totalAlertes: number;
  alertesResolues: number;
  alertesEnCours: number;
}

const ResumeAlertes: React.FC<ResumeAlertesProps> = ({ 
  totalAlertes, 
  alertesResolues, 
  alertesEnCours 
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <div className="bg-[var(--zalama-card)] rounded-xl shadow-sm p-5 border border-[var(--zalama-border)]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-[var(--zalama-text-secondary)]">Total Alertes</p>
            <p className="text-2xl font-bold text-[var(--zalama-text)]">{totalAlertes}</p>
          </div>
          <div className="p-3 bg-[var(--zalama-danger)]/10 rounded-full">
            <AlertTriangle className="h-6 w-6 text-[var(--zalama-danger)]" />
          </div>
        </div>
      </div>
      
      <div className="bg-[var(--zalama-card)] rounded-xl shadow-sm p-5 border border-[var(--zalama-border)]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-[var(--zalama-text-secondary)]">Alertes Résolues</p>
            <p className="text-2xl font-bold text-[var(--zalama-success)]">
              {alertesResolues}
            </p>
          </div>
          <div className="p-3 bg-[var(--zalama-success)]/10 rounded-full">
            <CheckCircle className="h-6 w-6 text-[var(--zalama-success)]" />
          </div>
        </div>
      </div>
      
      <div className="bg-[var(--zalama-card)] rounded-xl shadow-sm p-5 border border-[var(--zalama-border)]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-[var(--zalama-text-secondary)]">Alertes En Cours</p>
            <p className="text-2xl font-bold text-[var(--zalama-warning)]">
              {alertesEnCours}
            </p>
          </div>
          <div className="p-3 bg-[var(--zalama-warning)]/10 rounded-full">
            <Clock className="h-6 w-6 text-[var(--zalama-warning)]" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeAlertes;

import React from 'react';
import { Tag, Clock, BarChart } from 'lucide-react';

interface ResumeServicesProps {
  totalServices?: number;
  servicesDisponibles?: number;
  categories?: string[];
}

const ResumeServices: React.FC<ResumeServicesProps> = ({ 
  totalServices = 0, 
  servicesDisponibles = 0, 
  categories = [] 
}) => {
  // Vérification de sécurité
  const safeCategories = categories || [];
  const safeTotalServices = totalServices || 0;
  const safeServicesDisponibles = servicesDisponibles || 0;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <div className="bg-[var(--zalama-card)] rounded-xl shadow-sm p-5 border border-[var(--zalama-border)]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-[var(--zalama-text-secondary)]">Total Services</p>
            <p className="text-2xl font-bold text-[var(--zalama-text)]">{safeTotalServices}</p>
          </div>
          <div className="p-3 bg-[var(--zalama-blue)]/10 rounded-full">
            <Tag className="h-6 w-6 text-[var(--zalama-blue)]" />
          </div>
        </div>
      </div>
      
      <div className="bg-[var(--zalama-card)] rounded-xl shadow-sm p-5 border border-[var(--zalama-border)]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-[var(--zalama-text-secondary)]">Services Disponibles</p>
            <p className="text-2xl font-bold text-[var(--zalama-success)]">
              {safeServicesDisponibles}
            </p>
          </div>
          <div className="p-3 bg-[var(--zalama-success)]/10 rounded-full">
            <Clock className="h-6 w-6 text-[var(--zalama-success)]" />
          </div>
        </div>
      </div>
      
      <div className="bg-[var(--zalama-card)] rounded-xl shadow-sm p-5 border border-[var(--zalama-border)]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-[var(--zalama-text-secondary)]">Catégories</p>
            <p className="text-2xl font-bold text-[var(--zalama-blue)]">
              {safeCategories.length - 1} {/* -1 pour exclure 'toutes' */}
            </p>
          </div>
          <div className="p-3 bg-[var(--zalama-blue)]/10 rounded-full">
            <BarChart className="h-6 w-6 text-[var(--zalama-blue)]" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeServices;

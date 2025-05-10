import React from 'react';
import { CreditCard, Wallet, LineChart, BarChart, CheckCircle, XCircle, Clock } from 'lucide-react';

export default function ActiviteParService() {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4 text-[var(--zalama-blue)]">Activité par service</h2>
      
      {/* Grille des services */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {/* Avance */}
        <div className="bg-[var(--zalama-bg-light)] rounded-lg p-3 border border-[var(--zalama-border)]">
          <div className="flex justify-between items-center mb-1">
            <div className="text-sm text-[var(--zalama-text-secondary)]">Avance</div>
            <div className="bg-[var(--zalama-blue-light)] p-1 rounded-full">
              <CreditCard className="h-4 w-4 text-[var(--zalama-blue)]" />
            </div>
          </div>
          <div className="text-xl font-bold text-[var(--zalama-text)]">1240</div>
          <div className="w-full bg-[var(--zalama-bg)] h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-[var(--zalama-blue)] h-full" style={{ width: '45%' }}></div>
          </div>
        </div>
        
        {/* Pret P2P */}
        <div className="bg-[var(--zalama-bg-light)] rounded-lg p-3 border border-[var(--zalama-border)]">
          <div className="flex justify-between items-center mb-1">
            <div className="text-sm text-[var(--zalama-text-secondary)]">Pret P2P</div>
            <div className="bg-[var(--zalama-success-light)] p-1 rounded-full">
              <Wallet className="h-4 w-4 text-[var(--zalama-success)]" />
            </div>
          </div>
          <div className="text-xl font-bold text-[var(--zalama-text)]">620</div>
          <div className="w-full bg-[var(--zalama-bg)] h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-[var(--zalama-success)] h-full" style={{ width: '25%' }}></div>
          </div>
        </div>
        
        {/* Conseil Financier */}
        <div className="bg-[var(--zalama-bg-light)] rounded-lg p-3 border border-[var(--zalama-border)]">
          <div className="flex justify-between items-center mb-1">
            <div className="text-sm text-[var(--zalama-text-secondary)]">Conseil Financier</div>
            <div className="bg-[var(--zalama-warning-light)] p-1 rounded-full">
              <LineChart className="h-4 w-4 text-[var(--zalama-warning)]" />
            </div>
          </div>
          <div className="text-xl font-bold text-[var(--zalama-text)]">510</div>
          <div className="w-full bg-[var(--zalama-bg)] h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-[var(--zalama-warning)] h-full" style={{ width: '20%' }}></div>
          </div>
        </div>
        
        {/* Marketing */}
        <div className="bg-[var(--zalama-bg-light)] rounded-lg p-3 border border-[var(--zalama-border)]">
          <div className="flex justify-between items-center mb-1">
            <div className="text-sm text-[var(--zalama-text-secondary)]">Marketing</div>
            <div className="bg-[var(--zalama-purple-light)] p-1 rounded-full">
              <BarChart className="h-4 w-4 text-[var(--zalama-purple)]" />
            </div>
          </div>
          <div className="text-xl font-bold text-[var(--zalama-text)]">350</div>
          <div className="w-full bg-[var(--zalama-bg)] h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-[var(--zalama-purple)] h-full" style={{ width: '15%' }}></div>
          </div>
        </div>
      </div>
      
      {/* Statut des demandes */}
      <div className="bg-[var(--zalama-bg-light)] rounded-lg p-3 border border-[var(--zalama-border)]">
        <div className="text-sm font-medium mb-3 text-[var(--zalama-text)]">Statut des demandes</div>
        <div className="grid grid-cols-3 gap-2">
          {/* Approuvés */}
          <div className="flex items-center gap-2">
            <div className="bg-[var(--zalama-success-light)] p-1 rounded-full">
              <CheckCircle className="h-4 w-4 text-[var(--zalama-success)]" />
            </div>
            <div>
              <div className="text-base font-bold text-[var(--zalama-text)]">20</div>
              <div className="text-xs text-[var(--zalama-text-secondary)]">Approuvés</div>
            </div>
          </div>
          
          {/* Rejetés */}
          <div className="flex items-center gap-2">
            <div className="bg-[var(--zalama-danger-light)] p-1 rounded-full">
              <XCircle className="h-4 w-4 text-[var(--zalama-danger)]" />
            </div>
            <div>
              <div className="text-base font-bold text-[var(--zalama-text)]">40</div>
              <div className="text-xs text-[var(--zalama-text-secondary)]">Rejetés</div>
            </div>
          </div>
          
          {/* En Cours */}
          <div className="flex items-center gap-2">
            <div className="bg-[var(--zalama-warning-light)] p-1 rounded-full">
              <Clock className="h-4 w-4 text-[var(--zalama-warning)]" />
            </div>
            <div>
              <div className="text-base font-bold text-[var(--zalama-text)]">30</div>
              <div className="text-xs text-[var(--zalama-text-secondary)]">En Cours</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

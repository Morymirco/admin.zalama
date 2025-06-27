"use client";

import React from 'react';
import { useSupabasePartnershipRequests } from '@/hooks/useSupabasePartnershipRequests';
import StatistiquesDemandes from '@/components/dashboard/StatistiquesDemandes';
import TableauDemandes from '@/components/dashboard/TableauDemandes';
import { RefreshCw, FileText } from 'lucide-react';

export default function DemandesPage() {
  const {
    requests,
    stats,
    loading,
    error,
    filters,
    updateFilters,
    approveRequest,
    rejectRequest,
    setInReview,
    deleteRequest,
    searchRequests,
    refresh
  } = useSupabasePartnershipRequests();

  const handleSearch = (term: string) => {
    if (term.trim()) {
      searchRequests(term);
    } else {
      refresh();
    }
  };

  const handleFilterByStatus = (status: string) => {
    updateFilters({ status: status as any });
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* En-tête de la page */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--zalama-text)] flex items-center gap-2">
            <FileText className="w-6 h-6 text-[var(--zalama-blue)]" />
            Demandes de Partenariat
          </h1>
          <p className="text-[var(--zalama-text-secondary)] mt-1">
            Gérez les demandes de partenariat et suivez leur progression
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={refresh}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 bg-[var(--zalama-blue)] hover:bg-[var(--zalama-blue-accent)] text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </button>
        </div>
      </div>

      {/* Affichage des erreurs */}
      {error && (
        <div className="bg-[var(--zalama-danger)]/10 border border-[var(--zalama-danger)]/30 rounded-lg p-4">
          <p className="text-[var(--zalama-danger)] text-sm">
            Erreur: {error}
          </p>
        </div>
      )}

      {/* Statistiques */}
      <div className="bg-[var(--zalama-card)] rounded-xl shadow-sm p-5 border border-[var(--zalama-border)]">
        <StatistiquesDemandes stats={stats} />
      </div>

      {/* Tableau des demandes */}
      <div className="bg-[var(--zalama-card)] rounded-xl shadow-sm p-5 border border-[var(--zalama-border)]">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-[var(--zalama-text)] mb-2">
            Liste des Demandes
          </h2>
          <p className="text-[var(--zalama-text-secondary)] text-sm">
            {requests.length} demande{requests.length !== 1 ? 's' : ''} trouvée{requests.length !== 1 ? 's' : ''}
          </p>
        </div>
        
        <TableauDemandes
          requests={requests}
          loading={loading}
          onApprove={approveRequest}
          onReject={rejectRequest}
          onSetInReview={setInReview}
          onDelete={deleteRequest}
          onSearch={handleSearch}
          onFilterByStatus={handleFilterByStatus}
        />
      </div>

      {/* Informations supplémentaires */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Guide des statuts */}
        <div className="bg-[var(--zalama-card)] rounded-xl shadow-sm p-5 border border-[var(--zalama-border)]">
          <h3 className="text-lg font-semibold text-[var(--zalama-text)] mb-4">
            Guide des Statuts
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-[var(--zalama-warning)] rounded-full"></div>
              <div>
                <p className="text-sm font-medium text-[var(--zalama-text)]">En attente</p>
                <p className="text-xs text-[var(--zalama-text-secondary)]">Demande soumise, en attente de traitement</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-[var(--zalama-blue)] rounded-full"></div>
              <div>
                <p className="text-sm font-medium text-[var(--zalama-text)]">En révision</p>
                <p className="text-xs text-[var(--zalama-text-secondary)]">Demande en cours d'analyse approfondie</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-[var(--zalama-success)] rounded-full"></div>
              <div>
                <p className="text-sm font-medium text-[var(--zalama-text)]">Approuvée</p>
                <p className="text-xs text-[var(--zalama-text-secondary)]">Demande acceptée, partenariat validé</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-[var(--zalama-danger)] rounded-full"></div>
              <div>
                <p className="text-sm font-medium text-[var(--zalama-text)]">Rejetée</p>
                <p className="text-xs text-[var(--zalama-text-secondary)]">Demande refusée, partenariat non validé</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions rapides */}
        <div className="bg-[var(--zalama-card)] rounded-xl shadow-sm p-5 border border-[var(--zalama-border)]">
          <h3 className="text-lg font-semibold text-[var(--zalama-text)] mb-4">
            Actions Rapides
          </h3>
          <div className="space-y-3">
            <button
              onClick={() => updateFilters({ status: 'pending' })}
              className="w-full text-left p-3 bg-[var(--zalama-bg-light)] hover:bg-[var(--zalama-bg-lighter)] rounded-lg transition-colors"
            >
              <p className="text-sm font-medium text-[var(--zalama-text)]">Voir les demandes en attente</p>
              <p className="text-xs text-[var(--zalama-text-secondary)]">{stats.pending} demande{stats.pending !== 1 ? 's' : ''}</p>
            </button>
            <button
              onClick={() => updateFilters({ status: 'in_review' })}
              className="w-full text-left p-3 bg-[var(--zalama-bg-light)] hover:bg-[var(--zalama-bg-lighter)] rounded-lg transition-colors"
            >
              <p className="text-sm font-medium text-[var(--zalama-text)]">Voir les demandes en révision</p>
              <p className="text-xs text-[var(--zalama-text-secondary)]">{stats.in_review} demande{stats.in_review !== 1 ? 's' : ''}</p>
            </button>
            <button
              onClick={() => updateFilters({ status: 'approved' })}
              className="w-full text-left p-3 bg-[var(--zalama-bg-light)] hover:bg-[var(--zalama-bg-lighter)] rounded-lg transition-colors"
            >
              <p className="text-sm font-medium text-[var(--zalama-text)]">Voir les partenariats approuvés</p>
              <p className="text-xs text-[var(--zalama-text-secondary)]">{stats.approved} partenariat{stats.approved !== 1 ? 's' : ''}</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

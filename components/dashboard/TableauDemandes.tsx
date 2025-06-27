"use client";

import React, { useState } from 'react';
import { PartnershipRequest } from '@/types/partnershipRequest';
import { CheckCircle, XCircle, Clock, Eye, Search, Filter, MoreVertical, Calendar, Users, Building, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface TableauDemandesProps {
  requests: PartnershipRequest[];
  loading: boolean;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onSetInReview: (id: string) => void;
  onDelete: (id: string) => void;
  onSearch: (term: string) => void;
  onFilterByStatus: (status: string) => void;
}

const TableauDemandes: React.FC<TableauDemandesProps> = ({
  requests,
  loading,
  onApprove,
  onReject,
  onSetInReview,
  onDelete,
  onSearch,
  onFilterByStatus
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: {
        label: 'En attente',
        color: 'bg-[var(--zalama-warning)]/20 text-[var(--zalama-warning)] border-[var(--zalama-warning)]/30',
        icon: <Clock className="w-4 h-4" />
      },
      approved: {
        label: 'Approuvée',
        color: 'bg-[var(--zalama-success)]/20 text-[var(--zalama-success)] border-[var(--zalama-success)]/30',
        icon: <CheckCircle className="w-4 h-4" />
      },
      rejected: {
        label: 'Rejetée',
        color: 'bg-[var(--zalama-danger)]/20 text-[var(--zalama-danger)] border-[var(--zalama-danger)]/30',
        icon: <XCircle className="w-4 h-4" />
      },
      in_review: {
        label: 'En révision',
        color: 'bg-[var(--zalama-blue)]/20 text-[var(--zalama-blue)] border-[var(--zalama-blue)]/30',
        icon: <Eye className="w-4 h-4" />
      }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${config.color}`}>
        {config.icon}
        {config.label}
      </span>
    );
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  const handleStatusFilter = (status: string) => {
    setSelectedStatus(status);
    onFilterByStatus(status);
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy à HH:mm', { locale: fr });
    } catch {
      return 'Date invalide';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--zalama-blue)]"></div>
        <span className="ml-3 text-[var(--zalama-text-secondary)]">Chargement des demandes...</span>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="w-12 h-12 text-[var(--zalama-text-secondary)] mx-auto mb-4" />
        <h3 className="text-lg font-medium text-[var(--zalama-text)] mb-2">
          Aucune demande trouvée
        </h3>
        <p className="text-[var(--zalama-text-secondary)]">
          Il n'y a actuellement aucune demande de partenariat à afficher.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Barre de recherche et filtres */}
      <div className="flex flex-col sm:flex-row gap-4">
        <form onSubmit={handleSearch} className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--zalama-text-secondary)]" />
            <input
              type="text"
              placeholder="Rechercher par nom d'entreprise, représentant..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[var(--zalama-bg-light)] border border-[var(--zalama-border)] rounded-lg text-[var(--zalama-text)] placeholder-[var(--zalama-text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--zalama-blue)]/20"
            />
          </div>
        </form>

        <div className="flex gap-2">
          <select
            value={selectedStatus}
            onChange={(e) => handleStatusFilter(e.target.value)}
            className="px-3 py-2 bg-[var(--zalama-bg-light)] border border-[var(--zalama-border)] rounded-lg text-[var(--zalama-text)] focus:outline-none focus:ring-2 focus:ring-[var(--zalama-blue)]/20"
          >
            <option value="all">Tous les statuts</option>
            <option value="pending">En attente</option>
            <option value="in_review">En révision</option>
            <option value="approved">Approuvées</option>
            <option value="rejected">Rejetées</option>
          </select>
        </div>
      </div>

      {/* Tableau */}
      <div className="bg-[var(--zalama-card)] rounded-lg border border-[var(--zalama-border)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[var(--zalama-bg-darker)]">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--zalama-text-secondary)] uppercase tracking-wider">
                  Entreprise
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--zalama-text-secondary)] uppercase tracking-wider">
                  Représentant
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--zalama-text-secondary)] uppercase tracking-wider">
                  Domaine
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--zalama-text-secondary)] uppercase tracking-wider">
                  Employés
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--zalama-text-secondary)] uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--zalama-text-secondary)] uppercase tracking-wider">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--zalama-text-secondary)] uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--zalama-border)]">
              {requests.map((request) => (
                <React.Fragment key={request.id}>
                  <tr className="hover:bg-[var(--zalama-bg-light)] transition-colors">
                    <td className="px-4 py-4">
                      <div>
                        <div className="font-medium text-[var(--zalama-text)]">
                          {request.company_name}
                        </div>
                        <div className="text-sm text-[var(--zalama-text-secondary)]">
                          {request.legal_status} • {request.rccm}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div>
                        <div className="font-medium text-[var(--zalama-text)]">
                          {request.rep_full_name}
                        </div>
                        <div className="text-sm text-[var(--zalama-text-secondary)]">
                          {request.rep_position}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-[var(--zalama-text)]">
                        {request.activity_domain}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4 text-[var(--zalama-text-secondary)]" />
                        <span className="text-[var(--zalama-text)]">
                          {request.employees_count}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      {getStatusBadge(request.status)}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4 text-[var(--zalama-text-secondary)]" />
                        <span className="text-sm text-[var(--zalama-text-secondary)]">
                          {formatDate(request.created_at)}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        {request.status === 'pending' && (
                          <>
                            <button
                              onClick={() => onApprove(request.id)}
                              className="p-1 text-[var(--zalama-success)] hover:bg-[var(--zalama-success)]/10 rounded"
                              title="Approuver"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => onReject(request.id)}
                              className="p-1 text-[var(--zalama-danger)] hover:bg-[var(--zalama-danger)]/10 rounded"
                              title="Rejeter"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => onSetInReview(request.id)}
                              className="p-1 text-[var(--zalama-blue)] hover:bg-[var(--zalama-blue)]/10 rounded"
                              title="Mettre en révision"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => setExpandedRow(expandedRow === request.id ? null : request.id)}
                          className="p-1 text-[var(--zalama-text-secondary)] hover:bg-[var(--zalama-bg-light)] rounded"
                          title="Voir détails"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                  
                  {/* Ligne détaillée */}
                  {expandedRow === request.id && (
                    <tr>
                      <td colSpan={7} className="px-4 py-4 bg-[var(--zalama-bg-light)]">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {/* Informations de l'entreprise */}
                          <div>
                            <h4 className="font-medium text-[var(--zalama-text)] mb-2 flex items-center gap-2">
                              <Building className="w-4 h-4" />
                              Informations de l'entreprise
                            </h4>
                            <div className="space-y-1 text-sm">
                              <div><span className="text-[var(--zalama-text-secondary)]">Adresse:</span> {request.headquarters_address}</div>
                              <div><span className="text-[var(--zalama-text-secondary)]">Téléphone:</span> {request.phone}</div>
                              <div><span className="text-[var(--zalama-text-secondary)]">Email:</span> {request.email}</div>
                              <div><span className="text-[var(--zalama-text-secondary)]">NIF:</span> {request.nif}</div>
                              <div><span className="text-[var(--zalama-text-secondary)]">Masse salariale:</span> {request.payroll}</div>
                            </div>
                          </div>

                          {/* Informations du représentant */}
                          <div>
                            <h4 className="font-medium text-[var(--zalama-text)] mb-2">Représentant</h4>
                            <div className="space-y-1 text-sm">
                              <div><span className="text-[var(--zalama-text-secondary)]">Email:</span> {request.rep_email}</div>
                              <div><span className="text-[var(--zalama-text-secondary)]">Téléphone:</span> {request.rep_phone}</div>
                            </div>
                          </div>

                          {/* Informations RH */}
                          <div>
                            <h4 className="font-medium text-[var(--zalama-text)] mb-2">Responsable RH</h4>
                            <div className="space-y-1 text-sm">
                              <div><span className="text-[var(--zalama-text-secondary)]">Nom:</span> {request.hr_full_name}</div>
                              <div><span className="text-[var(--zalama-text-secondary)]">Email:</span> {request.hr_email}</div>
                              <div><span className="text-[var(--zalama-text-secondary)]">Téléphone:</span> {request.hr_phone}</div>
                            </div>
                          </div>

                          {/* Détails employés */}
                          <div>
                            <h4 className="font-medium text-[var(--zalama-text)] mb-2">Détails employés</h4>
                            <div className="space-y-1 text-sm">
                              <div><span className="text-[var(--zalama-text-secondary)]">CDI:</span> {request.cdi_count}</div>
                              <div><span className="text-[var(--zalama-text-secondary)]">CDD:</span> {request.cdd_count}</div>
                              <div><span className="text-[var(--zalama-text-secondary)]">Date de paiement:</span> {request.payment_date}</div>
                            </div>
                          </div>

                          {/* Accord */}
                          <div>
                            <h4 className="font-medium text-[var(--zalama-text)] mb-2">Accord</h4>
                            <div className="text-sm">
                              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                                request.agreement 
                                  ? 'bg-[var(--zalama-success)]/20 text-[var(--zalama-success)]' 
                                  : 'bg-[var(--zalama-danger)]/20 text-[var(--zalama-danger)]'
                              }`}>
                                {request.agreement ? 'Accepté' : 'Non accepté'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TableauDemandes; 
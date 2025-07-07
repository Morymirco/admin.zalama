import React, { useState } from 'react';
import { Search, Users, Calendar, CheckCircle, XCircle, Eye, MoreHorizontal, Download, FileText, Building } from 'lucide-react';
import { PartnershipRequest } from '@/types/partnership';
import { PDFService } from '@/services/pdfService';
import { toast } from 'react-hot-toast';
import DetailDemandeModal from './DetailDemandeModal';

interface TableauDemandesProps {
  requests: PartnershipRequest[];
  loading: boolean;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onSetInReview: (id: string) => void;
  onDelete: (id: string) => void;
  onSearch: (term: string) => void;
  onFilterByStatus: (status: string) => void;
  onAddPartner?: (request: PartnershipRequest) => void;
}

const TableauDemandes: React.FC<TableauDemandesProps> = ({
  requests,
  loading,
  onApprove,
  onReject,
  onSetInReview,
  onDelete,
  onSearch,
  onFilterByStatus,
  onAddPartner
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState<PartnershipRequest | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'En attente', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
      in_review: { label: 'En révision', color: 'bg-blue-100 text-blue-800 border-blue-200' },
      approved: { label: 'Approuvée', color: 'bg-green-100 text-green-800 border-green-200' },
      rejected: { label: 'Rejetée', color: 'bg-red-100 text-red-800 border-red-200' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.color}`}>
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
      return new Date(dateString).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Date invalide';
    }
  };

  const handleExportPDF = (request: PartnershipRequest) => {
    try {
      PDFService.generatePartnershipRequestPDF(request);
      toast.success('PDF généré avec succès');
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
      toast.error('Erreur lors de la génération du PDF');
    }
  };

  const handleExportAllPDF = () => {
    try {
      PDFService.generateMultipleRequestsPDF(requests);
      toast.success('PDF de la liste généré avec succès');
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
      toast.error('Erreur lors de la génération du PDF');
    }
  };

  const handleViewDetails = (request: PartnershipRequest) => {
    setSelectedRequest(request);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRequest(null);
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
          
          <button
            onClick={handleExportAllPDF}
            className="flex items-center gap-2 px-3 py-2 bg-[var(--zalama-success)] hover:bg-[var(--zalama-success)]/80 text-white rounded-lg transition-colors"
            title="Exporter toutes les demandes en PDF"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export PDF</span>
          </button>
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
                <tr key={request.id} className="hover:bg-[var(--zalama-bg-light)] transition-colors">
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
                      {/* Bouton Voir détails */}
                      <button
                        onClick={() => handleViewDetails(request)}
                        className="p-1 text-[var(--zalama-blue)] hover:bg-[var(--zalama-blue)]/10 rounded"
                        title="Voir les détails"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {/* Bouton Export PDF */}
                      <button
                        onClick={() => handleExportPDF(request)}
                        className="p-1 text-[var(--zalama-success)] hover:bg-[var(--zalama-success)]/10 rounded"
                        title="Exporter en PDF"
                      >
                        <Download className="w-4 h-4" />
                      </button>

                      {/* Actions conditionnelles pour les demandes en attente */}
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
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </>
                      )}

                      {/* Action pour ajouter le partenaire après approbation */}
                      {request.status === 'approved' && onAddPartner && (
                        <button
                          onClick={() => onAddPartner(request)}
                          className="p-1 text-[var(--zalama-blue)] hover:bg-[var(--zalama-blue)]/10 rounded"
                          title="Ajouter le partenaire"
                        >
                          <Building className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de détails */}
      <DetailDemandeModal
        request={selectedRequest}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onApprove={onApprove}
        onReject={onReject}
        onSetInReview={onSetInReview}
      />
    </div>
  );
};

export default TableauDemandes; 
import { PDFService } from '@/services/pdfService';
import { PartnershipRequest } from '@/types/partnership';
import { Building2, Calendar, CheckCircle, Download, Eye, FileText, Mail, MapPin, Phone, User, Users, X, XCircle } from 'lucide-react';
import React from 'react';
import { toast } from 'react-hot-toast';

interface DetailDemandeModalProps {
  request: PartnershipRequest | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  onSetInReview?: (id: string) => void;
}

const DetailDemandeModal: React.FC<DetailDemandeModalProps> = ({
  request,
  isOpen,
  onClose,
  onApprove,
  onReject,
  onSetInReview
}) => {
  if (!isOpen || !request) return null;

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Date invalide';
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'En attente', color: 'bg-[var(--zalama-warning)]/10 text-[var(--zalama-warning)] border-[var(--zalama-warning)]/20' },
      in_review: { label: 'En révision', color: 'bg-[var(--zalama-blue)]/10 text-[var(--zalama-blue)] border-[var(--zalama-blue)]/20' },
      approved: { label: 'Approuvée', color: 'bg-[var(--zalama-success)]/10 text-[var(--zalama-success)] border-[var(--zalama-success)]/20' },
      rejected: { label: 'Rejetée', color: 'bg-[var(--zalama-danger)]/10 text-[var(--zalama-danger)] border-[var(--zalama-danger)]/20' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const handleExportPDF = () => {
    try {
      PDFService.generatePartnershipRequestPDF(request);
      toast.success('PDF généré avec succès');
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
      toast.error('Erreur lors de la génération du PDF');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-4xl bg-[var(--zalama-card)] rounded-xl shadow-xl border border-[var(--zalama-border)] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-[var(--zalama-border)] bg-[var(--zalama-bg-light)]">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[var(--zalama-blue)]/10 rounded-lg">
                <Building2 className="w-6 h-6 text-[var(--zalama-blue)]" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[var(--zalama-text)]">Détails de la Demande</h2>
                <p className="text-[var(--zalama-text-secondary)] text-sm">{request.company_name}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleExportPDF}
                className="p-2 text-[var(--zalama-text-secondary)] hover:text-[var(--zalama-text)] hover:bg-[var(--zalama-bg)] rounded-lg transition-colors"
                title="Exporter en PDF"
              >
                <Download className="w-5 h-5" />
              </button>
              <button
                onClick={onClose}
                className="p-2 text-[var(--zalama-text-secondary)] hover:text-[var(--zalama-text)] hover:bg-[var(--zalama-bg)] rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 max-h-[70vh] overflow-y-auto">
            {/* Status and Actions */}
            <div className="flex items-center justify-between mb-6 p-4 bg-[var(--zalama-bg-light)] rounded-xl border border-[var(--zalama-border)]">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-[var(--zalama-text-secondary)]">Statut:</span>
                {getStatusBadge(request.status)}
              </div>
              {request.status === 'pending' && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onApprove?.(request.id)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-[var(--zalama-success)] hover:bg-[var(--zalama-success)]/80 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Approuver</span>
                  </button>
                  <button
                    onClick={() => onReject?.(request.id)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-[var(--zalama-danger)] hover:bg-[var(--zalama-danger)]/80 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Rejeter</span>
                  </button>
                  <button
                    onClick={() => onSetInReview?.(request.id)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-[var(--zalama-blue)] hover:bg-[var(--zalama-blue-accent)] text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    <span>En révision</span>
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Informations de l'entreprise */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-lg font-semibold text-[var(--zalama-text)]">
                  <Building2 className="w-5 h-5 text-[var(--zalama-blue)]" />
                  <span>Informations de l'entreprise</span>
                </div>
                
                <div className="bg-[var(--zalama-bg-light)] border border-[var(--zalama-border)] rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <Building2 className="w-4 h-4 text-[var(--zalama-text-secondary)]" />
                    <div>
                      <p className="text-sm text-[var(--zalama-text-secondary)]">Nom de l'entreprise</p>
                      <p className="font-medium text-[var(--zalama-text)]">{request.company_name}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-sm text-[var(--zalama-text-secondary)]">Statut légal</p>
                      <p className="font-medium text-[var(--zalama-text)]">{request.legal_status}</p>
                    </div>
                    <div>
                      <p className="text-sm text-[var(--zalama-text-secondary)]">RCCM</p>
                      <p className="font-medium text-[var(--zalama-text)]">{request.rccm}</p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-[var(--zalama-text-secondary)]">NIF</p>
                    <p className="font-medium text-[var(--zalama-text)]">{request.nif}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-[var(--zalama-text-secondary)]">Domaine d'activité</p>
                    <p className="font-medium text-[var(--zalama-text)]">{request.activity_domain}</p>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-[var(--zalama-text-secondary)] mt-0.5" />
                    <div>
                      <p className="text-sm text-[var(--zalama-text-secondary)]">Adresse du siège</p>
                      <p className="font-medium text-[var(--zalama-text)]">{request.headquarters_address}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-[var(--zalama-text-secondary)]" />
                    <div>
                      <p className="text-sm text-[var(--zalama-text-secondary)]">Téléphone</p>
                      <p className="font-medium text-[var(--zalama-text)]">{request.phone}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-[var(--zalama-text-secondary)]" />
                    <div>
                      <p className="text-sm text-[var(--zalama-text-secondary)]">Email</p>
                      <p className="font-medium text-[var(--zalama-text)]">{request.email}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Informations RH */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-lg font-semibold text-[var(--zalama-text)]">
                  <Users className="w-5 h-5 text-[var(--zalama-success)]" />
                  <span>Informations RH</span>
                </div>
                
                <div className="bg-[var(--zalama-bg-light)] border border-[var(--zalama-border)] rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <Users className="w-4 h-4 text-[var(--zalama-text-secondary)]" />
                    <div>
                      <p className="text-sm text-[var(--zalama-text-secondary)]">Responsable RH</p>
                      <p className="font-medium text-[var(--zalama-text)]">{request.hr_full_name}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-[var(--zalama-text-secondary)]" />
                    <div>
                      <p className="text-sm text-[var(--zalama-text-secondary)]">Email RH</p>
                      <p className="font-medium text-[var(--zalama-text)]">{request.hr_email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-[var(--zalama-text-secondary)]" />
                    <div>
                      <p className="text-sm text-[var(--zalama-text-secondary)]">Téléphone RH</p>
                      <p className="font-medium text-[var(--zalama-text)]">{request.hr_phone}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-[var(--zalama-text-secondary)]" />
                    <div>
                      <p className="text-sm text-[var(--zalama-text-secondary)]">Accord aux conditions</p>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        request.agreement 
                          ? 'bg-[var(--zalama-success)]/10 text-[var(--zalama-success)]' 
                          : 'bg-[var(--zalama-danger)]/10 text-[var(--zalama-danger)]'
                      }`}>
                        {request.agreement ? 'Oui' : 'Non'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Informations du représentant */}
            <div className="mt-6 space-y-4">
              <div className="flex items-center gap-2 text-lg font-semibold text-[var(--zalama-text)]">
                <User className="w-5 h-5 text-[var(--zalama-warning)]" />
                <span>Informations du représentant</span>
              </div>
              
              <div className="bg-[var(--zalama-bg-light)] border border-[var(--zalama-border)] rounded-xl p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-[var(--zalama-text-secondary)]">Nom complet</p>
                    <p className="font-medium text-[var(--zalama-text)]">{request.rep_full_name}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-[var(--zalama-text-secondary)]">Poste</p>
                    <p className="font-medium text-[var(--zalama-text)]">{request.rep_position}</p>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-[var(--zalama-text-secondary)]" />
                    <div>
                      <p className="text-sm text-[var(--zalama-text-secondary)]">Email</p>
                      <p className="font-medium text-[var(--zalama-text)]">{request.rep_email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-[var(--zalama-text-secondary)]" />
                    <div>
                      <p className="text-sm text-[var(--zalama-text-secondary)]">Téléphone</p>
                      <p className="font-medium text-[var(--zalama-text)]">{request.rep_phone}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Statistiques employés */}
            <div className="mt-6 space-y-4">
              <div className="flex items-center gap-2 text-lg font-semibold text-[var(--zalama-text)]">
                <Users className="w-5 h-5 text-[var(--zalama-blue)]" />
                <span>Statistiques employés</span>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-[var(--zalama-bg-light)] border border-[var(--zalama-border)] rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-[var(--zalama-blue)]">{request.employees_count}</div>
                  <div className="text-sm text-[var(--zalama-text-secondary)]">Total employés</div>
                </div>
                
                <div className="bg-[var(--zalama-bg-light)] border border-[var(--zalama-border)] rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-[var(--zalama-success)]">{request.cdi_count}</div>
                  <div className="text-sm text-[var(--zalama-text-secondary)]">CDI</div>
                </div>
                
                <div className="bg-[var(--zalama-bg-light)] border border-[var(--zalama-border)] rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-[var(--zalama-warning)]">{request.cdd_count}</div>
                  <div className="text-sm text-[var(--zalama-text-secondary)]">CDD</div>
                </div>
                
                <div className="bg-[var(--zalama-bg-light)] border border-[var(--zalama-border)] rounded-xl p-4 text-center">
                  <div className="text-lg font-bold text-[var(--zalama-blue)]">{request.payroll}</div>
                  <div className="text-sm text-[var(--zalama-text-secondary)]">Masse salariale</div>
                </div>
              </div>
              
              <div className="bg-[var(--zalama-bg-light)] border border-[var(--zalama-border)] rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-[var(--zalama-text-secondary)]" />
                  <div>
                    <p className="text-sm text-[var(--zalama-text-secondary)]">Date de paiement</p>
                    <p className="font-medium text-[var(--zalama-text)]">{request.payment_date}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Métadonnées */}
            <div className="mt-6 space-y-4">
              <div className="flex items-center gap-2 text-lg font-semibold text-[var(--zalama-text)]">
                <FileText className="w-5 h-5 text-[var(--zalama-text-secondary)]" />
                <span>Métadonnées</span>
              </div>
              
              <div className="bg-[var(--zalama-bg-lighter)] border border-[var(--zalama-border)] rounded-xl p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-[var(--zalama-text-secondary)]">ID de la demande</p>
                    <p className="font-mono text-[var(--zalama-text)]">{request.id}</p>
                  </div>
                  
                  <div>
                    <p className="text-[var(--zalama-text-secondary)]">Date de création</p>
                    <p className="text-[var(--zalama-text)]">{formatDate(request.created_at)}</p>
                  </div>
                  
                  {request.updated_at && (
                    <div>
                      <p className="text-[var(--zalama-text-secondary)]">Dernière modification</p>
                      <p className="text-[var(--zalama-text)]">{formatDate(request.updated_at)}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailDemandeModal; 
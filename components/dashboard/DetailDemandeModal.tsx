import React from 'react';
import { X, Building2, User, Users, Phone, Mail, MapPin, Calendar, FileText, CheckCircle, XCircle, Eye, Download } from 'lucide-react';
import { PartnershipRequest } from '@/types/partnership';
import { PDFService } from '@/services/pdfService';
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
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity z-[9998]" onClick={onClose}></div>
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Détails de la Demande</h2>
                  <p className="text-blue-100 text-sm">{request.company_name}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleExportPDF}
                  className="p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-colors"
                  title="Exporter en PDF"
                >
                  <Download className="w-5 h-5 text-white" />
                </button>
                <button
                  onClick={onClose}
                  className="p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 max-h-[70vh] overflow-y-auto">
            {/* Status and Actions */}
            <div className="flex items-center justify-between mb-6 p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center space-x-3">
                <span className="text-sm font-medium text-gray-600">Statut:</span>
                {getStatusBadge(request.status)}
              </div>
              {request.status === 'pending' && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onApprove?.(request.id)}
                    className="flex items-center space-x-1 px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Approuver</span>
                  </button>
                  <button
                    onClick={() => onReject?.(request.id)}
                    className="flex items-center space-x-1 px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Rejeter</span>
                  </button>
                  <button
                    onClick={() => onSetInReview?.(request.id)}
                    className="flex items-center space-x-1 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors"
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
                <div className="flex items-center space-x-2 text-lg font-semibold text-gray-800">
                  <Building2 className="w-5 h-5 text-blue-600" />
                  <span>Informations de l'entreprise</span>
                </div>
                
                <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
                  <div className="flex items-center space-x-3">
                    <Building2 className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Nom de l'entreprise</p>
                      <p className="font-medium text-gray-900">{request.company_name}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-sm text-gray-500">Statut légal</p>
                      <p className="font-medium text-gray-900">{request.legal_status}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">RCCM</p>
                      <p className="font-medium text-gray-900">{request.rccm}</p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">NIF</p>
                    <p className="font-medium text-gray-900">{request.nif}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Domaine d'activité</p>
                    <p className="font-medium text-gray-900">{request.activity_domain}</p>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Adresse du siège</p>
                      <p className="font-medium text-gray-900">{request.headquarters_address}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Téléphone</p>
                      <p className="font-medium text-gray-900">{request.phone}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium text-gray-900">{request.email}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Informations RH */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-lg font-semibold text-gray-800">
                  <Users className="w-5 h-5 text-green-600" />
                  <span>Informations RH</span>
                </div>
                
                <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
                  <div className="flex items-center space-x-3">
                    <Users className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Responsable RH</p>
                      <p className="font-medium text-gray-900">{request.hr_full_name}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Email RH</p>
                      <p className="font-medium text-gray-900">{request.hr_email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Téléphone RH</p>
                      <p className="font-medium text-gray-900">{request.hr_phone}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <FileText className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Accord aux conditions</p>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        request.agreement 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
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
              <div className="flex items-center space-x-2 text-lg font-semibold text-gray-800">
                <User className="w-5 h-5 text-purple-600" />
                <span>Informations du représentant</span>
              </div>
              
              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Nom complet</p>
                    <p className="font-medium text-gray-900">{request.rep_full_name}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Poste</p>
                    <p className="font-medium text-gray-900">{request.rep_position}</p>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium text-gray-900">{request.rep_email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Téléphone</p>
                      <p className="font-medium text-gray-900">{request.rep_phone}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Statistiques employés */}
            <div className="mt-6 space-y-4">
              <div className="flex items-center space-x-2 text-lg font-semibold text-gray-800">
                <Users className="w-5 h-5 text-indigo-600" />
                <span>Statistiques employés</span>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">{request.employees_count}</div>
                  <div className="text-sm text-blue-700">Total employés</div>
                </div>
                
                <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{request.cdi_count}</div>
                  <div className="text-sm text-green-700">CDI</div>
                </div>
                
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-orange-600">{request.cdd_count}</div>
                  <div className="text-sm text-orange-700">CDD</div>
                </div>
                
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-4 text-center">
                  <div className="text-lg font-bold text-purple-600">{request.payroll}</div>
                  <div className="text-sm text-purple-700">Masse salariale</div>
                </div>
              </div>
              
              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <div className="flex items-center space-x-3">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Date de paiement</p>
                    <p className="font-medium text-gray-900">{request.payment_date}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Métadonnées */}
            <div className="mt-6 space-y-4">
              <div className="flex items-center space-x-2 text-lg font-semibold text-gray-800">
                <FileText className="w-5 h-5 text-gray-600" />
                <span>Métadonnées</span>
              </div>
              
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">ID de la demande</p>
                    <p className="font-mono text-gray-900">{request.id}</p>
                  </div>
                  
                  <div>
                    <p className="text-gray-500">Date de création</p>
                    <p className="text-gray-900">{formatDate(request.created_at)}</p>
                  </div>
                  
                  {request.updated_at && (
                    <div>
                      <p className="text-gray-500">Dernière modification</p>
                      <p className="text-gray-900">{formatDate(request.updated_at)}</p>
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
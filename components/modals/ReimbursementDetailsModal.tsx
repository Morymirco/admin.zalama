'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Remboursement } from '@/types/reimbursement';
import {
  AlertTriangle,
  Building,
  Calendar,
  CheckCircle,
  Clock,
  CreditCard,
  DollarSign,
  Download,
  Eye,
  FileText,
  Mail,
  Phone,
  TrendingUp,
  Users,
  Wallet
} from 'lucide-react';

interface ReimbursementDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  remboursement: Remboursement | null;
}

export default function ReimbursementDetailsModal({ 
  isOpen, 
  onClose, 
  remboursement 
}: ReimbursementDetailsModalProps) {
  if (!remboursement) return null;

  const formatMontant = (montant: number) => {
    if (isNaN(montant) || montant === null || montant === undefined) {
      return '0 FCFA';
    }
    return new Intl.NumberFormat('fr-FR').format(montant) + ' FCFA';
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return 'Non définie';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return 'Date invalide';
    return dateObj.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'EN_ATTENTE': { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Clock },
      'PAYE': { color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle },
      'EN_RETARD': { color: 'bg-red-100 text-red-800 border-red-200', icon: AlertTriangle },
      'ANNULE': { color: 'bg-gray-100 text-gray-800 border-gray-200', icon: AlertTriangle }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig['EN_ATTENTE'];
    const Icon = config.icon;

    return (
      <Badge className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${config.color}`}>
        <Icon className="h-3 w-3" />
        {status}
      </Badge>
    );
  };

  const getMethodBadge = (method: string | undefined) => {
    if (!method) {
      return (
        <Badge className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border bg-gray-100 text-gray-800 border-gray-200">
          Non défini
        </Badge>
      );
    }

    const methodConfig = {
      'VIREMENT_BANCAIRE': 'bg-blue-100 text-blue-800 border-blue-200',
      'MOBILE_MONEY': 'bg-orange-100 text-orange-800 border-orange-200',
      'ESPECES': 'bg-green-100 text-green-800 border-green-200',
      'CHEQUE': 'bg-purple-100 text-purple-800 border-purple-200',
      'PRELEVEMENT_SALAIRE': 'bg-indigo-100 text-indigo-800 border-indigo-200',
      'COMPENSATION_AVANCE': 'bg-pink-100 text-pink-800 border-pink-200'
    };

    return (
      <Badge className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${methodConfig[method as keyof typeof methodConfig] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
        {method.replace('_', ' ')}
      </Badge>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Détails du Remboursement
          </DialogTitle>
          <DialogDescription>
            Informations détaillées sur le remboursement #{remboursement.id}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Statut et montants */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-500">Statut</h3>
              {getStatusBadge(remboursement.statut)}
              {remboursement.jours_retard && remboursement.jours_retard > 0 && (
                <p className="text-sm text-red-600">
                  {remboursement.jours_retard} jours de retard
                </p>
              )}
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-500">Montant total à rembourser</h3>
              <p className="text-2xl font-bold text-green-600">
                {formatMontant(remboursement.montant_total_remboursement)}
              </p>
            </div>
          </div>

          {/* Détails financiers */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-3">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Détails Financiers
            </h3>
            <div className="grid gap-2 md:grid-cols-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Montant transaction:</span>
                <span className="text-sm font-medium">
                  {formatMontant(remboursement.montant_transaction)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Frais de service (6.5%):</span>
                <span className="text-sm font-medium text-orange-600">
                  {formatMontant(remboursement.frais_service)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Méthode de remboursement:</span>
                <span>{getMethodBadge(remboursement.methode_remboursement)}</span>
              </div>
              {remboursement.numero_compte && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Numéro de compte:</span>
                  <span className="text-sm font-medium">{remboursement.numero_compte}</span>
                </div>
              )}
            </div>
          </div>

          {/* Informations employé */}
          {remboursement.employe && (
            <div className="bg-blue-50 p-4 rounded-lg space-y-3">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Users className="h-5 w-5" />
                Employé
              </h3>
              <div className="grid gap-2 md:grid-cols-2">
                <div>
                  <p className="text-sm text-gray-600">Nom complet</p>
                  <p className="font-medium">{remboursement.employe.nom} {remboursement.employe.prenom}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <div className="flex items-center gap-1">
                    <Mail className="h-3 w-3 text-gray-500" />
                    <p className="font-medium">{remboursement.employe.email}</p>
                  </div>
                </div>
                {remboursement.employe.telephone && (
                  <div>
                    <p className="text-sm text-gray-600">Téléphone</p>
                    <div className="flex items-center gap-1">
                      <Phone className="h-3 w-3 text-gray-500" />
                      <p className="font-medium">{remboursement.employe.telephone}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Informations partenaire */}
          {remboursement.partenaire && (
            <div className="bg-green-50 p-4 rounded-lg space-y-3">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Building className="h-5 w-5" />
                Partenaire
              </h3>
              <div className="grid gap-2 md:grid-cols-2">
                <div>
                  <p className="text-sm text-gray-600">Nom de l'entreprise</p>
                  <p className="font-medium">{remboursement.partenaire.nom}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email principal</p>
                  <div className="flex items-center gap-1">
                    <Mail className="h-3 w-3 text-gray-500" />
                    <p className="font-medium">{remboursement.partenaire.email}</p>
                  </div>
                </div>
                {remboursement.partenaire.email_rh && (
                  <div>
                    <p className="text-sm text-gray-600">Email RH</p>
                    <div className="flex items-center gap-1">
                      <Mail className="h-3 w-3 text-gray-500" />
                      <p className="font-medium">{remboursement.partenaire.email_rh}</p>
                    </div>
                  </div>
                )}
                {remboursement.partenaire.telephone && (
                  <div>
                    <p className="text-sm text-gray-600">Téléphone</p>
                    <div className="flex items-center gap-1">
                      <Phone className="h-3 w-3 text-gray-500" />
                      <p className="font-medium">{remboursement.partenaire.telephone}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Dates importantes */}
          <div className="bg-purple-50 p-4 rounded-lg space-y-3">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Dates Importantes
            </h3>
            <div className="grid gap-2 md:grid-cols-2">
              <div>
                <p className="text-sm text-gray-600">Date de création</p>
                <p className="font-medium">{formatDate(remboursement.date_creation)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Date de transaction</p>
                <p className="font-medium">{formatDate(remboursement.date_transaction_effectuee)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Date limite de remboursement</p>
                <p className="font-medium">{formatDate(remboursement.date_limite_remboursement)}</p>
              </div>
              {remboursement.date_remboursement_effectue && (
                <div>
                  <p className="text-sm text-gray-600">Date de remboursement effectué</p>
                  <p className="font-medium">{formatDate(remboursement.date_remboursement_effectue)}</p>
                </div>
              )}
            </div>
          </div>

          {/* Informations de paiement */}
          {(remboursement.numero_transaction_remboursement || remboursement.numero_reception || remboursement.reference_paiement) && (
            <div className="bg-yellow-50 p-4 rounded-lg space-y-3">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Informations de Paiement
              </h3>
              <div className="grid gap-2 md:grid-cols-2">
                {remboursement.numero_transaction_remboursement && (
                  <div>
                    <p className="text-sm text-gray-600">Numéro de transaction</p>
                    <p className="font-medium">{remboursement.numero_transaction_remboursement}</p>
                  </div>
                )}
                {remboursement.numero_reception && (
                  <div>
                    <p className="text-sm text-gray-600">Numéro de réception</p>
                    <p className="font-medium">{remboursement.numero_reception}</p>
                  </div>
                )}
                {remboursement.reference_paiement && (
                  <div>
                    <p className="text-sm text-gray-600">Référence de paiement</p>
                    <p className="font-medium">{remboursement.reference_paiement}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Commentaires */}
          {(remboursement.commentaire_admin || remboursement.commentaire_partenaire || remboursement.motif_retard) && (
            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Commentaires
              </h3>
              <div className="space-y-3">
                {remboursement.commentaire_admin && (
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Commentaire administrateur</p>
                    <p className="text-sm bg-white p-2 rounded border">{remboursement.commentaire_admin}</p>
                  </div>
                )}
                {remboursement.commentaire_partenaire && (
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Commentaire partenaire</p>
                    <p className="text-sm bg-white p-2 rounded border">{remboursement.commentaire_partenaire}</p>
                  </div>
                )}
                {remboursement.motif_retard && (
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Motif de retard</p>
                    <p className="text-sm bg-red-50 p-2 rounded border text-red-700">{remboursement.motif_retard}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Fermer
            </Button>
            <Button className="bg-[var(--zalama-blue)] hover:bg-[var(--zalama-blue-accent)]">
              <Download className="h-4 w-4 mr-2" />
              Exporter
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 
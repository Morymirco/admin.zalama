'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Remboursement } from '@/types/reimbursement';
import { AlertTriangle, CheckCircle, Clock, ExternalLink, RefreshCw, XCircle } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface LengoPaymentStatusProps {
  remboursement: Remboursement;
  onRefresh?: () => void;
}

export default function LengoPaymentStatus({ remboursement, onRefresh }: LengoPaymentStatusProps) {
  const [refreshing, setRefreshing] = useState(false);

  const formatMontant = (montant: number) => {
    return new Intl.NumberFormat('fr-FR').format(montant) + ' GNF';
  };

  const getStatusInfo = () => {
    if (!remboursement.numero_transaction_remboursement) {
      return {
        status: 'NO_PAYMENT',
        label: 'Aucun paiement',
        color: 'bg-gray-100 text-gray-600',
        icon: null,
        description: 'Aucun paiement Lengo Pay initié'
      };
    }

    // Si le remboursement est payé et a un numéro de transaction Lengo
    if (remboursement.statut === 'PAYE' && remboursement.numero_transaction_remboursement) {
      return {
        status: 'SUCCESS',
        label: 'Paiement réussi',
        color: 'bg-green-100 text-green-700',
        icon: CheckCircle,
        description: 'Le paiement a été traité avec succès via Lengo Pay'
      };
    }

    // Si le remboursement est en attente et a un numéro de transaction Lengo
    if (remboursement.statut === 'EN_ATTENTE' && remboursement.numero_transaction_remboursement) {
      return {
        status: 'PENDING',
        label: 'Paiement en cours',
        color: 'bg-yellow-100 text-yellow-700',
        icon: Clock,
        description: 'Le paiement est en cours de traitement via Lengo Pay'
      };
    }

    // Si le remboursement est annulé
    if (remboursement.statut === 'ANNULE') {
      return {
        status: 'CANCELLED',
        label: 'Paiement annulé',
        color: 'bg-red-100 text-red-700',
        icon: XCircle,
        description: 'Le paiement a été annulé'
      };
    }

    return {
      status: 'UNKNOWN',
      label: 'Statut inconnu',
      color: 'bg-gray-100 text-gray-600',
      icon: AlertTriangle,
      description: 'Statut du paiement non déterminé'
    };
  };

  const statusInfo = getStatusInfo();
  const IconComponent = statusInfo.icon;

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      // Ici vous pourriez appeler une API pour vérifier le statut
      // await reimbursementService.verifierStatutPaiementLengo(remboursement.numero_transaction_remboursement);
      toast.success('Statut actualisé');
      onRefresh?.();
    } catch (error) {
      toast.error('Erreur lors de l\'actualisation du statut');
    } finally {
      setRefreshing(false);
    }
  };

  const handleOpenPayment = () => {
    if (remboursement.numero_transaction_remboursement) {
      // Ouvrir l'URL de paiement Lengo Pay
      const paymentUrl = `https://payment.lengopay.com/${remboursement.numero_transaction_remboursement}`;
      window.open(paymentUrl, '_blank');
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <span>Statut Lengo Pay</span>
          <Badge className={statusInfo.color}>
            {IconComponent && <IconComponent className="h-3 w-3 mr-1" />}
            {statusInfo.label}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600">
          {statusInfo.description}
        </p>

        {remboursement.numero_transaction_remboursement && (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Pay ID:</span>
              <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                {remboursement.numero_transaction_remboursement}
              </code>
            </div>

            {remboursement.reference_paiement && (
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Référence:</span>
                <span className="text-sm">{remboursement.reference_paiement}</span>
              </div>
            )}

            {remboursement.date_remboursement_effectue && (
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Date de paiement:</span>
                <span className="text-sm">
                  {new Date(remboursement.date_remboursement_effectue).toLocaleDateString('fr-FR')}
                </span>
              </div>
            )}

            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Montant:</span>
              <span className="text-sm font-semibold">
                {formatMontant(remboursement.montant_total_remboursement)}
              </span>
            </div>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          {remboursement.numero_transaction_remboursement && statusInfo.status === 'PENDING' && (
            <Button
              onClick={handleOpenPayment}
              size="sm"
              className="flex items-center gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              Continuer le paiement
            </Button>
          )}
          
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            disabled={refreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
        </div>

        {remboursement.commentaire_admin && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600 font-medium mb-1">Commentaire système:</p>
            <p className="text-xs text-gray-700">{remboursement.commentaire_admin}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 
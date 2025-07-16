'use client';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Remboursement } from '@/types/reimbursement';
import { CreditCard, Loader2, Wallet } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  remboursement: Remboursement | null;
  onSuccess: () => void;
}

export default function PaymentModal({ isOpen, onClose, remboursement, onSuccess }: PaymentModalProps) {
  const [loading, setLoading] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [paymentInitiated, setPaymentInitiated] = useState(false);

  const handleLengoPayment = async () => {
    if (!remboursement) return;

    setLoading(true);
    setPaymentUrl(null);
    setPaymentInitiated(false);

    try {
      console.log('🚀 Début de l\'initiation du paiement Lengo Pay:', {
        remboursement_id: remboursement.id,
        amount: remboursement.montant_total_remboursement,
        currency: 'GNF'
      });

      // Appeler l'API Lengo Pay pour créer le paiement
      const response = await fetch('/api/remboursements/lengo-paiement', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          remboursement_id: remboursement.id,
          amount: Math.round(remboursement.montant_total_remboursement),
          currency: 'GNF'
        }),
      });

      const result = await response.json();
      console.log('📡 Réponse de l\'API Lengo Pay:', result);

      if (result.success) {
        toast.success('Paiement Lengo Pay initié avec succès');
        setPaymentInitiated(true);
        
        // Ouvrir l'URL de paiement dans un nouvel onglet
        if (result.data && result.data.payment_url) {
          console.log('🔗 Tentative d\'ouverture de l\'URL de paiement:', result.data.payment_url);
          setPaymentUrl(result.data.payment_url);
          
          try {
            // Essayer d'ouvrir dans un nouvel onglet
            const newWindow = window.open(result.data.payment_url, '_blank', 'noopener,noreferrer');
            
            if (newWindow) {
              console.log('✅ Nouvel onglet ouvert avec succès');
              // Vérifier si l'onglet a été bloqué
              setTimeout(() => {
                if (newWindow.closed) {
                  console.log('⚠️ L\'onglet a été fermé ou bloqué');
                  toast.warning('L\'onglet de paiement a été bloqué. Utilisez le lien ci-dessous.');
                }
              }, 1000);
            } else {
              console.log('⚠️ Impossible d\'ouvrir un nouvel onglet');
              toast.warning('Impossible d\'ouvrir un nouvel onglet. Utilisez le lien ci-dessous.');
            }
          } catch (openError) {
            console.error('❌ Erreur lors de l\'ouverture de l\'URL:', openError);
            toast.error('Erreur lors de l\'ouverture de la page de paiement');
          }
        } else {
          console.error('❌ URL de paiement manquante dans la réponse');
          toast.error('URL de paiement manquante');
        }
        
        onSuccess();
      } else {
        console.error('❌ Erreur lors de l\'initiation du paiement:', result.error);
        toast.error(result.error || 'Erreur lors de l\'initiation du paiement');
      }
    } catch (error) {
      console.error('❌ Erreur lors du paiement Lengo Pay:', error);
      toast.error('Erreur réseau lors du paiement');
    } finally {
      setLoading(false);
    }
  };

  const copyPaymentUrl = () => {
    if (paymentUrl) {
      navigator.clipboard.writeText(paymentUrl).then(() => {
        toast.success('Lien de paiement copié dans le presse-papiers');
      }).catch(() => {
        // Fallback pour les navigateurs plus anciens
        const tempInput = document.createElement('input');
        tempInput.value = paymentUrl;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand('copy');
        document.body.removeChild(tempInput);
        toast.success('Lien de paiement copié dans le presse-papiers');
      });
    }
  };

  const handleClose = () => {
    if (!loading) {
      setPaymentUrl(null);
      setPaymentInitiated(false);
      onClose();
    }
  };

  if (!remboursement) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Paiement via Lengo Pay
          </DialogTitle>
          <DialogDescription>
            Effectuer le paiement du remboursement pour {remboursement.employe?.nom} {remboursement.employe?.prenom}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informations du remboursement */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <div className="flex justify-between">
              <span className="text-sm font-medium">Montant à rembourser:</span>
              <span className="text-sm font-bold">
                {new Intl.NumberFormat('fr-FR').format(remboursement.montant_total_remboursement)} FCFA
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Montant transaction:</span>
              <span className="text-sm">
                {new Intl.NumberFormat('fr-FR').format(remboursement.montant_transaction)} FCFA
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Frais de service:</span>
              <span className="text-sm">
                {new Intl.NumberFormat('fr-FR').format(remboursement.frais_service)} FCFA
              </span>
            </div>
          </div>

          {/* Informations Lengo Pay */}
          <div className="bg-blue-50 p-4 rounded-lg space-y-3">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Paiement Sécurisé Lengo Pay
            </h3>
            <div className="text-sm text-blue-800 space-y-2">
              <p>• Paiement sécurisé via la plateforme Lengo Pay</p>
              <p>• Supporte Mobile Money, cartes bancaires, et plus</p>
              <p>• Transaction instantanée et sécurisée</p>
              <p>• Vous serez redirigé vers la page de paiement</p>
            </div>
          </div>

          {/* Avertissement */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="text-sm text-yellow-800">
              <p className="font-medium">Important</p>
              <p>En cliquant sur "Payer via Lengo Pay", vous serez redirigé vers la page de paiement sécurisée de Lengo Pay pour finaliser la transaction.</p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
            {paymentInitiated ? 'Fermer' : 'Annuler'}
          </Button>
          
          {!paymentInitiated ? (
            <Button onClick={handleLengoPayment} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Initialisation...
                </>
              ) : (
                <>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Payer via Lengo Pay
                </>
              )}
            </Button>
          ) : paymentUrl ? (
            <div className="flex gap-2">
              <Button 
                onClick={() => window.open(paymentUrl, '_blank', 'noopener,noreferrer')}
                className="bg-green-600 hover:bg-green-700"
              >
                <CreditCard className="mr-2 h-4 w-4" />
                Ouvrir Page de Paiement
              </Button>
              <Button 
                onClick={copyPaymentUrl}
                variant="outline"
                className="border-blue-300 text-blue-700 hover:bg-blue-50"
              >
                Copier le Lien
              </Button>
            </div>
          ) : null}
        </DialogFooter>

        {/* Afficher le lien de paiement si disponible */}
        {paymentUrl && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="text-sm font-medium text-green-800 mb-2">
              ✅ Paiement initié avec succès !
            </h4>
            <p className="text-sm text-green-700 mb-3">
              Cliquez sur "Ouvrir Page de Paiement" ci-dessus ou copiez le lien ci-dessous :
            </p>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={paymentUrl}
                readOnly
                className="flex-1 text-xs p-2 border border-green-300 rounded bg-white"
              />
              <Button
                onClick={copyPaymentUrl}
                size="sm"
                variant="outline"
                className="text-xs"
              >
                Copier
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
} 
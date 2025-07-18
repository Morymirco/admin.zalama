'use client';

import { Button } from '@/components/ui/button';
import { Remboursement } from '@/types/reimbursement';
import { CreditCard, Loader2, Wallet, X } from 'lucide-react';
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

  if (!isOpen || !remboursement) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999]">
      <div className="bg-[var(--zalama-card)] border border-[var(--zalama-border)] rounded-xl shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[var(--zalama-border)]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[var(--zalama-blue)]/10 rounded-lg">
              <CreditCard className="h-5 w-5 text-[var(--zalama-blue)]" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[var(--zalama-text)]">
                Paiement via Lengo Pay
              </h2>
              <p className="text-sm text-[var(--zalama-text-secondary)]">
                Pour {remboursement.employe?.nom} {remboursement.employe?.prenom}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={loading}
            className="p-2 text-[var(--zalama-text-secondary)] hover:text-[var(--zalama-text)] hover:bg-[var(--zalama-bg-light)] rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Informations du remboursement */}
          <div className="bg-[var(--zalama-bg-light)] p-4 rounded-lg space-y-3 border border-[var(--zalama-border)]">
            <h3 className="text-sm font-medium text-[var(--zalama-text)] mb-3">Détails du remboursement</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-[var(--zalama-text-secondary)]">Montant à rembourser:</span>
                <span className="text-sm font-bold text-[var(--zalama-success)]">
                  {new Intl.NumberFormat('fr-FR').format(remboursement.montant_total_remboursement)} FCFA
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-[var(--zalama-text-secondary)]">Montant transaction:</span>
                <span className="text-sm text-[var(--zalama-text)]">
                  {new Intl.NumberFormat('fr-FR').format(remboursement.montant_transaction)} FCFA
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-[var(--zalama-text-secondary)]">Frais de service:</span>
                <span className="text-sm text-[var(--zalama-warning)]">
                  {new Intl.NumberFormat('fr-FR').format(remboursement.frais_service)} FCFA
                </span>
              </div>
            </div>
          </div>

          {/* Informations Lengo Pay */}
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg space-y-3 border border-blue-200 dark:border-blue-800">
            <h3 className="text-lg font-semibold flex items-center gap-2 text-blue-800 dark:text-blue-200">
              <Wallet className="h-5 w-5" />
              Paiement Sécurisé Lengo Pay
            </h3>
            <div className="text-sm text-blue-700 dark:text-blue-300 space-y-2">
              <p>• Paiement sécurisé via la plateforme Lengo Pay</p>
              <p>• Supporte Mobile Money, cartes bancaires, et plus</p>
              <p>• Transaction instantanée et sécurisée</p>
              <p>• Vous serez redirigé vers la page de paiement</p>
            </div>
          </div>

          {/* Avertissement */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <div className="text-sm">
              <p className="font-medium text-yellow-800 dark:text-yellow-200 mb-1">Important</p>
              <p className="text-yellow-700 dark:text-yellow-300">
                En cliquant sur &ldquo;Payer via Lengo Pay&rdquo;, vous serez redirigé vers la page de paiement sécurisée de Lengo Pay pour finaliser la transaction.
              </p>
            </div>
          </div>

          {/* Afficher le lien de paiement si disponible */}
          {paymentUrl && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <h4 className="text-sm font-medium text-green-800 dark:text-green-200 mb-2 flex items-center gap-2">
                ✅ Paiement initié avec succès !
              </h4>
              <p className="text-sm text-green-700 dark:text-green-300 mb-3">
                Cliquez sur &ldquo;Ouvrir Page de Paiement&rdquo; ou copiez le lien ci-dessous :
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={paymentUrl}
                  readOnly
                  className="flex-1 text-xs p-2 border border-green-300 dark:border-green-700 rounded bg-white dark:bg-green-900/30 text-green-800 dark:text-green-200"
                />
                <Button
                  onClick={copyPaymentUrl}
                  size="sm"
                  variant="outline"
                  className="text-xs border-green-300 dark:border-green-700 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/40"
                >
                  Copier
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-[var(--zalama-border)]">
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleClose} 
            disabled={loading}
            className="border-[var(--zalama-border)] text-[var(--zalama-text)] hover:bg-[var(--zalama-bg-light)]"
          >
            {paymentInitiated ? 'Fermer' : 'Annuler'}
          </Button>
          
          {!paymentInitiated ? (
            <Button 
              onClick={handleLengoPayment} 
              disabled={loading}
              className="bg-[var(--zalama-blue)] hover:bg-[var(--zalama-blue-accent)] text-white"
            >
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
                className="bg-[var(--zalama-success)] hover:bg-green-700 text-white"
              >
                <CreditCard className="mr-2 h-4 w-4" />
                Ouvrir Page de Paiement
              </Button>
              <Button 
                onClick={copyPaymentUrl}
                variant="outline"
                className="border-[var(--zalama-blue)] text-[var(--zalama-blue)] hover:bg-blue-50 dark:hover:bg-blue-900/20"
              >
                Copier le Lien
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
} 
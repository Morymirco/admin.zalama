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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import reimbursementService from '@/services/reimbursementService';
import { PaiementLengoData, Remboursement } from '@/types/reimbursement';
import { CreditCard, ExternalLink, Loader2, Shield } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface LengoPaymentModalProps {
  remboursement: Remboursement;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function LengoPaymentModal({
  remboursement,
  isOpen,
  onClose,
  onSuccess
}: LengoPaymentModalProps) {
  const [loading, setLoading] = useState(false);
  const [devise, setDevise] = useState('GNF');
  const [montant, setMontant] = useState(remboursement.montant_total_remboursement.toString());
  const [returnUrl, setReturnUrl] = useState('');

  const formatMontant = (montant: number) => {
    return new Intl.NumberFormat('fr-FR').format(montant) + ' GNF';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!montant || parseFloat(montant) <= 0) {
      toast.error('Veuillez saisir un montant valide');
      return;
    }

    setLoading(true);

    try {
      const paiementData: PaiementLengoData = {
        remboursement_id: remboursement.id,
        montant: parseFloat(montant),
        devise: devise,
        return_url: returnUrl || undefined
      };

      const response = await reimbursementService.effectuerPaiementLengo(paiementData);

      if (response.success) {
        toast.success('Paiement initié avec succès via Lengo Pay');
        
        // Ouvrir l'URL de paiement dans un nouvel onglet
        window.open(response.data.payment_url, '_blank');
        
        onSuccess?.();
        onClose();
      } else {
        toast.error(response.message || 'Erreur lors de l\'initiation du paiement');
      }
    } catch (error) {
      console.error('Erreur lors du paiement Lengo:', error);
      toast.error('Erreur lors de l\'initiation du paiement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Paiement via Lengo Pay
          </DialogTitle>
          <DialogDescription>
            Effectuez le paiement du remboursement via la passerelle de paiement sécurisée Lengo Pay.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Informations du remboursement */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-sm text-gray-700 mb-2">Détails du remboursement</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Employé:</span>
                <span className="font-medium">
                  {remboursement.employe?.prenom} {remboursement.employe?.nom}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Montant transaction:</span>
                <span>{formatMontant(remboursement.montant_transaction)}</span>
              </div>
              <div className="flex justify-between">
                <span>Frais de service:</span>
                <span>{formatMontant(remboursement.frais_service)}</span>
              </div>
              <div className="flex justify-between font-medium">
                <span>Total à rembourser:</span>
                <span className="text-green-600">
                  {formatMontant(remboursement.montant_total_remboursement)}
                </span>
              </div>
            </div>
          </div>

          {/* Configuration du paiement */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="montant">Montant à payer</Label>
              <Input
                id="montant"
                type="number"
                value={montant}
                onChange={(e) => setMontant(e.target.value)}
                placeholder="Montant"
                min="0"
                step="0.01"
                required
              />
            </div>

            <div>
              <Label htmlFor="devise">Devise</Label>
              <Select value={devise} onValueChange={setDevise}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une devise" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GNF">Franc Guinéen (GNF)</SelectItem>
                  <SelectItem value="XOF">Franc CFA (XOF)</SelectItem>
                  <SelectItem value="USD">Dollar US (USD)</SelectItem>
                  <SelectItem value="EUR">Euro (EUR)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="returnUrl">URL de retour (optionnel)</Label>
              <Input
                id="returnUrl"
                type="url"
                value={returnUrl}
                onChange={(e) => setReturnUrl(e.target.value)}
                placeholder="https://votre-site.com/retour"
              />
              <p className="text-xs text-gray-500 mt-1">
                URL vers laquelle l'utilisateur sera redirigé après le paiement
              </p>
            </div>
          </div>

          {/* Informations de sécurité */}
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="flex items-start gap-2">
              <Shield className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-medium">Paiement sécurisé</p>
                <p className="text-xs">
                  Votre paiement sera traité de manière sécurisée par Lengo Pay. 
                  Aucune information bancaire n'est stockée sur nos serveurs.
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading} className="flex items-center gap-2">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Initialisation...
                </>
              ) : (
                <>
                  <ExternalLink className="h-4 w-4" />
                  Procéder au paiement
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 
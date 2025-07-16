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
import { Textarea } from '@/components/ui/textarea';
import { TransactionSansRemboursement } from '@/types/reimbursement';
import { AlertTriangle, Loader2, Plus } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface CreateReimbursementModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: TransactionSansRemboursement | null;
  onSuccess: () => void;
}

export default function CreateReimbursementModal({ 
  isOpen, 
  onClose, 
  transaction, 
  onSuccess 
}: CreateReimbursementModalProps) {
  const [loading, setLoading] = useState(false);
  const [commentaire, setCommentaire] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!transaction) return;

    setLoading(true);

    try {
      const response = await fetch('/api/remboursements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transaction_id: transaction.transaction_id,
          commentaire_admin: commentaire || null
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Remboursement créé avec succès');
        onSuccess();
        onClose();
        resetForm();
      } else {
        toast.error(result.error || 'Erreur lors de la création du remboursement');
      }
    } catch (error) {
      console.error('Erreur lors de la création du remboursement:', error);
      toast.error('Erreur réseau lors de la création');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setCommentaire('');
  };

  const handleClose = () => {
    if (!loading) {
      resetForm();
      onClose();
    }
  };

  if (!transaction) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Créer un Remboursement
          </DialogTitle>
          <DialogDescription>
            Créer un remboursement pour la transaction de {transaction.employe_nom} {transaction.employe_prenom}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Informations de la transaction */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <div className="flex justify-between">
              <span className="text-sm font-medium">Employé:</span>
              <span className="text-sm font-bold">
                {transaction.employe_nom} {transaction.employe_prenom}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Partenaire:</span>
              <span className="text-sm">
                {transaction.partenaire_nom}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Montant transaction:</span>
              <span className="text-sm">
                {new Intl.NumberFormat('fr-FR').format(transaction.montant)} FCFA
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Montant à rembourser:</span>
              <span className="text-sm font-bold text-green-600">
                {new Intl.NumberFormat('fr-FR').format(transaction.montant_total_remboursement)} FCFA
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Frais de service (6.5%):</span>
              <span className="text-sm text-orange-600">
                {new Intl.NumberFormat('fr-FR').format(transaction.montant_total_remboursement - transaction.montant)} FCFA
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Date transaction:</span>
              <span className="text-sm">
                {new Date(transaction.date_transaction).toLocaleDateString('fr-FR')}
              </span>
            </div>
          </div>

          {/* Avertissement */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium">Attention</p>
                <p>Ce remboursement sera créé avec le statut "EN_ATTENTE" et devra être payé ultérieurement.</p>
              </div>
            </div>
          </div>

          {/* Commentaire */}
          <div className="space-y-2">
            <label htmlFor="commentaire" className="text-sm font-medium">
              Commentaire (optionnel)
            </label>
            <Textarea
              id="commentaire"
              value={commentaire}
              onChange={(e) => setCommentaire(e.target.value)}
              placeholder="Commentaire sur la création du remboursement"
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Création...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Créer le Remboursement
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 
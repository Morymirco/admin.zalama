'use client';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { TransactionSansRemboursement } from '@/types/reimbursement';
import { AlertTriangle, Loader2, Plus, X } from 'lucide-react';
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

  if (!isOpen || !transaction) return null;

  // ✅ Calculs selon la logique ZaLaMa correcte
  const montantDemande = transaction.montant; // Ex: 2,000 GNF
  const fraisZalama = Math.round(montantDemande * 0.065); // Ex: 130 GNF
  const montantRecuEmploye = montantDemande - fraisZalama; // Ex: 1,870 GNF
  const montantRemboursementPartenaire = montantDemande; // Ex: 2,000 GNF (ce que paie le partenaire)

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999]">
      <div className="bg-[var(--zalama-card)] border border-[var(--zalama-border)] rounded-xl shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[var(--zalama-border)]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[var(--zalama-blue)]/10 rounded-lg">
              <Plus className="h-5 w-5 text-[var(--zalama-blue)]" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[var(--zalama-text)]">
                Créer un Remboursement
              </h2>
              <p className="text-sm text-[var(--zalama-text-secondary)]">
                Pour {transaction.employe_nom} {transaction.employe_prenom}
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
        <div className="flex-1 overflow-y-auto p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Informations de la transaction */}
            <div className="bg-[var(--zalama-bg-light)] p-4 rounded-lg space-y-3 border border-[var(--zalama-border)]">
              <h3 className="text-sm font-medium text-[var(--zalama-text)] mb-3">Détails de la transaction</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-[var(--zalama-text-secondary)]">Employé:</span>
                  <span className="text-sm font-medium text-[var(--zalama-text)]">
                    {transaction.employe_nom} {transaction.employe_prenom}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-[var(--zalama-text-secondary)]">Partenaire:</span>
                  <span className="text-sm text-[var(--zalama-text)]">
                    {transaction.partenaire_nom}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-[var(--zalama-text-secondary)]">Montant demandé:</span>
                  <span className="text-sm font-medium text-[var(--zalama-text)]">
                    {new Intl.NumberFormat('fr-FR').format(montantDemande)} FCFA
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-[var(--zalama-text-secondary)]">Date transaction:</span>
                  <span className="text-sm text-[var(--zalama-text)]">
                    {new Date(transaction.date_transaction).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              </div>
            </div>

            {/* Répartition financière ZaLaMa */}
            <div className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 p-4 rounded-lg border border-[var(--zalama-border)]">
              <h3 className="text-sm font-medium text-[var(--zalama-text)] mb-3 flex items-center gap-2">
                <div className="w-2 h-2 bg-[var(--zalama-blue)] rounded-full"></div>
                Répartition financière ZaLaMa
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-[var(--zalama-text-secondary)]">Frais ZaLaMa (6.5%):</span>
                  <span className="text-sm font-medium text-[var(--zalama-blue)]">
                    {new Intl.NumberFormat('fr-FR').format(fraisZalama)} FCFA
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-[var(--zalama-text-secondary)]">Reçu par l&apos;employé:</span>
                  <span className="text-sm font-medium text-[var(--zalama-success)]">
                    {new Intl.NumberFormat('fr-FR').format(montantRecuEmploye)} FCFA
                  </span>
                </div>
                <div className="border-t border-[var(--zalama-border)] pt-2 mt-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-[var(--zalama-text)]">À rembourser par le partenaire:</span>
                    <span className="text-sm font-bold text-[var(--zalama-warning)] bg-yellow-100 dark:bg-yellow-900/30 px-2 py-1 rounded">
                      {new Intl.NumberFormat('fr-FR').format(montantRemboursementPartenaire)} FCFA
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Information importante */}
            <div className="bg-[var(--zalama-blue)]/10 border border-[var(--zalama-blue)]/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-[var(--zalama-blue)] mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-[var(--zalama-blue)] mb-1">Logique ZaLaMa</p>
                  <p className="text-[var(--zalama-text-secondary)]">
                    Le partenaire rembourse le montant demandé complet. ZaLaMa garde ses frais de service prélevés lors du paiement initial.
                  </p>
                </div>
              </div>
            </div>

            {/* Commentaire */}
            <div className="space-y-2">
              <label htmlFor="commentaire" className="text-sm font-medium text-[var(--zalama-text)]">
                Commentaire (optionnel)
              </label>
              <Textarea
                id="commentaire"
                value={commentaire}
                onChange={(e) => setCommentaire(e.target.value)}
                placeholder="Commentaire sur la création du remboursement"
                rows={3}
                className="bg-[var(--zalama-bg-light)] border-[var(--zalama-border)] text-[var(--zalama-text)] placeholder:text-[var(--zalama-text-secondary)]"
              />
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 pt-4 border-t border-[var(--zalama-border)]">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleClose} 
                disabled={loading}
                className="border-[var(--zalama-border)] text-[var(--zalama-text)] hover:bg-[var(--zalama-bg-light)]"
              >
                Annuler
              </Button>
              <Button 
                type="submit" 
                disabled={loading}
                className="bg-[var(--zalama-blue)] hover:bg-[var(--zalama-blue-accent)] text-white"
              >
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
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
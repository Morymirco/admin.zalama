"use client";

import React, { useState } from 'react';
import { UITransaction } from '@/types/salaryAdvanceRequest';
import { Eye, CheckCircle, XCircle, Clock, DollarSign, CreditCard, Smartphone, Banknote, FileText, RefreshCw, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface ListeTransactionsProps {
  transactions: UITransaction[];
  isLoading: boolean;
  onView: (transaction: UITransaction) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onRefresh?: () => void;
}

const ListeTransactions: React.FC<ListeTransactionsProps> = ({
  transactions,
  isLoading,
  onView,
  currentPage,
  totalPages,
  onPageChange,
  onRefresh
}) => {
  const [verifyingId, setVerifyingId] = useState<string | null>(null);

  const handleVerifyStatus = async (transaction: UITransaction) => {
    setVerifyingId(transaction.id);
    try {
      console.log('🔍 Vérification du statut pour:', transaction.numero_transaction);
      
      const response = await fetch('/api/payments/lengo-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pay_id: transaction.numero_transaction })
      });
      
      const data = await response.json();
      console.log('📊 Réponse de vérification:', data);
      
      if (response.ok) {
        const status = data.lengo_status || data.status || 'Inconnu';
        const dbStatus = data.db_status || 'Non mis à jour';
        
        toast.success(
          `Statut vérifié: ${status}${dbStatus !== status ? ` (DB: ${dbStatus})` : ''}`,
          { duration: 4000 }
        );
        
        // Rafraîchir la liste si la fonction onRefresh est disponible
        if (onRefresh) {
          console.log('🔄 Rafraîchissement de la liste des transactions...');
          onRefresh();
        }
      } else {
        toast.error(data.error || 'Erreur lors de la vérification du statut');
      }
    } catch (e) {
      console.error('❌ Erreur lors de la vérification:', e);
      toast.error('Erreur réseau lors de la vérification du statut');
    } finally {
      setVerifyingId(null);
    }
  };
  const getStatusIcon = (statut: string) => {
    switch (statut) {
      case 'PAYE':
      case 'EFFECTUEE':
        return <CheckCircle className="w-4 h-4 text-[var(--zalama-success)]" />;
      case 'EN_COURS':
      case 'EN_ATTENTE':
        return <Clock className="w-4 h-4 text-[var(--zalama-warning)]" />;
      case 'ECHEC':
      case 'ECHOUE':
      case 'ANNULEE':
        return <XCircle className="w-4 h-4 text-[var(--zalama-danger)]" />;
      default:
        return <Eye className="w-4 h-4 text-[var(--zalama-text-secondary)]" />;
    }
  };

  const getStatusColor = (statut: string) => {
    switch (statut) {
      case 'PAYE':
      case 'EFFECTUEE':
        return 'bg-green-100 text-green-800';
      case 'EN_COURS':
      case 'EN_ATTENTE':
        return 'bg-yellow-100 text-yellow-800';
      case 'ECHEC':
      case 'ECHOUE':
      case 'ANNULEE':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'Mobile Money':
        return <Smartphone className="w-4 h-4" />;
      case 'Virement bancaire':
        return <Banknote className="w-4 h-4" />;
      case 'Espèces':
        return <DollarSign className="w-4 h-4" />;
      case 'Chèque':
        return <FileText className="w-4 h-4" />;
      default:
        return <CreditCard className="w-4 h-4" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'GNF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="bg-[var(--zalama-bg-light)] rounded-lg border border-[var(--zalama-border)]">
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-[var(--zalama-border)] rounded mb-4"></div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-[var(--zalama-border)] rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--zalama-bg-light)] rounded-lg border border-[var(--zalama-border)]">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-[var(--zalama-text)]">
            Liste des transactions
          </h3>
          <div className="text-sm text-[var(--zalama-text-secondary)]">
            {transactions.length} transaction(s)
          </div>
        </div>

        {transactions.length === 0 ? (
          <div className="text-center py-8">
            <DollarSign className="w-12 h-12 text-[var(--zalama-text-secondary)] mx-auto mb-4" />
            <p className="text-[var(--zalama-text-secondary)]">Aucune transaction trouvée</p>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-4 bg-[var(--zalama-bg-lighter)] rounded-lg hover:bg-[var(--zalama-bg)] transition-colors">
                  <div className="flex items-center gap-4 flex-1">
                    {getStatusIcon(transaction.statut)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-medium text-[var(--zalama-text)]">
                          {transaction.employeNom || 'Employé inconnu'}
                        </p>
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(transaction.statut)}`}>
                          {transaction.statut}
                        </span>
                      </div>
                      <p className="text-xs text-[var(--zalama-text-secondary)]">
                        {transaction.entrepriseNom || 'Entreprise inconnue'} • {formatDate(transaction.dateTransaction)}
                      </p>
                      <p className="text-xs text-[var(--zalama-text-secondary)]">
                        N° {transaction.numero_transaction}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-medium text-[var(--zalama-text)]">
                        {formatCurrency(transaction.montant)}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-[var(--zalama-text-secondary)]">
                        {getPaymentMethodIcon(transaction.methode_paiement)}
                        <span>{transaction.methode_paiement}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleVerifyStatus(transaction)}
                        disabled={verifyingId === transaction.id}
                        className="p-2 text-[var(--zalama-text-secondary)] hover:text-[var(--zalama-blue)] hover:bg-[var(--zalama-bg)] rounded-lg transition-colors disabled:opacity-50"
                        title="Vérifier le statut actuel"
                      >
                        {verifyingId === transaction.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <RefreshCw className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => onView(transaction)}
                        className="p-2 text-[var(--zalama-text-secondary)] hover:text-[var(--zalama-text)] hover:bg-[var(--zalama-bg)] rounded-lg transition-colors"
                        title="Voir les détails"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-[var(--zalama-border)]">
                <div className="text-sm text-[var(--zalama-text-secondary)]">
                  Page {currentPage} sur {totalPages}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1 text-sm border border-[var(--zalama-border)] rounded-lg bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--zalama-bg)] transition-colors"
                  >
                    Précédent
                  </button>
                  <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 text-sm border border-[var(--zalama-border)] rounded-lg bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--zalama-bg)] transition-colors"
                  >
                    Suivant
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ListeTransactions; 
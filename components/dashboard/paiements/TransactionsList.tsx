import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CreditCard, RefreshCw, Loader2, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { Transaction, useTransactions } from '@/hooks/useTransactions';
import { toast } from 'sonner';

interface TransactionsListProps {
  onTransactionSelect?: (transaction: Transaction) => void;
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'PAYE':
    case 'EFFECTUEE':
      return <CheckCircle className="w-4 h-4 text-green-600" />;
    case 'ECHOUE':
      return <XCircle className="w-4 h-4 text-red-600" />;
    case 'EN_ATTENTE':
      return <Clock className="w-4 h-4 text-yellow-600" />;
    default:
      return <AlertCircle className="w-4 h-4 text-gray-600" />;
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'PAYE':
    case 'EFFECTUEE':
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Payé</Badge>;
    case 'ECHOUE':
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Échoué</Badge>;
    case 'EN_ATTENTE':
      return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">En attente</Badge>;
    default:
      return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">{status}</Badge>;
  }
};

const formatAmount = (amount: number) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'GNF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const TransactionsList: React.FC<TransactionsListProps> = ({ onTransactionSelect }) => {
  const { 
    transactions, 
    loading, 
    error, 
    refreshTransactions 
  } = useTransactions();

  const [verifyingId, setVerifyingId] = useState<string | null>(null);

  const handleRefresh = async () => {
    try {
      await refreshTransactions();
      toast.success('Liste des transactions mise à jour');
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const handleTransactionClick = (transaction: Transaction) => {
    if (onTransactionSelect) {
      onTransactionSelect(transaction);
    }
  };

  const handleVerifyStatus = async (transaction: Transaction) => {
    setVerifyingId(transaction.id);
    try {
      const response = await fetch('/api/payments/lengo-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pay_id: transaction.numero_transaction })
      });
      const data = await response.json();
      if (response.ok) {
        toast.success(`Statut: ${data.lengo_status || data.status || 'Inconnu'}`);
        await refreshTransactions();
      } else {
        toast.error(data.error || 'Erreur lors de la vérification');
      }
    } catch (e) {
      toast.error('Erreur réseau lors de la vérification');
    } finally {
      setVerifyingId(null);
    }
  };

  if (loading && transactions.length === 0) {
    return (
      <Card className="border-[var(--zalama-border)] bg-[var(--zalama-bg)]">
        <CardHeader>
          <CardTitle className="text-[var(--zalama-text)] flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Transactions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-[var(--zalama-blue)]" />
            <span className="ml-2 text-[var(--zalama-text-secondary)]">Chargement des transactions...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-[var(--zalama-border)] bg-[var(--zalama-bg)]">
        <CardHeader>
          <CardTitle className="text-[var(--zalama-text)] flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Transactions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <AlertCircle className="w-6 h-6 text-red-500" />
            <span className="ml-2 text-red-500">{error}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-[var(--zalama-border)] bg-[var(--zalama-bg)]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-[var(--zalama-text)] flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Transactions ({transactions.length})
            </CardTitle>
            <CardDescription className="text-[var(--zalama-text-secondary)]">
              Historique des paiements effectués
            </CardDescription>
          </div>
          <Button
            onClick={handleRefresh}
            disabled={loading}
            variant="outline"
            size="sm"
            className="border-[var(--zalama-border)] text-[var(--zalama-text)] hover:bg-[var(--zalama-bg-light)]"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <div className="text-center py-8 text-[var(--zalama-text-secondary)]">
            <CreditCard className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Aucune transaction trouvée</p>
            <p className="text-sm">Les transactions apparaîtront ici après effectuation de paiements</p>
          </div>
        ) : (
          <div className="space-y-4">
            {transactions.slice(0, 10).map((transaction) => (
              <div
                key={transaction.id}
                onClick={() => handleTransactionClick(transaction)}
                className={`p-4 border border-[var(--zalama-border)] rounded-lg cursor-pointer transition-colors hover:bg-[var(--zalama-bg-light)] ${
                  onTransactionSelect ? 'hover:border-[var(--zalama-blue)]' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(transaction.statut)}
                    <span className="font-medium text-[var(--zalama-text)]">
                      {formatAmount(transaction.montant)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(transaction.statut)}
                    <span className="text-xs text-[var(--zalama-text-secondary)]">
                      {formatDate(transaction.date_creation)}
                    </span>
                    <Button
                      size="icon"
                      variant="outline"
                      className="ml-2 border-[var(--zalama-border)]"
                      onClick={e => { e.stopPropagation(); handleVerifyStatus(transaction); }}
                      disabled={verifyingId === transaction.id}
                      title="Vérifier le statut"
                    >
                      {verifyingId === transaction.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <RefreshCw className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm text-[var(--zalama-text)] font-medium">
                    {transaction.description}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-[var(--zalama-text-secondary)]">
                    <span>ID: {transaction.numero_transaction.slice(0, 8)}...</span>
                    <span>Tél: {transaction.numero_compte}</span>
                    <span>Méthode: {transaction.methode_paiement}</span>
                  </div>
                  {transaction.numero_reception && (
                    <p className="text-xs text-[var(--zalama-text-secondary)]">
                      Reçu par: {transaction.numero_reception}
                    </p>
                  )}
                </div>
              </div>
            ))}
            
            {transactions.length > 10 && (
              <div className="text-center pt-4">
                <p className="text-sm text-[var(--zalama-text-secondary)]">
                  Affichage des 10 dernières transactions sur {transactions.length} au total
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 
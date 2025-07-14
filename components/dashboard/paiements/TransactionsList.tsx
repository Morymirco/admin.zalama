import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Transaction, useTransactions } from '@/hooks/useTransactions';
import { AlertCircle, CheckCircle, Clock, CreditCard, Eye, Loader2, RefreshCw, XCircle } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';

interface TransactionsListProps {
  onTransactionSelect?: (transaction: Transaction) => void;
  filters?: {
    status: string;
    method: string;
    dateRange: string;
    search: string;
  };
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'PAYE':
    case 'EFFECTUEE':
      return <CheckCircle className="w-4 h-4 text-green-600" />;
    case 'ECHOUE':
    case 'ANNULEE':
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
    case 'ANNULEE':
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Annulé</Badge>;
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

export const TransactionsList: React.FC<TransactionsListProps> = ({ 
  onTransactionSelect, 
  filters = { status: 'all', method: 'all', dateRange: 'all', search: '' },
  sortBy = 'date_creation',
  sortOrder = 'desc'
}) => {
  const { 
    transactions, 
    loading, 
    error, 
    refreshTransactions 
  } = useTransactions();

  const [verifyingId, setVerifyingId] = useState<string | null>(null);

  // Fonction pour filtrer et trier les transactions
  const getFilteredAndSortedTransactions = () => {
    let filtered = [...transactions];

    // Filtre par recherche
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(transaction => 
        transaction.numero_transaction.toLowerCase().includes(searchLower) ||
        transaction.numero_compte.toLowerCase().includes(searchLower) ||
        transaction.description.toLowerCase().includes(searchLower)
      );
    }

    // Filtre par statut
    if (filters.status !== 'all') {
      filtered = filtered.filter(transaction => transaction.statut === filters.status);
    }

    // Filtre par méthode de paiement
    if (filters.method !== 'all') {
      filtered = filtered.filter(transaction => transaction.methode_paiement === filters.method);
    }

    // Tri
    filtered.sort((a, b) => {
      let aValue: string | number | Date, bValue: string | number | Date;

      switch (sortBy) {
        case 'montant':
          aValue = a.montant;
          bValue = b.montant;
          break;
        case 'statut':
          aValue = a.statut;
          bValue = b.statut;
          break;
        case 'date_creation':
        default:
          aValue = new Date(a.date_creation);
          bValue = new Date(b.date_creation);
          break;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  };

  const filteredTransactions = getFilteredAndSortedTransactions();

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
          
          // Toujours rafraîchir la liste après une vérification réussie
          console.log('🔄 Rafraîchissement de la liste des transactions...');
          await refreshTransactions();
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

  if (loading && filteredTransactions.length === 0) {
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
              Transactions ({filteredTransactions.length})
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
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-8 text-[var(--zalama-text-secondary)]">
            <CreditCard className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Aucune transaction trouvée</p>
            <p className="text-sm">
              {filters.search || filters.status !== 'all' || filters.method !== 'all' 
                ? 'Aucune transaction ne correspond aux filtres appliqués' 
                : 'Les transactions apparaîtront ici après effectuation de paiements'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTransactions.map((transaction) => (
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
                      className="ml-2 border-[var(--zalama-border)] hover:bg-[var(--zalama-blue)] hover:text-white hover:border-[var(--zalama-blue)] transition-colors"
                      onClick={e => { e.stopPropagation(); handleVerifyStatus(transaction); }}
                      disabled={verifyingId === transaction.id}
                      title="Vérifier le statut actuel"
                    >
                      {verifyingId === transaction.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Eye className="w-4 h-4" />
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
            
            {filteredTransactions.length !== transactions.length && (
              <div className="text-center pt-4">
                <p className="text-sm text-[var(--zalama-text-secondary)]">
                  Affichage de {filteredTransactions.length} transaction(s) filtrée(s) sur {transactions.length} au total
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 
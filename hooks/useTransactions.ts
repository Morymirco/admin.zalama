import { useState, useEffect, useCallback } from 'react';

export interface Transaction {
  id: string;
  montant: number;
  numero_transaction: string;
  methode_paiement: string;
  numero_compte: string;
  description: string;
  entreprise_id: string | null;
  statut: 'EN_ATTENTE' | 'PAYE' | 'ECHOUE' | 'EFFECTUEE';
  date_creation: string;
  date_transaction: string | null;
  numero_reception?: string;
  message_callback?: string;
  created_at: string;
  updated_at: string;
}

interface UseTransactionsReturn {
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
  refreshTransactions: () => Promise<void>;
  addTransaction: (transaction: Transaction) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  getTransactionByPayId: (payId: string) => Transaction | undefined;
}

export const useTransactions = (): UseTransactionsReturn => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Charger les transactions
  const loadTransactions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/payments/transactions');
      const data = await response.json();
      
      if (response.ok) {
        setTransactions(data.transactions || []);
      } else {
        setError(data.error || 'Erreur lors du chargement des transactions');
      }
    } catch (err) {
      setError('Erreur de connexion lors du chargement des transactions');
      console.error('Erreur loadTransactions:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Rafraîchir les transactions
  const refreshTransactions = useCallback(async () => {
    await loadTransactions();
  }, [loadTransactions]);

  // Ajouter une transaction
  const addTransaction = useCallback((transaction: Transaction) => {
    setTransactions(prev => [transaction, ...prev]);
  }, []);

  // Mettre à jour une transaction
  const updateTransaction = useCallback((id: string, updates: Partial<Transaction>) => {
    setTransactions(prev => 
      prev.map(tx => 
        tx.id === id ? { ...tx, ...updates } : tx
      )
    );
  }, []);

  // Obtenir une transaction par pay_id
  const getTransactionByPayId = useCallback((payId: string) => {
    return transactions.find(tx => tx.numero_transaction === payId);
  }, [transactions]);

  // Charger les transactions au montage
  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  // Rafraîchir automatiquement toutes les 30 secondes
  useEffect(() => {
    const interval = setInterval(() => {
      refreshTransactions();
    }, 30000); // 30 secondes

    return () => clearInterval(interval);
  }, [refreshTransactions]);

  return {
    transactions,
    loading,
    error,
    refreshTransactions,
    addTransaction,
    updateTransaction,
    getTransactionByPayId
  };
}; 
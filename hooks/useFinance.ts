import { useState, useEffect, useCallback } from 'react';
import financeService, { FinanceStats, ChartData } from '@/services/financeService';
import { FinancialTransaction } from '@/types/employee';

interface UseFinanceReturn {
  // Données
  transactions: FinancialTransaction[];
  stats: FinanceStats | null;
  chartData: ChartData | null;
  
  // États de chargement
  loading: boolean;
  statsLoading: boolean;
  chartLoading: boolean;
  
  // Erreurs
  error: string | null;
  statsError: string | null;
  chartError: string | null;
  
  // Actions
  refreshData: () => Promise<void>;
  refreshStats: () => Promise<void>;
  refreshCharts: () => Promise<void>;
  createTransaction: (data: Partial<FinancialTransaction>) => Promise<FinancialTransaction>;
  updateTransaction: (id: string, data: Partial<FinancialTransaction>) => Promise<FinancialTransaction>;
  deleteTransaction: (id: string) => Promise<void>;
}

export const useFinance = (): UseFinanceReturn => {
  // États pour les données
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [stats, setStats] = useState<FinanceStats | null>(null);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  
  // États de chargement
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(true);
  
  // États d'erreur
  const [error, setError] = useState<string | null>(null);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [chartError, setChartError] = useState<string | null>(null);

  // Charger les transactions
  const loadTransactions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await financeService.getAllTransactions();
      setTransactions(data);
    } catch (err) {
      console.error('Erreur lors du chargement des transactions:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des transactions');
    } finally {
      setLoading(false);
    }
  }, []);

  // Charger les statistiques
  const loadStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      setStatsError(null);
      const data = await financeService.getFinanceStats();
      setStats(data);
    } catch (err) {
      console.error('Erreur lors du chargement des statistiques:', err);
      setStatsError(err instanceof Error ? err.message : 'Erreur lors du chargement des statistiques');
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // Charger les données de graphiques
  const loadChartData = useCallback(async () => {
    try {
      setChartLoading(true);
      setChartError(null);
      const data = await financeService.getChartData();
      setChartData(data);
    } catch (err) {
      console.error('Erreur lors du chargement des graphiques:', err);
      setChartError(err instanceof Error ? err.message : 'Erreur lors du chargement des graphiques');
    } finally {
      setChartLoading(false);
    }
  }, []);

  // Actions CRUD
  const createTransaction = useCallback(async (data: Partial<FinancialTransaction>): Promise<FinancialTransaction> => {
    try {
      const newTransaction = await financeService.createTransaction(data);
      setTransactions(prev => [newTransaction, ...prev]);
      await loadStats(); // Recharger les statistiques
      return newTransaction;
    } catch (err) {
      console.error('Erreur lors de la création de la transaction:', err);
      throw err;
    }
  }, [loadStats]);

  const updateTransaction = useCallback(async (id: string, data: Partial<FinancialTransaction>): Promise<FinancialTransaction> => {
    try {
      const updatedTransaction = await financeService.updateTransaction(id, data);
      setTransactions(prev => prev.map(t => t.id === id ? updatedTransaction : t));
      await loadStats(); // Recharger les statistiques
      return updatedTransaction;
    } catch (err) {
      console.error('Erreur lors de la mise à jour de la transaction:', err);
      throw err;
    }
  }, [loadStats]);

  const deleteTransaction = useCallback(async (id: string): Promise<void> => {
    try {
      await financeService.deleteTransaction(id);
      setTransactions(prev => prev.filter(t => t.id !== id));
      await loadStats(); // Recharger les statistiques
    } catch (err) {
      console.error('Erreur lors de la suppression de la transaction:', err);
      throw err;
    }
  }, [loadStats]);

  // Fonctions de rafraîchissement
  const refreshData = useCallback(async () => {
    await Promise.all([
      loadTransactions(),
      loadStats(),
      loadChartData()
    ]);
  }, [loadTransactions, loadStats, loadChartData]);

  const refreshStats = useCallback(async () => {
    await loadStats();
  }, [loadStats]);

  const refreshCharts = useCallback(async () => {
    await loadChartData();
  }, [loadChartData]);

  // Charger les données au montage
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  return {
    // Données
    transactions,
    stats,
    chartData,
    
    // États de chargement
    loading,
    statsLoading,
    chartLoading,
    
    // Erreurs
    error,
    statsError,
    chartError,
    
    // Actions
    refreshData,
    refreshStats,
    refreshCharts,
    createTransaction,
    updateTransaction,
    deleteTransaction,
  };
}; 
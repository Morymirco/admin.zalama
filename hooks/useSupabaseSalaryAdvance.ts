import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  SalaryAdvanceRequest, 
  Transaction, 
  SalaryAdvanceRequestFormData, 
  TransactionFormData,
  UISalaryAdvanceRequest,
  UITransaction,
  TransactionStatus,
  TransactionStatut
} from '@/types/salaryAdvanceRequest';
import salaryAdvanceService from '@/services/salaryAdvanceService';
import { supabase } from '@/lib/supabase';

interface UseSupabaseSalaryAdvanceReturn {
  // Demandes
  requests: UISalaryAdvanceRequest[];
  filteredRequests: UISalaryAdvanceRequest[];
  isLoading: boolean;
  error: string | null;
  stats: {
    total: number;
    enAttente: number;
    approuvees: number;
    rejetees: number;
    montantTotal: number;
    montantMoyen: number;
    parStatut: Record<string, number>;
    parPartenaire: Record<string, number>;
  } | null;
  statsLoading: boolean;
  
  // Transactions
  transactions: UITransaction[];
  filteredTransactions: UITransaction[];
  transactionsLoading: boolean;
  
  // Filtres et recherche
  searchTerm: string;
  statusFilter: string;
  partnerFilter: string;
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  statuses: string[];
  partners: string[];
  
  // Actions pour les demandes
  setSearchTerm: (term: string) => void;
  setStatusFilter: (status: string) => void;
  setPartnerFilter: (partner: string) => void;
  setCurrentPage: (page: number) => void;
  refreshRequests: () => Promise<void>;
  createRequest: (requestData: SalaryAdvanceRequestFormData) => Promise<SalaryAdvanceRequest>;
  updateRequest: (id: string, requestData: Partial<SalaryAdvanceRequest>) => Promise<SalaryAdvanceRequest>;
  approveRequest: (id: string, motif?: string) => Promise<SalaryAdvanceRequest>;
  rejectRequest: (id: string, motif_rejet: string) => Promise<SalaryAdvanceRequest>;
  deleteRequest: (id: string) => Promise<void>;
  searchRequests: (query: string) => Promise<SalaryAdvanceRequest[]>;
  
  // Actions pour les transactions
  refreshTransactions: () => Promise<void>;
  createTransaction: (transactionData: TransactionFormData) => Promise<Transaction>;
  updateTransactionStatus: (id: string, statut: TransactionStatut) => Promise<Transaction>;
}

// Fonction utilitaire pour convertir SalaryAdvanceRequest en UISalaryAdvanceRequest
const convertToUIRequest = (request: SalaryAdvanceRequest): UISalaryAdvanceRequest => {
  const getStatusColor = (statut: TransactionStatus) => {
    switch (statut) {
      case 'En attente': return 'text-yellow-600 bg-yellow-100';
      case 'Validé': return 'text-green-600 bg-green-100';
      case 'Rejeté': return 'text-red-600 bg-red-100';
      case 'Annulé': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (statut: TransactionStatus) => {
    switch (statut) {
      case 'En attente': return '⏳';
      case 'Validé': return '✅';
      case 'Rejeté': return '❌';
      case 'Annulé': return '🚫';
      default: return '📋';
    }
  };

  return {
    ...request,
    dateCreation: request.date_creation?.toISOString() || new Date().toISOString(),
    dateValidation: request.date_validation?.toISOString(),
    dateRejet: request.date_rejet?.toISOString(),
    createdAt: request.created_at?.toISOString() || new Date().toISOString(),
    updatedAt: request.updated_at?.toISOString() || new Date().toISOString(),
    employeNom: request.employe ? `${request.employe.prenom} ${request.employe.nom}` : 'Inconnu',
    partenaireNom: request.partenaire?.nom || 'Inconnu',
    statutColor: getStatusColor(request.statut),
    statutIcon: getStatusIcon(request.statut)
  };
};

// Fonction utilitaire pour convertir Transaction en UITransaction
const convertToUITransaction = (transaction: Transaction): UITransaction => {
  const getStatusColor = (statut: TransactionStatut) => {
    switch (statut) {
      case 'EFFECTUEE': return 'text-green-600 bg-green-100';
      case 'EN_COURS': return 'text-blue-600 bg-blue-100';
      case 'ECHEC': return 'text-red-600 bg-red-100';
      case 'ANNULEE': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (statut: TransactionStatut) => {
    switch (statut) {
      case 'EFFECTUEE': return '✅';
      case 'EN_COURS': return '🔄';
      case 'ECHEC': return '❌';
      case 'ANNULEE': return '🚫';
      default: return '📋';
    }
  };

  return {
    ...transaction,
    dateTransaction: transaction.date_transaction?.toISOString() || new Date().toISOString(),
    dateCreation: transaction.date_creation?.toISOString() || new Date().toISOString(),
    createdAt: transaction.created_at?.toISOString() || new Date().toISOString(),
    updatedAt: transaction.updated_at?.toISOString() || new Date().toISOString(),
    employeNom: transaction.employe ? `${transaction.employe.prenom} ${transaction.employe.nom}` : 'Inconnu',
    entrepriseNom: transaction.entreprise?.nom || 'Inconnu',
    statutColor: getStatusColor(transaction.statut),
    statutIcon: getStatusIcon(transaction.statut)
  };
};

export const useSupabaseSalaryAdvance = (itemsPerPage: number = 10): UseSupabaseSalaryAdvanceReturn => {
  // États pour les demandes
  const [requests, setRequests] = useState<UISalaryAdvanceRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<UISalaryAdvanceRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<{
    total: number;
    enAttente: number;
    approuvees: number;
    rejetees: number;
    montantTotal: number;
    montantMoyen: number;
    parStatut: Record<string, number>;
    parPartenaire: Record<string, number>;
  } | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // États pour les transactions
  const [transactions, setTransactions] = useState<UITransaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<UITransaction[]>([]);
  const [transactionsLoading, setTransactionsLoading] = useState(true);

  // États pour les filtres
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('toutes');
  const [partnerFilter, setPartnerFilter] = useState('toutes');
  const [currentPage, setCurrentPage] = useState(1);

  // Calculer le nombre total de pages
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);

  // Extraire les statuts et partenaires uniques
  const statuses = useMemo(() => {
    const uniqueStatuses = ['toutes', ...new Set(requests.map(req => req.statut))];
    return uniqueStatuses.filter(status => status);
  }, [requests]);

  const partners = useMemo(() => {
    const uniquePartners = ['toutes', ...new Set(requests.map(req => req.partenaireNom))];
    return uniquePartners.filter(partner => partner);
  }, [requests]);

  // Charger toutes les demandes
  const fetchRequests = useCallback(async () => {
    try {
      setIsLoading(true);
      const requestsData = await salaryAdvanceService.getAll();
      const uiRequests = requestsData.map(convertToUIRequest);
      setRequests(uiRequests);
      setFilteredRequests(uiRequests);
    } catch (error) {
      console.error('Erreur lors de la récupération des demandes:', error);
      setError(error instanceof Error ? error.message : 'Erreur lors de la récupération des demandes');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Charger toutes les transactions
  const loadTransactions = useCallback(async () => {
    try {
      setTransactionsLoading(true);
      
      const transactionsData = await salaryAdvanceService.getAllTransactions();
      const uiTransactions = transactionsData.map(convertToUITransaction);
      setTransactions(uiTransactions);
      setFilteredTransactions(uiTransactions);
    } catch (err) {
      console.error('Erreur lors du chargement des transactions:', err);
    } finally {
      setTransactionsLoading(false);
    }
  }, []);

  // Charger les statistiques
  const loadStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      const statsData = await salaryAdvanceService.getStats();
      setStats(statsData);
    } catch (err) {
      console.error('Erreur lors du chargement des statistiques:', err);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // Charger les données au montage
  useEffect(() => {
    fetchRequests();
    loadTransactions();
    loadStats();
  }, [fetchRequests, loadTransactions, loadStats]);

  // Filtrer les demandes
  useEffect(() => {
    let filtered = [...requests];
    
    // Filtrage par terme de recherche
    if (searchTerm.trim() !== '') {
      filtered = filtered.filter(request => 
        request.motif.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.type_motif.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.employeNom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.partenaireNom.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filtrage par statut
    if (statusFilter !== 'toutes') {
      filtered = filtered.filter(request => request.statut === statusFilter);
    }
    
    // Filtrage par partenaire
    if (partnerFilter !== 'toutes') {
      filtered = filtered.filter(request => request.partenaireNom === partnerFilter);
    }
    
    setFilteredRequests(filtered);
    setCurrentPage(1); // Réinitialiser à la première page après filtrage
  }, [searchTerm, statusFilter, partnerFilter, requests]);

  // Créer une demande
  const createRequest = useCallback(async (requestData: SalaryAdvanceRequestFormData): Promise<SalaryAdvanceRequest> => {
    try {
      const newRequest = await salaryAdvanceService.create(requestData);
      const uiRequest = convertToUIRequest(newRequest);
      setRequests(prev => [...prev, uiRequest]);
      await loadStats(); // Recharger les statistiques
      return newRequest;
    } catch (err) {
      console.error('Erreur lors de la création de la demande:', err);
      throw err;
    }
  }, [loadStats]);

  // Mettre à jour une demande
  const updateRequest = useCallback(async (id: string, requestData: Partial<SalaryAdvanceRequest>): Promise<SalaryAdvanceRequest> => {
    try {
      const updatedRequest = await salaryAdvanceService.update(id, requestData);
      const uiRequest = convertToUIRequest(updatedRequest);
      setRequests(prev => prev.map(request => request.id === id ? uiRequest : request));
      await loadStats(); // Recharger les statistiques
      return updatedRequest;
    } catch (err) {
      console.error('Erreur lors de la mise à jour de la demande:', err);
      throw err;
    }
  }, [loadStats]);

  // Approuver une demande
  const approveRequest = useCallback(async (id: string, motif?: string): Promise<SalaryAdvanceRequest> => {
    try {
      const approvedRequest = await salaryAdvanceService.approve(id, motif);
      const uiRequest = convertToUIRequest(approvedRequest);
      setRequests(prev => prev.map(request => request.id === id ? uiRequest : request));
      await loadStats(); // Recharger les statistiques
      return approvedRequest;
    } catch (err) {
      console.error('Erreur lors de l\'approbation de la demande:', err);
      throw err;
    }
  }, [loadStats]);

  // Rejeter une demande
  const rejectRequest = useCallback(async (id: string, motif_rejet: string): Promise<SalaryAdvanceRequest> => {
    try {
      const rejectedRequest = await salaryAdvanceService.reject(id, motif_rejet);
      const uiRequest = convertToUIRequest(rejectedRequest);
      setRequests(prev => prev.map(request => request.id === id ? uiRequest : request));
      await loadStats(); // Recharger les statistiques
      return rejectedRequest;
    } catch (err) {
      console.error('Erreur lors du rejet de la demande:', err);
      throw err;
    }
  }, [loadStats]);

  // Supprimer une demande
  const deleteRequest = useCallback(async (id: string): Promise<void> => {
    try {
      await salaryAdvanceService.delete(id);
      setRequests(prev => prev.filter(request => request.id !== id));
      await loadStats(); // Recharger les statistiques
    } catch (err) {
      console.error('Erreur lors de la suppression de la demande:', err);
      throw err;
    }
  }, [loadStats]);

  // Rechercher des demandes
  const searchRequests = useCallback(async (query: string): Promise<SalaryAdvanceRequest[]> => {
    try {
      return await salaryAdvanceService.search(query);
    } catch (err) {
      console.error('Erreur lors de la recherche de demandes:', err);
      throw err;
    }
  }, []);

  // Créer une transaction
  const createTransaction = useCallback(async (transactionData: TransactionFormData): Promise<Transaction> => {
    try {
      const newTransaction = await salaryAdvanceService.createTransaction(transactionData);
      const uiTransaction = convertToUITransaction(newTransaction);
      setTransactions(prev => [...prev, uiTransaction]);
      return newTransaction;
    } catch (err) {
      console.error('Erreur lors de la création de la transaction:', err);
      throw err;
    }
  }, []);

  // Mettre à jour le statut d'une transaction
  const updateTransactionStatus = useCallback(async (id: string, statut: TransactionStatut): Promise<Transaction> => {
    try {
      const updatedTransaction = await salaryAdvanceService.updateTransactionStatus(id, statut);
      const uiTransaction = convertToUITransaction(updatedTransaction);
      setTransactions(prev => prev.map(transaction => transaction.id === id ? uiTransaction : transaction));
      return updatedTransaction;
    } catch (err) {
      console.error('Erreur lors de la mise à jour du statut de la transaction:', err);
      throw err;
    }
  }, []);

  // Rafraîchir les données
  const refreshRequests = useCallback(async () => {
    await fetchRequests();
    await loadStats();
  }, [fetchRequests, loadStats]);

  const refreshTransactions = useCallback(async () => {
    await loadTransactions();
  }, [loadTransactions]);

  return {
    // Demandes
    requests,
    filteredRequests,
    isLoading,
    error,
    stats,
    statsLoading,
    
    // Transactions
    transactions,
    filteredTransactions,
    transactionsLoading,
    
    // Filtres et recherche
    searchTerm,
    statusFilter,
    partnerFilter,
    currentPage,
    totalPages,
    itemsPerPage,
    statuses,
    partners,
    
    // Actions pour les demandes
    setSearchTerm,
    setStatusFilter,
    setPartnerFilter,
    setCurrentPage,
    refreshRequests,
    createRequest,
    updateRequest,
    approveRequest,
    rejectRequest,
    deleteRequest,
    searchRequests,
    
    // Actions pour les transactions
    refreshTransactions,
    createTransaction,
    updateTransactionStatus,
  };
}; 
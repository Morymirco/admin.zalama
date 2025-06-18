import { Transaction } from '@/types/transaction';
import { createFirebaseService } from './firebaseService';
import { where, orderBy, limit, Timestamp } from 'firebase/firestore';

const transactionService = createFirebaseService<Transaction>('transactions');

// Fonctions spécifiques pour les transactions
export const getRecentTransactions = async (count: number = 10) => {
  return transactionService.query([
    orderBy('dateTransaction', 'desc'),
    limit(count)
  ]);
};

export const getTransactionsByUser = async (userId: string) => {
  return transactionService.query([
    where('utilisateurId', '==', userId),
    orderBy('dateTransaction', 'desc')
  ]);
};

export const getTransactionsByStatus = async (status: Transaction['statut']) => {
  return transactionService.query([
    where('statut', '==', status),
    orderBy('dateTransaction', 'desc')
  ]);
};

export const getTransactionsByType = async (type: Transaction['type']) => {
  return transactionService.query([
    where('type', '==', type),
    orderBy('dateTransaction', 'desc')
  ]);
};

export const getTransactionsByDateRange = async (startDate: Date, endDate: Date) => {
  return transactionService.query([
    where('dateTransaction', '>=', Timestamp.fromDate(startDate)),
    where('dateTransaction', '<=', Timestamp.fromDate(endDate)),
    orderBy('dateTransaction', 'desc')
  ]);
};

export const getTransactionsTotal = async () => {
  const transactions = await transactionService.getAll();
  return transactions.reduce((total, transaction) => total + transaction.montant, 0);
};

export const getTransactionsCount = async () => {
  return transactionService.count();
};

export const getTransactionsThisMonthCount = async () => {
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  return transactionService.count([
    where('dateTransaction', '>=', Timestamp.fromDate(firstDayOfMonth))
  ]);
};

export default transactionService;

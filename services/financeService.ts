import { Transaction } from '@/types/transaction';
import { createFirebaseService } from './firebaseService';
import { where, orderBy, limit, Timestamp } from 'firebase/firestore';

const financeService = createFirebaseService<Transaction>('transactions');

// Fonctions spécifiques pour les statistiques financières
export const getMontantTotal = async () => {
  const transactions = await financeService.getAll();
  return transactions.reduce((total, transaction) => total + transaction.montant, 0);
};

export const getMontantDebloque = async () => {
  const transactions = await financeService.query([
    where('type', 'in', ['sortie', 'debit', 'avance']),
    where('statut', '==', 'completee')
  ]);
  return transactions.reduce((total, transaction) => total + transaction.montant, 0);
};

export const getMontantRecupere = async () => {
  const transactions = await financeService.query([
    where('type', 'in', ['entree', 'credit']),
    where('statut', '==', 'completee')
  ]);
  return transactions.reduce((total, transaction) => total + transaction.montant, 0);
};

export const getRevenusGeneres = async () => {
  const transactions = await financeService.query([
    where('type', 'in', ['entree', 'credit']),
    where('statut', '==', 'completee')
  ]);
  
  // Calculer les revenus générés à partir des frais
  return transactions.reduce((total, transaction) => {
    const frais = transaction.frais || 0;
    return total + frais;
  }, 0);
};

export const getTauxRemboursement = async () => {
  const montantDebloque = await getMontantDebloque();
  const montantRecupere = await getMontantRecupere();
  
  if (montantDebloque === 0) return 0;
  return (montantRecupere / montantDebloque) * 100;
};

export default financeService;

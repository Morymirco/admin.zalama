'use client';

import React from 'react';
import { orderBy, limit } from 'firebase/firestore';
import { useFirebaseCollection } from '@/hooks/useFirebaseCollection';
import transactionService from '@/services/transactionService';
import { Transaction } from '@/types/transaction';
import { ArrowUpRight, ArrowDownLeft, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function TransactionsRecentes() {
  // Utiliser notre hook pour récupérer les transactions récentes
  const { data: transactions, loading, error } = useFirebaseCollection<Transaction>(
    transactionService,
    [orderBy('dateTransaction', 'desc'), limit(5)],
    true // Mode temps réel
  );

  // Fonction pour formater les montants
  const formatMontant = (montant: number, devise: string) => {
    return new Intl.NumberFormat('fr-FR', { 
      style: 'currency', 
      currency: devise || 'CDF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(montant);
  };

  // Fonction pour formater les dates
  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Date inconnue';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return formatDistanceToNow(date, { addSuffix: true, locale: fr });
  };

  // Fonction pour déterminer l'icône et la couleur en fonction du type de transaction
  const getTransactionStyle = (type: string) => {
    switch (type) {
      case 'entree':
      case 'credit':
        return {
          icon: <ArrowUpRight className="h-4 w-4 text-green-500" />,
          textColor: 'text-green-500'
        };
      case 'sortie':
      case 'debit':
        return {
          icon: <ArrowDownLeft className="h-4 w-4 text-red-500" />,
          textColor: 'text-red-500'
        };
      default:
        return {
          icon: <Clock className="h-4 w-4 text-yellow-500" />,
          textColor: 'text-yellow-500'
        };
    }
  };

  // État de chargement
  if (loading) {
    return (
      <div className="bg-white dark:bg-[var(--zalama-bg-light)] rounded-lg border border-gray-200 dark:border-[#2c5282] shadow-sm dark:shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4 text-[var(--zalama-blue)]">Transactions Récentes</h2>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--zalama-primary)]"></div>
        </div>
      </div>
    );
  }

  // Gestion des erreurs
  if (error) {
    return (
      <div className="bg-white dark:bg-[var(--zalama-bg-light)] rounded-lg border border-gray-200 dark:border-[#2c5282] shadow-sm dark:shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4 text-[var(--zalama-blue)]">Transactions Récentes</h2>
        <div className="p-4 text-center bg-red-50 dark:bg-red-900/20 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">
            Erreur lors du chargement des transactions
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[var(--zalama-bg-light)] rounded-lg border border-gray-200 dark:border-[#2c5282] shadow-sm dark:shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4 text-[var(--zalama-blue)]">Transactions Récentes</h2>
      
      {transactions.length === 0 ? (
        <div className="p-4 text-center bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-sm text-[var(--zalama-text-secondary)]">
            Aucune transaction récente
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {transactions.map((transaction) => {
            const { icon, textColor } = getTransactionStyle(transaction.type);
            
            return (
              <div 
                key={transaction.id} 
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white dark:bg-gray-700 rounded-full">
                    {icon}
                  </div>
                  <div>
                    <p className="font-medium text-[var(--zalama-text)]">
                      {transaction.description || `Transaction ${transaction.id.slice(0, 6)}`}
                    </p>
                    <p className="text-xs text-[var(--zalama-text-secondary)]">
                      {formatDate(transaction.dateTransaction)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${textColor}`}>
                    {transaction.type === 'entree' || transaction.type === 'credit' ? '+' : '-'} {formatMontant(transaction.montant, transaction.devise)}
                  </p>
                  <p className="text-xs text-[var(--zalama-text-secondary)]">
                    {transaction.statut}
                  </p>
                </div>
              </div>
            );
          })}
          
          <div className="pt-2">
            <button 
              className="w-full py-2 px-4 text-sm font-medium text-[var(--zalama-primary)] hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
            >
              Voir toutes les transactions
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { TrendingUp, ArrowUpRight, ArrowDownRight, DollarSign, PiggyBank, BarChart3 } from 'lucide-react';
import { useSupabaseCollection } from '@/hooks/useSupabaseCollection';
import { transactionService } from '@/services/transactionService';

export default function PerformanceFinanciere() {
  // Utiliser notre hook pour récupérer les transactions
  const { data: transactions, loading: loadingTransactions } = useSupabaseCollection(transactionService);
  
  // États pour les statistiques financières
  const [stats, setStats] = useState({
    montantTotal: 0,
    montantDebloque: 0,
    montantRecupere: 0,
    revenusGeneres: 0,
    tauxRemboursement: 0,
    transactionsCeMois: 0,
    montantCeMois: 0
  });
  
  const [loading, setLoading] = useState(true);

  // Calculer les statistiques financières à partir des transactions
  useEffect(() => {
    const calculateStats = async () => {
      try {
        // Si les transactions sont chargées depuis le hook, nous pouvons les utiliser directement
        if (!loadingTransactions && transactions.length > 0) {
          // Calculer le montant total
          const montantTotal = transactions.filter(t => ['EFFECTUEE'].includes(t.statut)).reduce((total, transaction) => total + (transaction.montant || 0), 0);
          
          // Calculer le montant débloqué (sorties/avances)
          const montantDebloque = transactions
            .filter(t => ['EFFECTUEE'].includes(t.statut))
            .reduce((total, t) => total + (t.montant || 0) * (100 -6.5)/100, 0);
          
          // Calculer le montant récupéré (remboursements/entrées)
          const montantRecupere = transactions
            .filter(t => ['remboursement', 'credit', 'entree'].includes(t.type?.toLowerCase()) && 
                        ['En attente', 'Validé', 'Effectué'].includes(t.statut))
            .reduce((total, t) => total + (t.montant || 0), 0);
          
          // Calculer les revenus générés (frais de service)
          const revenusGeneres = transactions
            .filter(t => ['EFFECTUEE'].includes(t.statut))
            .reduce((total, t) => total + (t.montant || 0) * 6.5/100, 0);
          
          // Calculer le taux de remboursement
          const tauxRemboursement = montantDebloque > 0 ? (montantRecupere / montantDebloque) * 100 : 0;
          
          // Calculer les transactions de ce mois
          const now = new Date();
          const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
          
          const transactionsCeMois = transactions.filter((transaction: Transaction) => {
            if (!transaction.created_at) return false;
            const transactionDate = new Date(transaction.created_at);
            return transactionDate >= firstDayOfMonth;
          });
          
          const montantCeMois = transactionsCeMois.filter(t => ['EFFECTUEE'].includes(t.statut)).reduce((sum, transaction) => sum + (transaction.montant || 0), 0);
          
          setStats({
            montantTotal,
            montantDebloque,
            montantRecupere,
            revenusGeneres,
            tauxRemboursement,
            transactionsCeMois: transactionsCeMois.length,
            montantCeMois
          });
        }
      } catch (error) {
        console.error('Erreur lors du calcul des statistiques financières:', error);
      } finally {
        setLoading(false);
      }
    };
    
    calculateStats();
  }, [transactions, loadingTransactions]);
  
  // Fonction pour formater les montants
  const formatMontant = (montant: number) => {
    return new Intl.NumberFormat('fr-FR', { 
      style: 'currency', 
      currency: 'GNF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(montant);
  };

  // Afficher un spinner pendant le chargement
  if (loading) {
    return (
      <div>
        <h2 className="text-xl font-semibold mb-4 text-[var(--zalama-blue)]">Performance financière</h2>
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[var(--zalama-primary)]"></div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4 text-[var(--zalama-blue)]">Performance financière</h2>
      
      {/* Carte principale avec le montant total */}
      <div className="bg-[var(--zalama-bg-light)] rounded-lg p-3 mb-4 border border-[var(--zalama-border)]">
        <div className="flex justify-between items-center">
          <div>
            <div className="text-sm text-[var(--zalama-text-secondary)]">Montants Financiers</div>
            <div className="text-2xl font-bold text-[var(--zalama-text)]">{formatMontant(stats.montantTotal)}</div>
          </div>
          <div className="bg-[var(--zalama-blue-light)] p-2 rounded-full">
            <DollarSign className="h-6 w-6 text-[var(--zalama-blue)]" />
          </div>
        </div>
      </div>
      
      {/* Grille de statistiques financières */}
      <div className="grid grid-cols-2 gap-3">
        {/* Montant Débloqué */}
        <div className="bg-[var(--zalama-bg-light)] rounded-lg p-3 border border-[var(--zalama-border)]">
          <div className="flex justify-between items-center mb-1">
            <div className="text-sm text-[var(--zalama-text-secondary)]">Montant Débloqué</div>
            <div className="bg-[var(--zalama-success-light)] p-1 rounded-full">
              <ArrowUpRight className="h-4 w-4 text-[var(--zalama-success)]" />
            </div>
          </div>
          <div className="text-lg font-bold text-[var(--zalama-text)]">{formatMontant(stats.montantDebloque)}</div>
        </div>
        
        {/* Montant Récupéré */}
        <div className="bg-[var(--zalama-bg-light)] rounded-lg p-3 border border-[var(--zalama-border)]">
          <div className="flex justify-between items-center mb-1">
            <div className="text-sm text-[var(--zalama-text-secondary)]">Montant Récupéré</div>
            <div className="bg-[var(--zalama-blue-light)] p-1 rounded-full">
              <PiggyBank className="h-4 w-4 text-[var(--zalama-blue)]" />
            </div>
          </div>
          <div className="text-lg font-bold text-[var(--zalama-text)]">{formatMontant(stats.montantRecupere)}</div>
        </div>
        
        {/* Revenus Générés */}
        <div className="bg-[var(--zalama-bg-light)] rounded-lg p-3 border border-[var(--zalama-border)]">
          <div className="flex justify-between items-center mb-1">
            <div className="text-sm text-[var(--zalama-text-secondary)]">Revenus Générés</div>
            <div className="bg-[var(--zalama-warning-light)] p-1 rounded-full">
              <TrendingUp className="h-4 w-4 text-[var(--zalama-warning)]" />
            </div>
          </div>
          <div className="text-lg font-bold text-[var(--zalama-text)]">{formatMontant(stats.revenusGeneres)}</div>
        </div>
        
        {/* Taux Remboursement */}
        <div className="bg-[var(--zalama-bg-light)] rounded-lg p-3 border border-[var(--zalama-border)]">
          <div className="flex justify-between items-center mb-1">
            <div className="text-sm text-[var(--zalama-text-secondary)]">Taux Remboursement</div>
            <div className="bg-[var(--zalama-success-light)] p-1 rounded-full">
              <BarChart3 className="h-4 w-4 text-[var(--zalama-success)]" />
            </div>
          </div>
          <div className="text-lg font-bold text-[var(--zalama-text)]">{Math.round(stats.tauxRemboursement)}%</div>
        </div>
      </div>
      
      {/* Statistiques du mois */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="bg-[var(--zalama-bg-light)] rounded-lg p-3 border border-[var(--zalama-border)]">
          <div className="text-sm text-[var(--zalama-text-secondary)]">Transactions ce mois</div>
          <div className="text-lg font-bold text-[var(--zalama-text)]">{stats.transactionsCeMois}</div>
        </div>
        <div className="bg-[var(--zalama-bg-light)] rounded-lg p-3 border border-[var(--zalama-border)]">
          <div className="text-sm text-[var(--zalama-text-secondary)]">Montant ce mois</div>
          <div className="text-lg font-bold text-[var(--zalama-text)]">{formatMontant(stats.montantCeMois)}</div>
        </div>
      </div>
    </div>
  );
}

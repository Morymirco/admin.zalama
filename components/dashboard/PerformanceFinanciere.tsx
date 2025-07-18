'use client';

import { useSupabaseCollection } from '@/hooks/useSupabaseCollection';
import { transactionService } from '@/services/transactionService';
import { ArrowUpRight, BarChart3, DollarSign, PiggyBank, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';

// ✅ Fonction utilitaire pour les calculs financiers arrondis
const calculerMontantFinancier = (montant: number, pourcentage: number): number => {
  return Math.round(montant * pourcentage / 100);
};

const arrondirMontant = (montant: number): number => {
  return Math.round(montant * 100) / 100; // Arrondir à 2 décimales
};

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
          
          // ✅ AMÉLIORATION : Calculer le montant débloqué avec arrondi
          const montantDebloque = transactions
            .filter(t => ['EFFECTUEE'].includes(t.statut))
            .reduce((total, t) => total + calculerMontantFinancier(t.montant || 0, 93.5), 0); // 100% - 6.5%
          
          // ✅ CORRECTION : Calculer le montant récupéré depuis les remboursements PAYÉS
          let montantRecupere = 0;
          try {
            const remboursementsResponse = await fetch('/api/remboursements?statut=PAYE');
            if (remboursementsResponse.ok) {
              const remboursementsResult = await remboursementsResponse.json();
              if (remboursementsResult.success && remboursementsResult.data) {
                montantRecupere = remboursementsResult.data.reduce((total: number, remb: any) => 
                  total + arrondirMontant(parseFloat(remb.montant_total_remboursement) || 0), 0
                );
              }
            }
          } catch (remboursementError) {
            console.warn('⚠️ Erreur lors de la récupération des remboursements:', remboursementError);
            // Fallback : utiliser 0 si les remboursements ne sont pas disponibles
            montantRecupere = 0;
          }
          
          // ✅ AMÉLIORATION : Calculer les revenus générés avec arrondi (frais de service)
          const revenusGeneres = transactions
            .filter(t => ['EFFECTUEE'].includes(t.statut))
            .reduce((total, t) => total + calculerMontantFinancier(t.montant || 0, 6.5), 0);
          
          // Calculer le taux de remboursement basé sur les vrais remboursements
          const tauxRemboursement = montantDebloque > 0 ? Math.round((montantRecupere / montantDebloque) * 100) : 0;
          
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
            montantTotal: arrondirMontant(montantTotal),
            montantDebloque: arrondirMontant(montantDebloque),
            montantRecupere: arrondirMontant(montantRecupere),
            revenusGeneres: arrondirMontant(revenusGeneres),
            tauxRemboursement,
            transactionsCeMois: transactionsCeMois.length,
            montantCeMois: arrondirMontant(montantCeMois)
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
    }).format(Math.round(montant)); // ✅ Forcer l'arrondi dans l'affichage
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
      <div className="grid grid-cols-2 gap-3 mb-4">
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
          <div className="text-xs text-[var(--zalama-text-secondary)] mt-1">
            Remboursements payés
          </div>
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
          <div className="text-xs text-[var(--zalama-text-secondary)] mt-1">
            Frais de service (6.5%)
          </div>
        </div>
        
        {/* Taux de Remboursement */}
        <div className="bg-[var(--zalama-bg-light)] rounded-lg p-3 border border-[var(--zalama-border)]">
          <div className="flex justify-between items-center mb-1">
            <div className="text-sm text-[var(--zalama-text-secondary)]">Taux Remboursement</div>
            <div className="bg-[var(--zalama-success-light)] p-1 rounded-full">
              <BarChart3 className="h-4 w-4 text-[var(--zalama-success)]" />
            </div>
          </div>
          <div className="text-lg font-bold text-[var(--zalama-text)]">{stats.tauxRemboursement}%</div>
          <div className="text-xs text-[var(--zalama-text-secondary)] mt-1">
            Récupéré / Débloqué
          </div>
        </div>
      </div>
      
      {/* Statistiques du mois */}
      <div className="grid grid-cols-2 gap-3">
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

"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Search, Plus, Edit, Trash2, ChevronLeft, ChevronRight, 
  X, RefreshCw, TrendingUp, TrendingDown, DollarSign, BarChart, PieChart, LineChart
} from 'lucide-react';
import { Timestamp, serverTimestamp } from 'firebase/firestore';

// Services Firebase
import { useFirebaseCollection } from '@/hooks/useFirebaseCollection';
import transactionService, { 
  getTransactionsByDateRange,
  getTransactionsByType,
  getTransactionsByStatus
} from '@/services/transactionService';

// Types
import { Transaction } from '@/types/transaction';

// Interface pour la page finances (adaptation de l'interface Transaction existante)
interface FinanceTransaction extends Omit<Transaction, 'type' | 'statut'> {
  type: 'revenu' | 'depense';
  date: string; // Format YYYY-MM-DD pour l'affichage
  statut: 'complete' | 'en cours' | 'annulee';
  categorie: string;
}

export default function FinancesPage() {
  // États
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentTransaction, setCurrentTransaction] = useState<FinanceTransaction | null>(null);
  const [dateRange, setDateRange] = useState({ debut: '', fin: '' });
  const [typeFilter, setTypeFilter] = useState<'tous' | 'revenu' | 'depense'>('tous');
  
  // Utilisation du hook pour récupérer les transactions depuis Firestore
  const { data: firebaseTransactions, loading: isLoading } = useFirebaseCollection<Transaction>(transactionService);

  // Handlers
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const handleTypeFilterChange = (type: 'tous' | 'revenu' | 'depense') => {
    setTypeFilter(type);
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleDateRangeChange = (field: 'debut' | 'fin', value: string) => {
    setDateRange(prev => ({ ...prev, [field]: value }));
  };

  const handleAddTransaction = () => {
    setShowAddModal(true);
  };

  const handleEditTransaction = (transaction: FinanceTransaction) => {
    setCurrentTransaction(transaction);
    setShowEditModal(true);
  };

  const handleDeleteTransaction = (transaction: FinanceTransaction) => {
    setCurrentTransaction(transaction);
    setShowDeleteModal(true);
  };

  // Convertir les transactions Firebase en format adapté pour l'interface
  const transactions = useMemo(() => {
    return firebaseTransactions.map(transaction => {
      // Mapper les types de transaction Firebase aux types de l'interface finances
      const financeType = ['entree', 'credit'].includes(transaction.type) ? 'revenu' : 'depense';
      
      // Mapper les statuts
      let financeStatut: 'complete' | 'en cours' | 'annulee';
      switch (transaction.statut) {
        case 'complete':
          financeStatut = 'complete';
          break;
        case 'en cours':
          financeStatut = 'en cours';
          break;
        case 'annulee':
        case 'echouee':
          financeStatut = 'annulee';
          break;
        default:
          financeStatut = 'en cours';
      }
      
      // Formater la date pour l'affichage
      const date = transaction.dateTransaction instanceof Timestamp
        ? transaction.dateTransaction.toDate().toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0];
      
      return {
        ...transaction,
        type: financeType,
        statut: financeStatut,
        date,
        categorie: transaction.service || 'Autre',
      } as FinanceTransaction;
    });
  }, [firebaseTransactions]);
  
  // Filtrage des transactions avec useMemo pour éviter les re-rendus inutiles
  const filteredTransactions = useMemo(() => {
    let filtered = [...transactions];
    
    // Filtre par terme de recherche
    if (searchTerm.trim() !== '') {
      filtered = filtered.filter(transaction => 
        (transaction.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (transaction.categorie || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filtre par type (revenu/dépense)
    if (typeFilter !== 'tous') {
      filtered = filtered.filter(transaction => transaction.type === typeFilter);
    }
    
    // Filtre par date
    if (dateRange.debut) {
      filtered = filtered.filter(transaction => {
        const transactionDate = new Date(transaction.date);
        const debutDate = new Date(dateRange.debut);
        return transactionDate >= debutDate;
      });
    }
    if (dateRange.fin) {
      filtered = filtered.filter(transaction => {
        const transactionDate = new Date(transaction.date);
        const finDate = new Date(dateRange.fin);
        return transactionDate <= finDate;
      });
    }
    
    return filtered;
  }, [transactions, searchTerm, typeFilter, dateRange]);

  // Calcul des statistiques financières
  const stats = useMemo(() => {
    if (isLoading || transactions.length === 0) {
      return {
        totalRevenu: 0,
        totalDepense: 0,
        balance: 0,
        transactionsCount: 0,
        revenuCount: 0,
        depenseCount: 0,
        enAttenteCount: 0
      };
    }
    
    const totalRevenu = transactions
      .filter(t => t.type === 'revenu')
      .reduce((sum, t) => sum + t.montant, 0);
      
    const totalDepense = transactions
      .filter(t => t.type === 'depense')
      .reduce((sum, t) => sum + t.montant, 0);
      
    return {
      totalRevenu,
      totalDepense,
      balance: totalRevenu - totalDepense,
      transactionsCount: transactions.length,
      revenuCount: transactions.filter(t => t.type === 'revenu').length,
      depenseCount: transactions.filter(t => t.type === 'depense').length,
      enAttenteCount: transactions.filter(t => t.statut === 'en cours').length
    };
  }, [transactions, isLoading]);

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredTransactions.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);

  // Formulaire d'ajout de transaction
  const handleSubmitAddTransaction = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    
    try {
      // Préparer les données de la transaction
      const type = (form.querySelector('#type') as HTMLSelectElement).value as 'revenu' | 'depense';
      const montant = parseFloat((form.querySelector('#montant') as HTMLInputElement).value);
      const description = (form.querySelector('#description') as HTMLInputElement).value;
      const categorie = (form.querySelector('#categorie') as HTMLInputElement).value;
      const statut = (form.querySelector('#statut') as HTMLSelectElement).value;
      const date = (form.querySelector('#date') as HTMLInputElement).value;
      
      // Convertir le type de l'interface en type Firestore
      const firestoreType = type === 'revenu' ? 'entree' : 'sortie';
      
      // Convertir le statut de l'interface en statut Firestore
      let firestoreStatut: 'complete' | 'en cours' | 'annulee' | 'echouee';
      switch (statut) {
        case 'complete':
          firestoreStatut = 'complete';
          break;
        case 'en_attente':
          firestoreStatut = 'en cours';
          break;
        case 'annulee':
          firestoreStatut = 'annulee';
          break;
        default:
          firestoreStatut = 'en cours';
      }
      
      // Ajouter la transaction à Firestore
      await transactionService.create({
        montant,
        devise: 'GNF',
        type: firestoreType as any,
        statut: firestoreStatut,
        dateTransaction: Timestamp.fromDate(new Date(date)),
        utilisateurId: 'admin', // À remplacer par l'ID de l'utilisateur connecté
        description,
        service: categorie
      });
      
      setShowAddModal(false);
      
      // Notification de succès (à implémenter)
      console.log('Transaction ajoutée avec succès');
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la transaction:', error);
      // Notification d'erreur (à implémenter)
    }
  }, []);

  // Formulaire d'édition de transaction
  const handleSubmitEditTransaction = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTransaction) return;
    
    const form = e.currentTarget as HTMLFormElement;
    
    try {
      // Préparer les données de la transaction
      const type = (form.querySelector('#edit-type') as HTMLSelectElement).value as 'revenu' | 'depense';
      const montant = parseFloat((form.querySelector('#edit-montant') as HTMLInputElement).value);
      const description = (form.querySelector('#edit-description') as HTMLInputElement).value;
      const categorie = (form.querySelector('#edit-categorie') as HTMLInputElement).value;
      const statut = (form.querySelector('#edit-statut') as HTMLSelectElement).value;
      const date = (form.querySelector('#edit-date') as HTMLInputElement).value;
      
      // Convertir le type de l'interface en type Firestore
      const firestoreType = type === 'revenu' ? 'entree' : 'sortie';
      
      // Convertir le statut de l'interface en statut Firestore
      let firestoreStatut: 'complete' | 'en cours' | 'annulee' | 'echouee';
      switch (statut) {
        case 'complete':
          firestoreStatut = 'complete';
          break;
        case 'en_attente':
          firestoreStatut = 'en cours';
          break;
        case 'annulee':
          firestoreStatut = 'annulee';
          break;
        default:
          firestoreStatut = 'en cours';
      }
      
      // Mettre à jour la transaction dans Firestore
      await transactionService.update(currentTransaction.id, {
        montant,
        devise: 'GNF',
        type: firestoreType as any,
        statut: firestoreStatut,
        dateTransaction: Timestamp.fromDate(new Date(date)),
        utilisateurId: 'admin', // À remplacer par l'ID de l'utilisateur connecté
        description,
        service: categorie
      });
      
      setShowEditModal(false);
      setCurrentTransaction(null);
      
      // Notification de succès (à implémenter)
      console.log('Transaction mise à jour avec succès');
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la transaction:', error);
      // Notification d'erreur (à implémenter)
    }
  }, [currentTransaction]);

  // Suppression de transaction
  const handleConfirmDelete = useCallback(async () => {
    if (!currentTransaction) return;
    
    try {
      // Supprimer la transaction de Firestore
      await transactionService.delete(currentTransaction.id);
      
      setShowDeleteModal(false);
      setCurrentTransaction(null);
      
      // Notification de succès (à implémenter)
      console.log('Transaction supprimée avec succès');
    } catch (error) {
      console.error('Erreur lors de la suppression de la transaction:', error);
      // Notification d'erreur (à implémenter)
    }
  }, [currentTransaction]);

  return (
    <div className="p-6">
      {/* Performance financière */}
      <div className="bg-[var(--zalama-card)] rounded-xl shadow-sm p-5 border border-[var(--zalama-border)] mb-6">
        <h2 className="text-xl font-bold mb-4 text-[var(--zalama-text)]">Performance financière</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Première ligne */}
          <div className="border border-[var(--zalama-border)] rounded-lg p-4">
            <p className="text-sm text-[var(--zalama-text-secondary)] mb-1">Montant total de départ</p>
            <p className="text-xl font-bold text-[var(--zalama-text)]">25,000,000 GNF</p>
            <div className="mt-2 flex items-center">
              <span className="text-xs text-[var(--zalama-text-secondary)]">Capital initial</span>
            </div>
          </div>
          
          <div className="border border-[var(--zalama-border)] rounded-lg p-4">
            <p className="text-sm text-[var(--zalama-text-secondary)] mb-1">Montant total débloqué</p>
            <p className="text-xl font-bold text-[var(--zalama-text)]">15,750,000 GNF</p>
            <div className="mt-2 flex items-center">
              <span className="text-xs text-[var(--zalama-text-secondary)]">Avances, prêts, salaires</span>
            </div>
          </div>
          
          <div className="border border-[var(--zalama-border)] rounded-lg p-4">
            <p className="text-sm text-[var(--zalama-text-secondary)] mb-1">Montant total actuel</p>
            <p className="text-xl font-bold text-[var(--zalama-blue)]">{(25000000 - 15750000 + 8500000).toLocaleString()} GNF</p>
            <div className="mt-2 flex items-center">
              <span className="text-xs text-[var(--zalama-text-secondary)]">Solde disponible</span>
            </div>
          </div>
          
          <div className="border border-[var(--zalama-border)] rounded-lg p-4">
            <p className="text-sm text-[var(--zalama-text-secondary)] mb-1">Montant total récupéré</p>
            <p className="text-xl font-bold text-[var(--zalama-success)]">8,500,000 GNF</p>
            <div className="mt-2 flex items-center">
              <span className="text-xs text-[var(--zalama-text-secondary)]">Remboursements</span>
            </div>
          </div>
          
          {/* Deuxième ligne */}
          <div className="border border-[var(--zalama-border)] rounded-lg p-4">
            <p className="text-sm text-[var(--zalama-text-secondary)] mb-1">Taux de remboursement</p>
            <p className="text-xl font-bold text-[var(--zalama-text)]">{Math.round((8500000 / 15750000) * 100)}%</p>
            <div className="mt-2 w-full bg-[var(--zalama-bg-lighter)] h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-[var(--zalama-success)] h-full rounded-full" 
                style={{ width: `${Math.round((8500000 / 15750000) * 100)}%` }}
              ></div>
            </div>
          </div>
          
          <div className="border border-[var(--zalama-border)] rounded-lg p-4">
            <p className="text-sm text-[var(--zalama-text-secondary)] mb-1">Revenus par commissions</p>
            <p className="text-xl font-bold text-[var(--zalama-text)]">3,250,000 GNF</p>
            <div className="mt-2 flex items-center gap-2">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-[var(--zalama-blue)]"></div>
                <span className="text-xs text-[var(--zalama-text-secondary)]">Étudiants: 40%</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-[var(--zalama-success)]"></div>
                <span className="text-xs text-[var(--zalama-text-secondary)]">Salariés: 35%</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-[var(--zalama-warning)]"></div>
                <span className="text-xs text-[var(--zalama-text-secondary)]">Entreprises: 25%</span>
              </div>
            </div>
          </div>
          
          <div className="border border-[var(--zalama-border)] rounded-lg p-4 col-span-1 md:col-span-2 lg:col-span-2">
            <p className="text-sm text-[var(--zalama-text-secondary)] mb-1">Bénéfice net / Perte</p>
            <div className="flex items-center gap-2">
              <p className="text-xl font-bold text-[var(--zalama-success)]">+5,750,000 GNF</p>
              <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--zalama-success)]/10 text-[var(--zalama-success)]">+23%</span>
            </div>
            <div className="mt-2 flex items-center">
              <span className="text-xs text-[var(--zalama-text-secondary)]">Calculé sur la base des revenus moins les dépenses</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Résumé financier */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-[var(--zalama-card)] rounded-xl shadow-sm p-5 border border-[var(--zalama-border)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[var(--zalama-text-secondary)]">Total Revenus</p>
              <p className="text-2xl font-bold text-[var(--zalama-success)]">{stats.totalRevenu.toLocaleString()} GNF</p>
            </div>
            <div className="p-3 bg-[var(--zalama-success)]/10 rounded-full">
              <TrendingUp className="h-6 w-6 text-[var(--zalama-success)]" />
            </div>
          </div>
        </div>
        
        <div className="bg-[var(--zalama-card)] rounded-xl shadow-sm p-5 border border-[var(--zalama-border)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[var(--zalama-text-secondary)]">Total Dépenses</p>
              <p className="text-2xl font-bold text-[var(--zalama-danger)]">{stats.totalDepense.toLocaleString()} GNF</p>
            </div>
            <div className="p-3 bg-[var(--zalama-danger)]/10 rounded-full">
              <TrendingDown className="h-6 w-6 text-[var(--zalama-danger)]" />
            </div>
          </div>
        </div>
        
        <div className="bg-[var(--zalama-card)] rounded-xl shadow-sm p-5 border border-[var(--zalama-border)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[var(--zalama-text-secondary)]">Solde</p>
              <p className={`text-2xl font-bold ${stats.balance >= 0 ? 'text-[var(--zalama-success)]' : 'text-[var(--zalama-danger)]'}`}>
                {stats.balance.toLocaleString()} GNF
              </p>
            </div>
            <div className={`p-3 ${stats.balance >= 0 ? 'bg-[var(--zalama-success)]/10' : 'bg-[var(--zalama-danger)]/10'} rounded-full`}>
              <DollarSign className={`h-6 w-6 ${stats.balance >= 0 ? 'text-[var(--zalama-success)]' : 'text-[var(--zalama-danger)]'}`} />
            </div>
          </div>
        </div>
      </div>
      
      {/* Section des graphiques et statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Graphique de répartition revenus/dépenses */}
        <div className="bg-[var(--zalama-card)] rounded-xl shadow-sm p-5 border border-[var(--zalama-border)]">
          <h3 className="text-lg font-semibold text-[var(--zalama-text)] mb-4">Répartition Revenus/Dépenses</h3>
          <div className="flex items-center justify-center h-64">
            <div className="relative w-48 h-48">
              {/* Cercle représentant le graphique en camembert */}
              <div className="absolute inset-0 rounded-full overflow-hidden">
                <div 
                  className="absolute top-0 left-0 bg-[var(--zalama-blue)] h-full" 
                  style={{ width: `${(stats.totalRevenu / (stats.totalRevenu + stats.totalDepense || 1)) * 100}%` }}
                ></div>
                <div 
                  className="absolute top-0 right-0 bg-[var(--zalama-danger)] h-full" 
                  style={{ width: `${(stats.totalDepense / (stats.totalRevenu + stats.totalDepense || 1)) * 100}%` }}
                ></div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <PieChart className="h-10 w-10 text-[var(--zalama-text-secondary)] mb-2" />
                <span className="text-sm font-medium text-[var(--zalama-text)]">
                  {Math.round((stats.totalRevenu / (stats.totalRevenu + stats.totalDepense || 1)) * 100)}% / {Math.round((stats.totalDepense / (stats.totalRevenu + stats.totalDepense || 1)) * 100)}%
                </span>
              </div>
            </div>
          </div>
          <div className="flex justify-center gap-6 mt-4">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-[var(--zalama-blue)] mr-2"></div>
              <span className="text-sm text-[var(--zalama-text)]">Revenus</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-[var(--zalama-danger)] mr-2"></div>
              <span className="text-sm text-[var(--zalama-text)]">Dépenses</span>
            </div>
          </div>
        </div>
        
        {/* Graphique d'évolution mensuelle */}
        <div className="bg-[var(--zalama-card)] rounded-xl shadow-sm p-5 border border-[var(--zalama-border)]">
          <h3 className="text-lg font-semibold text-[var(--zalama-text)] mb-4">Évolution Mensuelle</h3>
          <div className="h-64 flex items-end justify-between gap-2 pt-5">
            {/* Barres du graphique */}
            {['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'].map((month) => {
              // Valeurs aléatoires pour la démo
              const revenueHeight = 30 + Math.random() * 70;
              const expenseHeight = 20 + Math.random() * 60;
              
              return (
                <div key={month} className="flex flex-col items-center flex-1">
                  <div className="w-full flex justify-center gap-1">
                    <div 
                      className="w-5 bg-[var(--zalama-blue)] rounded-t" 
                      style={{ height: `${revenueHeight}%` }}
                    ></div>
                    <div 
                      className="w-5 bg-[var(--zalama-danger)] rounded-t" 
                      style={{ height: `${expenseHeight}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-[var(--zalama-text-secondary)] mt-2">{month}</span>
                </div>
              );
            })}
          </div>
          <div className="flex justify-center gap-6 mt-4">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-sm bg-[var(--zalama-blue)] mr-2"></div>
              <span className="text-sm text-[var(--zalama-text)]">Revenus</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-sm bg-[var(--zalama-danger)] mr-2"></div>
              <span className="text-sm text-[var(--zalama-text)]">Dépenses</span>
            </div>
          </div>
        </div>
        
        {/* Graphique des catégories de dépenses */}
        <div className="bg-[var(--zalama-card)] rounded-xl shadow-sm p-5 border border-[var(--zalama-border)]">
          <h3 className="text-lg font-semibold text-[var(--zalama-text)] mb-4">Répartition par Catégorie</h3>
          <div className="h-64 flex flex-col gap-3 overflow-y-auto pr-2">
            {/* Barres horizontales pour chaque catégorie */}
            {['Salaires', 'Équipement', 'Marketing', 'Loyer', 'Services', 'Autres'].map((category, i) => {
              // Valeurs aléatoires pour la démo
              const percentage = 20 + Math.random() * 80;
              const isRevenue = i % 2 === 0;
              
              return (
                <div key={category} className="flex flex-col">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-[var(--zalama-text)]">{category}</span>
                    <span className="text-sm font-medium text-[var(--zalama-text)]">{Math.round(percentage)}%</span>
                  </div>
                  <div className="w-full h-2 bg-[var(--zalama-bg-lighter)] rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${isRevenue ? 'bg-[var(--zalama-blue)]' : 'bg-[var(--zalama-danger)]'}`} 
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex justify-center mt-4">
            <BarChart className="h-5 w-5 text-[var(--zalama-text-secondary)] mr-2" />
            <span className="text-sm text-[var(--zalama-text)]">Basé sur les 6 derniers mois</span>
          </div>
        </div>
        
        {/* Tendances et prévisions */}
        <div className="bg-[var(--zalama-card)] rounded-xl shadow-sm p-5 border border-[var(--zalama-border)]">
          <h3 className="text-lg font-semibold text-[var(--zalama-text)] mb-4">Tendances et Prévisions</h3>
          <div className="h-64 flex items-center justify-center">
            <div className="w-full h-40 relative">
              {/* Ligne de tendance */}
              <div className="absolute inset-0 flex items-center">
                <div className="w-full h-px bg-[var(--zalama-border)] relative">
                  {/* Points sur la ligne */}
                  {[10, 30, 20, 40, 35, 50, 45, 60].map((value, i) => {
                    const position = (i / 7) * 100;
                    return (
                      <div 
                        key={i} 
                        className="absolute w-2 h-2 rounded-full bg-[var(--zalama-blue)] transform -translate-x-1 -translate-y-1" 
                        style={{ left: `${position}%`, top: `${100 - value}%` }}
                      ></div>
                    );
                  })}
                  
                  {/* Ligne reliant les points */}
                  <svg className="absolute inset-0 w-full h-full" style={{ top: '-50%', height: '200%' }}>
                    <polyline 
                      points="0,90 14.3,70 28.6,80 42.9,60 57.1,65 71.4,50 85.7,55 100,40" 
                      fill="none" 
                      stroke="var(--zalama-blue)" 
                      strokeWidth="2"
                    />
                    <polyline 
                      points="71.4,50 85.7,55 100,40 114.3,35" 
                      fill="none" 
                      stroke="var(--zalama-blue)" 
                      strokeWidth="2"
                      strokeDasharray="4"
                      opacity="0.6"
                    />
                  </svg>
                </div>
              </div>
              
              {/* Indicateur de tendance */}
              <div className="absolute bottom-0 right-0 flex items-center gap-2">
                <LineChart className="h-5 w-5 text-[var(--zalama-success)]" />
                <span className="text-sm font-medium text-[var(--zalama-success)]">+12% prévus</span>
              </div>
            </div>
          </div>
          <div className="flex justify-between mt-4">
            <span className="text-xs text-[var(--zalama-text-secondary)]">Janv</span>
            <span className="text-xs text-[var(--zalama-text-secondary)]">Fév</span>
            <span className="text-xs text-[var(--zalama-text-secondary)]">Mars</span>
            <span className="text-xs text-[var(--zalama-text-secondary)]">Avr</span>
            <span className="text-xs text-[var(--zalama-text-secondary)]">Mai</span>
            <span className="text-xs text-[var(--zalama-text-secondary)]">Juin</span>
            <span className="text-xs text-[var(--zalama-text-secondary)]">Juil</span>
            <span className="text-xs text-[var(--zalama-text-secondary)] font-medium">Août (prév.)</span>
          </div>
        </div>
      </div>
      
      {/* Barre d'outils et filtres */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="relative w-full md:w-64">
          <input
            type="text"
            placeholder="Rechercher..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)]"
            value={searchTerm}
            onChange={handleSearch}
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-[var(--zalama-text-secondary)]" />
        </div>
        
        <div className="flex flex-wrap gap-2">
          <button 
            className="flex items-center gap-2 px-4 py-2 bg-[var(--zalama-blue)] hover:bg-[var(--zalama-blue-accent)] text-white rounded-lg transition-colors"
            onClick={handleAddTransaction}
          >
            <Plus className="h-4 w-4" />
            Ajouter
          </button>
          
          <div className="flex items-center gap-2">
            <button 
              className={`px-4 py-2 rounded-lg transition-colors ${
                typeFilter === 'tous' 
                  ? 'bg-[var(--zalama-blue)] text-white' 
                  : 'bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)] border border-[var(--zalama-border)]'
              }`}
              onClick={() => handleTypeFilterChange('tous')}
            >
              Tous
            </button>
            <button 
              className={`px-4 py-2 rounded-lg transition-colors ${
                typeFilter === 'revenu' 
                  ? 'bg-[var(--zalama-success)] text-white' 
                  : 'bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)] border border-[var(--zalama-border)]'
              }`}
              onClick={() => handleTypeFilterChange('revenu')}
            >
              Revenus
            </button>
            <button 
              className={`px-4 py-2 rounded-lg transition-colors ${
                typeFilter === 'depense' 
                  ? 'bg-[var(--zalama-danger)] text-white' 
                  : 'bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)] border border-[var(--zalama-border)]'
              }`}
              onClick={() => handleTypeFilterChange('depense')}
            >
              Dépenses
            </button>
          </div>
        </div>
      </div>
      
      {/* Tableau des transactions */}
      <div className="bg-[var(--zalama-card)] rounded-xl shadow-sm border border-[var(--zalama-border)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[var(--zalama-bg-light)]">
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--zalama-text-secondary)] uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--zalama-text-secondary)] uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--zalama-text-secondary)] uppercase tracking-wider">Catégorie</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--zalama-text-secondary)] uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--zalama-text-secondary)] uppercase tracking-wider">Montant</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--zalama-text-secondary)] uppercase tracking-wider">Statut</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-[var(--zalama-text-secondary)] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--zalama-border)]">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-[var(--zalama-text)]">
                    <div className="flex justify-center items-center">
                      <RefreshCw className="h-5 w-5 animate-spin mr-2" />
                      Chargement...
                    </div>
                  </td>
                </tr>
              ) : currentItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-[var(--zalama-text)]">
                    Aucune transaction trouvée
                  </td>
                </tr>
              ) : (
                currentItems.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-[var(--zalama-bg-lighter)]">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--zalama-text)]">{transaction.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--zalama-text)]">{transaction.description}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--zalama-text)]">{transaction.categorie}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        transaction.type === 'revenu' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                          : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {transaction.type === 'revenu' ? 'Revenu' : 'Dépense'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <span className={transaction.type === 'revenu' ? 'text-[var(--zalama-success)]' : 'text-[var(--zalama-danger)]'}>
                        {transaction.type === 'revenu' ? '+' : '-'} {(transaction.montant !== undefined ? transaction.montant : 0).toLocaleString()} GNF
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        transaction.statut === 'complete' 
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' 
                          : transaction.statut === 'en cours'
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                      }`}>
                        {transaction.statut === 'complete' ? 'Complété' : transaction.statut === 'en cours' ? 'En cours' : 'Annulé'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => handleEditTransaction(transaction)}
                          className="p-1 text-[var(--zalama-blue)] hover:bg-[var(--zalama-blue)]/10 rounded"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteTransaction(transaction)}
                          className="p-1 text-[var(--zalama-danger)] hover:bg-[var(--zalama-danger)]/10 rounded"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="px-6 py-3 flex items-center justify-between border-t border-[var(--zalama-border)]">
          <div className="text-sm text-[var(--zalama-text-secondary)]">
            Affichage de {indexOfFirstItem + 1} à {Math.min(indexOfLastItem, filteredTransactions.length)} sur {filteredTransactions.length} transactions
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`p-2 rounded ${
                currentPage === 1 
                  ? 'text-[var(--zalama-text-secondary)] cursor-not-allowed' 
                  : 'text-[var(--zalama-text)] hover:bg-[var(--zalama-bg-lighter)]'
              }`}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-3 py-1 rounded ${
                  currentPage === page 
                    ? 'bg-[var(--zalama-blue)] text-white' 
                    : 'text-[var(--zalama-text)] hover:bg-[var(--zalama-bg-lighter)]'
                }`}
              >
                {page}
              </button>
            ))}
            
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`p-2 rounded ${
                currentPage === totalPages 
                  ? 'text-[var(--zalama-text-secondary)] cursor-not-allowed' 
                  : 'text-[var(--zalama-text)] hover:bg-[var(--zalama-bg-lighter)]'
              }`}
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Modal d'ajout de transaction */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[var(--zalama-card)] rounded-xl shadow-lg w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-[var(--zalama-text)]">Ajouter une transaction</h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-full hover:bg-[var(--zalama-bg-lighter)]"
              >
                <X className="h-5 w-5 text-[var(--zalama-text)]" />
              </button>
            </div>
            
            <form onSubmit={handleSubmitAddTransaction} className="space-y-4">
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-[var(--zalama-text)]">Date</label>
                <input 
                  type="date" 
                  id="date" 
                  className="mt-1 block w-full px-3 py-2 bg-[var(--zalama-bg-lighter)] border border-[var(--zalama-border)] rounded-md text-[var(--zalama-text)]" 
                  required 
                />
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-[var(--zalama-text)]">Description</label>
                <input 
                  type="text" 
                  id="description" 
                  className="mt-1 block w-full px-3 py-2 bg-[var(--zalama-bg-lighter)] border border-[var(--zalama-border)] rounded-md text-[var(--zalama-text)]" 
                  required 
                />
              </div>
              
              <div>
                <label htmlFor="montant" className="block text-sm font-medium text-[var(--zalama-text)]">Montant (GNF)</label>
                <input 
                  type="number" 
                  id="montant" 
                  min="0"
                  step="100"
                  className="mt-1 block w-full px-3 py-2 bg-[var(--zalama-bg-lighter)] border border-[var(--zalama-border)] rounded-md text-[var(--zalama-text)]" 
                  required 
                />
              </div>
              
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-[var(--zalama-text)]">Type</label>
                <select 
                  id="type" 
                  className="mt-1 block w-full px-3 py-2 bg-[var(--zalama-bg-lighter)] border border-[var(--zalama-border)] rounded-md text-[var(--zalama-text)]" 
                  required
                >
                  <option value="revenu">Revenu</option>
                  <option value="depense">Dépense</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="categorie" className="block text-sm font-medium text-[var(--zalama-text)]">Catégorie</label>
                <input 
                  type="text" 
                  id="categorie" 
                  className="mt-1 block w-full px-3 py-2 bg-[var(--zalama-bg-lighter)] border border-[var(--zalama-border)] rounded-md text-[var(--zalama-text)]" 
                  required 
                />
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)} 
                  className="px-4 py-2 bg-[var(--zalama-bg-lighter)] hover:bg-[var(--zalama-bg-light)] text-[var(--zalama-text)] rounded-lg border border-[var(--zalama-border)]"
                >
                  Annuler
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-[var(--zalama-blue)] hover:bg-[var(--zalama-blue-accent)] text-white rounded-lg"
                >
                  Ajouter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Modal d'édition de transaction */}
      {showEditModal && currentTransaction && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[var(--zalama-card)] rounded-xl shadow-lg w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-[var(--zalama-text)]">Modifier la transaction</h3>
              <button 
                onClick={() => setShowEditModal(false)}
                className="p-1 rounded-full hover:bg-[var(--zalama-bg-lighter)]"
              >
                <X className="h-5 w-5 text-[var(--zalama-text)]" />
              </button>
            </div>
            
            <form onSubmit={handleSubmitEditTransaction} className="space-y-4">
              <div>
                <label htmlFor="edit-date" className="block text-sm font-medium text-[var(--zalama-text)]">Date</label>
                <input 
                  type="date" 
                  id="edit-date" 
                  defaultValue={currentTransaction.date}
                  className="mt-1 block w-full px-3 py-2 bg-[var(--zalama-bg-lighter)] border border-[var(--zalama-border)] rounded-md text-[var(--zalama-text)]" 
                  required 
                />
              </div>
              
              <div>
                <label htmlFor="edit-description" className="block text-sm font-medium text-[var(--zalama-text)]">Description</label>
                <input 
                  type="text" 
                  id="edit-description" 
                  defaultValue={currentTransaction.description}
                  className="mt-1 block w-full px-3 py-2 bg-[var(--zalama-bg-lighter)] border border-[var(--zalama-border)] rounded-md text-[var(--zalama-text)]" 
                  required 
                />
              </div>
              
              <div>
                <label htmlFor="edit-montant" className="block text-sm font-medium text-[var(--zalama-text)]">Montant (GNF)</label>
                <input 
                  type="number" 
                  id="edit-montant" 
                  min="0"
                  step="100"
                  defaultValue={currentTransaction.montant}
                  className="mt-1 block w-full px-3 py-2 bg-[var(--zalama-bg-lighter)] border border-[var(--zalama-border)] rounded-md text-[var(--zalama-text)]" 
                  required 
                />
              </div>
              
              <div>
                <label htmlFor="edit-type" className="block text-sm font-medium text-[var(--zalama-text)]">Type</label>
                <select 
                  id="edit-type" 
                  defaultValue={currentTransaction.type}
                  className="mt-1 block w-full px-3 py-2 bg-[var(--zalama-bg-lighter)] border border-[var(--zalama-border)] rounded-md text-[var(--zalama-text)]" 
                  required
                >
                  <option value="revenu">Revenu</option>
                  <option value="depense">Dépense</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="edit-categorie" className="block text-sm font-medium text-[var(--zalama-text)]">Catégorie</label>
                <input 
                  type="text" 
                  id="edit-categorie" 
                  defaultValue={currentTransaction.categorie}
                  className="mt-1 block w-full px-3 py-2 bg-[var(--zalama-bg-lighter)] border border-[var(--zalama-border)] rounded-md text-[var(--zalama-text)]" 
                  required 
                />
              </div>
              
              <div>
                <label htmlFor="edit-statut" className="block text-sm font-medium text-[var(--zalama-text)]">Statut</label>
                <select 
                  id="edit-statut" 
                  defaultValue={currentTransaction.statut}
                  className="mt-1 block w-full px-3 py-2 bg-[var(--zalama-bg-lighter)] border border-[var(--zalama-border)] rounded-md text-[var(--zalama-text)]" 
                  required
                >
                  <option value="complete">Complété</option>
                  <option value="en_attente">En attente</option>
                  <option value="annulee">Annulé</option>
                </select>
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <button 
                  type="button" 
                  onClick={() => setShowEditModal(false)} 
                  className="px-4 py-2 bg-[var(--zalama-bg-lighter)] hover:bg-[var(--zalama-bg-light)] text-[var(--zalama-text)] rounded-lg border border-[var(--zalama-border)]"
                >
                  Annuler
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-[var(--zalama-blue)] hover:bg-[var(--zalama-blue-accent)] text-white rounded-lg"
                >
                  Mettre à jour
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Modal de confirmation de suppression */}
      {showDeleteModal && currentTransaction && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[var(--zalama-card)] rounded-xl shadow-lg w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-[var(--zalama-text)]">Confirmer la suppression</h3>
              <button 
                onClick={() => setShowDeleteModal(false)}
                className="p-1 rounded-full hover:bg-[var(--zalama-bg-lighter)]"
              >
                <X className="h-5 w-5 text-[var(--zalama-text)]" />
              </button>
            </div>
            
            <p className="text-[var(--zalama-text)] mb-6">
              Êtes-vous sûr de vouloir supprimer la transaction <span className="font-semibold">{currentTransaction.description}</span> d&apos;un montant de <span className="font-semibold">{currentTransaction.montant.toLocaleString()} GNF</span> ? Cette action est irréversible.
            </p>
            
            <div className="flex justify-end gap-2">
              <button 
                onClick={() => setShowDeleteModal(false)} 
                className="px-4 py-2 bg-[var(--zalama-bg-lighter)] hover:bg-[var(--zalama-bg-light)] text-[var(--zalama-text)] rounded-lg border border-[var(--zalama-border)]"
              >
                Annuler
              </button>
              <button 
                onClick={handleConfirmDelete} 
                className="px-4 py-2 bg-[var(--zalama-danger)] hover:bg-[var(--zalama-danger)]/80 text-white rounded-lg"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

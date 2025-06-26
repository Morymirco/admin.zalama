import React, { useEffect, useState } from 'react';
import salaryAdvanceService from '@/services/salaryAdvanceService';
import { DemandeAvanceSalaire, Transaction } from '@/types/salaryAdvanceRequest';
import { RefreshCw, AlertCircle, User, CheckCircle, XCircle, Clock, DollarSign, FileText, CreditCard } from 'lucide-react';

interface DemandesAvanceSalaireProps {
  partnerId: string;
}

const statusColors: Record<string, string> = {
  'EN_ATTENTE': 'bg-yellow-100 text-yellow-800',
  'APPROUVE': 'bg-blue-100 text-blue-800',
  'REFUSE': 'bg-red-100 text-red-800',
  'PAYE': 'bg-green-100 text-green-800',
  'EFFECTUEE': 'bg-green-100 text-green-800',
  'ANNULEE': 'bg-red-100 text-red-800',
};

const DemandesAvanceSalaire: React.FC<DemandesAvanceSalaireProps> = ({ partnerId }) => {
  const [demandes, setDemandes] = useState<DemandeAvanceSalaire[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'demandes' | 'transactions'>('demandes');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [demandesData, transactionsData] = await Promise.all([
          salaryAdvanceService.getDemandesByPartner(partnerId),
          salaryAdvanceService.getTransactionsByPartner(partnerId)
        ]);
        setDemandes(demandesData);
        setTransactions(transactionsData);
      } catch (err) {
        setError('Erreur lors du chargement des données');
      } finally {
        setLoading(false);
      }
    };
    if (partnerId) fetchData();
  }, [partnerId]);

  const formatMontant = (montant: number) => {
    return new Intl.NumberFormat('fr-FR').format(montant) + ' GNF';
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('fr-FR');
  };

  return (
    <div className="space-y-6">
      {/* En-tête avec onglets */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-[var(--zalama-text)] flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-[var(--zalama-blue)]" />
          Demandes & Transactions
        </h2>
        
        {/* Onglets */}
        <div className="flex gap-1 bg-[var(--zalama-bg-lighter)] rounded-lg p-1">
          <button
            onClick={() => setActiveTab('demandes')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
              activeTab === 'demandes'
                ? 'bg-[var(--zalama-card)] text-[var(--zalama-text)] shadow-sm'
                : 'text-[var(--zalama-text-secondary)] hover:text-[var(--zalama-text)]'
            }`}
          >
            <FileText className="h-4 w-4" />
            Demandes ({demandes.length})
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
              activeTab === 'transactions'
                ? 'bg-[var(--zalama-card)] text-[var(--zalama-text)] shadow-sm'
                : 'text-[var(--zalama-text-secondary)] hover:text-[var(--zalama-text)]'
            }`}
          >
            <CreditCard className="h-4 w-4" />
            Transactions ({transactions.length})
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-[var(--zalama-blue)]" />
          <span className="ml-2 text-[var(--zalama-text)]">Chargement...</span>
        </div>
      ) : error ? (
        <div className="flex items-center gap-2 text-[var(--zalama-danger)]">
          <AlertCircle className="h-5 w-5" />
          {error}
        </div>
      ) : activeTab === 'demandes' ? (
        /* Onglet Demandes */
        <div className="bg-[var(--zalama-card)] rounded-xl p-6 border border-[var(--zalama-border)]">
          <h3 className="text-lg font-semibold mb-4 text-[var(--zalama-text)]">Demandes d'avance sur salaire</h3>
          
          {demandes.length === 0 ? (
            <div className="text-center text-[var(--zalama-text-secondary)] py-8">
              Aucune demande d'avance sur salaire trouvée pour ce partenaire.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--zalama-border)]">
                    <th className="px-4 py-2 text-left">Employé</th>
                    <th className="px-4 py-2 text-left">Montant demandé</th>
                    <th className="px-4 py-2 text-left">Motif</th>
                    <th className="px-4 py-2 text-left">Statut</th>
                    <th className="px-4 py-2 text-left">Date de demande</th>
                    <th className="px-4 py-2 text-left">Traitement</th>
                  </tr>
                </thead>
                <tbody>
                  {demandes.map((demande) => (
                    <tr key={demande.id} className="border-b border-[var(--zalama-border)] hover:bg-[var(--zalama-bg-lighter)]">
                      <td className="px-4 py-2 flex items-center gap-2">
                        <User className="h-4 w-4 text-[var(--zalama-text-secondary)]" />
                        {demande.employe ? `${demande.employe.prenom} ${demande.employe.nom}` : 'Employé inconnu'}
                      </td>
                      <td className="px-4 py-2 font-medium text-[var(--zalama-text)]">
                        {formatMontant(demande.montant_demande)}
                      </td>
                      <td className="px-4 py-2 text-[var(--zalama-text-secondary)] max-w-xs truncate">
                        {demande.motif}
                      </td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColors[demande.statut] || 'bg-gray-100 text-gray-800'}`}>
                          {demande.statut}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-[var(--zalama-text-secondary)]">
                        {formatDate(demande.date_demande)}
                      </td>
                      <td className="px-4 py-2 text-[var(--zalama-text-secondary)]">
                        {demande.date_traitement ? formatDate(demande.date_traitement) : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        /* Onglet Transactions */
        <div className="bg-[var(--zalama-card)] rounded-xl p-6 border border-[var(--zalama-border)]">
          <h3 className="text-lg font-semibold mb-4 text-[var(--zalama-text)]">Transactions</h3>
          
          {transactions.length === 0 ? (
            <div className="text-center text-[var(--zalama-text-secondary)] py-8">
              Aucune transaction trouvée pour ce partenaire.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--zalama-border)]">
                    <th className="px-4 py-2 text-left">Employé</th>
                    <th className="px-4 py-2 text-left">Montant</th>
                    <th className="px-4 py-2 text-left">Méthode de paiement</th>
                    <th className="px-4 py-2 text-left">N° Transaction</th>
                    <th className="px-4 py-2 text-left">Statut</th>
                    <th className="px-4 py-2 text-left">Date transaction</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((transaction) => (
                    <tr key={transaction.id} className="border-b border-[var(--zalama-border)] hover:bg-[var(--zalama-bg-lighter)]">
                      <td className="px-4 py-2 flex items-center gap-2">
                        <User className="h-4 w-4 text-[var(--zalama-text-secondary)]" />
                        {transaction.employe ? `${transaction.employe.prenom} ${transaction.employe.nom}` : 'Employé inconnu'}
                      </td>
                      <td className="px-4 py-2 font-medium text-[var(--zalama-text)]">
                        {formatMontant(transaction.montant)}
                      </td>
                      <td className="px-4 py-2 text-[var(--zalama-text-secondary)]">
                        {transaction.methode_paiement.replace('_', ' ')}
                      </td>
                      <td className="px-4 py-2 text-[var(--zalama-text-secondary)] font-mono">
                        {transaction.numero_transaction}
                      </td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColors[transaction.statut] || 'bg-gray-100 text-gray-800'}`}>
                          {transaction.statut}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-[var(--zalama-text-secondary)]">
                        {formatDate(transaction.date_transaction)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DemandesAvanceSalaire; 
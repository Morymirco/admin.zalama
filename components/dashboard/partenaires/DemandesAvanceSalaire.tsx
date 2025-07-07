import React, { useEffect, useState } from 'react';
import salaryAdvanceService from '@/services/salaryAdvanceService';
import { SalaryAdvanceRequest, Transaction } from '@/types/salaryAdvanceRequest';
import { 
  RefreshCw, 
  AlertCircle, 
  User, 
  CheckCircle, 
  XCircle, 
  Clock, 
  DollarSign, 
  FileText, 
  CreditCard,
  Calendar,
  TrendingUp,
  TrendingDown,
  Eye,
  MoreHorizontal
} from 'lucide-react';
import { useSupabaseSalaryAdvance } from '@/hooks/useSupabaseSalaryAdvance';
import Image from 'next/image';

interface DemandesAvanceSalaireProps {
  partnerId: string;
}

const statusColors: Record<string, string> = {
  'En attente': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'Validé': 'bg-green-100 text-green-800 border-green-200',
  'Rejeté': 'bg-red-100 text-red-800 border-red-200',
  'EFFECTUEE': 'bg-green-100 text-green-800 border-green-200',
  'EN_COURS': 'bg-blue-100 text-blue-800 border-blue-200',
  'ECHEC': 'bg-red-100 text-red-800 border-red-200',
  'ANNULEE': 'bg-gray-100 text-gray-800 border-gray-200',
};

const statusIcons: Record<string, React.ReactNode> = {
  'En attente': <Clock className="h-4 w-4" />,
  'Validé': <CheckCircle className="h-4 w-4" />,
  'Rejeté': <XCircle className="h-4 w-4" />,
  'EFFECTUEE': <CheckCircle className="h-4 w-4" />,
  'EN_COURS': <RefreshCw className="h-4 w-4 animate-spin" />,
  'ECHEC': <XCircle className="h-4 w-4" />,
  'ANNULEE': <XCircle className="h-4 w-4" />,
};

const DemandesAvanceSalaire: React.FC<DemandesAvanceSalaireProps> = ({ partnerId }) => {
  const [demandes, setDemandes] = useState<SalaryAdvanceRequest[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'demandes' | 'transactions'>('demandes');
  const [processingRequest, setProcessingRequest] = useState<string | null>(null);

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

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('fr-FR');
  };

  const getStatusBadge = (status: string) => (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${statusColors[status] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
      {statusIcons[status] || <Clock className="h-4 w-4" />}
      {status}
    </span>
  );

  const handleApproveRequest = async (demandeId: string) => {
    setProcessingRequest(demandeId);
    try {
      await salaryAdvanceService.approve(demandeId);
      // Recharger les données
      const [demandesData, transactionsData] = await Promise.all([
        salaryAdvanceService.getDemandesByPartner(partnerId),
        salaryAdvanceService.getTransactionsByPartner(partnerId)
      ]);
      setDemandes(demandesData);
      setTransactions(transactionsData);
    } catch (err) {
      setError('Erreur lors de l\'approbation de la demande');
    } finally {
      setProcessingRequest(null);
    }
  };

  const handleRejectRequest = async (demandeId: string) => {
    setProcessingRequest(demandeId);
    try {
      await salaryAdvanceService.reject(demandeId, 'Demande rejetée par l\'administrateur');
      // Recharger les données
      const [demandesData, transactionsData] = await Promise.all([
        salaryAdvanceService.getDemandesByPartner(partnerId),
        salaryAdvanceService.getTransactionsByPartner(partnerId)
      ]);
      setDemandes(demandesData);
      setTransactions(transactionsData);
    } catch (err) {
      setError('Erreur lors du rejet de la demande');
    } finally {
      setProcessingRequest(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête avec statistiques */}
      <div className="bg-gradient-to-r from-[var(--zalama-blue)] to-[var(--zalama-blue-dark)] rounded-xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Demandes & Transactions
          </h2>
          
          {/* Onglets */}
          <div className="flex gap-1 bg-white/10 rounded-lg p-1 backdrop-blur-sm">
            <button
              onClick={() => setActiveTab('demandes')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
                activeTab === 'demandes'
                  ? 'bg-white text-[var(--zalama-blue)] shadow-sm'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <FileText className="h-4 w-4" />
              Demandes ({demandes.length})
            </button>
            <button
              onClick={() => setActiveTab('transactions')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
                activeTab === 'transactions'
                  ? 'bg-white text-[var(--zalama-blue)] shadow-sm'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <CreditCard className="h-4 w-4" />
              Transactions ({transactions.length})
            </button>
          </div>
        </div>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold">{demandes.length}</div>
            <div className="text-sm opacity-90">Total Demandes</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">
              {demandes.filter(d => d.statut === 'En attente').length}
            </div>
            <div className="text-sm opacity-90">En Attente</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">
              {demandes.filter(d => d.statut === 'Validé').length}
            </div>
            <div className="text-sm opacity-90">Approuvées</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">
              {formatMontant(demandes.reduce((sum, d) => sum + (d.montant_demande || 0), 0))}
            </div>
            <div className="text-sm opacity-90">Montant Total</div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="relative">
            <RefreshCw className="h-12 w-12 animate-spin text-[var(--zalama-blue)]" />
            <div className="absolute inset-0 rounded-full border-4 border-[var(--zalama-blue)] border-opacity-20"></div>
          </div>
          <span className="mt-4 text-[var(--zalama-text)] font-medium">Chargement des données...</span>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-center gap-3 text-red-800">
            <AlertCircle className="h-6 w-6" />
            <div>
              <h3 className="font-semibold">Erreur de chargement</h3>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        </div>
      ) : activeTab === 'demandes' ? (
        /* Onglet Demandes - Design en cartes */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-[var(--zalama-text)] flex items-center gap-2">
              <FileText className="h-5 w-5 text-[var(--zalama-blue)]" />
              Demandes d'avance sur salaire
            </h3>
            <div className="text-sm text-[var(--zalama-text-secondary)]">
              {demandes.length} demande{demandes.length !== 1 ? 's' : ''}
            </div>
          </div>
          
          {demandes.length === 0 ? (
            <div className="bg-[var(--zalama-card)] rounded-xl p-12 text-center border border-[var(--zalama-border)]">
              <FileText className="h-16 w-16 text-[var(--zalama-text-secondary)] mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-[var(--zalama-text)] mb-2">Aucune demande</h3>
              <p className="text-[var(--zalama-text-secondary)]">
                Aucune demande d'avance sur salaire trouvée pour ce partenaire.
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {demandes.map((demande) => (
                <div key={demande.id} className="bg-[var(--zalama-card)] rounded-xl p-6 border border-[var(--zalama-border)] hover:shadow-lg transition-all duration-200">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {demande.employe?.photo_url ? (
                        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[var(--zalama-border)]">
                          <Image
                            src={demande.employe.photo_url}
                            alt={`Photo de ${demande.employe.prenom} ${demande.employe.nom}`}
                            width={40}
                            height={40}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-10 h-10 bg-[var(--zalama-blue)] rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-white" />
                        </div>
                      )}
                      <div>
                        <h4 className="font-semibold text-[var(--zalama-text)]">
                          {demande.employe ? `${demande.employe.prenom} ${demande.employe.nom}` : 'Employé inconnu'}
                        </h4>
                        <p className="text-sm text-[var(--zalama-text-secondary)]">
                          {demande.employe?.poste || 'Poste non spécifié'}
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(demande.statut)}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="bg-[var(--zalama-bg-lighter)] rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <DollarSign className="h-4 w-4 text-[var(--zalama-success)]" />
                        <span className="text-sm text-[var(--zalama-text-secondary)]">Montant demandé</span>
                      </div>
                      <div className="text-lg font-bold text-[var(--zalama-text)]">
                        {formatMontant(demande.montant_demande)}
                      </div>
                    </div>
                    
                    <div className="bg-[var(--zalama-bg-lighter)] rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar className="h-4 w-4 text-[var(--zalama-warning)]" />
                        <span className="text-sm text-[var(--zalama-text-secondary)]">Date de demande</span>
                      </div>
                      <div className="text-sm font-medium text-[var(--zalama-text)]">
                        {formatDate(demande.date_creation)}
                      </div>
                    </div>

                    <div className="bg-[var(--zalama-bg-lighter)] rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar className="h-4 w-4 text-[var(--zalama-blue)]" />
                        <span className="text-sm text-[var(--zalama-text-secondary)]">Traitement</span>
                      </div>
                      <div className="text-sm font-medium text-[var(--zalama-text)]">
                        {demande.date_validation ? formatDate(demande.date_validation) : 'En attente'}
                      </div>
                    </div>
                  </div>

                  <div className="bg-[var(--zalama-bg-lighter)] rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="h-4 w-4 text-[var(--zalama-text-secondary)]" />
                      <span className="text-sm font-medium text-[var(--zalama-text-secondary)]">Motif</span>
                    </div>
                    <p className="text-[var(--zalama-text)]">{demande.motif}</p>
                  </div>

                  {/* Boutons d'action pour les demandes en attente */}
                  {demande.statut === 'En attente' && (
                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--zalama-border)]">
                      <button
                        onClick={() => handleRejectRequest(demande.id)}
                        disabled={processingRequest === demande.id}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 hover:border-red-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {processingRequest === demande.id ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          <XCircle className="h-4 w-4" />
                        )}
                        Rejeter
                      </button>
                      <button
                        onClick={() => handleApproveRequest(demande.id)}
                        disabled={processingRequest === demande.id}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 border border-green-600 rounded-lg hover:bg-green-700 hover:border-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {processingRequest === demande.id ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          <CheckCircle className="h-4 w-4" />
                        )}
                        Approuver
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Onglet Transactions - Design en cartes */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-[var(--zalama-text)] flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-[var(--zalama-success)]" />
              Transactions
            </h3>
            <div className="text-sm text-[var(--zalama-text-secondary)]">
              {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}
            </div>
          </div>
          
          {transactions.length === 0 ? (
            <div className="bg-[var(--zalama-card)] rounded-xl p-12 text-center border border-[var(--zalama-border)]">
              <CreditCard className="h-16 w-16 text-[var(--zalama-text-secondary)] mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-[var(--zalama-text)] mb-2">Aucune transaction</h3>
              <p className="text-[var(--zalama-text-secondary)]">
                Aucune transaction trouvée pour ce partenaire.
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="bg-[var(--zalama-card)] rounded-xl p-6 border border-[var(--zalama-border)] hover:shadow-lg transition-all duration-200">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {transaction.employe?.photo_url ? (
                        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[var(--zalama-border)]">
                          <Image
                            src={transaction.employe.photo_url}
                            alt={`Photo de ${transaction.employe.prenom} ${transaction.employe.nom}`}
                            width={40}
                            height={40}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-10 h-10 bg-[var(--zalama-success)] rounded-full flex items-center justify-center">
                          <CreditCard className="h-5 w-5 text-white" />
                        </div>
                      )}
                      <div>
                        <h4 className="font-semibold text-[var(--zalama-text)]">
                          {transaction.employe ? `${transaction.employe.prenom} ${transaction.employe.nom}` : 'Employé inconnu'}
                        </h4>
                        <p className="text-sm text-[var(--zalama-text-secondary)]">
                          {transaction.numero_transaction}
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(transaction.statut)}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="bg-[var(--zalama-bg-lighter)] rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <DollarSign className="h-4 w-4 text-[var(--zalama-success)]" />
                        <span className="text-sm text-[var(--zalama-text-secondary)]">Montant</span>
                      </div>
                      <div className="text-lg font-bold text-[var(--zalama-text)]">
                        {formatMontant(transaction.montant)}
                      </div>
                    </div>
                    
                    <div className="bg-[var(--zalama-bg-lighter)] rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <CreditCard className="h-4 w-4 text-[var(--zalama-blue)]" />
                        <span className="text-sm text-[var(--zalama-text-secondary)]">Méthode</span>
                      </div>
                      <div className="text-sm font-medium text-[var(--zalama-text)]">
                        {transaction.methode_paiement.replace('_', ' ')}
                      </div>
                    </div>

                    <div className="bg-[var(--zalama-bg-lighter)] rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar className="h-4 w-4 text-[var(--zalama-warning)]" />
                        <span className="text-sm text-[var(--zalama-text-secondary)]">Date</span>
                      </div>
                      <div className="text-sm font-medium text-[var(--zalama-text)]">
                        {formatDate(transaction.date_transaction)}
                      </div>
                    </div>
                  </div>

                  {transaction.numero_compte && (
                    <div className="bg-[var(--zalama-bg-lighter)] rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Eye className="h-4 w-4 text-[var(--zalama-text-secondary)]" />
                        <span className="text-sm font-medium text-[var(--zalama-text-secondary)]">Compte</span>
                      </div>
                      <p className="text-[var(--zalama-text)] font-mono">{transaction.numero_compte}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DemandesAvanceSalaire; 
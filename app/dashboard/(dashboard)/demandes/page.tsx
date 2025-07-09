"use client";

import React, { useState, useCallback } from 'react';
import { Search, Plus, Filter, RefreshCw, FileText } from 'lucide-react';
import { toast } from 'react-hot-toast';

// Importation des composants
import {
  StatistiquesDemandes,
  ResumeDemandes,
  ListeDemandes,
  ModaleAjoutDemande,
  ModaleApprobationDemande,
  ModaleRejetDemande,
  ModaleSuppressionDemande,
  ModaleDetailDemande,
  ModalePaiementDemande,
  ListeTransactions
} from '@/components/dashboard/demandes';

// Importation du hook Supabase
import { useSupabaseSalaryAdvance } from '@/hooks/useSupabaseSalaryAdvance';
import { useSupabaseEmployees } from '@/hooks/useSupabaseEmployees';
import { useSupabasePartners } from '@/hooks/useSupabasePartners';
import { SalaryAdvanceRequestFormData, UISalaryAdvanceRequest } from '@/types/salaryAdvanceRequest';

export default function DemandesPage() {
  // Utilisation du hook Supabase pour les demandes d'avance
  const {
    requests,
    filteredRequests,
    isLoading,
    stats,
    statsLoading,
    transactions,
    transactionsLoading,
    searchTerm,
    statusFilter,
    partnerFilter,
    currentPage,
    totalPages,
    statuses,
    partners,
    setSearchTerm,
    setStatusFilter,
    setPartnerFilter,
    setCurrentPage,
    createRequest,
    approveRequest,
    rejectRequest,
    deleteRequest,
    refreshRequests,
    refreshTransactions
  } = useSupabaseSalaryAdvance(10);

  // Utilisation des hooks pour les employés et partenaires
  const { employees, isLoading: employeesLoading } = useSupabaseEmployees();
  const { partenaires: partnersData, isLoading: partnersLoading } = useSupabasePartners();

  // Debug: Afficher les données reçues
  console.log('🔍 Debug - Page Demandes:');
  console.log('  - employees:', employees?.length || 0, employees);
  console.log('  - partnersData:', partnersData?.length || 0, partnersData);
  console.log('  - employeesLoading:', employeesLoading);
  console.log('  - partnersLoading:', partnersLoading);

  // États pour les modales
  const [showAddModal, setShowAddModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [currentRequest, setCurrentRequest] = useState<UISalaryAdvanceRequest | null>(null);
  const [activeTab, setActiveTab] = useState<'demandes' | 'transactions'>('demandes');

  // Handlers
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status);
  };

  const handlePartnerFilterChange = (partner: string) => {
    setPartnerFilter(partner);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleAddRequest = () => {
    setShowAddModal(true);
  };

  const handleViewRequest = (request: UISalaryAdvanceRequest) => {
    setCurrentRequest(request);
    setShowDetailModal(true);
  };

  const handlePayRequest = (request: UISalaryAdvanceRequest) => {
    setCurrentRequest(request);
    setShowPaymentModal(true);
  };

  const handleApproveRequest = (request: UISalaryAdvanceRequest) => {
    setCurrentRequest(request);
    setShowApproveModal(true);
  };

  const handleRejectRequest = (request: UISalaryAdvanceRequest) => {
    setCurrentRequest(request);
    setShowRejectModal(true);
  };

  const handleDeleteRequest = (request: UISalaryAdvanceRequest) => {
    setCurrentRequest(request);
    setShowDeleteModal(true);
  };

  // Formulaire d'ajout de demande
  const handleSubmitAddRequest = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    try {
      console.log('🚀 Début de la création de demande');
      const form = e.currentTarget;
      
      // Récupérer les données du formulaire
      const employeId = (form.querySelector('#add-employe-id') as HTMLSelectElement)?.value || '';
      const montantDemande = parseFloat((form.querySelector('#add-montant') as HTMLInputElement)?.value || '0');
      const typeMotif = (form.querySelector('#add-type-motif') as HTMLInputElement)?.value || '';
      const motif = (form.querySelector('#add-motif') as HTMLTextAreaElement)?.value || '';
      const fraisService = parseFloat((form.querySelector('#add-frais') as HTMLInputElement)?.value || '0');
      const montantTotal = parseFloat((form.querySelector('#add-montant-total') as HTMLInputElement)?.value || '0');
      const salaireDisponible = parseFloat((form.querySelector('#add-salaire-disponible') as HTMLInputElement)?.value || '0');
      const avanceDisponible = parseFloat((form.querySelector('#add-avance-disponible') as HTMLInputElement)?.value || '0');
      
      // Trouver l'employé sélectionné pour récupérer le partenaire
      const selectedEmployee = employees?.find(emp => emp.id === employeId);
      const partenaireId = selectedEmployee?.partner_id || '';
      
      console.log('📋 Données récupérées du formulaire:');
      console.log('  - Employé ID:', employeId);
      console.log('  - Partenaire ID:', partenaireId);
      console.log('  - Montant demandé:', montantDemande);
      console.log('  - Type motif:', typeMotif);
      console.log('  - Motif:', motif);
      console.log('  - Frais service:', fraisService);
      console.log('  - Montant total:', montantTotal);
      console.log('  - Salaire disponible:', salaireDisponible);
      console.log('  - Avance disponible:', avanceDisponible);
      
      const requestData: SalaryAdvanceRequestFormData = {
        employe_id: employeId,
        partenaire_id: partenaireId,
        montant_demande: montantDemande,
        type_motif: typeMotif,
        motif: motif,
        frais_service: fraisService,
        montant_total: montantTotal,
        salaire_disponible: salaireDisponible,
        avance_disponible: avanceDisponible,
      };

      console.log('📤 Envoi des données au service:', requestData);
      await createRequest(requestData);
      
      setShowAddModal(false);
      toast.success('Demande d\'avance créée avec succès');
      
    } catch (error) {
      console.error('❌ Erreur lors de la création de la demande:', error);
      toast.error('Erreur lors de la création de la demande');
    }
  }, [createRequest, employees]);

  // Confirmation d'approbation
  const handleConfirmApprove = useCallback(async (motif?: string) => {
    if (!currentRequest) return;
    
    try {
      await approveRequest(currentRequest.id, motif);
      
      setShowApproveModal(false);
      setCurrentRequest(null);
      toast.success('Demande approuvée avec succès');
      
    } catch (error) {
      console.error('Erreur lors de l\'approbation de la demande:', error);
      toast.error('Erreur lors de l\'approbation de la demande');
    }
  }, [currentRequest, approveRequest]);

  // Confirmation de rejet
  const handleConfirmReject = useCallback(async (motif_rejet: string) => {
    if (!currentRequest) return;
    
    try {
      await rejectRequest(currentRequest.id, motif_rejet);
      
      setShowRejectModal(false);
      setCurrentRequest(null);
      toast.success('Demande rejetée');
      
    } catch (error) {
      console.error('Erreur lors du rejet de la demande:', error);
      toast.error('Erreur lors du rejet de la demande');
    }
  }, [currentRequest, rejectRequest]);

  // Confirmation de suppression
  const handleConfirmDelete = useCallback(async () => {
    if (!currentRequest) return;
    
    try {
      await deleteRequest(currentRequest.id);
      
      setShowDeleteModal(false);
      setCurrentRequest(null);
      toast.success('Demande supprimée avec succès');
      
    } catch (error) {
      console.error('Erreur lors de la suppression de la demande:', error);
      toast.error('Erreur lors de la suppression de la demande');
    }
  }, [currentRequest, deleteRequest]);

  // Fonction pour vérifier le statut des paiements en attente
  const handleCheckPaymentStatus = useCallback(async () => {
    try {
      const response = await fetch('/api/payments/transactions?check_status=true');
      const result = await response.json();
      
      if (result.success) {
        toast.success('Statut des paiements vérifié avec succès');
      } else {
        toast.error('Erreur lors de la vérification des statuts');
      }
    } catch (error) {
      console.error('Erreur lors de la vérification des statuts:', error);
      toast.error('Erreur lors de la vérification des statuts');
    }
  }, []);

  // Calculer les éléments de la page courante
  const startIndex = (currentPage - 1) * 10;
  const endIndex = startIndex + 10;
  // const currentItems = filteredRequests.slice(startIndex, endIndex);

  // Vérification de sécurité
  const safeStatuses = statuses || ['toutes'];
  const safePartners = partners || ['toutes'];
  const safeFilteredRequests = filteredRequests || [];

  return (
    <div className="min-h-screen bg-[var(--zalama-bg)] p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* En-tête principal */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[var(--zalama-text)] flex items-center gap-2">
              <FileText className="w-6 h-6 md:w-7 md:h-7 text-[var(--zalama-blue)]" />
              Demandes d&apos;avance sur salaire
            </h1>
            <p className="text-[var(--zalama-text-secondary)] mt-1 text-sm md:text-base">
              Gérez les demandes d&apos;avance et suivez les transactions
            </p>
          </div>
        </div>

        {/* Onglets */}
        <div className="bg-[var(--zalama-card)] rounded-xl shadow-sm border border-[var(--zalama-border)]">
          <div className="flex border-b border-[var(--zalama-border)]">
            <button
              onClick={() => setActiveTab('demandes')}
              className={`flex-1 px-4 md:px-6 py-3 md:py-4 text-sm font-medium transition-colors ${
                activeTab === 'demandes'
                  ? 'text-[var(--zalama-blue)] border-b-2 border-[var(--zalama-blue)] bg-[var(--zalama-bg-light)]'
                  : 'text-[var(--zalama-text-secondary)] hover:text-[var(--zalama-text)] hover:bg-[var(--zalama-bg-light)]'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <FileText className="w-4 h-4" />
                <span className="hidden sm:inline">Demandes d&apos;avance</span>
                <span className="sm:hidden">Demandes</span>
                {safeFilteredRequests.length > 0 && (
                  <span className="bg-[var(--zalama-blue)] text-white text-xs px-2 py-1 rounded-full">
                    {safeFilteredRequests.length}
                  </span>
                )}
              </div>
            </button>
            <button
              onClick={() => setActiveTab('transactions')}
              className={`flex-1 px-4 md:px-6 py-3 md:py-4 text-sm font-medium transition-colors ${
                activeTab === 'transactions'
                  ? 'text-[var(--zalama-blue)] border-b-2 border-[var(--zalama-blue)] bg-[var(--zalama-bg-light)]'
                  : 'text-[var(--zalama-text-secondary)] hover:text-[var(--zalama-text)] hover:bg-[var(--zalama-bg-light)]'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4" />
                <span className="hidden sm:inline">Transactions</span>
                <span className="sm:hidden">Trans.</span>
                {transactions.length > 0 && (
                  <span className="bg-[var(--zalama-success)] text-white text-xs px-2 py-1 rounded-full">
                    {transactions.length}
                  </span>
                )}
              </div>
            </button>
          </div>
          
          <div className="p-4 md:p-6 lg:p-8">
            {activeTab === 'demandes' ? (
              <div className="space-y-6 lg:space-y-8">
      {/* En-tête avec recherche et filtres */}
                <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--zalama-text-secondary)]" />
            <input
              type="text"
              placeholder="Rechercher une demande..."
              value={searchTerm}
              onChange={handleSearch}
                        className="pl-10 pr-4 py-2 bg-[var(--zalama-bg-light)] border border-[var(--zalama-border)] rounded-lg text-[var(--zalama-text)] placeholder-[var(--zalama-text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--zalama-blue)]/20 w-full lg:w-96"
            />
        </div>
        
                    <div className="flex items-center gap-2 flex-wrap">
                      <Filter className="w-4 h-4 text-[var(--zalama-text-secondary)]" />
            <select
              value={statusFilter}
              onChange={(e) => handleStatusFilterChange(e.target.value)}
                        className="px-3 py-2 bg-[var(--zalama-bg-light)] border border-[var(--zalama-border)] rounded-lg text-[var(--zalama-text)] focus:outline-none focus:ring-2 focus:ring-[var(--zalama-blue)]/20 min-w-[140px]"
            >
              {safeStatuses.map((status) => (
                <option key={status} value={status}>
                  {status === 'toutes' ? 'Tous les statuts' : status}
                </option>
              ))}
            </select>
            
            <select
              value={partnerFilter}
              onChange={(e) => handlePartnerFilterChange(e.target.value)}
                        className="px-3 py-2 bg-[var(--zalama-bg-light)] border border-[var(--zalama-border)] rounded-lg text-[var(--zalama-text)] focus:outline-none focus:ring-2 focus:ring-[var(--zalama-blue)]/20 min-w-[160px]"
            >
              {safePartners.map((partner) => (
                <option key={partner} value={partner}>
                  {partner === 'toutes' ? 'Tous les partenaires' : partner}
                </option>
              ))}
            </select>
          </div>
                  </div>
                  
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={handleCheckPaymentStatus}
                      className="flex items-center gap-2 px-3 py-2 bg-[var(--zalama-success)] hover:bg-[var(--zalama-success-accent)] text-white rounded-lg transition-colors text-sm"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span className="hidden sm:inline">Vérifier paiements</span>
                      <span className="sm:hidden">Vérifier</span>
                    </button>
          
          <button
            onClick={handleAddRequest}
                      className="flex items-center gap-2 px-4 py-2 bg-[var(--zalama-blue)] hover:bg-[var(--zalama-blue-accent)] text-white rounded-lg transition-colors text-sm"
          >
                      <Plus className="w-4 h-4" />
                      <span className="hidden sm:inline">Nouvelle demande</span>
                      <span className="sm:hidden">Nouvelle</span>
          </button>
        </div>
      </div>

                {/* Statistiques */}
                <div className="bg-[var(--zalama-bg-light)] rounded-xl shadow-sm p-4 md:p-6 border border-[var(--zalama-border)]">
          <StatistiquesDemandes 
            requestStats={stats}
            isLoading={statsLoading}
          />
                </div>
          
                {/* Résumé */}
                <div className="bg-[var(--zalama-bg-light)] rounded-xl shadow-sm p-4 md:p-6 border border-[var(--zalama-border)]">
          <ResumeDemandes 
            requests={requests}
            isLoading={isLoading}
          />
                </div>
          
          {/* Liste des demandes */}
                <div className="bg-[var(--zalama-bg-light)] rounded-xl shadow-sm p-4 md:p-6 border border-[var(--zalama-border)]">
          <ListeDemandes 
            requests={safeFilteredRequests}
            isLoading={isLoading}
            onView={handleViewRequest}
            onPay={handlePayRequest}
            onApprove={handleApproveRequest}
            onReject={handleRejectRequest}
            onDelete={handleDeleteRequest}
                    onRefresh={refreshRequests}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
                </div>
              </div>
            ) : (
              <div className="space-y-6 lg:space-y-8">
                {/* En-tête de la page */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h2 className="text-xl md:text-2xl font-bold text-[var(--zalama-text)] flex items-center gap-2">
                      <RefreshCw className="w-5 h-5 md:w-6 md:h-6 text-[var(--zalama-blue)]" />
                      Transactions de paiement
                    </h2>
                    <p className="text-[var(--zalama-text-secondary)] mt-1 text-sm md:text-base">
                      Suivez l&apos;historique des paiements et leur statut
                    </p>
                  </div>
                </div>

          {/* Liste des transactions */}
                <div className="bg-[var(--zalama-bg-light)] rounded-xl shadow-sm p-4 md:p-6 border border-[var(--zalama-border)]">
          <ListeTransactions 
            transactions={transactions || []}
            isLoading={transactionsLoading}
            onView={(transaction) => {
              // TODO: Implement view functionality
              console.log('View transaction:', transaction);
            }}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
                    onRefresh={refreshTransactions}
                  />
                </div>

                {/* Informations supplémentaires */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Guide des statuts */}
                  <div className="bg-[var(--zalama-bg-light)] rounded-xl shadow-sm p-4 md:p-6 border border-[var(--zalama-border)]">
                    <h3 className="text-lg font-semibold text-[var(--zalama-text)] mb-4">
                      Guide des Statuts
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-[var(--zalama-warning)] rounded-full"></div>
                        <div>
                          <p className="text-sm font-medium text-[var(--zalama-text)]">En attente</p>
                          <p className="text-xs text-[var(--zalama-text-secondary)]">Paiement initié, en attente de confirmation</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-[var(--zalama-success)] rounded-full"></div>
                        <div>
                          <p className="text-sm font-medium text-[var(--zalama-text)]">Payé</p>
                          <p className="text-xs text-[var(--zalama-text-secondary)]">Paiement confirmé et traité</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-[var(--zalama-danger)] rounded-full"></div>
                        <div>
                          <p className="text-sm font-medium text-[var(--zalama-text)]">Échoué</p>
                          <p className="text-xs text-[var(--zalama-text-secondary)]">Paiement échoué ou annulé</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions rapides */}
                  <div className="bg-[var(--zalama-bg-light)] rounded-xl shadow-sm p-4 md:p-6 border border-[var(--zalama-border)]">
                    <h3 className="text-lg font-semibold text-[var(--zalama-text)] mb-4">
                      Actions Rapides
                    </h3>
                    <div className="space-y-3">
                      <button
                        onClick={handleCheckPaymentStatus}
                        className="w-full text-left p-3 bg-[var(--zalama-bg)] hover:bg-[var(--zalama-bg-lighter)] rounded-lg transition-colors"
                      >
                        <p className="text-sm font-medium text-[var(--zalama-text)]">Vérifier les paiements en attente</p>
                        <p className="text-xs text-[var(--zalama-text-secondary)]">Mettre à jour le statut des transactions</p>
                      </button>
                      <button
                        onClick={handleAddRequest}
                        className="w-full text-left p-3 bg-[var(--zalama-bg)] hover:bg-[var(--zalama-bg-lighter)] rounded-lg transition-colors"
                      >
                        <p className="text-sm font-medium text-[var(--zalama-text)]">Créer une nouvelle demande</p>
                        <p className="text-xs text-[var(--zalama-text-secondary)]">Ajouter une demande d&apos;avance</p>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Modales */}
      <ModaleAjoutDemande 
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleSubmitAddRequest}
        employees={employees}
        partners={partnersData}
        isLoading={employeesLoading || partnersLoading}
      />
      
      <ModaleDetailDemande
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setCurrentRequest(null);
        }}
        request={currentRequest}
        isLoading={isLoading}
      />
      
      <ModalePaiementDemande
        isOpen={showPaymentModal}
        onClose={() => {
          setShowPaymentModal(false);
          setCurrentRequest(null);
        }}
        request={currentRequest}
        isLoading={isLoading}
        onPaymentSuccess={() => {
          // Rafraîchir les données après un paiement réussi
          // Le hook useSupabaseSalaryAdvance devrait automatiquement rafraîchir les données
          console.log('✅ Paiement réussi, données rafraîchies');
        }}
      />
      
      {showApproveModal && currentRequest && (
        <ModaleApprobationDemande 
          isOpen={showApproveModal}
          onClose={() => {
            setShowApproveModal(false);
            setCurrentRequest(null);
          }}
          onConfirm={handleConfirmApprove}
          request={currentRequest}
          isLoading={isLoading}
        />
      )}
      
      {showRejectModal && currentRequest && (
        <ModaleRejetDemande 
          isOpen={showRejectModal}
          onClose={() => {
            setShowRejectModal(false);
            setCurrentRequest(null);
          }}
          onConfirm={handleConfirmReject}
          request={currentRequest}
          isLoading={isLoading}
        />
      )}
      
      {showDeleteModal && currentRequest && (
        <ModaleSuppressionDemande 
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setCurrentRequest(null);
          }}
          onConfirm={handleConfirmDelete}
          request={currentRequest}
          isLoading={isLoading}
        />
      )}
    </div>
  );
} 
"use client";

import React, { useState, useCallback } from 'react';
import { Search, Plus, Filter, RefreshCw, Eye, CheckCircle, XCircle, Trash2 } from 'lucide-react';
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
    deleteRequest
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

  // Calculer les éléments de la page courante
  const startIndex = (currentPage - 1) * 10;
  const endIndex = startIndex + 10;
  const currentItems = filteredRequests.slice(startIndex, endIndex);

  // Vérification de sécurité
  const safeStatuses = statuses || ['toutes'];
  const safePartners = partners || ['toutes'];
  const safeFilteredRequests = filteredRequests || [];



  return (
    <div className="p-4 md:p-6 w-full">
      {/* En-tête avec recherche et filtres */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-[var(--zalama-text)]">Demandes d'avance sur salaire</h1>
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-[var(--zalama-text-secondary)]" />
            <input
              type="text"
              placeholder="Rechercher une demande..."
              className="px-3 py-1 text-sm border border-[var(--zalama-border)] rounded-lg bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)]"
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-[var(--zalama-text-secondary)]" />
            <select
              value={statusFilter}
              onChange={(e) => handleStatusFilterChange(e.target.value)}
              className="px-3 py-1 text-sm border border-[var(--zalama-border)] rounded-lg bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)]"
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
              className="px-3 py-1 text-sm border border-[var(--zalama-border)] rounded-lg bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)]"
            >
              {safePartners.map((partner) => (
                <option key={partner} value={partner}>
                  {partner === 'toutes' ? 'Tous les partenaires' : partner}
                </option>
              ))}
            </select>
          </div>
          
          <button
            onClick={handleAddRequest}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-[var(--zalama-blue)] text-white rounded-lg hover:bg-[var(--zalama-blue-accent)] transition-colors"
          >
            <Plus className="h-4 w-4" />
            Nouvelle demande
          </button>
        </div>
      </div>

      {/* Onglets */}
      <div className="flex border-b border-[var(--zalama-border)] mb-6">
        <button
          onClick={() => setActiveTab('demandes')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'demandes'
              ? 'text-[var(--zalama-blue)] border-b-2 border-[var(--zalama-blue)]'
              : 'text-[var(--zalama-text-secondary)] hover:text-[var(--zalama-text)]'
          }`}
        >
          Demandes ({safeFilteredRequests.length})
        </button>
        <button
          onClick={() => setActiveTab('transactions')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'transactions'
              ? 'text-[var(--zalama-blue)] border-b-2 border-[var(--zalama-blue)]'
              : 'text-[var(--zalama-text-secondary)] hover:text-[var(--zalama-text)]'
          }`}
        >
          Transactions ({transactions.length})
        </button>
      </div>

      {activeTab === 'demandes' ? (
        <>
          {/* Section des statistiques */}
          <StatistiquesDemandes 
            requestStats={stats}
            isLoading={statsLoading}
          />
          
          {/* Résumé des demandes */}
          <ResumeDemandes 
            requests={requests}
            isLoading={isLoading}
          />
          
          {/* Liste des demandes */}
          <ListeDemandes 
            requests={safeFilteredRequests}
            isLoading={isLoading}
            onView={(request) => {
              // TODO: Implement view functionality
              console.log('View request:', request);
            }}
            onApprove={handleApproveRequest}
            onReject={handleRejectRequest}
            onDelete={handleDeleteRequest}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </>
      ) : (
        <>
          {/* Liste des transactions */}
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
          />
        </>
      )}
      
      {/* Modales */}
      <ModaleAjoutDemande 
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleSubmitAddRequest}
        employees={employees}
        partners={partnersData}
        isLoading={employeesLoading || partnersLoading}
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
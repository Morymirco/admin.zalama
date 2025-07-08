"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Building, Filter, Globe, Plus, Search, Users, FileText, RefreshCw } from 'lucide-react';
import { toast } from 'react-hot-toast';

// Importation des composants
import {
  ListePartenaires,
  ModaleAjoutPartenaire,
  ModaleEditionPartenaire,
  ModaleSuppressionPartenaire,
  ResumePartenaires,
  StatistiquesPartenaires
} from '@/components/dashboard/partenaires';

// Importation des composants demandes
import StatistiquesDemandes from '@/components/dashboard/StatistiquesDemandes';
import TableauDemandes from '@/components/dashboard/TableauDemandes';

// Importation du hook Supabase
import { useSupabasePartners } from '@/hooks/useSupabasePartners';
import { useSupabasePartnershipRequests } from '@/hooks/useSupabasePartnershipRequests';

// Types
import { Partenaire } from '@/types/partenaire';
import { PartnershipRequest } from '@/types/partnershipRequest';

interface StatistiquePartenaire {
  type: string;
  nombre: number;
  nouveauxCeMois: number;
  actifs: number;
  inactifs: number;
  tendance: 'hausse' | 'stable' | 'baisse';
  icon: React.ReactNode;
}

type TabType = 'gestion' | 'demandes';

export default function PartenairesPage() {
  // États locaux
  const [activeTab, setActiveTab] = useState<TabType>('gestion');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentPartenaire, setCurrentPartenaire] = useState<Partenaire | null>(null);
  const [typeFilter, setTypeFilter] = useState<string>('tous');
  const [prefillData, setPrefillData] = useState<any>(null);

  // Utilisation du hook Supabase
  const {
    partenaires,
    loading: isLoading,
    error,
    statistics,
    createPartenaire,
    updatePartenaire,
    deletePartenaire,
    searchPartenaires,
    getPartenairesByType,
    refreshPartenaires
  } = useSupabasePartners();

  // Utilisation du hook Supabase pour les demandes
  const {
    requests,
    stats: demandeStats,
    loading: demandeLoading,
    error: demandeError,
    filters,
    updateFilters,
    approveRequest,
    rejectRequest,
    setInReview,
    deleteRequest,
    searchRequests,
    refresh: refreshDemandes
  } = useSupabasePartnershipRequests();

  // Liste des types de partenaires
  const types = ['tous', 'Entreprise', 'Institution', 'Organisation'];

  // Filtrer les partenaires en fonction de la recherche et du type
  const filteredPartenaires = useMemo(() => {
    return partenaires.filter(partenaire => {
      const matchesSearch = searchTerm === '' || 
        partenaire.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        partenaire.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        partenaire.secteur.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = typeFilter === 'tous' || partenaire.type === typeFilter;
      
      return matchesSearch && matchesType;
    });
  }, [partenaires, searchTerm, typeFilter]);

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredPartenaires.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredPartenaires.length / itemsPerPage);

  // Calculer les statistiques
  const statistiquesCalculées = useMemo(() => {
    const totalPartenaires = partenaires.length;
    const partenairesActifs = partenaires.filter(p => p.actif).length;
    const partenairesInactifs = totalPartenaires - partenairesActifs;
    
    // Calculer les nouveaux partenaires ce mois
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const nouveauxCeMois = partenaires.filter(p => {
      const dateCreation = new Date(p.created_at);
      return dateCreation >= firstDayOfMonth;
    }).length;

    // Déterminer la tendance
    const tendance = nouveauxCeMois > 5 ? 'hausse' as const : 
                    nouveauxCeMois > 2 ? 'stable' as const : 'baisse' as const;

    return [
      {
        type: 'Entreprises',
        nombre: partenaires.filter(p => p.type === 'Entreprise').length,
        nouveauxCeMois: partenaires.filter(p => p.type === 'Entreprise' && new Date(p.created_at) >= firstDayOfMonth).length,
        actifs: partenaires.filter(p => p.type === 'Entreprise' && p.actif).length,
        inactifs: partenaires.filter(p => p.type === 'Entreprise' && !p.actif).length,
        tendance,
        icon: <Building className="h-5 w-5" />
      },
      {
        type: 'Institutions',
        nombre: partenaires.filter(p => p.type === 'Institution').length,
        nouveauxCeMois: partenaires.filter(p => p.type === 'Institution' && new Date(p.created_at) >= firstDayOfMonth).length,
        actifs: partenaires.filter(p => p.type === 'Institution' && p.actif).length,
        inactifs: partenaires.filter(p => p.type === 'Institution' && !p.actif).length,
        tendance,
        icon: <Globe className="h-5 w-5" />
      },
      {
        type: 'Organisations',
        nombre: partenaires.filter(p => p.type === 'Organisation').length,
        nouveauxCeMois: partenaires.filter(p => p.type === 'Organisation' && new Date(p.created_at) >= firstDayOfMonth).length,
        actifs: partenaires.filter(p => p.type === 'Organisation' && p.actif).length,
        inactifs: partenaires.filter(p => p.type === 'Organisation' && !p.actif).length,
        tendance,
        icon: <Users className="h-5 w-5" />
      }
    ];
  }, [partenaires]);

  // Réinitialiser la pagination lors du filtrage
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, typeFilter]);

  // Afficher les erreurs
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
    if (demandeError) {
      toast.error(demandeError);
    }
  }, [error, demandeError]);

  // Handlers
  const handleSearch = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (value.trim()) {
      await searchPartenaires(value);
    }
  }, [searchPartenaires]);

  const handleTypeFilterChange = useCallback(async (type: string) => {
    setTypeFilter(type);
    if (type !== 'tous') {
      await getPartenairesByType(type);
    }
  }, [getPartenairesByType]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handlers pour les opérations CRUD
  const handleAddPartenaire = () => {
    setShowAddModal(true);
  };

  const handleEditPartenaire = (partenaire: Partenaire) => {
    setCurrentPartenaire(partenaire);
    setShowEditModal(true);
  };

  const handleDeletePartenaire = (partenaire: Partenaire) => {
    setCurrentPartenaire(partenaire);
    setShowDeleteModal(true);
  };

  // Handler pour ajouter un partenaire depuis une demande approuvée
  const handleAddPartnerFromRequest = (request: PartnershipRequest) => {
    // Préparer les données pré-remplies depuis la demande
    const prefillDataFromRequest = {
      nom: request.company_name,
      secteur: request.activity_domain,
      description: `Partenaire approuvé le ${new Date().toLocaleDateString('fr-FR')}`,
      nom_representant: request.rep_full_name,
      email_representant: request.rep_email,
      telephone_representant: request.rep_phone,
      nom_rh: request.hr_full_name,
      email_rh: request.hr_email,
      telephone_rh: request.hr_phone,
      rccm: request.rccm,
      nif: request.nif,
      email: request.email,
      telephone: request.phone,
      adresse: request.headquarters_address
    };
    
    setPrefillData(prefillDataFromRequest);
    setShowAddModal(true);
  };

  // Handlers pour les demandes
  const handleSearchDemandes = (term: string) => {
    if (term.trim()) {
      searchRequests(term);
    } else {
      refreshDemandes();
    }
  };

  const handleFilterByStatus = (status: string) => {
    updateFilters({ status: status as any });
  };

  // Rendu de l'onglet Gestion des partenaires
  const renderGestionPartenaires = () => (
    <div className="space-y-6">
      {/* En-tête avec recherche et filtres */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--zalama-text-secondary)]" />
            <input
              type="text"
              placeholder="Rechercher un partenaire..."
              value={searchTerm}
              onChange={handleSearch}
              className="pl-10 pr-4 py-2 bg-[var(--zalama-bg-light)] border border-[var(--zalama-border)] rounded-lg text-[var(--zalama-text)] placeholder-[var(--zalama-text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--zalama-blue)]/20 w-full sm:w-80"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[var(--zalama-text-secondary)]" />
            <select
              value={typeFilter}
              onChange={(e) => handleTypeFilterChange(e.target.value)}
              className="px-3 py-2 bg-[var(--zalama-bg-light)] border border-[var(--zalama-border)] rounded-lg text-[var(--zalama-text)] focus:outline-none focus:ring-2 focus:ring-[var(--zalama-blue)]/20"
            >
              {types.map((type) => (
                <option key={type} value={type}>
                  {type === 'tous' ? 'Tous les types' : type}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <button
          onClick={handleAddPartenaire}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--zalama-blue)] hover:bg-[var(--zalama-blue-accent)] text-white rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Ajouter un partenaire
        </button>
      </div>

      {/* Statistiques */}
      <div className="bg-[var(--zalama-card)] rounded-xl shadow-sm p-5 border border-[var(--zalama-border)]">
        <StatistiquesPartenaires statistiques={statistiquesCalculées} />
      </div>

      {/* Résumé */}
      <div className="bg-[var(--zalama-card)] rounded-xl shadow-sm p-5 border border-[var(--zalama-border)]">
        <ResumePartenaires statistiques={statistics} />
      </div>

      {/* Liste des partenaires */}
      <div className="bg-[var(--zalama-card)] rounded-xl shadow-sm p-5 border border-[var(--zalama-border)]">
        <ListePartenaires
          partenaires={currentItems}
          loading={isLoading}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          onEdit={handleEditPartenaire}
          onDelete={handleDeletePartenaire}
        />
      </div>
    </div>
  );

  // Rendu de l'onglet Demandes partenaires
  const renderDemandesPartenaires = () => (
    <div className="space-y-6">
      {/* En-tête de la page */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[var(--zalama-text)] flex items-center gap-2">
            <FileText className="w-5 h-5 text-[var(--zalama-blue)]" />
            Demandes de Partenariat
          </h2>
          <p className="text-[var(--zalama-text-secondary)] mt-1">
            Gérez les demandes de partenariat et suivez leur progression
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={refreshDemandes}
            disabled={demandeLoading}
            className="flex items-center gap-2 px-3 py-2 bg-[var(--zalama-blue)] hover:bg-[var(--zalama-blue-accent)] text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-4 h-4 ${demandeLoading ? 'animate-spin' : ''}`} />
            Actualiser
          </button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="bg-[var(--zalama-card)] rounded-xl shadow-sm p-5 border border-[var(--zalama-border)]">
        <StatistiquesDemandes stats={demandeStats} />
      </div>

      {/* Tableau des demandes */}
      <div className="bg-[var(--zalama-card)] rounded-xl shadow-sm p-5 border border-[var(--zalama-border)]">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-[var(--zalama-text)] mb-2">
            Liste des Demandes
          </h3>
          <p className="text-[var(--zalama-text-secondary)] text-sm">
            {requests.length} demande{requests.length !== 1 ? 's' : ''} trouvée{requests.length !== 1 ? 's' : ''}
          </p>
        </div>
        
        <TableauDemandes
          requests={requests}
          loading={demandeLoading}
          onApprove={approveRequest}
          onReject={rejectRequest}
          onSetInReview={setInReview}
          onDelete={deleteRequest}
          onSearch={handleSearchDemandes}
          onFilterByStatus={handleFilterByStatus}
          onAddPartner={handleAddPartnerFromRequest}
        />
      </div>

      {/* Informations supplémentaires */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Guide des statuts */}
        <div className="bg-[var(--zalama-card)] rounded-xl shadow-sm p-5 border border-[var(--zalama-border)]">
          <h3 className="text-lg font-semibold text-[var(--zalama-text)] mb-4">
            Guide des Statuts
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-[var(--zalama-warning)] rounded-full"></div>
              <div>
                <p className="text-sm font-medium text-[var(--zalama-text)]">En attente</p>
                <p className="text-xs text-[var(--zalama-text-secondary)]">Demande soumise, en attente de traitement</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-[var(--zalama-blue)] rounded-full"></div>
              <div>
                <p className="text-sm font-medium text-[var(--zalama-text)]">En révision</p>
                <p className="text-xs text-[var(--zalama-text-secondary)]">Demande en cours d'analyse approfondie</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-[var(--zalama-success)] rounded-full"></div>
              <div>
                <p className="text-sm font-medium text-[var(--zalama-text)]">Approuvée</p>
                <p className="text-xs text-[var(--zalama-text-secondary)]">Demande acceptée, partenariat validé</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-[var(--zalama-danger)] rounded-full"></div>
              <div>
                <p className="text-sm font-medium text-[var(--zalama-text)]">Rejetée</p>
                <p className="text-xs text-[var(--zalama-text-secondary)]">Demande refusée, partenariat non validé</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions rapides */}
        <div className="bg-[var(--zalama-card)] rounded-xl shadow-sm p-5 border border-[var(--zalama-border)]">
          <h3 className="text-lg font-semibold text-[var(--zalama-text)] mb-4">
            Actions Rapides
          </h3>
          <div className="space-y-3">
            <button
              onClick={() => updateFilters({ status: 'pending' })}
              className="w-full text-left p-3 bg-[var(--zalama-bg-light)] hover:bg-[var(--zalama-bg-lighter)] rounded-lg transition-colors"
            >
              <p className="text-sm font-medium text-[var(--zalama-text)]">Voir les demandes en attente</p>
              <p className="text-xs text-[var(--zalama-text-secondary)]">{demandeStats.pending} demande{demandeStats.pending !== 1 ? 's' : ''}</p>
            </button>
            <button
              onClick={() => updateFilters({ status: 'in_review' })}
              className="w-full text-left p-3 bg-[var(--zalama-bg-light)] hover:bg-[var(--zalama-bg-lighter)] rounded-lg transition-colors"
            >
              <p className="text-sm font-medium text-[var(--zalama-text)]">Voir les demandes en révision</p>
              <p className="text-xs text-[var(--zalama-text-secondary)]">{demandeStats.in_review} demande{demandeStats.in_review !== 1 ? 's' : ''}</p>
            </button>
            <button
              onClick={() => updateFilters({ status: 'approved' })}
              className="w-full text-left p-3 bg-[var(--zalama-bg-light)] hover:bg-[var(--zalama-bg-lighter)] rounded-lg transition-colors"
            >
              <p className="text-sm font-medium text-[var(--zalama-text)]">Voir les partenariats approuvés</p>
              <p className="text-xs text-[var(--zalama-text-secondary)]">{demandeStats.approved} partenariat{demandeStats.approved !== 1 ? 's' : ''}</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
      {/* En-tête principal */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--zalama-text)] flex items-center gap-2">
            <Building className="w-6 h-6 text-[var(--zalama-blue)]" />
            Gestion des Partenaires
          </h1>
          <p className="text-[var(--zalama-text-secondary)] mt-1">
            Gérez vos partenaires et leurs demandes de partenariat
          </p>
        </div>
      </div>

      {/* Onglets */}
      <div className="bg-[var(--zalama-card)] rounded-xl shadow-sm border border-[var(--zalama-border)]">
        <div className="flex border-b border-[var(--zalama-border)]">
          <button
            onClick={() => setActiveTab('gestion')}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === 'gestion'
                ? 'text-[var(--zalama-blue)] border-b-2 border-[var(--zalama-blue)] bg-[var(--zalama-bg-light)]'
                : 'text-[var(--zalama-text-secondary)] hover:text-[var(--zalama-text)] hover:bg-[var(--zalama-bg-light)]'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Building className="w-4 h-4" />
              Gestion des Partenaires
            </div>
          </button>
          <button
            onClick={() => setActiveTab('demandes')}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === 'demandes'
                ? 'text-[var(--zalama-blue)] border-b-2 border-[var(--zalama-blue)] bg-[var(--zalama-bg-light)]'
                : 'text-[var(--zalama-text-secondary)] hover:text-[var(--zalama-text)] hover:bg-[var(--zalama-bg-light)]'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <FileText className="w-4 h-4" />
              Demandes Partenaires
              {demandeStats.pending > 0 && (
                <span className="bg-[var(--zalama-warning)] text-white text-xs px-2 py-1 rounded-full">
                  {demandeStats.pending}
                </span>
              )}
            </div>
          </button>
        </div>
        
        <div className="p-6">
          {activeTab === 'gestion' ? renderGestionPartenaires() : renderDemandesPartenaires()}
        </div>
      </div>

      {/* Modales */}
      <ModaleAjoutPartenaire
        isOpen={showAddModal}
        types={types}
        onClose={() => {
          setShowAddModal(false);
          setPrefillData(null);
        }}
        onSubmit={handleSubmitAddPartenaire}
        prefillData={prefillData}
      />

      <ModaleEditionPartenaire
        isOpen={showEditModal}
        types={types}
        partenaire={currentPartenaire}
        onClose={() => setShowEditModal(false)}
        onSubmit={handleSubmitEditPartenaire}
      />

      <ModaleSuppressionPartenaire
        isOpen={showDeleteModal}
        partenaire={currentPartenaire}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleSubmitDeletePartenaire}
      />
    </div>
  );



  // Handlers pour les formulaires CRUD
  async function handleSubmitAddPartenaire(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    
    try {
      console.log('🚀 Début de handleSubmitAddPartenaire');
      
      // Récupérer les données du formulaire depuis le stockage temporaire
      const formData = (window as any).formData;
      
      if (!formData) {
        toast.error('Aucune donnée de formulaire trouvée');
        return;
      }

      console.log('📋 Données du formulaire:', formData);
      console.log('📊 Nombre de partenaires avant création:', partenaires.length);

      // Créer le partenaire
      const result = await createPartenaire(formData);
      
      console.log('✅ Partenaire créé avec succès:', result.partenaire);
      console.log('📊 Nombre de partenaires après création:', partenaires.length);
      
      // Afficher les résultats
      toast.success('Partenaire créé avec succès !');
      
      // Afficher les détails des comptes créés
      if (result.accountResults.rh.success) {
        toast.success(`Compte RH créé - Mot de passe: ${result.accountResults.rh.password}`);
      }
      if (result.accountResults.responsable.success) {
        toast.success(`Compte responsable créé - Mot de passe: ${result.accountResults.responsable.password}`);
      }
      
      // Rafraîchir la liste des partenaires
      console.log('🔄 Rafraîchissement de la liste des partenaires...');
      await refreshPartenaires();
      console.log('✅ Liste rafraîchie, nombre de partenaires:', partenaires.length);
      
      // Le modal se ferme automatiquement après succès
      
    } catch (error) {
      console.error('❌ Erreur lors de la création du partenaire:', error);
      toast.error('Erreur lors de la création du partenaire');
      // Propager l'erreur pour que le modal ne se ferme pas
      throw error;
    }
  }

  async function handleSubmitEditPartenaire(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    
    if (!currentPartenaire) {
      toast.error('Aucun partenaire sélectionné');
      return;
    }
    
    try {
      const form = e.currentTarget;
      
      // Récupérer les données du formulaire
      const formData = {
        nom: (form.querySelector('#nom') as HTMLInputElement)?.value || '',
        type: (form.querySelector('#type') as HTMLSelectElement)?.value || '',
        secteur: (form.querySelector('#domaine') as HTMLInputElement)?.value || '',
        description: (form.querySelector('#description') as HTMLTextAreaElement)?.value || '',
        email: (form.querySelector('#email') as HTMLInputElement)?.value || '',
        telephone: (form.querySelector('#telephone') as HTMLInputElement)?.value || '',
        adresse: (form.querySelector('#adresse') as HTMLInputElement)?.value || '',
        site_web: (form.querySelector('#siteWeb') as HTMLInputElement)?.value || '',
        actif: (form.querySelector('#actif') as HTMLInputElement)?.checked || false,
        // Informations légales
        rccm: (form.querySelector('#rccm') as HTMLInputElement)?.value || '',
        nif: (form.querySelector('#nif') as HTMLInputElement)?.value || '',
        // Informations du représentant
        nom_representant: (form.querySelector('#nom_representant') as HTMLInputElement)?.value || '',
        email_representant: (form.querySelector('#email_representant') as HTMLInputElement)?.value || '',
        telephone_representant: (form.querySelector('#telephone_representant') as HTMLInputElement)?.value || '',
        // Informations RH
        nom_rh: (form.querySelector('#nom_rh') as HTMLInputElement)?.value || '',
        email_rh: (form.querySelector('#email_rh') as HTMLInputElement)?.value || '',
        telephone_rh: (form.querySelector('#telephone_rh') as HTMLInputElement)?.value || '',
        // Informations financières
        nombre_employes: parseInt((form.querySelector('#nombre_employes') as HTMLInputElement)?.value || '0'),
        salaire_net_total: parseFloat((form.querySelector('#salaire_net_total') as HTMLInputElement)?.value || '0')
      };

      // Mettre à jour le partenaire
      await updatePartenaire(currentPartenaire.id, formData);
      
      toast.success('Partenaire mis à jour avec succès !');
      setShowEditModal(false);
      setCurrentPartenaire(null);
      
    } catch (error) {
      console.error('Erreur lors de la mise à jour du partenaire:', error);
      toast.error('Erreur lors de la mise à jour du partenaire');
    }
  }

  async function handleSubmitDeletePartenaire() {
    if (!currentPartenaire) {
      toast.error('Aucun partenaire sélectionné');
      return;
    }
    
    try {
      // Supprimer le partenaire
      await deletePartenaire(currentPartenaire.id);
      
      toast.success('Partenaire supprimé avec succès !');
      setShowDeleteModal(false);
      setCurrentPartenaire(null);
      
    } catch (error) {
      console.error('Erreur lors de la suppression du partenaire:', error);
      toast.error('Erreur lors de la suppression du partenaire');
    }
  }
}


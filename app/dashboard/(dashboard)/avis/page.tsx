"use client";

import React, { useState, useMemo } from 'react';
import { Search, Filter, Star, MessageSquare, User, Building, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useSupabaseAvis } from '@/hooks/useSupabaseAvis';
import { Avis } from '@/types/avis';
import { toast } from 'react-hot-toast';

type TabType = 'tous' | 'approuves' | 'en_attente' | 'positifs' | 'negatifs';

export default function AvisPage() {
  // États locaux
  const [activeTab, setActiveTab] = useState<TabType>('tous');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<string>('tous');

  // Utilisation du hook Supabase
  const {
    avis,
    loading: isLoading,
    error,
    statistics,
    statisticsLoading,
    toggleApproval,
    deleteAvis,
    searchAvis,
    getByPartner,
    refreshAvis
  } = useSupabaseAvis();

  // Filtrer les avis en fonction de l'onglet actif et de la recherche
  const filteredAvis = useMemo(() => {
    let filtered = avis;

    // Filtrage par onglet
    switch (activeTab) {
      case 'approuves':
        filtered = filtered.filter(avis => avis.approuve);
        break;
      case 'en_attente':
        filtered = filtered.filter(avis => !avis.approuve);
        break;
      case 'positifs':
        filtered = filtered.filter(avis => avis.type_retour === 'positif');
        break;
      case 'negatifs':
        filtered = filtered.filter(avis => avis.type_retour === 'negatif');
        break;
      default:
        break;
    }

    // Filtrage par partenaire
    if (selectedPartner !== 'tous') {
      filtered = filtered.filter(avis => avis.partner_id === selectedPartner);
    }

    return filtered;
  }, [avis, activeTab, selectedPartner]);

  // Pagination
  const totalPages = Math.ceil(filteredAvis.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentAvis = filteredAvis.slice(startIndex, endIndex);

  // Gestionnaires d'événements
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchAvis(searchTerm);
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const handlePartnerFilter = (partnerId: string) => {
    setSelectedPartner(partnerId);
    setCurrentPage(1);
    if (partnerId === 'tous') {
      refreshAvis();
    } else {
      getByPartner(partnerId);
    }
  };

  const handleToggleApproval = async (avis: Avis) => {
    try {
      await toggleApproval(avis.id, !avis.approuve);
      toast.success(avis.approuve ? 'Avis rejeté' : 'Avis approuvé');
    } catch (error) {
      toast.error('Erreur lors de la modification de l\'approbation');
    }
  };

  const handleDeleteAvis = async (avis: Avis) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet avis ?')) {
      try {
        await deleteAvis(avis.id);
        toast.success('Avis supprimé avec succès');
      } catch (error) {
        toast.error('Erreur lors de la suppression de l\'avis');
      }
    }
  };

  // Rendu des étoiles
  const renderStars = (note: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < note 
            ? 'text-yellow-400 fill-current' 
            : 'text-gray-300'
        }`}
      />
    ));
  };

  // Rendu du statut d'approbation
  const renderApprovalStatus = (avis: Avis) => {
    if (avis.approuve) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="w-3 h-3 mr-1" />
          Approuvé
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <Clock className="w-3 h-3 mr-1" />
          En attente
        </span>
      );
    }
  };

  // Rendu du type de retour
  const renderFeedbackType = (avis: Avis) => {
    if (avis.type_retour === 'positif') {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          Positif
        </span>
      );
    } else if (avis.type_retour === 'negatif') {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
          Négatif
        </span>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {Array.from({ length: 5 }, (_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 w-full">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--zalama-text)] mb-2">
            Gestion des Avis
          </h1>
          <p className="text-[var(--zalama-text-secondary)]">
            Gérez les avis et commentaires des utilisateurs
          </p>
        </div>
        
        {/* Statistiques rapides */}
        {statistics && (
          <div className="flex gap-4 mt-4 sm:mt-0">
            <div className="text-center">
              <div className="text-2xl font-bold text-[var(--zalama-blue)]">
                {statistics.total_avis}
              </div>
              <div className="text-sm text-[var(--zalama-text-secondary)]">Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {statistics.moyenne_note}/5
              </div>
              <div className="text-sm text-[var(--zalama-text-secondary)]">Moyenne</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {statistics.avis_en_attente}
              </div>
              <div className="text-sm text-[var(--zalama-text-secondary)]">En attente</div>
            </div>
          </div>
        )}
      </div>

      {/* Barre de recherche et filtres */}
      <div className="bg-[var(--zalama-card)] rounded-lg border border-[var(--zalama-border)] p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Recherche */}
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--zalama-text-secondary)] w-4 h-4" />
              <input
                type="text"
                placeholder="Rechercher dans les avis..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-[var(--zalama-border)] rounded-lg bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)] focus:outline-none focus:ring-2 focus:ring-[var(--zalama-blue)]"
              />
            </div>
          </form>

          {/* Bouton filtres */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 border border-[var(--zalama-border)] rounded-lg bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)] hover:bg-[var(--zalama-bg-light)] transition-colors"
          >
            <Filter className="w-4 h-4" />
            Filtres
          </button>
        </div>

        {/* Filtres avancés */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-[var(--zalama-border)]">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--zalama-text)] mb-2">
                  Partenaire
                </label>
                <select
                  value={selectedPartner}
                  onChange={(e) => handlePartnerFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-[var(--zalama-border)] rounded-lg bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)]"
                >
                  <option value="tous">Tous les partenaires</option>
                  {/* Ajouter les partenaires dynamiquement */}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Onglets */}
      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { key: 'tous', label: 'Tous', count: avis.length },
          { key: 'approuves', label: 'Approuvés', count: avis.filter(a => a.approuve).length },
          { key: 'en_attente', label: 'En attente', count: avis.filter(a => !a.approuve).length },
          { key: 'positifs', label: 'Positifs', count: avis.filter(a => a.type_retour === 'positif').length },
          { key: 'negatifs', label: 'Négatifs', count: avis.filter(a => a.type_retour === 'negatif').length }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => handleTabChange(tab.key as TabType)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              activeTab === tab.key
                ? 'bg-[var(--zalama-blue)] text-white'
                : 'bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)] hover:bg-[var(--zalama-bg-light)]'
            }`}
          >
            {tab.label}
            <span className="bg-white/20 px-2 py-1 rounded-full text-xs">
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Liste des avis */}
      <div className="space-y-4">
        {currentAvis.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="w-12 h-12 text-[var(--zalama-text-secondary)] mx-auto mb-4" />
            <h3 className="text-lg font-medium text-[var(--zalama-text)] mb-2">
              Aucun avis trouvé
            </h3>
            <p className="text-[var(--zalama-text-secondary)]">
              {searchTerm ? 'Aucun avis ne correspond à votre recherche.' : 'Aucun avis pour le moment.'}
            </p>
          </div>
        ) : (
          currentAvis.map((avis) => (
            <div
              key={avis.id}
              className="bg-[var(--zalama-card)] rounded-lg border border-[var(--zalama-border)] p-6"
            >
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                {/* Contenu principal */}
                <div className="flex-1">
                  {/* En-tête de l'avis */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {avis.employee?.prenom?.[0] || 'E'}
                      </div>
                      <div>
                        <div className="font-medium text-white">
                          {avis.employee ? `${avis.employee.prenom} ${avis.employee.nom}` : 'Employé anonyme'}
                        </div>
                        <div className="text-sm text-gray-600">
                          {avis.employee?.poste && `${avis.employee.poste} • `}
                          {new Date(avis.date_avis).toLocaleDateString('fr-FR')}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {renderApprovalStatus(avis)}
                      {renderFeedbackType(avis)}
                    </div>
                  </div>

                  {/* Note */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex">
                      {renderStars(avis.note)}
                    </div>
                    <span className="text-sm text-[var(--zalama-text-secondary)]">
                      {avis.note}/5
                    </span>
                  </div>

                  {/* Partenaire */}
                  {avis.partner && (
                    <div className="flex items-center gap-2 mb-3">
                      <Building className="w-4 h-4 text-[var(--zalama-text-secondary)]" />
                      <span className="text-sm text-[var(--zalama-text-secondary)]">
                        {avis.partner.nom}
                      </span>
                    </div>
                  )}

                  {/* Commentaire */}
                  {avis.commentaire && (
                    <div className="bg-[var(--zalama-bg-lighter)] rounded-lg p-4">
                      <p className="text-[var(--zalama-text)]">{avis.commentaire}</p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 lg:flex-shrink-0">
                  <button
                    onClick={() => handleToggleApproval(avis)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                      avis.approuve
                        ? 'bg-red-100 text-red-700 hover:bg-red-200'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    {avis.approuve ? (
                      <>
                        <XCircle className="w-4 h-4" />
                        Rejeter
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Approuver
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={() => handleDeleteAvis(avis)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                  >
                    <XCircle className="w-4 h-4" />
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 border border-[var(--zalama-border)] rounded-lg bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--zalama-bg-light)] transition-colors"
            >
              Précédent
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-2 rounded-lg transition-colors ${
                  currentPage === page
                    ? 'bg-[var(--zalama-blue)] text-white'
                    : 'border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)] hover:bg-[var(--zalama-bg-light)]'
                }`}
              >
                {page}
              </button>
            ))}
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 border border-[var(--zalama-border)] rounded-lg bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--zalama-bg-light)] transition-colors"
            >
              Suivant
            </button>
          </div>
        </div>
      )}

      {/* Affichage des erreurs */}
      {error && (
        <div className="mt-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}
    </div>
  );
} 
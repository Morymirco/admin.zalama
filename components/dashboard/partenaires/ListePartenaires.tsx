"use client";
import React, { useState } from 'react';
import { usePartners } from '@/hooks/useDatabase';
import { Partner } from '@/lib/supabase';
import { Search, Plus, Edit, Trash2, RefreshCw, ChevronLeft, ChevronRight, Mail, Phone, Globe, ExternalLink, Building, Users, CheckCircle, XCircle } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import ModaleAjoutPartenaire from './ModaleAjoutPartenaire';
import StatCard from '../StatCard';

interface Partenaire {
  id: string;
  nom: string;
  type: string;
  secteur: string;
  description: string;
  adresse: string;
  email: string;
  telephone: string;
  site_web: string;
  logo: string;
  datePartenariat: string;
  actif: boolean;
}

interface ListePartenairesProps {
  partenaires: Partenaire[];
  filteredPartenaires: Partenaire[];
  searchTerm: string;
  typeFilter: string;
  types: string[];
  currentPage: number;
  itemsPerPage: number;
  isLoading: boolean;
  onSearch: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onTypeFilterChange: (type: string) => void;
  onPageChange: (page: number) => void;
  onAddClick: () => void;
  onEditClick: (partenaire: Partenaire) => void;
  onDeleteClick: (partenaire: Partenaire) => void;
}

const ListePartenaires: React.FC<ListePartenairesProps> = ({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  partenaires,
  filteredPartenaires,
  searchTerm,
  typeFilter,
  types,
  currentPage,
  itemsPerPage,
  isLoading,
  onSearch,
  onTypeFilterChange,
  onPageChange,
  onAddClick,
  onEditClick,
  onDeleteClick
}) => {
  const router = useRouter();
  const { partners, loading, error, deletePartner, fetchPartners } = usePartners();
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // Filtrer les partenaires
  const filteredPartners = partners.filter(partner => {
    const matchesSearch = 
      partner.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      partner.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      partner.telephone?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || partner.type === filterType;
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'Actif' && partner.actif) ||
      (filterStatus === 'Inactif' && !partner.actif);
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleDeletePartner = async (partnerId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce partenaire ?')) {
      try {
        await deletePartner(partnerId);
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        alert('Erreur lors de la suppression du partenaire');
      }
    }
  };

  const handleAddSuccess = () => {
    // Recharger la liste des partenaires
    fetchPartners();
  };

  const getStatusColor = (actif: boolean) => {
    return actif ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Université':
        return 'bg-blue-100 text-blue-800';
      case 'Entreprise':
        return 'bg-purple-100 text-purple-800';
      case 'Organisation':
        return 'bg-orange-100 text-orange-800';
      case 'Institution':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Fonction pour naviguer vers la page de détail d'un partenaire
  const handleViewDetails = (id: string) => {
    router.push(`/dashboard/partenaires/${id}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--zalama-blue)]"></div>
        <span className="ml-2 text-[var(--zalama-text-secondary)]">Chargement des partenaires...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500 text-center">
          <p>Erreur lors du chargement des partenaires</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec titre */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-[var(--zalama-blue)]">Gestion des partenaires</h2>
          <p className="text-sm text-[var(--zalama-text-secondary)] mt-1">
            Gérez vos partenaires et organisations partenaires
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-[var(--zalama-blue)] hover:bg-[var(--zalama-blue-dark)] text-white rounded-lg transition-colors flex items-center space-x-2 shadow-md"
        >
          <Plus className="h-4 w-4" />
          <span>Ajouter un partenaire</span>
        </button>
      </div>

      {/* Statistiques avec StatCard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total partenaires"
          value={partners.length}
          icon={<Building className="h-6 w-6" />}
          accent="bg-blue-600"
        />
        <StatCard
          label="Partenaires actifs"
          value={partners.filter(p => p.actif).length}
          icon={<CheckCircle className="h-6 w-6" />}
          accent="bg-green-600"
        />
        <StatCard
          label="Universités"
          value={partners.filter(p => p.type === 'Université').length}
          icon={<Building className="h-6 w-6" />}
          accent="bg-purple-600"
        />
        <StatCard
          label="Entreprises"
          value={partners.filter(p => p.type === 'Entreprise').length}
          icon={<Users className="h-6 w-6" />}
          accent="bg-orange-600"
        />
      </div>

      {/* Filtres et recherche */}
      <div className="bg-[var(--zalama-card)] rounded-xl shadow-md border border-[var(--zalama-border)] p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[var(--zalama-text-secondary)]" />
            <input
              type="text"
              placeholder="Rechercher par nom, email ou téléphone..."
              value={searchTerm}
              onChange={(e) => onSearch(e)}
              className="w-full pl-10 pr-4 py-3 border border-[var(--zalama-border)] rounded-lg bg-[var(--zalama-bg)] text-[var(--zalama-text)] focus:outline-none focus:ring-2 focus:ring-[var(--zalama-blue)] transition-all"
            />
          </div>
          <div className="flex gap-3">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-3 border border-[var(--zalama-border)] rounded-lg bg-[var(--zalama-bg)] text-[var(--zalama-text)] focus:outline-none focus:ring-2 focus:ring-[var(--zalama-blue)] transition-all"
            >
              <option value="all">Tous les types</option>
              <option value="Université">Universités</option>
              <option value="Entreprise">Entreprises</option>
              <option value="Organisation">Organisations</option>
              <option value="Institution">Institutions</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-3 border border-[var(--zalama-border)] rounded-lg bg-[var(--zalama-bg)] text-[var(--zalama-text)] focus:outline-none focus:ring-2 focus:ring-[var(--zalama-blue)] transition-all"
            >
              <option value="all">Tous les statuts</option>
              <option value="Actif">Actifs</option>
              <option value="Inactif">Inactifs</option>
            </select>
            <button
              onClick={() => fetchPartners()}
              className="px-4 py-3 border border-[var(--zalama-border)] rounded-lg bg-[var(--zalama-bg)] text-[var(--zalama-text)] hover:bg-[var(--zalama-bg-light)] transition-all flex items-center space-x-2"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Actualiser</span>
            </button>
          </div>
        </div>
      </div>

      {/* Liste des partenaires */}
      <div className="bg-[var(--zalama-card)] rounded-xl shadow-md border border-[var(--zalama-border)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[var(--zalama-bg-light)] border-b border-[var(--zalama-border)]">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--zalama-text-secondary)] uppercase tracking-wider">
                  Partenaire
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--zalama-text-secondary)] uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--zalama-text-secondary)] uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--zalama-text-secondary)] uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--zalama-text-secondary)] uppercase tracking-wider">
                  Date d'ajout
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--zalama-text-secondary)] uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--zalama-border)]">
              {filteredPartners.length > 0 ? (
                filteredPartners.map((partner) => (
                  <tr key={partner.id} className="hover:bg-[var(--zalama-bg-light)] transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-12">
                          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[var(--zalama-blue)] to-[var(--zalama-blue-dark)] flex items-center justify-center shadow-md">
                            <span className="text-white font-bold text-lg">
                              {partner.nom?.[0]?.toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-semibold text-[var(--zalama-text)]">
                            {partner.nom}
                          </div>
                          {partner.secteur && (
                            <div className="text-sm text-[var(--zalama-text-secondary)]">
                              {partner.secteur}
                            </div>
                          )}
                          {partner.adresse && (
                            <div className="text-xs text-[var(--zalama-text-secondary)] mt-1">
                              📍 {partner.adresse}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getTypeColor(partner.type)}`}>
                        {partner.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <div className="flex items-center text-sm text-[var(--zalama-text)]">
                          <Mail className="h-3 w-3 mr-2 text-[var(--zalama-text-secondary)]" />
                          {partner.email}
                        </div>
                        {partner.telephone && (
                          <div className="flex items-center text-sm text-[var(--zalama-text-secondary)]">
                            <Phone className="h-3 w-3 mr-2" />
                            {partner.telephone}
                          </div>
                        )}
                        {partner.site_web && (
                          <div className="flex items-center text-sm text-[var(--zalama-text-secondary)]">
                            <Globe className="h-3 w-3 mr-2" />
                            <a 
                              href={partner.site_web} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="hover:text-[var(--zalama-blue)] transition-colors flex items-center"
                            >
                              Site web
                              <ExternalLink className="h-3 w-3 ml-1" />
                            </a>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(partner.actif)}`}>
                        {partner.actif ? (
                          <>
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Actif
                          </>
                        ) : (
                          <>
                            <XCircle className="h-3 w-3 mr-1" />
                            Inactif
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--zalama-text-secondary)]">
                      {new Date(partner.created_at).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewDetails(partner.id)}
                          className="text-[var(--zalama-blue)] hover:text-[var(--zalama-blue-dark)] transition-colors p-1 rounded"
                          title="Voir les détails"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {/* TODO: Ouvrir modal d'édition */}}
                          className="text-[var(--zalama-blue)] hover:text-[var(--zalama-blue-dark)] transition-colors p-1 rounded"
                          title="Modifier"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeletePartner(partner.id)}
                          className="text-red-600 hover:text-red-900 transition-colors p-1 rounded"
                          title="Supprimer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <Building className="h-12 w-12 text-[var(--zalama-text-secondary)] mb-4" />
                      <p className="text-[var(--zalama-text-secondary)] font-medium">
                        {searchTerm || filterType !== 'all' || filterStatus !== 'all' 
                          ? 'Aucun partenaire ne correspond aux critères de recherche'
                          : 'Aucun partenaire trouvé'
                        }
                      </p>
                      <p className="text-sm text-[var(--zalama-text-secondary)] mt-1">
                        {searchTerm || filterType !== 'all' || filterStatus !== 'all'
                          ? 'Essayez de modifier vos filtres ou votre recherche'
                          : 'Commencez par ajouter votre premier partenaire'
                        }
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {filteredPartners.length > 0 && (
        <div className="bg-[var(--zalama-card)] rounded-xl shadow-md border border-[var(--zalama-border)] p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-[var(--zalama-text-secondary)]">
              Affichage de {filteredPartners.length} partenaire(s)
            </div>
            <div className="flex items-center space-x-2">
              <button className="px-3 py-2 text-sm border border-[var(--zalama-border)] rounded-lg bg-[var(--zalama-bg)] text-[var(--zalama-text)] hover:bg-[var(--zalama-bg-light)] transition-colors flex items-center">
                <ChevronLeft className="h-4 w-4 mr-1" />
                Précédent
              </button>
              <span className="px-3 py-2 text-sm text-[var(--zalama-text)]">
                Page 1 sur 1
              </span>
              <button className="px-3 py-2 text-sm border border-[var(--zalama-border)] rounded-lg bg-[var(--zalama-bg)] text-[var(--zalama-text)] hover:bg-[var(--zalama-bg-light)] transition-colors flex items-center">
                Suivant
                <ChevronRight className="h-4 w-4 ml-1" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal d'ajout de partenaire */}
      <ModaleAjoutPartenaire
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={handleAddSuccess}
      />
    </div>
  );
};

export default ListePartenaires;

"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Building, Filter, Globe, Plus, Search, Users } from 'lucide-react';
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

// Importation du hook Supabase
import { useSupabasePartners } from '@/hooks/useSupabasePartners';

// Types
import { Partenaire } from '@/types/partenaire';

interface StatistiquePartenaire {
  type: string;
  nombre: number;
  nouveauxCeMois: number;
  actifs: number;
  inactifs: number;
  tendance: 'hausse' | 'stable' | 'baisse';
  icon: React.ReactNode;
}

export default function PartenairesPage() {
  // États locaux
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentPartenaire, setCurrentPartenaire] = useState<Partenaire | null>(null);
  const [typeFilter, setTypeFilter] = useState<string>('tous');

  // Utilisation du hook Supabase
  const {
    partenaires,
    loading: isLoading,
    error,
    statistiques,
    createPartenaire,
    updatePartenaire,
    deletePartenaire,
    searchPartenaires,
    filterByType,
    loadStatistiques
  } = useSupabasePartners();

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
  }, [error]);

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
      await filterByType(type);
    }
  }, [filterByType]);

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

  const handleSubmitAddPartenaire = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    try {
      // Récupérer les données du formulaire depuis window.formData (défini dans la modale)
      const formData = (window as any).formData;
      
      if (!formData) {
        throw new Error('Données du formulaire non trouvées');
      }

      // Créer le partenaire avec Supabase
      const result = await createPartenaire({
        nom: formData.nom,
        type: formData.type,
        secteur: formData.secteur,
        description: formData.description,
        
        // Représentant
        nom_representant: formData.nom_representant,
        email_representant: formData.email_representant,
        telephone_representant: formData.telephone_representant,
        
        // Responsable RH
        nom_rh: formData.nom_rh,
        email_rh: formData.email_rh,
        telephone_rh: formData.telephone_rh,
        
        // Informations légales
        rccm: formData.rccm,
        nif: formData.nif,
        
        // Contact
        email: formData.email,
        telephone: formData.telephone,
        adresse: formData.adresse,
        site_web: formData.site_web,
        
        // Autres informations
        logo_url: formData.logo_url,
        actif: formData.actif,
        nombre_employes: 0,
        salaire_net_total: 0
      });

      // Afficher le toast principal de succès
      toast.success(`Partenaire "${result.partenaire.nom}" ajouté avec succès !`);

      // Afficher les toasts pour les SMS
      if (result.smsResults) {
        // SMS au représentant
        if (result.smsResults.representant.success) {
          toast.success(`✅ ${result.smsResults.representant.message}`, {
            duration: 4000,
            icon: '📱'
          });
        } else if (result.smsResults.representant.error) {
          toast.error(`❌ ${result.smsResults.representant.error}`, {
            duration: 4000,
            icon: '📱'
          });
        }

        // SMS au responsable RH
        if (result.smsResults.rh.success) {
          toast.success(`✅ ${result.smsResults.rh.message}`, {
            duration: 4000,
            icon: '👥'
          });
        } else if (result.smsResults.rh.error) {
          toast.error(`❌ ${result.smsResults.rh.error}`, {
            duration: 4000,
            icon: '👥'
          });
        }

        // SMS de notification admin
        if (result.smsResults.admin.success) {
          toast.success(`✅ ${result.smsResults.admin.message}`, {
            duration: 3000,
            icon: '🔔'
          });
        } else if (result.smsResults.admin.error) {
          toast.error(`❌ ${result.smsResults.admin.error}`, {
            duration: 3000,
            icon: '🔔'
          });
        }

        // Résumé des SMS
        const smsSuccessCount = [
          result.smsResults.representant.success,
          result.smsResults.rh.success,
          result.smsResults.admin.success
        ].filter(Boolean).length;

        const totalSMS = 3;
        
        if (smsSuccessCount === totalSMS) {
          toast.success(`🎉 Tous les SMS (${totalSMS}) ont été envoyés avec succès !`, {
            duration: 5000,
            icon: '🎉'
          });
        } else if (smsSuccessCount > 0) {
          toast.warning(`⚠️ ${smsSuccessCount}/${totalSMS} SMS envoyés avec succès`, {
            duration: 5000,
            icon: '⚠️'
          });
        } else {
          toast.error(`❌ Aucun SMS n'a pu être envoyé`, {
            duration: 5000,
            icon: '❌'
          });
        }
      }

      setShowAddModal(false);
      
      // Nettoyer les données temporaires
      delete (window as any).formData;
      
    } catch (error) {
      console.error('Erreur lors de l\'ajout du partenaire:', error);
      toast.error('Erreur lors de l\'ajout du partenaire');
    }
  }, [createPartenaire]);

  const handleSubmitEditPartenaire = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!currentPartenaire) return;
    
    try {
      const formData = (window as any).formData;
      
      if (!formData) {
        throw new Error('Données du formulaire non trouvées');
      }

      // Mettre à jour le partenaire
      await updatePartenaire(currentPartenaire.id, {
        nom: formData.nom,
        type: formData.type,
        secteur: formData.secteur,
        description: formData.description,
        
        // Représentant
        nom_representant: formData.nom_representant,
        email_representant: formData.email_representant,
        telephone_representant: formData.telephone_representant,
        
        // Responsable RH
        nom_rh: formData.nom_rh,
        email_rh: formData.email_rh,
        telephone_rh: formData.telephone_rh,
        
        // Informations légales
        rccm: formData.rccm,
        nif: formData.nif,
        
        // Contact
        email: formData.email,
        telephone: formData.telephone,
        adresse: formData.adresse,
        site_web: formData.site_web,
        
        // Autres informations
        logo_url: formData.logo_url,
        actif: formData.actif
      });

      toast.success('Partenaire mis à jour avec succès !');
      setShowEditModal(false);
      setCurrentPartenaire(null);
      
      // Nettoyer les données temporaires
      delete (window as any).formData;
      
    } catch (error) {
      console.error('Erreur lors de la mise à jour du partenaire:', error);
      toast.error('Erreur lors de la mise à jour du partenaire');
    }
  }, [updatePartenaire, currentPartenaire]);

  const handleConfirmDeletePartenaire = useCallback(async () => {
    if (!currentPartenaire) return;
    
    try {
      await deletePartenaire(currentPartenaire.id);
      toast.success('Partenaire supprimé avec succès !');
      setShowDeleteModal(false);
      setCurrentPartenaire(null);
    } catch (error) {
      console.error('Erreur lors de la suppression du partenaire:', error);
      toast.error('Erreur lors de la suppression du partenaire');
    }
  }, [deletePartenaire, currentPartenaire]);

  return (
    <div className="p-4 md:p-6">
      {/* En-tête de la page */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--zalama-text)]">Gestion des Partenaires</h1>
          <p className="text-[var(--zalama-text-secondary)]">
            Gérez vos partenaires et leurs informations
          </p>
        </div>
        <button
          onClick={handleAddPartenaire}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--zalama-blue)] hover:bg-[var(--zalama-blue-accent)] text-white rounded-lg transition-colors mt-4 md:mt-0"
        >
          <Plus className="h-4 w-4" />
          Ajouter un partenaire
        </button>
      </div>

      {/* Statistiques */}
      <div className="mb-6">
        {/* Résumé des partenaires */}
        <ResumePartenaires 
          totalPartenaires={partenaires.length}
          partenairesActifs={partenaires.filter(p => p.actif).length}
          partenairesInactifs={partenaires.filter(p => !p.actif).length}
          nouveauxCeMois={partenaires.filter(p => {
            const now = new Date();
            const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            return new Date(p.created_at) >= firstDayOfMonth;
          }).length}
          isLoading={isLoading}
        />
        
        {/* Statistiques détaillées par type */}
        <StatistiquesPartenaires 
          statistiques={statistiquesCalculées} 
          isLoading={isLoading}
        />
      </div>

      {/* Filtres et recherche */}
      <div className="bg-[var(--zalama-card)] rounded-xl p-4 border border-[var(--zalama-border)] mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Recherche */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[var(--zalama-text-secondary)]" />
              <input
                type="text"
                placeholder="Rechercher un partenaire..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)] focus:border-[var(--zalama-blue)] focus:outline-none"
              />
            </div>
          </div>

          {/* Filtre par type */}
          <div className="flex gap-2">
            <select
              value={typeFilter}
              onChange={(e) => handleTypeFilterChange(e.target.value)}
              className="px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)] focus:border-[var(--zalama-blue)] focus:outline-none"
            >
              {types.map((type) => (
                <option key={type} value={type}>
                  {type === 'tous' ? 'Tous les types' : type}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Liste des partenaires */}
      <ListePartenaires
        partenaires={currentItems}
        onEdit={handleEditPartenaire}
        onDelete={handleDeletePartenaire}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        isLoading={isLoading}
      />

      {/* Modales */}
      <ModaleAjoutPartenaire
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleSubmitAddPartenaire}
        types={types.filter(t => t !== 'tous')}
      />

      <ModaleEditionPartenaire
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setCurrentPartenaire(null);
        }}
        onSubmit={handleSubmitEditPartenaire}
        partenaire={currentPartenaire}
        types={types.filter(t => t !== 'tous')}
      />

      <ModaleSuppressionPartenaire
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setCurrentPartenaire(null);
        }}
        onConfirm={handleConfirmDeletePartenaire}
        partenaire={currentPartenaire}
      />
    </div>
  );
}


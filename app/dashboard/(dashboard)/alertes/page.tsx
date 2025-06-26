"use client";

import React, { useState, useMemo, useCallback } from 'react';
import { AlertTriangle, AlertCircle, BellRing } from 'lucide-react';
import { Timestamp, serverTimestamp } from 'firebase/firestore';
import {
  StatistiquesAlertes,
  ResumeAlertes,
  ListeAlertes,
  ModaleAjoutAlerte,
  ModaleEditionAlerte,
  ModaleSuppressionAlerte
} from '@/components/dashboard/alertes';

// Services Firebase
import { useSupabaseCollection } from '@/hooks/useSupabaseCollection';
import { alerteService } from '@/services/alerteService';

// Types
import { Alerte } from '@/types/alerte';

// Interface pour la page alertes (adaptation pour l'affichage)
interface AlerteUI extends Omit<Alerte, 'dateCreation' | 'dateResolution'> {
  dateCreation: string;
  dateResolution?: string;
}

export default function AlertesPage() {
  // États
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('tous');
  const [statutFilter, setStatutFilter] = useState('tous');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentAlerte, setCurrentAlerte] = useState<AlerteUI | null>(null);
  
  // Utilisation du hook pour récupérer les alertes depuis Firestore
  const { data: firebaseAlertes, loading: isLoading } = useSupabaseCollection<Alerte>(alerteService);

  // Types et statuts disponibles
  const types = ['tous', 'Critique', 'Importante', 'Information'];
  const statuts = ['tous', 'Nouvelle', 'En cours', 'Résolue'];

  // Convertir les alertes Firestore en format d'affichage
  const alertes = useMemo(() => {
    if (!firebaseAlertes) return [];
    
    return firebaseAlertes.map(alerte => {
      // Formater les dates pour l'affichage
      const dateCreation = alerte.dateCreation instanceof Timestamp
        ? alerte.dateCreation.toDate().toISOString()
        : new Date().toISOString();
      
      const dateResolution = alerte.dateResolution instanceof Timestamp
        ? alerte.dateResolution.toDate().toISOString()
        : undefined;
      
      return {
        ...alerte,
        dateCreation,
        dateResolution
      } as AlerteUI;
    });
  }, [firebaseAlertes]);

  // Filtrage des alertes avec useMemo pour éviter les re-rendus inutiles
  const filteredAlertes = useMemo(() => {
    let filtered = [...alertes];
    
    // Filtre par terme de recherche
    if (searchTerm) {
      filtered = filtered.filter(alerte => 
        alerte.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alerte.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alerte.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (alerte.assigneA && alerte.assigneA.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Filtre par type
    if (typeFilter !== 'tous') {
      filtered = filtered.filter(alerte => alerte.type === typeFilter);
    }
    
    // Filtre par statut
    if (statutFilter !== 'tous') {
      filtered = filtered.filter(alerte => alerte.statut === statutFilter);
    }
    
    return filtered;
  }, [alertes, searchTerm, typeFilter, statutFilter]);

  // Handlers
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleTypeFilterChange = (type: string) => {
    setTypeFilter(type);
  };

  const handleStatutFilterChange = (statut: string) => {
    setStatutFilter(statut);
  };

  const handleAddAlerte = () => {
    setShowAddModal(true);
  };

  const handleEditAlerte = (alerte: AlerteUI) => {
    setCurrentAlerte(alerte);
    setShowEditModal(true);
  };

  const handleDeleteAlerte = (alerte: AlerteUI) => {
    setCurrentAlerte(alerte);
    setShowDeleteModal(true);
  };

  const handleResolveAlerte = useCallback(async (alerte: AlerteUI) => {
    try {
      // Convertir les dates string en Timestamp pour Firestore
      await alerteService.update(alerte.id, {
        statut: 'Résolue',
        dateResolution: Timestamp.now()
      });
      console.log('Alerte marquée comme résolue avec succès');
    } catch (error) {
      console.error('Erreur lors de la résolution de l\'alerte:', error);
    }
  }, []);

  // Formulaire d'ajout d'alerte
  const handleSubmitAddAlerte = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    try {
      // Création de la nouvelle alerte pour Firestore
      const newAlerte: Omit<Alerte, 'id'> = {
        titre: formData.get('titre') as string,
        description: formData.get('description') as string,
        type: formData.get('type') as 'Critique' | 'Importante' | 'Information',
        statut: formData.get('statut') as 'Résolue' | 'En cours' | 'Nouvelle',
        dateCreation: serverTimestamp() as Timestamp,
        source: formData.get('source') as string,
        assigneA: formData.get('assigneA') as string || undefined
      };
      
      // Ajout de la date de résolution si l'alerte est résolue
      if (newAlerte.statut === 'Résolue') {
        newAlerte.dateResolution = serverTimestamp() as Timestamp;
      }
      
      // Ajout à Firestore
      await alerteService.create(newAlerte);
      console.log('Alerte ajoutée avec succès');
      setShowAddModal(false);
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'alerte:', error);
    }
  }, []);

  // Formulaire d'édition d'alerte
  const handleSubmitEditAlerte = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!currentAlerte) return;
    
    const formData = new FormData(e.currentTarget);
    const newStatut = formData.get('statut') as 'Résolue' | 'En cours' | 'Nouvelle';
    
    try {
      // Préparation des données pour la mise à jour Firestore
      const updateData: Partial<Alerte> = {
        titre: formData.get('titre') as string,
        description: formData.get('description') as string,
        type: formData.get('type') as 'Critique' | 'Importante' | 'Information',
        statut: newStatut,
        source: formData.get('source') as string,
        assigneA: formData.get('assigneA') as string || undefined
      };
      
      // Gestion de la date de résolution
      if (newStatut === 'Résolue' && currentAlerte.statut !== 'Résolue') {
        updateData.dateResolution = serverTimestamp() as Timestamp;
      } else if (newStatut !== 'Résolue' && currentAlerte.dateResolution) {
        // Supprimer la date de résolution si l'alerte n'est plus résolue
        updateData.dateResolution = undefined;
      }
      
      // Mise à jour dans Firestore
      await alerteService.update(currentAlerte.id, updateData);
      console.log('Alerte mise à jour avec succès');
      setShowEditModal(false);
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'alerte:', error);
    }
  }, [currentAlerte]);

  // Confirmation de suppression d'alerte
  const handleConfirmDelete = useCallback(async () => {
    if (!currentAlerte) return;
    
    try {
      // Suppression dans Firestore
      await alerteService.delete(currentAlerte.id);
      console.log('Alerte supprimée avec succès');
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'alerte:', error);
    }
  }, [currentAlerte]);

  // Statistiques pour le tableau de bord
  const alertesStats = useMemo(() => [
    {
      type: 'Toutes les alertes',
      nombre: alertes.length,
      nouveauxCeMois: alertes.filter(a => new Date(a.dateCreation).getMonth() === new Date().getMonth()).length,
      resolues: alertes.filter(a => a.statut === 'Résolue').length,
      enCours: alertes.filter(a => a.statut !== 'Résolue').length,
      tendance: 'stable' as const,
      icon: <AlertTriangle className="h-6 w-6 text-[var(--zalama-danger)]" />
    },
    {
      type: 'Alertes critiques',
      nombre: alertes.filter(a => a.type === 'Critique').length,
      nouveauxCeMois: alertes.filter(a => a.type === 'Critique' && new Date(a.dateCreation).getMonth() === new Date().getMonth()).length,
      resolues: alertes.filter(a => a.type === 'Critique' && a.statut === 'Résolue').length,
      enCours: alertes.filter(a => a.type === 'Critique' && a.statut !== 'Résolue').length,
      tendance: 'baisse' as const,
      icon: <AlertCircle className="h-6 w-6 text-[var(--zalama-warning)]" />
    },
    {
      type: 'Informations',
      nombre: alertes.filter(a => a.type === 'Information').length,
      nouveauxCeMois: alertes.filter(a => a.type === 'Information' && new Date(a.dateCreation).getMonth() === new Date().getMonth()).length,
      resolues: alertes.filter(a => a.type === 'Information' && a.statut === 'Résolue').length,
      enCours: alertes.filter(a => a.type === 'Information' && a.statut !== 'Résolue').length,
      tendance: 'hausse' as const,
      icon: <BellRing className="h-6 w-6 text-[var(--zalama-info)]" />
    }
  ], [alertes]);

  return (
    <div className="p-2">
      
      {/* Statistiques */}
      <StatistiquesAlertes 
        statistiques={alertesStats}
        isLoading={isLoading}
      />
      
      {/* Résumé */}
      <ResumeAlertes
        totalAlertes={alertes.length}
        alertesResolues={alertes.filter(a => a.statut === 'Résolue').length}
        alertesEnCours={alertes.filter(a => a.statut !== 'Résolue').length}
      />
      
      {/* Liste des alertes */}
      <ListeAlertes
        alertes={alertes}
        filteredAlertes={filteredAlertes}
        searchTerm={searchTerm}
        typeFilter={typeFilter}
        types={types}
        statutFilter={statutFilter}
        statuts={statuts}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        isLoading={isLoading}
        onSearch={handleSearch}
        onTypeFilterChange={handleTypeFilterChange}
        onStatutFilterChange={handleStatutFilterChange}
        onPageChange={handlePageChange}
        onAddClick={handleAddAlerte}
        onEditClick={handleEditAlerte}
        onDeleteClick={handleDeleteAlerte}
        onResolveClick={handleResolveAlerte}
      />
      
      {/* Modales */}
      <ModaleAjoutAlerte
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleSubmitAddAlerte}
      />
      
      <ModaleEditionAlerte
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSubmit={handleSubmitEditAlerte}
        alerte={currentAlerte}
      />
      
      <ModaleSuppressionAlerte
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        alerte={currentAlerte}
      />
    </div>
  );
}

"use client";

import React, { useState, useEffect } from 'react';
import { AlertTriangle, AlertCircle, BellRing } from 'lucide-react';
import {
  StatistiquesAlertes,
  ResumeAlertes,
  ListeAlertes,
  ModaleAjoutAlerte,
  ModaleEditionAlerte,
  ModaleSuppressionAlerte
} from '@/components/dashboard/alertes';

// Types
interface Alerte {
  id: string;
  titre: string;
  description: string;
  type: 'Critique' | 'Importante' | 'Information';
  statut: 'Résolue' | 'En cours' | 'Nouvelle';
  dateCreation: string;
  dateResolution?: string;
  source: string;
  assigneA?: string;
}

export default function AlertesPage() {
  // États
  const [alertes, setAlertes] = useState<Alerte[]>([]);
  const [filteredAlertes, setFilteredAlertes] = useState<Alerte[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('tous');
  const [statutFilter, setStatutFilter] = useState('tous');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentAlerte, setCurrentAlerte] = useState<Alerte | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Types et statuts disponibles
  const types = ['tous', 'Critique', 'Importante', 'Information'];
  const statuts = ['tous', 'Nouvelle', 'En cours', 'Résolue'];

  // Données fictives pour la démo
  useEffect(() => {
    // Simuler un chargement depuis une API
    setTimeout(() => {
      const mockData: Alerte[] = [
        {
          id: '1',
          titre: 'Panne du serveur principal',
          description: 'Le serveur principal est inaccessible depuis 10 minutes. Vérifier les connexions réseau et le système de refroidissement.',
          type: 'Critique',
          statut: 'En cours',
          dateCreation: '2025-04-28T08:15:00',
          source: 'Système de monitoring',
          assigneA: 'Équipe technique'
        },
        {
          id: '2',
          titre: 'Mise à jour de sécurité requise',
          description: 'Une mise à jour de sécurité critique est disponible pour le système d\'exploitation. Il est recommandé de l\'installer dès que possible.',
          type: 'Importante',
          statut: 'Nouvelle',
          dateCreation: '2025-04-29T14:30:00',
          source: 'Centre de sécurité'
        },
        {
          id: '3',
          titre: 'Espace disque faible',
          description: 'Le serveur de stockage n\'a plus que 15% d\'espace disque disponible. Veuillez libérer de l\'espace ou ajouter de nouveaux disques.',
          type: 'Importante',
          statut: 'Résolue',
          dateCreation: '2025-04-27T10:45:00',
          dateResolution: '2025-04-27T16:20:00',
          source: 'Système de monitoring',
          assigneA: 'Équipe infrastructure'
        },
        {
          id: '4',
          titre: 'Tentatives de connexion suspectes',
          description: 'Plusieurs tentatives de connexion échouées ont été détectées depuis une adresse IP inconnue. Vérifier les journaux de sécurité.',
          type: 'Critique',
          statut: 'Résolue',
          dateCreation: '2025-04-26T23:10:00',
          dateResolution: '2025-04-27T02:30:00',
          source: 'Pare-feu',
          assigneA: 'Équipe sécurité'
        },
        {
          id: '5',
          titre: 'Maintenance planifiée',
          description: 'Une maintenance planifiée aura lieu le 5 mai 2025 de 22h à 2h. Les services seront indisponibles pendant cette période.',
          type: 'Information',
          statut: 'Nouvelle',
          dateCreation: '2025-04-30T09:00:00',
          source: 'Équipe infrastructure'
        },
        {
          id: '6',
          titre: 'Problème de performance base de données',
          description: 'Des ralentissements ont été observés sur la base de données principale. Les requêtes prennent plus de temps que d\'habitude.',
          type: 'Importante',
          statut: 'En cours',
          dateCreation: '2025-04-29T16:45:00',
          source: 'Application de monitoring',
          assigneA: 'Équipe base de données'
        },
        {
          id: '7',
          titre: 'Nouvelle version déployée',
          description: 'La version 2.5.0 de l\'application a été déployée avec succès. Surveillez les performances et signalez tout problème.',
          type: 'Information',
          statut: 'Résolue',
          dateCreation: '2025-04-28T15:20:00',
          dateResolution: '2025-04-28T15:20:00',
          source: 'Système de déploiement'
        },
        {
          id: '8',
          titre: 'Certificat SSL expirant',
          description: 'Le certificat SSL du domaine principal expirera dans 14 jours. Veuillez le renouveler dès que possible.',
          type: 'Importante',
          statut: 'Nouvelle',
          dateCreation: '2025-04-30T11:30:00',
          source: 'Système de monitoring'
        },
        {
          id: '9',
          titre: 'Erreurs 404 fréquentes',
          description: 'Un nombre anormalement élevé d\'erreurs 404 a été détecté sur le site web. Vérifier les liens et redirections.',
          type: 'Information',
          statut: 'En cours',
          dateCreation: '2025-04-29T10:15:00',
          source: 'Logs du serveur web',
          assigneA: 'Équipe développement'
        },
        {
          id: '10',
          titre: 'Problème de sauvegarde',
          description: 'La sauvegarde automatique de la nuit dernière a échoué. Vérifier le système de sauvegarde et lancer une sauvegarde manuelle.',
          type: 'Critique',
          statut: 'Résolue',
          dateCreation: '2025-04-28T06:00:00',
          dateResolution: '2025-04-28T09:45:00',
          source: 'Système de sauvegarde',
          assigneA: 'Équipe infrastructure'
        },
        {
          id: '11',
          titre: 'Pic de trafic anormal',
          description: 'Un pic de trafic anormal a été détecté sur le site web. Surveiller les performances et vérifier s\'il s\'agit d\'une attaque DDoS.',
          type: 'Importante',
          statut: 'En cours',
          dateCreation: '2025-04-30T13:45:00',
          source: 'Système de monitoring',
          assigneA: 'Équipe sécurité'
        },
        {
          id: '12',
          titre: 'Mise à jour des bibliothèques',
          description: 'Plusieurs bibliothèques utilisées par l\'application ont des mises à jour disponibles. Planifier une mise à jour.',
          type: 'Information',
          statut: 'Nouvelle',
          dateCreation: '2025-04-29T08:30:00',
          source: 'Système de dépendances'
        }
      ];
      
      setAlertes(mockData);
      setFilteredAlertes(mockData);
      setIsLoading(false);
    }, 1000);
  }, []);

  // Filtrage des alertes en fonction du terme de recherche, du type et du statut
  useEffect(() => {
    let filtered = [...alertes];
    
    // Filtrage par terme de recherche
    if (searchTerm.trim() !== '') {
      filtered = filtered.filter(alerte => 
        alerte.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alerte.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alerte.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (alerte.assigneA && alerte.assigneA.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Filtrage par type d'alerte
    if (typeFilter !== 'tous') {
      filtered = filtered.filter(alerte => alerte.type === typeFilter);
    }
    
    // Filtrage par statut
    if (statutFilter !== 'tous') {
      filtered = filtered.filter(alerte => alerte.statut === statutFilter);
    }
    
    setFilteredAlertes(filtered);
    setCurrentPage(1); // Réinitialiser à la première page après filtrage
  }, [searchTerm, typeFilter, statutFilter, alertes]);

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

  const handleEditAlerte = (alerte: Alerte) => {
    setCurrentAlerte(alerte);
    setShowEditModal(true);
  };

  const handleDeleteAlerte = (alerte: Alerte) => {
    setCurrentAlerte(alerte);
    setShowDeleteModal(true);
  };

  const handleResolveAlerte = (alerte: Alerte) => {
    // Mise à jour de l'alerte pour la marquer comme résolue
    const updatedAlertes = alertes.map(item => {
      if (item.id === alerte.id) {
        return {
          ...item,
          statut: 'Résolue' as const,
          dateResolution: new Date().toISOString()
        };
      }
      return item;
    });
    
    setAlertes(updatedAlertes);
  };

  // Formulaire d'ajout d'alerte
  const handleSubmitAddAlerte = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    // Création de la nouvelle alerte
    const newAlerte: Alerte = {
      id: (alertes.length + 1).toString(),
      titre: formData.get('titre') as string,
      description: formData.get('description') as string,
      type: formData.get('type') as 'Critique' | 'Importante' | 'Information',
      statut: formData.get('statut') as 'Résolue' | 'En cours' | 'Nouvelle',
      dateCreation: new Date().toISOString(),
      source: formData.get('source') as string,
      assigneA: formData.get('assigneA') as string || undefined
    };
    
    // Ajout de la date de résolution si l'alerte est résolue
    if (newAlerte.statut === 'Résolue') {
      newAlerte.dateResolution = new Date().toISOString();
    }
    
    // Ajout à la liste des alertes
    setAlertes([...alertes, newAlerte]);
    setShowAddModal(false);
  };

  // Formulaire d'édition d'alerte
  const handleSubmitEditAlerte = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!currentAlerte) return;
    
    const formData = new FormData(e.currentTarget);
    const newStatut = formData.get('statut') as 'Résolue' | 'En cours' | 'Nouvelle';
    
    // Mise à jour de l'alerte
    const updatedAlerte: Alerte = {
      ...currentAlerte,
      titre: formData.get('titre') as string,
      description: formData.get('description') as string,
      type: formData.get('type') as 'Critique' | 'Importante' | 'Information',
      statut: newStatut,
      source: formData.get('source') as string,
      assigneA: formData.get('assigneA') as string || undefined
    };
    
    // Gestion de la date de résolution
    if (newStatut === 'Résolue' && currentAlerte.statut !== 'Résolue') {
      updatedAlerte.dateResolution = new Date().toISOString();
    } else if (newStatut !== 'Résolue') {
      delete updatedAlerte.dateResolution;
    }
    
    // Mise à jour de la liste des alertes
    setAlertes(alertes.map(alerte => alerte.id === updatedAlerte.id ? updatedAlerte : alerte));
    setShowEditModal(false);
  };

  // Confirmation de suppression d'alerte
  const handleConfirmDelete = () => {
    if (!currentAlerte) return;
    
    // Suppression de l'alerte
    setAlertes(alertes.filter(alerte => alerte.id !== currentAlerte.id));
    setShowDeleteModal(false);
  };

  // Statistiques pour le tableau de bord
  const alertesStats = [
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
  ];

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

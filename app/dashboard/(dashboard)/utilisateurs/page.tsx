"use client";

import React, { useState, useEffect } from 'react';
import { Users, Briefcase, GraduationCap } from 'lucide-react';
import {
  StatistiquesUtilisateurs,
  ResumeUtilisateurs,
  ListeUtilisateurs,
  ModaleAjoutUtilisateur,
  ModaleEditionUtilisateur,
  ModaleSuppressionUtilisateur
} from '@/components/dashboard/utilisateurs';

// Types
interface Utilisateur {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  adresse: string;
  type: 'Étudiant' | 'Salarié' | 'Entreprise';
  statut: 'Actif' | 'Inactif' | 'En attente';
  dateInscription: string;
  photo: string;
  organisation?: string;
  poste?: string;
  niveauEtudes?: string;
  etablissement?: string;
  secteur?: string;
}

export default function UtilisateursPage() {
  // États
  const [utilisateurs, setUtilisateurs] = useState<Utilisateur[]>([]);
  const [filteredUtilisateurs, setFilteredUtilisateurs] = useState<Utilisateur[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('tous');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentUtilisateur, setCurrentUtilisateur] = useState<Utilisateur | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showStats, setShowStats] = useState(true);

  // Types d'utilisateurs disponibles
  const types = ['tous', 'Étudiant', 'Salarié', 'Entreprise'];

  // Données fictives pour la démo
  useEffect(() => {
    // Simuler un chargement depuis une API
    setTimeout(() => {
      const mockData: Utilisateur[] = [
        {
          id: '1',
          nom: 'Diallo',
          prenom: 'Mamadou',
          email: 'mamadou.diallo@example.com',
          telephone: '+224 628 12 34 56',
          adresse: 'Conakry, Guinée',
          type: 'Étudiant',
          statut: 'Actif',
          dateInscription: '2025-01-15',
          photo: '/images/avatars/avatar-1.jpg',
          niveauEtudes: 'Master 2',
          etablissement: 'Université de Conakry'
        },
        {
          id: '2',
          nom: 'Camara',
          prenom: 'Fatoumata',
          email: 'fatoumata.camara@example.com',
          telephone: '+224 622 98 76 54',
          adresse: 'Kindia, Guinée',
          type: 'Salarié',
          statut: 'Actif',
          dateInscription: '2025-02-03',
          photo: '/images/avatars/avatar-2.jpg',
          organisation: 'Ministère de l\'Éducation',
          poste: 'Responsable de projet'
        },
        {
          id: '3',
          nom: 'Soumah',
          prenom: 'Ibrahim',
          email: 'ibrahim.soumah@example.com',
          telephone: '+224 666 45 67 89',
          adresse: 'Labé, Guinée',
          type: 'Entreprise',
          statut: 'Inactif',
          dateInscription: '2025-01-20',
          photo: '/images/avatars/avatar-3.jpg',
          organisation: 'Tech Guinée'
        },
        {
          id: '4',
          nom: 'Barry',
          prenom: 'Aissatou',
          email: 'aissatou.barry@example.com',
          telephone: '+224 655 23 45 67',
          adresse: 'Mamou, Guinée',
          type: 'Étudiant',
          statut: 'Actif',
          dateInscription: '2025-03-10',
          photo: '/images/avatars/avatar-4.jpg',
          niveauEtudes: 'Licence 3',
          etablissement: 'Institut Supérieur de Technologie'
        },
        {
          id: '5',
          nom: 'Sylla',
          prenom: 'Ousmane',
          email: 'ousmane.sylla@example.com',
          telephone: '+224 631 78 90 12',
          adresse: 'Kankan, Guinée',
          type: 'Salarié',
          statut: 'Actif',
          dateInscription: '2025-02-25',
          photo: '/images/avatars/avatar-5.jpg',
          organisation: 'Orange Guinée',
          poste: 'Ingénieur réseau'
        },
        {
          id: '6',
          nom: 'Bah',
          prenom: 'Mariama',
          email: 'mariama.bah@example.com',
          telephone: '+224 620 34 56 78',
          adresse: 'Nzérékoré, Guinée',
          type: 'Entreprise',
          statut: 'Actif',
          dateInscription: '2025-01-30',
          photo: '/images/avatars/avatar-6.jpg',
          organisation: 'Bah & Associés'
        },
        {
          id: '7',
          nom: 'Touré',
          prenom: 'Abdoulaye',
          email: 'abdoulaye.toure@example.com',
          telephone: '+224 664 56 78 90',
          adresse: 'Boké, Guinée',
          type: 'Étudiant',
          statut: 'En attente',
          dateInscription: '2025-03-05',
          photo: '/images/avatars/avatar-7.jpg',
          niveauEtudes: 'Master 1',
          etablissement: 'École Nationale d\'Administration'
        },
        {
          id: '8',
          nom: 'Kaba',
          prenom: 'Kadiatou',
          email: 'kadiatou.kaba@example.com',
          telephone: '+224 628 90 12 34',
          adresse: 'Faranah, Guinée',
          type: 'Salarié',
          statut: 'Actif',
          dateInscription: '2025-02-15',
          photo: '/images/avatars/avatar-8.jpg',
          organisation: 'Banque Centrale de Guinée',
          poste: 'Analyste financier'
        },
        {
          id: '9',
          nom: 'Condé',
          prenom: 'Mohamed',
          email: 'mohamed.conde@example.com',
          telephone: '+224 657 12 34 56',
          adresse: 'Siguiri, Guinée',
          type: 'Entreprise',
          statut: 'Actif',
          dateInscription: '2025-01-25',
          photo: '/images/avatars/avatar-9.jpg',
          organisation: 'Condé Mining'
        },
        {
          id: '10',
          nom: 'Keita',
          prenom: 'Fanta',
          email: 'fanta.keita@example.com',
          telephone: '+224 622 34 56 78',
          adresse: 'Coyah, Guinée',
          type: 'Étudiant',
          statut: 'Inactif',
          dateInscription: '2025-03-01',
          photo: '/images/avatars/avatar-10.jpg',
          niveauEtudes: 'Licence 2',
          etablissement: 'Université Kofi Annan'
        },
        {
          id: '11',
          nom: 'Bangoura',
          prenom: 'Sékou',
          email: 'sekou.bangoura@example.com',
          telephone: '+224 666 78 90 12',
          adresse: 'Dubréka, Guinée',
          type: 'Salarié',
          statut: 'En attente',
          dateInscription: '2025-02-10',
          photo: '/images/avatars/avatar-11.jpg',
          organisation: 'Ministère des Mines',
          poste: 'Géologue'
        },
        {
          id: '12',
          nom: 'Sow',
          prenom: 'Hawa',
          email: 'hawa.sow@example.com',
          telephone: '+224 631 23 45 67',
          adresse: 'Pita, Guinée',
          type: 'Entreprise',
          statut: 'Actif',
          dateInscription: '2025-01-18',
          photo: '/images/avatars/avatar-12.jpg',
          organisation: 'Sow Textiles'
        }
      ];
      
      setUtilisateurs(mockData);
      setFilteredUtilisateurs(mockData);
      setIsLoading(false);
    }, 1000);
  }, []);

  // Filtrage des utilisateurs en fonction du terme de recherche et du type
  useEffect(() => {
    let filtered = [...utilisateurs];
    
    // Filtrage par terme de recherche
    if (searchTerm.trim() !== '') {
      filtered = filtered.filter(user => 
        user.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.organisation && user.organisation.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Filtrage par type d'utilisateur
    if (typeFilter !== 'tous') {
      filtered = filtered.filter(user => user.type === typeFilter);
    }
    
    setFilteredUtilisateurs(filtered);
    setCurrentPage(1); // Réinitialiser à la première page après filtrage
  }, [searchTerm, typeFilter, utilisateurs]);

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

  const handleAddUser = () => {
    setShowAddModal(true);
  };

  const handleEditUser = (user: Utilisateur) => {
    setCurrentUtilisateur(user);
    setShowEditModal(true);
  };

  const handleDeleteUser = (user: Utilisateur) => {
    setCurrentUtilisateur(user);
    setShowDeleteModal(true);
  };

  // Toggle des statistiques
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const toggleStats = () => {
    setShowStats(!showStats);
  };

  // Formulaire d'ajout d'utilisateur
  const handleSubmitAddUser = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    // Création du nouvel utilisateur
    const newUser: Utilisateur = {
      id: (utilisateurs.length + 1).toString(),
      nom: formData.get('nom') as string,
      prenom: formData.get('prenom') as string,
      email: formData.get('email') as string,
      telephone: formData.get('telephone') as string,
      adresse: formData.get('adresse') as string,
      type: formData.get('type') as 'Étudiant' | 'Salarié' | 'Entreprise',
      statut: formData.get('statut') as 'Actif' | 'Inactif' | 'En attente',
      dateInscription: new Date().toISOString().split('T')[0],
      photo: '/images/avatar-placeholder.png',
    };
    
    // Ajout des champs spécifiques au type d'utilisateur
    if (newUser.type === 'Étudiant') {
      newUser.niveauEtudes = formData.get('niveauEtudes') as string;
      newUser.etablissement = formData.get('etablissement') as string;
    } else if (newUser.type === 'Salarié') {
      newUser.organisation = formData.get('organisation') as string;
      newUser.poste = formData.get('poste') as string;
    } else if (newUser.type === 'Entreprise') {
      newUser.organisation = formData.get('organisation') as string;
      newUser.secteur = formData.get('secteur') as string;
    }
    
    // Ajout à la liste des utilisateurs
    setUtilisateurs([...utilisateurs, newUser]);
    setShowAddModal(false);
  };

  // Formulaire d'édition d'utilisateur
  const handleSubmitEditUser = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!currentUtilisateur) return;
    
    const formData = new FormData(e.currentTarget);
    
    // Mise à jour de l'utilisateur
    const updatedUser: Utilisateur = {
      ...currentUtilisateur,
      nom: formData.get('nom') as string,
      prenom: formData.get('prenom') as string,
      email: formData.get('email') as string,
      telephone: formData.get('telephone') as string,
      adresse: formData.get('adresse') as string,
      type: formData.get('type') as 'Étudiant' | 'Salarié' | 'Entreprise',
      statut: formData.get('statut') as 'Actif' | 'Inactif' | 'En attente',
    };
    
    // Mise à jour des champs spécifiques au type d'utilisateur
    if (updatedUser.type === 'Étudiant') {
      updatedUser.niveauEtudes = formData.get('niveauEtudes') as string;
      updatedUser.etablissement = formData.get('etablissement') as string;
      // Supprimer les champs non pertinents
      delete updatedUser.organisation;
      delete updatedUser.poste;
      delete updatedUser.secteur;
    } else if (updatedUser.type === 'Salarié') {
      updatedUser.organisation = formData.get('organisation') as string;
      updatedUser.poste = formData.get('poste') as string;
      // Supprimer les champs non pertinents
      delete updatedUser.niveauEtudes;
      delete updatedUser.etablissement;
      delete updatedUser.secteur;
    } else if (updatedUser.type === 'Entreprise') {
      updatedUser.organisation = formData.get('organisation') as string;
      updatedUser.secteur = formData.get('secteur') as string;
      // Supprimer les champs non pertinents
      delete updatedUser.niveauEtudes;
      delete updatedUser.etablissement;
      delete updatedUser.poste;
    }
    
    // Mise à jour de la liste des utilisateurs
    setUtilisateurs(utilisateurs.map(user => user.id === updatedUser.id ? updatedUser : user));
    setShowEditModal(false);
  };

  // Confirmation de suppression d'utilisateur
  const handleConfirmDelete = () => {
    if (!currentUtilisateur) return;
    
    // Suppression de l'utilisateur
    setUtilisateurs(utilisateurs.filter(user => user.id !== currentUtilisateur.id));
    setShowDeleteModal(false);
  };

  return (
    <div className="p-4">
      
      {/* Statistiques */}
      {showStats && (
        <StatistiquesUtilisateurs 
          statistiques={[
            {
              type: 'Tous les utilisateurs',
              nombre: utilisateurs.length,
              nouveauxCeMois: 5,
              actifs: utilisateurs.filter(u => u.statut === 'Actif').length,
              inactifs: utilisateurs.filter(u => u.statut !== 'Actif').length,
              tendance: 'hausse',
              icon: <Users className="h-6 w-6 text-[var(--zalama-blue)]" />
            },
            {
              type: 'Salariés',
              nombre: utilisateurs.filter(u => u.type === 'Salarié').length,
              nouveauxCeMois: 2,
              actifs: utilisateurs.filter(u => u.type === 'Salarié' && u.statut === 'Actif').length,
              inactifs: utilisateurs.filter(u => u.type === 'Salarié' && u.statut !== 'Actif').length,
              tendance: 'stable',
              icon: <Briefcase className="h-6 w-6 text-[var(--zalama-warning)]" />
            },
            {
              type: 'Étudiants',
              nombre: utilisateurs.filter(u => u.type === 'Étudiant').length,
              nouveauxCeMois: 3,
              actifs: utilisateurs.filter(u => u.type === 'Étudiant' && u.statut === 'Actif').length,
              inactifs: utilisateurs.filter(u => u.type === 'Étudiant' && u.statut !== 'Actif').length,
              tendance: 'hausse',
              icon: <GraduationCap className="h-6 w-6 text-[var(--zalama-success)]" />
            }
          ]}
          isLoading={isLoading}
        />
      )}
      
      {/* Résumé */}
      <ResumeUtilisateurs
        totalUtilisateurs={utilisateurs.length}
        utilisateursActifs={utilisateurs.filter(u => u.statut === 'Actif').length}
        nouveauxUtilisateurs={5}
      />
      
      {/* Liste des utilisateurs */}
      <ListeUtilisateurs
        utilisateurs={utilisateurs}
        filteredUtilisateurs={filteredUtilisateurs}
        searchTerm={searchTerm}
        typeFilter={typeFilter}
        types={types}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        isLoading={isLoading}
        onSearch={handleSearch}
        onTypeFilterChange={handleTypeFilterChange}
        onPageChange={handlePageChange}
        onAddClick={handleAddUser}
        onEditClick={handleEditUser}
        onDeleteClick={handleDeleteUser}
      />
      
      {/* Modales */}
      <ModaleAjoutUtilisateur
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleSubmitAddUser}
      />
      
      <ModaleEditionUtilisateur
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSubmit={handleSubmitEditUser}
        utilisateur={currentUtilisateur}
      />
      
      <ModaleSuppressionUtilisateur
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        utilisateur={currentUtilisateur}
      />
    </div>
  );
}
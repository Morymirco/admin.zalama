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
import { collection, getDocs, query, orderBy, Timestamp, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Utilisateur } from '@/types/utilisateur';




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

  


 // Remplacer le useEffect de chargement des données
useEffect(() => {
  const fetchUtilisateurs = async () => {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, orderBy('displayName'));
      const querySnapshot = await getDocs(q);
      
      const usersData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Utilisateur[];
      
      setUtilisateurs(usersData);
      setFilteredUtilisateurs(usersData);
    } catch (error) {
      console.error("Erreur lors du chargement des utilisateurs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  fetchUtilisateurs();
}, []);
  // Filtrage des utilisateurs en fonction du terme de recherche et du type
// Dans app/dashboard/(dashboard)/utilisateurs/page.tsx

// Mettez à jour la partie filtrage des utilisateurs
useEffect(() => {
  let filtered = [...utilisateurs];
  
  // Filtrage par terme de recherche
  if (searchTerm.trim() !== '') {
    filtered = filtered.filter(user => 
      (user.displayName?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.email?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.phoneNumber?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.poste?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.departement?.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }
  
  // Filtrage par type
  if (typeFilter !== 'tous') {
    filtered = filtered.filter(user => {
      // Normalisation des types pour la comparaison
      const userType = user.type?.toLowerCase();
      const filterType = typeFilter.toLowerCase();
      return userType === filterType;
    });
  }
  
  setFilteredUtilisateurs(filtered);
  setCurrentPage(1); // Réinitialiser à la première page après filtrage
}, [searchTerm, typeFilter, utilisateurs]);

// Types d'utilisateurs disponibles
const types = ['tous', 'etudiant', 'salaries', 'pension'];

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
  // Ajout d'un nouvel utilisateur
const handleSubmitAddUser = async (formData: FormData) => {
  try {
    const newUser: Partial<Utilisateur> = {
      displayName: formData.get('displayName') as string,
      email: formData.get('email') as string,
      phoneNumber: formData.get('phoneNumber') as string,
      role: formData.get('role') as Utilisateur['role'],
      poste: formData.get('poste') as string,
      departement: formData.get('departement') as string,
      active: formData.get('active') === 'true',
      type: formData.get('type') as string,
      partenaireId: formData.get('partenaireId') as string,
      photoURL: formData.get('photoURL') as string || '',
      etablissement: formData.get('etablissement') as string || '',
      niveauEtudes: formData.get('niveauEtudes') as string || '',
      createdAt: Timestamp.now()
    };

    // Ajouter le document à Firestore
    const docRef = await addDoc(collection(db, 'users'), newUser);
    
    // Mettre à jour l'état local
    setUtilisateurs(prev => [...prev, { id: docRef.id, ...newUser } as Utilisateur]);
    setShowAddModal(false);
  } catch (error) {
    console.error("Erreur lors de l'ajout de l'utilisateur:", error);
  }
};

  // Formulaire d'édition d'utilisateur
  const handleSubmitEditUser = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!currentUtilisateur) return;
    
    const formData = new FormData(e.currentTarget);
    
    // Mise à jour de l'utilisateur
    const updatedUser: Utilisateur = {
      ...currentUtilisateur,
      displayName: formData.get('displayName') as string,
      email: formData.get('email') as string,
      phoneNumber: formData.get('phoneNumber') as string,
      role: formData.get('role') as Utilisateur['role'],
      poste: formData.get('poste') as string,
      departement: formData.get('departement') as string,
      active: formData.get('active') === 'true',
      type: formData.get('type') as string,
      createdAt: Timestamp.now(),
    };
    
    // Mise à jour des champs spécifiques au type d'utilisateur
    if (updatedUser.type === 'Étudiant') {
      updatedUser.niveauEtudes = formData.get('niveauEtudes') as string;
      updatedUser.etablissement = formData.get('etablissement') as string;
   
    } else if (updatedUser.type === 'Salarié') {
      updatedUser.partenaireId = formData.get('partenaireId') as string;
      updatedUser.poste = formData.get('poste') as string;
   
    } else if (updatedUser.type === 'Entreprise') {
      updatedUser.partenaireId = formData.get('partenaireId') as string;
      updatedUser.departement = formData.get('departement') as string;
     
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
              actifs: utilisateurs.filter(u => u.active === true).length,
              inactifs: utilisateurs.filter(u => u.active === false).length,
              tendance: 'hausse',
              icon: <Users className="h-6 w-6 text-[var(--zalama-blue)]" />
            },
            {
              type: 'Salariés',
              nombre: utilisateurs.filter(u => u.type === 'salaries').length,
              nouveauxCeMois: 2,
              actifs: utilisateurs.filter(u => u.type === 'salaries' && u.active === true).length,
              inactifs: utilisateurs.filter(u => u.type === 'salaries' && u.active === false).length,
              tendance: 'stable',
              icon: <Briefcase className="h-6 w-6 text-[var(--zalama-warning)]" />
            },
            {
              type: 'Étudiants',
              nombre: utilisateurs.filter(u => u.type === 'etudiant').length,
              nouveauxCeMois: 3,
              actifs: utilisateurs.filter(u => u.type === 'etudiant' && u.active === true).length,
              inactifs: utilisateurs.filter(u => u.type === 'etudiant' && u.active === false).length,
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
        utilisateursActifs={utilisateurs.filter(u => u.active === true).length}
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
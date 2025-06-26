import { useState, useEffect, useCallback } from 'react';
import { Utilisateur } from '@/types/utilisateur';
import userService from '@/services/userService';

interface UseSupabaseUsersReturn {
  users: Utilisateur[];
  filteredUsers: Utilisateur[];
  isLoading: boolean;
  error: string | null;
  stats: {
    total: number;
    actifs: number;
    inactifs: number;
    parType: Record<string, number>;
  } | null;
  statsLoading: boolean;
  searchTerm: string;
  typeFilter: string;
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  // Actions
  setSearchTerm: (term: string) => void;
  setTypeFilter: (type: string) => void;
  setCurrentPage: (page: number) => void;
  refreshUsers: () => Promise<void>;
  createUser: (userData: Partial<Utilisateur>) => Promise<Utilisateur>;
  updateUser: (id: string, userData: Partial<Utilisateur>) => Promise<Utilisateur>;
  deleteUser: (id: string) => Promise<void>;
  searchUsers: (query: string) => Promise<Utilisateur[]>;
}

export const useSupabaseUsers = (itemsPerPage: number = 10): UseSupabaseUsersReturn => {
  const [users, setUsers] = useState<Utilisateur[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<Utilisateur[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<{
    total: number;
    actifs: number;
    inactifs: number;
    parType: Record<string, number>;
  } | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('tous');
  const [currentPage, setCurrentPage] = useState(1);

  // Calculer le nombre total de pages
  const totalPages = Math.ceil((filteredUsers?.length || 0) / itemsPerPage);

  // Charger tous les utilisateurs
  const loadUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const usersData = await userService.getAll();
      setUsers(usersData || []);
      setFilteredUsers(usersData || []);
    } catch (err) {
      console.error('Erreur lors du chargement des utilisateurs:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des utilisateurs');
      // En cas d'erreur, initialiser avec des tableaux vides
      setUsers([]);
      setFilteredUsers([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Charger les statistiques
  const loadStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      const statsData = await userService.getStats();
      setStats(statsData);
    } catch (err) {
      console.error('Erreur lors du chargement des statistiques:', err);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // Charger les données au montage
  useEffect(() => {
    loadUsers();
    loadStats();
  }, [loadUsers, loadStats]);

  // Filtrer les utilisateurs
  useEffect(() => {
    let filtered = [...users];
    
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
        const userType = user.type?.toLowerCase();
        const filterType = typeFilter.toLowerCase();
        return userType === filterType;
      });
    }
    
    setFilteredUsers(filtered);
    setCurrentPage(1); // Réinitialiser à la première page après filtrage
  }, [searchTerm, typeFilter, users]);

  // Créer un utilisateur
  const createUser = useCallback(async (userData: Partial<Utilisateur>): Promise<Utilisateur> => {
    try {
      const newUser = await userService.create(userData);
      setUsers(prev => [...prev, newUser]);
      await loadStats(); // Recharger les statistiques
      return newUser;
    } catch (err) {
      console.error('Erreur lors de la création de l\'utilisateur:', err);
      throw err;
    }
  }, [loadStats]);

  // Mettre à jour un utilisateur
  const updateUser = useCallback(async (id: string, userData: Partial<Utilisateur>): Promise<Utilisateur> => {
    try {
      const updatedUser = await userService.update(id, userData);
      setUsers(prev => prev.map(user => user.id === id ? updatedUser : user));
      await loadStats(); // Recharger les statistiques
      return updatedUser;
    } catch (err) {
      console.error('Erreur lors de la mise à jour de l\'utilisateur:', err);
      throw err;
    }
  }, [loadStats]);

  // Supprimer un utilisateur
  const deleteUser = useCallback(async (id: string): Promise<void> => {
    try {
      await userService.delete(id);
      setUsers(prev => prev.filter(user => user.id !== id));
      await loadStats(); // Recharger les statistiques
    } catch (err) {
      console.error('Erreur lors de la suppression de l\'utilisateur:', err);
      throw err;
    }
  }, [loadStats]);

  // Rechercher des utilisateurs
  const searchUsers = useCallback(async (query: string): Promise<Utilisateur[]> => {
    try {
      return await userService.search(query);
    } catch (err) {
      console.error('Erreur lors de la recherche d\'utilisateurs:', err);
      throw err;
    }
  }, []);

  // Rafraîchir les données
  const refreshUsers = useCallback(async () => {
    await loadUsers();
    await loadStats();
  }, [loadUsers, loadStats]);

  return {
    users,
    filteredUsers,
    isLoading,
    error,
    stats,
    statsLoading,
    searchTerm,
    typeFilter,
    currentPage,
    totalPages,
    itemsPerPage,
    setSearchTerm,
    setTypeFilter,
    setCurrentPage,
    refreshUsers,
    createUser,
    updateUser,
    deleteUser,
    searchUsers,
  };
}; 
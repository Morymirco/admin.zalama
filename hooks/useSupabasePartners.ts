import { useState, useEffect, useCallback } from 'react';
import { partenaireService, employeService } from '@/services/partenaireService';
import { Partenaire, Employe, PartenaireAvecEmployes, StatistiquesPartenaire } from '@/types/partenaire';

interface UseSupabasePartnersReturn {
  partenaires: Partenaire[];
  loading: boolean;
  error: string | null;
  createPartenaire: (data: Omit<Partenaire, 'id' | 'created_at' | 'updated_at'>) => Promise<{
    partenaire: Partenaire;
    smsResults: {
      representant: { success: boolean; message?: string; error?: string };
      rh: { success: boolean; message?: string; error?: string };
      admin: { success: boolean; message?: string; error?: string };
    };
    emailResults: {
      rh: { success: boolean; message?: string; error?: string };
      responsable: { success: boolean; message?: string; error?: string };
    };
    accountResults: {
      rh: { success: boolean; password?: string; error?: string };
      responsable: { success: boolean; password?: string; error?: string };
    };
  }>;
  updatePartenaire: (id: string, data: Partial<Omit<Partenaire, 'id' | 'created_at' | 'updated_at'>>) => Promise<void>;
  deletePartenaire: (id: string) => Promise<void>;
  searchPartenaires: (searchTerm: string) => Promise<void>;
  getPartenairesByType: (type: string) => Promise<void>;
  refreshPartenaires: () => Promise<void>;
  statistics: any;
  statisticsLoading: boolean;
}

export const useSupabasePartners = (): UseSupabasePartnersReturn => {
  const [partenaires, setPartenaires] = useState<Partenaire[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statistics, setStatistics] = useState<any>(null);
  const [statisticsLoading, setStatisticsLoading] = useState(true);

  // Charger tous les partenaires
  const loadPartenaires = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await partenaireService.getAll();
      setPartenaires(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des partenaires');
      console.error('Erreur loadPartenaires:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Charger les statistiques
  const loadStatistics = useCallback(async () => {
    try {
      setStatisticsLoading(true);
      const data = await partenaireService.getStatistics();
      setStatistics(data);
    } catch (err) {
      console.error('Erreur loadStatistics:', err);
      // Ne pas afficher d'erreur pour les statistiques, utiliser des valeurs par défaut
      setStatistics({
        total_partners: 0,
        active_partners: 0,
        inactive_partners: 0,
        new_partners_month: 0,
        total_employees: 0,
        avg_employees_per_partner: 0
      });
    } finally {
      setStatisticsLoading(false);
    }
  }, []);

  // Créer un partenaire
  const createPartenaire = useCallback(async (data: Omit<Partenaire, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setError(null);
      const result = await partenaireService.create(data);
      setPartenaires(prev => [result.partenaire, ...prev]);
      
      // Recharger les statistiques
      await loadStatistics();
      
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création du partenaire');
      throw err;
    }
  }, [loadStatistics]);

  // Mettre à jour un partenaire
  const updatePartenaire = useCallback(async (id: string, data: Partial<Omit<Partenaire, 'id' | 'created_at' | 'updated_at'>>) => {
    try {
      setError(null);
      const updatedPartenaire = await partenaireService.update(id, data);
      setPartenaires(prev => 
        prev.map(p => p.id === id ? updatedPartenaire : p)
      );
      
      // Recharger les statistiques
      await loadStatistics();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour du partenaire');
      throw err;
    }
  }, [loadStatistics]);

  // Supprimer un partenaire
  const deletePartenaire = useCallback(async (id: string) => {
    try {
      setError(null);
      await partenaireService.delete(id);
      setPartenaires(prev => prev.filter(p => p.id !== id));
      
      // Recharger les statistiques
      await loadStatistics();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression du partenaire');
      throw err;
    }
  }, [loadStatistics]);

  // Rechercher des partenaires
  const searchPartenaires = useCallback(async (searchTerm: string) => {
    try {
      setLoading(true);
      setError(null);
      if (searchTerm.trim() === '') {
        await loadPartenaires();
      } else {
        const data = await partenaireService.search(searchTerm);
        setPartenaires(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la recherche');
      console.error('Erreur searchPartenaires:', err);
    } finally {
      setLoading(false);
    }
  }, [loadPartenaires]);

  // Filtrer par type
  const getPartenairesByType = useCallback(async (type: string) => {
    try {
      setLoading(true);
      setError(null);
      if (type === 'tous') {
        await loadPartenaires();
      } else {
        const data = await partenaireService.getByType(type);
        setPartenaires(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du filtrage par type');
      console.error('Erreur getPartenairesByType:', err);
    } finally {
      setLoading(false);
    }
  }, [loadPartenaires]);

  // Rafraîchir les partenaires
  const refreshPartenaires = useCallback(async () => {
    await Promise.all([loadPartenaires(), loadStatistics()]);
  }, [loadPartenaires, loadStatistics]);

  // Charger les données au montage du composant
  useEffect(() => {
    refreshPartenaires();
  }, [refreshPartenaires]);

  return {
    partenaires,
    loading,
    error,
    createPartenaire,
    updatePartenaire,
    deletePartenaire,
    searchPartenaires,
    getPartenairesByType,
    refreshPartenaires,
    statistics,
    statisticsLoading
  };
};

export const useSupabaseEmployees = (partnerId?: string) => {
  const [employes, setEmployes] = useState<Employe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Charger les employés d'un partenaire
  const loadEmployes = useCallback(async (partnerId: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await employeService.getByPartnerId(partnerId);
      setEmployes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des employés');
    } finally {
      setLoading(false);
    }
  }, []);

  // Créer un employé
  const createEmploye = useCallback(async (employeData: Omit<Employe, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setError(null);
      const nouvelEmploye = await employeService.create(employeData);
      setEmployes(prev => [nouvelEmploye, ...prev]);
      return nouvelEmploye;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la création de l\'employé';
      setError(errorMessage);
      throw err;
    }
  }, []);

  // Mettre à jour un employé
  const updateEmploye = useCallback(async (id: string, employeData: Partial<Omit<Employe, 'id' | 'created_at' | 'updated_at'>>) => {
    try {
      setError(null);
      const employeMisAJour = await employeService.update(id, employeData);
      setEmployes(prev => prev.map(e => e.id === id ? employeMisAJour : e));
      return employeMisAJour;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la mise à jour de l\'employé';
      setError(errorMessage);
      throw err;
    }
  }, []);

  // Supprimer un employé
  const deleteEmploye = useCallback(async (id: string) => {
    try {
      setError(null);
      await employeService.delete(id);
      setEmployes(prev => prev.filter(e => e.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la suppression de l\'employé';
      setError(errorMessage);
      throw err;
    }
  }, []);

  // Créer plusieurs employés en lot
  const createBatchEmployes = useCallback(async (employes: Omit<Employe, 'id' | 'created_at' | 'updated_at'>[]) => {
    try {
      setError(null);
      const nouveauxEmployes = await employeService.createBatch(employes);
      setEmployes(prev => [...nouveauxEmployes, ...prev]);
      return nouveauxEmployes;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la création en lot des employés';
      setError(errorMessage);
      throw err;
    }
  }, []);

  // Rechercher des employés
  const searchEmployes = useCallback(async (searchTerm: string, partnerId?: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await employeService.search(searchTerm, partnerId);
      setEmployes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la recherche des employés');
    } finally {
      setLoading(false);
    }
  }, []);

  // Charger les employés si un partnerId est fourni
  useEffect(() => {
    if (partnerId) {
      loadEmployes(partnerId);
    }
  }, [partnerId, loadEmployes]);

  return {
    employes,
    loading,
    error,
    loadEmployes,
    createEmploye,
    updateEmploye,
    deleteEmploye,
    createBatchEmployes,
    searchEmployes
  };
};

export const useSupabasePartnerDetail = (partnerId: string) => {
  const [partenaire, setPartenaire] = useState<PartenaireAvecEmployes | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Charger un partenaire avec ses employés
  const loadPartenaireDetail = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await partenaireService.getByIdWithEmployees(id);
      setPartenaire(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement du partenaire');
    } finally {
      setLoading(false);
    }
  }, []);

  // Charger les données au montage
  useEffect(() => {
    if (partnerId) {
      loadPartenaireDetail(partnerId);
    }
  }, [partnerId, loadPartenaireDetail]);

  return {
    partenaire,
    loading,
    error,
    loadPartenaireDetail
  };
}; 
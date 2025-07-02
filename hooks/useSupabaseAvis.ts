import { useState, useEffect, useCallback } from 'react';
import { avisService } from '@/services/avisService';
import { Avis, AvisStats } from '@/types/avis';

interface UseSupabaseAvisReturn {
  avis: Avis[];
  loading: boolean;
  error: string | null;
  statistics: AvisStats | null;
  statisticsLoading: boolean;
  createAvis: (data: Omit<Avis, 'id' | 'created_at' | 'updated_at'>) => Promise<Avis>;
  updateAvis: (id: string, data: Partial<Omit<Avis, 'id' | 'created_at' | 'updated_at'>>) => Promise<void>;
  deleteAvis: (id: string) => Promise<void>;
  toggleApproval: (id: string, approuve: boolean) => Promise<void>;
  searchAvis: (searchTerm: string) => Promise<void>;
  getByPartner: (partnerId: string) => Promise<void>;
  getByEmployee: (employeeId: string) => Promise<void>;
  refreshAvis: () => Promise<void>;
}

export const useSupabaseAvis = (): UseSupabaseAvisReturn => {
  const [avis, setAvis] = useState<Avis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statistics, setStatistics] = useState<AvisStats | null>(null);
  const [statisticsLoading, setStatisticsLoading] = useState(true);

  // Charger tous les avis
  const loadAvis = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await avisService.getAll();
      setAvis(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des avis');
      console.error('Erreur loadAvis:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Charger les statistiques
  const loadStatistics = useCallback(async () => {
    try {
      setStatisticsLoading(true);
      const data = await avisService.getStatistics();
      setStatistics(data);
    } catch (err) {
      console.error('Erreur loadStatistics:', err);
      // Ne pas afficher d'erreur pour les statistiques, utiliser des valeurs par défaut
      setStatistics({
        total_avis: 0,
        moyenne_note: 0,
        avis_positifs: 0,
        avis_negatifs: 0,
        avis_approuves: 0,
        avis_en_attente: 0,
        repartition_notes: [],
        repartition_par_partenaire: [],
        repartition_par_employe: []
      });
    } finally {
      setStatisticsLoading(false);
    }
  }, []);

  // Créer un avis
  const createAvis = useCallback(async (data: Omit<Avis, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setError(null);
      const result = await avisService.create(data);
      setAvis(prev => [result, ...prev]);
      
      // Recharger les statistiques
      await loadStatistics();
      
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création de l\'avis');
      throw err;
    }
  }, [loadStatistics]);

  // Mettre à jour un avis
  const updateAvis = useCallback(async (id: string, data: Partial<Omit<Avis, 'id' | 'created_at' | 'updated_at'>>) => {
    try {
      setError(null);
      const updatedAvis = await avisService.update(id, data);
      setAvis(prev => 
        prev.map(a => a.id === id ? updatedAvis : a)
      );
      
      // Recharger les statistiques
      await loadStatistics();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour de l\'avis');
      throw err;
    }
  }, [loadStatistics]);

  // Supprimer un avis
  const deleteAvis = useCallback(async (id: string) => {
    try {
      setError(null);
      await avisService.delete(id);
      setAvis(prev => prev.filter(a => a.id !== id));
      
      // Recharger les statistiques
      await loadStatistics();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression de l\'avis');
      throw err;
    }
  }, [loadStatistics]);

  // Approuver/Rejeter un avis
  const toggleApproval = useCallback(async (id: string, approuve: boolean) => {
    try {
      setError(null);
      const updatedAvis = await avisService.toggleApproval(id, approuve);
      setAvis(prev => 
        prev.map(a => a.id === id ? updatedAvis : a)
      );
      
      // Recharger les statistiques
      await loadStatistics();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la modification de l\'approbation');
      throw err;
    }
  }, [loadStatistics]);

  // Rechercher des avis
  const searchAvis = useCallback(async (searchTerm: string) => {
    try {
      setLoading(true);
      setError(null);
      if (searchTerm.trim() === '') {
        await loadAvis();
      } else {
        const data = await avisService.search(searchTerm);
        setAvis(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la recherche');
      console.error('Erreur searchAvis:', err);
    } finally {
      setLoading(false);
    }
  }, [loadAvis]);

  // Filtrer par partenaire
  const getByPartner = useCallback(async (partnerId: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await avisService.getByPartner(partnerId);
      setAvis(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du filtrage par partenaire');
      console.error('Erreur getByPartner:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Filtrer par employé
  const getByEmployee = useCallback(async (employeeId: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await avisService.getByEmployee(employeeId);
      setAvis(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du filtrage par employé');
      console.error('Erreur getByEmployee:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Rafraîchir les avis
  const refreshAvis = useCallback(async () => {
    await Promise.all([loadAvis(), loadStatistics()]);
  }, [loadAvis, loadStatistics]);

  // Charger les données au montage du composant
  useEffect(() => {
    refreshAvis();
  }, [refreshAvis]);

  return {
    avis,
    loading,
    error,
    statistics,
    statisticsLoading,
    createAvis,
    updateAvis,
    deleteAvis,
    toggleApproval,
    searchAvis,
    getByPartner,
    getByEmployee,
    refreshAvis
  };
}; 
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Service, ServiceFormData, UIService } from '@/types/service';
import serviceService from '@/services/serviceService';

interface UseSupabaseServicesReturn {
  services: UIService[];
  filteredServices: UIService[];
  isLoading: boolean;
  error: string | null;
  stats: {
    total: number;
    disponibles: number;
    indisponibles: number;
    parCategorie: Record<string, number>;
  } | null;
  statsLoading: boolean;
  searchTerm: string;
  categorieFilter: string;
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  categories: string[];
  // Actions
  setSearchTerm: (term: string) => void;
  setCategorieFilter: (categorie: string) => void;
  setCurrentPage: (page: number) => void;
  refreshServices: () => Promise<void>;
  createService: (serviceData: ServiceFormData) => Promise<Service>;
  updateService: (id: string, serviceData: Partial<Service>) => Promise<Service>;
  deleteService: (id: string) => Promise<void>;
  searchServices: (query: string) => Promise<Service[]>;
}

// Fonction utilitaire pour convertir Service en UIService
const convertToUIService = (service: Service): UIService => {
  return {
    id: service.id,
    nom: service.nom,
    description: service.description,
    categorie: service.categorie,
    pourcentageMax: service.pourcentage_max,
    duree: service.duree,
    disponible: service.disponible,
    fraisAttribues: service.frais_attribues,
    frais_attribues: service.frais_attribues,
    pourcentage_max: service.pourcentage_max,
    image_url: service.image_url,
    dateCreation: service.date_creation?.toISOString() || service.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
    createdAt: service.createdAt
  };
};

export const useSupabaseServices = (itemsPerPage: number = 8): UseSupabaseServicesReturn => {
  const [services, setServices] = useState<UIService[]>([]);
  const [filteredServices, setFilteredServices] = useState<UIService[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<{
    total: number;
    disponibles: number;
    indisponibles: number;
    parCategorie: Record<string, number>;
  } | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categorieFilter, setCategorieFilter] = useState('toutes');
  const [currentPage, setCurrentPage] = useState(1);

  // Calculer le nombre total de pages
  const totalPages = Math.ceil(filteredServices.length / itemsPerPage);

  // Extraire les catégories uniques
  const categories = useMemo(() => {
    const uniqueCategories = ['toutes', ...new Set(services.map(service => service.categorie))];
    return uniqueCategories.filter(cat => cat); // Filtrer les valeurs vides
  }, [services]);

  // Charger tous les services
  const loadServices = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const servicesData = await serviceService.getAll();
      const uiServices = servicesData.map(convertToUIService);
      setServices(uiServices);
      setFilteredServices(uiServices);
    } catch (err) {
      console.error('Erreur lors du chargement des services:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des services');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Charger les statistiques
  const loadStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      const statsData = await serviceService.getStats();
      setStats(statsData);
    } catch (err) {
      console.error('Erreur lors du chargement des statistiques:', err);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // Charger les données au montage
  useEffect(() => {
    loadServices();
    loadStats();
  }, [loadServices, loadStats]);

  // Filtrer les services
  useEffect(() => {
    let filtered = [...services];
    
    // Filtrage par terme de recherche
    if (searchTerm.trim() !== '') {
      filtered = filtered.filter(service => 
        service.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filtrage par catégorie
    if (categorieFilter !== 'toutes') {
      filtered = filtered.filter(service => service.categorie === categorieFilter);
    }
    
    setFilteredServices(filtered);
    setCurrentPage(1); // Réinitialiser à la première page après filtrage
  }, [searchTerm, categorieFilter, services]);

  // Créer un service
  const createService = useCallback(async (serviceData: ServiceFormData): Promise<Service> => {
    try {
      const newService = await serviceService.create(serviceData);
      const uiService = convertToUIService(newService);
      setServices(prev => [...prev, uiService]);
      await loadStats(); // Recharger les statistiques
      return newService;
    } catch (err) {
      console.error('Erreur lors de la création du service:', err);
      throw err;
    }
  }, [loadStats]);

  // Mettre à jour un service
  const updateService = useCallback(async (id: string, serviceData: Partial<Service>): Promise<Service> => {
    try {
      const updatedService = await serviceService.update(id, serviceData);
      const uiService = convertToUIService(updatedService);
      setServices(prev => prev.map(service => service.id === id ? uiService : service));
      await loadStats(); // Recharger les statistiques
      return updatedService;
    } catch (err) {
      console.error('Erreur lors de la mise à jour du service:', err);
      throw err;
    }
  }, [loadStats]);

  // Supprimer un service
  const deleteService = useCallback(async (id: string): Promise<void> => {
    try {
      await serviceService.delete(id);
      setServices(prev => prev.filter(service => service.id !== id));
      await loadStats(); // Recharger les statistiques
    } catch (err) {
      console.error('Erreur lors de la suppression du service:', err);
      throw err;
    }
  }, [loadStats]);

  // Rechercher des services
  const searchServices = useCallback(async (query: string): Promise<Service[]> => {
    try {
      return await serviceService.search(query);
    } catch (err) {
      console.error('Erreur lors de la recherche de services:', err);
      throw err;
    }
  }, []);

  // Rafraîchir les données
  const refreshServices = useCallback(async () => {
    await loadServices();
    await loadStats();
  }, [loadServices, loadStats]);

  return {
    services,
    filteredServices,
    isLoading,
    error,
    stats,
    statsLoading,
    searchTerm,
    categorieFilter,
    currentPage,
    totalPages,
    itemsPerPage,
    categories,
    setSearchTerm,
    setCategorieFilter,
    setCurrentPage,
    refreshServices,
    createService,
    updateService,
    deleteService,
    searchServices,
  };
}; 
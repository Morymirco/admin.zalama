import { useState, useEffect, useRef, useCallback } from 'react';

// Cache global pour les données
const dataCache = new Map<string, { data: any[]; timestamp: number; loading: boolean }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Priorités des services (plus bas = plus prioritaire)
const SERVICE_PRIORITIES = {
  'employeeService': 1,
  'partnerService': 2,
  'serviceService': 3,
  'transactionService': 4,
  'avisService': 5,
  'alerteService': 6,
  'demandeService': 7,
  'objectifsService': 8,
  'notificationService': 9,
  'userService': 10,
  'usersService': 10,
  'notificationsService': 9,
  'employeesService': 1,
  'partnersService': 2,
  'servicesService': 3,
  'transactionsService': 4,
  'demandesService': 7,
  'genericService': 15,
};

// Fonction utilitaire pour obtenir le nom du service
const getServiceName = (service: any): string => {
  // Essayer d'obtenir le nom via une propriété spécifique (priorité la plus haute)
  if (service?.tableName) {
    return `${service.tableName}Service`;
  }
  
  // Essayer d'obtenir le nom via constructor.name
  if (service?.constructor?.name && service.constructor.name !== 'Object') {
    return service.constructor.name;
  }
  
  // Essayer d'obtenir le nom via les méthodes disponibles
  if (service?.getAll) {
    return 'genericService';
  }
  
  // Fallback
  return 'unknown';
};

// Fonction pour déterminer la méthode à utiliser pour récupérer les données
const getFetchMethod = (service: any): string | null => {
  // Vérifier les méthodes disponibles dans l'ordre de priorité
  if (typeof service.getAll === 'function') {
    return 'getAll';
  }
  
  if (typeof service.getUserNotifications === 'function') {
    return 'getUserNotifications';
  }
  
  if (typeof service.getUnreadNotifications === 'function') {
    return 'getUnreadNotifications';
  }
  
  if (typeof service.getStats === 'function') {
    return 'getStats';
  }
  
  if (typeof service.list === 'function') {
    return 'list';
  }
  
  if (typeof service.fetch === 'function') {
    return 'fetch';
  }
  
  return null;
};

// Fonction pour exécuter la méthode appropriée
const executeFetchMethod = async (service: any, method: string, userId?: string): Promise<any[]> => {
  switch (method) {
    case 'getAll':
      return await service.getAll();
    
    case 'getUserNotifications':
      if (!userId) {
        throw new Error('userId requis pour getUserNotifications');
      }
      return await service.getUserNotifications(userId);
    
    case 'getUnreadNotifications':
      if (!userId) {
        throw new Error('userId requis pour getUnreadNotifications');
      }
      return await service.getUnreadNotifications(userId);
    
    case 'getStats':
      const stats = await service.getStats();
      // Convertir les stats en tableau si nécessaire
      return Array.isArray(stats) ? stats : [stats];
    
    case 'list':
      return await service.list();
    
    case 'fetch':
      return await service.fetch();
    
    default:
      throw new Error(`Méthode ${method} non supportée`);
  }
};

export function useSupabaseCollection<T>(
  service: any,
  dependencies: any[] = [],
  options: {
    cacheKey?: string;
    priority?: number;
    enableCache?: boolean;
    debounceMs?: number;
    userId?: string; // Ajout du userId pour les services qui en ont besoin
  } = {}
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const serviceName = getServiceName(service);
  const fetchMethod = getFetchMethod(service);
  
  const {
    cacheKey = serviceName,
    priority = SERVICE_PRIORITIES[serviceName as keyof typeof SERVICE_PRIORITIES] || 10,
    enableCache = true,
    debounceMs = 0,
    userId
  } = options;

  const fetchData = useCallback(async (signal?: AbortSignal) => {
    try {
      // Vérifier si le service a une méthode de récupération
      if (!fetchMethod) {
        throw new Error(`Service ${serviceName} n'a pas de méthode de récupération de données (getAll, getUserNotifications, etc.)`);
      }

      // Vérifier le cache si activé
      if (enableCache && dataCache.has(cacheKey)) {
        const cached = dataCache.get(cacheKey)!;
        const isExpired = Date.now() - cached.timestamp > CACHE_DURATION;
        
        if (!isExpired && !cached.loading) {
          setData(cached.data);
          setLoading(false);
          setError(null);
          return;
        }
      }

      // Marquer comme en cours de chargement dans le cache
      if (enableCache) {
        dataCache.set(cacheKey, { data: [], timestamp: Date.now(), loading: true });
      }

      setLoading(true);
      setError(null);
      
      // Utiliser la méthode appropriée avec timeout
      const result = await Promise.race([
        executeFetchMethod(service, fetchMethod, userId),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 10000)
        )
      ]);

      if (signal?.aborted) return;

      // S'assurer que le résultat est un tableau
      const resultArray = Array.isArray(result) ? result : [result];
      setData(resultArray);
      
      // Mettre en cache si activé
      if (enableCache) {
        dataCache.set(cacheKey, { 
          data: resultArray, 
          timestamp: Date.now(), 
          loading: false 
        });
      }
    } catch (err) {
      if (signal?.aborted) return;
      
      console.error('Error fetching data:', err);
      setError(err instanceof Error ? err : new Error('Une erreur est survenue'));
      
      // Retirer du cache en cas d'erreur
      if (enableCache) {
        dataCache.delete(cacheKey);
      }
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }, [service, cacheKey, enableCache, fetchMethod, serviceName, userId]);

  useEffect(() => {
    // Annuler la requête précédente
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Nettoyer le timeout précédent
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Créer un nouveau contrôleur d'annulation
    abortControllerRef.current = new AbortController();

    // Appliquer la priorisation avec un délai basé sur la priorité
    const delay = priority * 50; // 50ms par niveau de priorité

    const executeFetch = () => {
      fetchData(abortControllerRef.current?.signal);
    };

    if (debounceMs > 0) {
      timeoutRef.current = setTimeout(executeFetch, debounceMs);
    } else {
      timeoutRef.current = setTimeout(executeFetch, delay);
    }

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [fetchData, priority, debounceMs, ...dependencies]);

  // Fonction pour rafraîchir les données
  const refresh = useCallback(() => {
    if (enableCache) {
      dataCache.delete(cacheKey);
    }
    fetchData();
  }, [fetchData, cacheKey, enableCache]);

  return { data, loading, error, refresh };
}

export function useSupabaseDocument<T>(
  service: any,
  documentId: string | null,
  options: {
    cacheKey?: string;
    enableCache?: boolean;
  } = {}
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const serviceName = getServiceName(service);
  
  const {
    cacheKey = documentId ? `${serviceName}_${documentId}` : 'unknown',
    enableCache = true
  } = options;

  useEffect(() => {
    if (!documentId) {
      setData(null);
      setLoading(false);
      return;
    }

    // Annuler la requête précédente
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Créer un nouveau contrôleur d'annulation
    abortControllerRef.current = new AbortController();

    const fetchData = async () => {
      try {
        // Vérifier le cache si activé
        if (enableCache && dataCache.has(cacheKey)) {
          const cached = dataCache.get(cacheKey)!;
          const isExpired = Date.now() - cached.timestamp > CACHE_DURATION;
          
          if (!isExpired && !cached.loading) {
            setData(cached.data);
            setLoading(false);
            setError(null);
            return;
          }
        }

        setLoading(true);
        setError(null);
        
        const result = await Promise.race([
          service.getById(documentId),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), 10000)
          )
        ]);

        if (abortControllerRef.current?.signal.aborted) return;

        setData(result);
        
        // Mettre en cache si activé
        if (enableCache) {
          dataCache.set(cacheKey, { 
            data: result, 
            timestamp: Date.now(), 
            loading: false 
          });
        }
      } catch (err) {
        if (abortControllerRef.current?.signal.aborted) return;
        
        console.error('Error fetching document:', err);
        setError(err instanceof Error ? err : new Error('Une erreur est survenue'));
        
        // Retirer du cache en cas d'erreur
        if (enableCache) {
          dataCache.delete(cacheKey);
        }
      } finally {
        if (!abortControllerRef.current?.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [service, documentId, cacheKey, enableCache]);

  return { data, loading, error };
}

// Fonction utilitaire pour nettoyer le cache
export const clearDataCache = (cacheKey?: string) => {
  if (cacheKey) {
    dataCache.delete(cacheKey);
  } else {
    dataCache.clear();
  }
};

// Fonction utilitaire pour obtenir les statistiques du cache
export const getCacheStats = () => {
  const entries = Array.from(dataCache.entries());
  return {
    totalEntries: entries.length,
    expiredEntries: entries.filter(([_, value]) => 
      Date.now() - value.timestamp > CACHE_DURATION
    ).length,
    totalSize: entries.reduce((acc, [_, value]) => 
      acc + JSON.stringify(value.data).length, 0
    )
  };
}; 
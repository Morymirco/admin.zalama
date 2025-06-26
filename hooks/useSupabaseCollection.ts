import { useState, useEffect } from 'react';

export function useSupabaseCollection<T>(
  service: any,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Utiliser la méthode getAll du service Supabase
        const result = await service.getAll();
        setData(result);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err : new Error('Une erreur est survenue'));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [service, ...dependencies]);

  return { data, loading, error };
}

export function useSupabaseDocument<T>(
  service: any,
  documentId: string | null
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!documentId) {
      setData(null);
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const result = await service.getById(documentId);
        setData(result);
      } catch (err) {
        console.error('Error fetching document:', err);
        setError(err instanceof Error ? err : new Error('Une erreur est survenue'));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [service, documentId]);

  return { data, loading, error };
} 
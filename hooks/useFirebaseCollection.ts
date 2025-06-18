import { useState, useEffect } from 'react';
import { QueryConstraint } from 'firebase/firestore';

export function useFirebaseCollection<T>(
  service: any,
  constraints: QueryConstraint[] = [],
  realtime: boolean = false
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let unsubscribe: () => void;

    const fetchData = async () => {
      try {
        setLoading(true);
        
        if (realtime) {
          unsubscribe = service.subscribe(constraints, (result: T[]) => {
            setData(result);
            setLoading(false);
          });
        } else {
          const result = await service.query(constraints);
          setData(result);
          setLoading(false);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err : new Error('Une erreur est survenue'));
        setLoading(false);
      }
    };

    fetchData();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [service, JSON.stringify(constraints), realtime]);

  return { data, loading, error };
}

export function useFirebaseDocument<T>(
  service: any,
  documentId: string | null,
  realtime: boolean = false
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

    // Initialiser unsubscribe comme une fonction vide par défaut
    let unsubscribe: () => void = () => {};

    const fetchData = async () => {
      try {
        setLoading(true);
        
        if (realtime) {
          // Cette partie nécessite une implémentation spécifique dans le service
          // pour l'instant, on utilise la méthode non temps réel
          const result = await service.getById(documentId);
          setData(result);
          setLoading(false);
        } else {
          const result = await service.getById(documentId);
          setData(result);
          setLoading(false);
        }
      } catch (err) {
        console.error('Error fetching document:', err);
        setError(err instanceof Error ? err : new Error('Une erreur est survenue'));
        setLoading(false);
      }
    };

    fetchData();

    return () => {
      unsubscribe();
    };
  }, [service, documentId, realtime]);

  return { data, loading, error };
}

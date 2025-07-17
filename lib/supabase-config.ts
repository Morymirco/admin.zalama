import { createClient } from '@supabase/supabase-js';

// Configuration Supabase centralisée - Utiliser directement les clés valides
export const supabaseConfig = {
  url: 'https://mspmrzlqhwpdkkburjiw.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zcG1yemxxaHdwZGtrYnVyaml3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3ODcyNTgsImV4cCI6MjA2NjM2MzI1OH0.zr-TRpKjGJjW0nRtsyPcCLy4Us-c5tOGX71k5_3JJd0',
  serviceKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zcG1yemxxaHdwZGtrYnVyaml3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDc4NzI1OCwiZXhwIjoyMDY2MzYzMjU4fQ.6sIgEDZIP1fkUoxdPJYfzKHU1B_SfN6Hui6v_FV6yzw'
};

// Configuration optimisée pour éviter les timeouts
const supabaseClientConfig = {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce' as const,
  },
  global: {
    headers: {
      'X-Client-Info': 'zalama-admin-dashboard',
    },
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
};

// Client principal pour l'authentification côté client
export const supabase = createClient(
  supabaseConfig.url,
  supabaseConfig.anonKey,
  supabaseClientConfig
);

// Client admin pour les opérations côté serveur
export const supabaseAdmin = createClient(
  supabaseConfig.url,
  supabaseConfig.serviceKey,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);

// Utilitaires pour gérer les timeouts
export const withTimeout = async <T>(
  promise: Promise<T>,
  timeoutMs: number = 10000,
  errorMessage: string = 'Operation timeout'
): Promise<T> => {
  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error(errorMessage)), timeoutMs)
  );

  return Promise.race([promise, timeoutPromise]);
};

// Wrapper pour les opérations d'authentification avec retry et timeout
export const authWithRetry = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  timeoutMs: number = 10000
): Promise<T | null> => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await withTimeout(operation(), timeoutMs, `Auth operation timeout (attempt ${attempt})`);
    } catch (error) {
      if (attempt === maxRetries) {
        console.warn(`Auth operation failed after ${maxRetries} attempts:`, error);
        return null;
      }
      // Attendre avant de réessayer (backoff exponentiel)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt - 1) * 1000));
    }
  }
  return null;
}; 
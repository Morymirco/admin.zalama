"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from '@supabase/supabase-js';

// Configuration Supabase
const supabaseUrl = 'https://mspmrzlqhwpdkkburjiw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zcG1yemxxaHdwZGtrYnVyaml3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3ODcyNTgsImV4cCI6MjA2NjM2MzI1OH0.zr-TRpKjGJjW0nRtsyPcCLy4Us-c5tOGX71k5_3JJd0';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Cache pour éviter les appels API répétés
const sessionUpdateCache = new Map<string, number>();
const SESSION_UPDATE_THROTTLE = 2000; // 2 secondes

// Configuration de débogage (désactivée en production)
const DEBUG = process.env.NODE_ENV === 'development' && process.env.NEXT_DEBUG === 'true';

// Composant Skeleton pour le chargement
const AuthLoadingSkeleton = () => {
  return (
    <div className="min-h-screen bg-[var(--zalama-bg)] flex flex-col">
      {/* Header skeleton */}
      <div className="h-16 border-b border-[var(--zalama-border)] px-4 flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-32 h-8 bg-[var(--zalama-bg-lighter)] rounded-md animate-pulse"></div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="w-8 h-8 bg-[var(--zalama-bg-lighter)] rounded-full animate-pulse"></div>
          <div className="w-24 h-8 bg-[var(--zalama-bg-lighter)] rounded-md animate-pulse"></div>
        </div>
      </div>
      
      {/* Main content skeleton */}
      <div className="flex flex-1">
        {/* Sidebar skeleton */}
        <div className="hidden md:flex md:w-64 border-r border-[var(--zalama-border)] flex-col p-4">
          <div className="w-full h-10 bg-[var(--zalama-bg-lighter)] rounded-md animate-pulse mb-4"></div>
          <div className="space-y-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="w-full h-8 bg-[var(--zalama-bg-lighter)] rounded-md animate-pulse"></div>
            ))}
          </div>
        </div>
        
        {/* Content skeleton */}
        <div className="flex-1 p-6">
          <div className="w-48 h-10 bg-[var(--zalama-bg-lighter)] rounded-md animate-pulse mb-6"></div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-[var(--zalama-bg-lighter)] rounded-lg animate-pulse"></div>
            ))}
          </div>
          
          <div className="w-full h-64 bg-[var(--zalama-bg-lighter)] rounded-lg animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

export default function SupabaseAuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const lastUpdateRef = useRef(0);
  const isInitializedRef = useRef(false);

  // Fonction optimisée pour mettre à jour la session
  const updateSession = useCallback(async (session: any, event: string) => {
    const now = Date.now();
    const cacheKey = session?.access_token || 'no-token';
    
    // Éviter les mises à jour trop fréquentes
    if (sessionUpdateCache.has(cacheKey)) {
      const lastUpdate = sessionUpdateCache.get(cacheKey)!;
      if (now - lastUpdate < SESSION_UPDATE_THROTTLE) {
        if (DEBUG) console.log(`⏭️ Session update throttled for ${cacheKey}`);
        return;
      }
    }
    
    sessionUpdateCache.set(cacheKey, now);
    
    try {
      if (session) {
        // Utilisateur connecté
        if (DEBUG) console.log(`🔄 Updating session for ${session.user.email}`);
        
        const response = await fetch("/api/auth/session", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token: session.access_token }),
        });

        if (!response.ok) {
          throw new Error(`Session update failed: ${response.status}`);
        }
        
        // Rediriger vers le dashboard si sur la page de connexion
        if (window.location.pathname === "/login" || window.location.pathname === "/") {
          if (DEBUG) console.log('🔄 Redirecting to dashboard...');
          router.push("/dashboard");
        }
      } else {
        // Utilisateur déconnecté
        if (DEBUG) console.log('🔄 Clearing session');
        
        await fetch("/api/auth/session", {
          method: "DELETE",
        });
        
        // Rediriger vers la page de connexion si sur une page protégée
        if (window.location.pathname.startsWith("/dashboard")) {
          if (DEBUG) console.log('🔄 Redirecting to login...');
          router.push("/login");
        }
      }
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour de session:', error);
    }
  }, [router]);

  useEffect(() => {
    // Éviter les initialisations multiples
    if (isInitializedRef.current) return;
    isInitializedRef.current = true;

    // Vérifier la session initiale
    const checkSession = async () => {
      try {
        if (DEBUG) console.log('🔍 Checking initial session...');
        
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ Erreur lors de la vérification de session:', error);
        }
        
        // Mettre à jour le cookie de session
        await updateSession(session, 'INITIAL');
      } catch (error) {
        console.error('❌ Erreur lors de la vérification de session:', error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // Écouter les changements d'authentification avec debounce
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (DEBUG) console.log(`🔄 Auth state changed: ${event}`, session?.user?.email);
        
        // Debounce pour éviter les changements rapides
        const now = Date.now();
        if (now - lastUpdateRef.current < 100) {
          return;
        }
        lastUpdateRef.current = now;
        
        await updateSession(session, event);
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
      isInitializedRef.current = false;
    };
  }, [updateSession]);

  // Optimisation : réduire les re-renders
  if (loading) {
    return <AuthLoadingSkeleton />;
  }

  return children;
} 
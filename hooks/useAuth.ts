"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import authService, { AuthUser } from '@/services/authService';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastProfileFetch, setLastProfileFetch] = useState(0);
  const profileCache = useRef<Map<string, { profile: AuthUser; timestamp: number }>>(new Map());

  // Optimisation : Cache des profils utilisateur avec TTL
  const getCachedProfile = useCallback(async (userId: string): Promise<AuthUser | null> => {
    const now = Date.now();
    const cacheKey = userId;
    const cached = profileCache.current.get(cacheKey);
    
    // Cache valide pendant 5 minutes
    if (cached && (now - cached.timestamp) < 5 * 60 * 1000) {
      return cached.profile;
    }
    
    try {
      const profile = await authService.getUserProfile(userId);
      if (profile) {
        profileCache.current.set(cacheKey, { profile, timestamp: now });
      }
      return profile;
    } catch (error) {
      console.error('Erreur lors de la récupération du profil:', error);
      return null;
    }
  }, []);

  // Optimisation : Récupération de session optimisée
  const getSessionOptimized = useCallback(async () => {
    try {
      const session = await authService.getSession();
      const currentUser = await authService.getCurrentUser();
      
      setUser(currentUser);
      
      // Récupérer le profil utilisateur si connecté (avec cache)
      if (currentUser) {
        const profile = await getCachedProfile(currentUser.id);
        setUserProfile(profile);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la récupération de la session');
    } finally {
      setLoading(false);
    }
  }, [getCachedProfile]);

  useEffect(() => {
    getSessionOptimized();

    // Écouter les changements d'authentification
    const { data: { subscription } } = authService.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        
        // Récupérer le profil utilisateur si connecté (avec cache)
        if (session?.user) {
          const profile = await getCachedProfile(session.user.id);
          setUserProfile(profile);
        } else {
          setUserProfile(null);
          // Nettoyer le cache quand l'utilisateur se déconnecte
          profileCache.current.clear();
        }
        
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [getSessionOptimized, getCachedProfile]);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const { user: authUser } = await authService.signIn({ email, password });
      
      setUser(authUser);
      
      // Récupérer le profil utilisateur (avec cache)
      if (authUser) {
        const profile = await getCachedProfile(authUser.id);
        setUserProfile(profile);
      }
      
      return authUser;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur de connexion';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, userData?: any) => {
    try {
      setLoading(true);
      setError(null);
      
      const { user: authUser } = await authService.signUp({
        email,
        password,
        displayName: userData?.displayName || '',
        role: userData?.role,
        partenaireId: userData?.partenaireId,
      });
      
      if (authUser) {
        setUser(authUser);
        
        // Récupérer le profil utilisateur (avec cache)
        const profile = await getCachedProfile(authUser.id);
        setUserProfile(profile);
      }
      
      return authUser;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur d\'inscription';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      await authService.signOut();
      setUser(null);
      setUserProfile(null);
      // Nettoyer le cache lors de la déconnexion
      profileCache.current.clear();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de déconnexion');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setLoading(true);
      setError(null);
      
      await authService.resetPassword(email);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur de réinitialisation';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updatePassword = async (password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      await authService.updatePassword(password);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur de mise à jour du mot de passe';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Vérifier si l'utilisateur est admin
  const isAdmin = userProfile?.role === 'admin';

  // Vérifier si l'utilisateur est actif
  const isActive = userProfile?.active || false;

  // Vérifier si l'utilisateur est authentifié
  const isAuthenticated = !!user && isActive;

  return {
    user,
    userProfile,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    isAuthenticated,
    isAdmin,
    isActive,
  };
}; 
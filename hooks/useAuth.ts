"use client";

import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import authService, { AuthUser } from '@/services/authService';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Récupérer la session utilisateur actuelle
    const getSession = async () => {
      try {
        const session = await authService.getSession();
        const currentUser = await authService.getCurrentUser();
        
        setUser(currentUser);
        
        // Récupérer le profil utilisateur si connecté
        if (currentUser) {
          const profile = await authService.getUserProfile(currentUser.id);
          setUserProfile(profile);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur lors de la récupération de la session');
      } finally {
        setLoading(false);
      }
    };

    getSession();

    // Écouter les changements d'authentification
    const { data: { subscription } } = authService.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        
        // Récupérer le profil utilisateur si connecté
        if (session?.user) {
          try {
            const profile = await authService.getUserProfile(session.user.id);
            setUserProfile(profile);
          } catch (err) {
            console.error('Erreur lors de la récupération du profil:', err);
          }
        } else {
          setUserProfile(null);
        }
        
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const { user: authUser } = await authService.signIn({ email, password });
      
      setUser(authUser);
      
      // Récupérer le profil utilisateur
      if (authUser) {
        const profile = await authService.getUserProfile(authUser.id);
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
        
        // Récupérer le profil utilisateur
        const profile = await authService.getUserProfile(authUser.id);
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
"use client";

import SupabaseConfigDebug from '@/components/debug/SupabaseConfigDebug';
import { useAuth } from '@/hooks/useAuth';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { signIn, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  // Redirection automatique si déjà connecté
  useEffect(() => {
    if (!loading && isAuthenticated) {
      console.log('Utilisateur déjà authentifié, redirection vers dashboard...');
      router.push('/dashboard');
    }
  }, [isAuthenticated, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    setIsLoading(true);
    
    try {
      console.log('Tentative de connexion pour:', email);
      await signIn(email, password);
      toast.success('Connexion réussie');
      console.log('Connexion réussie, redirection en cours...');
      // La redirection sera gérée par le useEffect ci-dessus ou par le SupabaseAuthProvider
    } catch (error) {
      console.error('Erreur de connexion:', error);
      const errorMessage = error instanceof Error ? error.message : 'Email ou mot de passe incorrect';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Afficher un loader si l'état d'authentification est en cours de chargement
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--zalama-bg-dark)]">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-[var(--zalama-blue)] rounded-full flex items-center justify-center mb-4">
            <span className="text-2xl font-bold text-white">Z</span>
          </div>
          <h2 className="text-3xl font-bold text-[var(--zalama-text)] mb-2">ZaLaMa</h2>
          <p className="text-[var(--zalama-text-secondary)]">Vérification de l'authentification...</p>
          <div className="mt-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--zalama-blue)] mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  // Si déjà authentifié, ne pas afficher le formulaire
  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--zalama-bg-dark)]">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-[var(--zalama-blue)] rounded-full flex items-center justify-center mb-4">
            <span className="text-2xl font-bold text-white">Z</span>
          </div>
          <h2 className="text-3xl font-bold text-[var(--zalama-text)] mb-2">ZaLaMa</h2>
          <p className="text-[var(--zalama-text-secondary)]">Redirection vers le dashboard...</p>
          <div className="mt-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--zalama-blue)] mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--zalama-bg-dark)] p-4">
      <div className="max-w-md w-full space-y-8">
        {/* Logo et titre */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-[var(--zalama-blue)] rounded-full flex items-center justify-center mb-4">
            <span className="text-2xl font-bold text-white">Z</span>
          </div>
          <h2 className="text-3xl font-bold text-[var(--zalama-text)] mb-2">ZaLaMa</h2>
          <p className="text-[var(--zalama-text-secondary)]">Administration Dashboard</p>
        </div>

        {/* Formulaire de connexion */}
        <div className="bg-[var(--zalama-bg)] border border-[var(--zalama-border)] rounded-xl shadow-lg p-8">
          <div className="text-center mb-6">
            <h3 className="text-xl font-semibold text-[var(--zalama-text)]">Connexion</h3>
            <p className="text-[var(--zalama-text-secondary)] mt-2">Connectez-vous à votre compte</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[var(--zalama-text)] mb-2">
                Adresse email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-[var(--zalama-text-secondary)]" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-[var(--zalama-border)] bg-[var(--zalama-bg-light)] text-[var(--zalama-text)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--zalama-blue)] focus:border-transparent"
                  placeholder="admin@zalamagn.com"
                />
              </div>
            </div>

            {/* Mot de passe */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[var(--zalama-text)] mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-[var(--zalama-text-secondary)]" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-12 py-3 border border-[var(--zalama-border)] bg-[var(--zalama-bg-light)] text-[var(--zalama-text)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--zalama-blue)] focus:border-transparent"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-[var(--zalama-text-secondary)] hover:text-[var(--zalama-text)]" />
                  ) : (
                    <Eye className="h-5 w-5 text-[var(--zalama-text-secondary)] hover:text-[var(--zalama-text)]" />
                  )}
                </button>
              </div>
            </div>

            {/* Bouton de connexion */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[var(--zalama-blue)] hover:bg-[var(--zalama-blue-accent)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--zalama-blue)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Connexion...
                </div>
              ) : (
                'Se connecter'
              )}
            </button>
          </form>

          {/* Informations de test */}
          <div className="mt-6 p-4 bg-[var(--zalama-bg-light)] border border-[var(--zalama-border)] rounded-lg">
            <h4 className="text-sm font-medium text-[var(--zalama-text)] mb-2">Compte de test :</h4>
            <div className="text-xs text-[var(--zalama-text-secondary)] space-y-1">
              <p><strong>Email :</strong> admin@zalamagn.com</p>
              <p><strong>Mot de passe :</strong> AdminZalama2024!</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Composant de debug temporaire */}
      <SupabaseConfigDebug />
    </div>
  );
} 
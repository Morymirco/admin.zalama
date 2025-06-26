"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
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
      await signIn(email, password);
      toast.success('Connexion réussie');
      // La redirection sera gérée par le useEffect ci-dessus
    } catch (error) {
      console.error('Erreur de connexion:', error);
      toast.error('Email ou mot de passe incorrect');
    } finally {
      setIsLoading(false);
    }
  };

  // Afficher un loader si l'état d'authentification est en cours de chargement
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[var(--zalama-blue)] to-[var(--zalama-blue-accent)]">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-white rounded-full flex items-center justify-center mb-4">
            <span className="text-2xl font-bold text-[var(--zalama-blue)]">Z</span>
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">ZaLaMa</h2>
          <p className="text-white/80">Vérification de l'authentification...</p>
          <div className="mt-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[var(--zalama-blue)] to-[var(--zalama-blue-accent)] p-4">
      <div className="max-w-md w-full space-y-8">
        {/* Logo et titre */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-white rounded-full flex items-center justify-center mb-4">
            <span className="text-2xl font-bold text-[var(--zalama-blue)]">Z</span>
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">ZaLaMa</h2>
          <p className="text-white/80">Administration Dashboard</p>
        </div>

        {/* Formulaire de connexion */}
        <div className="bg-white rounded-xl shadow-2xl p-8">
          <div className="text-center mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Connexion</h3>
            <p className="text-gray-600 mt-2">Connectez-vous à votre compte</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Adresse email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--zalama-blue)] focus:border-transparent"
                  placeholder="admin@zalamagn.com"
                />
              </div>
            </div>

            {/* Mot de passe */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--zalama-blue)] focus:border-transparent"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
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
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Compte de test :</h4>
            <div className="text-xs text-gray-600 space-y-1">
              <p><strong>Email :</strong> admin@zalamagn.com</p>
              <p><strong>Mot de passe :</strong> AdminZalama2024!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
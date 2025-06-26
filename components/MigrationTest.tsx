"use client";

import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { partnerService } from '@/lib/services/database';
import { supabase } from '@/lib/supabase';

export default function MigrationTest() {
  const { user, signIn, signOut, isAuthenticated } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [testResult, setTestResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testSupabaseConnection = async () => {
    setLoading(true);
    setTestResult('Test en cours...');
    
    try {
      // Test de connexion à Supabase
      const { data, error } = await supabase
        .from('partners')
        .select('count')
        .limit(1);
      
      if (error) {
        setTestResult(`❌ Erreur Supabase: ${error.message}`);
      } else {
        setTestResult('✅ Connexion Supabase réussie !');
      }
    } catch (err) {
      setTestResult(`❌ Erreur: ${err instanceof Error ? err.message : 'Erreur inconnue'}`);
    } finally {
      setLoading(false);
    }
  };

  const testPartnersService = async () => {
    setLoading(true);
    setTestResult('Test du service partenaires...');
    
    try {
      const partners = await partnerService.getAllPartners();
      setTestResult(`✅ Service partenaires OK - ${partners.length} partenaires trouvés`);
    } catch (err) {
      setTestResult(`❌ Erreur service partenaires: ${err instanceof Error ? err.message : 'Erreur inconnue'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await signIn(email, password);
      setTestResult('✅ Connexion réussie avec Supabase Auth !');
    } catch (err) {
      setTestResult(`❌ Erreur de connexion: ${err instanceof Error ? err.message : 'Erreur inconnue'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-[var(--zalama-card)] rounded-xl border border-[var(--zalama-border)]">
      <h2 className="text-xl font-semibold mb-4 text-[var(--zalama-text)]">
        Test de Migration Supabase
      </h2>
      
      <div className="space-y-4">
        {/* Test de connexion */}
        <div>
          <button
            onClick={testSupabaseConnection}
            disabled={loading}
            className="px-4 py-2 bg-[var(--zalama-blue)] text-white rounded-lg hover:bg-[var(--zalama-blue-accent)] disabled:opacity-50"
          >
            Test Connexion Supabase
          </button>
        </div>

        {/* Test du service partenaires */}
        <div>
          <button
            onClick={testPartnersService}
            disabled={loading}
            className="px-4 py-2 bg-[var(--zalama-green)] text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
          >
            Test Service Partenaires
          </button>
        </div>

        {/* Test d'authentification */}
        <div className="border-t border-[var(--zalama-border)] pt-4">
          <h3 className="text-lg font-medium mb-2 text-[var(--zalama-text)]">
            Test Authentification Supabase
          </h3>
          
          {!isAuthenticated ? (
            <form onSubmit={handleSignIn} className="space-y-3">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-[var(--zalama-border)] rounded-lg bg-[var(--zalama-bg-light)] text-[var(--zalama-text)]"
                required
              />
              <input
                type="password"
                placeholder="Mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-[var(--zalama-border)] rounded-lg bg-[var(--zalama-bg-light)] text-[var(--zalama-text)]"
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-2 bg-[var(--zalama-blue)] text-white rounded-lg hover:bg-[var(--zalama-blue-accent)] disabled:opacity-50"
              >
                Se connecter avec Supabase
              </button>
            </form>
          ) : (
            <div className="space-y-3">
              <p className="text-[var(--zalama-success)]">
                ✅ Connecté avec Supabase: {user?.email}
              </p>
              <button
                onClick={signOut}
                className="px-4 py-2 bg-[var(--zalama-danger)] text-white rounded-lg hover:bg-red-600"
              >
                Se déconnecter
              </button>
            </div>
          )}
        </div>

        {/* Résultats des tests */}
        {testResult && (
          <div className="mt-4 p-3 bg-[var(--zalama-bg-light)] rounded-lg">
            <p className="text-[var(--zalama-text)] font-medium">Résultat:</p>
            <p className="text-[var(--zalama-text-secondary)]">{testResult}</p>
          </div>
        )}
      </div>
    </div>
  );
} 
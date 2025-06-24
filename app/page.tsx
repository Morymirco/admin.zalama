"use client";
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';

export default function LoginPage() {
  const [email, setEmail] = useState('admin@zalama.com');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    // Authentification Supabase (remplacer par signInWithPassword si besoin)
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      setError('Email ou mot de passe incorrect');
    } else {
      window.location.href = '/dashboard';
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--zalama-bg-dark)]">
      <form
        onSubmit={handleLogin}
        className="bg-[var(--zalama-card)] border border-[var(--zalama-border)] rounded-xl shadow-lg p-8 w-full max-w-md flex flex-col gap-6"
      >
        <div className="flex flex-col items-center gap-2 mb-2">
          <Image src="/logo-zalama.png" alt="Logo ZaLaMa" width={56} height={56} className="mb-2" />
          <h1 className="text-2xl font-bold text-[var(--zalama-blue)]">Connexion Admin</h1>
          <p className="text-sm text-[var(--zalama-text-secondary)]">Veuillez vous connecter à votre espace d'administration</p>
        </div>
        <div className="flex flex-col gap-4">
          <label className="flex flex-col gap-1">
            <span className="text-sm text-[var(--zalama-text)] font-medium">Email</span>
            <input
              type="email"
              className="rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-light)] px-4 py-2 text-[var(--zalama-text)] focus:outline-none focus:ring-2 focus:ring-[var(--zalama-blue)]"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoFocus
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm text-[var(--zalama-text)] font-medium">Mot de passe</span>
            <input
              type="password"
              className="rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-light)] px-4 py-2 text-[var(--zalama-text)] focus:outline-none focus:ring-2 focus:ring-[var(--zalama-blue)]"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </label>
        </div>
        {error && <div className="text-red-500 text-sm text-center">{error}</div>}
        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full py-2 mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? 'Connexion...' : 'Se connecter'}
        </button>
        <div className="text-xs text-[var(--zalama-text-secondary)] text-center mt-2">
          <span>Admin par défaut : <b>admin@zalama.com</b> / <b>admin123</b></span>
        </div>
      </form>
    </div>
  );
}

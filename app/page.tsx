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
    <div className="min-h-screen flex items-center justify-center bg-[var(--zalama-blue)] p-4">
      <div className="w-full max-w-md">
        <div className="backdrop-blur-lg bg-white/5 border border-white/20 shadow-2xl p-8 w-full flex flex-col gap-6">
          <div className="flex flex-col items-center gap-3">
            <div className="p-3 bg-white/10 rounded-xl">
              <Image 
                src="/logo-zalama.png" 
                alt="Logo ZaLaMa" 
                width={56} 
                height={56} 
                className="w-14 h-14 object-contain"
              />
            </div>
            <h1 className="text-2xl font-bold text-white">Connexion Admin</h1>
            <p className="text-sm text-white/80 text-center">Veuillez vous connecter à votre espace d'administration</p>
          </div>
          
          <div className="flex flex-col gap-4">
            <label className="flex flex-col gap-1">
              <span className="text-sm text-white font-medium">Email</span>
              <input
                type="email"
                className="w-full bg-white/5 border border-white/10 text-white placeholder-white/40 px-4 py-3 focus:outline-none focus:ring-1 focus:ring-white/30 focus:border-white/30 transition-all duration-200"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="votre@email.com"
                required
                autoFocus
              />
            </label>
            
            <label className="flex flex-col gap-1">
              <div className="flex justify-between items-center">
                <span className="text-sm text-white font-medium">Mot de passe</span>
                <a href="#" className="text-xs text-white/70 hover:text-white transition-colors">
                  Mot de passe oublié ?
                </a>
              </div>
              <input
                type="password"
                className="w-full bg-white/5 border border-white/10 text-white placeholder-white/40 px-4 py-3 focus:outline-none focus:ring-1 focus:ring-white/30 focus:border-white/30 transition-all duration-200"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </label>
          </div>
          
          {error && (
            <div className="bg-red-500/20 border-l-2 border-red-400 text-white p-3 text-sm rounded">
              {error}
            </div>
          )}
          
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="h-4 w-4 rounded border-white/30 bg-white/5 focus:ring-[var(--zalama-blue)]"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-white/80">
              Se souvenir de moi
            </label>
          </div>
          
          <button
            type="submit"
            disabled={loading}
            onClick={handleLogin}
            className="w-full py-3 px-4 font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 border-none transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-blue-500/30"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Connexion...
              </>
            ) : 'Se connecter'}
          </button>
          
          <div className="text-xs text-white/60 text-center mt-2">
            <p>Admin par défaut : <span className="font-mono bg-white/10 px-2 py-1 rounded">admin@zalama.com</span> / <span className="font-mono bg-white/10 px-2 py-1 rounded">admin123</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function Home() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (isAuthenticated) {
        console.log('Utilisateur authentifié, redirection vers dashboard...');
        router.push("/dashboard");
      } else {
        console.log('Utilisateur non authentifié, redirection vers login...');
        router.push("/login");
      }
    }
  }, [isAuthenticated, loading, router]);

  // Page de chargement
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[var(--zalama-blue)] to-[var(--zalama-blue-accent)]">
      <div className="text-center">
        <div className="mx-auto h-16 w-16 bg-white rounded-full flex items-center justify-center mb-4">
          <span className="text-2xl font-bold text-[var(--zalama-blue)]">Z</span>
        </div>
        <h2 className="text-3xl font-bold text-white mb-2">ZaLaMa</h2>
        <p className="text-white/80">
          {loading ? 'Vérification de l\'authentification...' : 'Redirection...'}
        </p>
        <div className="mt-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";

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

export default function FirebaseAuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // L'utilisateur est connecté, on obtient le token
        const token = await user.getIdToken();
        
        // Stocker le token dans un cookie pour que le middleware puisse le vérifier
        // Ceci est fait via une API route pour éviter les problèmes de CORS
        await fetch("/api/auth/session", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
        });
      } else {
        // L'utilisateur n'est pas connecté, supprimer le cookie
        await fetch("/api/auth/session", {
          method: "DELETE",
        });
        
        // Rediriger vers la page de connexion si on est sur une page protégée
        if (window.location.pathname.startsWith("/dashboard")) {
          router.push("/");
        }
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  return loading ? <AuthLoadingSkeleton /> : children;
} 
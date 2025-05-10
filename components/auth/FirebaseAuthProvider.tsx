"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";

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

  return loading ? <div>Chargement...</div> : children;
} 
// MIDDLEWARE TEMPORAIREMENT DÉSACTIVÉ POUR LE DÉVELOPPEMENT CRUD
// Décommentez le code ci-dessous pour réactiver la protection des routes

/*
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from '@supabase/supabase-js';

export async function middleware(request: NextRequest) {
  // Configuration Supabase - Variables définies directement
  const supabaseUrl = 'https://mspmrzlqhwpdkkburjiw.supabase.co';
  const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zcG1yemxxaHdwZGtrYnVyaml3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3ODcyNTgsImV4cCI6MjA2NjM2MzI1OH0.zr-TRpKjGJjW0nRtsyPcCLy4Us-c5tOGX71k5_3JJd0';
  
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false, // Désactiver la persistance côté serveur
    },
  });

  try {
    // Récupérer la session depuis les cookies Supabase
    const { data: { session }, error } = await supabase.auth.getSession();

    // Si l'utilisateur n'est pas connecté et essaie d'accéder au dashboard
    if (!session && request.nextUrl.pathname.startsWith("/dashboard")) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Si l'utilisateur est connecté et essaie d'accéder à la page de connexion
    if (session && request.nextUrl.pathname === "/login") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // Si l'utilisateur est connecté et essaie d'accéder à la page d'accueil
    if (session && request.nextUrl.pathname === "/") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return NextResponse.next();
  } catch (error) {
    console.error('Erreur middleware:', error);
    
    // En cas d'erreur, rediriger vers la page de connexion pour les routes protégées
    if (request.nextUrl.pathname.startsWith("/dashboard")) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    
    return NextResponse.next();
  }
}

export const config = {
  matcher: ["/", "/login", "/dashboard/:path*"],
};
*/

// Middleware temporairement désactivé - toutes les routes sont accessibles
export function middleware() {
  return;
}

export const config = {
  matcher: [],
}; 
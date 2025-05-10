import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { cookies } from "next/headers";

export function middleware(request: NextRequest) {
  // Vérifier si l'utilisateur a un cookie de session Firebase
  const session = request.cookies.get("session");

  // Si l'utilisateur n'est pas connecté et essaie d'accéder au dashboard
  if (!session && request.nextUrl.pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Si l'utilisateur est connecté et essaie d'accéder à la page de connexion
  if (session && request.nextUrl.pathname === "/") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/dashboard/:path*"],
}; 
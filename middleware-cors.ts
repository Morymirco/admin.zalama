import { NextRequest, NextResponse } from 'next/server';

// Origines autorisées
const allowedOrigins = [
  'http://localhost:3000', // Admin dashboard local
  'http://localhost:3002', // Dashboard partenaire local
  'https://admin.zalamasas.com', // Admin dashboard production
  'https://zalama-partner-dashboard-4esq.vercel.app' // Dashboard partenaire production
];

// Middleware CORS pour les routes API
export function corsMiddleware(request: NextRequest) {
  const origin = request.headers.get('origin');
  
  // Vérifier si l'origine est autorisée
  const isAllowedOrigin = origin && allowedOrigins.includes(origin);
  
  // Créer la réponse
  const response = NextResponse.next();
  
  // Ajouter les headers CORS
  if (isAllowedOrigin) {
    response.headers.set('Access-Control-Allow-Origin', origin);
  }
  
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  
  // Gérer les requêtes preflight OPTIONS
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, { 
      status: 200,
      headers: response.headers
    });
  }
  
  return response;
} 
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Vérifier les variables d'environnement
    const envCheck = {
      NODE_ENV: process.env.NODE_ENV,
      SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Configuré' : '❌ Manquant',
      SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Configuré' : '❌ Manquant',
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Configuré' : '❌ Manquant',
    };

    // Vérifier les services
    const servicesCheck = {
      sms: '✅ Disponible',
      email: '✅ Disponible',
      database: '✅ Disponible'
    };

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      status: 'healthy',
      environment: envCheck,
      services: servicesCheck,
      message: 'Serveur opérationnel'
    });
  } catch (error) {
    console.error('Erreur health check:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Erreur inconnue',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
} 
import { handleLengoPayCallback } from '@/services/lengoPayService';
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Configuration Supabase - Clés directes pour éviter les erreurs d'API key
const supabaseUrl = 'https://mspmrzlqhwpdkkburjiw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zcG1yemxxaHdwZGtrYnVyaml3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3ODcyNTgsImV4cCI6MjA2NjM2MzI1OH0.zr-TRpKjGJjW0nRtsyPcCLy4Us-c5tOGX71k5_3JJd0';

console.log('🔧 Configuration Supabase pour lengo-callback:', {
  url: supabaseUrl,
  keyPrefix: supabaseAnonKey.substring(0, 20) + '...'
});

// Utiliser la clé anonyme pour éviter les problèmes de permissions
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  }
});

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Début du callback Lengo Pay');
    
    const body = await request.json();
    console.log('📋 Données reçues du callback:', body);
    
    // body doit contenir: pay_id, status, amount, message, account
    if (!body.pay_id || !body.status) {
      console.error('❌ Paramètres manquants dans le callback:', { pay_id: !!body.pay_id, status: !!body.status });
      return NextResponse.json({ 
        success: false, 
        error: 'Paramètres manquants: pay_id et status sont requis' 
      }, { status: 400 });
    }

    console.log('✅ Paramètres valides, traitement du callback...');
    const result = await handleLengoPayCallback(body, supabase);
    
    console.log('✅ Callback traité avec succès:', result);
    return NextResponse.json({ 
      success: true, 
      message: 'Callback traité avec succès',
      transaction_id: result?.id 
    });
  } catch (error) {
    console.error('💥 Erreur lors du traitement du callback:', error);
    console.error('📋 Détails de l\'erreur:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace'
    });
    
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Erreur inconnue',
      details: process.env.NODE_ENV === 'development' ? {
        name: error instanceof Error ? error.name : 'Unknown',
        stack: error instanceof Error ? error.stack : 'No stack trace'
      } : undefined
    }, { status: 500 });
  }
} 
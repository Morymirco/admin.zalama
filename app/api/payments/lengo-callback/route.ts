import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { handleLengoPayCallback } from '@/services/lengoPayService';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mspmrzlqhwpdkkburjiw.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

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
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mspmrzlqhwpdkkburjiw.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY is required');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Désactivation du trigger de notification sur transactions');
    
    // Vérifier d'abord si le trigger existe
    const { data: existingTriggers, error: checkError } = await supabase
      .from('information_schema.triggers')
      .select('trigger_name, event_manipulation, event_object_table')
      .eq('event_object_table', 'transactions')
      .eq('trigger_name', 'trigger_transaction_created');
    
    if (checkError) {
      console.error('❌ Erreur lors de la vérification des triggers:', checkError);
    } else {
      console.log('📋 Triggers existants sur transactions:', existingTriggers);
    }
    
    // Note: Supabase ne permet pas d'exécuter des commandes DDL via l'API REST
    // Il faut utiliser le SQL Editor de Supabase ou pgAdmin
    
    console.log('⚠️  Impossible de supprimer le trigger via l\'API REST');
    console.log('📝 Veuillez exécuter manuellement dans Supabase SQL Editor:');
    console.log('   DROP TRIGGER IF EXISTS trigger_transaction_created ON transactions;');
    
    return NextResponse.json({
      success: false,
      message: 'Impossible de supprimer le trigger via l\'API REST',
      instruction: 'Exécutez manuellement dans Supabase SQL Editor: DROP TRIGGER IF EXISTS trigger_transaction_created ON transactions;',
      existing_triggers: existingTriggers || []
    });
    
  } catch (error) {
    console.error('💥 Erreur générale:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 });
  }
} 
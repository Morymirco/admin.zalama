import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mspmrzlqhwpdkkburjiw.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zcG1yemxxaHdwZGtrYnVyaml3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3ODcyNTgsImV4cCI6MjA2NjM2MzI1OH0.6sIgEDZIP1fkUoxdPJYfzKHU1B_SfN6Hui6v_FV6yzw';

// Utiliser la clé anonyme pour éviter les problèmes de permissions
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function GET(request: NextRequest) {
  try {
    console.log('📊 Récupération des transactions');
    
    const { searchParams } = new URL(request.url);
    const checkStatus = searchParams.get('check_status') === 'true';
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    
    // Récupérer les transactions
    const { data: transactions, error } = await supabase
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (error) {
      console.error('❌ Erreur récupération transactions:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
    
    console.log(`✅ ${transactions.length} transactions récupérées`);
    
    // Si on veut vérifier le statut, on le fait pour les transactions en attente
    if (checkStatus) {
      console.log('🔍 Vérification du statut des transactions en attente...');
      
      const pendingTransactions = transactions.filter(t => t.statut === 'EN_ATTENTE');
      console.log(`📋 ${pendingTransactions.length} transactions en attente à vérifier`);
      
      for (const transaction of pendingTransactions) {
        try {
          // Appeler l'API de vérification du statut
          const statusResponse = await fetch(`${request.nextUrl.origin}/api/payments/lengo-status`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              pay_id: transaction.numero_transaction
            })
          });
          
          if (statusResponse.ok) {
            const statusResult = await statusResponse.json();
            console.log(`✅ Statut vérifié pour ${transaction.numero_transaction}: ${statusResult.lengo_status}`);
          } else {
            console.log(`⚠️ Impossible de vérifier le statut pour ${transaction.numero_transaction}`);
          }
        } catch (statusError) {
          console.error(`❌ Erreur vérification statut pour ${transaction.numero_transaction}:`, statusError);
        }
      }
      
      // Récupérer les transactions mises à jour
      const { data: updatedTransactions, error: updateError } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);
      
      if (updateError) {
        console.error('❌ Erreur récupération transactions mises à jour:', updateError);
      } else {
        console.log('✅ Transactions mises à jour récupérées');
        return NextResponse.json({
          success: true,
          transactions: updatedTransactions,
          total: updatedTransactions.length,
          check_status: checkStatus
        });
      }
    }
    
    return NextResponse.json({
      success: true,
      transactions: transactions,
      total: transactions.length,
      check_status: checkStatus
    });
    
  } catch (error) {
    console.error('💥 Erreur générale:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Vérification du statut d\'une transaction spécifique');
    
    const body = await request.json();
    const { pay_id } = body;
    
    if (!pay_id) {
      return NextResponse.json({ success: false, error: 'pay_id requis' }, { status: 400 });
    }
    
    // Appeler l'API de vérification du statut
    const statusResponse = await fetch(`${request.nextUrl.origin}/api/payments/lengo-status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ pay_id })
    });
    
    const statusResult = await statusResponse.json();
    
    if (!statusResponse.ok) {
      return NextResponse.json(statusResult, { status: statusResponse.status });
    }
    
    return NextResponse.json(statusResult);
    
  } catch (error) {
    console.error('💥 Erreur générale:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 });
  }
} 
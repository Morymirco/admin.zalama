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
    console.log('🔄 Début de la synchronisation des statuts de paiement');
    
    const body = await request.json();
    console.log('📋 Body reçu:', body);
    
    // body peut contenir: requestId (optionnel) - si non fourni, synchronise toutes les demandes
    const { requestId } = body;

    let query = supabase
      .from('transactions')
      .select(`
        id,
        numero_transaction,
        statut,
        demande_avance_id,
        employe_id,
        montant,
        date_transaction
      `)
      .eq('statut', 'EFFECTUEE')
      .not('demande_avance_id', 'is', null);

    if (requestId) {
      query = query.eq('demande_avance_id', requestId);
    }

    const { data: transactions, error: transactionsError } = await query;

    if (transactionsError) {
      console.error('❌ Erreur récupération transactions:', transactionsError);
      return NextResponse.json({ 
        success: false, 
        error: 'Erreur DB: ' + transactionsError.message 
      }, { status: 500 });
    }

    console.log(`📊 ${transactions.length} transactions EFFECTUEE trouvées`);

    let updatedCount = 0;
    const errors: string[] = [];

    for (const transaction of transactions) {
      try {
        console.log(`🔄 Synchronisation pour la demande ${transaction.demande_avance_id}`);
        
        // Vérifier l'état actuel de la demande
        const { data: currentDemand, error: fetchError } = await supabase
          .from('salary_advance_requests')
          .select('id, statut, numero_reception')
          .eq('id', transaction.demande_avance_id)
          .single();

        if (fetchError) {
          console.error(`❌ Erreur récupération demande ${transaction.demande_avance_id}:`, fetchError);
          errors.push(`Erreur récupération demande ${transaction.demande_avance_id}: ${fetchError.message}`);
          continue;
        }

        console.log(`📋 État actuel de la demande ${transaction.demande_avance_id}:`, currentDemand);

        // Si la demande n'a pas de numero_reception, la mettre à jour
        if (!currentDemand.numero_reception) {
          const { error: updateError } = await supabase
            .from('salary_advance_requests')
            .update({ 
              statut: 'Validé',
              date_validation: transaction.date_transaction || new Date().toISOString(),
              numero_reception: transaction.numero_transaction
            })
            .eq('id', transaction.demande_avance_id);

          if (updateError) {
            console.error(`❌ Erreur mise à jour demande ${transaction.demande_avance_id}:`, updateError);
            errors.push(`Erreur mise à jour demande ${transaction.demande_avance_id}: ${updateError.message}`);
          } else {
            console.log(`✅ Demande ${transaction.demande_avance_id} mise à jour avec succès`);
            updatedCount++;
          }
        } else {
          console.log(`ℹ️ Demande ${transaction.demande_avance_id} déjà synchronisée`);
        }
      } catch (error) {
        console.error(`❌ Erreur traitement transaction ${transaction.id}:`, error);
        errors.push(`Erreur traitement transaction ${transaction.id}: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
      }
    }

    console.log('🎉 Synchronisation terminée');
    console.log(`  - Demandes mises à jour: ${updatedCount}`);
    console.log(`  - Erreurs: ${errors.length}`);

    return NextResponse.json({
      success: true,
      message: 'Synchronisation terminée',
      updated: updatedCount,
      total_transactions: transactions.length,
      errors: errors.length > 0 ? errors : undefined
    });
    
  } catch (error) {
    console.error('💥 Erreur générale dans la synchronisation:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 });
  }
} 
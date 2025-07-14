import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mspmrzlqhwpdkkburjiw.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zcG1yemxxaHdwZGtrYnVyaml3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3ODcyNTgsImV4cCI6MjA2NjM2MzI1OH0.6sIgEDZIP1fkUoxdPJYfzKHU1B_SfN6Hui6v_FV6yzw';

// Utiliser seulement la clé anonyme pour éviter les problèmes de permissions
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Début de la synchronisation des statuts de paiement');
    
    // Vérification de sécurité basique
    const origin = request.headers.get('origin');
    
    // Autoriser seulement les appels depuis l'application
    if (origin && !origin.includes('vercel.app') && !origin.includes('localhost')) {
      console.warn('⚠️ Tentative d\'accès non autorisée depuis:', origin);
      return NextResponse.json({ 
        success: false, 
        error: 'Accès non autorisé' 
      }, { status: 403 });
    }
    
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
            
            // Si c'est une erreur de permissions, informer l'utilisateur
            if (updateError.message.includes('permission') || updateError.message.includes('policy')) {
              errors.push(`Permissions insuffisantes pour mettre à jour la demande ${transaction.demande_avance_id}. Contactez l'administrateur.`);
            } else {
              errors.push(`Erreur mise à jour demande ${transaction.demande_avance_id}: ${updateError.message}`);
            }
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
      errors: errors.length > 0 ? errors : undefined,
      note: 'Utilisation de la clé anonyme - certaines opérations peuvent être limitées'
    });
    
  } catch (error) {
    console.error('💥 Erreur générale dans la synchronisation:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 });
  }
} 
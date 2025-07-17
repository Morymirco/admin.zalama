import { lengoPayStatus, LengoPayStatusParams } from '@/services/lengoPayService';
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mspmrzlqhwpdkkburjiw.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zcG1yemxxaHdwZGtrYnVyaml3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3ODcyNTgsImV4cCI6MjA2NjM2MzI1OH0.6sIgEDZIP1fkUoxdPJYfzKHU1B_SfN6Hui6v_FV6yzw';
const LENGO_SITE_ID = process.env.LENGO_SITE_ID;

// Utiliser la clé anonyme pour éviter les problèmes de permissions
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Fonction pour mapper le statut LengoPay vers notre statut de transaction
function mapLengoStatusToTransactionStatus(lengoStatus: string): 'EFFECTUEE' | 'ANNULEE' {
  switch (lengoStatus?.toUpperCase()) {
    case 'SUCCESS':
      return 'EFFECTUEE';
    case 'FAILED':
    case 'CANCELLED':
    case 'PENDING':
    case 'INITIATED':
    default:
      return 'ANNULEE';
  }
}

export async function POST(request: NextRequest) {
  const requestId = Math.random().toString(36).substring(7);
  console.log(`🔄 [${requestId}] SYNCHRONISATION DES STATUTS DE TRANSACTION`);

  try {
    // 1. Récupérer toutes les transactions avec un statut "EFFECTUEE" ou des IDs de paiement
    console.log('📋 Récupération des transactions à synchroniser...');
    
    const { data: transactions, error: transactionsError } = await supabase
      .from('transactions')
      .select(`
        id,
        numero_transaction,
        statut,
        montant,
        demande_avance_id,
        employe_id,
        entreprise_id,
        date_transaction,
        created_at
      `)
      .not('numero_transaction', 'is', null)
      .order('created_at', { ascending: false });

    if (transactionsError) {
      console.error('❌ Erreur récupération transactions:', transactionsError);
      return NextResponse.json({ 
        success: false, 
        error: 'Erreur DB: ' + transactionsError.message 
      }, { status: 500 });
    }

    console.log(`📊 ${transactions.length} transactions trouvées avec numero_transaction`);

    let updatedCount = 0;
    const updatedTransactions: string[] = [];
    const errors: string[] = [];

    for (const transaction of transactions) {
      try {
        console.log(`🔍 Vérification du statut pour transaction: ${transaction.numero_transaction}`);
        
        // Vérifier le statut auprès de LengoPay
        const statusParams: LengoPayStatusParams = {
          site_id: LENGO_SITE_ID || '',
          pay_id: transaction.numero_transaction
        };
        
        const statusResult = await lengoPayStatus(statusParams);
        console.log(`📊 Statut LengoPay pour ${transaction.numero_transaction}:`, statusResult);
        
        if (!statusResult || !statusResult.status) {
          console.log(`⚠️ Statut non disponible pour ${transaction.numero_transaction}, passage au suivant`);
          continue;
        }

        // Mapper le statut LengoPay vers notre enum
        const newStatus = mapLengoStatusToTransactionStatus(statusResult.status);
        console.log(`🔄 Mapping statut: ${statusResult.status} → ${newStatus}`);
        
        // Mettre à jour seulement si le statut a changé
        if (transaction.statut !== newStatus) {
          console.log(`🔄 Mise à jour du statut: ${transaction.statut} → ${newStatus}`);
          
          const { error: updateError } = await supabase
            .from('transactions')
            .update({
              statut: newStatus,
              date_transaction: statusResult.status.toUpperCase() === 'SUCCESS' ? 
                (statusResult.date ? new Date(statusResult.date).toISOString() : new Date().toISOString()) : 
                transaction.date_transaction,
              updated_at: new Date().toISOString()
            })
            .eq('id', transaction.id);

          if (updateError) {
            console.error(`❌ Erreur mise à jour transaction ${transaction.numero_transaction}:`, updateError);
            errors.push(`Erreur mise à jour transaction ${transaction.numero_transaction}: ${updateError.message}`);
          } else {
            console.log(`✅ Transaction ${transaction.numero_transaction} mise à jour avec succès`);
            updatedCount++;
            updatedTransactions.push(transaction.numero_transaction);
          }
        } else {
          console.log(`ℹ️ Transaction ${transaction.numero_transaction} déjà à jour (${transaction.statut})`);
        }

        // Si la transaction est maintenant EFFECTUEE et liée à une demande d'avance,
        // mettre à jour le statut de la demande
        if (newStatus === 'EFFECTUEE' && transaction.demande_avance_id) {
          console.log(`🔄 Mise à jour du statut de la demande d'avance: ${transaction.demande_avance_id}`);
          
          const { error: demandUpdateError } = await supabase
            .from('salary_advance_requests')
            .update({ 
              statut: 'Validé', // Utiliser le statut correct de l'enum transaction_status
              date_validation: new Date().toISOString(),
              numero_reception: transaction.numero_transaction
            })
            .eq('id', transaction.demande_avance_id);

          if (demandUpdateError) {
            console.error(`⚠️ Erreur mise à jour demande ${transaction.demande_avance_id}:`, demandUpdateError);
            errors.push(`Erreur mise à jour demande ${transaction.demande_avance_id}: ${demandUpdateError.message}`);
          } else {
            console.log(`✅ Demande d'avance ${transaction.demande_avance_id} mise à jour avec succès`);
          }
        }

      } catch (error) {
        console.error(`❌ Erreur traitement transaction ${transaction.numero_transaction}:`, error);
        errors.push(`Erreur traitement ${transaction.numero_transaction}: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
      }
    }

    console.log('🎉 Synchronisation terminée');
    console.log(`  - Transactions mises à jour: ${updatedCount}`);
    console.log(`  - Erreurs: ${errors.length}`);

    return NextResponse.json({
      success: true,
      message: 'Synchronisation terminée',
      updated: updatedCount,
      total_transactions: transactions.length,
      updated_transactions: updatedTransactions,
      errors: errors.length > 0 ? errors : undefined
    });
    
  } catch (error) {
    console.error(`❌ [${requestId}] Erreur générale:`, error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 });
  }
} 
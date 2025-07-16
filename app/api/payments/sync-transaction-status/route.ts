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
  try {
    console.log('🔄 Début de la synchronisation du statut des transactions');
    
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
    
    // body peut contenir: requestId (optionnel) - si non fourni, synchronise toutes les transactions
    const { requestId } = body;

    // Récupérer les transactions à synchroniser
    let query = supabase
      .from('transactions')
      .select(`
        id,
        numero_transaction,
        statut,
        demande_avance_id,
        employe_id,
        entreprise_id,
        montant,
        date_transaction,
        date_creation,
        description
      `);

    if (requestId) {
      // Si un requestId est fourni, récupérer seulement les transactions liées à cette demande
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

    console.log(`📊 ${transactions.length} transactions trouvées pour synchronisation`);

    if (transactions.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'Aucune transaction à synchroniser',
        updated: 0,
        total_transactions: 0
      });
    }

    let updatedCount = 0;
    const errors: string[] = [];
    const updatedTransactions: any[] = [];

    for (const transaction of transactions) {
      try {
        console.log(`🔄 Synchronisation pour la transaction ${transaction.numero_transaction}`);
        
        // Vérifier le statut via LengoPay
        const statusParams: LengoPayStatusParams = {
          pay_id: transaction.numero_transaction,
          websiteid: LENGO_SITE_ID || '',
        };

        console.log('🔍 Paramètres de vérification:', statusParams);
        
        const statusResult = await lengoPayStatus(statusParams);
        console.log('✅ Réponse LengoPay:', statusResult);

        if (!statusResult || !statusResult.status) {
          console.warn(`⚠️ Pas de statut disponible pour ${transaction.numero_transaction}`);
          errors.push(`Pas de statut disponible pour ${transaction.numero_transaction}`);
          continue;
        }

        // Mapper le statut LengoPay vers notre statut
        const newStatus = mapLengoStatusToTransactionStatus(statusResult.status);
        const currentStatus = transaction.statut;

        console.log(`📊 Statuts: LengoPay=${statusResult.status}, Actuel=${currentStatus}, Nouveau=${newStatus}`);

        // Mettre à jour seulement si le statut a changé
        if (currentStatus !== newStatus) {
          const updateData: any = {
            statut: newStatus,
            updated_at: new Date().toISOString()
          };

          // Si la transaction est maintenant EFFECTUEE, mettre à jour la date de transaction
          if (newStatus === 'EFFECTUEE' && !transaction.date_transaction) {
            updateData.date_transaction = statusResult.date ? new Date(statusResult.date).toISOString() : new Date().toISOString();
          }

          // Mettre à jour le message de callback si disponible
          if (statusResult.message) {
            updateData.message_callback = statusResult.message;
          }

          const { data: updatedTransaction, error: updateError } = await supabase
            .from('transactions')
            .update(updateData)
            .eq('id', transaction.id)
            .select()
            .single();

          if (updateError) {
            console.error(`❌ Erreur mise à jour transaction ${transaction.numero_transaction}:`, updateError);
            errors.push(`Erreur mise à jour ${transaction.numero_transaction}: ${updateError.message}`);
          } else {
            console.log(`✅ Transaction ${transaction.numero_transaction} mise à jour: ${currentStatus} → ${newStatus}`);
            updatedCount++;
            updatedTransactions.push(updatedTransaction);
          }
        } else {
          console.log(`ℹ️ Transaction ${transaction.numero_transaction} déjà à jour (${currentStatus})`);
        }

        // Si la transaction est maintenant EFFECTUEE et liée à une demande d'avance,
        // mettre à jour le statut de la demande
        if (newStatus === 'EFFECTUEE' && transaction.demande_avance_id) {
          console.log(`🔄 Mise à jour du statut de la demande d'avance: ${transaction.demande_avance_id}`);
          
          const { error: demandUpdateError } = await supabase
            .from('salary_advance_requests')
            .update({ 
              statut: 'APPROUVE', // Utiliser le statut correct de l'enum
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
    console.error('💥 Erreur générale dans la synchronisation:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 });
  }
} 
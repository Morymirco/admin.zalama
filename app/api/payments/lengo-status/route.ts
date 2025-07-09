import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { lengoPayStatus, LengoPayStatusParams } from '@/services/lengoPayService';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mspmrzlqhwpdkkburjiw.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY is required');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const LENGO_SITE_ID = process.env.LENGO_SITE_ID;

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Début de la vérification du statut LengoPay');
    
    const body = await request.json();
    console.log('📋 Body reçu:', body);
    
    // body doit contenir: pay_id
    const { pay_id } = body;

    if (!pay_id) {
      console.error('❌ pay_id manquant');
      return NextResponse.json({ 
        success: false, 
        error: 'pay_id est requis' 
      }, { status: 400 });
    }

    console.log('🔧 Vérification des variables d\'environnement:');
    console.log('  - LENGO_SITE_ID:', LENGO_SITE_ID ? '✅ Présent' : '❌ Manquant');

    // Préparer les paramètres pour vérifier le statut
    const statusParams: LengoPayStatusParams = {
      pay_id: pay_id,
      websiteid: LENGO_SITE_ID || '',
    };

    console.log('🔍 Paramètres de vérification préparés:', statusParams);

    // Appel à Lengo Pay pour vérifier le statut
    console.log('🌐 Appel de l\'API Lengo Pay pour vérifier le statut...');
    const statusResult = await lengoPayStatus(statusParams);
    console.log('✅ Réponse statut Lengo Pay reçue:', statusResult);

    if (!statusResult.status) {
      console.error('❌ Erreur Lengo Pay:', statusResult);
      return NextResponse.json({ success: false, error: statusResult.message || 'Erreur Lengo Pay' }, { status: 502 });
    }

    // Mettre à jour le statut dans la base de données si nécessaire
    console.log('💾 Mise à jour du statut dans la base de données...');
    
    let dbStatus = 'EN_ATTENTE';
    let dateTransaction = null;
    
    // Mapper les statuts LengoPay vers nos statuts (enum transaction_statut)
    switch (statusResult.status.toUpperCase()) {
      case 'SUCCESS':
        dbStatus = 'EFFECTUEE';
        dateTransaction = statusResult.date ? new Date(statusResult.date).toISOString() : new Date().toISOString();
        break;
      case 'FAILED':
      case 'CANCELLED':
        dbStatus = 'ANNULEE';
        break;
      case 'PENDING':
      case 'INITIATED':
        dbStatus = 'ANNULEE'; // Pour les transactions en attente, on utilise ANNULEE par défaut
        break;
      default:
        dbStatus = 'ANNULEE';
    }

    console.log('🔄 Mapping des statuts:', {
      lengo_status: statusResult.status,
      mapped_db_status: dbStatus,
      date_transaction: dateTransaction
    });

    // Mettre à jour la transaction dans la base de données
    const { data: updatedTransaction, error: updateError } = await supabase
      .from('transactions')
      .update({
        statut: dbStatus,
        date_transaction: dateTransaction,
        updated_at: new Date().toISOString()
      })
      .eq('numero_transaction', pay_id)
      .select()
      .single();

    if (updateError) {
      console.error('❌ Erreur mise à jour transaction:', updateError);
      // Ne pas retourner d'erreur car le statut LengoPay est valide
    } else {
      console.log('✅ Transaction mise à jour avec succès:', updatedTransaction);
      console.log('🔍 Détails de la transaction:', {
        demande_avance_id: updatedTransaction?.demande_avance_id,
        dbStatus,
        pay_id
      });
      
      // Si la transaction est liée à une demande d'avance et que le paiement est réussi
      if (updatedTransaction?.demande_avance_id && dbStatus === 'EFFECTUEE') {
        console.log('🔄 Mise à jour du statut de la demande d\'avance:', updatedTransaction.demande_avance_id);
        
        // Vérifier d'abord l'état actuel de la demande
        const { data: currentDemand, error: fetchError } = await supabase
          .from('salary_advance_requests')
          .select('id, statut, numero_reception')
          .eq('id', updatedTransaction.demande_avance_id)
          .single();

        if (fetchError) {
          console.error('⚠️ Erreur lors de la récupération de la demande:', fetchError);
        } else {
          console.log('📋 État actuel de la demande:', currentDemand);
        }
        
        const { error: demandUpdateError } = await supabase
          .from('salary_advance_requests')
          .update({ 
            statut: 'Validé',
            date_validation: new Date().toISOString(),
            numero_reception: pay_id
          })
          .eq('id', updatedTransaction.demande_avance_id);

        if (demandUpdateError) {
          console.error('⚠️ Erreur lors de la mise à jour du statut de la demande:', demandUpdateError);
        } else {
          console.log('✅ Statut de la demande d\'avance mis à jour avec succès');
        }
      } else {
        console.log('⚠️ Pas de mise à jour de la demande d\'avance:', {
          hasDemandeId: !!updatedTransaction?.demande_avance_id,
          dbStatus,
          isEffectuee: dbStatus === 'EFFECTUEE'
        });
      }
    }

    console.log('🎉 Vérification du statut terminée avec succès');

    return NextResponse.json({
      success: true,
      pay_id: pay_id,
      lengo_status: statusResult.status,
      db_status: dbStatus,
      transaction: updatedTransaction,
      amount: statusResult.amount,
      account: statusResult.account,
      date: statusResult.date,
      details: statusResult
    });
  } catch (error) {
    console.error('💥 Erreur générale dans la vérification du statut:', error);
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
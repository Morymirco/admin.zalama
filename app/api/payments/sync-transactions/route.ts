import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mspmrzlqhwpdkkburjiw.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zcG1yemxxaHdwZGtrYnVyaml3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3ODcyNTgsImV4cCI6MjA2NjM2MzI1OH0.6sIgEDZIP1fkUoxdPJYfzKHU1B_SfN6Hui6v_FV6yzw';
const LENGO_API_KEY = process.env.LENGO_API_KEY;
const LENGO_SITE_ID = process.env.LENGO_SITE_ID;

if (!LENGO_API_KEY || !LENGO_SITE_ID) {
  throw new Error('LENGO_API_KEY and LENGO_SITE_ID are required');
}

// Utiliser la clé anonyme pour éviter les problèmes de permissions
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Fonction pour mapper le statut LengoPay vers notre statut
function mapLengoStatus(lengoStatus: string): string {
  switch (lengoStatus?.toUpperCase()) {
    case 'SUCCESS':
      return 'REUSSI';
    case 'FAILED':
      return 'ECHOUE';
    case 'PENDING':
      return 'EN_ATTENTE';
    default:
      return 'EN_ATTENTE';
  }
}

// Fonction pour mapper le gateway LengoPay vers l'enum methode_paiement
function mapGatewayToMethodePaiement(gateway: string): string {
  if (!gateway) return 'ESPECES';
  const g = gateway.trim().toLowerCase();
  if (g.includes('orange')) return 'MOBILE_MONEY';
  if (g.includes('mobile')) return 'MOBILE_MONEY';
  if (g.includes('mtn')) return 'MOBILE_MONEY';
  if (g.includes('virement')) return 'VIREMENT_BANCAIRE';
  if (g.includes('cheque')) return 'CHEQUE';
  if (g.includes('cash') || g.includes('especes')) return 'ESPECES';
  return 'ESPECES'; // fallback
}

// Fonction pour mapper notre statut interne vers l'enum transaction_statut
function mapToTransactionStatut(status: string): string {
  if (status === 'REUSSI') return 'EFFECTUEE';
  return 'ANNULEE';
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Début de la synchronisation des transactions depuis LengoPay');
    
    // Récupérer les transactions depuis LengoPay
    console.log('📡 Appel de l\'API LengoPay...');
    const lengoResponse = await fetch('https://portal.lengopay.com/api/v1/cashin/all-transactions', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${LENGO_API_KEY}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        websiteid: LENGO_SITE_ID
      })
    });
    
    if (!lengoResponse.ok) {
      const errorText = await lengoResponse.text();
      console.error('❌ Erreur API LengoPay:', errorText);
      return NextResponse.json({ 
        success: false, 
        error: `Erreur LengoPay: ${lengoResponse.status} ${lengoResponse.statusText}` 
      }, { status: 502 });
    }
    
    const lengoTransactions = await lengoResponse.json();
    console.log(`✅ ${lengoTransactions.length} transactions récupérées depuis LengoPay`);
    
    if (lengoTransactions.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'Aucune transaction trouvée dans LengoPay',
        synced: 0,
        updated: 0
      });
    }
    
    // Récupérer les transactions existantes pour éviter les doublons
    const { data: existingTransactions, error: existingError } = await supabase
      .from('transactions')
      .select('numero_transaction, statut, date_transaction');
    
    if (existingError) {
      console.error('❌ Erreur récupération transactions existantes:', existingError);
      return NextResponse.json({ 
        success: false, 
        error: 'Erreur DB: ' + existingError.message 
      }, { status: 500 });
    }
    
    const existingPayIds = new Set(existingTransactions.map(tx => tx.numero_transaction));
    console.log(`📊 ${existingTransactions.length} transactions existantes trouvées`);
    
    let synced = 0;
    let updated = 0;
    const errors: string[] = [];
    
    // Traiter chaque transaction LengoPay
    for (const lengoTx of lengoTransactions) {
      try {
        const payId = lengoTx.pay_id;
        const exists = existingPayIds.has(payId);
        
        if (exists) {
          // Mettre à jour la transaction existante si le statut a changé
          const existingTx = existingTransactions.find(tx => tx.numero_transaction === payId);
          const newStatus = mapLengoStatus(lengoTx.status);
          
          if (existingTx && existingTx.statut !== newStatus) {
            const updateData: any = {
              statut: newStatus
            };
            
            // Si la transaction est réussie, mettre à jour la date de transaction
            if (newStatus === 'REUSSI' && !existingTx.date_transaction) {
              updateData.date_transaction = lengoTx.date;
            }
            
            const { error: updateError } = await supabase
              .from('transactions')
              .update(updateData)
              .eq('numero_transaction', payId);
            
            if (updateError) {
              console.error(`❌ Erreur mise à jour ${payId}:`, updateError);
              errors.push(`Erreur mise à jour ${payId}: ${updateError.message}`);
            } else {
              console.log(`✅ Transaction ${payId} mise à jour: ${existingTx.statut} → ${newStatus}`);
              updated++;
            }
          }
        } else {
          // Insérer une nouvelle transaction
          const transactionData = {
            montant: parseFloat(lengoTx.amount),
            numero_transaction: payId,
            methode_paiement: mapGatewayToMethodePaiement(lengoTx.gateway),
            numero_compte: lengoTx.account?.toString() || '',
            description: `Transaction synchronisée depuis LengoPay - ${lengoTx.gateway}`,
            entreprise_id: null, // On ne peut pas déterminer le partenaire depuis LengoPay
            statut: mapToTransactionStatut(mapLengoStatus(lengoTx.status)),
            date_creation: lengoTx.date,
            date_transaction: lengoTx.status?.toUpperCase() === 'SUCCESS' ? lengoTx.date : null,
          };
          
          const { error: insertError } = await supabase
            .from('transactions')
            .insert([transactionData]);
          
          if (insertError) {
            console.error(`❌ Erreur insertion ${payId}:`, insertError);
            errors.push(`Erreur insertion ${payId}: ${insertError.message}`);
          } else {
            console.log(`✅ Nouvelle transaction ${payId} synchronisée`);
            synced++;
          }
        }
      } catch (txError) {
        console.error(`❌ Erreur traitement transaction:`, txError);
        errors.push(`Erreur traitement: ${txError instanceof Error ? txError.message : 'Erreur inconnue'}`);
      }
    }
    
    console.log('🎉 Synchronisation terminée');
    console.log(`  - Nouvelles transactions: ${synced}`);
    console.log(`  - Transactions mises à jour: ${updated}`);
    console.log(`  - Erreurs: ${errors.length}`);
    
    return NextResponse.json({
      success: true,
      message: 'Synchronisation terminée',
      synced,
      updated,
      errors: errors.length > 0 ? errors : undefined,
      total_lengo: lengoTransactions.length
    });
    
  } catch (error) {
    console.error('💥 Erreur générale dans la synchronisation:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 });
  }
} 
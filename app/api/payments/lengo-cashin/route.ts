  import { lengoPayCashin, LengoPayCashinParams } from '@/services/lengoPayService';
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Configuration Supabase - Utiliser les mêmes clés que les autres services qui fonctionnent
const supabaseUrl = 'https://mspmrzlqhwpdkkburjiw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zcG1yemxxaHdwZGtrYnVyaml3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3ODcyNTgsImV4cCI6MjA2NjM2MzI1OH0.zr-TRpKjGJjW0nRtsyPcCLy4Us-c5tOGX71k5_3JJd0';

// Utiliser la clé anonyme pour éviter les problèmes de permissions
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Configuration directe avec les valeurs fournies
const LENGO_SITE_ID = process.env.LENGO_SITE_ID || 'ozazlahgzpntmYAG';
const LENGO_CALLBACK_URL = process.env.LENGO_CALLBACK_URL || 'https://admin.zalamasas.com/api/payments/lengo-callback';

// Fonction pour normaliser le numéro de téléphone selon la doc LengoPay
function normalizePhone(phone: string): string {
  // Garde uniquement les chiffres
  let p = phone.replace(/[^0-9]/g, '');
  
  // Si le numéro commence par 224 et fait 12 chiffres, on enlève le préfixe
  if (p.startsWith('224') && p.length === 12) {
    p = p.slice(3);
  }
  
  // On ne garde que les 9 derniers chiffres si jamais il y a un préfixe
  if (p.length > 9) {
    p = p.slice(-9);
  }
  
  return p;
}

// Fonction pour mapper le type_account LengoPay vers l'enum methode_paiement
function mapTypeAccountToMethodePaiement(typeAccount: string): string {
  if (!typeAccount) return 'MOBILE_MONEY';
  const type = typeAccount.trim().toLowerCase();
  
  // Mapping des types de compte LengoPay vers nos méthodes de paiement
  if (type.includes('om') || type.includes('orange')) return 'MOBILE_MONEY';
  if (type.includes('mtn') || type.includes('mobile')) return 'MOBILE_MONEY';
  if (type.includes('virement') || type.includes('bank')) return 'VIREMENT_BANCAIRE';
  if (type.includes('cheque')) return 'CHEQUE';
  if (type.includes('cash') || type.includes('especes')) return 'ESPECES';
  
  // Par défaut, considérer comme mobile money
  return 'MOBILE_MONEY';
}

// Fonction pour mapper le statut LengoPay vers l'enum transaction_statut
function mapLengoStatusToTransactionStatut(lengoStatus: string): string {
  if (!lengoStatus) return 'ANNULEE';
  const status = lengoStatus.trim().toUpperCase();
  
  // Si le statut est SUCCESS, la transaction est EFFECTUEE
  if (status === 'SUCCESS') return 'EFFECTUEE';
  
  // Pour tous les autres statuts (PENDING, FAILED, etc.), on considère comme ANNULEE
  // La transaction sera mise à jour plus tard quand le statut changera
  return 'ANNULEE';
}

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Début de la route lengo-cashin');
    
    const body = await request.json();
    console.log('📋 Body reçu:', body);
    
    // body doit contenir: amount, phone, description, partnerId (optionnel), type_account (optionnel), requestId (optionnel), employeId (optionnel)
    const { amount, phone, description, partnerId, type_account, requestId, employeId } = body;

    if (!amount || !phone || !description) {
      console.error('❌ Paramètres manquants:', { amount, phone, description });
      return NextResponse.json({ 
        success: false, 
        error: 'Paramètres manquants: amount, phone, description sont requis' 
      }, { status: 400 });
    }

    // Vérifier s'il existe déjà une transaction pour cette demande
    if (requestId) {
      console.log('🔍 Vérification des transactions existantes pour la demande:', requestId);
      
      const { data: existingTransactions, error: checkError } = await supabase
        .from('transactions')
        .select('id, numero_transaction, statut, date_creation')
        .eq('demande_avance_id', requestId)
        .order('date_creation', { ascending: false });

      if (checkError) {
        console.error('❌ Erreur lors de la vérification des transactions existantes:', checkError);
      } else if (existingTransactions && existingTransactions.length > 0) {
        console.log('⚠️ Transactions existantes trouvées:', existingTransactions);
        
        // Vérifier s'il y a une transaction récente (moins de 5 minutes)
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        const recentTransaction = existingTransactions.find(t => 
          new Date(t.date_creation) > fiveMinutesAgo
        );

        if (recentTransaction) {
          console.log('❌ Transaction récente trouvée, éviter le doublon:', recentTransaction);
          return NextResponse.json({ 
            success: false, 
            error: 'Une transaction pour cette demande a déjà été initiée récemment. Veuillez attendre quelques minutes avant de réessayer.',
            existingTransaction: recentTransaction
          }, { status: 409 });
        }

        // Vérifier s'il y a une transaction réussie
        const successfulTransaction = existingTransactions.find(t => t.statut === 'EFFECTUEE');
        if (successfulTransaction) {
          console.log('❌ Transaction réussie déjà existante:', successfulTransaction);
          return NextResponse.json({ 
            success: false, 
            error: 'Cette demande a déjà été payée avec succès.',
            existingTransaction: successfulTransaction
          }, { status: 409 });
        }

        // Vérifier s'il y a une transaction annulée à mettre à jour
        const cancelledTransaction = existingTransactions.find(t => t.statut === 'ANNULEE');
        if (cancelledTransaction) {
          console.log('🔄 Transaction annulée trouvée, mise à jour au lieu de créer:', cancelledTransaction);
          
          // Mettre à jour la transaction existante au lieu d'en créer une nouvelle
          const { data: updatedTransaction, error: updateError } = await supabase
            .from('transactions')
            .update({
              statut: 'ANNULEE', // Utiliser ANNULEE au lieu de EN_ATTENTE
              date_creation: new Date().toISOString(),
              date_transaction: null
            })
            .eq('id', cancelledTransaction.id)
            .select()
            .single();

          if (updateError) {
            console.error('❌ Erreur mise à jour transaction:', updateError);
            return NextResponse.json({ success: false, error: 'Erreur DB: ' + updateError.message }, { status: 500 });
          }

          console.log('✅ Transaction mise à jour avec succès:', updatedTransaction);
          
          // Retourner la transaction mise à jour
          return NextResponse.json({
            success: true,
            pay_id: cancelledTransaction.numero_transaction, // Réutiliser l'ancien pay_id
            transaction: updatedTransaction,
            message: 'Transaction relancée avec succès',
            status: 'Request received successfully',
            note: 'Transaction annulée relancée'
          });
        }

        console.log('ℹ️ Transactions existantes mais anciennes ou échouées, continuer avec le nouveau paiement');
      }
    }

    // Normaliser le numéro de téléphone
    const normalizedPhone = normalizePhone(phone);
    console.log('📱 Numéro normalisé:', { original: phone, normalized: normalizedPhone });

    console.log('🔧 Vérification des variables d\'environnement:');
    console.log('  - LENGO_SITE_ID:', LENGO_SITE_ID ? '✅ Présent' : '❌ Manquant');
    console.log('  - LENGO_CALLBACK_URL:', LENGO_CALLBACK_URL ? '✅ Présent' : '❌ Manquant');
    console.log('  - SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅ Présent' : '❌ Manquant');

    // Préparer les paramètres pour Lengo Pay selon la doc officielle
    const lengoParams: LengoPayCashinParams = {
      amount: amount.toString(),
      currency: 'GNF',
      websiteid: LENGO_SITE_ID || '',
      type_account: type_account || 'lp-om-gn',
      account: normalizedPhone,
      callback_url: LENGO_CALLBACK_URL,
    };

    console.log('💳 Paramètres Lengo Pay préparés:', { 
      ...lengoParams, 
      description, 
      partnerId,
      requestId,
      employeId,
      amount: lengoParams.amount + ' ' + lengoParams.currency,
      originalPhone: phone,
      normalizedPhone: normalizedPhone
    });

    // Appel à Lengo Pay
    console.log('🌐 Appel de l\'API Lengo Pay...');
    const lengoResult = await lengoPayCashin(lengoParams);
    console.log('✅ Réponse Lengo Pay reçue:', lengoResult);

    // Vérifier si la requête a été reçue avec succès
    if (!lengoResult.pay_id) {
      console.error('❌ Erreur Lengo Pay - Pas de pay_id:', lengoResult);
      return NextResponse.json({ success: false, error: lengoResult.message || 'Erreur Lengo Pay - Pas de pay_id' }, { status: 502 });
    }

    // Si le statut n'est pas "Success" mais qu'on a un pay_id, c'est probablement "Request received successfully"
    if (lengoResult.status !== 'Success') {
      console.log('⚠️ Statut Lengo Pay différent de Success:', lengoResult.status);
      console.log('ℹ️ Mais pay_id reçu, on continue avec la création de la transaction');
    }

    // Insérer la transaction dans la table transactions
    console.log('💾 Insertion de la transaction dans la base de données...');
    const mappedMethodePaiement = mapTypeAccountToMethodePaiement(lengoParams.type_account);
    const mappedStatut = mapLengoStatusToTransactionStatut(lengoResult.status);
    
    console.log('🔄 Mapping des données:', { 
      methode_paiement: { original: lengoParams.type_account, mapped: mappedMethodePaiement },
      statut: { original: lengoResult.status, mapped: mappedStatut }
    });
    
    const transactionData = {
      montant: parseFloat(amount),
      numero_transaction: lengoResult.pay_id,
      methode_paiement: mappedMethodePaiement,
      numero_compte: phone,
      description: description,
      entreprise_id: partnerId || null,
      demande_avance_id: requestId || null,
      employe_id: employeId || null,
      statut: mappedStatut,
      date_creation: new Date().toISOString(),
      date_transaction: lengoResult.status === 'Success' ? new Date().toISOString() : null,
    };
    
    console.log('📊 Données de transaction à insérer:', transactionData);
    
    const { data, error } = await supabase
      .from('transactions')
      .insert([transactionData])
      .select()
      .single();

    if (error) {
      console.error('❌ Erreur insertion transaction:', error);
      return NextResponse.json({ success: false, error: 'Erreur DB: ' + error.message }, { status: 500 });
    }

    console.log('✅ Transaction insérée avec succès:', data);

    // Vérifier le statut du paiement immédiatement après l'insertion
    console.log('🔍 Vérification immédiate du statut du paiement...');
    try {
      const statusResponse = await fetch(`${request.nextUrl.origin}/api/payments/lengo-status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pay_id: lengoResult.pay_id
        })
      });

      if (statusResponse.ok) {
        const statusResult = await statusResponse.json();
        console.log('✅ Statut vérifié:', statusResult);
        
        // Si le paiement est déjà réussi, mettre à jour la demande d'avance
        if (statusResult.db_status === 'EFFECTUEE' && requestId) {
          console.log('🔄 Mise à jour du statut de la demande d\'avance (paiement réussi):', requestId);
          
          const { error: updateError } = await supabase
            .from('salary_advance_requests')
            .update({ 
              statut: 'Validé',
              date_validation: new Date().toISOString(),
              numero_reception: lengoResult.pay_id
            })
            .eq('id', requestId);

          if (updateError) {
            console.error('⚠️ Erreur lors de la mise à jour du statut de la demande:', updateError);
          } else {
            console.log('✅ Statut de la demande d\'avance mis à jour avec succès');
          }
        }
      } else {
        console.log('⚠️ Impossible de vérifier le statut immédiatement, sera vérifié plus tard');
      }
    } catch (statusError) {
      console.error('⚠️ Erreur lors de la vérification du statut:', statusError);
      // Ne pas faire échouer la requête principale
    }

    console.log('🎉 Route lengo-cashin terminée avec succès');

    return NextResponse.json({
      success: true,
      pay_id: lengoResult.pay_id,
      transaction: data,
      message: lengoResult.message || 'Transaction créée avec succès',
      status: lengoResult.status,
      note: lengoResult.status !== 'Success' ? 'Paiement en cours de traitement' : 'Paiement traité avec succès'
    });
  } catch (error) {
    console.error('💥 Erreur générale dans la route lengo-cashin:', error);
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
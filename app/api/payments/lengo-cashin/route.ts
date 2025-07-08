import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { lengoPayCashin, LengoPayCashinParams } from '@/services/lengoPayService';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mspmrzlqhwpdkkburjiw.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY is required');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const LENGO_SITE_ID = process.env.LENGO_SITE_ID;

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

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Début de la route lengo-cashin');
    
    const body = await request.json();
    console.log('📋 Body reçu:', body);
    
    // body doit contenir: amount, phone, description, partnerId (optionnel), type_account (optionnel)
    const { amount, phone, description, partnerId, type_account } = body;

    if (!amount || !phone || !description) {
      console.error('❌ Paramètres manquants:', { amount, phone, description });
      return NextResponse.json({ 
        success: false, 
        error: 'Paramètres manquants: amount, phone, description sont requis' 
      }, { status: 400 });
    }

    // Normaliser le numéro de téléphone
    const normalizedPhone = normalizePhone(phone);
    console.log('📱 Numéro normalisé:', { original: phone, normalized: normalizedPhone });

    console.log('🔧 Vérification des variables d\'environnement:');
    console.log('  - LENGO_SITE_ID:', LENGO_SITE_ID ? '✅ Présent' : '❌ Manquant');
    console.log('  - LENGO_CALLBACK_URL:', process.env.LENGO_CALLBACK_URL ? '✅ Présent' : '❌ Manquant');
    console.log('  - SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅ Présent' : '❌ Manquant');

    // Préparer les paramètres pour Lengo Pay selon la doc officielle
    const lengoParams: LengoPayCashinParams = {
      amount: amount.toString(),
      currency: 'GNF',
      websiteid: LENGO_SITE_ID || '',
      type_account: type_account || 'lp-om-gn',
      account: normalizedPhone,
      callback_url: process.env.LENGO_CALLBACK_URL,
    };

    console.log('💳 Paramètres Lengo Pay préparés:', { 
      ...lengoParams, 
      description, 
      partnerId,
      amount: lengoParams.amount + ' ' + lengoParams.currency,
      originalPhone: phone,
      normalizedPhone: normalizedPhone
    });

    // Appel à Lengo Pay
    console.log('🌐 Appel de l\'API Lengo Pay...');
    const lengoResult = await lengoPayCashin(lengoParams);
    console.log('✅ Réponse Lengo Pay reçue:', lengoResult);

    if (lengoResult.status !== 'Success' || !lengoResult.pay_id) {
      console.error('❌ Erreur Lengo Pay:', lengoResult);
      return NextResponse.json({ success: false, error: lengoResult.message || 'Erreur Lengo Pay' }, { status: 502 });
    }

    // Insérer la transaction dans la table transactions
    console.log('💾 Insertion de la transaction dans la base de données...');
    const transactionData = {
      montant: parseFloat(amount),
      numero_transaction: lengoResult.pay_id,
      methode_paiement: lengoParams.type_account,
      numero_compte: phone,
      description: description,
      entreprise_id: partnerId || null,
      statut: 'EN_ATTENTE',
      date_creation: new Date().toISOString(),
      date_transaction: null,
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
    console.log('🎉 Route lengo-cashin terminée avec succès');

    return NextResponse.json({
      success: true,
      pay_id: lengoResult.pay_id,
      transaction: data,
      message: lengoResult.message
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
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { lengoPayCashin, LengoPayCashinParams } from '@/services/lengoPayService';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mspmrzlqhwpdkkburjiw.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);
const LENGO_SITE_ID = process.env.LENGO_SITE_ID;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // body doit contenir: amount, phone, description, partnerId (optionnel), type_account (optionnel)
    const { amount, phone, description, partnerId, type_account } = body;

    if (!amount || !phone || !description) {
      return NextResponse.json({ 
        success: false, 
        error: 'Paramètres manquants: amount, phone, description sont requis' 
      }, { status: 400 });
    }

    // Préparer les paramètres pour Lengo Pay selon la doc officielle
    const lengoParams: LengoPayCashinParams = {
      amount: amount.toString(),
      currency: 'GNF',
      websiteid: LENGO_SITE_ID || '',
      type_account: type_account || 'lp-om-gn',
      account: phone,
      callback_url: process.env.LENGO_CALLBACK_URL,
    };

    console.log('💳 Initiation paiement:', { ...lengoParams, description, partnerId });

    // Appel à Lengo Pay
    const lengoResult = await lengoPayCashin(lengoParams);

    if (lengoResult.status !== 'Success' || !lengoResult.pay_id) {
      return NextResponse.json({ success: false, error: lengoResult.message || 'Erreur Lengo Pay' }, { status: 502 });
    }

    // Insérer la transaction dans la table transactions
    const { data, error } = await supabase
      .from('transactions')
      .insert([{
        montant: parseFloat(amount),
        numero_transaction: lengoResult.pay_id,
        methode_paiement: lengoParams.type_account,
        numero_compte: phone,
        description: description,
        entreprise_id: partnerId || null,
        statut: 'EN_ATTENTE',
        date_creation: new Date().toISOString(),
        date_transaction: null,
      }])
      .select()
      .single();

    if (error) {
      console.error('❌ Erreur insertion transaction:', error);
      return NextResponse.json({ success: false, error: 'Erreur DB: ' + error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      pay_id: lengoResult.pay_id,
      transaction: data,
      message: lengoResult.message
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Erreur inconnue' }, { status: 500 });
  }
} 
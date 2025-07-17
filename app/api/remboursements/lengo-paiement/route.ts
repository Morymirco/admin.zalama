import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Configuration Supabase
const supabaseUrl = 'https://mspmrzlqhwpdkkburjiw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zcG1yemxxaHdwZGtrYnVyaml3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3ODcyNTgsImV4cCI6MjA2NjM2MzI1OH0.zr-TRpKjGJjW0nRtsyPcCLy4Us-c5tOGX71k5_3JJd0';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Configuration Lengo Pay depuis les variables d'environnement
const LENGO_API_URL = (process.env.LENGO_API_URL || 'https://portal.lengopay.com').replace(/\/$/, '');
const LENGO_API_KEY = process.env.LENGO_API_KEY || 'bDM0WlhpcDRta052MmxIZEFFcEV1Mno0WERwS2R0dnk3ZUhWOEpwczdYVXdnM1Bwd016UTVLcEVZNmc0RkQwMw==';
const LENGO_WEBSITE_ID = process.env.LENGO_SITE_ID || 'ozazlahgzpntmYAG';

// URLs définies directement pour éviter les problèmes de configuration
const BASE_URL = process.env.NODE_ENV === 'production' ? 'https://admin.zalamasas.com' : 'http://localhost:3000';
const CALLBACK_URL = process.env.LENGO_CALLBACK_URL || 'https://admin.zalamasas.com/api/remboursements/lengo-callback';
const RETURN_URL = `${BASE_URL}/dashboard/remboursements?status=success`;

console.log('🔧 Configuration URLs:', {
  BASE_URL,
  CALLBACK_URL,
  RETURN_URL,
  LENGO_API_URL,
  LENGO_WEBSITE_ID: LENGO_WEBSITE_ID ? '✅ Configuré' : '❌ Manquant',
  LENGO_API_KEY: LENGO_API_KEY ? '✅ Configuré' : '❌ Manquant',
  NODE_ENV: process.env.NODE_ENV
});

// POST /api/remboursements/lengo-paiement - Initier un paiement via Lengo Pay
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { remboursement_id, amount, currency = 'GNF' } = body;

    // Validation des données requises
    if (!remboursement_id) {
      return NextResponse.json(
        { error: 'ID du remboursement requis' },
        { status: 400 }
      );
    }

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Montant invalide' },
        { status: 400 }
      );
    }

    // Vérifier que les clés Lengo Pay sont configurées
    if (!LENGO_API_KEY || !LENGO_WEBSITE_ID) {
      console.error('Configuration Lengo Pay manquante:', {
        api_key: !!LENGO_API_KEY,
        website_id: !!LENGO_WEBSITE_ID
      });
      return NextResponse.json(
        { error: 'Configuration de paiement manquante' },
        { status: 500 }
      );
    }

    // Récupérer le remboursement
    const { data: remboursement, error: fetchError } = await supabase
      .from('remboursements')
      .select('*')
      .eq('id', remboursement_id)
      .single();

    if (fetchError || !remboursement) {
      return NextResponse.json(
        { error: 'Remboursement non trouvé' },
        { status: 404 }
      );
    }

    // Vérifier que le remboursement est en attente
    if (remboursement.statut !== 'EN_ATTENTE') {
      return NextResponse.json(
        { error: 'Le remboursement n\'est pas en attente de paiement' },
        { status: 409 }
      );
    }

    console.log('🚀 Initiation paiement Lengo Pay:', {
      remboursement_id,
      amount,
      currency,
      website_id: LENGO_WEBSITE_ID
    });

    // Préparer les données pour Lengo Pay selon la documentation officielle v1
    const lengoPayload = {
      websiteid: LENGO_WEBSITE_ID,
      amount: Math.round(amount), // Lengo Pay attend un entier
      currency: currency,
      return_url: RETURN_URL, // Redirection vers le site après paiement
      callback_url: CALLBACK_URL // Notification callback serveur - OBLIGATOIRE pour connaître le statut
    };

    console.log('🔗 URLs configurées:', {
      base_url: BASE_URL,
      return_url: lengoPayload.return_url,
      callback_url: lengoPayload.callback_url,
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL
    });

    console.log('📤 Données envoyées à Lengo Pay:', lengoPayload);

    // Appeler l'API Lengo Pay directement selon la documentation officielle v1
    const apiUrl = `${LENGO_API_URL}/api/v1/payments`;
    console.log('🌐 URL complète de l\'API:', apiUrl);
    
    const lengoResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${LENGO_API_KEY}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(lengoPayload)
    });

    console.log('📥 Réponse Lengo Pay:', {
      status: lengoResponse.status,
      statusText: lengoResponse.statusText,
      contentType: lengoResponse.headers.get('content-type')
    });

    // Vérifier le type de contenu de la réponse
    const contentType = lengoResponse.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      // Si ce n'est pas du JSON, récupérer le texte pour le debug
      const responseText = await lengoResponse.text();
      console.error('❌ Réponse non-JSON de Lengo Pay:', {
        status: lengoResponse.status,
        contentType,
        responseText: responseText.substring(0, 500) // Limiter pour le log
      });
      
      return NextResponse.json(
        { error: `Erreur API Lengo Pay: Réponse non-JSON (${lengoResponse.status})` },
        { status: 500 }
      );
    }

    let lengoResult;
    try {
      lengoResult = await lengoResponse.json();
    } catch (parseError) {
      console.error('❌ Erreur parsing JSON Lengo Pay:', parseError);
      return NextResponse.json(
        { error: 'Erreur parsing réponse Lengo Pay' },
        { status: 500 }
      );
    }

    if (!lengoResponse.ok) {
      console.error('❌ Erreur API Lengo Pay:', {
        status: lengoResponse.status,
        statusText: lengoResponse.statusText,
        result: lengoResult
      });
      return NextResponse.json(
        { error: `Erreur Lengo Pay: ${lengoResult.message || lengoResult.error || 'Erreur inconnue'}` },
        { status: lengoResponse.status }
      );
    }

    // Mettre à jour le remboursement avec les informations Lengo Pay
    const { error: updateError } = await supabase
      .from('remboursements')
      .update({
        methode_remboursement: 'MOBILE_MONEY',
        numero_transaction_remboursement: lengoResult.pay_id,
        reference_paiement: `LENGO-${lengoResult.pay_id}`,
        updated_at: new Date().toISOString()
      })
      .eq('id', remboursement_id);

    if (updateError) {
      console.error('Erreur lors de la mise à jour du remboursement:', updateError);
      // Ne pas faire échouer le paiement si la mise à jour échoue
    }

    console.log('✅ Paiement Lengo Pay initié avec succès:', {
      pay_id: lengoResult.pay_id,
      payment_url: lengoResult.payment_url
    });

    return NextResponse.json({
      success: true,
      message: 'Paiement Lengo Pay initié avec succès',
      data: {
        pay_id: lengoResult.pay_id,
        payment_url: lengoResult.payment_url,
        amount: lengoPayload.amount,
        currency: lengoPayload.currency
      }
    });

  } catch (error) {
    console.error('Erreur serveur:', error);
    return NextResponse.json(
      { error: 'Erreur serveur interne' },
      { status: 500 }
    );
  }
} 
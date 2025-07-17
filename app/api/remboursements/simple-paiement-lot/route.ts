import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Configuration Supabase
const supabaseUrl = 'https://mspmrzlqhwpdkkburjiw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zcG1yemxxaHdwZGtrYnVyaml3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3ODcyNTgsImV4cCI6MjA2NjM2MzI1OH0.zr-TRpKjGJjW0nRtsyPcCLy4Us-c5tOGX71k5_3JJd0';

// Configuration Lengo Pay
const LENGO_SITE_ID = 'ozazlahgzpntmYAG';
const LENGO_CALLBACK_URL = 'https://votre-domaine.com/api/remboursements/lengo-callback';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// POST /api/remboursements/simple-paiement-lot - Paiement en lot ultra-simplifié
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { partenaire_id } = body;

    if (!partenaire_id) {
      return NextResponse.json({ error: 'partenaire_id requis' }, { status: 400 });
    }

    // Récupérer les remboursements en attente
    const { data: remboursements, error } = await supabase
      .from('remboursements')
      .select('id, montant_total_remboursement')
      .eq('partenaire_id', partenaire_id)
      .eq('statut', 'EN_ATTENTE');

    if (error) {
      return NextResponse.json({ error: 'Erreur lors de la récupération' }, { status: 500 });
    }

    if (!remboursements || remboursements.length === 0) {
      return NextResponse.json({ error: 'Aucun remboursement en attente' }, { status: 400 });
    }

    // Calculer le montant total
    const montantTotal = remboursements.reduce((sum, r) => sum + parseFloat(r.montant_total_remboursement), 0);

    // Appel Lengo Pay
    const lengoResponse = await fetch('https://portal.lengopay.com/api/v1/payments', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${process.env.LENGO_API_KEY || 'bDM0WlhpcDRta052MmxIZEFFcEV1Mno0WERwS2R0dnk3ZUhWOEpwczdYVXdnM1Bwd016UTVLcEVZNmc0RkQwMw=='}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        websiteid: LENGO_SITE_ID,
        amount: Math.round(montantTotal),
        currency: 'GNF',
        return_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/dashboard/remboursements/success`,
        callback_url: LENGO_CALLBACK_URL
      })
    });

    const lengoResult = await lengoResponse.json();

    if (!lengoResponse.ok) {
      return NextResponse.json({ error: lengoResult.message || 'Erreur de paiement' }, { status: 502 });
    }

    // Mettre à jour tous les remboursements
    const remboursementIds = remboursements.map(r => r.id);
    await supabase
      .from('remboursements')
      .update({
        numero_transaction_remboursement: lengoResult.pay_id,
        methode_remboursement: 'MOBILE_MONEY',
        updated_at: new Date().toISOString()
      })
      .in('id', remboursementIds);

    return NextResponse.json({
      success: true,
      pay_id: lengoResult.pay_id,
      payment_url: lengoResult.payment_url,
      nombre_remboursements: remboursements.length,
      montant_total: montantTotal
    });

  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
} 
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Configuration Supabase
const supabaseUrl = 'https://mspmrzlqhwpdkkburjiw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zcG1yemxxaHdwZGtrYnVyaml3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3ODcyNTgsImV4cCI6MjA2NjM2MzI1OH0.zr-TRpKjGJjW0nRtsyPcCLy4Us-c5tOGX71k5_3JJd0';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Clés API pour l'authentification externe
const EXTERNAL_API_KEYS = {
  'partner-dashboard-1': 'zalama_partner_key_2024_secure_1',
  'partner-dashboard-2': 'zalama_partner_key_2024_secure_2',
  // Ajouter d'autres clés selon les besoins
};

// GET /api/payments/lengo-external/debug - Endpoint de debug pour vérifier les transactions
export async function GET(request: NextRequest) {
  const timestamp = new Date().toISOString();
  const requestId = Math.random().toString(36).substring(7);
  
  console.log(`🔍 [${timestamp}] [${requestId}] DEBUG ENDPOINT - Vérification des transactions`);
  
  try {
    // 1. Vérification de l'authentification
    const authHeader = request.headers.get('authorization');
    const apiKey = authHeader?.replace('Bearer ', '');
    
    if (!apiKey || !Object.values(EXTERNAL_API_KEYS).includes(apiKey)) {
      console.log(`❌ [${requestId}] Authentification échouée`);
      return NextResponse.json(
        { error: 'Clé API invalide ou manquante' },
        { status: 401 }
      );
    }

    // 2. Récupération du partner_id depuis les query params
    const { searchParams } = new URL(request.url);
    const partnerId = searchParams.get('partner_id');

    if (!partnerId) {
      return NextResponse.json(
        { error: 'partner_id requis dans les query params' },
        { status: 400 }
      );
    }

    console.log(`🔍 [${requestId}] Debug pour partenaire:`, partnerId);

    // 3. Vérification du partenaire
    const { data: partner, error: partnerError } = await supabase
      .from('partners')
      .select('id, nom, email, telephone, actif')
      .eq('id', partnerId)
      .single();

    if (partnerError || !partner) {
      console.log(`❌ [${requestId}] Partenaire non trouvé:`, partnerId);
      return NextResponse.json(
        { error: 'Partenaire non trouvé ou invalide' },
        { status: 404 }
      );
    }

    console.log(`✅ [${requestId}] Partenaire trouvé:`, {
      id: partner.id,
      nom: partner.nom,
      email: partner.email,
      actif: partner.actif
    });

    // 4. Récupération de toutes les transactions du partenaire
    const { data: allTransactions, error: allTransactionsError } = await supabase
      .from('transactions')
      .select(`
        id,
        entreprise_id,
        employe_id,
        montant,
        numero_transaction,
        methode_paiement,
        statut,
        date_transaction,
        created_at,
        employe:employees(id, nom, prenom, email),
        demande:demandes_avance_salaire(id, motif, montant_demande, frais_service)
      `)
      .eq('entreprise_id', partnerId);

    if (allTransactionsError) {
      console.error(`❌ [${requestId}] Erreur récupération transactions:`, allTransactionsError);
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des transactions' },
        { status: 500 }
      );
    }

    // 5. Récupération des transactions EFFECTUEE
    const { data: effectueeTransactions, error: effectueeError } = await supabase
      .from('transactions')
      .select(`
        id,
        entreprise_id,
        employe_id,
        montant,
        numero_transaction,
        methode_paiement,
        statut,
        date_transaction,
        created_at,
        employe:employees(id, nom, prenom, email),
        demande:demandes_avance_salaire(id, motif, montant_demande, frais_service)
      `)
      .eq('entreprise_id', partnerId)
      .eq('statut', 'EFFECTUEE');

    if (effectueeError) {
      console.error(`❌ [${requestId}] Erreur récupération transactions EFFECTUEE:`, effectueeError);
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des transactions EFFECTUEE' },
        { status: 500 }
      );
    }

    // 6. Récupération des remboursements existants
    const { data: existingReimbursements, error: reimbursementsError } = await supabase
      .from('remboursements')
      .select('transaction_id, statut')
      .eq('partenaire_id', partnerId);

    if (reimbursementsError) {
      console.error(`❌ [${requestId}] Erreur récupération remboursements:`, reimbursementsError);
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des remboursements' },
        { status: 500 }
      );
    }

    // 7. Filtrer les transactions disponibles pour remboursement
    const existingTransactionIds = existingReimbursements?.map(r => r.transaction_id) || [];
    const availableTransactions = effectueeTransactions?.filter(t => 
      !existingTransactionIds.includes(t.id)
    ) || [];

    // 8. Statistiques
    const stats = {
      total_transactions: allTransactions?.length || 0,
      transactions_effectuee: effectueeTransactions?.length || 0,
      transactions_annulee: allTransactions?.filter(t => t.statut === 'ANNULEE').length || 0,
      remboursements_existants: existingReimbursements?.length || 0,
      transactions_disponibles: availableTransactions.length
    };

    console.log(`📊 [${requestId}] Statistiques:`, stats);

    // 9. Réponse
    return NextResponse.json({
      success: true,
      message: 'Debug des transactions réussi',
      data: {
        partenaire: {
          id: partner.id,
          nom: partner.nom,
          email: partner.email,
          actif: partner.actif
        },
        statistiques: stats,
        transactions_toutes: allTransactions?.map(t => ({
          id: t.id,
          numero_transaction: t.numero_transaction,
          montant: t.montant,
          statut: t.statut,
          date_transaction: t.date_transaction,
          employe: t.employe ? {
            id: t.employe.id,
            nom: t.employe.nom,
            prenom: t.employe.prenom
          } : null,
          demande: t.demande ? {
            id: t.demande.id,
            motif: t.demande.motif,
            frais_service: t.demande.frais_service
          } : null
        })) || [],
        transactions_effectuee: effectueeTransactions?.map(t => ({
          id: t.id,
          numero_transaction: t.numero_transaction,
          montant: t.montant,
          date_transaction: t.date_transaction,
          employe: t.employe ? {
            id: t.employe.id,
            nom: t.employe.nom,
            prenom: t.employe.prenom
          } : null,
          demande: t.demande ? {
            id: t.demande.id,
            motif: t.demande.motif,
            frais_service: t.demande.frais_service
          } : null,
          montant_total_remboursement: t.montant + (t.demande?.frais_service || 0)
        })) || [],
        transactions_disponibles: availableTransactions.map(t => ({
          id: t.id,
          numero_transaction: t.numero_transaction,
          montant: t.montant,
          date_transaction: t.date_transaction,
          employe: t.employe ? {
            id: t.employe.id,
            nom: t.employe.nom,
            prenom: t.employe.prenom
          } : null,
          demande: t.demande ? {
            id: t.demande.id,
            motif: t.demande.motif,
            frais_service: t.demande.frais_service
          } : null,
          montant_total_remboursement: t.montant + (t.demande?.frais_service || 0)
        })),
        remboursements_existants: existingReimbursements?.map(r => ({
          transaction_id: r.transaction_id,
          statut: r.statut
        })) || []
      },
      request_id: requestId,
      timestamp
    });

  } catch (error) {
    console.error(`❌ [${requestId}] Erreur serveur:`, error);
    return NextResponse.json(
      { error: 'Erreur serveur interne' },
      { status: 500 }
    );
  }
} 
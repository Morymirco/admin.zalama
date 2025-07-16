import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Configuration Supabase - Utiliser la clé anonyme comme les autres API
const supabaseUrl = 'https://mspmrzlqhwpdkkburjiw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zcG1yemxxaHdwZGtrYnVyaml3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3ODcyNTgsImV4cCI6MjA2NjM2MzI1OH0.zr-TRpKjGJjW0nRtsyPcCLy4Us-c5tOGX71k5_3JJd0';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// GET /api/remboursements - Récupérer tous les remboursements
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const partenaireId = searchParams.get('partenaire_id');
    const statut = searchParams.get('statut');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('remboursements')
      .select('*')
      .order('date_creation', { ascending: false })
      .range(offset, offset + limit - 1);

    // Appliquer les filtres
    if (partenaireId) {
      query = query.eq('partenaire_id', partenaireId);
    }
    if (statut && statut !== 'tous') {
      query = query.eq('statut', statut);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Erreur lors de la récupération des remboursements:', error);
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des remboursements' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data || [],
      count: data?.length || 0
    });

  } catch (error) {
    console.error('Erreur serveur:', error);
    return NextResponse.json(
      { error: 'Erreur serveur interne' },
      { status: 500 }
    );
  }
}

// POST /api/remboursements - Créer un remboursement manuellement
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { transaction_id, commentaire_admin } = body;

    if (!transaction_id) {
      return NextResponse.json(
        { error: 'transaction_id est requis' },
        { status: 400 }
      );
    }

    // Vérifier que la transaction existe et est EFFECTUEE
    const { data: transaction, error: transactionError } = await supabase
      .from('transactions')
      .select(`
        *,
        salary_advance_requests!inner(*)
      `)
      .eq('id', transaction_id)
      .eq('statut', 'EFFECTUEE')
      .single();

    if (transactionError || !transaction) {
      return NextResponse.json(
        { error: 'Transaction non trouvée ou non effectuée' },
        { status: 404 }
      );
    }

    // Vérifier qu'il n'y a pas déjà un remboursement pour cette transaction
    const { data: existingRemboursement } = await supabase
      .from('remboursements')
      .select('id')
      .eq('transaction_id', transaction_id)
      .single();

    if (existingRemboursement) {
      return NextResponse.json(
        { error: 'Un remboursement existe déjà pour cette transaction' },
        { status: 409 }
      );
    }

    // Calculer les frais de service (6.5%)
    const fraisService = transaction.montant * 0.065;
    const montantTotal = transaction.montant + fraisService;

    // Créer le remboursement
    const remboursementData = {
      transaction_id: transaction_id,
      demande_avance_id: transaction.demande_avance_id,
      employe_id: transaction.employe_id,
      partenaire_id: transaction.entreprise_id,
      montant_transaction: transaction.montant,
      frais_service: fraisService,
      montant_total_remboursement: montantTotal,
      methode_remboursement: 'VIREMENT_BANCAIRE',
      date_transaction_effectuee: transaction.date_transaction,
      date_limite_remboursement: new Date(transaction.date_transaction).toISOString(),
      commentaire_admin: commentaire_admin || null,
      statut: 'EN_ATTENTE'
    };

    const { data: newRemboursement, error: insertError } = await supabase
      .from('remboursements')
      .insert([remboursementData])
      .select('*')
      .single();

    if (insertError) {
      console.error('Erreur lors de la création du remboursement:', insertError);
      return NextResponse.json(
        { error: 'Erreur lors de la création du remboursement' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: newRemboursement,
      message: 'Remboursement créé avec succès'
    });

  } catch (error) {
    console.error('Erreur serveur:', error);
    return NextResponse.json(
      { error: 'Erreur serveur interne' },
      { status: 500 }
    );
  }
} 
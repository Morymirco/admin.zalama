import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Configuration Supabase
const supabaseUrl = 'https://mspmrzlqhwpdkkburjiw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zcG1yemxxaHdwZGtrYnVyaml3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3ODcyNTgsImV4cCI6MjA2NjM2MzI1OH0.zr-TRpKjGJjW0nRtsyPcCLy4Us-c5tOGX71k5_3JJd0';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// GET /api/remboursements/historique - Récupérer l'historique des remboursements
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const partenaireId = searchParams.get('partenaire_id');
    const remboursementId = searchParams.get('remboursement_id');
    const action = searchParams.get('action');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!partenaireId) {
      return NextResponse.json(
        { error: 'ID du partenaire requis' },
        { status: 400 }
      );
    }

    // Construire la requête pour l'historique
    let query = supabase
      .from('historique_remboursements')
      .select(`
        *,
        remboursement:remboursements!inner(
          id,
          partenaire_id,
          employe_id,
          montant_total_remboursement,
          statut
        )
      `)
      .eq('remboursement.partenaire_id', partenaireId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Appliquer les filtres optionnels
    if (remboursementId) {
      query = query.eq('remboursement_id', remboursementId);
    }

    if (action) {
      query = query.eq('action', action);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Erreur lors de la récupération de l\'historique:', error);
      return NextResponse.json(
        { error: 'Erreur lors de la récupération de l\'historique' },
        { status: 500 }
      );
    }

    // Formater les données de réponse
    const historiqueFormate = (data || []).map(entry => ({
      id: entry.id,
      remboursement_id: entry.remboursement_id,
      action: entry.action,
      montant_avant: entry.montant_avant,
      montant_apres: entry.montant_apres,
      statut_avant: entry.statut_avant,
      statut_apres: entry.statut_apres,
      description: entry.description,
      created_at: entry.created_at,
      remboursement: {
        id: entry.remboursement.id,
        entreprise_id: entry.remboursement.partenaire_id,
        employe_id: entry.remboursement.employe_id,
        montant_total_remboursement: entry.remboursement.montant_total_remboursement,
        statut: entry.remboursement.statut
      }
    }));

    return NextResponse.json({
      success: true,
      data: historiqueFormate,
      count: historiqueFormate.length,
      pagination: {
        limit,
        offset,
        total: historiqueFormate.length
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
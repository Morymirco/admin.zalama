import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Configuration Supabase
const supabaseUrl = 'https://mspmrzlqhwpdkkburjiw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zcG1yemxxaHdwZGtrYnVyaml3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3ODcyNTgsImV4cCI6MjA2NjM2MzI1OH0.zr-TRpKjGJjW0nRtsyPcCLy4Us-c5tOGX71k5_3JJd0';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// GET /api/remboursements/callback-logs - Récupérer les logs de callbacks
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Récupérer les remboursements récemment mis à jour par les callbacks
    const { data: remboursements, error } = await supabase
      .from('remboursements')
      .select(`
        id,
        montant_total_remboursement,
        statut,
        numero_transaction_remboursement,
        date_remboursement_effectue,
        updated_at,
        commentaire_partenaire,
        methode_remboursement
      `)
      .not('numero_transaction_remboursement', 'is', null)
      .order('updated_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Erreur lors de la récupération des logs:', error);
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des logs' },
        { status: 500 }
      );
    }

    // Statistiques des callbacks
    const { data: stats } = await supabase
      .from('remboursements')
      .select('statut')
      .not('numero_transaction_remboursement', 'is', null);

    const statsByStatus = stats?.reduce((acc, item) => {
      acc[item.statut] = (acc[item.statut] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    return NextResponse.json({
      success: true,
      data: {
        remboursements,
        stats: {
          total: stats?.length || 0,
          by_status: statsByStatus
        },
        pagination: {
          limit,
          offset,
          total: stats?.length || 0
        }
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
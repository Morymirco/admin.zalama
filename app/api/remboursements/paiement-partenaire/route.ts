import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Configuration Supabase
const supabaseUrl = 'https://mspmrzlqhwpdkkburjiw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zcG1yemxxaHdwZGtrYnVyaml3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3ODcyNTgsImV4cCI6MjA2NjM2MzI1OH0.zr-TRpKjGJjW0nRtsyPcCLy4Us-c5tOGX71k5_3JJd0';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// POST /api/remboursements/paiement-partenaire - Effectuer un paiement en lot pour un partenaire
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { partenaire_id, methode_paiement, numero_transaction, commentaire } = body;

    if (!partenaire_id) {
      return NextResponse.json(
        { error: 'ID du partenaire requis' },
        { status: 400 }
      );
    }

    if (!methode_paiement || !numero_transaction) {
      return NextResponse.json(
        { error: 'Méthode de paiement et numéro de transaction requis' },
        { status: 400 }
      );
    }

    // Récupérer tous les remboursements en attente du partenaire
    const { data: remboursements, error: fetchError } = await supabase
      .from('remboursements')
      .select('*')
      .eq('partenaire_id', partenaire_id)
      .eq('statut', 'EN_ATTENTE');

    if (fetchError) {
      console.error('Erreur lors de la récupération des remboursements:', fetchError);
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des remboursements' },
        { status: 500 }
      );
    }

    if (!remboursements || remboursements.length === 0) {
      return NextResponse.json(
        { error: 'Aucun remboursement en attente trouvé pour ce partenaire' },
        { status: 400 }
      );
    }

    const remboursementIds = remboursements.map(r => r.id);

    // Mettre à jour tous les remboursements en attente
    const { error: updateError } = await supabase
      .from('remboursements')
      .update({
        statut: 'PAYE',
        date_remboursement_effectue: new Date().toISOString(),
        numero_transaction_remboursement: numero_transaction,
        methode_remboursement: methode_paiement,
        commentaire_partenaire: commentaire || null,
        updated_at: new Date().toISOString()
      })
      .in('id', remboursementIds)
      .eq('statut', 'EN_ATTENTE');

    if (updateError) {
      console.error('Erreur lors du paiement en lot par partenaire:', updateError);
      return NextResponse.json(
        { error: 'Erreur lors du paiement en lot par partenaire' },
        { status: 500 }
      );
    }

    // Créer les entrées dans l'historique
    const historiqueEntries = remboursements.map(remb => ({
      remboursement_id: remb.id,
      action: 'PAIEMENT_EN_LOT',
      montant_avant: remb.montant_total_remboursement,
      montant_apres: remb.montant_total_remboursement,
      statut_avant: 'EN_ATTENTE',
      statut_apres: 'PAYE',
      description: `Paiement en lot via ${methode_paiement} - ${numero_transaction}`,
      created_at: new Date().toISOString()
    }));

    const { error: historiqueError } = await supabase
      .from('historique_remboursements')
      .insert(historiqueEntries);

    if (historiqueError) {
      console.error('Erreur lors de la création de l\'historique:', historiqueError);
      // Ne pas faire échouer le paiement si l'historique échoue
    }

    // Récupérer les informations du partenaire
    const { data: partenaire } = await supabase
      .from('partners')
      .select('nom')
      .eq('id', partenaire_id)
      .single();

    return NextResponse.json({
      success: true,
      message: `Paiement en lot effectué avec succès pour ${remboursements.length} remboursements du partenaire ${partenaire?.nom || partenaire_id}`,
      remboursementsPayes: remboursements.length,
      montant_total: remboursements.reduce((sum, r) => sum + parseFloat(r.montant_total_remboursement), 0),
      partenaire_nom: partenaire?.nom
    });

  } catch (error) {
    console.error('Erreur serveur:', error);
    return NextResponse.json(
      { error: 'Erreur serveur interne' },
      { status: 500 }
    );
  }
} 
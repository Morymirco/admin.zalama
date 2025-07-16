import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Configuration Supabase
const supabaseUrl = 'https://mspmrzlqhwpdkkburjiw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zcG1yemxxaHdwZGtrYnVyaml3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3ODcyNTgsImV4cCI6MjA2NjM2MzI1OH0.zr-TRpKjGJjW0nRtsyPcCLy4Us-c5tOGX71k5_3JJd0';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// POST /api/remboursements/paiement-lot - Effectuer un paiement en lot
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { remboursement_ids, methode_paiement, numero_transaction, commentaire } = body;

    if (!remboursement_ids || !Array.isArray(remboursement_ids) || remboursement_ids.length === 0) {
      return NextResponse.json(
        { error: 'Liste des remboursements requise' },
        { status: 400 }
      );
    }

    if (!methode_paiement || !numero_transaction) {
      return NextResponse.json(
        { error: 'Méthode de paiement et numéro de transaction requis' },
        { status: 400 }
      );
    }

    // Vérifier que tous les remboursements existent et sont en attente
    const { data: remboursements, error: checkError } = await supabase
      .from('remboursements')
      .select('*')
      .in('id', remboursement_ids);

    if (checkError) {
      console.error('Erreur lors de la vérification des remboursements:', checkError);
      return NextResponse.json(
        { error: 'Erreur lors de la vérification des remboursements' },
        { status: 500 }
      );
    }

    if (!remboursements || remboursements.length !== remboursement_ids.length) {
      return NextResponse.json(
        { error: 'Certains remboursements n\'existent pas' },
        { status: 400 }
      );
    }

    const remboursementsEnAttente = remboursements.filter(r => r.statut === 'EN_ATTENTE');
    if (remboursementsEnAttente.length === 0) {
      return NextResponse.json(
        { error: 'Aucun remboursement en attente trouvé' },
        { status: 400 }
      );
    }

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
      .in('id', remboursement_ids)
      .eq('statut', 'EN_ATTENTE');

    if (updateError) {
      console.error('Erreur lors du paiement en lot:', updateError);
      return NextResponse.json(
        { error: 'Erreur lors du paiement en lot' },
        { status: 500 }
      );
    }

    // Créer les entrées dans l'historique
    const historiqueEntries = remboursementsEnAttente.map(remb => ({
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

    return NextResponse.json({
      success: true,
      message: `Paiement en lot effectué avec succès pour ${remboursementsEnAttente.length} remboursements`,
      remboursementsPayes: remboursementsEnAttente.length,
      montant_total: remboursementsEnAttente.reduce((sum, r) => sum + parseFloat(r.montant_total_remboursement), 0)
    });

  } catch (error) {
    console.error('Erreur serveur:', error);
    return NextResponse.json(
      { error: 'Erreur serveur interne' },
      { status: 500 }
    );
  }
} 
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Configuration Supabase
const supabaseUrl = 'https://mspmrzlqhwpdkkburjiw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zcG1yemxxaHdwZGtrYnVyaml3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3ODcyNTgsImV4cCI6MjA2NjM2MzI1OH0.zr-TRpKjGJjW0nRtsyPcCLy4Us-c5tOGX71k5_3JJd0';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// POST /api/remboursements/paiement - Effectuer le paiement d'un remboursement
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      remboursement_id, 
      methode_paiement, 
      numero_transaction, 
      numero_reception, 
      reference_paiement, 
      commentaire 
    } = body;

    // Validation des données requises
    if (!remboursement_id) {
      return NextResponse.json(
        { error: 'ID du remboursement requis' },
        { status: 400 }
      );
    }

    if (!methode_paiement || !numero_transaction) {
      return NextResponse.json(
        { error: 'Méthode de paiement et numéro de transaction requis' },
        { status: 400 }
      );
    }

    // Validation de la méthode de paiement
    const methodesAutorisees = [
      'VIREMENT_BANCAIRE',
      'MOBILE_MONEY',
      'ESPECES',
      'CHEQUE',
      'PRELEVEMENT_SALAIRE',
      'COMPENSATION_AVANCE'
    ];

    if (!methodesAutorisees.includes(methode_paiement)) {
      return NextResponse.json(
        { error: 'Méthode de paiement non autorisée' },
        { status: 400 }
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

    // Effectuer le paiement
    const { error: updateError } = await supabase
      .from('remboursements')
      .update({
        statut: 'PAYE',
        date_remboursement_effectue: new Date().toISOString(),
        numero_transaction_remboursement: numero_transaction,
        numero_reception: numero_reception || null,
        reference_paiement: reference_paiement || null,
        methode_remboursement: methode_paiement,
        commentaire_partenaire: commentaire || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', remboursement_id)
      .eq('statut', 'EN_ATTENTE');

    if (updateError) {
      console.error('Erreur lors du paiement:', updateError);
      return NextResponse.json(
        { error: 'Erreur lors du paiement' },
        { status: 500 }
      );
    }

    // Créer l'entrée dans l'historique
    const { error: historiqueError } = await supabase
      .from('historique_remboursements')
      .insert({
        remboursement_id: remboursement_id,
        action: 'PAIEMENT',
        montant_avant: remboursement.montant_total_remboursement,
        montant_apres: remboursement.montant_total_remboursement,
        statut_avant: 'EN_ATTENTE',
        statut_apres: 'PAYE',
        description: `Paiement effectué via ${methode_paiement} - ${numero_transaction}`,
        created_at: new Date().toISOString()
      });

    if (historiqueError) {
      console.error('Erreur lors de la création de l\'historique:', historiqueError);
      // Ne pas faire échouer le paiement si l'historique échoue
    }

    // Récupérer les données mises à jour
    const { data: remboursementMisAJour } = await supabase
      .from('remboursements')
      .select('*')
      .eq('id', remboursement_id)
      .single();

    return NextResponse.json({
      success: true,
      message: 'Paiement effectué avec succès',
      data: {
        remboursement: {
          id: remboursementMisAJour.id,
          statut: remboursementMisAJour.statut,
          date_remboursement_effectue: remboursementMisAJour.date_remboursement_effectue,
          numero_transaction_remboursement: remboursementMisAJour.numero_transaction_remboursement
        },
        montant_paye: remboursementMisAJour.montant_total_remboursement,
        methode_paiement: methode_paiement
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
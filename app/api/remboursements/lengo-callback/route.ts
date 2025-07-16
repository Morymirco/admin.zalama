import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Configuration Supabase
const supabaseUrl = 'https://mspmrzlqhwpdkkburjiw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zcG1yemxxaHdwZGtrYnVyaml3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3ODcyNTgsImV4cCI6MjA2NjM2MzI1OH0.zr-TRpKjGJjW0nRtsyPcCLy4Us-c5tOGX71k5_3JJd0';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// POST /api/remboursements/lengo-callback - Callback de Lengo Pay
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pay_id, status, amount, message, Client } = body;

    console.log('📞 Callback Lengo Pay reçu:', {
      pay_id,
      status,
      amount,
      message,
      Client
    });

    // Validation des données requises selon la documentation
    if (!pay_id) {
      console.error('❌ Callback Lengo Pay: pay_id manquant');
      return NextResponse.json(
        { error: 'pay_id requis' },
        { status: 400 }
      );
    }

    if (!status) {
      console.error('❌ Callback Lengo Pay: status manquant');
      return NextResponse.json(
        { error: 'status requis' },
        { status: 400 }
      );
    }

    // Rechercher le remboursement par le pay_id
    const { data: remboursement, error: fetchError } = await supabase
      .from('remboursements')
      .select('*')
      .eq('numero_transaction_remboursement', pay_id)
      .single();

    if (fetchError || !remboursement) {
      console.error('❌ Callback Lengo Pay: Remboursement non trouvé pour pay_id:', pay_id);
      return NextResponse.json(
        { error: 'Remboursement non trouvé' },
        { status: 404 }
      );
    }

    console.log('✅ Remboursement trouvé:', {
      id: remboursement.id,
      montant: remboursement.montant_total_remboursement,
      statut_actuel: remboursement.statut
    });

    // Mapper le statut Lengo Pay vers notre statut selon la documentation
    let nouveauStatut = 'EN_ATTENTE';
    let commentaire = '';

    switch (status.toUpperCase()) {
      case 'SUCCESS':
        nouveauStatut = 'PAYE';
        commentaire = `Paiement réussi via Lengo Pay - ${message || 'Transaction Successful'}`;
        break;
      case 'FAILED':
        nouveauStatut = 'ANNULE';
        commentaire = `Paiement échoué via Lengo Pay - ${message || 'Transaction Failed'}`;
        break;
      case 'CANCELLED':
        nouveauStatut = 'ANNULE';
        commentaire = `Paiement annulé via Lengo Pay - ${message || 'Transaction Cancelled'}`;
        break;
      case 'PENDING':
        nouveauStatut = 'EN_ATTENTE';
        commentaire = `Paiement en attente via Lengo Pay - ${message || 'Transaction Pending'}`;
        break;
      default:
        nouveauStatut = 'EN_ATTENTE';
        commentaire = `Statut inconnu via Lengo Pay: ${status} - ${message || 'Unknown Status'}`;
    }

    console.log('🔄 Mise à jour du statut:', {
      pay_id,
      status_lengo: status,
      nouveau_statut: nouveauStatut,
      commentaire
    });

    // Mettre à jour le remboursement
    const updateData: any = {
      statut: nouveauStatut,
      updated_at: new Date().toISOString()
    };

    // Si le paiement est réussi, ajouter la date de paiement
    if (nouveauStatut === 'PAYE') {
      updateData.date_remboursement_effectue = new Date().toISOString();
      updateData.numero_reception = Client || pay_id;
    }

    if (commentaire) {
      updateData.commentaire_partenaire = commentaire;
    }

    const { error: updateError } = await supabase
      .from('remboursements')
      .update(updateData)
      .eq('id', remboursement.id);

    if (updateError) {
      console.error('❌ Erreur lors de la mise à jour du remboursement:', updateError);
      return NextResponse.json(
        { error: 'Erreur lors de la mise à jour' },
        { status: 500 }
      );
    }

    console.log('✅ Remboursement mis à jour avec succès:', {
      remboursement_id: remboursement.id,
      ancien_statut: remboursement.statut,
      nouveau_statut: nouveauStatut,
      status_lengo: status
    });

    // Répondre avec succès à Lengo Pay
    return NextResponse.json({
      success: true,
      message: 'Callback traité avec succès',
      remboursement_id: remboursement.id,
      statut: nouveauStatut
    });

  } catch (error) {
    console.error('❌ Erreur dans le callback Lengo Pay:', error);
    return NextResponse.json(
      { error: 'Erreur serveur interne' },
      { status: 500 }
    );
  }
}

// GET /api/remboursements/lengo-callback - Endpoint de test pour vérifier que l'URL est accessible
export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: true,
    message: 'Callback Lengo Pay endpoint accessible',
    timestamp: new Date().toISOString()
  });
} 
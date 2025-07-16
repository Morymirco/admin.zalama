import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Configuration Supabase
const supabaseUrl = 'https://mspmrzlqhwpdkkburjiw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zcG1yemxxaHdwZGtrYnVyaml3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3ODcyNTgsImV4cCI6MjA2NjM2MzI1OH0.zr-TRpKjGJjW0nRtsyPcCLy4Us-c5tOGX71k5_3JJd0';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// POST /api/payments/lengo-external-callback - Callback de Lengo Pay pour remboursements externes
export async function POST(request: NextRequest) {
  const timestamp = new Date().toISOString();
  const requestId = Math.random().toString(36).substring(7);
  
  console.log(`🚨 [${timestamp}] [${requestId}] CALLBACK REMBOURSEMENT EXTERNE LENGO PAY DÉTECTÉ!`);
  console.log(`📞 [${requestId}] Headers reçus:`, Object.fromEntries(request.headers.entries()));
  
  try {
    const body = await request.json();
    const { pay_id, status, amount, message, Client } = body;

    console.log(`📞 [${requestId}] Callback remboursement externe reçu:`, {
      pay_id,
      status,
      amount,
      message,
      Client,
      timestamp,
      request_id: requestId
    });

    // Validation des données requises
    if (!pay_id) {
      console.error(`❌ [${requestId}] Callback externe: pay_id manquant`);
      return NextResponse.json(
        { error: 'pay_id requis' },
        { status: 400 }
      );
    }

    if (!status) {
      console.error(`❌ [${requestId}] Callback externe: status manquant`);
      return NextResponse.json(
        { error: 'status requis' },
        { status: 400 }
      );
    }

    // Rechercher le remboursement par le pay_id
    const { data: remboursement, error: fetchError } = await supabase
      .from('remboursements')
      .select(`
        *,
        partenaire:partners(id, nom, email, telephone),
        employe:employees(id, nom, prenom, email, telephone)
      `)
      .eq('numero_transaction_remboursement', pay_id)
      .single();

    if (fetchError || !remboursement) {
      console.error(`❌ [${requestId}] Remboursement externe non trouvé pour pay_id:`, pay_id);
      return NextResponse.json(
        { error: 'Remboursement non trouvé' },
        { status: 404 }
      );
    }

    console.log(`✅ [${requestId}] Remboursement externe trouvé:`, {
      id: remboursement.id,
      partenaire: remboursement.partenaire?.nom,
      employe: remboursement.employe ? `${remboursement.employe.nom} ${remboursement.employe.prenom}` : 'N/A',
      amount: remboursement.montant_total_remboursement,
      status_actuel: remboursement.statut
    });

    // Mapper le statut Lengo Pay vers notre statut
    let nouveauStatut = 'EN_ATTENTE';
    let commentaire = '';

    switch (status.toUpperCase()) {
      case 'SUCCESS':
        nouveauStatut = 'PAYE';
        commentaire = `Remboursement réussi via Lengo Pay - ${message || 'Transaction Successful'}`;
        break;
      case 'FAILED':
        nouveauStatut = 'ANNULE';
        commentaire = `Remboursement échoué via Lengo Pay - ${message || 'Transaction Failed'}`;
        break;
      case 'CANCELLED':
        nouveauStatut = 'ANNULE';
        commentaire = `Remboursement annulé via Lengo Pay - ${message || 'Transaction Cancelled'}`;
        break;
      case 'PENDING':
        nouveauStatut = 'EN_ATTENTE';
        commentaire = `Remboursement en attente via Lengo Pay - ${message || 'Transaction Pending'}`;
        break;
      default:
        nouveauStatut = 'EN_ATTENTE';
        commentaire = `Statut inconnu via Lengo Pay: ${status} - ${message || 'Unknown Status'}`;
    }

    console.log(`🔄 [${requestId}] Mise à jour du statut remboursement externe:`, {
      pay_id,
      status_lengo: status,
      nouveau_statut: nouveauStatut,
      commentaire
    });

    // Mettre à jour le remboursement
    const updateData: Record<string, unknown> = {
      statut: nouveauStatut,
      updated_at: new Date().toISOString()
    };

    // Si le remboursement est réussi, ajouter la date de paiement
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
      console.error(`❌ [${requestId}] Erreur lors de la mise à jour du remboursement externe:`, updateError);
      return NextResponse.json(
        { error: 'Erreur lors de la mise à jour' },
        { status: 500 }
      );
    }

    console.log(`✅ [${requestId}] Remboursement externe mis à jour avec succès:`, {
      remboursement_id: remboursement.id,
      ancien_statut: remboursement.statut,
      nouveau_statut: nouveauStatut,
      status_lengo: status,
      partenaire: remboursement.partenaire?.nom
    });

    // Envoyer une notification au partenaire si le remboursement est réussi
    if (nouveauStatut === 'PAYE' && remboursement.partenaire?.email) {
      try {
        console.log(`📧 [${requestId}] Envoi notification email au partenaire:`, remboursement.partenaire.email);
        
        const emailSubject = `Remboursement réussi - ${remboursement.commentaire_partenaire || 'Remboursement ZaLaMa'}`;
        const emailBody = `
          <h2>Remboursement réussi</h2>
          <p><strong>Partenaire:</strong> ${remboursement.partenaire.nom}</p>
          <p><strong>Montant:</strong> ${remboursement.montant_total_remboursement} ${remboursement.currency || 'GNF'}</p>
          <p><strong>Référence:</strong> ${remboursement.reference_paiement}</p>
          <p><strong>Date:</strong> ${new Date().toLocaleString('fr-FR')}</p>
          ${remboursement.employe ? `<p><strong>Employé:</strong> ${remboursement.employe.nom} ${remboursement.employe.prenom}</p>` : ''}
          <p>Votre remboursement a été traité avec succès via Lengo Pay.</p>
        `;

        const emailResponse = await fetch('/api/email/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: [remboursement.partenaire.email],
            subject: emailSubject,
            html: emailBody
          })
        });

        if (emailResponse.ok) {
          console.log(`✅ [${requestId}] Email de notification envoyé au partenaire`);
        } else {
          console.log(`⚠️ [${requestId}] Échec envoi email de notification`);
        }
      } catch (emailError) {
        console.error(`❌ [${requestId}] Erreur envoi email notification:`, emailError);
      }
    }

    // Répondre avec succès à Lengo Pay
    return NextResponse.json({
      success: true,
      message: 'Callback remboursement externe traité avec succès',
      remboursement_id: remboursement.id,
      statut: nouveauStatut,
      request_id: requestId,
      timestamp
    });

  } catch (error) {
    console.error(`❌ [${requestId}] Erreur dans le callback remboursement externe Lengo Pay:`, error);
    return NextResponse.json(
      { error: 'Erreur serveur interne' },
      { status: 500 }
    );
  }
}

// GET /api/payments/lengo-external-callback - Endpoint de test
export async function GET() {
  const timestamp = new Date().toISOString();
  console.log(`🧪 [${timestamp}] Test GET sur le callback remboursement externe Lengo Pay`);
  
  return NextResponse.json({
    success: true,
    message: 'Callback remboursement externe Lengo Pay endpoint accessible',
    timestamp,
    status: 'READY'
  });
} 
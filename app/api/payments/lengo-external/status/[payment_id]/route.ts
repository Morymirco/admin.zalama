import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Configuration Supabase
const supabaseUrl = 'https://mspmrzlqhwpdkkburjiw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zcG1yemxxaHdwZGtrYnVyaml3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3ODcyNTgsImV4cCI6MjA2NjM2MzI1OH0.zr-TRpKjGJjW0nRtsyPcCLy4Us-c5tOGX71k5_3JJd0';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Configuration Lengo Pay
const LENGO_API_URL = (process.env.LENGO_API_URL || 'https://portal.lengopay.com').replace(/\/$/, '');
const LENGO_API_KEY = process.env.LENGO_API_KEY || 'bDM0WlhpcDRta052MmxIZEFFcEV1Mno0WERwS2R0dnk3ZUhWOEpwczdYVXdnM1Bwd016UTVLcEVZNmc0RkQwMw==';

// GET /api/payments/lengo-external/status/[remboursement_id] - Vérification du statut d'un remboursement externe
export async function GET(
  request: NextRequest,
  { params }: { params: { payment_id: string } }
) {
  const timestamp = new Date().toISOString();
  const requestId = Math.random().toString(36).substring(7);
  const remboursementId = params.payment_id;
  
  console.log(`🔍 [${timestamp}] [${requestId}] VÉRIFICATION STATUT REMBOURSEMENT EXTERNE:`, remboursementId);
  
  try {
    // 1. Récupérer le remboursement depuis la base de données
    const { data: remboursement, error: fetchError } = await supabase
      .from('remboursements')
      .select(`
        *,
        partenaire:partners(id, nom, email, telephone),
        employe:employees(id, nom, prenom, email, telephone)
      `)
      .eq('id', remboursementId)
      .single();

    if (fetchError || !remboursement) {
      console.log(`❌ [${requestId}] Remboursement externe non trouvé:`, remboursementId);
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
      status_actuel: remboursement.statut,
      pay_id: remboursement.numero_transaction_remboursement
    });

    // 2. Si pas de pay_id, le remboursement n'a pas été initié
    if (!remboursement.numero_transaction_remboursement) {
      return NextResponse.json({
        success: true,
        message: 'Remboursement externe non initié',
        data: {
          remboursement_id: remboursement.id,
          status: 'NOT_INITIATED',
          status_db: remboursement.statut,
          partenaire: remboursement.partenaire ? {
            id: remboursement.partenaire.id,
            nom: remboursement.partenaire.nom
          } : null,
          employe: remboursement.employe ? {
            id: remboursement.employe.id,
            nom: remboursement.employe.nom,
            prenom: remboursement.employe.prenom
          } : null,
          amount: remboursement.montant_total_remboursement,
          currency: remboursement.currency || 'GNF',
          reference: remboursement.reference_paiement,
          created_at: remboursement.created_at,
          updated_at: remboursement.updated_at
        },
        request_id: requestId,
        timestamp
      });
    }

    // 3. Vérifier le statut auprès de Lengo Pay
    const apiUrl = `${LENGO_API_URL}/api/v1/payments/${remboursement.numero_transaction_remboursement}`;
    console.log(`🌐 [${requestId}] URL complète de l'API Lengo Pay:`, apiUrl);
    
    const lengoResponse = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${LENGO_API_KEY}`,
        'Accept': 'application/json'
      }
    });

    console.log(`📥 [${requestId}] Réponse Lengo Pay:`, {
      status: lengoResponse.status,
      statusText: lengoResponse.statusText,
      contentType: lengoResponse.headers.get('content-type')
    });

    // 4. Vérification du type de contenu de la réponse
    const contentType = lengoResponse.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const responseText = await lengoResponse.text();
      console.error(`❌ [${requestId}] Réponse non-JSON de Lengo Pay:`, {
        status: lengoResponse.status,
        contentType,
        responseText: responseText.substring(0, 500)
      });
      
      // Retourner le statut de la base de données si l'API Lengo Pay échoue
      return NextResponse.json({
        success: true,
        message: 'Statut récupéré depuis la base de données (API Lengo Pay indisponible)',
        data: {
          remboursement_id: remboursement.id,
          status: 'DB_ONLY',
          status_db: remboursement.statut,
          status_lengo: 'UNAVAILABLE',
          partenaire: remboursement.partenaire ? {
            id: remboursement.partenaire.id,
            nom: remboursement.partenaire.nom
          } : null,
          employe: remboursement.employe ? {
            id: remboursement.employe.id,
            nom: remboursement.employe.nom,
            prenom: remboursement.employe.prenom
          } : null,
          amount: remboursement.montant_total_remboursement,
          currency: remboursement.currency || 'GNF',
          reference: remboursement.reference_paiement,
          pay_id: remboursement.numero_transaction_remboursement,
          created_at: remboursement.created_at,
          updated_at: remboursement.updated_at,
          date_remboursement_effectue: remboursement.date_remboursement_effectue
        },
        request_id: requestId,
        timestamp
      });
    }

    // 5. Parsing de la réponse JSON
    let lengoResult;
    try {
      lengoResult = await lengoResponse.json();
    } catch (parseError) {
      console.error(`❌ [${requestId}] Erreur parsing JSON Lengo Pay:`, parseError);
      return NextResponse.json(
        { error: 'Erreur parsing réponse Lengo Pay' },
        { status: 500 }
      );
    }

    if (!lengoResponse.ok) {
      console.error(`❌ [${requestId}] Erreur API Lengo Pay:`, {
        status: lengoResponse.status,
        statusText: lengoResponse.statusText,
        result: lengoResult
      });
      
      // Retourner le statut de la base de données si l'API Lengo Pay échoue
      return NextResponse.json({
        success: true,
        message: 'Statut récupéré depuis la base de données (API Lengo Pay en erreur)',
        data: {
          remboursement_id: remboursement.id,
          status: 'DB_ONLY',
          status_db: remboursement.statut,
          status_lengo: 'ERROR',
          partenaire: remboursement.partenaire ? {
            id: remboursement.partenaire.id,
            nom: remboursement.partenaire.nom
          } : null,
          employe: remboursement.employe ? {
            id: remboursement.employe.id,
            nom: remboursement.employe.nom,
            prenom: remboursement.employe.prenom
          } : null,
          amount: remboursement.montant_total_remboursement,
          currency: remboursement.currency || 'GNF',
          reference: remboursement.reference_paiement,
          pay_id: remboursement.numero_transaction_remboursement,
          created_at: remboursement.created_at,
          updated_at: remboursement.updated_at,
          date_remboursement_effectue: remboursement.date_remboursement_effectue
        },
        request_id: requestId,
        timestamp
      });
    }

    // 6. Mapper le statut Lengo Pay vers notre statut
    let statusLengo = 'UNKNOWN';
    let statusFinal = remboursement.statut;

    if (lengoResult.status) {
      statusLengo = lengoResult.status.toUpperCase();
      
      // Mettre à jour le statut en base si nécessaire
      let nouveauStatut = remboursement.statut;
      let commentaire = '';

      switch (statusLengo) {
        case 'SUCCESS':
          nouveauStatut = 'PAYE';
          commentaire = `Statut vérifié via Lengo Pay - ${lengoResult.message || 'Transaction Successful'}`;
          break;
        case 'FAILED':
          nouveauStatut = 'ANNULE';
          commentaire = `Statut vérifié via Lengo Pay - ${lengoResult.message || 'Transaction Failed'}`;
          break;
        case 'CANCELLED':
          nouveauStatut = 'ANNULE';
          commentaire = `Statut vérifié via Lengo Pay - ${lengoResult.message || 'Transaction Cancelled'}`;
          break;
        case 'PENDING':
          nouveauStatut = 'EN_ATTENTE';
          commentaire = `Statut vérifié via Lengo Pay - ${lengoResult.message || 'Transaction Pending'}`;
          break;
        default:
          nouveauStatut = remboursement.statut;
          commentaire = `Statut vérifié via Lengo Pay: ${statusLengo} - ${lengoResult.message || 'Unknown Status'}`;
      }

      // Mettre à jour en base si le statut a changé
      if (nouveauStatut !== remboursement.statut) {
        console.log(`🔄 [${requestId}] Mise à jour du statut remboursement externe:`, {
          remboursement_id: remboursement.id,
          ancien_statut: remboursement.statut,
          nouveau_statut: nouveauStatut,
          status_lengo: statusLengo
        });

        const updateData: Record<string, unknown> = {
          statut: nouveauStatut,
          updated_at: new Date().toISOString()
        };

        if (nouveauStatut === 'PAYE') {
          updateData.date_remboursement_effectue = new Date().toISOString();
          updateData.numero_reception = lengoResult.Client || remboursement.numero_transaction_remboursement;
        }

        if (commentaire) {
          updateData.commentaire_partenaire = commentaire;
        }

        const { error: updateError } = await supabase
          .from('remboursements')
          .update(updateData)
          .eq('id', remboursement.id);

        if (updateError) {
          console.error(`❌ [${requestId}] Erreur lors de la mise à jour du statut:`, updateError);
        } else {
          statusFinal = nouveauStatut;
          console.log(`✅ [${requestId}] Statut remboursement externe mis à jour:`, nouveauStatut);
        }
      }
    }

    // 7. Réponse finale
    console.log(`✅ [${requestId}] Statut remboursement externe récupéré avec succès:`, {
      remboursement_id: remboursement.id,
      status_final: statusFinal,
      status_lengo: statusLengo,
      partenaire: remboursement.partenaire?.nom
    });

    return NextResponse.json({
      success: true,
      message: 'Statut remboursement externe récupéré avec succès',
      data: {
        remboursement_id: remboursement.id,
        status: statusFinal,
        status_lengo: statusLengo,
        partenaire: remboursement.partenaire ? {
          id: remboursement.partenaire.id,
          nom: remboursement.partenaire.nom,
          email: remboursement.partenaire.email,
          telephone: remboursement.partenaire.telephone
        } : null,
        employe: remboursement.employe ? {
          id: remboursement.employe.id,
          nom: remboursement.employe.nom,
          prenom: remboursement.employe.prenom,
          email: remboursement.employe.email,
          telephone: remboursement.employe.telephone
        } : null,
        amount: remboursement.montant_total_remboursement,
        currency: remboursement.currency || 'GNF',
        reference: remboursement.reference_paiement,
        pay_id: remboursement.numero_transaction_remboursement,
        created_at: remboursement.created_at,
        updated_at: remboursement.updated_at,
        date_remboursement_effectue: remboursement.date_remboursement_effectue,
        lengo_data: lengoResult
      },
      request_id: requestId,
      timestamp
    });

  } catch (error) {
    console.error(`❌ [${requestId}] Erreur lors de la vérification du statut remboursement externe:`, error);
    return NextResponse.json(
      { error: 'Erreur serveur interne' },
      { status: 500 }
    );
  }
} 
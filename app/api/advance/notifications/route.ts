import advanceNotificationService from '@/services/advanceNotificationService';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('📧 Début de l\'envoi des notifications d\'avance');
    
    const body = await request.json();
    console.log('📋 Body reçu:', body);
    
    const {
      type,
      requestId,
      paymentId,
      motif_rejet,
      errorMessage
    } = body;

    if (!type) {
      return NextResponse.json({ 
        success: false, 
        error: 'Type de notification requis' 
      }, { status: 400 });
    }

    console.log('🔍 Détails de la notification:', {
      type,
      requestId,
      paymentId,
      motif_rejet
    });

    let result;

    // Traiter selon le type de notification
    switch (type) {
      case 'request_received':
        if (!requestId) {
          return NextResponse.json({ 
            success: false, 
            error: 'requestId requis pour la réception' 
          }, { status: 400 });
        }
        result = await advanceNotificationService.sendRequestReceivedNotification(requestId);
        break;

      case 'approval':
        if (!requestId) {
          return NextResponse.json({ 
            success: false, 
            error: 'requestId requis pour l\'approbation' 
          }, { status: 400 });
        }
        result = await advanceNotificationService.sendApprovalNotification(requestId);
        break;

      case 'rejection':
        if (!requestId || !motif_rejet) {
          return NextResponse.json({ 
            success: false, 
            error: 'requestId et motif_rejet requis pour le rejet' 
          }, { status: 400 });
        }
        result = await advanceNotificationService.sendRejectionNotification(requestId, motif_rejet);
        break;

      case 'payment_success':
        if (!paymentId) {
          return NextResponse.json({ 
            success: false, 
            error: 'paymentId requis pour le succès de paiement' 
          }, { status: 400 });
        }
        result = await advanceNotificationService.sendPaymentNotification(paymentId);
        break;

      case 'payment_failure':
        if (!paymentId || !errorMessage) {
          return NextResponse.json({ 
            success: false, 
            error: 'paymentId et errorMessage requis pour l\'échec de paiement' 
          }, { status: 400 });
        }
        result = await advanceNotificationService.sendPaymentFailureNotification(paymentId, errorMessage);
        break;

      default:
        return NextResponse.json({ 
          success: false, 
          error: 'Type de notification non supporté' 
        }, { status: 400 });
    }

    console.log('🎉 Envoi des notifications terminé');
    console.log(`  - Succès: ${result.success}`);
    console.log(`  - SMS envoyé: ${result.sms_sent}`);
    console.log(`  - Email envoyé: ${result.email_sent}`);
    if (result.error) {
      console.log(`  - Erreur: ${result.error}`);
    }

    return NextResponse.json({
      success: result.success,
      message: 'Notifications traitées',
      sms_sent: result.sms_sent,
      email_sent: result.email_sent,
      details: result.details,
      error: result.error
    });
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi des notifications d\'avance:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur inattendue'
      },
      { status: 500 }
    );
  }
}

// Route GET pour vérifier le statut du service
export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      message: 'Service de notifications d\'avance disponible',
      service: 'AdvanceNotificationService',
      features: [
        'Notifications d\'approbation',
        'Notifications de rejet',
        'Notifications de paiement réussi',
        'Notifications d\'échec de paiement'
      ]
    });
  } catch (error) {
    console.error('❌ Erreur vérification service notifications avance:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur lors de la vérification du service'
      },
      { status: 500 }
    );
  }
} 
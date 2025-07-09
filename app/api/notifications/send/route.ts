import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendSMS } from '@/services/smsService';
import { sendEmail } from '@/services/emailService';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mspmrzlqhwpdkkburjiw.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY is required');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    console.log('📧 Début de l\'envoi des notifications');
    
    const body = await request.json();
    console.log('📋 Body reçu:', body);
    
    const {
      type,
      status,
      payId,
      requestId,
      employeId,
      employeNom,
      employeEmail,
      employeTelephone,
      montant,
      description,
      lengoStatus,
      dbStatus
    } = body;

    if (type !== 'payment_status') {
      return NextResponse.json({ 
        success: false, 
        error: 'Type de notification non supporté' 
      }, { status: 400 });
    }

    console.log('🔍 Détails de la notification:', {
      type,
      status,
      payId,
      employeNom,
      employeEmail,
      employeTelephone,
      montant
    });

    let smsSent = false;
    let emailSent = false;
    const errors: string[] = [];

    // Envoyer SMS
    if (employeTelephone) {
      try {
        const smsMessage = status === 'success' 
          ? `✅ Paiement confirmé! Votre avance de ${formatCurrency(montant)} a été traitée avec succès. ID: ${payId.slice(0, 8)}...`
          : `❌ Paiement échoué! Votre avance de ${formatCurrency(montant)} n'a pas pu être traitée. Veuillez réessayer.`;

        await sendSMS(employeTelephone, smsMessage);
        smsSent = true;
        console.log('✅ SMS envoyé avec succès');
      } catch (smsError) {
        console.error('❌ Erreur envoi SMS:', smsError);
        errors.push(`SMS: ${smsError instanceof Error ? smsError.message : 'Erreur inconnue'}`);
      }
    }

    // Envoyer email
    if (employeEmail) {
      try {
        const emailSubject = status === 'success' 
          ? '✅ Paiement confirmé - Avance sur salaire'
          : '❌ Paiement échoué - Avance sur salaire';

        const emailHtml = status === 'success'
          ? `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #22c55e;">✅ Paiement confirmé</h2>
              <p>Bonjour ${employeNom},</p>
              <p>Votre avance sur salaire a été traitée avec succès.</p>
              <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0;">Détails du paiement:</h3>
                <p><strong>Montant:</strong> ${formatCurrency(montant)}</p>
                <p><strong>Description:</strong> ${description}</p>
                <p><strong>ID de transaction:</strong> ${payId}</p>
                <p><strong>Date:</strong> ${new Date().toLocaleDateString('fr-FR')}</p>
              </div>
              <p>Le montant a été transféré sur votre compte Orange Money.</p>
              <p>Cordialement,<br>L'équipe Zalama</p>
            </div>
          `
          : `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #ef4444;">❌ Paiement échoué</h2>
              <p>Bonjour ${employeNom},</p>
              <p>Votre avance sur salaire n'a pas pu être traitée.</p>
              <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0;">Détails du paiement:</h3>
                <p><strong>Montant:</strong> ${formatCurrency(montant)}</p>
                <p><strong>Description:</strong> ${description}</p>
                <p><strong>ID de transaction:</strong> ${payId}</p>
                <p><strong>Statut:</strong> ${lengoStatus} (${dbStatus})</p>
              </div>
              <p>Veuillez contacter votre responsable ou réessayer le paiement.</p>
              <p>Cordialement,<br>L'équipe Zalama</p>
            </div>
          `;

        await sendEmail(employeEmail, emailSubject, emailHtml);
        emailSent = true;
        console.log('✅ Email envoyé avec succès');
      } catch (emailError) {
        console.error('❌ Erreur envoi email:', emailError);
        errors.push(`Email: ${emailError instanceof Error ? emailError.message : 'Erreur inconnue'}`);
      }
    }

    // Enregistrer la notification dans la base de données
    try {
      const { error: dbError } = await supabase
        .from('notifications')
        .insert([{
          type: 'payment_status',
          status: status,
          pay_id: payId,
          demande_avance_id: requestId,
          employe_id: employeId,
          employe_nom: employeNom,
          employe_email: employeEmail,
          employe_telephone: employeTelephone,
          montant: montant,
          description: description,
          lengo_status: lengoStatus,
          db_status: dbStatus,
          sms_sent: smsSent,
          email_sent: emailSent,
          date_creation: new Date().toISOString()
        }]);

      if (dbError) {
        console.error('⚠️ Erreur enregistrement notification:', dbError);
        errors.push(`DB: ${dbError.message}`);
      } else {
        console.log('✅ Notification enregistrée dans la base de données');
      }
    } catch (dbError) {
      console.error('❌ Erreur enregistrement notification:', dbError);
      errors.push(`DB: ${dbError instanceof Error ? dbError.message : 'Erreur inconnue'}`);
    }

    console.log('🎉 Envoi des notifications terminé');
    console.log(`  - SMS envoyé: ${smsSent}`);
    console.log(`  - Email envoyé: ${emailSent}`);
    console.log(`  - Erreurs: ${errors.length}`);

    return NextResponse.json({
      success: true,
      message: 'Notifications envoyées',
      sms_sent: smsSent,
      email_sent: emailSent,
      errors: errors.length > 0 ? errors : undefined
    });
    
  } catch (error) {
    console.error('💥 Erreur générale dans l\'envoi des notifications:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 });
  }
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'GNF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
} 
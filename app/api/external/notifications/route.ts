import { NextRequest, NextResponse } from 'next/server';

// Services simplifiés pour l'API externe
const createSMSService = () => {
  return {
    async sendSMS(data: { to: string[]; message: string; sender_name?: string }) {
      try {
        // Simuler l'envoi SMS via l'API interne
        const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/sms/send`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        
        if (!response.ok) {
          throw new Error(`SMS API error: ${response.status}`);
        }
        
        const result = await response.json();
        return { success: true, message_id: result.id || 'sms_' + Date.now() };
      } catch (error) {
        console.error('SMS error:', error);
        return { success: false, error: error instanceof Error ? error.message : 'SMS error' };
      }
    },
    
    async checkBalance() {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/sms/balance`);
        if (!response.ok) {
          throw new Error(`Balance API error: ${response.status}`);
        }
        const result = await response.json();
        return { success: true, balance: result.balance || 0, currency: 'GNF' };
      } catch (error) {
        console.error('Balance error:', error);
        return { success: false, balance: 0, currency: 'GNF' };
      }
    }
  };
};

// Import du service email direct
import emailService from '@/services/emailService';

const createEmailService = () => {
  return {
    async sendEmail(data: { to: string; subject: string; html: string; text?: string }) {
      try {
        console.log('📧 Envoi email externe via emailService:', { to: data.to, subject: data.subject });
        
        const result = await emailService.sendEmail({
          to: [data.to],
          subject: data.subject,
          html: data.html,
          text: data.text
        });

        console.log('✅ Email externe envoyé avec succès:', result);
        return { success: true, id: result.id || 'email_' + Date.now() };
      } catch (error) {
        console.error('❌ Email error:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Email error' };
      }
    }
  };
};

const smsService = createSMSService();
const emailClientService = createEmailService();

// Clé API pour sécuriser l'accès (à configurer dans les variables d'environnement)
const API_KEY = process.env.EXTERNAL_API_KEY || 'zalama_external_key_2024';

interface NotificationRequest {
  type: 'sms' | 'email' | 'both';
  recipients: {
    phone?: string;
    email?: string;
    name?: string;
  }[];
  message: {
    subject?: string;
    content: string;
    html?: string;
  };
  template?: 'welcome' | 'notification' | 'alert' | 'custom';
  metadata?: {
    partner_id?: string;
    user_id?: string;
    request_id?: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    // Vérifier la clé API
    const apiKey = request.headers.get('x-api-key') || request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!apiKey || apiKey !== API_KEY) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Clé API invalide ou manquante',
          code: 'UNAUTHORIZED'
        }, 
        { status: 401 }
      );
    }

    // Parser le body de la requête
    const body: NotificationRequest = await request.json();

    // Validation des données
    if (!body.type || !body.recipients || !body.message) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Données manquantes: type, recipients, message requis',
          code: 'INVALID_REQUEST'
        }, 
        { status: 400 }
      );
    }

    if (!Array.isArray(body.recipients) || body.recipients.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Au moins un destinataire est requis',
          code: 'INVALID_RECIPIENTS'
        }, 
        { status: 400 }
      );
    }

    const results = {
      sms: [] as any[],
      email: [] as any[],
      total: 0,
      success: 0,
      failed: 0
    };

    // Traitement des notifications
    for (const recipient of body.recipients) {
      results.total++;

      try {
        // Envoi SMS
        if ((body.type === 'sms' || body.type === 'both') && recipient.phone) {
          const smsResult = await smsService.sendSMS({
            to: [recipient.phone],
            message: body.message.content,
            sender_name: 'ZaLaMa'
          });

          results.sms.push({
            recipient: recipient.phone,
            name: recipient.name,
            success: smsResult.success,
            message_id: smsResult.message_id,
            error: smsResult.error
          });

          if (smsResult.success) {
            results.success++;
          } else {
            results.failed++;
          }
        }

        // Envoi Email
        if ((body.type === 'email' || body.type === 'both') && recipient.email) {
          const emailResult = await emailClientService.sendEmail({
            to: recipient.email,
            subject: body.message.subject || 'Notification ZaLaMa',
            html: body.message.html || body.message.content,
            text: body.message.content
          });

          results.email.push({
            recipient: recipient.email,
            name: recipient.name,
            success: emailResult.success,
            message_id: emailResult.id,
            error: emailResult.error
          });

          if (emailResult.success) {
            results.success++;
          } else {
            results.failed++;
          }
        }

      } catch (error) {
        console.error('Erreur lors de l\'envoi de notification:', error);
        results.failed++;
      }
    }

    // Log de l'activité
    console.log(`[EXTERNAL API] Notifications envoyées: ${results.success}/${results.total} réussies`);

    return NextResponse.json({
      success: true,
      message: `Notifications traitées: ${results.success} réussies, ${results.failed} échouées`,
      results,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Erreur route externe notifications:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur interne du serveur',
        code: 'INTERNAL_ERROR'
      }, 
      { status: 500 }
    );
  }
}

// Route GET pour vérifier le statut de l'API
export async function GET(request: NextRequest) {
  try {
    // Vérifier la clé API
    const apiKey = request.headers.get('x-api-key') || request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!apiKey || apiKey !== API_KEY) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Clé API invalide ou manquante',
          code: 'UNAUTHORIZED'
        }, 
        { status: 401 }
      );
    }

    // Vérifier le statut des services
    const smsStatus = await smsService.checkBalance();
    const emailStatus = { available: true }; // Email service toujours disponible

    return NextResponse.json({
      success: true,
      status: 'online',
      services: {
        sms: {
          available: smsStatus.success,
          balance: smsStatus.balance || 0,
          currency: smsStatus.currency || 'GNF'
        },
        email: {
          available: emailStatus.available
        }
      },
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    });

  } catch (error) {
    console.error('Erreur route externe status:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur interne du serveur',
        code: 'INTERNAL_ERROR'
      }, 
      { status: 500 }
    );
  }
} 
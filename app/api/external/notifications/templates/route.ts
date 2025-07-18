import { NextRequest, NextResponse } from 'next/server';
import smsService from '@/services/smsService';
import emailService from '@/services/emailService';

// Clé API pour sécuriser l'accès
const API_KEY = process.env.EXTERNAL_API_KEY || 'zalama_external_key_2024';

// Templates prédéfinis
const TEMPLATES = {
  welcome: {
    sms: {
      content: 'ZaLaMa - Votre compte a été créé avec succès. Connectez-vous sur votre espace personnel pour commencer.'
    },
    email: {
      subject: 'Bienvenue sur ZaLaMa',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Bienvenue sur ZaLaMa</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Bienvenue sur ZaLaMa</h1>
              <p>Votre compte a été créé avec succès</p>
            </div>
            
            <div class="content">
              <h2>Bonjour {{name}},</h2>
              
              <p>Nous sommes ravis de vous accueillir dans la famille ZaLaMa !</p>
              
              <p>Votre compte a été créé avec succès et vous pouvez maintenant accéder à toutes les fonctionnalités de la plateforme.</p>
              
              <p>Connectez-vous sur votre espace personnel pour commencer à utiliser ZaLaMa.</p>
              
              <p>Pour toute question ou assistance, n'hésitez pas à nous contacter :</p>
              <ul>
                <li>📧 Email : support@zalama.com</li>
                <li>📞 Téléphone : +224 XXX XXX XXX</li>
              </ul>
            </div>
            
            <div class="footer">
              <p>© 2024 ZaLaMa. Tous droits réservés.</p>
            </div>
          </div>
        </body>
        </html>
      `
    }
  },
  notification: {
    sms: {
      content: 'ZaLaMa: {{message}}'
    },
    email: {
      subject: 'Notification ZaLaMa',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Notification ZaLaMa</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #007bff 0%, #0056b3 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📢 Notification ZaLaMa</h1>
            </div>
            
            <div class="content">
              <h2>Bonjour {{name}},</h2>
              
              <p>{{message}}</p>
              
              <p>Cordialement,<br>
              <strong>L'équipe ZaLaMa</strong></p>
            </div>
            
            <div class="footer">
              <p>© 2024 ZaLaMa. Tous droits réservés.</p>
            </div>
          </div>
        </body>
        </html>
      `
    }
  },
  alert: {
    sms: {
      content: '🚨 ALERTE ZaLaMa: {{message}}'
    },
    email: {
      subject: '🚨 Alerte ZaLaMa',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Alerte ZaLaMa</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .alert-box { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🚨 Alerte ZaLaMa</h1>
              <p>Action requise</p>
            </div>
            
            <div class="content">
              <h2>Bonjour {{name}},</h2>
              
              <div class="alert-box">
                <strong>⚠️ Attention :</strong> {{message}}
              </div>
              
              <p>Veuillez prendre les mesures nécessaires dans les plus brefs délais.</p>
              
              <p>Cordialement,<br>
              <strong>L'équipe ZaLaMa</strong></p>
            </div>
            
            <div class="footer">
              <p>© 2024 ZaLaMa. Tous droits réservés.</p>
            </div>
          </div>
        </body>
        </html>
      `
    }
  }
};

interface TemplateRequest {
  template: 'welcome' | 'notification' | 'alert';
  recipients: {
    phone?: string;
    email?: string;
    name?: string;
  }[];
  variables?: {
    name?: string;
    message?: string;
    [key: string]: any;
  };
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
    const body: TemplateRequest = await request.json();

    // Validation des données
    if (!body.template || !body.recipients) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Données manquantes: template et recipients requis',
          code: 'INVALID_REQUEST'
        }, 
        { status: 400 }
      );
    }

    if (!TEMPLATES[body.template]) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Template '${body.template}' non trouvé`,
          code: 'TEMPLATE_NOT_FOUND'
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

    const template = TEMPLATES[body.template];
    const variables = body.variables || {};
    const results = {
      sms: [] as any[],
      email: [] as any[],
      total: 0,
      success: 0,
      failed: 0
    };

    // Fonction pour remplacer les variables dans le contenu
    const replaceVariables = (content: string, vars: any) => {
      return content.replace(/\{\{(\w+)\}\}/g, (match, key) => {
        return vars[key] || match;
      });
    };

    // Traitement des notifications avec template
    for (const recipient of body.recipients) {
      results.total++;

      try {
        // Envoi SMS avec template
        if (recipient.phone && template.sms) {
          const smsContent = replaceVariables(template.sms.content, {
            ...variables,
            name: recipient.name || variables.name || 'Utilisateur'
          });

          const smsResult = await smsService.sendSMS({
            to: [recipient.phone],
            message: smsContent,
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

        // Envoi Email avec template
        if (recipient.email && template.email) {
          const emailSubject = replaceVariables(template.email.subject, {
            ...variables,
            name: recipient.name || variables.name || 'Utilisateur'
          });

          const emailHtml = replaceVariables(template.email.html, {
            ...variables,
            name: recipient.name || variables.name || 'Utilisateur'
          });

          const emailResult = await emailService.sendEmail({
            to: recipient.email,
            subject: emailSubject,
            html: emailHtml,
            text: replaceVariables(template.sms?.content || 'Notification ZaLaMa', {
              ...variables,
              name: recipient.name || variables.name || 'Utilisateur'
            })
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
        console.error('Erreur lors de l\'envoi de notification avec template:', error);
        results.failed++;
      }
    }

    // Log de l'activité
    console.log(`[EXTERNAL API] Notifications avec template '${body.template}' envoyées: ${results.success}/${results.total} réussies`);

    return NextResponse.json({
      success: true,
      message: `Notifications avec template '${body.template}' traitées: ${results.success} réussies, ${results.failed} échouées`,
      template: body.template,
      results,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Erreur route externe templates:', error);
    
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

// Route GET pour lister les templates disponibles
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

    return NextResponse.json({
      success: true,
      templates: Object.keys(TEMPLATES).map(key => ({
        name: key,
        description: {
          welcome: 'Email et SMS de bienvenue pour nouveaux utilisateurs',
          notification: 'Notification générale',
          alert: 'Alerte urgente'
        }[key],
        variables: {
          welcome: ['name'],
          notification: ['name', 'message'],
          alert: ['name', 'message']
        }[key]
      })),
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Erreur route externe templates list:', error);
    
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
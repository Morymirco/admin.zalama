import { Resend } from 'resend';

export interface EmailMessage {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}

class ServerEmailService {
  private resend = new Resend(process.env.RESEND_API_KEY || 're_aQWgf3nW_Ht5jAsAUj6BzqspyDqxEcCwB');

  async sendEmail(message: EmailMessage): Promise<any> {
    try {
      console.log('📧 Début envoi email côté serveur:', {
        to: message.to,
        subject: message.subject,
        from: 'ZaLaMa <noreply@zalamagn.com>'
      });

      const result = await this.resend.emails.send({
        from: 'ZaLaMa <noreply@zalamagn.com>',
        to: message.to,
        subject: message.subject,
        html: message.html,
        text: message.text
      });

      console.log('✅ Email envoyé avec succès côté serveur:', {
        id: result.data?.id,
        to: message.to,
        subject: message.subject
      });

      return {
        success: true,
        id: result.data?.id
      };
    } catch (error) {
      console.error('❌ Erreur lors de l\'envoi de l\'email côté serveur:', error);
      console.error('📋 Détails de l\'erreur:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack trace'
      });
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inattendue'
      };
    }
  }
}

const serverEmailService = new ServerEmailService();
export default serverEmailService; 
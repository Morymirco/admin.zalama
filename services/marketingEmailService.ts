import { getZalamaEmailTemplate } from '@/lib/email-template';

export interface MarketingEmailData {
  subject: string;
  message: string;
  recipients: string[];
  campaignType?: 'newsletter' | 'promotion' | 'announcement' | 'custom';
}

export class MarketingEmailService {
  /**
   * Génère un email marketing avec le template ZaLaMa
   */
  static generateMarketingEmail(data: MarketingEmailData): string {
    const { subject, message, campaignType = 'custom' } = data;
    
    // Déterminer l'icône et la couleur selon le type de campagne
    const getCampaignStyle = () => {
      switch (campaignType) {
        case 'newsletter':
          return {
            icon: '📰',
            color: '#3B82F6',
            title: 'Newsletter ZaLaMa'
          };
        case 'promotion':
          return {
            icon: '🎉',
            color: '#10B981',
            title: 'Offre Spéciale ZaLaMa'
          };
        case 'announcement':
          return {
            icon: '📢',
            color: '#F59E0B',
            title: 'Annonce Importante ZaLaMa'
          };
        default:
          return {
            icon: '📧',
            color: '#6366F1',
            title: 'Message ZaLaMa'
          };
      }
    };

    const style = getCampaignStyle();
    
    // Générer le contenu HTML avec le template
    const htmlContent = getZalamaEmailTemplate({
      title: subject,
      content: `
        <tr>
          <td style="padding: 12px 15px; color: #1f2937; font-size: 16px; line-height: 1.6; background-color: #ffffff; border-radius: 8px; margin-bottom: 10px; border: 1px solid #dbeafe;">
            <div style="text-align: center; margin-bottom: 30px;">
              <div style="font-size: 48px; margin-bottom: 10px;">${style.icon}</div>
              <h1 style="color: ${style.color}; margin: 0; font-size: 24px; font-weight: 600;">
                ${style.title}
              </h1>
            </div>
            
            <div style="background: #f8fafc; padding: 20px; border-radius: 12px; margin-bottom: 30px;">
              <div style="color: #374151; line-height: 1.6; font-size: 16px;">
                ${message.replace(/\n/g, '<br>')}
              </div>
            </div>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 30px; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 14px; margin: 0;">
                Ce message a été envoyé par le système de marketing ZaLaMa.<br>
                Pour toute question, contactez notre équipe support.
              </p>
            </div>
          </td>
        </tr>
      `
    });

    return htmlContent;
  }

  /**
   * Envoie un email marketing via l'API
   */
  static async sendMarketingEmail(data: MarketingEmailData): Promise<{ success: boolean; error?: string }> {
    try {
      const htmlContent = this.generateMarketingEmail(data);
      
      const response = await fetch('/api/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: data.recipients,
          subject: data.subject,
          html: htmlContent,
          text: data.message // Version texte simple
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        return { success: true };
      } else {
        return { success: false, error: result.error || 'Erreur lors de l\'envoi' };
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email marketing:', error);
      return { success: false, error: 'Erreur réseau' };
    }
  }

  /**
   * Génère un aperçu de l'email marketing
   */
  static generatePreview(data: MarketingEmailData): string {
    return this.generateMarketingEmail(data);
  }
} 
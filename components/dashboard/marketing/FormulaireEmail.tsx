"use client";

import { MarketingEmailData, MarketingEmailService } from '@/services/marketingEmailService';
import { Eye, EyeOff, FileText, Mail } from 'lucide-react';
import React, { useState } from 'react';

interface FormulaireEmailProps {
  subject: string;
  message: string;
  recipients: string;
  isLoading: boolean;
  onSubjectChange: (subject: string) => void;
  onMessageChange: (message: string) => void;
  onRecipientsChange: (recipients: string) => void;
  onSend: () => void;
}

const FormulaireEmail: React.FC<FormulaireEmailProps> = ({
  subject,
  message,
  recipients,
  isLoading,
  onSubjectChange,
  onMessageChange,
  onRecipientsChange,
  onSend
}) => {
  const [showPreview, setShowPreview] = useState(false);
  const [campaignType, setCampaignType] = useState<'newsletter' | 'promotion' | 'announcement' | 'custom'>('custom');

  const parseRecipients = (recipientsString: string): string[] => {
    return recipientsString
      .split(/[,\n]/)
      .map(recipient => recipient.trim())
      .filter(recipient => recipient.length > 0);
  };

  const generatePreview = () => {
    if (!subject.trim() || !message.trim()) return '';
    
    const emailData: MarketingEmailData = {
      subject,
      message,
      recipients: parseRecipients(recipients),
      campaignType
    };
    
    return MarketingEmailService.generatePreview(emailData);
  };

  const handleSend = async () => {
    if (!subject.trim()) {
      return;
    }
    if (!message.trim()) {
      return;
    }

    const recipientsList = parseRecipients(recipients);
    if (recipientsList.length === 0) {
      return;
    }

    try {
      // Utiliser le service marketing pour envoyer avec le template
      const emailData: MarketingEmailData = {
        subject,
        message,
        recipients: recipientsList,
        campaignType
      };

      const result = await MarketingEmailService.sendMarketingEmail(emailData);
      
      if (result.success) {
        onSend(); // Appeler la fonction de callback pour mettre à jour l'UI
      } else {
        console.error('Erreur lors de l\'envoi:', result.error);
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email marketing:', error);
    }
  };

  return (
    <div className="bg-[var(--zalama-card)] rounded-xl p-6 border border-[var(--zalama-border)]">
      <h2 className="text-lg font-semibold text-[var(--zalama-text)] mb-4">Envoi en masse Email</h2>
      
      <div className="space-y-4">
        {/* Type de campagne */}
        <div>
          <label className="block text-sm font-medium text-[var(--zalama-text)] mb-2">
            Type de campagne
          </label>
          <select
            value={campaignType}
            onChange={(e) => setCampaignType(e.target.value as any)}
            className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)] focus:border-[var(--zalama-blue)] focus:outline-none"
          >
            <option value="custom">Message personnalisé</option>
            <option value="newsletter">Newsletter</option>
            <option value="promotion">Promotion/Offre</option>
            <option value="announcement">Annonce importante</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--zalama-text)] mb-2">
            Sujet
          </label>
          <input
            type="text"
            value={subject}
            onChange={(e) => onSubjectChange(e.target.value)}
            placeholder="Sujet de l'email..."
            className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)] focus:border-[var(--zalama-blue)] focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--zalama-text)] mb-2">
            Message
          </label>
          <textarea
            value={message}
            onChange={(e) => onMessageChange(e.target.value)}
            rows={6}
            placeholder="Saisissez votre message email..."
            className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)] focus:border-[var(--zalama-blue)] focus:outline-none"
          />
          <div className="text-xs text-[var(--zalama-text-secondary)] mt-1">
            Le message sera automatiquement formaté avec le template ZaLaMa professionnel
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--zalama-text)] mb-2">
            Destinataires (un par ligne ou séparés par des virgules)
          </label>
          <textarea
            value={recipients}
            onChange={(e) => onRecipientsChange(e.target.value)}
            rows={4}
            placeholder="email@example.com&#10;email2@example.com&#10;..."
            className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)] focus:border-[var(--zalama-blue)] focus:outline-none"
          />
          <div className="text-xs text-[var(--zalama-text-secondary)] mt-1">
            {parseRecipients(recipients).length} destinataire(s)
          </div>
        </div>

        {/* Boutons d'action */}
        <div className="flex gap-3">
          <button
            onClick={() => setShowPreview(!showPreview)}
            disabled={!subject.trim() || !message.trim()}
            className="flex items-center gap-2 px-4 py-2 border border-[var(--zalama-border)] hover:bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)] rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {showPreview ? 'Masquer l\'aperçu' : 'Aperçu'}
          </button>

          <button
            onClick={handleSend}
            disabled={isLoading}
            className="flex items-center gap-2 px-6 py-2 bg-[var(--zalama-blue)] hover:bg-[var(--zalama-blue-accent)] text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
            <Mail className="h-4 w-4" />
            {isLoading ? 'Envoi en cours...' : 'Envoyer les emails'}
          </button>
        </div>

        {/* Aperçu de l'email */}
        {showPreview && subject.trim() && message.trim() && (
          <div className="mt-6 p-4 border border-[var(--zalama-border)] rounded-lg bg-[var(--zalama-bg-lighter)]">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="h-4 w-4 text-[var(--zalama-blue)]" />
              <span className="text-sm font-medium text-[var(--zalama-text)]">Aperçu de l'email</span>
            </div>
            <div 
              className="bg-white rounded-lg p-4 max-h-96 overflow-y-auto"
              dangerouslySetInnerHTML={{ __html: generatePreview() }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default FormulaireEmail; 
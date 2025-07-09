"use client";

import React from 'react';
import { Mail } from 'lucide-react';

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
  const parseRecipients = (recipientsString: string): string[] => {
    return recipientsString
      .split(/[,\n]/)
      .map(recipient => recipient.trim())
      .filter(recipient => recipient.length > 0);
  };

  return (
    <div className="bg-[var(--zalama-card)] rounded-xl p-6 border border-[var(--zalama-border)]">
      <h2 className="text-lg font-semibold text-[var(--zalama-text)] mb-4">Envoi en masse Email</h2>
      
      <div className="space-y-4">
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
            Message (HTML supporté)
          </label>
          <textarea
            value={message}
            onChange={(e) => onMessageChange(e.target.value)}
            rows={6}
            placeholder="Saisissez votre message email..."
            className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)] focus:border-[var(--zalama-blue)] focus:outline-none"
          />
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

        <button
          onClick={onSend}
          disabled={isLoading}
          className="flex items-center gap-2 px-6 py-3 bg-[var(--zalama-blue)] hover:bg-[var(--zalama-blue-accent)] text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
          <Mail className="h-4 w-4" />
          {isLoading ? 'Envoi en cours...' : 'Envoyer les emails'}
        </button>
      </div>
    </div>
  );
};

export default FormulaireEmail; 
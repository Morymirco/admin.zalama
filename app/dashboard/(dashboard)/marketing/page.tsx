"use client";

import React, { useState, useEffect } from 'react';
import { 
  Send, 
  Mail, 
  MessageSquare, 
  Users, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  AlertCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface SMSBalance {
  balance: number;
  currency: string;
}

export default function MarketingPage() {
  const [activeTab, setActiveTab] = useState<'sms' | 'email'>('sms');
  const [smsBalance, setSmsBalance] = useState<SMSBalance | null>(null);
  const [loadingBalance, setLoadingBalance] = useState(false);
  
  // États pour SMS
  const [smsMessage, setSmsMessage] = useState('');
  const [smsRecipients, setSmsRecipients] = useState('');
  const [smsLoading, setSmsLoading] = useState(false);
  
  // États pour Email
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [emailRecipients, setEmailRecipients] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);

  // Charger le solde SMS au montage
  useEffect(() => {
    loadSMSBalance();
  }, []);

  const loadSMSBalance = async () => {
    try {
      setLoadingBalance(true);
      const response = await fetch('/api/sms/balance');
      const data = await response.json();
      
      if (data.success) {
        setSmsBalance(data.balance);
      } else {
        console.error('Erreur lors du chargement du solde SMS:', data.error);
      }
    } catch (error) {
      console.error('Erreur lors du chargement du solde SMS:', error);
    } finally {
      setLoadingBalance(false);
    }
  };

  const parseRecipients = (recipientsString: string): string[] => {
    return recipientsString
      .split(/[,\n]/)
      .map(recipient => recipient.trim())
      .filter(recipient => recipient.length > 0);
  };

  const sendBulkSMS = async () => {
    if (!smsMessage.trim()) {
      toast.error('Le message SMS est requis');
      return;
    }
    if (smsMessage.length > 160) {
      toast.error('Le message SMS ne peut pas dépasser 160 caractères');
      return;
    }
    if (!smsRecipients.trim()) {
      toast.error('Veuillez saisir au moins un destinataire');
      return;
    }

    try {
      setSmsLoading(true);
      const recipients = parseRecipients(smsRecipients);
      
      if (recipients.length === 0) {
        toast.error('Aucun destinataire valide trouvé');
        return;
      }

      // Vérifier le solde SMS
      if (smsBalance && smsBalance.balance < recipients.length) {
        toast.error(`Solde SMS insuffisant. Vous avez ${smsBalance.balance} SMS, mais vous voulez en envoyer ${recipients.length}`);
        return;
      }

      // Envoyer les SMS
      let sentCount = 0;
      let failedCount = 0;

      for (const recipient of recipients) {
        try {
          const response = await fetch('/api/sms/send', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              to: [recipient],
              message: smsMessage,
              sender_name: 'ZaLaMa'
            }),
          });

          const result = await response.json();
          if (result.success) {
            sentCount++;
          } else {
            failedCount++;
          }
        } catch (error) {
          failedCount++;
          console.error(`Erreur lors de l'envoi du SMS à ${recipient}:`, error);
        }
      }

      // Recharger le solde
      await loadSMSBalance();

      toast.success(`SMS envoyés: ${sentCount} succès, ${failedCount} échecs`);
      
      // Réinitialiser le formulaire
      setSmsMessage('');
      setSmsRecipients('');

    } catch (error) {
      console.error('Erreur lors de l\'envoi en masse des SMS:', error);
      toast.error('Erreur lors de l\'envoi en masse des SMS');
    } finally {
      setSmsLoading(false);
    }
  };

  const sendBulkEmail = async () => {
    if (!emailSubject.trim()) {
      toast.error('Le sujet de l\'email est requis');
      return;
    }
    if (!emailMessage.trim()) {
      toast.error('Le message de l\'email est requis');
      return;
    }
    if (!emailRecipients.trim()) {
      toast.error('Veuillez saisir au moins un destinataire');
      return;
    }

    try {
      setEmailLoading(true);
      const recipients = parseRecipients(emailRecipients);
      
      if (recipients.length === 0) {
        toast.error('Aucun destinataire valide trouvé');
        return;
      }

      // Envoyer les emails
      let sentCount = 0;
      let failedCount = 0;

      for (const recipient of recipients) {
        try {
          const response = await fetch('/api/email/send', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              to: recipient,
              subject: emailSubject,
              html: emailMessage
            }),
          });

          const result = await response.json();
          if (result.success) {
            sentCount++;
          } else {
            failedCount++;
          }
        } catch (error) {
          failedCount++;
          console.error(`Erreur lors de l'envoi de l'email à ${recipient}:`, error);
        }
      }

      toast.success(`Emails envoyés: ${sentCount} succès, ${failedCount} échecs`);
      
      // Réinitialiser le formulaire
      setEmailSubject('');
      setEmailMessage('');
      setEmailRecipients('');

    } catch (error) {
      console.error('Erreur lors de l\'envoi en masse des emails:', error);
      toast.error('Erreur lors de l\'envoi en masse des emails');
    } finally {
      setEmailLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-6">
      {/* En-tête */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--zalama-text)]">Marketing</h1>
        <p className="text-[var(--zalama-text-secondary)]">Envoi en masse de SMS et emails</p>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-[var(--zalama-card)] rounded-xl p-6 border border-[var(--zalama-border)]">
          <div className="flex items-center gap-3 mb-2">
            <MessageSquare className="h-6 w-6 text-[var(--zalama-blue)]" />
            <h3 className="text-lg font-semibold text-[var(--zalama-text)]">Solde SMS</h3>
          </div>
          {loadingBalance ? (
            <div className="animate-pulse">
              <div className="h-8 bg-[var(--zalama-bg-lighter)] rounded w-20"></div>
            </div>
          ) : (
            <div className="text-2xl font-bold text-[var(--zalama-text)]">
              {smsBalance ? `${smsBalance.balance} ${smsBalance.currency}` : 'N/A'}
            </div>
          )}
        </div>

        <div className="bg-[var(--zalama-card)] rounded-xl p-6 border border-[var(--zalama-border)]">
          <div className="flex items-center gap-3 mb-2">
            <Send className="h-6 w-6 text-[var(--zalama-success)]" />
            <h3 className="text-lg font-semibold text-[var(--zalama-text)]">Messages envoyés</h3>
          </div>
          <div className="text-2xl font-bold text-[var(--zalama-text)]">0</div>
        </div>

        <div className="bg-[var(--zalama-card)] rounded-xl p-6 border border-[var(--zalama-border)]">
          <div className="flex items-center gap-3 mb-2">
            <Users className="h-6 w-6 text-[var(--zalama-warning)]" />
            <h3 className="text-lg font-semibold text-[var(--zalama-text)]">Destinataires totaux</h3>
          </div>
          <div className="text-2xl font-bold text-[var(--zalama-text)]">0</div>
        </div>
      </div>

      {/* Onglets */}
      <div className="flex gap-1 mb-6 bg-[var(--zalama-bg-lighter)] rounded-lg p-1">
        <button
          onClick={() => setActiveTab('sms')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
            activeTab === 'sms'
              ? 'bg-[var(--zalama-card)] text-[var(--zalama-text)] shadow-sm'
              : 'text-[var(--zalama-text-secondary)] hover:text-[var(--zalama-text)]'
          }`}
        >
          <MessageSquare className="h-4 w-4" />
          SMS
        </button>
        <button
          onClick={() => setActiveTab('email')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
            activeTab === 'email'
              ? 'bg-[var(--zalama-card)] text-[var(--zalama-text)] shadow-sm'
              : 'text-[var(--zalama-text-secondary)] hover:text-[var(--zalama-text)]'
          }`}
        >
          <Mail className="h-4 w-4" />
          Email
        </button>
      </div>

      {/* Contenu des onglets */}
      {activeTab === 'sms' ? (
        <div className="bg-[var(--zalama-card)] rounded-xl p-6 border border-[var(--zalama-border)]">
          <h2 className="text-xl font-semibold text-[var(--zalama-text)] mb-4">Envoi en masse SMS</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--zalama-text)] mb-2">
                Message (max 160 caractères)
              </label>
              <textarea
                value={smsMessage}
                onChange={(e) => setSmsMessage(e.target.value)}
                rows={4}
                maxLength={160}
                placeholder="Saisissez votre message SMS..."
                className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)] focus:border-[var(--zalama-blue)] focus:outline-none"
              />
              <div className="text-xs text-[var(--zalama-text-secondary)] mt-1">
                {smsMessage.length}/160 caractères
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--zalama-text)] mb-2">
                Destinataires (un par ligne ou séparés par des virgules)
              </label>
              <textarea
                value={smsRecipients}
                onChange={(e) => setSmsRecipients(e.target.value)}
                rows={4}
                placeholder="+224XXXXXXXXX&#10;+224XXXXXXXXX&#10;..."
                className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)] focus:border-[var(--zalama-blue)] focus:outline-none"
              />
              <div className="text-xs text-[var(--zalama-text-secondary)] mt-1">
                {parseRecipients(smsRecipients).length} destinataire(s)
              </div>
            </div>

            <button
              onClick={sendBulkSMS}
              disabled={smsLoading}
              className="flex items-center gap-2 px-6 py-3 bg-[var(--zalama-blue)] hover:bg-[var(--zalama-blue-accent)] text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {smsLoading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
              <Send className="h-4 w-4" />
              {smsLoading ? 'Envoi en cours...' : 'Envoyer les SMS'}
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-[var(--zalama-card)] rounded-xl p-6 border border-[var(--zalama-border)]">
          <h2 className="text-xl font-semibold text-[var(--zalama-text)] mb-4">Envoi en masse Email</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--zalama-text)] mb-2">
                Sujet
              </label>
              <input
                type="text"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                placeholder="Sujet de l'email..."
                className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)] focus:border-[var(--zalama-blue)] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--zalama-text)] mb-2">
                Message (HTML supporté)
              </label>
              <textarea
                value={emailMessage}
                onChange={(e) => setEmailMessage(e.target.value)}
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
                value={emailRecipients}
                onChange={(e) => setEmailRecipients(e.target.value)}
                rows={4}
                placeholder="email@example.com&#10;email2@example.com&#10;..."
                className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)] focus:border-[var(--zalama-blue)] focus:outline-none"
              />
              <div className="text-xs text-[var(--zalama-text-secondary)] mt-1">
                {parseRecipients(emailRecipients).length} destinataire(s)
              </div>
            </div>

            <button
              onClick={sendBulkEmail}
              disabled={emailLoading}
              className="flex items-center gap-2 px-6 py-3 bg-[var(--zalama-blue)] hover:bg-[var(--zalama-blue-accent)] text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {emailLoading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
              <Mail className="h-4 w-4" />
              {emailLoading ? 'Envoi en cours...' : 'Envoyer les emails'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 
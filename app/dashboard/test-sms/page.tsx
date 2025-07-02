"use client";

import React, { useState } from 'react';
import { Send, Mail, MessageSquare, Phone, User, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface TestResult {
  type: 'sms' | 'email';
  success: boolean;
  message: string;
  error?: string;
  timestamp: Date;
}

export default function TestSMSPage() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [smsMessage, setSmsMessage] = useState('Test SMS ZaLaMa - Ceci est un message de test.');
  const [emailSubject, setEmailSubject] = useState('Test Email ZaLaMa');
  const [emailMessage, setEmailMessage] = useState('Ceci est un email de test depuis l\'application ZaLaMa.');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);

  const testSMS = async () => {
    if (!phoneNumber.trim()) {
      toast.error('Veuillez entrer un numéro de téléphone');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/test/sms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: phoneNumber,
          message: smsMessage,
        }),
      });

      const result = await response.json();
      
      const testResult: TestResult = {
        type: 'sms',
        success: result.success,
        message: result.success ? 'SMS envoyé avec succès' : 'Échec de l\'envoi du SMS',
        error: result.error,
        timestamp: new Date(),
      };

      setResults(prev => [testResult, ...prev]);
      
      if (result.success) {
        toast.success('SMS envoyé avec succès');
      } else {
        toast.error(`Erreur SMS: ${result.error}`);
      }
    } catch (error) {
      const testResult: TestResult = {
        type: 'sms',
        success: false,
        message: 'Erreur lors de l\'envoi du SMS',
        error: error instanceof Error ? error.message : 'Erreur inconnue',
        timestamp: new Date(),
      };
      setResults(prev => [testResult, ...prev]);
      toast.error('Erreur lors de l\'envoi du SMS');
    } finally {
      setLoading(false);
    }
  };

  const testEmail = async () => {
    if (!email.trim()) {
      toast.error('Veuillez entrer une adresse email');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: email,
          subject: emailSubject,
          message: emailMessage,
        }),
      });

      const result = await response.json();
      
      const testResult: TestResult = {
        type: 'email',
        success: result.success,
        message: result.success ? 'Email envoyé avec succès' : 'Échec de l\'envoi de l\'email',
        error: result.error,
        timestamp: new Date(),
      };

      setResults(prev => [testResult, ...prev]);
      
      if (result.success) {
        toast.success('Email envoyé avec succès');
      } else {
        toast.error(`Erreur Email: ${result.error}`);
      }
    } catch (error) {
      const testResult: TestResult = {
        type: 'email',
        success: false,
        message: 'Erreur lors de l\'envoi de l\'email',
        error: error instanceof Error ? error.message : 'Erreur inconnue',
        timestamp: new Date(),
      };
      setResults(prev => [testResult, ...prev]);
      toast.error('Erreur lors de l\'envoi de l\'email');
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setResults([]);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--zalama-text)]">Test SMS & Email</h1>
          <p className="text-[var(--zalama-text-secondary)]">Testez l'envoi de SMS et d'emails</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Test SMS */}
        <div className="bg-[var(--zalama-card)] rounded-xl p-6 border border-[var(--zalama-border)]">
          <div className="flex items-center gap-3 mb-4">
            <MessageSquare className="h-6 w-6 text-[var(--zalama-blue)]" />
            <h2 className="text-lg font-semibold text-[var(--zalama-text)]">Test SMS</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--zalama-text)] mb-2">
                <Phone className="inline h-4 w-4 mr-1" />
                Numéro de téléphone
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+224 623 456 789"
                className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)] focus:border-[var(--zalama-blue)] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--zalama-text)] mb-2">
                Message
              </label>
              <textarea
                value={smsMessage}
                onChange={(e) => setSmsMessage(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)] focus:border-[var(--zalama-blue)] focus:outline-none"
                placeholder="Votre message SMS..."
              />
            </div>

            <button
              onClick={testSMS}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[var(--zalama-blue)] hover:bg-[var(--zalama-blue-accent)] text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              {loading ? 'Envoi en cours...' : 'Envoyer SMS'}
            </button>
          </div>
        </div>

        {/* Test Email */}
        <div className="bg-[var(--zalama-card)] rounded-xl p-6 border border-[var(--zalama-border)]">
          <div className="flex items-center gap-3 mb-4">
            <Mail className="h-6 w-6 text-[var(--zalama-green)]" />
            <h2 className="text-lg font-semibold text-[var(--zalama-text)]">Test Email</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--zalama-text)] mb-2">
                <Mail className="inline h-4 w-4 mr-1" />
                Adresse email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="test@exemple.com"
                className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)] focus:border-[var(--zalama-blue)] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--zalama-text)] mb-2">
                Sujet
              </label>
              <input
                type="text"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)] focus:border-[var(--zalama-blue)] focus:outline-none"
                placeholder="Sujet de l'email..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--zalama-text)] mb-2">
                Message
              </label>
              <textarea
                value={emailMessage}
                onChange={(e) => setEmailMessage(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)] focus:border-[var(--zalama-blue)] focus:outline-none"
                placeholder="Votre message email..."
              />
            </div>

            <button
              onClick={testEmail}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[var(--zalama-green)] hover:bg-green-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              {loading ? 'Envoi en cours...' : 'Envoyer Email'}
            </button>
          </div>
        </div>
      </div>

      {/* Résultats */}
      <div className="bg-[var(--zalama-card)] rounded-xl p-6 border border-[var(--zalama-border)]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[var(--zalama-text)]">Résultats des tests</h2>
          {results.length > 0 && (
            <button
              onClick={clearResults}
              className="text-sm text-[var(--zalama-text-secondary)] hover:text-[var(--zalama-text)]"
            >
              Effacer
            </button>
          )}
        </div>

        {results.length === 0 ? (
          <div className="text-center py-8 text-[var(--zalama-text-secondary)]">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Aucun test effectué</p>
          </div>
        ) : (
          <div className="space-y-3">
            {results.map((result, index) => (
              <div
                key={index}
                className={`flex items-center gap-3 p-3 rounded-lg border ${
                  result.success
                    ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
                    : 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
                }`}
              >
                {result.success ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    {result.type === 'sms' ? (
                      <MessageSquare className="h-4 w-4 text-[var(--zalama-blue)]" />
                    ) : (
                      <Mail className="h-4 w-4 text-[var(--zalama-green)]" />
                    )}
                    <span className="font-medium text-[var(--zalama-text)]">
                      {result.type === 'sms' ? 'SMS' : 'Email'}
                    </span>
                    <span className="text-sm text-[var(--zalama-text-secondary)]">
                      {result.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-sm text-[var(--zalama-text)] mt-1">{result.message}</p>
                  {result.error && (
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1">{result.error}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 
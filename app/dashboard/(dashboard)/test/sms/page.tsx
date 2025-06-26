"use client";

import React, { useState } from 'react';
import { Send, MessageSquare, Phone, Mail, Building, Users, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface TestResult {
  success: boolean;
  data?: any;
  error?: string;
}

export default function SMSTestPage() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);
  const [formData, setFormData] = useState({
    phone: '+224 XXX XXX XXX',
    message: 'Test SMS de ZaLaMa',
    nomPartenaire: 'Test Partenaire',
    nomRepresentant: 'John Doe',
    telephoneRepresentant: '+224 XXX XXX XXX',
    emailRepresentant: 'john@example.com',
    nomRH: 'Jane Smith',
    telephoneRH: '+224 XXX XXX XXX',
    emailRH: 'jane@example.com',
    verificationId: '',
    code: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const testSMSService = async (action: string, data: any) => {
    setLoading(true);
    try {
      const response = await fetch('/api/test/sms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action, data }),
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success(`${action} réussi`);
        setResults(prev => [...prev, { success: true, data: result.data }]);
      } else {
        toast.error(`Erreur: ${result.error}`);
        setResults(prev => [...prev, { success: false, error: result.error }]);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      toast.error(`Erreur: ${errorMessage}`);
      setResults(prev => [...prev, { success: false, error: errorMessage }]);
    } finally {
      setLoading(false);
    }
  };

  const checkBalance = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/test/sms');
      const result = await response.json();
      
      if (result.success) {
        toast.success('Solde vérifié avec succès');
        setResults(prev => [...prev, { success: true, data: result.data }]);
      } else {
        toast.error(`Erreur: ${result.error}`);
        setResults(prev => [...prev, { success: false, error: result.error }]);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      toast.error(`Erreur: ${errorMessage}`);
      setResults(prev => [...prev, { success: false, error: errorMessage }]);
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setResults([]);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--zalama-text)] mb-2">
          Test SMS - Nimba SMS
        </h1>
        <p className="text-[var(--zalama-text-secondary)]">
          Testez l'envoi de SMS avec le service Nimba SMS
            </p>
          </div>
          
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulaire de test */}
        <div className="bg-[var(--zalama-card)] rounded-xl p-6 border border-[var(--zalama-border)]">
          <h2 className="text-xl font-semibold mb-4 text-[var(--zalama-text)]">
            Tests SMS
          </h2>

          <div className="space-y-4">
            {/* Test SMS simple */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[var(--zalama-text)]">
                Numéro de téléphone
            </label>
            <input
              type="text"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)]"
                placeholder="+224 XXX XXX XXX"
            />
          </div>
          
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[var(--zalama-text)]">
                Message
            </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)]"
                placeholder="Votre message..."
            />
          </div>
          
            {/* Boutons de test */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => testSMSService('send_test', { phone: formData.phone, message: formData.message })}
                disabled={loading}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-[var(--zalama-blue)] hover:bg-[var(--zalama-blue-accent)] text-white rounded-lg transition-colors disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
                Envoyer SMS
              </button>

              <button
                onClick={checkBalance}
                disabled={loading}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-[var(--zalama-success)] hover:bg-[var(--zalama-success)]/80 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                <CheckCircle className="h-4 w-4" />
                Vérifier Solde
              </button>
          </div>
          
            <button
              onClick={() => testSMSService('list_messages', { limit: 5 })}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[var(--zalama-warning)] hover:bg-[var(--zalama-warning)]/80 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              <MessageSquare className="h-4 w-4" />
              Lister Messages
            </button>
          </div>
        </div>

        {/* Tests spécifiques aux partenaires */}
        <div className="bg-[var(--zalama-card)] rounded-xl p-6 border border-[var(--zalama-border)]">
          <h2 className="text-xl font-semibold mb-4 text-[var(--zalama-text)]">
            Tests Partenaires
          </h2>

          <div className="space-y-4">
            {/* Informations du partenaire */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[var(--zalama-text)]">
                Nom du partenaire
              </label>
              <input
                type="text"
                name="nomPartenaire"
                value={formData.nomPartenaire}
                onChange={handleInputChange}
                className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)]"
              />
            </div>

            {/* Représentant */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[var(--zalama-text)]">
                Représentant
              </label>
              <input
                type="text"
                name="nomRepresentant"
                value={formData.nomRepresentant}
                onChange={handleInputChange}
                className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)]"
                placeholder="Nom du représentant"
              />
              <input
                type="text"
                name="telephoneRepresentant"
                value={formData.telephoneRepresentant}
                onChange={handleInputChange}
                className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)]"
                placeholder="Téléphone du représentant"
              />
              <input
                type="email"
                name="emailRepresentant"
                value={formData.emailRepresentant}
                onChange={handleInputChange}
                className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)]"
                placeholder="Email du représentant"
              />
            </div>

            {/* Responsable RH */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[var(--zalama-text)]">
                Responsable RH
              </label>
              <input
                type="text"
                name="nomRH"
                value={formData.nomRH}
                onChange={handleInputChange}
                className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)]"
                placeholder="Nom du responsable RH"
              />
              <input
                type="text"
                name="telephoneRH"
                value={formData.telephoneRH}
                onChange={handleInputChange}
                className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)]"
                placeholder="Téléphone du responsable RH"
              />
              <input
                type="email"
                name="emailRH"
                value={formData.emailRH}
                onChange={handleInputChange}
                className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)]"
                placeholder="Email du responsable RH"
              />
            </div>

            {/* Boutons de test partenaires */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => testSMSService('send_welcome_representant', {
                  nomPartenaire: formData.nomPartenaire,
                  nomRepresentant: formData.nomRepresentant,
                  telephoneRepresentant: formData.telephoneRepresentant,
                  emailRepresentant: formData.emailRepresentant,
                })}
                disabled={loading}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-[var(--zalama-blue)] hover:bg-[var(--zalama-blue-accent)] text-white rounded-lg transition-colors disabled:opacity-50"
              >
                <Building className="h-4 w-4" />
                SMS Représentant
              </button>

              <button
                onClick={() => testSMSService('send_welcome_rh', {
                  nomPartenaire: formData.nomPartenaire,
                  nomRH: formData.nomRH,
                  telephoneRH: formData.telephoneRH,
                  emailRH: formData.emailRH,
                })}
                disabled={loading}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-[var(--zalama-success)] hover:bg-[var(--zalama-success)]/80 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                <Users className="h-4 w-4" />
                SMS RH
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Résultats */}
      <div className="mt-6 bg-[var(--zalama-card)] rounded-xl p-6 border border-[var(--zalama-border)]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-[var(--zalama-text)]">
            Résultats des tests
          </h2>
          <button
            onClick={clearResults}
            className="px-3 py-1 text-sm bg-[var(--zalama-danger)] hover:bg-[var(--zalama-danger)]/80 text-white rounded-lg transition-colors"
          >
            Effacer
          </button>
        </div>

        {results.length === 0 ? (
          <p className="text-[var(--zalama-text-secondary)] text-center py-8">
            Aucun test effectué
          </p>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {results.map((result, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border ${
                  result.success
                    ? 'bg-[var(--zalama-success)]/10 border-[var(--zalama-success)]/20'
                    : 'bg-[var(--zalama-danger)]/10 border-[var(--zalama-danger)]/20'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  {result.success ? (
                    <CheckCircle className="h-4 w-4 text-[var(--zalama-success)]" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-[var(--zalama-danger)]" />
                  )}
                  <span className="font-medium text-[var(--zalama-text)]">
                    Test #{index + 1} - {result.success ? 'Succès' : 'Échec'}
                  </span>
                </div>
                
                {result.data && (
                  <pre className="text-xs text-[var(--zalama-text-secondary)] bg-[var(--zalama-bg-lighter)] p-2 rounded overflow-x-auto">
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                )}
                
                {result.error && (
                  <p className="text-sm text-[var(--zalama-danger)]">
                    Erreur: {result.error}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 
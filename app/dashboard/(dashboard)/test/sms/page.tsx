'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';

export default function TestSMSPage() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [resetLink, setResetLink] = useState('');
  const [type, setType] = useState('standard');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const loadingToast = toast.loading('Envoi du SMS en cours...');

      const response = await fetch('/api/test/sms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber,
          displayName,
          resetLink: resetLink || undefined,
          type
        }),
      });

      const data = await response.json();
      setResult(data);

      toast.dismiss(loadingToast);
      
      if (data.success) {
        toast.success('SMS envoyé avec succès');
      } else {
        toast.error(`Échec de l'envoi: ${data.error || 'Erreur inconnue'}`);
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi du SMS:', error);
      toast.error('Une erreur est survenue lors de l\'envoi du SMS');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Test d'envoi de SMS</h1>
      
      <div className="bg-[var(--zalama-bg-lighter)] p-6 rounded-lg shadow-md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="phoneNumber" className="block text-sm font-medium mb-1">
              Numéro de téléphone (format international)
            </label>
            <input
              type="tel"
              id="phoneNumber"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full px-4 py-2 rounded-md border border-[var(--zalama-border)] bg-[var(--zalama-bg)] text-[var(--zalama-text)]"
              placeholder="+33612345678"
              required
            />
            <p className="text-xs text-[var(--zalama-text-light)] mt-1">
              Format: +33612345678 ou 33612345678
            </p>
          </div>
          
          <div>
            <label htmlFor="displayName" className="block text-sm font-medium mb-1">
              Nom du destinataire
            </label>
            <input
              type="text"
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-4 py-2 rounded-md border border-[var(--zalama-border)] bg-[var(--zalama-bg)] text-[var(--zalama-text)]"
              placeholder="John Doe"
              required
            />
          </div>
          
          <div>
            <label htmlFor="resetLink" className="block text-sm font-medium mb-1">
              Lien de réinitialisation (optionnel)
            </label>
            <input
              type="text"
              id="resetLink"
              value={resetLink}
              onChange={(e) => setResetLink(e.target.value)}
              className="w-full px-4 py-2 rounded-md border border-[var(--zalama-border)] bg-[var(--zalama-bg)] text-[var(--zalama-text)]"
              placeholder="https://example.com/reset?token=abc123"
            />
          </div>
          
          <div>
            <label htmlFor="type" className="block text-sm font-medium mb-1">
              Type de message
            </label>
            <select
              id="type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-4 py-2 rounded-md border border-[var(--zalama-border)] bg-[var(--zalama-bg)] text-[var(--zalama-text)]"
            >
              <option value="standard">Standard</option>
              <option value="rh">RH</option>
              <option value="responsable">Responsable</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[var(--zalama-blue)] hover:bg-[var(--zalama-blue-dark)] text-white font-medium py-2 px-4 rounded-md transition-colors disabled:opacity-50"
            >
              {loading ? 'Envoi en cours...' : 'Envoyer le SMS'}
            </button>
          </div>
        </form>
        
        {result && (
          <div className="mt-8">
            <h2 className="text-lg font-medium mb-2">Résultat</h2>
            <div className="bg-[var(--zalama-bg)] p-4 rounded-md overflow-x-auto">
              <pre className="text-sm text-[var(--zalama-text)]">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
      
      <div className="mt-8 bg-[var(--zalama-bg-lighter)] p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-medium mb-4">Informations sur le service SMS</h2>
        <p className="text-[var(--zalama-text)] mb-2">
          Ce service utilise Firebase pour envoyer des SMS via la collection "messages".
        </p>
        <p className="text-[var(--zalama-text)] mb-2">
          Les messages sont mis en file d'attente pour livraison et seront traités par le système.
        </p>
        <p className="text-[var(--zalama-text)]">
          Assurez-vous que le numéro de téléphone est au format international correct.
        </p>
      </div>
    </div>
  );
} 
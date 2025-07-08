"use client";

import React, { useState } from 'react';
import { UserPlus, Send, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useSupabaseEmployees } from '@/hooks/useSupabasePartners';

export default function TestEmployeePage() {
  const [formData, setFormData] = useState({
    nom: 'Doe',
    prenom: 'John',
    email: 'john.doe@test.com',
    telephone: '+224625212115',
    poste: 'Développeur',
    salaire_net: 500000,
    date_embauche: new Date().toISOString().split('T')[0],
    actif: true,
    genre: 'Homme' as 'Homme' | 'Femme' | 'Autre',
    type_contrat: 'CDI' as 'CDI' | 'CDD' | 'Consultant' | 'Stage' | 'Autre',
    adresse: '123 Rue Test, Conakry',
    role: 'Développeur'
  });
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);

  // Utiliser le hook pour créer un employé
  const { createEmploye } = useSupabaseEmployees('test-partner-id');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Créer l'employé avec le service
      const result = await createEmploye({
        ...formData,
        partner_id: 'test-partner-id' // ID de test
      });

      const testResult = {
        id: Date.now(),
        timestamp: new Date().toLocaleString('fr-FR'),
        success: true,
        message: 'Employé créé avec succès',
        details: {
          employe: result.employe,
          account: result.account,
          sms: result.sms
        }
      };

      setResults(prev => [testResult, ...prev]);

      // Afficher les notifications
      toast.success('Employé créé avec succès !');

      if (result.account?.success) {
        toast.success(`✅ Compte créé avec mot de passe: ${result.account.password}`, {
          duration: 5000,
          icon: '🔐'
        });
      } else {
        toast.error(`❌ Erreur création compte: ${result.account?.error}`, {
          duration: 5000,
          icon: '❌'
        });
      }

      if (result.sms?.success) {
        toast.success(`✅ SMS envoyé à ${formData.telephone}`, {
          duration: 5000,
          icon: '📱'
        });
      } else {
        toast.error(`❌ Erreur SMS: ${result.sms?.error}`, {
          duration: 5000,
          icon: '📱'
        });
      }

    } catch (error) {
      console.error('Erreur création employé:', error);
      
      const testResult = {
        id: Date.now(),
        timestamp: new Date().toLocaleString('fr-FR'),
        success: false,
        message: error instanceof Error ? error.message : 'Erreur inconnue',
        details: { error: error instanceof Error ? error.message : String(error) }
      };

      setResults(prev => [testResult, ...prev]);
      toast.error('Erreur lors de la création de l\'employé');
    } finally {
      setLoading(false);
    }
  };

  const testAccountCreation = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/test/employee-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          nom: formData.nom,
          prenom: formData.prenom,
          partner_id: 'test-partner-id'
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast.error(`Erreur API: ${errorData.error || `HTTP ${response.status}`}`);
        return;
      }

      const result = await response.json();
      
      if (result.success) {
        toast.success('Test création compte réussi !');
        
        const testResult = {
          id: Date.now(),
          timestamp: new Date().toLocaleString('fr-FR'),
          success: true,
          message: 'Test création compte réussi',
          details: result
        };
        setResults(prev => [testResult, ...prev]);
      } else {
        toast.error(`Erreur: ${result.error}`);
      }
    } catch (error) {
      console.error('Erreur test création compte:', error);
      toast.error('Erreur lors du test de création de compte');
    } finally {
      setLoading(false);
    }
  };

  const testDatabase = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/test/database');
      
      if (!response.ok) {
        const errorData = await response.json();
        toast.error(`Erreur base de données: ${errorData.error || `HTTP ${response.status}`}`);
        return;
      }

      const result = await response.json();
      
      if (result.success) {
        toast.success('Test base de données réussi !');
        
        const testResult = {
          id: Date.now(),
          timestamp: new Date().toLocaleString('fr-FR'),
          success: true,
          message: 'Test base de données réussi',
          details: result
        };
        setResults(prev => [testResult, ...prev]);
      } else {
        toast.error(`Erreur: ${result.error}`);
      }
    } catch (error) {
      console.error('Erreur test base de données:', error);
      toast.error('Erreur lors du test de la base de données');
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setResults([]);
  };

  return (
    <div className="p-6 w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--zalama-text)] mb-2">
          Test Création Employé avec SMS
        </h1>
        <p className="text-[var(--zalama-text-secondary)]">
          Testez la création d'un employé avec envoi automatique de SMS contenant les identifiants
        </p>
      </div>

      {/* Formulaire de test */}
      <div className="bg-[var(--zalama-card)] rounded-xl p-6 border border-[var(--zalama-border)] mb-6">
        <h2 className="text-xl font-semibold text-[var(--zalama-text)] mb-4">
          Créer un employé de test
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--zalama-text)] mb-2">
                Nom
              </label>
              <input
                type="text"
                value={formData.nom}
                onChange={(e) => setFormData(prev => ({ ...prev, nom: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)]"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[var(--zalama-text)] mb-2">
                Prénom
              </label>
              <input
                type="text"
                value={formData.prenom}
                onChange={(e) => setFormData(prev => ({ ...prev, prenom: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)]"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[var(--zalama-text)] mb-2">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)]"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[var(--zalama-text)] mb-2">
                Téléphone
              </label>
              <input
                type="tel"
                value={formData.telephone}
                onChange={(e) => setFormData(prev => ({ ...prev, telephone: e.target.value }))}
                placeholder="+224XXXXXXXXX"
                className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)]"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[var(--zalama-text)] mb-2">
                Genre
              </label>
              <select
                value={formData.genre}
                onChange={(e) => setFormData(prev => ({ ...prev, genre: e.target.value as 'Homme' | 'Femme' | 'Autre' }))}
                className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)]"
                required
              >
                <option value="Homme">Homme</option>
                <option value="Femme">Femme</option>
                <option value="Autre">Autre</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[var(--zalama-text)] mb-2">
                Type de contrat
              </label>
              <select
                value={formData.type_contrat}
                onChange={(e) => setFormData(prev => ({ ...prev, type_contrat: e.target.value as 'CDI' | 'CDD' | 'Consultant' | 'Stage' | 'Autre' }))}
                className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)]"
                required
              >
                <option value="CDI">CDI</option>
                <option value="CDD">CDD</option>
                <option value="Consultant">Consultant</option>
                <option value="Stage">Stage</option>
                <option value="Autre">Autre</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[var(--zalama-text)] mb-2">
                Poste
              </label>
              <input
                type="text"
                value={formData.poste}
                onChange={(e) => setFormData(prev => ({ ...prev, poste: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)]"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[var(--zalama-text)] mb-2">
                Rôle
              </label>
              <input
                type="text"
                value={formData.role}
                onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)]"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[var(--zalama-text)] mb-2">
                Salaire net (GNF)
              </label>
              <input
                type="number"
                value={formData.salaire_net}
                onChange={(e) => setFormData(prev => ({ ...prev, salaire_net: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)]"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[var(--zalama-text)] mb-2">
                Date d'embauche
              </label>
              <input
                type="date"
                value={formData.date_embauche}
                onChange={(e) => setFormData(prev => ({ ...prev, date_embauche: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)]"
                required
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[var(--zalama-text)] mb-2">
                Adresse
              </label>
              <textarea
                value={formData.adresse}
                onChange={(e) => setFormData(prev => ({ ...prev, adresse: e.target.value }))}
                rows={2}
                className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)]"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-[var(--zalama-blue)] hover:bg-[var(--zalama-blue-accent)] text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <UserPlus className="h-4 w-4" />
              )}
              Créer l'employé avec SMS
            </button>

            <button
              type="button"
              onClick={testAccountCreation}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-[var(--zalama-success)] hover:bg-[var(--zalama-success-accent)] text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <UserPlus className="h-4 w-4" />
              )}
              Tester création compte
            </button>

            <button
              type="button"
              onClick={testDatabase}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-[var(--zalama-success)] hover:bg-[var(--zalama-success-accent)] text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <UserPlus className="h-4 w-4" />
              )}
              Tester base de données
            </button>

            <button
              type="button"
              onClick={clearResults}
              className="flex items-center gap-2 px-4 py-2 bg-[var(--zalama-gray)] hover:bg-[var(--zalama-gray-accent)] text-white rounded-lg transition-colors"
            >
              Effacer les résultats
            </button>
          </div>
        </form>
      </div>

      {/* Résultats */}
      <div className="bg-[var(--zalama-card)] rounded-xl p-6 border border-[var(--zalama-border)]">
        <h2 className="text-xl font-semibold text-[var(--zalama-text)] mb-4">
          Résultats des tests ({results.length})
        </h2>
        
        {results.length === 0 ? (
          <p className="text-[var(--zalama-text-secondary)] text-center py-8">
            Aucun test effectué pour le moment
          </p>
        ) : (
          <div className="space-y-4">
            {results.map((result) => (
              <div
                key={result.id}
                className={`p-4 rounded-lg border ${
                  result.success
                    ? 'bg-green-50 border-green-200'
                    : 'bg-red-50 border-red-200'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {result.success ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-600" />
                    )}
                    <span className="font-medium text-[var(--zalama-text)]">
                      Création employé
                    </span>
                    <span className="text-sm text-[var(--zalama-text-secondary)]">
                      {result.timestamp}
                    </span>
                  </div>
                  <span className={`text-sm px-2 py-1 rounded ${
                    result.success
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {result.success ? 'Succès' : 'Échec'}
                  </span>
                </div>
                
                <div className="text-sm text-[var(--zalama-text)] mb-3">
                  <strong>Message:</strong> {result.message}
                </div>
                
                <details className="text-xs">
                  <summary className="cursor-pointer text-[var(--zalama-text-secondary)] hover:text-[var(--zalama-text)]">
                    Voir les détails
                  </summary>
                  <pre className="mt-2 p-2 bg-[var(--zalama-bg-lighter)] rounded overflow-x-auto">
                    {JSON.stringify(result.details, null, 2)}
                  </pre>
                </details>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 
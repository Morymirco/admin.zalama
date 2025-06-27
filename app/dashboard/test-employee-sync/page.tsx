"use client";

import React, { useState } from 'react';
import { UserPlus, CheckCircle, AlertCircle, Loader2, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

export default function TestEmployeeSyncPage() {
  const [formData, setFormData] = useState({
    nom: 'Test',
    prenom: 'Sync',
    email: 'test.sync@example.com',
    telephone: '+224625212115',
    poste: 'Testeur',
    salaire_net: 300000,
    date_embauche: new Date().toISOString().split('T')[0],
    actif: true,
    genre: 'Homme' as 'Homme' | 'Femme' | 'Autre',
    type_contrat: 'CDI' as 'CDI' | 'CDD' | 'Consultant' | 'Stage' | 'Autre',
    adresse: '123 Rue Test, Conakry',
    role: 'Testeur'
  });
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Utiliser l'API de synchronisation
      const response = await fetch('/api/employees/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'create_with_auth',
          employeeData: {
            ...formData,
            partner_id: 'test-partner-id'
          }
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const result = await response.json();
      
      const testResult = {
        id: Date.now(),
        timestamp: new Date().toLocaleString('fr-FR'),
        success: result.success,
        message: result.success ? 'Employé créé avec synchronisation' : 'Erreur création',
        details: result.result
      };

      setResults(prev => [testResult, ...prev]);

      if (result.success) {
        toast.success('Employé créé avec synchronisation !');
        
        if (result.result.password) {
          toast.success(`Mot de passe: ${result.result.password}`, { duration: 10000 });
        }
      } else {
        toast.error(`Erreur: ${result.result.error}`);
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

  const checkSyncStatus = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/employees/sync');
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();
      
      const testResult = {
        id: Date.now(),
        timestamp: new Date().toLocaleString('fr-FR'),
        success: result.success,
        message: 'Statut de synchronisation récupéré',
        details: result.data
      };

      setResults(prev => [testResult, ...prev]);

      if (result.success) {
        toast.success('Statut de synchronisation récupéré !');
      } else {
        toast.error(`Erreur: ${result.error}`);
      }

    } catch (error) {
      console.error('Erreur récupération statut:', error);
      toast.error('Erreur lors de la récupération du statut');
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setResults([]);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--zalama-text)] mb-2">
          Test Synchronisation Employés
        </h1>
        <p className="text-[var(--zalama-text-secondary)]">
          Testez la création d'un employé avec synchronisation automatique du compte Auth
        </p>
      </div>

      {/* Formulaire de test */}
      <div className="bg-[var(--zalama-card)] rounded-xl p-6 border border-[var(--zalama-border)] mb-6">
        <h2 className="text-xl font-semibold text-[var(--zalama-text)] mb-4">
          Créer un employé avec synchronisation
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
              Créer avec synchronisation
            </button>

            <button
              type="button"
              onClick={checkSyncStatus}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-[var(--zalama-success)] hover:bg-[var(--zalama-success-accent)] text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Vérifier statut
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
                      Test synchronisation
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
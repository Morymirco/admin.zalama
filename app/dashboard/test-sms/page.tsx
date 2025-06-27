"use client";

import React, { useState } from 'react';
import { Send, Phone, MessageSquare, AlertCircle, CheckCircle, Loader2, Info } from 'lucide-react';
import toast from 'react-hot-toast';

export default function TestSMSPage() {
  const [phoneNumber, setPhoneNumber] = useState('+224625212115');
  const [message, setMessage] = useState('Test SMS ZaLaMa');
  const [testType, setTestType] = useState('simple');
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState<any>(null);
  const [testResults, setTestResults] = useState<any[]>([]);
  const [serverHealth, setServerHealth] = useState<any>(null);

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
          testType,
          phoneNumber,
          message
        }),
      });

      // Vérifier si la réponse est OK
      if (!response.ok) {
        // Essayer de lire le JSON d'erreur
        let errorData;
        try {
          errorData = await response.json();
        } catch (jsonError) {
          // Si le JSON est invalide, lire le texte brut
          const errorText = await response.text();
          errorData = { error: `Erreur HTTP ${response.status}: ${errorText}` };
        }
        
        const testResult = {
          id: Date.now(),
          timestamp: new Date().toLocaleString('fr-FR'),
          type: testType,
          phoneNumber,
          success: false,
          message: errorData.error || `Erreur HTTP ${response.status}`,
          details: errorData
        };

        setTestResults(prev => [testResult, ...prev]);
        toast.error(`Erreur: ${errorData.error || `HTTP ${response.status}`}`);
        return;
      }

      // Essayer de lire le JSON de succès
      let result;
      try {
        result = await response.json();
      } catch (jsonError) {
        const errorText = await response.text();
        throw new Error(`Réponse JSON invalide: ${errorText}`);
      }
      
      const testResult = {
        id: Date.now(),
        timestamp: new Date().toLocaleString('fr-FR'),
        type: testType,
        phoneNumber,
        success: result.success,
        message: result.message || result.error,
        details: result
      };

      setTestResults(prev => [testResult, ...prev]);

      if (result.success) {
        toast.success('Test SMS réussi !');
      } else {
        toast.error(`Erreur: ${result.error}`);
      }

    } catch (error) {
      console.error('Erreur test SMS:', error);
      toast.error('Erreur lors du test SMS');
      
      const testResult = {
        id: Date.now(),
        timestamp: new Date().toLocaleString('fr-FR'),
        type: testType,
        phoneNumber,
        success: false,
        message: error instanceof Error ? error.message : 'Erreur réseau',
        details: { error: error instanceof Error ? error.message : String(error) }
      };
      setTestResults(prev => [testResult, ...prev]);
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
        setBalance(result.balance);
        toast.success('Solde vérifié avec succès');
      } else {
        toast.error(`Erreur: ${result.error}`);
      }
    } catch (error) {
      console.error('Erreur vérification solde:', error);
      toast.error('Erreur lors de la vérification du solde');
    } finally {
      setLoading(false);
    }
  };

  const checkServerHealth = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/health');
      const result = await response.json();
      
      if (result.success) {
        setServerHealth(result);
        toast.success('Serveur opérationnel');
      } else {
        setServerHealth(result);
        toast.error(`Serveur en erreur: ${result.error}`);
      }
    } catch (error) {
      console.error('Erreur health check:', error);
      setServerHealth({ success: false, error: 'Erreur réseau' });
      toast.error('Erreur lors de la vérification du serveur');
    } finally {
      setLoading(false);
    }
  };

  const testSimpleAPI = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          test: 'simple',
          phoneNumber: phoneNumber,
          message: 'Test simple'
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        toast.error(`Erreur API simple: ${response.status} - ${errorText}`);
        return;
      }

      const result = await response.json();
      
      if (result.success) {
        toast.success('Test API simple réussi !');
        
        const testResult = {
          id: Date.now(),
          timestamp: new Date().toLocaleString('fr-FR'),
          type: 'API Simple',
          phoneNumber,
          success: true,
          message: 'Test API simple réussi',
          details: result
        };
        setTestResults(prev => [testResult, ...prev]);
      } else {
        toast.error(`Erreur API simple: ${result.error}`);
      }
    } catch (error) {
      console.error('Erreur test API simple:', error);
      toast.error('Erreur lors du test API simple');
    } finally {
      setLoading(false);
    }
  };

  const testAllAPIs = async () => {
    setLoading(true);
    const apis = [
      { name: 'Health', url: '/api/health', method: 'GET' },
      { name: 'Debug', url: '/api/debug', method: 'GET' },
      { name: 'Test', url: '/api/test', method: 'POST', body: { test: 'debug' } },
      { name: 'Debug POST', url: '/api/debug', method: 'POST', body: { test: 'debug' } }
    ];

    const results = [];

    for (const api of apis) {
      try {
        const options: RequestInit = {
          method: api.method,
          headers: {
            'Content-Type': 'application/json',
          },
        };

        if (api.body) {
          options.body = JSON.stringify(api.body);
        }

        const response = await fetch(api.url, options);
        
        let result;
        try {
          result = await response.json();
        } catch (jsonError) {
          const errorText = await response.text();
          result = { error: `JSON invalide: ${errorText}` };
        }

        results.push({
          name: api.name,
          url: api.url,
          method: api.method,
          status: response.status,
          success: response.ok && result.success,
          result: result
        });

      } catch (error) {
        results.push({
          name: api.name,
          url: api.url,
          method: api.method,
          status: 'ERROR',
          success: false,
          result: { error: error instanceof Error ? error.message : String(error) }
        });
      }
    }

    // Afficher les résultats
    const successCount = results.filter(r => r.success).length;
    const totalCount = results.length;

    if (successCount === totalCount) {
      toast.success(`Toutes les APIs (${totalCount}) fonctionnent !`);
    } else {
      toast.warning(`${successCount}/${totalCount} APIs fonctionnent`);
    }

    // Ajouter les résultats aux tests
    results.forEach(result => {
      const testResult = {
        id: Date.now() + Math.random(),
        timestamp: new Date().toLocaleString('fr-FR'),
        type: `Debug ${result.name}`,
        phoneNumber: 'N/A',
        success: result.success,
        message: `${result.method} ${result.url} - ${result.status}`,
        details: result
      };
      setTestResults(prev => [testResult, ...prev]);
    });

    setLoading(false);
  };

  const clearResults = () => {
    setTestResults([]);
    setServerHealth(null);
    setBalance(null);
  };

  const formatPhoneNumber = (phone: string) => {
    // Supprimer tous les caractères non numériques sauf le +
    let cleaned = phone.replace(/[^\d+]/g, '');
    
    // Si le numéro commence par +, le supprimer
    if (cleaned.startsWith('+')) {
      cleaned = cleaned.substring(1);
    }
    
    // S'assurer que le numéro commence par 224 pour la Guinée
    if (!cleaned.startsWith('224')) {
      cleaned = '224' + cleaned;
    }
    
    // Limiter à 12 chiffres (224 + 9 chiffres)
    if (cleaned.length > 12) {
      cleaned = cleaned.substring(0, 12);
    }
    
    return cleaned;
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--zalama-text)] mb-2">
          Test SMS - Diagnostic
        </h1>
        <p className="text-[var(--zalama-text-secondary)]">
          Page de test pour diagnostiquer les problèmes d'envoi de SMS
        </p>
      </div>

      {/* Guide des formats de numéros */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
        <div className="flex items-start gap-3">
          <Info className="h-6 w-6 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="text-lg font-semibold text-blue-900 mb-3">
              📱 Formats de numéros recommandés pour la Guinée
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-blue-800 mb-2">✅ Formats acceptés :</h4>
                <ul className="space-y-1 text-sm text-blue-700">
                  <li>• <code className="bg-blue-100 px-1 rounded">+224625212115</code> (format international avec +)</li>
                  <li>• <code className="bg-blue-100 px-1 rounded">224625212115</code> (format international sans +)</li>
                  <li>• <code className="bg-blue-100 px-1 rounded">625212115</code> (format local)</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-red-800 mb-2">❌ Formats à éviter :</h4>
                <ul className="space-y-1 text-sm text-red-700">
                  <li>• <code className="bg-red-100 px-1 rounded">+224 625 212 115</code> (avec espaces)</li>
                  <li>• <code className="bg-red-100 px-1 rounded">(224) 625-212-115</code> (avec parenthèses)</li>
                  <li>• <code className="bg-red-100 px-1 rounded">06 25 21 21 15</code> (format français)</li>
                </ul>
              </div>
            </div>
            <div className="mt-4 p-3 bg-blue-100 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Note :</strong> Le système formatera automatiquement votre numéro au format <code className="bg-blue-200 px-1 rounded">224XXXXXXXXX</code> requis par l'API Nimba SMS.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Guide de dépannage */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-6 w-6 text-yellow-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="text-lg font-semibold text-yellow-900 mb-3">
              🔧 Dépannage - Erreurs courantes
            </h3>
            <div className="space-y-4 text-sm text-yellow-800">
              <div>
                <h4 className="font-medium mb-1">Si vous obtenez une erreur 500 :</h4>
                <ol className="list-decimal list-inside space-y-1 ml-4">
                  <li>Cliquez sur "Vérifier l'état du serveur" pour diagnostiquer</li>
                  <li>Assurez-vous que le serveur de développement est démarré</li>
                  <li>Vérifiez que le port 3001 est disponible</li>
                  <li>Redémarrez le serveur avec <code className="bg-yellow-100 px-1 rounded">npm run dev</code></li>
                  <li>Vérifiez les logs du serveur dans le terminal</li>
                </ol>
              </div>
              
              <div>
                <h4 className="font-medium mb-1">Si vous obtenez "Unexpected end of JSON input" :</h4>
                <ol className="list-decimal list-inside space-y-1 ml-4">
                  <li>Cliquez sur "Tester l'API simple" pour vérifier la connectivité</li>
                  <li>Vérifiez que le serveur répond correctement</li>
                  <li>Assurez-vous que toutes les routes API sont correctement définies</li>
                  <li>Vérifiez les logs du serveur pour les erreurs de syntaxe</li>
                  <li>Redémarrez le serveur de développement</li>
                </ol>
              </div>
              
              <div>
                <h4 className="font-medium mb-1">Commandes utiles :</h4>
                <div className="bg-yellow-100 p-2 rounded text-xs font-mono">
                  npm run dev<br/>
                  # ou<br/>
                  yarn dev<br/>
                  # ou<br/>
                  pnpm dev
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* État du serveur */}
      {serverHealth && (
        <div className="bg-[var(--zalama-card)] rounded-xl p-6 border border-[var(--zalama-border)] mb-6">
          <h2 className="text-xl font-semibold text-[var(--zalama-text)] mb-4">
            État du serveur
          </h2>
          <div className={`p-4 rounded-lg ${
            serverHealth.success 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            <div className="flex items-center gap-2 mb-3">
              {serverHealth.success ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600" />
              )}
              <span className="font-medium">
                {serverHealth.success ? 'Serveur opérationnel' : 'Serveur en erreur'}
              </span>
            </div>
            
            {serverHealth.environment && (
              <div className="mb-4">
                <h4 className="font-medium text-[var(--zalama-text)] mb-2">Configuration :</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  {Object.entries(serverHealth.environment).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-[var(--zalama-text-secondary)]">{key}:</span>
                      <span className={value.toString().includes('✅') ? 'text-green-600' : 'text-red-600'}>
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {serverHealth.services && (
              <div className="mb-4">
                <h4 className="font-medium text-[var(--zalama-text)] mb-2">Services :</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                  {Object.entries(serverHealth.services).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-[var(--zalama-text-secondary)]">{key}:</span>
                      <span className="text-green-600">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="text-xs text-[var(--zalama-text-secondary)]">
              Vérifié le : {new Date(serverHealth.timestamp).toLocaleString('fr-FR')}
            </div>
          </div>
        </div>
      )}

      {/* Configuration du test */}
      <div className="bg-[var(--zalama-card)] rounded-xl p-6 border border-[var(--zalama-border)] mb-6">
        <h2 className="text-xl font-semibold text-[var(--zalama-text)] mb-4">
          Configuration du test
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-[var(--zalama-text)] mb-2">
              Type de test
            </label>
            <select
              value={testType}
              onChange={(e) => setTestType(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)]"
            >
              <option value="simple">SMS simple</option>
              <option value="welcome_representant">SMS bienvenue représentant</option>
              <option value="welcome_rh">SMS bienvenue RH</option>
              <option value="welcome_employee">SMS bienvenue employé avec identifiants</option>
              <option value="partner_creation">Notification création partenaire</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-[var(--zalama-text)] mb-2">
              Numéro de téléphone
            </label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+224XXXXXXXXX"
              className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)]"
            />
            <p className="text-xs text-[var(--zalama-text-secondary)] mt-1">
              Formaté automatiquement en : {formatPhoneNumber(phoneNumber)}
            </p>
          </div>
        </div>

        {testType === 'simple' && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-[var(--zalama-text)] mb-2">
              Message (optionnel)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Message à envoyer..."
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-lighter)] text-[var(--zalama-text)]"
            />
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          <button
            onClick={testSMS}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--zalama-blue)] hover:bg-[var(--zalama-blue-accent)] text-white rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            Tester l'envoi SMS
          </button>

          <button
            onClick={checkBalance}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--zalama-success)] hover:bg-[var(--zalama-success-accent)] text-white rounded-lg transition-colors disabled:opacity-50"
          >
            <Phone className="h-4 w-4" />
            Vérifier le solde
          </button>

          <button
            onClick={checkServerHealth}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--zalama-success)] hover:bg-[var(--zalama-success-accent)] text-white rounded-lg transition-colors disabled:opacity-50"
          >
            <Info className="h-4 w-4" />
            Vérifier l'état du serveur
          </button>

          <button
            onClick={testSimpleAPI}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--zalama-success)] hover:bg-[var(--zalama-success-accent)] text-white rounded-lg transition-colors disabled:opacity-50"
          >
            <Info className="h-4 w-4" />
            Tester l'API simple
          </button>

          <button
            onClick={testAllAPIs}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--zalama-success)] hover:bg-[var(--zalama-success-accent)] text-white rounded-lg transition-colors disabled:opacity-50"
          >
            <Info className="h-4 w-4" />
            Tester toutes les APIs
          </button>

          <button
            onClick={clearResults}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--zalama-gray)] hover:bg-[var(--zalama-gray-accent)] text-white rounded-lg transition-colors"
          >
            <MessageSquare className="h-4 w-4" />
            Effacer les résultats
          </button>
        </div>
      </div>

      {/* Solde */}
      {balance && (
        <div className="bg-[var(--zalama-card)] rounded-xl p-6 border border-[var(--zalama-border)] mb-6">
          <h2 className="text-xl font-semibold text-[var(--zalama-text)] mb-4">
            Solde du compte SMS
          </h2>
          <div className="bg-[var(--zalama-bg-lighter)] rounded-lg p-4">
            <pre className="text-sm text-[var(--zalama-text)] overflow-x-auto">
              {JSON.stringify(balance, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {/* Résultats des tests */}
      <div className="bg-[var(--zalama-card)] rounded-xl p-6 border border-[var(--zalama-border)]">
        <h2 className="text-xl font-semibold text-[var(--zalama-text)] mb-4">
          Résultats des tests ({testResults.length})
        </h2>
        
        {testResults.length === 0 ? (
          <p className="text-[var(--zalama-text-secondary)] text-center py-8">
            Aucun test effectué pour le moment
          </p>
        ) : (
          <div className="space-y-4">
            {testResults.map((result) => (
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
                      {result.type}
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
                
                <div className="text-sm text-[var(--zalama-text)] mb-2">
                  <strong>Numéro:</strong> {result.phoneNumber}
                  <br />
                  <strong>Formaté:</strong> {formatPhoneNumber(result.phoneNumber)}
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
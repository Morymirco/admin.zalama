"use client";

import { useAuth } from '@/hooks/useAuth';
import authService from '@/services/authService';
import { useEffect, useState } from 'react';

export default function AuthTimeoutTest() {
  const [logs, setLogs] = useState<string[]>([]);
  const [testing, setTesting] = useState(false);
  const { user, userProfile, loading, isAuthenticated } = useAuth();

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  const testAuthOperations = async () => {
    setTesting(true);
    setLogs([]);
    
    addLog('🚀 Début des tests d\'authentification...');
    
    try {
      // Test 1: Récupération de session
      addLog('📋 Test 1: Récupération de session');
      const session = await authService.getSession();
      addLog(`✅ Session: ${session ? 'Trouvée' : 'Non trouvée'}`);
      
      // Test 2: Récupération utilisateur
      addLog('📋 Test 2: Récupération utilisateur');
      const currentUser = await authService.getCurrentUser();
      addLog(`✅ Utilisateur: ${currentUser ? currentUser.email : 'Non trouvé'}`);
      
      // Test 3: Récupération profil
      if (currentUser) {
        addLog('📋 Test 3: Récupération profil');
        const profile = await authService.getUserProfile(currentUser.id);
        addLog(`✅ Profil: ${profile ? profile.displayName : 'Non trouvé'}`);
      }
      
      addLog('🎉 Tous les tests terminés avec succès !');
    } catch (error) {
      addLog(`❌ Erreur durant les tests: ${error}`);
    } finally {
      setTesting(false);
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  useEffect(() => {
    addLog('🔄 Composant de test chargé');
    addLog(`📊 État initial - Authentifié: ${isAuthenticated}, Loading: ${loading}`);
  }, []);

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        🧪 Test des Timeouts d'Authentification
      </h2>
      
      {/* État actuel */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-700 mb-2">État Actuel</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">Chargement:</span> 
            <span className={`ml-2 px-2 py-1 rounded ${loading ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
              {loading ? 'En cours...' : 'Terminé'}
            </span>
          </div>
          <div>
            <span className="font-medium">Authentifié:</span> 
            <span className={`ml-2 px-2 py-1 rounded ${isAuthenticated ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {isAuthenticated ? 'Oui' : 'Non'}
            </span>
          </div>
          <div>
            <span className="font-medium">Email:</span> 
            <span className="ml-2 text-gray-600">{user?.email || 'N/A'}</span>
          </div>
          <div>
            <span className="font-medium">Rôle:</span> 
            <span className="ml-2 text-gray-600">{userProfile?.role || 'N/A'}</span>
          </div>
        </div>
      </div>

      {/* Contrôles */}
      <div className="mb-6 flex gap-4">
        <button
          onClick={testAuthOperations}
          disabled={testing}
          className={`px-4 py-2 rounded font-medium ${
            testing 
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {testing ? '🔄 Test en cours...' : '▶️ Lancer les tests'}
        </button>
        
        <button
          onClick={clearLogs}
          className="px-4 py-2 rounded font-medium bg-gray-600 text-white hover:bg-gray-700"
        >
          🗑️ Effacer les logs
        </button>
      </div>

      {/* Logs */}
      <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-sm h-96 overflow-y-auto">
        {logs.length === 0 ? (
          <div className="text-gray-500">Aucun log pour le moment...</div>
        ) : (
          logs.map((log, index) => (
            <div key={index} className="mb-1">
              {log}
            </div>
          ))
        )}
      </div>

      {/* Instructions */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-semibold text-blue-800 mb-2">💡 Instructions</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Ce composant teste les opérations d'authentification avec gestion des timeouts</li>
          <li>• Les erreurs de timeout devraient maintenant être gérées silencieusement</li>
          <li>• Surveillez la console pour vérifier l'absence d'erreurs de timeout</li>
          <li>• Les opérations devraient se terminer dans les 8 secondes maximum</li>
        </ul>
      </div>
    </div>
  );
} 
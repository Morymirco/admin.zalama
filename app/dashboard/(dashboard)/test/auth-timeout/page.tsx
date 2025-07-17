import AuthTimeoutTest from '@/components/test/AuthTimeoutTest';

export default function AuthTimeoutTestPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Test des Timeouts d'Authentification</h1>
        <p className="text-gray-600 mt-2">
          Cette page permet de tester la nouvelle gestion des timeouts d'authentification.
        </p>
      </div>
      
      <AuthTimeoutTest />
      
      <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="text-lg font-semibold text-yellow-800 mb-2">🔧 Changements Apportés</h3>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>• Configuration Supabase centralisée avec timeouts optimisés</li>
          <li>• Gestion des erreurs de timeout silencieuse (warnings au lieu d'erreurs)</li>
          <li>• Système de retry avec backoff exponentiel</li>
          <li>• Timeouts augmentés à 8-10 secondes</li>
          <li>• SupabaseAuthProvider utilisant le service d'authentification optimisé</li>
        </ul>
      </div>
    </div>
  );
} 
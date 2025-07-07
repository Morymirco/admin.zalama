import React, { useState } from 'react';

// Types pour l'API
interface NotificationRequest {
  recipients: string[];
  subject?: string;
  message: string;
  type?: 'email' | 'sms' | 'both';
  metadata?: Record<string, any>;
}

interface TemplateRequest {
  template: 'welcome' | 'notification' | 'alert';
  recipients: string[];
  variables: Record<string, string>;
  type?: 'email' | 'sms' | 'both';
}

// Service API
class ExternalApiService {
  private static API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  private static API_KEY = 'zalama_external_key_2024';

  private static async makeRequest(endpoint: string, data?: any) {
    const response = await fetch(`${this.API_BASE_URL}${endpoint}`, {
      method: data ? 'POST' : 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.API_KEY,
      },
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  static async sendNotification(data: NotificationRequest) {
    return this.makeRequest('/api/external/notifications', data);
  }

  static async sendTemplateNotification(data: TemplateRequest) {
    return this.makeRequest('/api/external/notifications/templates', data);
  }

  static async testConnection() {
    return this.makeRequest('/api/external/test');
  }
}

// Hook personnalisé
const useExternalNotifications = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<any>(null);

  const sendNotification = async (data: NotificationRequest) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await ExternalApiService.sendNotification(data);
      setLastResult(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const sendTemplateNotification = async (data: TemplateRequest) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await ExternalApiService.sendTemplateNotification(data);
      setLastResult(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await ExternalApiService.testConnection();
      setLastResult(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    sendNotification,
    sendTemplateNotification,
    testConnection,
    loading,
    error,
    lastResult,
  };
};

// Composant principal
export const NotificationSenderExample: React.FC = () => {
  const { sendNotification, sendTemplateNotification, testConnection, loading, error, lastResult } = useExternalNotifications();
  
  const [formData, setFormData] = useState({
    recipients: '',
    subject: '',
    message: '',
    type: 'email' as 'email' | 'sms' | 'both'
  });

  const [templateData, setTemplateData] = useState({
    template: 'welcome' as 'welcome' | 'notification' | 'alert',
    recipients: '',
    variables: {
      name: '',
      company: '',
      action: ''
    }
  });

  const handleDirectSend = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const result = await sendNotification({
        recipients: formData.recipients.split(',').map(r => r.trim()).filter(Boolean),
        subject: formData.subject,
        message: formData.message,
        type: formData.type
      });
      
      alert(`✅ Notification envoyée ! ID: ${result.id}`);
      setFormData({ recipients: '', subject: '', message: '', type: 'email' });
    } catch (err) {
      alert(`❌ Erreur lors de l'envoi: ${err instanceof Error ? err.message : 'Erreur inconnue'}`);
    }
  };

  const handleTemplateSend = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const result = await sendTemplateNotification({
        template: templateData.template,
        recipients: templateData.recipients.split(',').map(r => r.trim()).filter(Boolean),
        variables: templateData.variables
      });
      
      alert(`✅ Template envoyé ! ID: ${result.id}`);
      setTemplateData({
        template: 'welcome',
        recipients: '',
        variables: { name: '', company: '', action: '' }
      });
    } catch (err) {
      alert(`❌ Erreur lors de l'envoi: ${err instanceof Error ? err.message : 'Erreur inconnue'}`);
    }
  };

  const handleTestConnection = async () => {
    try {
      const result = await testConnection();
      alert(`✅ Connexion OK ! ${result.message}`);
    } catch (err) {
      alert(`❌ Erreur de connexion: ${err instanceof Error ? err.message : 'Erreur inconnue'}`);
    }
  };

  const handleQuickTest = async () => {
    try {
      await sendNotification({
        recipients: ['test@example.com'],
        subject: 'Test API Externe',
        message: 'Ceci est un test automatique de l\'API externe ZaLaMa.',
        type: 'email'
      });
      alert('✅ Test automatique réussi !');
    } catch (err) {
      alert(`❌ Test automatique échoué: ${err instanceof Error ? err.message : 'Erreur inconnue'}`);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">
          📬 API Notifications Externe ZaLaMa
        </h1>
        <p className="text-gray-600">
          Interface de test pour l'API externe de notifications
        </p>
      </div>

      {/* Status Bar */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={`w-3 h-3 rounded-full ${loading ? 'bg-yellow-400 animate-pulse' : 'bg-green-400'}`}></div>
            <span className="text-sm font-medium">
              {loading ? 'En cours...' : 'Prêt'}
            </span>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={handleTestConnection}
              disabled={loading}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 text-sm"
            >
              🔧 Test Connexion
            </button>
            <button
              onClick={handleQuickTest}
              disabled={loading}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 text-sm"
            >
              ⚡ Test Rapide
            </button>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
          <div className="flex items-center">
            <div className="text-red-400 mr-2">⚠️</div>
            <p className="text-red-700 font-medium">Erreur: {error}</p>
          </div>
        </div>
      )}

      {/* Success Display */}
      {lastResult && !error && (
        <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
          <div className="flex items-center">
            <div className="text-green-400 mr-2">✅</div>
            <p className="text-green-700 font-medium">
              Dernière opération réussie: {lastResult.message || 'Opération terminée'}
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Formulaire d'envoi direct */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            📧 Envoi Direct
            <span className="ml-2 text-sm text-gray-500">(SMS/Email)</span>
          </h2>
          
          <form onSubmit={handleDirectSend} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Destinataires *
              </label>
              <input
                type="text"
                value={formData.recipients}
                onChange={(e) => setFormData({...formData, recipients: e.target.value})}
                placeholder="user@example.com, +224123456789"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Séparez plusieurs destinataires par des virgules
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Sujet (optionnel)
              </label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({...formData, subject: e.target.value})}
                placeholder="Sujet de l'email"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Message *
              </label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({...formData, message: e.target.value})}
                placeholder="Votre message..."
                rows={4}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Type de notification
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value as any})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="email">📧 Email uniquement</option>
                <option value="sms">📱 SMS uniquement</option>
                <option value="both">📬 Email + SMS</option>
              </select>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-500 text-white py-3 px-6 rounded-lg hover:bg-blue-600 disabled:opacity-50 font-medium transition-colors"
            >
              {loading ? '⏳ Envoi en cours...' : '📤 Envoyer'}
            </button>
          </form>
        </div>

        {/* Formulaire avec template */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            📋 Envoi avec Template
            <span className="ml-2 text-sm text-gray-500">(Pré-formaté)</span>
          </h2>
          
          <form onSubmit={handleTemplateSend} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Template *
              </label>
              <select
                value={templateData.template}
                onChange={(e) => setTemplateData({...templateData, template: e.target.value as any})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="welcome">🎉 Bienvenue</option>
                <option value="notification">📢 Notification</option>
                <option value="alert">🚨 Alerte</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Destinataires *
              </label>
              <input
                type="text"
                value={templateData.recipients}
                onChange={(e) => setTemplateData({...templateData, recipients: e.target.value})}
                placeholder="user@example.com, +224123456789"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  Nom
                </label>
                <input
                  type="text"
                  value={templateData.variables.name}
                  onChange={(e) => setTemplateData({
                    ...templateData, 
                    variables: {...templateData.variables, name: e.target.value}
                  })}
                  placeholder="Nom du destinataire"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  Entreprise
                </label>
                <input
                  type="text"
                  value={templateData.variables.company}
                  onChange={(e) => setTemplateData({
                    ...templateData, 
                    variables: {...templateData.variables, company: e.target.value}
                  })}
                  placeholder="Nom de l'entreprise"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  Action
                </label>
                <input
                  type="text"
                  value={templateData.variables.action}
                  onChange={(e) => setTemplateData({
                    ...templateData, 
                    variables: {...templateData.variables, action: e.target.value}
                  })}
                  placeholder="Action à effectuer"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-500 text-white py-3 px-6 rounded-lg hover:bg-purple-600 disabled:opacity-50 font-medium transition-colors"
            >
              {loading ? '⏳ Envoi en cours...' : '📋 Envoyer avec Template'}
            </button>
          </form>
        </div>
      </div>

      {/* Informations */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-3 text-blue-800">ℹ️ Informations</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700">
          <div>
            <p><strong>Clé API :</strong> zalama_external_key_2024</p>
            <p><strong>Base URL :</strong> {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}</p>
          </div>
          <div>
            <p><strong>Formats supportés :</strong> Email, SMS, Email+SMS</p>
            <p><strong>Templates disponibles :</strong> Welcome, Notification, Alert</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationSenderExample; 
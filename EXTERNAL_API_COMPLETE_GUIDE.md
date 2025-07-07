# 📚 Guide Complet - API Externe ZaLaMa

## 🎯 Vue d'ensemble

L'API Externe ZaLaMa permet d'envoyer des notifications (SMS et emails) depuis des applications tierces ou des tableaux de bord partenaires. Cette API est sécurisée par une clé API et offre des fonctionnalités avancées comme les templates et l'envoi multi-destinataires.

## 🔑 Authentification

### Clé API
```
X-API-Key: zalama_external_key_2024
```

### Configuration
- **Base URL :** `http://localhost:3000` (développement)
- **Base URL :** `https://admin.zalama.com` (production)
- **Version :** v1.0

---

## 📧 Endpoints Disponibles

### 1. Envoi de Notifications Directes
**POST** `/api/external/notifications`

### 2. Envoi avec Templates
**POST** `/api/external/notifications/templates`

### 3. Test de Connexion
**GET** `/api/external/test`

---

## 🚀 Exemples d'Utilisation

### 📱 Exemple React/Next.js

#### Installation des dépendances
```bash
npm install axios
# ou
yarn add axios
```

#### Service API
```typescript
// services/externalApiService.ts
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const API_KEY = 'zalama_external_key_2024';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': API_KEY,
  },
});

export interface NotificationRequest {
  recipients: string[];
  subject?: string;
  message: string;
  type?: 'email' | 'sms' | 'both';
  metadata?: Record<string, any>;
}

export interface TemplateRequest {
  template: 'welcome' | 'notification' | 'alert';
  recipients: string[];
  variables: Record<string, string>;
  type?: 'email' | 'sms' | 'both';
}

export class ExternalApiService {
  // Envoyer une notification directe
  static async sendNotification(data: NotificationRequest) {
    try {
      const response = await apiClient.post('/api/external/notifications', data);
      return response.data;
    } catch (error) {
      console.error('Erreur envoi notification:', error);
      throw error;
    }
  }

  // Envoyer avec template
  static async sendTemplateNotification(data: TemplateRequest) {
    try {
      const response = await apiClient.post('/api/external/notifications/templates', data);
      return response.data;
    } catch (error) {
      console.error('Erreur envoi template:', error);
      throw error;
    }
  }

  // Tester la connexion
  static async testConnection() {
    try {
      const response = await apiClient.get('/api/external/test');
      return response.data;
    } catch (error) {
      console.error('Erreur test connexion:', error);
      throw error;
    }
  }
}
```

#### Hook React
```typescript
// hooks/useExternalNotifications.ts
import { useState } from 'react';
import { ExternalApiService, NotificationRequest, TemplateRequest } from '../services/externalApiService';

export const useExternalNotifications = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendNotification = async (data: NotificationRequest) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await ExternalApiService.sendNotification(data);
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
  };
};
```

#### Composant React d'Exemple
```tsx
// components/NotificationSender.tsx
import React, { useState } from 'react';
import { useExternalNotifications } from '../hooks/useExternalNotifications';

export const NotificationSender: React.FC = () => {
  const { sendNotification, sendTemplateNotification, testConnection, loading, error } = useExternalNotifications();
  
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
        recipients: formData.recipients.split(',').map(r => r.trim()),
        subject: formData.subject,
        message: formData.message,
        type: formData.type
      });
      
      alert(`Notification envoyée ! ID: ${result.id}`);
      setFormData({ recipients: '', subject: '', message: '', type: 'email' });
    } catch (err) {
      alert('Erreur lors de l\'envoi');
    }
  };

  const handleTemplateSend = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const result = await sendTemplateNotification({
        template: templateData.template,
        recipients: templateData.recipients.split(',').map(r => r.trim()),
        variables: templateData.variables
      });
      
      alert(`Template envoyé ! ID: ${result.id}`);
      setTemplateData({
        template: 'welcome',
        recipients: '',
        variables: { name: '', company: '', action: '' }
      });
    } catch (err) {
      alert('Erreur lors de l\'envoi');
    }
  };

  const handleTestConnection = async () => {
    try {
      const result = await testConnection();
      alert(`Connexion OK ! ${result.message}`);
    } catch (err) {
      alert('Erreur de connexion');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="bg-blue-50 p-4 rounded-lg">
        <h2 className="text-xl font-bold mb-4">🔧 Test de Connexion</h2>
        <button
          onClick={handleTestConnection}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Test en cours...' : 'Tester la connexion'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
          <p className="text-red-700">Erreur: {error}</p>
        </div>
      )}

      {/* Formulaire d'envoi direct */}
      <div className="bg-white border rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">📧 Envoi Direct</h2>
        <form onSubmit={handleDirectSend} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Destinataires (séparés par des virgules)
            </label>
            <input
              type="text"
              value={formData.recipients}
              onChange={(e) => setFormData({...formData, recipients: e.target.value})}
              placeholder="user@example.com, +224123456789"
              className="w-full p-2 border rounded"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Sujet</label>
            <input
              type="text"
              value={formData.subject}
              onChange={(e) => setFormData({...formData, subject: e.target.value})}
              placeholder="Sujet de l'email"
              className="w-full p-2 border rounded"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Message</label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData({...formData, message: e.target.value})}
              placeholder="Votre message..."
              rows={4}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({...formData, type: e.target.value as any})}
              className="w-full p-2 border rounded"
            >
              <option value="email">Email uniquement</option>
              <option value="sms">SMS uniquement</option>
              <option value="both">Email + SMS</option>
            </select>
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 disabled:opacity-50"
          >
            {loading ? 'Envoi en cours...' : 'Envoyer'}
          </button>
        </form>
      </div>

      {/* Formulaire avec template */}
      <div className="bg-white border rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">📋 Envoi avec Template</h2>
        <form onSubmit={handleTemplateSend} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Template</label>
            <select
              value={templateData.template}
              onChange={(e) => setTemplateData({...templateData, template: e.target.value as any})}
              className="w-full p-2 border rounded"
            >
              <option value="welcome">Bienvenue</option>
              <option value="notification">Notification</option>
              <option value="alert">Alerte</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">
              Destinataires (séparés par des virgules)
            </label>
            <input
              type="text"
              value={templateData.recipients}
              onChange={(e) => setTemplateData({...templateData, recipients: e.target.value})}
              placeholder="user@example.com, +224123456789"
              className="w-full p-2 border rounded"
              required
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nom</label>
              <input
                type="text"
                value={templateData.variables.name}
                onChange={(e) => setTemplateData({
                  ...templateData, 
                  variables: {...templateData.variables, name: e.target.value}
                })}
                placeholder="Nom du destinataire"
                className="w-full p-2 border rounded"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Entreprise</label>
              <input
                type="text"
                value={templateData.variables.company}
                onChange={(e) => setTemplateData({
                  ...templateData, 
                  variables: {...templateData.variables, company: e.target.value}
                })}
                placeholder="Nom de l'entreprise"
                className="w-full p-2 border rounded"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Action</label>
              <input
                type="text"
                value={templateData.variables.action}
                onChange={(e) => setTemplateData({
                  ...templateData, 
                  variables: {...templateData.variables, action: e.target.value}
                })}
                placeholder="Action à effectuer"
                className="w-full p-2 border rounded"
              />
            </div>
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="bg-purple-500 text-white px-6 py-2 rounded hover:bg-purple-600 disabled:opacity-50"
          >
            {loading ? 'Envoi en cours...' : 'Envoyer avec Template'}
          </button>
        </form>
      </div>
    </div>
  );
};
```

#### Page d'utilisation
```tsx
// pages/notifications.tsx
import { NotificationSender } from '../components/NotificationSender';

export default function NotificationsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">
          📬 API Notifications Externe
        </h1>
        <NotificationSender />
      </div>
    </div>
  );
}
```

---

## 📮 Exemples Postman

### Collection Postman

Téléchargez cette collection JSON et importez-la dans Postman :

```json
{
  "info": {
    "name": "ZaLaMa External API",
    "description": "API externe pour l'envoi de notifications",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:3000",
      "type": "string"
    },
    {
      "key": "apiKey",
      "value": "zalama_external_key_2024",
      "type": "string"
    }
  ],
  "item": [
    {
      "name": "Test de Connexion",
      "request": {
        "method": "GET",
        "header": [
          {
            "key": "X-API-Key",
            "value": "{{apiKey}}",
            "type": "text"
          }
        ],
        "url": {
          "raw": "{{baseUrl}}/api/external/test",
          "host": ["{{baseUrl}}"],
          "path": ["api", "external", "test"]
        }
      }
    },
    {
      "name": "Envoi Email Direct",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json",
            "type": "text"
          },
          {
            "key": "X-API-Key",
            "value": "{{apiKey}}",
            "type": "text"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"recipients\": [\"user@example.com\"],\n  \"subject\": \"Test Email\",\n  \"message\": \"Ceci est un test d'email via l'API externe.\",\n  \"type\": \"email\"\n}"
        },
        "url": {
          "raw": "{{baseUrl}}/api/external/notifications",
          "host": ["{{baseUrl}}"],
          "path": ["api", "external", "notifications"]
        }
      }
    },
    {
      "name": "Envoi SMS Direct",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json",
            "type": "text"
          },
          {
            "key": "X-API-Key",
            "value": "{{apiKey}}",
            "type": "text"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"recipients\": [\"+224123456789\"],\n  \"message\": \"Test SMS via API externe\",\n  \"type\": \"sms\"\n}"
        },
        "url": {
          "raw": "{{baseUrl}}/api/external/notifications",
          "host": ["{{baseUrl}}"],
          "path": ["api", "external", "notifications"]
        }
      }
    },
    {
      "name": "Envoi Email + SMS",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json",
            "type": "text"
          },
          {
            "key": "X-API-Key",
            "value": "{{apiKey}}",
            "type": "text"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"recipients\": [\"user@example.com\", \"+224123456789\"],\n  \"subject\": \"Notification importante\",\n  \"message\": \"Message envoyé par email et SMS\",\n  \"type\": \"both\",\n  \"metadata\": {\n    \"source\": \"partner-dashboard\",\n    \"priority\": \"high\"\n  }\n}"
        },
        "url": {
          "raw": "{{baseUrl}}/api/external/notifications",
          "host": ["{{baseUrl}}"],
          "path": ["api", "external", "notifications"]
        }
      }
    },
    {
      "name": "Template - Bienvenue",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json",
            "type": "text"
          },
          {
            "key": "X-API-Key",
            "value": "{{apiKey}}",
            "type": "text"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"template\": \"welcome\",\n  \"recipients\": [\"user@example.com\"],\n  \"variables\": {\n    \"name\": \"John Doe\",\n    \"company\": \"TechCorp\",\n    \"action\": \"se connecter\"\n  },\n  \"type\": \"email\"\n}"
        },
        "url": {
          "raw": "{{baseUrl}}/api/external/notifications/templates",
          "host": ["{{baseUrl}}"],
          "path": ["api", "external", "notifications", "templates"]
        }
      }
    },
    {
      "name": "Template - Notification",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json",
            "type": "text"
          },
          {
            "key": "X-API-Key",
            "value": "{{apiKey}}",
            "type": "text"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"template\": \"notification\",\n  \"recipients\": [\"+224123456789\"],\n  \"variables\": {\n    \"name\": \"Alice\",\n    \"company\": \"StartupXYZ\",\n    \"action\": \"valider le contrat\"\n  },\n  \"type\": \"sms\"\n}"
        },
        "url": {
          "raw": "{{baseUrl}}/api/external/notifications/templates",
          "host": ["{{baseUrl}}"],
          "path": ["api", "external", "notifications", "templates"]
        }
      }
    },
    {
      "name": "Template - Alerte",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json",
            "type": "text"
          },
          {
            "key": "X-API-Key",
            "value": "{{apiKey}}",
            "type": "text"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"template\": \"alert\",\n  \"recipients\": [\"admin@company.com\", \"+224123456789\"],\n  \"variables\": {\n    \"name\": \"Système\",\n    \"company\": \"ZaLaMa\",\n    \"action\": \"vérifier les logs\"\n  },\n  \"type\": \"both\"\n}"
        },
        "url": {
          "raw": "{{baseUrl}}/api/external/notifications/templates",
          "host": ["{{baseUrl}}"],
          "path": ["api", "external", "notifications", "templates"]
        }
      }
    }
  ]
}
```

### Instructions Postman

1. **Import de la Collection**
   - Ouvrez Postman
   - Cliquez sur "Import"
   - Collez le JSON ci-dessus
   - Cliquez sur "Import"

2. **Configuration des Variables**
   - Ouvrez la collection
   - Allez dans l'onglet "Variables"
   - Modifiez `baseUrl` selon votre environnement
   - Vérifiez que `apiKey` est correct

3. **Test des Endpoints**
   - Commencez par "Test de Connexion"
   - Puis testez les autres endpoints dans l'ordre

---

## 🔧 Configuration Environnement

### Variables d'Environnement (.env.local)
```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000
EXTERNAL_API_KEY=zalama_external_key_2024

# Production
# NEXT_PUBLIC_API_URL=https://admin.zalama.com
# EXTERNAL_API_KEY=votre_cle_securisee_production
```

### Configuration TypeScript (tsconfig.json)
```json
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

---

## 🚨 Gestion d'Erreurs

### Codes d'Erreur Communs

| Code | Message | Solution |
|------|---------|----------|
| 401 | Unauthorized | Vérifiez la clé API |
| 400 | Bad Request | Vérifiez le format des données |
| 429 | Too Many Requests | Attendez avant de réessayer |
| 500 | Internal Server Error | Contactez le support |

### Exemple de Gestion d'Erreurs React
```typescript
const handleError = (error: any) => {
  if (error.response) {
    switch (error.response.status) {
      case 401:
        alert('Clé API invalide');
        break;
      case 400:
        alert('Données invalides: ' + error.response.data.error);
        break;
      case 429:
        alert('Trop de requêtes. Réessayez plus tard.');
        break;
      default:
        alert('Erreur serveur: ' + error.response.data.error);
    }
  } else if (error.request) {
    alert('Erreur de connexion au serveur');
  } else {
    alert('Erreur inattendue: ' + error.message);
  }
};
```

---

## 📊 Monitoring et Logs

### Exemple de Logging
```typescript
const logNotification = (data: any, result: any) => {
  console.log('📬 Notification envoyée:', {
    timestamp: new Date().toISOString(),
    recipients: data.recipients,
    type: data.type,
    template: data.template,
    result: result,
    success: result.success
  });
};
```

### Métriques à Surveiller
- Taux de succès des envois
- Temps de réponse de l'API
- Nombre de requêtes par minute
- Erreurs par type

---

## 🔒 Sécurité

### Bonnes Pratiques
1. **Ne jamais exposer la clé API côté client**
2. **Utiliser HTTPS en production**
3. **Limiter les permissions de la clé**
4. **Surveiller l'utilisation de l'API**
5. **Changer régulièrement la clé**

### Exemple de Sécurisation
```typescript
// ✅ Bon - Clé côté serveur
const API_KEY = process.env.EXTERNAL_API_KEY;

// ❌ Mauvais - Clé côté client
const API_KEY = 'zalama_external_key_2024';
```

---

## 📞 Support

Pour toute question ou problème :
- 📧 Email : support@zalama.com
- 📞 Téléphone : +224 XXX XXX XXX
- 💬 Chat : Disponible sur la plateforme

---

*Documentation mise à jour le : ${new Date().toLocaleDateString('fr-FR')}* 
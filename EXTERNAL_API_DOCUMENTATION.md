# API Externe ZaLaMa - Documentation

## Vue d'ensemble

L'API externe ZaLaMa permet aux applications partenaires d'envoyer des SMS et des emails via les services ZaLaMa. Cette API est sécurisée par une clé API et accessible sans authentification complexe.

## Configuration

### Variables d'environnement

```env
EXTERNAL_API_KEY=zalama_external_key_2024
```

### Base URL

```
https://admin.zalama.com/api/external
```

## Authentification

Toutes les requêtes doivent inclure la clé API dans les headers :

```javascript
headers: {
  'Content-Type': 'application/json',
  'x-api-key': 'votre_clé_api'
}
```

Ou via Authorization Bearer :

```javascript
headers: {
  'Content-Type': 'application/json',
  'Authorization': 'Bearer votre_clé_api'
}
```

## Endpoints

### 1. Statut de l'API

**GET** `/api/external/notifications`

Vérifie le statut de l'API et des services.

#### Réponse

```json
{
  "success": true,
  "status": "online",
  "services": {
    "sms": {
      "available": true,
      "balance": 1000,
      "currency": "GNF"
    },
    "email": {
      "available": true
    }
  },
  "timestamp": "2024-01-15T10:30:00.000Z",
  "version": "1.0.0"
}
```

### 2. Envoi de notifications personnalisées

**POST** `/api/external/notifications`

Envoie des SMS et/ou emails personnalisés.

#### Body

```json
{
  "type": "both",
  "recipients": [
    {
      "phone": "+224623456789",
      "email": "user@example.com",
      "name": "Nom Utilisateur"
    }
  ],
  "message": {
    "subject": "Sujet de l'email",
    "content": "Contenu du message",
    "html": "<h1>Contenu HTML</h1>"
  },
  "metadata": {
    "partner_id": "partner-123",
    "user_id": "user-456",
    "request_id": "req-789"
  }
}
```

#### Paramètres

- `type`: `"sms"` | `"email"` | `"both"` - Type de notification
- `recipients`: Array d'objets avec `phone`, `email`, `name`
- `message`: Objet avec `subject`, `content`, `html`
- `metadata`: Métadonnées optionnelles

#### Réponse

```json
{
  "success": true,
  "message": "Notifications traitées: 2 réussies, 0 échouées",
  "results": {
    "sms": [
      {
        "recipient": "+224623456789",
        "name": "Nom Utilisateur",
        "success": true,
        "message_id": "msg_123",
        "error": null
      }
    ],
    "email": [
      {
        "recipient": "user@example.com",
        "name": "Nom Utilisateur",
        "success": true,
        "message_id": "email_456",
        "error": null
      }
    ],
    "total": 2,
    "success": 2,
    "failed": 0
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 3. Templates disponibles

**GET** `/api/external/notifications/templates`

Liste les templates prédéfinis disponibles.

#### Réponse

```json
{
  "success": true,
  "templates": [
    {
      "name": "welcome",
      "description": "Email et SMS de bienvenue pour nouveaux utilisateurs",
      "variables": ["name"]
    },
    {
      "name": "notification",
      "description": "Notification générale",
      "variables": ["name", "message"]
    },
    {
      "name": "alert",
      "description": "Alerte urgente",
      "variables": ["name", "message"]
    }
  ],
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 4. Envoi avec templates

**POST** `/api/external/notifications/templates`

Envoie des notifications en utilisant des templates prédéfinis.

#### Body

```json
{
  "template": "welcome",
  "recipients": [
    {
      "phone": "+224623456789",
      "email": "user@example.com",
      "name": "Nouveau Utilisateur"
    }
  ],
  "variables": {
    "name": "Nouveau Utilisateur"
  },
  "metadata": {
    "partner_id": "partner-123"
  }
}
```

#### Templates disponibles

##### Welcome
- **SMS**: "Bienvenue sur ZaLaMa ! Votre compte a été créé avec succès. Connectez-vous sur https://admin.zalama.com"
- **Email**: Template HTML de bienvenue avec variables `{{name}}`
- **Variables**: `name`

##### Notification
- **SMS**: "ZaLaMa: {{message}}"
- **Email**: Template HTML de notification avec variables `{{name}}` et `{{message}}`
- **Variables**: `name`, `message`

##### Alert
- **SMS**: "🚨 ALERTE ZaLaMa: {{message}}"
- **Email**: Template HTML d'alerte avec variables `{{name}}` et `{{message}}`
- **Variables**: `name`, `message`

## Codes d'erreur

| Code | Description |
|------|-------------|
| `UNAUTHORIZED` | Clé API invalide ou manquante |
| `INVALID_REQUEST` | Données manquantes ou invalides |
| `INVALID_RECIPIENTS` | Aucun destinataire valide |
| `TEMPLATE_NOT_FOUND` | Template non trouvé |
| `INTERNAL_ERROR` | Erreur interne du serveur |

## Exemples d'utilisation

### JavaScript/Node.js

```javascript
const API_KEY = 'votre_clé_api';
const API_URL = 'https://admin.zalama.com/api/external';

// Envoi de notification personnalisée
async function sendCustomNotification() {
  const response = await fetch(`${API_URL}/notifications`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY
    },
    body: JSON.stringify({
      type: 'both',
      recipients: [
        {
          phone: '+224623456789',
          email: 'user@example.com',
          name: 'Utilisateur Test'
        }
      ],
      message: {
        subject: 'Test API',
        content: 'Message de test',
        html: '<h1>Test</h1><p>Message de test</p>'
      }
    })
  });

  const result = await response.json();
  console.log(result);
}

// Envoi avec template
async function sendTemplateNotification() {
  const response = await fetch(`${API_URL}/notifications/templates`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY
    },
    body: JSON.stringify({
      template: 'welcome',
      recipients: [
        {
          phone: '+224623456789',
          email: 'newuser@example.com',
          name: 'Nouveau Utilisateur'
        }
      ],
      variables: {
        name: 'Nouveau Utilisateur'
      }
    })
  });

  const result = await response.json();
  console.log(result);
}
```

### PHP

```php
<?php
$apiKey = 'votre_clé_api';
$apiUrl = 'https://admin.zalama.com/api/external';

// Envoi de notification personnalisée
function sendCustomNotification() {
    global $apiKey, $apiUrl;
    
    $data = [
        'type' => 'both',
        'recipients' => [
            [
                'phone' => '+224623456789',
                'email' => 'user@example.com',
                'name' => 'Utilisateur Test'
            ]
        ],
        'message' => [
            'subject' => 'Test API',
            'content' => 'Message de test',
            'html' => '<h1>Test</h1><p>Message de test</p>'
        ]
    ];

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $apiUrl . '/notifications');
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'x-api-key: ' . $apiKey
    ]);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

    $response = curl_exec($ch);
    curl_close($ch);

    return json_decode($response, true);
}
?>
```

### Python

```python
import requests
import json

API_KEY = 'votre_clé_api'
API_URL = 'https://admin.zalama.com/api/external'

# Envoi de notification personnalisée
def send_custom_notification():
    headers = {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY
    }
    
    data = {
        'type': 'both',
        'recipients': [
            {
                'phone': '+224623456789',
                'email': 'user@example.com',
                'name': 'Utilisateur Test'
            }
        ],
        'message': {
            'subject': 'Test API',
            'content': 'Message de test',
            'html': '<h1>Test</h1><p>Message de test</p>'
        }
    }
    
    response = requests.post(
        f'{API_URL}/notifications',
        headers=headers,
        json=data
    )
    
    return response.json()

# Envoi avec template
def send_template_notification():
    headers = {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY
    }
    
    data = {
        'template': 'welcome',
        'recipients': [
            {
                'phone': '+224623456789',
                'email': 'newuser@example.com',
                'name': 'Nouveau Utilisateur'
            }
        ],
        'variables': {
            'name': 'Nouveau Utilisateur'
        }
    }
    
    response = requests.post(
        f'{API_URL}/notifications/templates',
        headers=headers,
        json=data
    )
    
    return response.json()
```

## Sécurité

- Toutes les requêtes doivent inclure une clé API valide
- Les clés API sont uniques par partenaire
- Les logs d'activité sont conservés pour audit
- Rate limiting recommandé côté client

## Support

Pour toute question ou assistance :
- Email : api-support@zalama.com
- Documentation : https://docs.zalama.com/api
- Status : https://status.zalama.com 
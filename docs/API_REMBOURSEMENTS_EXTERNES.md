# API Remboursements Externes - ZaLaMa

Cette API permet aux partenaires de ZaLaMa d'effectuer des remboursements vers ZaLaMa via Lengo Pay, soit individuellement soit en masse pour tous leurs employés.

## 🔐 Authentification

Toutes les requêtes doivent inclure une clé API dans le header `Authorization` :

```bash
Authorization: Bearer zalama_partner_key_2024_secure_1
```

## 📋 Endpoints

### 1. Initier un Remboursement

**POST** `/api/payments/lengo-external`

L'API supporte deux modes :
- **Remboursement individuel** : Pour un employé spécifique
- **Remboursement en masse** : Pour tous les employés en une fois

#### A. Remboursement Individuel

```json
{
  "partner_id": "uuid-du-partenaire",
  "amount": 50000,
  "currency": "GNF",
  "description": "Remboursement frais de service",
  "reference": "REF-2024-001",
  "employee_id": "uuid-de-l-employe", // Optionnel
  "metadata": {
    "motif": "Frais de transport",
    "periode": "Janvier 2024"
  }
}
```

#### B. Remboursement en Masse (Tous les Employés)

```json
{
  "partner_id": "uuid-du-partenaire",
  "currency": "GNF",
  "description": "Remboursement mensuel tous employés",
  "reference": "BULK-REF-2024-001",
  "employees": [
    {
      "employee_id": "uuid-employe-1",
      "amount": 25000,
      "description": "Frais de transport"
    },
    {
      "employee_id": "uuid-employe-2", 
      "amount": 30000,
      "description": "Frais de repas"
    },
    {
      "employee_id": "uuid-employe-3",
      "amount": 15000,
      "description": "Frais de communication"
    }
  ],
  "metadata": {
    "periode": "Janvier 2024",
    "type": "remboursement_mensuel"
  }
}
```

#### Réponse de succès

```json
{
  "success": true,
  "message": "Remboursement en masse Lengo Pay initié avec succès",
  "data": {
    "remboursement_id": "uuid-du-remboursement",
    "pay_id": "lengo-pay-id",
    "payment_url": "https://portal.lengopay.com/pay/...",
    "amount": 70000,
    "currency": "GNF",
    "partner": {
      "id": "uuid-du-partenaire",
      "nom": "Nom du Partenaire"
    },
    "employees": [
      {
        "id": "uuid-employe-1",
        "nom": "Nom1",
        "prenom": "Prénom1"
      },
      {
        "id": "uuid-employe-2",
        "nom": "Nom2", 
        "prenom": "Prénom2"
      },
      {
        "id": "uuid-employe-3",
        "nom": "Nom3",
        "prenom": "Prénom3"
      }
    ],
    "employee_reimbursements": [
      {
        "employee_id": "uuid-employe-1",
        "amount": 25000,
        "description": "Frais de transport"
      },
      {
        "employee_id": "uuid-employe-2",
        "amount": 30000,
        "description": "Frais de repas"
      },
      {
        "employee_id": "uuid-employe-3",
        "amount": 15000,
        "description": "Frais de communication"
      }
    ],
    "reference": "BULK-REF-2024-001",
    "is_bulk": true,
    "employee_count": 3,
    "expires_at": "2024-01-15T10:30:00.000Z"
  },
  "request_id": "abc123",
  "timestamp": "2024-01-15T10:00:00.000Z"
}
```

### 2. Vérifier le Statut d'un Remboursement

**GET** `/api/payments/lengo-external/status/{remboursement_id}`

#### Réponse

```json
{
  "success": true,
  "message": "Statut remboursement externe récupéré avec succès",
  "data": {
    "remboursement_id": "uuid-du-remboursement",
    "status": "PAYE",
    "status_lengo": "SUCCESS",
    "partenaire": {
      "id": "uuid-du-partenaire",
      "nom": "Nom du Partenaire",
      "email": "partenaire@example.com",
      "telephone": "+224XXXXXXXXX"
    },
    "employees": [
      {
        "id": "uuid-employe-1",
        "nom": "Nom1",
        "prenom": "Prénom1",
        "email": "employe1@example.com",
        "telephone": "+224XXXXXXXXX"
      }
    ],
    "amount": 70000,
    "currency": "GNF",
    "reference": "BULK-REF-2024-001",
    "pay_id": "lengo-pay-id",
    "created_at": "2024-01-15T10:00:00.000Z",
    "updated_at": "2024-01-15T10:05:00.000Z",
    "date_remboursement_effectue": "2024-01-15T10:05:00.000Z",
    "is_bulk": true,
    "employee_count": 3
  },
  "request_id": "def456",
  "timestamp": "2024-01-15T10:10:00.000Z"
}
```

## 📊 Statuts Possibles

### Statuts de Remboursement
- `EN_ATTENTE` - Remboursement en attente de paiement
- `PAYE` - Remboursement payé avec succès
- `ANNULE` - Remboursement annulé ou échoué

### Statuts Lengo Pay
- `SUCCESS` - Transaction réussie
- `FAILED` - Transaction échouée
- `CANCELLED` - Transaction annulée
- `PENDING` - Transaction en attente

## 🔄 Flux de Remboursement

1. **Initiation** : Le partenaire appelle l'API pour initier un remboursement (individuel ou en masse)
2. **Paiement** : Le partenaire est redirigé vers Lengo Pay pour effectuer le paiement
3. **Callback** : Lengo Pay notifie ZaLaMa du statut du paiement
4. **Vérification** : Le partenaire peut vérifier le statut via l'API

## 📝 Exemples d'Utilisation

### JavaScript/Node.js

#### Remboursement Individuel

```javascript
// Remboursement d'un employé spécifique
const remboursementIndividuel = async () => {
  const response = await fetch('https://admin.zalamasas.com/api/payments/lengo-external', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer zalama_partner_key_2024_secure_1',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      partner_id: 'votre-partner-id',
      amount: 50000,
      currency: 'GNF',
      description: 'Remboursement frais de transport',
      reference: 'REF-' + Date.now(),
      employee_id: 'uuid-employe'
    })
  });

  const result = await response.json();
  
  if (result.success) {
    // Rediriger vers Lengo Pay
    window.location.href = result.data.payment_url;
  }
};
```

#### Remboursement en Masse

```javascript
// Remboursement de tous les employés en une fois
const remboursementEnMasse = async () => {
  const response = await fetch('https://admin.zalamasas.com/api/payments/lengo-external', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer zalama_partner_key_2024_secure_1',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      partner_id: 'votre-partner-id',
      currency: 'GNF',
      description: 'Remboursement mensuel tous employés',
      reference: 'BULK-REF-' + Date.now(),
      employees: [
        {
          employee_id: 'uuid-employe-1',
          amount: 25000,
          description: 'Frais de transport'
        },
        {
          employee_id: 'uuid-employe-2',
          amount: 30000,
          description: 'Frais de repas'
        },
        {
          employee_id: 'uuid-employe-3',
          amount: 15000,
          description: 'Frais de communication'
        }
      ],
      metadata: {
        periode: 'Janvier 2024',
        type: 'remboursement_mensuel'
      }
    })
  });

  const result = await response.json();
  
  if (result.success) {
    console.log(`Remboursement en masse initié pour ${result.data.employee_count} employés`);
    console.log(`Montant total: ${result.data.amount} ${result.data.currency}`);
    // Rediriger vers Lengo Pay
    window.location.href = result.data.payment_url;
  }
};

// Vérifier le statut
const verifierStatut = async (remboursementId) => {
  const response = await fetch(`https://admin.zalamasas.com/api/payments/lengo-external/status/${remboursementId}`, {
    headers: {
      'Authorization': 'Bearer zalama_partner_key_2024_secure_1'
    }
  });

  const result = await response.json();
  console.log('Statut:', result.data.status);
  console.log('Nombre d\'employés:', result.data.employee_count);
  console.log('Est en masse:', result.data.is_bulk);
};
```

### cURL

#### Remboursement Individuel

```bash
curl -X POST https://admin.zalamasas.com/api/payments/lengo-external \
  -H "Authorization: Bearer zalama_partner_key_2024_secure_1" \
  -H "Content-Type: application/json" \
  -d '{
    "partner_id": "votre-partner-id",
    "amount": 50000,
    "currency": "GNF",
    "description": "Remboursement frais de transport",
    "reference": "REF-2024-001",
    "employee_id": "uuid-employe"
  }'
```

#### Remboursement en Masse

```bash
curl -X POST https://admin.zalamasas.com/api/payments/lengo-external \
  -H "Authorization: Bearer zalama_partner_key_2024_secure_1" \
  -H "Content-Type: application/json" \
  -d '{
    "partner_id": "votre-partner-id",
    "currency": "GNF",
    "description": "Remboursement mensuel tous employés",
    "reference": "BULK-REF-2024-001",
    "employees": [
      {
        "employee_id": "uuid-employe-1",
        "amount": 25000,
        "description": "Frais de transport"
      },
      {
        "employee_id": "uuid-employe-2",
        "amount": 30000,
        "description": "Frais de repas"
      },
      {
        "employee_id": "uuid-employe-3",
        "amount": 15000,
        "description": "Frais de communication"
      }
    ]
  }'
```

## 🎯 Cas d'Usage

### Remboursement Mensuel en Masse
Les partenaires peuvent rembourser tous leurs employés en une seule transaction :
- Frais de transport
- Frais de repas
- Frais de communication
- Indemnités diverses

### Remboursement Individuel
Pour des cas spécifiques :
- Remboursement d'un employé particulier
- Montants différents selon les besoins
- Descriptions personnalisées

## ⚠️ Gestion des Erreurs

### Erreurs d'Authentification (401)
```json
{
  "error": "Clé API invalide ou manquante"
}
```

### Erreurs de Validation (400)
```json
{
  "error": "Liste des employés requise et non vide"
}
```

### Erreurs de Partenaire (404)
```json
{
  "error": "Certains employés n'appartiennent pas au partenaire"
}
```

### Erreurs de Serveur (500)
```json
{
  "error": "Erreur serveur interne"
}
```

## 🔒 Sécurité

- **CORS** : Seules les origines autorisées peuvent accéder à l'API
- **API Keys** : Chaque partenaire a sa propre clé API
- **Validation** : Toutes les données sont validées côté serveur
- **Logging** : Toutes les requêtes sont loggées pour audit
- **Vérification Employés** : Seuls les employés du partenaire peuvent être remboursés

## 📞 Support

Pour obtenir votre clé API ou en cas de problème :
- Email : support@zalamasas.com
- Téléphone : +224 XXX XXX XXX
- Documentation : https://docs.zalamasas.com 
# API Remboursements Externes - ZaLaMa

Cette API permet aux partenaires de ZaLaMa d'effectuer des remboursements vers ZaLaMa via Lengo Pay, soit pour des transactions spécifiques soit pour des remboursements libres.

## 🔐 Authentification

Toutes les requêtes doivent inclure une clé API dans le header `Authorization` :

```bash
Authorization: Bearer zalama_partner_key_2024_secure_1
```

## 📋 Endpoints

### 1. Initier un Remboursement

**POST** `/api/payments/lengo-external`

L'API supporte trois modes :
- **Remboursement de transaction** : Pour une transaction spécifique liée à une demande d'avance
- **Remboursement en masse de transactions** : Pour plusieurs transactions en une fois
- **Remboursement libre** : Pour un montant personnalisé (ancien format)

#### A. Remboursement d'une Transaction Spécifique

```json
{
  "partner_id": "uuid-du-partenaire",
  "transaction_id": "uuid-de-la-transaction",
  "currency": "GNF",
  "description": "Remboursement avance sur salaire",
  "reference": "TXN-REF-2024-001",
  "metadata": {
    "motif": "Avance sur salaire",
    "periode": "Janvier 2024"
  }
}
```

#### B. Remboursement en Masse de Transactions

```json
{
  "partner_id": "uuid-du-partenaire",
  "currency": "GNF",
  "description": "Remboursement avances sur salaire",
  "reference": "BULK-TXN-REF-2024-001",
  "transactions": [
    {
      "transaction_id": "uuid-transaction-1",
      "description": "Avance frais de transport"
    },
    {
      "transaction_id": "uuid-transaction-2",
      "description": "Avance frais de repas"
    },
    {
      "transaction_id": "uuid-transaction-3",
      "description": "Avance frais de communication"
    }
  ],
  "metadata": {
    "periode": "Janvier 2024",
    "type": "remboursement_avances"
  }
}
```

#### C. Remboursement Libre (Ancien Format)

```json
{
  "partner_id": "uuid-du-partenaire",
  "amount": 50000,
  "currency": "GNF",
  "description": "Remboursement frais de service",
  "reference": "FREE-REF-2024-001",
  "employee_id": "uuid-de-l-employe", // Optionnel
  "metadata": {
    "motif": "Frais de transport",
    "periode": "Janvier 2024"
  }
}
```

#### Réponse de succès (Transaction)

```json
{
  "success": true,
  "message": "Remboursement transaction Lengo Pay initié avec succès",
  "data": {
    "remboursement_id": "uuid-du-remboursement",
    "pay_id": "lengo-pay-id",
    "payment_url": "https://portal.lengopay.com/pay/...",
    "amount": 75000,
    "currency": "GNF",
    "partner": {
      "id": "uuid-du-partenaire",
      "nom": "Nom du Partenaire"
    },
    "transaction": {
      "id": "uuid-transaction",
      "numero_transaction": "TXN001",
      "montant": 50000,
      "date_transaction": "2024-01-15T10:00:00.000Z"
    },
    "employe": {
      "id": "uuid-employe",
      "nom": "Nom",
      "prenom": "Prénom"
    },
    "demande": {
      "id": "uuid-demande",
      "motif": "Frais de transport"
    },
    "reference": "TXN-REF-2024-001",
    "type": "transaction_reimbursement",
    "expires_at": "2024-01-15T10:30:00.000Z"
  },
  "request_id": "abc123",
  "timestamp": "2024-01-15T10:00:00.000Z"
}
```

#### Réponse de succès (Masse)

```json
{
  "success": true,
  "message": "Remboursement en masse transactions Lengo Pay initié avec succès",
  "data": {
    "remboursements_ids": ["uuid-1", "uuid-2", "uuid-3"],
    "pay_id": "lengo-pay-id",
    "payment_url": "https://portal.lengopay.com/pay/...",
    "amount": 150000,
    "currency": "GNF",
    "partner": {
      "id": "uuid-du-partenaire",
      "nom": "Nom du Partenaire"
    },
    "transactions": [
      {
        "id": "uuid-transaction-1",
        "numero_transaction": "TXN001",
        "montant": 50000,
        "employe": {
          "id": "uuid-employe-1",
          "nom": "Nom1",
          "prenom": "Prénom1"
        }
      },
      {
        "id": "uuid-transaction-2",
        "numero_transaction": "TXN002",
        "montant": 60000,
        "employe": {
          "id": "uuid-employe-2",
          "nom": "Nom2",
          "prenom": "Prénom2"
        }
      }
    ],
    "transaction_reimbursements": [
      {
        "transaction_id": "uuid-transaction-1",
        "description": "Avance frais de transport"
      },
      {
        "transaction_id": "uuid-transaction-2",
        "description": "Avance frais de repas"
      }
    ],
    "reference": "BULK-TXN-REF-2024-001",
    "type": "bulk_transaction_reimbursement",
    "nombre_remboursements": 2,
    "expires_at": "2024-01-15T10:30:00.000Z"
  },
  "request_id": "def456",
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
    "transaction": {
      "id": "uuid-transaction",
      "numero_transaction": "TXN001",
      "montant": 50000,
      "date_transaction": "2024-01-15T10:00:00.000Z"
    },
    "employe": {
      "id": "uuid-employe",
      "nom": "Nom",
      "prenom": "Prénom",
      "email": "employe@example.com",
      "telephone": "+224XXXXXXXXX"
    },
    "amount": 75000,
    "currency": "GNF",
    "reference": "TXN-REF-2024-001",
    "pay_id": "lengo-pay-id",
    "created_at": "2024-01-15T10:00:00.000Z",
    "updated_at": "2024-01-15T10:05:00.000Z",
    "date_remboursement_effectue": "2024-01-15T10:05:00.000Z",
    "type": "transaction_reimbursement"
  },
  "request_id": "ghi789",
  "timestamp": "2024-01-15T10:10:00.000Z"
}
```

## 📊 Statuts Possibles

### Statuts de Remboursement
- `EN_ATTENTE` - Remboursement en attente de paiement
- `PAYE` - Remboursement payé avec succès
- `ANNULE` - Remboursement annulé ou échoué
- `EN_RETARD` - Remboursement en retard (dépassant la date limite)

### Statuts Lengo Pay
- `SUCCESS` - Transaction réussie
- `FAILED` - Transaction échouée
- `CANCELLED` - Transaction annulée
- `PENDING` - Transaction en attente

## 🔄 Flux de Remboursement

1. **Initiation** : Le partenaire appelle l'API pour initier un remboursement
2. **Validation** : L'API vérifie la transaction et crée le remboursement en base
3. **Paiement** : Le partenaire est redirigé vers Lengo Pay pour effectuer le paiement
4. **Callback** : Lengo Pay notifie ZaLaMa du statut du paiement
5. **Vérification** : Le partenaire peut vérifier le statut via l'API

## 📝 Exemples d'Utilisation

### JavaScript/Node.js

#### Remboursement d'une Transaction

```javascript
// Remboursement d'une transaction spécifique
const rembourserTransaction = async () => {
  const response = await fetch('https://admin.zalamasas.com/api/payments/lengo-external', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer zalama_partner_key_2024_secure_1',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      partner_id: 'votre-partner-id',
      transaction_id: 'uuid-de-la-transaction',
      currency: 'GNF',
      description: 'Remboursement avance sur salaire',
      reference: 'TXN-REF-' + Date.now()
    })
  });

  const result = await response.json();
  
  if (result.success) {
    console.log('Transaction à rembourser:', result.data.transaction);
    console.log('Montant total:', result.data.amount);
    // Rediriger vers Lengo Pay
    window.location.href = result.data.payment_url;
  }
};
```

#### Remboursement en Masse de Transactions

```javascript
// Remboursement de plusieurs transactions en une fois
const rembourserTransactionsMasse = async () => {
  const response = await fetch('https://admin.zalamasas.com/api/payments/lengo-external', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer zalama_partner_key_2024_secure_1',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      partner_id: 'votre-partner-id',
      currency: 'GNF',
      description: 'Remboursement avances sur salaire',
      reference: 'BULK-TXN-REF-' + Date.now(),
      transactions: [
        {
          transaction_id: 'uuid-transaction-1',
          description: 'Avance frais de transport'
        },
        {
          transaction_id: 'uuid-transaction-2',
          description: 'Avance frais de repas'
        },
        {
          transaction_id: 'uuid-transaction-3',
          description: 'Avance frais de communication'
        }
      ],
      metadata: {
        periode: 'Janvier 2024',
        type: 'remboursement_avances'
      }
    })
  });

  const result = await response.json();
  
  if (result.success) {
    console.log(`Remboursement en masse initié pour ${result.data.nombre_remboursements} transactions`);
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
  console.log('Type:', result.data.type);
  console.log('Transaction:', result.data.transaction);
};
```

### cURL

#### Remboursement d'une Transaction

```bash
curl -X POST https://admin.zalamasas.com/api/payments/lengo-external \
  -H "Authorization: Bearer zalama_partner_key_2024_secure_1" \
  -H "Content-Type: application/json" \
  -d '{
    "partner_id": "votre-partner-id",
    "transaction_id": "uuid-de-la-transaction",
    "currency": "GNF",
    "description": "Remboursement avance sur salaire",
    "reference": "TXN-REF-2024-001"
  }'
```

#### Remboursement en Masse de Transactions

```bash
curl -X POST https://admin.zalamasas.com/api/payments/lengo-external \
  -H "Authorization: Bearer zalama_partner_key_2024_secure_1" \
  -H "Content-Type: application/json" \
  -d '{
    "partner_id": "votre-partner-id",
    "currency": "GNF",
    "description": "Remboursement avances sur salaire",
    "reference": "BULK-TXN-REF-2024-001",
    "transactions": [
      {
        "transaction_id": "uuid-transaction-1",
        "description": "Avance frais de transport"
      },
      {
        "transaction_id": "uuid-transaction-2",
        "description": "Avance frais de repas"
      },
      {
        "transaction_id": "uuid-transaction-3",
        "description": "Avance frais de communication"
      }
    ]
  }'
```

## 🎯 Cas d'Usage

### Remboursement d'Avances sur Salaire
Les partenaires peuvent rembourser les avances sur salaire accordées à leurs employés :
- **Transaction unique** : Remboursement d'une avance spécifique
- **Transactions multiples** : Remboursement de plusieurs avances en une fois
- **Calcul automatique** : Montant transaction + frais de service

### Remboursement Libre
Pour des cas spécifiques non liés à des transactions :
- Frais de service
- Indemnités diverses
- Montants personnalisés

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
  "error": "transaction_id requis"
}
```

### Erreurs de Transaction (404)
```json
{
  "error": "Transaction non trouvée, n'appartient pas au partenaire ou non effectuée"
}
```

### Erreurs de Conflit (409)
```json
{
  "error": "Un remboursement existe déjà pour cette transaction"
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
- **Vérification Transactions** : Seules les transactions EFFECTUEE du partenaire peuvent être remboursées
- **Unicité** : Un seul remboursement par transaction

## 📞 Support

Pour obtenir votre clé API ou en cas de problème :
- Email : support@zalamasas.com
- Téléphone : +224 XXX XXX XXX
- Documentation : https://docs.zalamasas.com 
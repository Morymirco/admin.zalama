# 📋 API Remboursements - Documentation Partenaires

## 🎯 Vue d'ensemble

Ce document décrit les APIs disponibles pour les partenaires de ZaLaMa pour gérer les remboursements de leurs employés. Les remboursements sont créés automatiquement par l'admin ZaLaMa quand une transaction d'avance sur salaire est effectuée.

## 🔗 Base URL

```
http://localhost:3000/api/remboursements
```

## 📊 Structure des Données

### Remboursement
```typescript
interface Remboursement {
  id: string;
  transaction_id: string;
  demande_avance_id: string;
  employe_id: string;
  partenaire_id: string;
  montant_transaction: number;
  frais_service: number;
  montant_total_remboursement: number;
  methode_remboursement: 'VIREMENT_BANCAIRE' | 'MOBILE_MONEY' | 'ESPECES' | 'CHEQUE' | 'PRELEVEMENT_SALAIRE' | 'COMPENSATION_AVANCE';
  date_creation: string;
  date_transaction_effectuee: string;
  date_limite_remboursement: string;
  date_remboursement_effectue?: string;
  statut: 'EN_ATTENTE' | 'PAYE' | 'EN_RETARD' | 'ANNULE';
  numero_compte?: string;
  numero_reception?: string;
  reference_paiement?: string;
  numero_transaction_remboursement?: string;
  commentaire_partenaire?: string;
  commentaire_admin?: string;
  motif_retard?: string;
  created_at: string;
  updated_at: string;
  
  // Relations
  employe?: {
    id: string;
    nom: string;
    prenom: string;
    email: string;
    telephone: string;
  };
  partenaire?: {
    id: string;
    nom: string;
    email: string;
    email_rh: string;
    telephone: string;
  };
  transaction?: {
    id: string;
    numero_transaction: string;
    methode_paiement: string;
    date_transaction: string;
    statut: string;
  };
}
```

### Données de Paiement
```typescript
interface PaiementRemboursementData {
  remboursement_id: string;
  methode_remboursement: 'VIREMENT_BANCAIRE' | 'MOBILE_MONEY' | 'ESPECES' | 'CHEQUE' | 'PRELEVEMENT_SALAIRE' | 'COMPENSATION_AVANCE';
  numero_transaction: string;
  numero_reception?: string;
  reference_paiement?: string;
  commentaire?: string;
}
```

### Paiement en Lot
```typescript
interface PaiementLotData {
  partenaire_id: string;
  methode_paiement: 'VIREMENT_BANCAIRE' | 'MOBILE_MONEY' | 'ESPECES' | 'CHEQUE' | 'PRELEVEMENT_SALAIRE' | 'COMPENSATION_AVANCE';
  numero_transaction: string;
  commentaire?: string;
}
```

## 🔌 Endpoints API

---

### 1. Récupérer les Remboursements du Partenaire

#### `GET /api/remboursements/partenaire/{partenaireId}`

Récupère tous les remboursements d'un partenaire spécifique.

**Paramètres de chemin :**
- `partenaireId` (requis) : UUID du partenaire

**Paramètres de requête :**
- `statut` (optionnel) : Filtrer par statut (`EN_ATTENTE`, `PAYE`, `EN_RETARD`, `ANNULE`)
- `employe_id` (optionnel) : Filtrer par employé
- `date_debut` (optionnel) : Date de début (format ISO)
- `date_fin` (optionnel) : Date de fin (format ISO)

**Exemple de requête :**
```javascript
const response = await fetch('/api/remboursements/partenaire/eabb0bd2-b7c7-4ad3-abb6-18dbd4ae3867?statut=EN_ATTENTE');
const data = await response.json();
```

**Réponse réussie (200) :**
```json
{
  "success": true,
  "data": [
    {
      "id": "remb-001",
      "transaction_id": "trans-001",
      "employe_id": "emp-001",
      "partenaire_id": "part-001",
      "montant_transaction": 500000,
      "frais_service": 25000,
      "montant_total_remboursement": 525000,
      "methode_remboursement": "VIREMENT_BANCAIRE",
      "date_creation": "2024-01-15T10:00:00Z",
      "date_limite_remboursement": "2024-02-14T10:00:00Z",
      "statut": "EN_ATTENTE",
      "employe": {
        "id": "emp-001",
        "nom": "Dupont",
        "prenom": "Jean",
        "email": "jean.dupont@entreprise.com",
        "telephone": "+224XXXXXXXXX"
      },
      "transaction": {
        "id": "trans-001",
        "numero_transaction": "TTUwM1NlR2NMVTJYeDN2QTlWcVRSZEQxbU5kOERpTVI=",
        "methode_paiement": "MOBILE_MONEY",
        "date_transaction": "2024-01-15T10:00:00Z",
        "statut": "EFFECTUEE"
      }
    }
  ],
  "total": 1,
  "en_attente": 1,
  "payes": 0,
  "en_retard": 0
}
```

**Erreurs possibles :**
- `400` : ID du partenaire manquant ou invalide
- `404` : Partenaire non trouvé
- `500` : Erreur serveur

---

### 2. Effectuer un Paiement Individuel

#### `POST /api/remboursements/paiement`

Effectue le paiement d'un remboursement spécifique.

**Corps de la requête :**
```json
{
  "remboursement_id": "remb-001",
  "methode_remboursement": "VIREMENT_BANCAIRE",
  "numero_transaction": "TXN-PAY-2024-001",
  "numero_reception": "REC-001",
  "reference_paiement": "REF-PAY-001",
  "commentaire": "Paiement effectué via virement bancaire"
}
```

**Exemple de requête :**
```javascript
const paiementData = {
  remboursement_id: "remb-001",
  methode_remboursement: "VIREMENT_BANCAIRE",
  numero_transaction: "TXN-PAY-2024-001",
  numero_reception: "REC-001",
  reference_paiement: "REF-PAY-001",
  commentaire: "Paiement effectué via virement bancaire"
};

const response = await fetch('/api/remboursements/paiement', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(paiementData)
});

const result = await response.json();
```

**Réponse réussie (200) :**
```json
{
  "success": true,
  "message": "Paiement effectué avec succès",
  "data": {
    "remboursement": {
      "id": "remb-001",
      "statut": "PAYE",
      "date_remboursement_effectue": "2024-01-20T14:30:00Z",
      "numero_transaction_remboursement": "TXN-PAY-2024-001",
      "numero_reception": "REC-001",
      "reference_paiement": "REF-PAY-001"
    },
    "montant_paye": 525000,
    "methode_paiement": "VIREMENT_BANCAIRE"
  }
}
```

**Erreurs possibles :**
- `400` : Données manquantes ou invalides
- `404` : Remboursement non trouvé
- `409` : Remboursement déjà payé ou non en attente
- `500` : Erreur serveur

---

### 3. Effectuer un Paiement en Lot

#### `POST /api/remboursements/paiement-partenaire`

Effectue le paiement de tous les remboursements en attente d'un partenaire.

**Corps de la requête :**
```json
{
  "partenaire_id": "part-001",
  "methode_paiement": "VIREMENT_BANCAIRE",
  "numero_transaction": "BULK-TXN-2024-001",
  "commentaire": "Paiement en lot de tous les remboursements en attente"
}
```

**Exemple de requête :**
```javascript
const paiementLotData = {
  partenaire_id: "eabb0bd2-b7c7-4ad3-abb6-18dbd4ae3867",
  methode_paiement: "VIREMENT_BANCAIRE",
  numero_transaction: "BULK-TXN-2024-001",
  commentaire: "Paiement en lot de tous les remboursements en attente"
};

const response = await fetch('/api/remboursements/paiement-partenaire', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(paiementLotData)
});

const result = await response.json();
```

**Réponse réussie (200) :**
```json
{
  "success": true,
  "message": "Paiement en lot effectué avec succès pour 5 remboursements du partenaire Entreprise ABC",
  "remboursementsPayes": 5,
  "montant_total": 2625000,
  "partenaire_nom": "Entreprise ABC",
  "numero_transaction": "BULK-TXN-2024-001",
  "methode_paiement": "VIREMENT_BANCAIRE"
}
```

**Erreurs possibles :**
- `400` : Données manquantes ou invalides, aucun remboursement en attente
- `404` : Partenaire non trouvé
- `500` : Erreur serveur

---

### 4. Statistiques du Partenaire

#### `GET /api/remboursements/statistiques/partenaire/{partenaireId}`

Récupère les statistiques des remboursements d'un partenaire.

**Paramètres de chemin :**
- `partenaireId` (requis) : UUID du partenaire

**Exemple de requête :**
```javascript
const response = await fetch('/api/remboursements/statistiques/partenaire/eabb0bd2-b7c7-4ad3-abb6-18dbd4ae3867');
const data = await response.json();
```

**Réponse réussie (200) :**
```json
{
  "success": true,
  "data": {
    "partenaire_id": "part-001",
    "total_remboursements": 15,
    "remboursements_payes": 8,
    "remboursements_en_attente": 5,
    "remboursements_en_retard": 2,
    "montant_total_a_rembourser": 7500000,
    "montant_total_rembourse": 4200000,
    "montant_en_retard": 1050000,
    "taux_paiement": 53.33,
    "moyenne_retard_jours": 5.2
  }
}
```

---

### 5. Historique des Remboursements

#### `GET /api/remboursements/historique`

Récupère l'historique des actions sur les remboursements d'un partenaire.

**Paramètres de requête :**
- `partenaire_id` (requis) : ID du partenaire
- `remboursement_id` (optionnel) : ID du remboursement spécifique
- `action` (optionnel) : Type d'action (`PAIEMENT`, `PAIEMENT_EN_LOT`, `CREATION`)
- `date_debut` (optionnel) : Date de début (format ISO)
- `date_fin` (optionnel) : Date de fin (format ISO)
- `limit` (optionnel) : Nombre maximum d'entrées (défaut: 50)
- `offset` (optionnel) : Décalage pour la pagination (défaut: 0)

**Exemple de requête :**
```javascript
const response = await fetch('/api/remboursements/historique?partenaire_id=part-001&action=PAIEMENT&limit=10');
const data = await response.json();
```

**Réponse réussie (200) :**
```json
{
  "success": true,
  "data": [
    {
      "id": "hist-001",
      "remboursement_id": "remb-001",
      "action": "PAIEMENT",
      "montant_avant": 525000,
      "montant_apres": 525000,
      "statut_avant": "EN_ATTENTE",
      "statut_apres": "PAYE",
      "description": "Paiement effectué via VIREMENT_BANCAIRE - TXN-PAY-2024-001",
      "created_at": "2024-01-20T14:30:00Z"
    }
  ],
  "total": 1,
  "limit": 10,
  "offset": 0
}
```

---

## 🔐 Authentification

Toutes les APIs nécessitent une authentification. Les partenaires doivent s'authentifier via :

1. **Session utilisateur** : Si accès via l'interface web
2. **Token d'authentification** : Pour les appels API externes

## 📝 Exemples d'Usage

### Exemple 1 : Récupérer et Payer un Remboursement

```javascript
// 1. Récupérer les remboursements en attente
const remboursementsResponse = await fetch('/api/remboursements/partenaire/part-001?statut=EN_ATTENTE');
const remboursements = await remboursementsResponse.json();

if (remboursements.data.length > 0) {
  const remboursement = remboursements.data[0];
  
  // 2. Effectuer le paiement
  const paiementResponse = await fetch('/api/remboursements/paiement', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      remboursement_id: remboursement.id,
      methode_remboursement: 'VIREMENT_BANCAIRE',
      numero_transaction: `TXN-${Date.now()}`,
      commentaire: 'Paiement automatique'
    })
  });
  
  const result = await paiementResponse.json();
  console.log('Paiement effectué:', result);
}
```

### Exemple 2 : Paiement en Lot Automatique

```javascript
// Payer tous les remboursements en attente
const paiementLotResponse = await fetch('/api/remboursements/paiement-partenaire', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    partenaire_id: 'part-001',
    methode_paiement: 'VIREMENT_BANCAIRE',
    numero_transaction: `BULK-${Date.now()}`,
    commentaire: 'Paiement en lot automatique'
  })
});

const result = await paiementLotResponse.json();
console.log('Paiement en lot effectué:', result);
```

### Exemple 3 : Monitoring des Remboursements

```javascript
// Récupérer les statistiques
const statsResponse = await fetch('/api/remboursements/statistiques/partenaire/part-001');
const stats = await statsResponse.json();

console.log('Statistiques:', {
  total: stats.data.total_remboursements,
  payes: stats.data.remboursements_payes,
  enAttente: stats.data.remboursements_en_attente,
  enRetard: stats.data.remboursements_en_retard,
  montantTotal: stats.data.montant_total_a_rembourser,
  montantPaye: stats.data.montant_total_rembourse
});
```

## 🚨 Gestion des Erreurs

### Codes d'Erreur Communs

- `400 Bad Request` : Données manquantes ou invalides
- `401 Unauthorized` : Authentification requise
- `403 Forbidden` : Accès refusé
- `404 Not Found` : Ressource non trouvée
- `409 Conflict` : Conflit (ex: remboursement déjà payé)
- `500 Internal Server Error` : Erreur serveur

### Format des Erreurs

```json
{
  "error": "Description de l'erreur",
  "code": "ERROR_CODE",
  "details": {
    "field": "Détails supplémentaires"
  }
}
```

## 🔄 Workflow Typique

1. **Création automatique** : L'admin ZaLaMa crée un remboursement quand une transaction est effectuée
2. **Notification** : Le partenaire est notifié du nouveau remboursement
3. **Consultation** : Le partenaire consulte ses remboursements via l'API
4. **Paiement** : Le partenaire effectue le paiement (individuel ou en lot)
5. **Confirmation** : Le statut du remboursement passe à `PAYE`
6. **Historique** : L'action est enregistrée dans l'historique

## 📞 Support

Pour toute question ou problème avec ces APIs, contactez l'équipe technique ZaLaMa. 
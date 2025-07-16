# 📋 Documentation API Remboursements - Dashboard Partenaires

## 🎯 Vue d'ensemble

Cette documentation décrit les API routes disponibles pour la gestion des remboursements depuis le dashboard des partenaires. Ces routes permettent aux entreprises partenaires de consulter, filtrer et effectuer des paiements sur leurs remboursements d'avances de salaire.

---

## 🔐 Authentification

Toutes les API routes nécessitent une authentification. Utilisez l'en-tête d'autorisation :

```http
Authorization: Bearer <votre_token_jwt>
```

---

## 📊 Routes Disponibles

### 1. Récupération des Remboursements

#### `GET /api/remboursements`

Récupère la liste des remboursements avec filtres et pagination.

**Paramètres de requête :**
- `partenaire_id` (requis) : ID du partenaire connecté
- `statut` (optionnel) : Filtrer par statut (`EN_ATTENTE`, `PAYE`, `EN_RETARD`, `ANNULE`)
- `limit` (optionnel) : Nombre d'éléments par page (défaut: 100)
- `offset` (optionnel) : Offset pour la pagination (défaut: 0)

**Exemple de requête :**
```javascript
const response = await fetch('/api/remboursements?partenaire_id=123&statut=EN_ATTENTE&limit=50', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

**Réponse réussie (200) :**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-remboursement",
      "transaction_id": "uuid-transaction",
      "employe_id": "uuid-employe",
      "partenaire_id": "uuid-partenaire",
      "montant_transaction": 50000,
      "frais_service": 2500,
      "montant_total_remboursement": 52500,
      "date_creation": "2024-01-15T10:30:00Z",
      "date_limite_remboursement": "2024-02-14T10:30:00Z",
      "date_remboursement_effectue": null,
      "statut": "EN_ATTENTE",
      "methode_remboursement": "VIREMENT_BANCAIRE",
      "numero_transaction_remboursement": null,
      "commentaire_entreprise": null,
      "commentaire_admin": null,
      "employe": {
        "id": "uuid-employe",
        "nom": "Dupont",
        "prenom": "Jean",
        "email": "jean.dupont@entreprise.com",
        "telephone": "+224XXXXXXXXX"
      },
      "demande_avance": {
        "id": "uuid-demande",
        "montant_demande": 50000,
        "motif": "Frais médicaux",
        "date_creation": "2024-01-10T09:00:00Z"
      },
      "transaction": {
        "id": "uuid-transaction",
        "numero_transaction": "TXN-2024-001",
        "methode_paiement": "MOBILE_MONEY",
        "date_transaction": "2024-01-15T10:30:00Z",
        "statut": "EFFECTUEE"
      },
      "jours_retard": 0
    }
  ],
  "count": 1
}
```

**Erreurs possibles :**
- `400` : Paramètres manquants ou invalides
- `401` : Non authentifié
- `403` : Accès interdit
- `500` : Erreur serveur

---

### 2. Statistiques Partenaire

#### `GET /api/remboursements/statistiques`

Récupère les statistiques de remboursement pour le partenaire connecté.

**Paramètres de requête :**
- `partenaire_id` (requis) : ID du partenaire connecté

**Exemple de requête :**
```javascript
const response = await fetch('/api/remboursements/statistiques?partenaire_id=123', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

**Réponse réussie (200) :**
```json
{
  "success": true,
  "data": {
    "globales": {
      "total_remboursements": 25,
      "remboursements_en_attente": 8,
      "remboursements_payes": 15,
      "remboursements_en_retard": 2,
      "remboursements_annules": 0,
      "montant_total_a_rembourser": 1250000,
      "montant_total_rembourse": 750000,
      "montant_en_retard": 100000,
      "taux_remboursement": 60.0
    },
    "par_statut": {
      "EN_ATTENTE": 8,
      "PAYE": 15,
      "EN_RETARD": 2,
      "ANNULE": 0
    },
    "par_mois": [
      {
        "mois": "2024-01",
        "total": 10,
        "montant": 500000
      },
      {
        "mois": "2024-02",
        "total": 15,
        "montant": 750000
      }
    ]
  }
}
```

---

### 3. Paiement d'un Remboursement

#### `POST /api/remboursements/paiement`

Effectue le paiement d'un remboursement spécifique.

**Corps de la requête :**
```json
{
  "remboursement_id": "uuid-remboursement",
  "methode_paiement": "VIREMENT_BANCAIRE",
  "numero_transaction": "TXN-PAY-2024-001",
  "numero_reception": "REC-2024-001",
  "reference_paiement": "REF-2024-001",
  "commentaire": "Paiement effectué via virement bancaire"
}
```

**Méthodes de paiement disponibles :**
- `VIREMENT_BANCAIRE`
- `MOBILE_MONEY`
- `ESPECES`
- `CHEQUE`
- `PRELEVEMENT_SALAIRE`
- `COMPENSATION_AVANCE`

**Exemple de requête :**
```javascript
const response = await fetch('/api/remboursements/paiement', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    remboursement_id: 'uuid-remboursement',
    methode_paiement: 'VIREMENT_BANCAIRE',
    numero_transaction: 'TXN-PAY-2024-001',
    numero_reception: 'REC-2024-001',
    reference_paiement: 'REF-2024-001',
    commentaire: 'Paiement effectué via virement bancaire'
  })
});
```

**Réponse réussie (200) :**
```json
{
  "success": true,
  "message": "Paiement effectué avec succès",
  "data": {
    "remboursement": {
      "id": "uuid-remboursement",
      "statut": "PAYE",
      "date_remboursement_effectue": "2024-01-20T14:30:00Z",
      "numero_transaction_remboursement": "TXN-PAY-2024-001"
    },
    "montant_paye": 52500,
    "methode_paiement": "VIREMENT_BANCAIRE"
  }
}
```

**Erreurs possibles :**
- `400` : Données manquantes ou invalides
- `404` : Remboursement non trouvé
- `409` : Remboursement déjà payé
- `500` : Erreur serveur

---

### 4. Paiement en Lot par Partenaire

#### `POST /api/remboursements/paiement-partenaire`

Effectue le paiement de tous les remboursements en attente du partenaire.

**Corps de la requête :**
```json
{
  "partenaire_id": "uuid-partenaire",
  "methode_paiement": "VIREMENT_BANCAIRE",
  "numero_transaction": "BULK-TXN-2024-001",
  "commentaire": "Paiement en lot de tous les remboursements en attente"
}
```

**Exemple de requête :**
```javascript
const response = await fetch('/api/remboursements/paiement-partenaire', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    partenaire_id: 'uuid-partenaire',
    methode_paiement: 'VIREMENT_BANCAIRE',
    numero_transaction: 'BULK-TXN-2024-001',
    commentaire: 'Paiement en lot de tous les remboursements en attente'
  })
});
```

**Réponse réussie (200) :**
```json
{
  "success": true,
  "message": "Paiement en lot effectué avec succès pour 5 remboursements du partenaire Entreprise ABC",
  "remboursementsPayes": 5,
  "montant_total": 262500,
  "partenaire_nom": "Entreprise ABC"
}
```

---

### 5. Historique des Remboursements

#### `GET /api/remboursements/historique`

Récupère l'historique des actions sur les remboursements du partenaire.

**Paramètres de requête :**
- `partenaire_id` (requis) : ID du partenaire connecté
- `remboursement_id` (optionnel) : ID d'un remboursement spécifique
- `action` (optionnel) : Type d'action (`CREATION`, `PAIEMENT`, `MODIFICATION`, `ANNULEMENT`)
- `limit` (optionnel) : Nombre d'éléments par page (défaut: 50)
- `offset` (optionnel) : Offset pour la pagination (défaut: 0)

**Exemple de requête :**
```javascript
const response = await fetch('/api/remboursements/historique?partenaire_id=123&action=PAIEMENT&limit=20', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

**Réponse réussie (200) :**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-historique",
      "remboursement_id": "uuid-remboursement",
      "action": "PAIEMENT",
      "montant_avant": 52500,
      "montant_apres": 52500,
      "statut_avant": "EN_ATTENTE",
      "statut_apres": "PAYE",
      "description": "Paiement effectué via virement bancaire",
      "created_at": "2024-01-20T14:30:00Z"
    }
  ],
  "count": 1
}
```

---

## 🔧 Intégration dans le Dashboard Partenaire

### Exemple d'implémentation React

```typescript
// Hook personnalisé pour les remboursements
const useRemboursements = (partenaireId: string) => {
  const [remboursements, setRemboursements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRemboursements = async (filtres = {}) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        partenaire_id: partenaireId,
        ...filtres
      });
      
      const response = await fetch(`/api/remboursements?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) throw new Error('Erreur lors de la récupération');
      
      const data = await response.json();
      setRemboursements(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const effectuerPaiement = async (remboursementId: string, paiementData: any) => {
    try {
      const response = await fetch('/api/remboursements/paiement', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          remboursement_id: remboursementId,
          ...paiementData
        })
      });
      
      if (!response.ok) throw new Error('Erreur lors du paiement');
      
      const result = await response.json();
      if (result.success) {
        // Recharger les données
        fetchRemboursements();
        return result;
      }
    } catch (err) {
      throw err;
    }
  };

  return {
    remboursements,
    loading,
    error,
    fetchRemboursements,
    effectuerPaiement
  };
};
```

### Exemple de composant de paiement

```typescript
const PaiementRemboursement = ({ remboursement, onSuccess }) => {
  const [methodePaiement, setMethodePaiement] = useState('VIREMENT_BANCAIRE');
  const [numeroTransaction, setNumeroTransaction] = useState('');
  const [commentaire, setCommentaire] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePaiement = async () => {
    if (!numeroTransaction) {
      toast.error('Numéro de transaction requis');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/remboursements/paiement', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          remboursement_id: remboursement.id,
          methode_paiement: methodePaiement,
          numero_transaction: numeroTransaction,
          commentaire: commentaire
        })
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success('Paiement effectué avec succès');
        onSuccess();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Erreur lors du paiement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Effectuer le paiement</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Méthode de paiement</label>
          <Select value={methodePaiement} onValueChange={setMethodePaiement}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="VIREMENT_BANCAIRE">Virement bancaire</SelectItem>
              <SelectItem value="MOBILE_MONEY">Mobile Money</SelectItem>
              <SelectItem value="ESPECES">Espèces</SelectItem>
              <SelectItem value="CHEQUE">Chèque</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Numéro de transaction *</label>
          <Input
            value={numeroTransaction}
            onChange={(e) => setNumeroTransaction(e.target.value)}
            placeholder="Ex: TXN-2024-001"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Commentaire</label>
          <Textarea
            value={commentaire}
            onChange={(e) => setCommentaire(e.target.value)}
            placeholder="Commentaire optionnel..."
          />
        </div>

        <Button 
          onClick={handlePaiement} 
          disabled={loading || !numeroTransaction}
          className="w-full"
        >
          {loading ? 'Paiement en cours...' : 'Effectuer le paiement'}
        </Button>
      </div>
    </div>
  );
};
```

---

## 📋 Codes d'Erreur

| Code | Description | Solution |
|------|-------------|----------|
| `400` | Paramètres manquants ou invalides | Vérifier les données envoyées |
| `401` | Non authentifié | Vérifier le token JWT |
| `403` | Accès interdit | Vérifier les permissions |
| `404` | Ressource non trouvée | Vérifier l'ID de la ressource |
| `409` | Conflit (ex: déjà payé) | Vérifier l'état actuel |
| `500` | Erreur serveur | Contacter l'équipe technique |

---

## 🔒 Sécurité

### Validation des Données
- Tous les montants sont validés (positifs, format correct)
- Les dates sont validées (format ISO 8601)
- Les UUIDs sont validés
- Les méthodes de paiement sont limitées aux valeurs autorisées

### Permissions
- Chaque partenaire ne peut accéder qu'à ses propres remboursements
- Validation du `partenaire_id` à chaque requête
- Audit trail complet de toutes les actions

### Rate Limiting
- Limitation à 100 requêtes par minute par partenaire
- Limitation à 10 paiements par minute par partenaire

---

## 📞 Support

Pour toute question ou problème avec ces API routes :

- **Email** : api-support@zalama.com
- **Documentation technique** : https://docs.zalama.com/api
- **Statut des services** : https://status.zalama.com

---

*Dernière mise à jour : Janvier 2024*
*Version : 1.0.0* 
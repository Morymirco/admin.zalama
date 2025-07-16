# 📋 Documentation d'Intégration - Système de Remboursements Côté Partenaire

## 🎯 Vue d'ensemble

Ce document décrit l'intégration du système de remboursements pour les partenaires de ZaLaMa. Les partenaires peuvent gérer les remboursements de leurs employés via une interface dédiée.

## 🔗 URLs et Navigation

### Page Principale des Remboursements
```
/dashboard/remboursements/partenaire
```

### Page de Détails d'un Remboursement
```
/dashboard/remboursements/[id]
```

## 🏗️ Architecture

### Structure des Données

#### Remboursement
```typescript
interface Remboursement {
  id: string;
  transaction_id: string;
  employe_id: string;
  partenaire_id: string;
  montant_transaction: number;
  frais_service: number;
  montant_total_remboursement: number;
  date_creation: string;
  date_limite_remboursement: string;
  date_paiement?: string;
  statut: 'EN_ATTENTE' | 'PAYE' | 'EN_RETARD' | 'ANNULE';
  methode_remboursement: string;
  jours_retard?: number;
  employe?: {
    nom: string;
    prenom: string;
    email: string;
    telephone: string;
  };
  partenaire?: {
    nom: string;
    email: string;
  };
}
```

#### Statistiques Partenaire
```typescript
interface StatistiquesRemboursementPartenaire {
  partenaire_id: string;
  total_remboursements: number;
  remboursements_payes: number;
  remboursements_en_attente: number;
  remboursements_en_retard: number;
  montant_total_a_rembourser: number;
  montant_total_rembourse: number;
  montant_en_retard: number;
}
```

## 🔌 API Endpoints

### 1. Récupérer les Remboursements du Partenaire

```typescript
// GET /api/remboursements/partenaire/{partenaireId}
const getRemboursementsPartenaire = async (partenaireId: string) => {
  const response = await fetch(`/api/remboursements/partenaire/${partenaireId}`);
  return response.json();
};
```

**Réponse :**
```json
{
  "remboursements": [
    {
      "id": "remb_001",
      "transaction_id": "trans_001",
      "employe_id": "emp_001",
      "partenaire_id": "part_001",
      "montant_transaction": 500000,
      "frais_service": 25000,
      "montant_total_remboursement": 525000,
      "date_creation": "2024-01-15T10:00:00Z",
      "date_limite_remboursement": "2024-02-14T10:00:00Z",
      "statut": "EN_ATTENTE",
      "methode_remboursement": "VIREMENT_BANCAIRE",
      "employe": {
        "nom": "Dupont",
        "prenom": "Jean",
        "email": "jean.dupont@entreprise.com"
      }
    }
  ]
}
```

### 2. Statistiques du Partenaire

```typescript
// GET /api/remboursements/statistiques/partenaire/{partenaireId}
const getStatistiquesPartenaire = async (partenaireId: string) => {
  const response = await fetch(`/api/remboursements/statistiques/partenaire/${partenaireId}`);
  return response.json();
};
```

**Réponse :**
```json
{
  "partenaire_id": "part_001",
  "total_remboursements": 15,
  "remboursements_payes": 8,
  "remboursements_en_attente": 5,
  "remboursements_en_retard": 2,
  "montant_total_a_rembourser": 7500000,
  "montant_total_rembourse": 4200000,
  "montant_en_retard": 1050000
}
```

### 3. Effectuer un Paiement

```typescript
// POST /api/remboursements/paiement
const effectuerPaiement = async (paiementData: PaiementRemboursementData) => {
  const response = await fetch('/api/remboursements/paiement', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(paiementData)
  });
  return response.json();
};
```

**Données d'entrée :**
```typescript
interface PaiementRemboursementData {
  remboursement_id: string;
  methode_remboursement: 'VIREMENT_BANCAIRE' | 'MOBILE_MONEY' | 'ESPECES' | 'CHEQUE';
  numero_transaction: string;
  numero_reception?: string;
  reference_paiement?: string;
  commentaire?: string;
}
```

**Réponse :**
```json
{
  "success": true,
  "message": "Paiement effectué avec succès",
  "paiement_id": "paiement_001",
  "date_paiement": "2024-01-20T14:30:00Z"
}
```

### 4. Détails d'un Remboursement

```typescript
// GET /api/remboursements/{remboursementId}
const getRemboursementDetails = async (remboursementId: string) => {
  const response = await fetch(`/api/remboursements/${remboursementId}`);
  return response.json();
};
```

## 🎨 Interface Utilisateur

### Composants Principaux

#### 1. Tableau de Bord des Statistiques
```tsx
<Card className="bg-[var(--zalama-card)] border-[var(--zalama-border)]">
  <CardHeader>
    <CardTitle className="text-[var(--zalama-text)]">Total Remboursements</CardTitle>
  </CardHeader>
  <CardContent>
    <div className="text-2xl font-bold text-[var(--zalama-text)]">
      {statistiques.total_remboursements}
    </div>
  </CardContent>
</Card>
```

#### 2. Tableau des Remboursements
```tsx
<Table>
  <TableHeader>
    <TableRow className="border-[var(--zalama-border)]">
      <TableHead className="text-[var(--zalama-text)]">Employé</TableHead>
      <TableHead className="text-[var(--zalama-text)]">Montant</TableHead>
      <TableHead className="text-[var(--zalama-text)]">Date Limite</TableHead>
      <TableHead className="text-[var(--zalama-text)]">Statut</TableHead>
      <TableHead className="text-[var(--zalama-text)]">Actions</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {/* Rows */}
  </TableBody>
</Table>
```

#### 3. Modal de Paiement
```tsx
<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
  <div className="bg-[var(--zalama-card)] rounded-lg p-6 w-full max-w-md border border-[var(--zalama-border)]">
    <h3 className="text-lg font-semibold mb-4 text-[var(--zalama-text)]">
      Effectuer le Paiement
    </h3>
    {/* Formulaire de paiement */}
  </div>
</div>
```

## 🔧 Intégration Technique

### 1. Service de Remboursements

```typescript
// services/reimbursementService.ts
class ReimbursementService {
  // Récupérer les remboursements du partenaire
  async getByPartner(partenaireId: string): Promise<Remboursement[]> {
    const response = await fetch(`/api/remboursements/partenaire/${partenaireId}`);
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des remboursements');
    }
    return response.json();
  }

  // Récupérer les statistiques du partenaire
  async getStatistiquesParPartenaire(): Promise<StatistiquesRemboursementPartenaire[]> {
    const response = await fetch('/api/remboursements/statistiques/partenaire');
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des statistiques');
    }
    return response.json();
  }

  // Effectuer un paiement
  async effectuerPaiement(paiementData: PaiementRemboursementData): Promise<any> {
    const response = await fetch('/api/remboursements/paiement', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paiementData)
    });
    if (!response.ok) {
      throw new Error('Erreur lors du paiement');
    }
    return response.json();
  }
}

export default new ReimbursementService();
```

### 2. Hook Personnalisé

```typescript
// hooks/useRemboursementsPartenaire.ts
import { useState, useEffect } from 'react';
import reimbursementService from '@/services/reimbursementService';

export const useRemboursementsPartenaire = (partenaireId: string) => {
  const [remboursements, setRemboursements] = useState<Remboursement[]>([]);
  const [statistiques, setStatistiques] = useState<StatistiquesRemboursementPartenaire | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [remboursementsData, statistiquesData] = await Promise.all([
        reimbursementService.getByPartner(partenaireId),
        reimbursementService.getStatistiquesParPartenaire()
      ]);

      setRemboursements(remboursementsData);
      const partenaireStats = statistiquesData.find(s => s.partenaire_id === partenaireId);
      setStatistiques(partenaireStats || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  const effectuerPaiement = async (paiementData: PaiementRemboursementData) => {
    try {
      await reimbursementService.effectuerPaiement(paiementData);
      await loadData(); // Recharger les données
      return { success: true };
    } catch (err) {
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Erreur lors du paiement' 
      };
    }
  };

  useEffect(() => {
    if (partenaireId) {
      loadData();
    }
  }, [partenaireId]);

  return {
    remboursements,
    statistiques,
    loading,
    error,
    effectuerPaiement,
    refreshData: loadData
  };
};
```

## 📱 Fonctionnalités Disponibles

### ✅ **Gestion des Remboursements**
- **Vue d'ensemble** : Liste de tous les remboursements
- **Filtrage** : Par statut (En attente, Payés, En retard)
- **Recherche** : Par nom d'employé
- **Tri** : Par date, montant, statut

### ✅ **Statistiques en Temps Réel**
- **Total des remboursements** à effectuer
- **Montant total remboursé**
- **Remboursements en attente**
- **Remboursements en retard**

### ✅ **Effectuer des Paiements**
- **Modal de paiement** intégrée
- **Méthodes de paiement** multiples :
  - Virement bancaire
  - Mobile Money
  - Espèces
  - Chèque
- **Validation** des données
- **Confirmation** de paiement

### ✅ **Notifications et Alertes**
- **Rappels** avant échéance
- **Alertes** de retard
- **Confirmations** de paiement
- **Erreurs** de traitement

## 🔐 Sécurité et Authentification

### Authentification Requise
```typescript
// Vérification de l'authentification
const { user } = useAuth();
if (!user) {
  router.push('/login');
  return;
}
```

### Autorisation Partenaire
```typescript
// Vérification que l'utilisateur est bien le partenaire
const { user } = useAuth();
const partenaireId = user?.partenaire_id;

if (!partenaireId) {
  toast.error('Accès non autorisé');
  router.push('/dashboard');
  return;
}
```

## 📊 Gestion des Erreurs

### Types d'Erreurs Courantes

```typescript
// Erreurs de réseau
if (!response.ok) {
  throw new Error('Erreur de connexion au serveur');
}

// Erreurs de validation
if (montant <= 0) {
  throw new Error('Le montant doit être supérieur à 0');
}

// Erreurs d'autorisation
if (response.status === 403) {
  throw new Error('Accès non autorisé');
}
```

### Gestion des Erreurs dans l'UI

```tsx
const handlePaiement = async () => {
  try {
    const result = await effectuerPaiement(paiementData);
    if (result.success) {
      toast.success('Paiement effectué avec succès');
      setShowPaymentModal(false);
    } else {
      toast.error(result.error || 'Erreur lors du paiement');
    }
  } catch (error) {
    console.error('Erreur:', error);
    toast.error('Erreur inattendue');
  }
};
```

## 🚀 Déploiement et Configuration

### Variables d'Environnement

```env
# Configuration de la base de données
DATABASE_URL=postgresql://...

# Configuration des notifications
EMAIL_SERVICE_API_KEY=...
SMS_SERVICE_API_KEY=...

# Configuration de l'application
NEXT_PUBLIC_APP_URL=https://app.zalama.com
```

### Configuration des Permissions

```sql
-- Permissions pour les partenaires
GRANT SELECT, UPDATE ON remboursements TO partenaires_role;
GRANT SELECT ON statistiques_remboursement TO partenaires_role;
GRANT INSERT ON paiements_remboursement TO partenaires_role;
```

## 📞 Support et Maintenance

### Logs et Monitoring

```typescript
// Logging des actions importantes
console.log(`Paiement effectué: ${remboursementId} par ${partenaireId}`);

// Métriques de performance
const startTime = Date.now();
await effectuerPaiement(paiementData);
const duration = Date.now() - startTime;
console.log(`Paiement traité en ${duration}ms`);
```

### Contact Support

- **Email** : support@zalama.com
- **Téléphone** : +224 XXX XXX XXX
- **Documentation** : https://docs.zalama.com

## 🔄 Mises à Jour et Évolutions

### Roadmap

- [ ] **Notifications push** en temps réel
- [ ] **Export PDF** des remboursements
- [ ] **API webhook** pour les paiements
- [ ] **Intégration bancaire** directe
- [ ] **Tableau de bord** avancé avec graphiques

### Versioning

- **Version actuelle** : 1.0.0
- **Compatibilité** : Navigateurs modernes (Chrome 90+, Firefox 88+, Safari 14+)
- **Support mobile** : Responsive design optimisé

---

## 📝 Notes Importantes

1. **Sécurité** : Toutes les communications sont chiffrées en HTTPS
2. **Performance** : Mise en cache des données pour optimiser les performances
3. **Accessibilité** : Interface conforme aux standards WCAG 2.1
4. **Responsive** : Optimisé pour tous les écrans (desktop, tablette, mobile)

Pour toute question ou problème, consultez la documentation complète ou contactez l'équipe support. 
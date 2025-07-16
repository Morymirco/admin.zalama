# 🚀 Guide d'Intégration Rapide - API Remboursements Partenaires

## 📋 Vue d'ensemble

Ce guide vous accompagne dans l'intégration des API de remboursements dans votre dashboard partenaire. Vous pourrez consulter, filtrer et effectuer des paiements sur vos remboursements d'avances de salaire.

---

## ⚡ Intégration Rapide

### 1. Configuration de Base

```typescript
// config/api.ts
const API_CONFIG = {
  baseUrl: 'https://votre-domaine.com/api',
  token: 'votre_token_jwt_partenaire'
};

const apiHeaders = {
  'Authorization': `Bearer ${API_CONFIG.token}`,
  'Content-Type': 'application/json'
};
```

### 2. Hook React pour les Remboursements

```typescript
// hooks/useRemboursements.ts
import { useState, useEffect } from 'react';

interface Remboursement {
  id: string;
  montant_total_remboursement: number;
  statut: 'EN_ATTENTE' | 'PAYE' | 'EN_RETARD' | 'ANNULE';
  date_limite_remboursement: string;
  employe: {
    nom: string;
    prenom: string;
    email: string;
  };
  // ... autres propriétés
}

export const useRemboursements = (partenaireId: string) => {
  const [remboursements, setRemboursements] = useState<Remboursement[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRemboursements = async (filtres: any = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        partenaire_id: partenaireId,
        ...filtres
      });
      
      const response = await fetch(`${API_CONFIG.baseUrl}/remboursements?${params}`, {
        headers: apiHeaders
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des remboursements');
      }
      
      const data = await response.json();
      setRemboursements(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  const effectuerPaiement = async (remboursementId: string, paiementData: any) => {
    try {
      const response = await fetch(`${API_CONFIG.baseUrl}/remboursements/paiement`, {
        method: 'POST',
        headers: apiHeaders,
        body: JSON.stringify({
          remboursement_id: remboursementId,
          ...paiementData
        })
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors du paiement');
      }
      
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

  useEffect(() => {
    fetchRemboursements();
  }, [partenaireId]);

  return {
    remboursements,
    loading,
    error,
    fetchRemboursements,
    effectuerPaiement
  };
};
```

### 3. Composant de Liste des Remboursements

```typescript
// components/RemboursementsList.tsx
import React, { useState } from 'react';
import { useRemboursements } from '../hooks/useRemboursements';

interface RemboursementsListProps {
  partenaireId: string;
}

export const RemboursementsList: React.FC<RemboursementsListProps> = ({ partenaireId }) => {
  const { remboursements, loading, error, fetchRemboursements } = useRemboursements(partenaireId);
  const [filtreStatut, setFiltreStatut] = useState('tous');

  const remboursementsFiltres = remboursements.filter(r => 
    filtreStatut === 'tous' || r.statut === filtreStatut
  );

  const formatMontant = (montant: number) => {
    return new Intl.NumberFormat('fr-FR').format(montant) + ' FCFA';
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR');
  };

  const getStatusBadge = (statut: string) => {
    const config = {
      'EN_ATTENTE': { color: 'bg-yellow-100 text-yellow-800', label: 'En attente' },
      'PAYE': { color: 'bg-green-100 text-green-800', label: 'Payé' },
      'EN_RETARD': { color: 'bg-red-100 text-red-800', label: 'En retard' },
      'ANNULE': { color: 'bg-gray-100 text-gray-800', label: 'Annulé' }
    };
    
    const statusConfig = config[statut as keyof typeof config] || config['EN_ATTENTE'];
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
        {statusConfig.label}
      </span>
    );
  };

  if (loading) {
    return <div className="text-center py-8">Chargement des remboursements...</div>;
  }

  if (error) {
    return <div className="text-red-600 text-center py-8">Erreur: {error}</div>;
  }

  return (
    <div className="space-y-4">
      {/* Filtres */}
      <div className="flex gap-4">
        <select 
          value={filtreStatut} 
          onChange={(e) => setFiltreStatut(e.target.value)}
          className="px-3 py-2 border rounded-lg"
        >
          <option value="tous">Tous les statuts</option>
          <option value="EN_ATTENTE">En attente</option>
          <option value="PAYE">Payé</option>
          <option value="EN_RETARD">En retard</option>
          <option value="ANNULE">Annulé</option>
        </select>
      </div>

      {/* Liste */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold">
            Remboursements ({remboursementsFiltres.length})
          </h2>
        </div>
        
        <div className="divide-y">
          {remboursementsFiltres.map((remboursement) => (
            <div key={remboursement.id} className="px-6 py-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-medium">
                      {remboursement.employe.nom} {remboursement.employe.prenom}
                    </h3>
                    {getStatusBadge(remboursement.statut)}
                  </div>
                  
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>Email: {remboursement.employe.email}</p>
                    <p>Montant: {formatMontant(remboursement.montant_total_remboursement)}</p>
                    <p>Date limite: {formatDate(remboursement.date_limite_remboursement)}</p>
                  </div>
                </div>
                
                {remboursement.statut === 'EN_ATTENTE' && (
                  <button 
                    onClick={() => {/* Ouvrir modal de paiement */}}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Payer
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {remboursementsFiltres.length === 0 && (
          <div className="px-6 py-8 text-center text-gray-500">
            Aucun remboursement trouvé
          </div>
        )}
      </div>
    </div>
  );
};
```

### 4. Composant de Paiement

```typescript
// components/PaiementModal.tsx
import React, { useState } from 'react';

interface PaiementModalProps {
  remboursement: any;
  onClose: () => void;
  onSuccess: () => void;
}

export const PaiementModal: React.FC<PaiementModalProps> = ({ 
  remboursement, 
  onClose, 
  onSuccess 
}) => {
  const [methodePaiement, setMethodePaiement] = useState('VIREMENT_BANCAIRE');
  const [numeroTransaction, setNumeroTransaction] = useState('');
  const [commentaire, setCommentaire] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePaiement = async () => {
    if (!numeroTransaction) {
      alert('Numéro de transaction requis');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_CONFIG.baseUrl}/remboursements/paiement`, {
        method: 'POST',
        headers: apiHeaders,
        body: JSON.stringify({
          remboursement_id: remboursement.id,
          methode_paiement: methodePaiement,
          numero_transaction: numeroTransaction,
          commentaire: commentaire
        })
      });

      const result = await response.json();
      
      if (result.success) {
        alert('Paiement effectué avec succès');
        onSuccess();
        onClose();
      } else {
        alert(result.message || 'Erreur lors du paiement');
      }
    } catch (error) {
      alert('Erreur lors du paiement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-semibold mb-4">Effectuer le paiement</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Employé
            </label>
            <p className="text-gray-600">
              {remboursement.employe.nom} {remboursement.employe.prenom}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Montant à payer
            </label>
            <p className="text-lg font-semibold">
              {new Intl.NumberFormat('fr-FR').format(remboursement.montant_total_remboursement)} FCFA
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Méthode de paiement
            </label>
            <select 
              value={methodePaiement} 
              onChange={(e) => setMethodePaiement(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="VIREMENT_BANCAIRE">Virement bancaire</option>
              <option value="MOBILE_MONEY">Mobile Money</option>
              <option value="ESPECES">Espèces</option>
              <option value="CHEQUE">Chèque</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Numéro de transaction *
            </label>
            <input
              type="text"
              value={numeroTransaction}
              onChange={(e) => setNumeroTransaction(e.target.value)}
              placeholder="Ex: TXN-2024-001"
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Commentaire
            </label>
            <textarea
              value={commentaire}
              onChange={(e) => setCommentaire(e.target.value)}
              placeholder="Commentaire optionnel..."
              className="w-full px-3 py-2 border rounded-lg"
              rows={3}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              onClick={handlePaiement}
              disabled={loading || !numeroTransaction}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Paiement en cours...' : 'Effectuer le paiement'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
```

### 5. Page Principale

```typescript
// pages/remboursements.tsx
import React, { useState } from 'react';
import { RemboursementsList } from '../components/RemboursementsList';
import { PaiementModal } from '../components/PaiementModal';

export default function RemboursementsPage() {
  const [remboursementSelectionne, setRemboursementSelectionne] = useState(null);
  const partenaireId = 'votre-partenaire-id'; // À récupérer depuis l'auth

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Gestion des Remboursements</h1>
        <p className="text-gray-600">
          Consultez et effectuez les paiements de vos remboursements d'avances de salaire
        </p>
      </div>

      <RemboursementsList 
        partenaireId={partenaireId}
        onPayer={(remboursement) => setRemboursementSelectionne(remboursement)}
      />

      {remboursementSelectionne && (
        <PaiementModal
          remboursement={remboursementSelectionne}
          onClose={() => setRemboursementSelectionne(null)}
          onSuccess={() => {
            setRemboursementSelectionne(null);
            // Recharger la liste
          }}
        />
      )}
    </div>
  );
}
```

---

## 🔧 Configuration Avancée

### Gestion des Erreurs

```typescript
// utils/apiErrorHandler.ts
export const handleApiError = (error: any) => {
  if (error.status === 401) {
    // Rediriger vers la page de connexion
    window.location.href = '/login';
  } else if (error.status === 403) {
    // Afficher un message d'accès interdit
    alert('Accès interdit');
  } else if (error.status === 409) {
    // Gérer les conflits (ex: déjà payé)
    alert('Ce remboursement a déjà été payé');
  } else {
    // Erreur générique
    alert('Une erreur est survenue. Veuillez réessayer.');
  }
};
```

### Intercepteur de Requêtes

```typescript
// utils/apiClient.ts
class ApiClient {
  private baseUrl: string;
  private token: string;

  constructor(baseUrl: string, token: string) {
    this.baseUrl = baseUrl;
    this.token = token;
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json',
      ...options.headers
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  }

  async getRemboursements(filtres: any = {}) {
    const params = new URLSearchParams(filtres);
    return this.request(`/remboursements?${params}`);
  }

  async effectuerPaiement(remboursementId: string, paiementData: any) {
    return this.request('/remboursements/paiement', {
      method: 'POST',
      body: JSON.stringify({
        remboursement_id: remboursementId,
        ...paiementData
      })
    });
  }

  async getStatistiques(partenaireId: string) {
    return this.request(`/remboursements/statistiques?partenaire_id=${partenaireId}`);
  }
}

export const apiClient = new ApiClient(API_CONFIG.baseUrl, API_CONFIG.token);
```

---

## 📱 Exemple d'Intégration Mobile

```typescript
// React Native - hooks/useRemboursements.ts
import { useState, useEffect } from 'react';

export const useRemboursements = (partenaireId: string) => {
  const [remboursements, setRemboursements] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchRemboursements = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${API_CONFIG.baseUrl}/remboursements?partenaire_id=${partenaireId}`,
        {
          headers: {
            'Authorization': `Bearer ${API_CONFIG.token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      const data = await response.json();
      setRemboursements(data.data);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRemboursements();
  }, [partenaireId]);

  return { remboursements, loading, refetch: fetchRemboursements };
};
```

---

## 🚀 Déploiement

### Variables d'Environnement

```bash
# .env.local
NEXT_PUBLIC_API_BASE_URL=https://votre-domaine.com/api
NEXT_PUBLIC_PARTENAIRE_ID=votre-partenaire-id
```

### Build et Déploiement

```bash
# Installation des dépendances
npm install

# Build de production
npm run build

# Démarrage en production
npm start
```

---

## 📞 Support

Pour toute question ou problème :

- **Documentation complète** : `/docs/API_REMBOURSEMENTS_PARTENAIRES.md`
- **Email support** : api-support@zalama.com
- **Chat support** : Disponible sur le dashboard partenaire

---

*Ce guide vous permet d'intégrer rapidement les API de remboursements dans votre application. Pour plus de détails, consultez la documentation complète des API.* 
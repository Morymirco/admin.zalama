# 🚀 Guide d'Intégration - APIs Remboursements Partenaires

## 🎯 Vue d'ensemble

Ce guide explique comment intégrer les APIs de remboursement ZaLaMa dans votre système partenaire. Les remboursements sont créés automatiquement par l'admin ZaLaMa quand une transaction d'avance sur salaire est effectuée.

## 🔗 URLs de Base

- **API Base** : `http://localhost:3000/api/remboursements`
- **Interface Web** : `http://localhost:3000/dashboard/remboursements/partenaire`

## 📋 Workflow d'Intégration

### 1. **Récupération des Remboursements**

```javascript
// Récupérer tous les remboursements du partenaire
const getRemboursements = async (partenaireId) => {
  const response = await fetch(`/api/remboursements/partenaire/${partenaireId}`);
  const data = await response.json();
  
  if (data.success) {
    return data.data;
  } else {
    throw new Error(data.error);
  }
};

// Exemple d'usage
const remboursements = await getRemboursements('eabb0bd2-b7c7-4ad3-abb6-18dbd4ae3867');
console.log('Remboursements:', remboursements);
```

### 2. **Paiement Individuel**

```javascript
// Payer un remboursement spécifique
const payerRemboursement = async (remboursementId, paiementData) => {
  const response = await fetch('/api/remboursements/paiement', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      remboursement_id: remboursementId,
      methode_remboursement: paiementData.methode,
      numero_transaction: paiementData.numeroTransaction,
      numero_reception: paiementData.numeroReception,
      reference_paiement: paiementData.reference,
      commentaire: paiementData.commentaire
    })
  });
  
  const result = await response.json();
  
  if (result.success) {
    return result.data;
  } else {
    throw new Error(result.error);
  }
};

// Exemple d'usage
const paiement = await payerRemboursement('remb-001', {
  methode: 'VIREMENT_BANCAIRE',
  numeroTransaction: 'TXN-2024-001',
  numeroReception: 'REC-001',
  reference: 'REF-PAY-001',
  commentaire: 'Paiement effectué'
});
```

### 3. **Paiement en Lot**

```javascript
// Payer tous les remboursements en attente
const payerEnLot = async (partenaireId, paiementData) => {
  const response = await fetch('/api/remboursements/paiement-partenaire', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      partenaire_id: partenaireId,
      methode_paiement: paiementData.methode,
      numero_transaction: paiementData.numeroTransaction,
      commentaire: paiementData.commentaire
    })
  });
  
  const result = await response.json();
  
  if (result.success) {
    return result;
  } else {
    throw new Error(result.error);
  }
};

// Exemple d'usage
const paiementLot = await payerEnLot('eabb0bd2-b7c7-4ad3-abb6-18dbd4ae3867', {
  methode: 'VIREMENT_BANCAIRE',
  numeroTransaction: 'BULK-TXN-2024-001',
  commentaire: 'Paiement en lot automatique'
});
```

## 🔧 Exemples d'Intégration

### **Exemple 1 : Interface de Gestion Simple**

```html
<!DOCTYPE html>
<html>
<head>
    <title>Gestion Remboursements</title>
</head>
<body>
    <h1>Remboursements en Attente</h1>
    <div id="remboursements"></div>
    
    <script>
        const partenaireId = 'eabb0bd2-b7c7-4ad3-abb6-18dbd4ae3867';
        
        // Charger les remboursements
        async function chargerRemboursements() {
            try {
                const response = await fetch(`/api/remboursements/partenaire/${partenaireId}?statut=EN_ATTENTE`);
                const data = await response.json();
                
                if (data.success) {
                    afficherRemboursements(data.data);
                }
            } catch (error) {
                console.error('Erreur:', error);
            }
        }
        
        // Afficher les remboursements
        function afficherRemboursements(remboursements) {
            const container = document.getElementById('remboursements');
            container.innerHTML = '';
            
            remboursements.forEach(remb => {
                const div = document.createElement('div');
                div.innerHTML = `
                    <div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0;">
                        <h3>${remb.employe?.nom} ${remb.employe?.prenom}</h3>
                        <p>Montant: ${remb.montant_total_remboursement} GNF</p>
                        <p>Date limite: ${new Date(remb.date_limite_remboursement).toLocaleDateString()}</p>
                        <button onclick="payerRemboursement('${remb.id}')">Payer</button>
                    </div>
                `;
                container.appendChild(div);
            });
        }
        
        // Payer un remboursement
        async function payerRemboursement(remboursementId) {
            const numeroTransaction = prompt('Numéro de transaction:');
            if (!numeroTransaction) return;
            
            try {
                const response = await fetch('/api/remboursements/paiement', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        remboursement_id: remboursementId,
                        methode_remboursement: 'VIREMENT_BANCAIRE',
                        numero_transaction: numeroTransaction,
                        commentaire: 'Paiement via interface web'
                    })
                });
                
                const result = await response.json();
                
                if (result.success) {
                    alert('Paiement effectué avec succès!');
                    chargerRemboursements(); // Recharger la liste
                } else {
                    alert('Erreur: ' + result.error);
                }
            } catch (error) {
                alert('Erreur lors du paiement: ' + error.message);
            }
        }
        
        // Charger au démarrage
        chargerRemboursements();
    </script>
</body>
</html>
```

### **Exemple 2 : Intégration React**

```jsx
import React, { useState, useEffect } from 'react';

const RemboursementsPartenaire = ({ partenaireId }) => {
  const [remboursements, setRemboursements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Charger les remboursements
  const chargerRemboursements = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/remboursements/partenaire/${partenaireId}?statut=EN_ATTENTE`);
      const data = await response.json();
      
      if (data.success) {
        setRemboursements(data.data);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Payer un remboursement
  const payerRemboursement = async (remboursementId, numeroTransaction) => {
    try {
      const response = await fetch('/api/remboursements/paiement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          remboursement_id: remboursementId,
          methode_remboursement: 'VIREMENT_BANCAIRE',
          numero_transaction: numeroTransaction,
          commentaire: 'Paiement via interface React'
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        alert('Paiement effectué avec succès!');
        chargerRemboursements(); // Recharger
      } else {
        alert('Erreur: ' + result.error);
      }
    } catch (err) {
      alert('Erreur lors du paiement: ' + err.message);
    }
  };

  // Paiement en lot
  const payerEnLot = async () => {
    if (!confirm('Payer tous les remboursements en attente ?')) return;
    
    try {
      const response = await fetch('/api/remboursements/paiement-partenaire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partenaire_id: partenaireId,
          methode_paiement: 'VIREMENT_BANCAIRE',
          numero_transaction: `BULK-${Date.now()}`,
          commentaire: 'Paiement en lot via interface React'
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        alert(`Paiement en lot effectué: ${result.remboursementsPayes} remboursements`);
        chargerRemboursements(); // Recharger
      } else {
        alert('Erreur: ' + result.error);
      }
    } catch (err) {
      alert('Erreur lors du paiement en lot: ' + err.message);
    }
  };

  useEffect(() => {
    chargerRemboursements();
  }, [partenaireId]);

  if (loading) return <div>Chargement...</div>;
  if (error) return <div>Erreur: {error}</div>;

  return (
    <div>
      <h1>Remboursements en Attente</h1>
      
      {remboursements.length > 0 && (
        <button onClick={payerEnLot} style={{ marginBottom: '20px' }}>
          Payer en Lot ({remboursements.length} remboursements)
        </button>
      )}
      
      {remboursements.length === 0 ? (
        <p>Aucun remboursement en attente</p>
      ) : (
        <div>
          {remboursements.map(remb => (
            <div key={remb.id} style={{ border: '1px solid #ccc', padding: '15px', margin: '10px 0' }}>
              <h3>{remb.employe?.nom} {remb.employe?.prenom}</h3>
              <p>Montant: {remb.montant_total_remboursement.toLocaleString()} GNF</p>
              <p>Date limite: {new Date(remb.date_limite_remboursement).toLocaleDateString()}</p>
              <button onClick={() => {
                const numeroTransaction = prompt('Numéro de transaction:');
                if (numeroTransaction) {
                  payerRemboursement(remb.id, numeroTransaction);
                }
              }}>
                Payer
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RemboursementsPartenaire;
```

### **Exemple 3 : Intégration Node.js**

```javascript
const axios = require('axios');

class ZaLaMaRemboursements {
  constructor(baseUrl = 'http://localhost:3000') {
    this.baseUrl = baseUrl;
  }

  // Récupérer les remboursements
  async getRemboursements(partenaireId, options = {}) {
    try {
      const params = new URLSearchParams(options);
      const response = await axios.get(
        `${this.baseUrl}/api/remboursements/partenaire/${partenaireId}?${params}`
      );
      return response.data;
    } catch (error) {
      throw new Error(`Erreur lors de la récupération: ${error.response?.data?.error || error.message}`);
    }
  }

  // Payer un remboursement
  async payerRemboursement(remboursementId, paiementData) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/api/remboursements/paiement`,
        {
          remboursement_id: remboursementId,
          methode_remboursement: paiementData.methode,
          numero_transaction: paiementData.numeroTransaction,
          numero_reception: paiementData.numeroReception,
          reference_paiement: paiementData.reference,
          commentaire: paiementData.commentaire
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(`Erreur lors du paiement: ${error.response?.data?.error || error.message}`);
    }
  }

  // Paiement en lot
  async payerEnLot(partenaireId, paiementData) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/api/remboursements/paiement-partenaire`,
        {
          partenaire_id: partenaireId,
          methode_paiement: paiementData.methode,
          numero_transaction: paiementData.numeroTransaction,
          commentaire: paiementData.commentaire
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(`Erreur lors du paiement en lot: ${error.response?.data?.error || error.message}`);
    }
  }

  // Statistiques
  async getStatistiques(partenaireId) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/api/remboursements/statistiques/partenaire/${partenaireId}`
      );
      return response.data;
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des statistiques: ${error.response?.data?.error || error.message}`);
    }
  }
}

// Exemple d'usage
async function exemple() {
  const zalama = new ZaLaMaRemboursements();
  const partenaireId = 'eabb0bd2-b7c7-4ad3-abb6-18dbd4ae3867';

  try {
    // Récupérer les remboursements en attente
    const remboursements = await zalama.getRemboursements(partenaireId, { statut: 'EN_ATTENTE' });
    console.log('Remboursements en attente:', remboursements.data.length);

    // Payer le premier remboursement
    if (remboursements.data.length > 0) {
      const result = await zalama.payerRemboursement(remboursements.data[0].id, {
        methode: 'VIREMENT_BANCAIRE',
        numeroTransaction: 'TXN-2024-001',
        commentaire: 'Paiement automatique'
      });
      console.log('Paiement effectué:', result);
    }

    // Statistiques
    const stats = await zalama.getStatistiques(partenaireId);
    console.log('Statistiques:', stats.data);

  } catch (error) {
    console.error('Erreur:', error.message);
  }
}

exemple();
```

## 🔐 Authentification

Pour les appels API depuis votre système, vous devrez implémenter l'authentification appropriée :

1. **Session utilisateur** : Si accès via l'interface web
2. **Token d'authentification** : Pour les appels API externes
3. **API Key** : Pour l'authentification programmatique

## 📞 Support

Pour toute question sur l'intégration, contactez l'équipe technique ZaLaMa. 
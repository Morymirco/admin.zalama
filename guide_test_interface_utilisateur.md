# Guide de Test Interface Utilisateur - Logique ZaLaMa

## 🎯 Objectif
Tester le flux complet via l'interface admin pour vérifier que la logique financière ZaLaMa est correcte.

## 📋 Checklist de Test

### ✅ Phase 1: Préparation
1. **Vérifier qu'un partenaire existe** dans `/dashboard/partenaires`
2. **Vérifier qu'un employé existe** pour ce partenaire
3. **Noter les montants** que vous allez utiliser pour le test

### ✅ Phase 2: Création de la Demande
1. Aller sur `/dashboard/demandes`
2. Créer une nouvelle demande d'avance avec un **montant rond** (ex: 500,000 GNF)
3. **Noter le montant demandé exactement**

### ✅ Phase 3: Paiement
1. Cliquer sur "Payer" pour la demande créée
2. Dans la modal de paiement, **vérifier l'affichage** :
   - Montant demandé : 500,000 GNF
   - Frais ZaLaMa (6.5%) : 32,500 GNF  
   - Montant reçu par l'employé : 467,500 GNF
   - **Bouton doit dire "Payer 500,000 GNF"** (pas 467,500)

3. Effectuer le paiement
4. **Vérifier dans la console** les logs :
   ```
   LOGIQUE ZALAMA CORRECTE:
   montantTransaction: 500000 GNF (stocké en DB)
   montantLengoPay: 467500 GNF (payé via LengoPay)
   ```

### ✅ Phase 4: Vérification Base de Données
1. **Table transactions** : `montant` doit être **500,000** (montant demandé)
2. **Table remboursements** : `montant_total_remboursement` doit être **500,000**
3. **Table remboursements** : `frais_service` doit être **32,500**

### ✅ Phase 5: Vérification Interface
1. **Page remboursements** : Le montant affiché doit être **500,000 GNF**
2. **Détails du remboursement** : 
   - Montant Total à Rembourser : **500,000 GNF**
   - Frais de Service : **32,500 GNF**
   - Montant Transaction : **500,000 GNF**

## 🧮 Calculs Attendus (Exemple 500,000 GNF)

| Élément | Montant | Source |
|---------|---------|---------|
| **Montant demandé** | 500,000 GNF | Demande initiale |
| **Frais ZaLaMa (6.5%)** | 32,500 GNF | 500,000 × 0.065 |
| **Montant net employé** | 467,500 GNF | 500,000 - 32,500 |
| **Transaction DB** | 500,000 GNF | Montant demandé |
| **Remboursement partenaire** | 500,000 GNF | Montant demandé |
| **Profit ZaLaMa** | 32,500 GNF | Frais de service |

## ❌ Signaux d'Alarme

### Si vous voyez ces valeurs, il y a un problème :
- **Transaction DB = 467,500** → ❌ Devrait être 500,000
- **Remboursement = 467,500** → ❌ Devrait être 500,000  
- **Remboursement = 532,500** → ❌ Devrait être 500,000
- **Bouton "Payer 467,500"** → ❌ Devrait être "Payer 500,000"

## 🔍 Points de Contrôle Critiques

### 1. **Modal de Paiement**
```
✅ Montant demandé : 500,000 GNF
✅ Frais ZaLaMa : 32,500 GNF
✅ Montant reçu employé : 467,500 GNF
✅ Bouton : "Payer 500,000 GNF"
```

### 2. **Base de Données**
```sql
-- Transaction
SELECT montant FROM transactions WHERE id = 'votre-transaction-id';
-- Résultat attendu : 500000

-- Remboursement  
SELECT montant_total_remboursement, frais_service 
FROM remboursements WHERE transaction_id = 'votre-transaction-id';
-- Résultats attendus : 500000, 32500
```

### 3. **Interface Remboursements**
```
✅ Liste : "500,000 GNF" affiché
✅ Détails : Montant Total = 500,000 GNF
✅ Détails : Frais Service = 32,500 GNF
```

## 🚨 Actions si Test Échoue

1. **Vérifier les triggers** avec `check_active_triggers.sql`
2. **Re-exécuter** `fix_transactions_montants.sql` 
3. **Contrôler le frontend** : `ModalePaiementDemande.tsx` 
4. **Contrôler l'API** : `/api/payments/lengo-cashin/route.ts`

## 💡 Script SQL de Vérification Rapide

```sql
-- Vérifier une transaction spécifique
SELECT 
    t.id,
    t.montant as transaction_montant,
    r.montant_total_remboursement,
    r.frais_service,
    sar.montant_demande,
    CASE 
        WHEN t.montant = sar.montant_demande 
             AND r.montant_total_remboursement = sar.montant_demande
        THEN '✅ LOGIQUE CORRECTE'
        ELSE '❌ PROBLÈME'
    END as diagnostic
FROM transactions t
JOIN salary_advance_requests sar ON t.demande_avance_id = sar.id  
LEFT JOIN remboursements r ON r.transaction_id = t.id
WHERE t.numero_transaction = 'VOTRE_NUMERO_TRANSACTION'
ORDER BY t.date_creation DESC;
``` 
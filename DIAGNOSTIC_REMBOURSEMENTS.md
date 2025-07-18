# 🔍 Diagnostic des Remboursements - Guide de Dépannage

## 🎯 Vue d'ensemble

Ce guide aide à diagnostiquer et résoudre les problèmes de récupération des remboursements dans les routes API.

## 📋 Problèmes Courants

### 1. **Remboursement non trouvé**

**Symptômes :**
- Erreur 404 "Remboursement non trouvé ou déjà payé"
- `remboursement_id` invalide

**Diagnostic :**
```sql
-- Vérifier si le remboursement existe
SELECT id, statut, montant_total_remboursement 
FROM remboursements 
WHERE id = 'votre-remboursement-id';
```

**Solutions :**
- Vérifier que l'ID est correct
- Vérifier que le remboursement n'est pas déjà payé
- Vérifier que le statut est 'EN_ATTENTE'

### 2. **Aucun remboursement en attente**

**Symptômes :**
- Erreur 400 "Aucun remboursement en attente"
- Liste vide pour un partenaire

**Diagnostic :**
```sql
-- Vérifier les remboursements d'un partenaire
SELECT id, statut, montant_total_remboursement, date_creation
FROM remboursements 
WHERE partenaire_id = 'votre-partenaire-id'
ORDER BY date_creation DESC;
```

**Solutions :**
- Vérifier que le `partenaire_id` est correct
- Vérifier qu'il y a des remboursements avec statut 'EN_ATTENTE'
- Vérifier les dates de création

### 3. **Montants incohérents**

**Symptômes :**
- Montants incorrects dans les réponses
- Différences entre `montant_transaction` et `montant_total_remboursement`

**Diagnostic :**
```sql
-- Vérifier la cohérence des montants
SELECT 
    id,
    montant_transaction,
    frais_service,
    montant_total_remboursement,
    CASE 
        WHEN montant_total_remboursement != montant_transaction + frais_service 
        THEN 'INCOHERENT'
        ELSE 'COHERENT'
    END as coherence
FROM remboursements 
WHERE montant_total_remboursement != montant_transaction + frais_service;
```

**Solutions :**
- Corriger les données dans la base
- Vérifier les triggers de création automatique
- Vérifier la logique métier

## 🔧 Routes API Améliorées

### Route `simple-paiement`

**Améliorations apportées :**
- ✅ Récupération de plus de champs
- ✅ Logs détaillés pour le débogage
- ✅ Validation des données

**Champs récupérés :**
```typescript
{
  id,
  montant_transaction,
  frais_service,
  montant_total_remboursement,
  statut,
  date_creation,
  date_limite_remboursement,
  partenaire_id,
  employe_id,
  transaction_id,
  methode_remboursement
}
```

### Route `simple-paiement-lot`

**Améliorations apportées :**
- ✅ Récupération de plus de champs
- ✅ Logs détaillés pour le débogage
- ✅ Informations sur chaque remboursement

**Champs récupérés :**
```typescript
{
  id,
  montant_transaction,
  frais_service,
  montant_total_remboursement,
  statut,
  date_creation,
  date_limite_remboursement,
  employe_id,
  transaction_id
}
```

## 🧪 Tests de Diagnostic

### 1. **Test avec l'ID d'un remboursement**

```bash
curl -X POST https://admin.zalamasas.com/api/remboursements/simple-paiement \
  -H "Content-Type: application/json" \
  -d '{"remboursement_id": "votre-remboursement-id"}'
```

### 2. **Test avec l'ID d'un partenaire**

```bash
curl -X POST https://admin.zalamasas.com/api/remboursements/simple-paiement-lot \
  -H "Content-Type: application/json" \
  -d '{"partenaire_id": "votre-partenaire-id"}'
```

### 3. **Test avec le script SQL**

Exécuter le script `test-remboursements.sql` dans Supabase pour :
- Vérifier la structure de la table
- Compter les remboursements par statut
- Identifier les montants incohérents
- Vérifier les contraintes

## 📊 Logs de Débogage

### Logs de la route `simple-paiement`

```javascript
console.log('remboursement_id', remboursement_id);

console.log('🔍 Remboursement récupéré:', {
  id: remboursement?.id,
  montant_transaction: remboursement?.montant_transaction,
  frais_service: remboursement?.frais_service,
  montant_total_remboursement: remboursement?.montant_total_remboursement,
  statut: remboursement?.statut,
  partenaire_id: remboursement?.partenaire_id,
  employe_id: remboursement?.employe_id
});
```

### Logs de la route `simple-paiement-lot`

```javascript
console.log('🔍 Remboursements récupérés:', {
  nombre: remboursements?.length || 0,
  partenaire_id,
  remboursements: remboursements?.map(r => ({
    id: r.id,
    montant_transaction: r.montant_transaction,
    montant_total_remboursement: r.montant_total_remboursement,
    date_limite: r.date_limite_remboursement
  }))
});
```

## 🚨 Erreurs Courantes

### Erreur 400 - Paramètres manquants
```json
{
  "error": "remboursement_id requis"
}
```
**Solution :** Ajouter le paramètre `remboursement_id` dans le body

### Erreur 404 - Remboursement non trouvé
```json
{
  "error": "Remboursement non trouvé ou déjà payé"
}
```
**Solution :** Vérifier l'ID et le statut du remboursement

### Erreur 400 - Aucun remboursement en attente
```json
{
  "error": "Aucun remboursement en attente"
}
```
**Solution :** Vérifier qu'il y a des remboursements avec statut 'EN_ATTENTE'

## ✅ Checklist de Diagnostic

- [ ] Vérifier que l'ID du remboursement est correct
- [ ] Vérifier que le statut est 'EN_ATTENTE'
- [ ] Vérifier que les montants sont cohérents
- [ ] Vérifier les logs de l'API
- [ ] Exécuter le script de test SQL
- [ ] Vérifier les contraintes de la base de données

## 📞 Support

Pour toute question ou problème persistant :
1. Consulter les logs de l'API
2. Exécuter le script de diagnostic SQL
3. Vérifier la structure de la base de données
4. Contacter l'équipe de développement 
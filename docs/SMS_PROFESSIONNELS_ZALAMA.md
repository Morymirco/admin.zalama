# 📱 SMS Professionnels ZaLaMa - Guide Complet

## 🎯 Vue d'ensemble

Ce document détaille les SMS professionnels envoyés par ZaLaMa pour les différentes étapes du processus d'avance sur salaire. Tous les SMS suivent un format professionnel et cohérent.

## 📋 Types de SMS

### 1. **Réception de la Demande - SMS Employé**

**Déclencheur :** Création d'une nouvelle demande d'avance
**API :** `/api/advance/notifications` (type: 'request_received')

**Contenu :**
```
ZaLaMa
Bonjour [Prénom],
ZaLaMa a bien reçu votre demande d'avance sur salaire de [Montant] GNF pour [Motif], effectuée le [Date].
Elle est en cours de traitement. Vous recevrez une notification dès sa validation.
Merci pour votre confiance.
```

**Variables dynamiques :**
- `[Prénom]` : Prénom de l'employé
- `[Montant]` : Montant demandé en GNF
- `[Motif]` : Motif de la demande
- `[Date]` : Date de soumission (format français)

### 2. **Réception de la Demande - SMS Interne ZaLaMa**

**Déclencheur :** Création d'une nouvelle demande d'avance
**Destinataires :** Administrateurs (RH, Responsables, Managers)

**Contenu :**
```
ZaLaMa
Nouvelle demande d'avance sur salaire de [Montant] GNF, soumise par [Nom employé], [Nom de l'entreprise], pour [Motif] ce [Date].
En attente de traitement.
```

**Variables dynamiques :**
- `[Montant]` : Montant demandé en GNF
- `[Nom employé]` : Nom complet de l'employé
- `[Nom de l'entreprise]` : Nom de l'entreprise partenaire
- `[Motif]` : Motif de la demande
- `[Date]` : Date de soumission (format français)

### 3. **Validation de la Demande - SMS Employé**

**Déclencheur :** Approbation d'une demande d'avance
**API :** `/api/advance/notifications` (type: 'approval')

**Contenu :**
```
ZaLaMa
Félicitations ! Votre demande d'avance de [Montant] a été approuvée.
Vous recevrez le paiement conformément aux modalités prévues, via Lengo Pay.
Merci pour votre confiance.
```

**Variables dynamiques :**
- `[Montant]` : Montant approuvé en GNF

### 4. **Rejet de la Demande - SMS Employé**

**Déclencheur :** Rejet d'une demande d'avance
**API :** `/api/advance/notifications` (type: 'rejection')

**Contenu :**
```
ZaLaMa
Votre demande d'avance sur salaire de [Montant] GNF pour [Motif] a été rejetée.
Raison : [Motif du rejet].
Veuillez contacter l'assistance pour plus d'informations.
```

**Variables dynamiques :**
- `[Montant]` : Montant demandé en GNF
- `[Motif]` : Motif de la demande
- `[Motif du rejet]` : Raison du rejet fournie par l'administrateur

## 🔧 Implémentation Technique

### Service Principal
**Fichier :** `services/advanceNotificationService.ts`

**Méthodes disponibles :**
- `sendRequestReceivedNotification(requestId)` - Réception de demande
- `sendApprovalNotification(requestId)` - Approbation
- `sendRejectionNotification(requestId, motif_rejet)` - Rejet
- `sendPaymentNotification(paymentId)` - Paiement réussi
- `sendPaymentFailureNotification(paymentId, errorMessage)` - Échec de paiement

### API Route
**Endpoint :** `POST /api/advance/notifications`

**Types supportés :**
- `request_received` - Réception de demande
- `approval` - Approbation
- `rejection` - Rejet
- `payment_success` - Paiement réussi
- `payment_failure` - Échec de paiement

### Exemple d'utilisation

```typescript
// Envoyer notification de réception
const response = await fetch('/api/advance/notifications', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'request_received',
    requestId: 'uuid-de-la-demande'
  })
});

// Envoyer notification d'approbation
const response = await fetch('/api/advance/notifications', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'approval',
    requestId: 'uuid-de-la-demande'
  })
});

// Envoyer notification de rejet
const response = await fetch('/api/advance/notifications', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'rejection',
    requestId: 'uuid-de-la-demande',
    motif_rejet: 'Motif du rejet'
  })
});
```

## 📊 Caractéristiques Techniques

### Format des Messages
- **Longueur maximale :** 160 caractères par SMS
- **Encodage :** UTF-8
- **Expéditeur :** ZaLaMa
- **Formatage :** Utilisation de `\n` pour les sauts de ligne

### Gestion des Erreurs
- **Logs détaillés** pour chaque tentative d'envoi
- **Gestion gracieuse** des échecs (ne fait pas échouer l'application)
- **Notifications d'erreur** aux administrateurs en cas de problème

### Destinataires
- **Employés :** Notifications personnalisées avec leurs informations
- **Administrateurs :** Notifications internes pour le suivi
- **RH/Responsables :** Notifications de nouvelles demandes

## 🎨 Style et Ton

### Caractéristiques du Style
- **Professionnel** : Ton respectueux et formel
- **Clair** : Messages concis et compréhensibles
- **Informatif** : Toutes les informations essentielles incluses
- **Rassurant** : Messages positifs même en cas de rejet

### Éléments de Marque
- **Signature :** "ZaLaMa" en début de message
- **Formule de politesse :** "Merci pour votre confiance"
- **Instructions claires :** Actions à effectuer si nécessaire

## 📈 Métriques et Suivi

### Statistiques Collectées
- **Taux de livraison** des SMS
- **Temps de traitement** des demandes
- **Taux d'approbation/rejet**
- **Satisfaction client** (via retours)

### Logs et Monitoring
- **Horodatage** de chaque envoi
- **Statut** de livraison
- **Erreurs** détaillées en cas d'échec
- **Métadonnées** pour l'analyse

## 🔄 Intégration dans le Workflow

### Flux Complet
1. **Création de demande** → SMS de réception (employé + interne)
2. **Traitement** → Pas de SMS (traitement silencieux)
3. **Approbation** → SMS d'approbation (employé)
4. **Rejet** → SMS de rejet (employé)
5. **Paiement** → SMS de confirmation (employé)

### Déclenchement Automatique
- **SMS de réception** : Automatique lors de la création
- **SMS d'approbation** : Automatique lors de l'approbation
- **SMS de rejet** : Automatique lors du rejet
- **SMS de paiement** : Automatique lors du traitement

## 🚀 Améliorations Futures

### Fonctionnalités Prévues
- **Templates personnalisables** par entreprise
- **Notifications push** en complément des SMS
- **Historique des SMS** consultable par l'employé
- **Préférences de notification** configurables

### Optimisations Techniques
- **File d'attente** pour les envois en masse
- **Retry automatique** en cas d'échec
- **Compression** des messages longs
- **Cache** des templates fréquents

---

*Document mis à jour le : [Date actuelle]*
*Version : 1.0*
*Responsable : Équipe ZaLaMa* 
# API de Solde Lengo Pay

## Description

Cette intégration permet de récupérer le solde du compte marchand Lengo Pay directement depuis le dashboard admin.

## Fonctionnalités

- ✅ Affichage du solde en temps réel
- ✅ Formatage automatique du montant (ex: 7,792 GNF)
- ✅ Indicateur de statut API
- ✅ Bouton de rafraîchissement manuel
- ✅ Gestion des erreurs avec messages utilisateur
- ✅ Design intégré au thème Zalama

## Variables d'environnement requises

```env
LENGO_SITE_ID=votre_site_id_lengo
LENGO_API_KEY=votre_clé_api_lengo
```

## Endpoint utilisé

```
GET https://portal.lengopay.com/api/getbalance/{SITE_ID}
```

### Headers requis
- `Authorization: Basic {API_KEY}`
- `Accept: application/json`
- `Content-Type: application/json`

### Réponse attendue
```json
{
  "status": "Success",
  "balance": "7792",
  "currency": "GNF"
}
```

## Composants créés

### 1. Service de solde (`lib/lengoBalanceService.ts`)
- Classe statique pour interagir avec l'API
- Gestion des erreurs et validation
- Formatage automatique des montants

### 2. API Route (`app/api/payments/lengo-balance/route.ts`)
- Endpoint sécurisé pour récupérer le solde
- Vérification d'origine des requêtes
- Gestion des erreurs avec codes HTTP appropriés

### 3. Composant UI (`components/dashboard/paiements/LengoBalanceCard.tsx`)
- Carte responsive avec design Zalama
- Affichage du solde, statut et devise
- Bouton de rafraîchissement avec indicateur de chargement
- Timestamp de dernière mise à jour

## Intégration dans la page

Le composant `LengoBalanceCard` est intégré dans la page des paiements (`/dashboard/paiements`) :

- Positionné à gauche des onglets (1/3 de la largeur)
- Chargement automatique au montage du composant
- Rafraîchissement manuel via le bouton
- Notifications toast pour les succès/erreurs

## Gestion des erreurs

### Erreurs courantes
- **401 Unauthorized** : Clé API invalide
- **404 Not Found** : Site ID introuvable
- **400 Bad Request** : Requête mal formée
- **500 Internal Server Error** : Erreur serveur

### Messages utilisateur
- Messages d'erreur traduits en français
- Indicateurs visuels de statut
- Suggestions de résolution

## Utilisation

1. Assurez-vous que les variables d'environnement sont configurées
2. Le solde se charge automatiquement à l'ouverture de la page
3. Utilisez le bouton de rafraîchissement pour mettre à jour manuellement
4. Surveillez les notifications pour les erreurs éventuelles

## Sécurité

- Vérification d'origine des requêtes API
- Variables d'environnement pour les clés sensibles
- Pas d'exposition des clés côté client
- Validation des réponses API 
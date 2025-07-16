# Configuration Lengo Pay pour les Remboursements

## Variables d'Environnement Requises

Ajoutez ces variables dans votre fichier `.env.local` :

```env
# Configuration Lengo Pay
LENGO_API_URL=https://portal.lengopay.com
LENGO_API_KEY=votre_clé_api_lengo_pay
LENGO_SITE_ID=votre_site_id_lengo_pay

# URL de votre application
NEXT_PUBLIC_APP_URL=https://votre-domaine.com
```

## Obtention des Clés Lengo Pay

1. **LENGO_API_KEY** : Votre clé de licence Lengo Pay (utilisée comme Authorization Basic)
2. **LENGO_SITE_ID** : L'identifiant unique de votre site Lengo Pay (websiteid)
3. **LENGO_API_URL** : URL de l'API Lengo Pay (par défaut: https://portal.lengopay.com)

## Endpoint Utilisé

L'API utilise l'endpoint officiel de Lengo Pay :
```
POST https://portal.lengopay.com/api/v1/payments
```

### Paramètres Requis
```json
{
  "websiteid": "votre_site_id",
  "amount": 1500,
  "currency": "GNF",
  "return_url": "https://votre-domaine.com/dashboard/remboursements?status=success",
  "callback_url": "https://votre-domaine.com/api/remboursements/lengo-callback"
}
```

## Configuration du Callback

Le callback URL doit être accessible publiquement pour que Lengo Pay puisse envoyer les notifications de statut.

### URL de Callback
```
https://votre-domaine.com/api/remboursements/lengo-callback
```

### Format des Données de Callback
```json
{
  "pay_id": "identifiant_paiement",
  "status": "SUCCESS|FAILED|PENDING|CANCELLED",
  "amount": 1500,
  "message": "Transaction Successful",
  "Client": "624897845"
}
```

## Test de la Configuration

1. **Vérifier les variables d'environnement** :
   ```bash
   # Vérifier que les variables sont chargées
   echo $LENGO_API_KEY
   echo $LENGO_SITE_ID
   ```

2. **Tester l'endpoint de callback** :
   ```bash
   curl https://votre-domaine.com/api/remboursements/lengo-callback
   ```

3. **Tester l'initiation d'un paiement** :
   ```bash
   curl -X POST https://votre-domaine.com/api/remboursements/lengo-paiement \
     -H "Content-Type: application/json" \
     -d '{
       "remboursement_id": "test-id",
       "amount": 1500,
       "currency": "GNF"
     }'
   ```

## Utilisation dans l'Interface

1. **Ouvrir la page des remboursements**
2. **Sélectionner un remboursement en attente**
3. **Cliquer sur "Payer via Lengo Pay"**
4. **Suivre les instructions de paiement**

## Gestion des Erreurs

### Erreur "Configuration Lengo Pay manquante"
- Vérifiez que `LENGO_API_KEY` et `LENGO_SITE_ID` sont définis dans `.env.local`
- Redémarrez le serveur de développement

### Erreur 500 "Server Error"
- Vérifiez que les paramètres envoyés sont corrects
- Assurez-vous que `LENGO_API_KEY` est valide
- Vérifiez que `LENGO_SITE_ID` correspond à votre site

### Erreur de callback
- Vérifiez que l'URL de callback est accessible publiquement
- Testez l'endpoint avec `curl`

## Sécurité

- Ne jamais commiter les clés API dans le code source
- Utiliser des variables d'environnement pour toutes les clés sensibles
- Vérifier régulièrement les logs pour détecter les tentatives d'accès non autorisées

## Monitoring

Les logs suivants sont disponibles dans la console :

- `🚀 Initiation paiement Lengo Pay` : Début d'un paiement
- `📤 Données envoyées à Lengo Pay` : Paramètres envoyés
- `📞 Callback Lengo Pay reçu` : Réception d'un callback
- `✅ Paiement Lengo Pay initié avec succès` : Paiement initié
- `✅ Callback Lengo Pay traité avec succès` : Callback traité

## Support

En cas de problème :
1. Vérifiez les logs dans la console
2. Testez les endpoints individuellement
3. Contactez le support Lengo Pay pour les problèmes d'API 
# Configuration Lengo Pay

Ce guide explique comment configurer Lengo Pay pour les paiements dans l'application ZaLaMa.

## Variables d'environnement requises

Ajoutez les variables suivantes à votre fichier `.env.local` :

```env
# Lengo Pay Configuration
LENGO_API_KEY=votre_clé_api_lengo
LENGO_API_URL=https://api.lengo.ci
LENGO_CALLBACK_URL=https://votre-domaine.com/api/payments/lengo-callback
```

## Obtention des credentials

1. **Créer un compte Lengo Pay** :
   - Visitez [Lengo Pay](https://lengo.ci)
   - Créez un compte développeur
   - Accédez à votre dashboard

2. **Obtenir l'API Key** :
   - Dans votre dashboard Lengo Pay
   - Allez dans la section "API" ou "Développeur"
   - Générez une nouvelle clé API
   - Copiez la clé dans `LENGO_API_KEY`

3. **Configurer l'URL de callback** :
   - L'URL de callback doit être accessible publiquement
   - Pour le développement local, utilisez ngrok ou similaire
   - Format : `https://votre-domaine.com/api/payments/lengo-callback`

## Test de la configuration

1. **Vérifier les variables** :
   ```bash
   node scripts/test-payment-page.js
   ```

2. **Démarrer le serveur** :
   ```bash
   npm run dev
   ```

3. **Tester la page** :
   - Accédez à : `http://localhost:3000/dashboard/paiements`
   - Remplissez le formulaire
   - Cliquez sur "Initier le paiement"

## Structure des paiements

### Flux de paiement

1. **Initiation** : L'utilisateur remplit le formulaire
2. **API Call** : Appel à `/api/payments/lengo-cashin`
3. **Lengo Pay** : Redirection vers Lengo Pay
4. **Confirmation** : L'utilisateur confirme le paiement
5. **Callback** : Lengo Pay notifie via `/api/payments/lengo-callback`
6. **Mise à jour** : Le statut est mis à jour dans la base de données

### Tables de base de données

La table `transactions` stocke :
- `id` : Identifiant unique
- `amount` : Montant du paiement
- `phone` : Numéro de téléphone
- `description` : Description du paiement
- `status` : Statut (pending, success, failed)
- `lengo_transaction_id` : ID de transaction Lengo
- `partner_id` : ID du partenaire (optionnel)
- `created_at` : Date de création
- `updated_at` : Date de mise à jour

## Gestion des erreurs

### Erreurs courantes

1. **API Key invalide** :
   - Vérifiez que `LENGO_API_KEY` est correcte
   - Assurez-vous que la clé est active

2. **URL de callback inaccessible** :
   - Vérifiez que `LENGO_CALLBACK_URL` est accessible
   - Testez l'URL dans un navigateur

3. **Numéro de téléphone invalide** :
   - Format requis : `22507000000` (format international)
   - Vérifiez que le numéro est valide

### Logs de débogage

Les logs de l'API sont disponibles dans :
- Console du serveur Next.js
- Logs de Supabase (si configurés)
- Logs de Lengo Pay (dans leur dashboard)

## Sécurité

### Bonnes pratiques

1. **Variables d'environnement** :
   - Ne jamais commiter les clés API dans le code
   - Utilisez des variables d'environnement
   - Différentes clés pour dev/prod

2. **Validation** :
   - Validez tous les inputs côté serveur
   - Vérifiez les signatures Lengo Pay
   - Gérez les timeouts

3. **Monitoring** :
   - Surveillez les échecs de paiement
   - Loggez les transactions importantes
   - Alertez en cas d'anomalies

## Support

Pour obtenir de l'aide :
- Documentation Lengo Pay : [docs.lengo.ci](https://docs.lengo.ci)
- Support technique : support@lengo.ci
- Issues GitHub : [Repository du projet](https://github.com/votre-repo) 
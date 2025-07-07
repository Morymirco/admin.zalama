# Guide SMS Marketing avec Nimba SMS

Ce guide explique comment utiliser la fonctionnalité SMS marketing de l'application admin.zalama avec l'API Nimba SMS.

## 📱 Configuration Nimba SMS

### Variables d'environnement requises

Ajoutez ces variables dans votre fichier `.env.local` :

```env
NIMBA_SMS_SERVICE_ID=votre_service_id
NIMBA_SMS_SECRET_TOKEN=votre_secret_token
```

### Configuration par défaut

Si les variables d'environnement ne sont pas définies, l'application utilise une configuration par défaut :

```javascript
const config = {
  SERVICE_ID: '9d83d5b67444c654c702f109dd837167',
  SECRET_TOKEN: 'qf_bpb4CVfEalTU5eVEFC05wpoqlo17M-mozkZVbIHT_3xfOIjB7Oac-lkXZ6Pg2VqO2LXVy6BUlYTZe73y411agSC0jVh3OcOU92s8Rplc',
};
```

## 🚀 Fonctionnalités disponibles

### 1. Affichage du solde SMS

- **Page** : `/dashboard/marketing`
- **API** : `GET /api/sms/balance`
- **Fonctionnalité** : Affiche le solde actuel du compte SMS avec possibilité de rafraîchissement

### 2. Envoi en masse de SMS

- **Page** : `/dashboard/marketing` (onglet SMS)
- **API** : `POST /api/sms/send`
- **Fonctionnalités** :
  - Validation du message (max 160 caractères)
  - Validation du solde avant envoi
  - Support de multiples destinataires
  - Affichage du nombre de destinataires

### 3. Historique des messages

- **Page** : `/dashboard/marketing` (section "Messages récents")
- **API** : `GET /api/sms/messages?limit=10`
- **Fonctionnalités** :
  - Affichage des 10 derniers messages
  - Statut des messages (envoyé, échoué, en attente)
  - Date et heure d'envoi
  - Coût par message

### 4. Statistiques des messages

- **Métriques affichées** :
  - Messages envoyés avec succès
  - Messages échoués
  - Total des messages
  - Solde SMS actuel

## 📊 Interface utilisateur

### Page Marketing

La page marketing est divisée en plusieurs sections :

1. **Statistiques** : 4 cartes affichant les métriques principales
2. **Messages récents** : Liste des derniers messages avec statuts
3. **Onglets** : SMS et Email pour l'envoi en masse
4. **Formulaires** : Interface d'envoi avec validation

### Fonctionnalités interactives

- **Bouton de rafraîchissement** : Actualise le solde SMS
- **Compteur de caractères** : Affiche le nombre de caractères restants
- **Compteur de destinataires** : Affiche le nombre de destinataires valides
- **Statuts colorés** : Indicateurs visuels pour les statuts des messages

## 🔧 API Endpoints

### GET /api/sms/balance

Récupère le solde du compte SMS.

**Réponse :**
```json
{
  "success": true,
  "balance": {
    "balance": 100,
    "currency": "GNF"
  },
  "message": "Solde récupéré avec succès"
}
```

### POST /api/sms/send

Envoie un ou plusieurs SMS.

**Corps de la requête :**
```json
{
  "to": ["+224XXXXXXXXX"],
  "message": "Votre message SMS",
  "sender_name": "ZaLaMa"
}
```

**Réponse :**
```json
{
  "success": true,
  "response": {
    "id": "message-id",
    "status": "sent"
  },
  "message": "SMS envoyé avec succès"
}
```

### GET /api/sms/messages

Récupère l'historique des messages.

**Paramètres :**
- `limit` : Nombre de messages à récupérer (défaut: 10)

**Réponse :**
```json
{
  "success": true,
  "messages": [
    {
      "id": "message-id",
      "to": "+224XXXXXXXXX",
      "message": "Contenu du message",
      "sender_name": "ZaLaMa",
      "status": "sent",
      "created_at": "2024-01-01T12:00:00Z",
      "cost": 10
    }
  ],
  "count": 1
}
```

### POST /api/sms/messages

Récupère un message spécifique.

**Corps de la requête :**
```json
{
  "messageId": "message-id"
}
```

## 🧪 Tests

### Script de test

Utilisez le script `scripts/test-sms-messages.js` pour tester l'intégration :

```bash
node scripts/test-sms-messages.js
```

Ce script teste :
1. Récupération de tous les messages
2. Récupération des messages récents
3. Récupération d'un message spécifique
4. Envoi d'un message de test
5. Vérification du solde
6. Tests de l'API Next.js

### Tests manuels

1. **Test du solde** : Vérifiez que le solde s'affiche correctement
2. **Test d'envoi** : Envoyez un SMS de test
3. **Test de l'historique** : Vérifiez que les messages apparaissent dans l'historique
4. **Test de validation** : Testez les limites de caractères et la validation des numéros

## 📋 Bonnes pratiques

### Envoi de SMS

1. **Validation des numéros** : Assurez-vous que les numéros sont au format international
2. **Longueur des messages** : Respectez la limite de 160 caractères
3. **Solde suffisant** : Vérifiez le solde avant l'envoi en masse
4. **Nom de l'expéditeur** : Utilisez un nom d'expéditeur approuvé

### Gestion des erreurs

1. **Erreurs réseau** : Gérez les timeouts et les erreurs de connexion
2. **Erreurs d'API** : Traitez les erreurs de l'API Nimba SMS
3. **Validation** : Validez les données avant l'envoi
4. **Feedback utilisateur** : Affichez des messages d'erreur clairs

### Performance

1. **Envoi en lot** : Pour de gros volumes, envoyez les SMS par lots
2. **Mise en cache** : Cachez le solde pour éviter les appels API fréquents
3. **Pagination** : Utilisez la pagination pour l'historique des messages
4. **Actualisation** : Permettez à l'utilisateur de rafraîchir manuellement

## 🔒 Sécurité

### Protection des données

1. **Variables d'environnement** : Stockez les clés API dans des variables d'environnement
2. **Validation côté serveur** : Validez toutes les données côté serveur
3. **Limitation de débit** : Implémentez une limitation de débit pour éviter l'abus
4. **Logs sécurisés** : Ne loggez pas les données sensibles

### Authentification

1. **Middleware** : Protégez les routes API avec l'authentification
2. **Autorisation** : Vérifiez les permissions utilisateur
3. **Session** : Validez les sessions utilisateur
4. **CSRF** : Protégez contre les attaques CSRF

## 🐛 Dépannage

### Problèmes courants

1. **Solde non affiché** :
   - Vérifiez les variables d'environnement
   - Testez la connexion à l'API Nimba SMS
   - Vérifiez les logs du serveur

2. **SMS non envoyés** :
   - Vérifiez le solde du compte
   - Validez le format des numéros
   - Vérifiez le nom de l'expéditeur

3. **Erreurs d'API** :
   - Vérifiez les clés API
   - Testez la connectivité réseau
   - Consultez la documentation Nimba SMS

### Logs utiles

Les logs suivants sont disponibles dans la console :

- `💰 Vérification du solde SMS via API route`
- `📱 Envoi SMS via API route`
- `📱 Récupération des messages SMS via API route`
- `✅ SMS envoyé avec succès`
- `❌ Erreur lors de l'envoi du SMS`

## 📞 Support

Pour obtenir de l'aide :

1. **Documentation Nimba SMS** : Consultez la documentation officielle
2. **Logs d'erreur** : Vérifiez les logs du serveur
3. **Tests** : Utilisez les scripts de test fournis
4. **API Status** : Vérifiez le statut de l'API Nimba SMS

## 🔄 Mises à jour

### Version actuelle

- **Intégration Nimba SMS** : Complète
- **Interface utilisateur** : Moderne et responsive
- **Validation** : Complète côté client et serveur
- **Tests** : Scripts de test disponibles

### Améliorations futures

- [ ] Support des modèles de messages
- [ ] Planification d'envoi
- [ ] Rapports détaillés
- [ ] Intégration avec d'autres fournisseurs SMS
- [ ] Support des SMS groupés
- [ ] Notifications en temps réel 
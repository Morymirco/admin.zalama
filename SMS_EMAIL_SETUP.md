# Configuration SMS & Email - ZaLaMa Admin

Ce guide explique comment configurer les services SMS (Nimba SMS) et Email (Resend) pour l'application ZaLaMa Admin.

## 📱 Configuration SMS - Nimba SMS

### 1. Créer un compte Nimba SMS

1. Rendez-vous sur [Nimba SMS](https://nimbasms.com)
2. Créez un compte et vérifiez votre identité
3. Rechargez votre compte avec des crédits SMS

### 2. Obtenir les clés API

1. Connectez-vous à votre dashboard Nimba SMS
2. Allez dans la section "API" ou "Développeurs"
3. Notez votre `SERVICE_ID` et `SECRET_TOKEN`

### 3. Configurer les variables d'environnement

Ajoutez ces variables dans votre fichier `.env.local` :

```env
# Configuration Nimba SMS
NIMBA_SMS_SERVICE_ID=votre_service_id_ici
NIMBA_SMS_SECRET_TOKEN=votre_secret_token_ici
```

### 4. Tester la configuration SMS

```bash
# Test direct du service SMS
npm run test-sms-email

# Ou démarrer le serveur et tester via l'interface
npm run dev
# Puis aller sur http://localhost:3000/dashboard/test-sms
```

## 📧 Configuration Email - Resend

### 1. Créer un compte Resend

1. Rendez-vous sur [Resend](https://resend.com)
2. Créez un compte et vérifiez votre email
3. Ajoutez un domaine ou utilisez le domaine de test

### 2. Obtenir la clé API

1. Connectez-vous à votre dashboard Resend
2. Allez dans la section "API Keys"
3. Créez une nouvelle clé API
4. Copiez la clé API

### 3. Configurer les variables d'environnement

Ajoutez cette variable dans votre fichier `.env.local` :

```env
# Configuration Resend
RESEND_API_KEY=re_votre_cle_api_ici
```

### 4. Configurer le domaine d'envoi

Dans l'API route `/api/email/send`, modifiez l'adresse d'expédition :

```typescript
// Remplacez par votre domaine vérifié
from: 'ZaLaMa <noreply@votre-domaine.com>',
```

### 5. Tester la configuration Email

```bash
# Test direct du service Email
npm run test-sms-email

# Ou tester via l'interface
npm run dev
# Puis aller sur http://localhost:3000/dashboard/test-sms
```

## 🧪 Page de Test

Une page de test complète est disponible à `/dashboard/test-sms` qui permet de :

- ✅ Tester l'envoi de SMS
- ✅ Tester l'envoi d'emails
- ✅ Voir les résultats en temps réel
- ✅ Vérifier les erreurs et les succès

## 🔧 Dépannage

### Problèmes SMS

1. **Erreur "Service SMS non configuré"**
   - Vérifiez que les variables d'environnement sont définies
   - Redémarrez le serveur après modification du `.env.local`

2. **Erreur "Network Error"**
   - Vérifiez votre connexion internet
   - Le service continue de fonctionner sans SMS

3. **Erreur "Invalid phone number"**
   - Utilisez le format international : `+224XXXXXXXXX`
   - Le système formate automatiquement les numéros

### Problèmes Email

1. **Erreur "Invalid API key"**
   - Vérifiez que la clé API Resend est correcte
   - Assurez-vous que le compte Resend est actif

2. **Erreur "Domain not verified"**
   - Vérifiez votre domaine dans Resend
   - Utilisez un domaine de test pour les tests

3. **Emails non reçus**
   - Vérifiez les spams
   - Testez avec une adresse email valide

## 📋 Variables d'environnement complètes

```env
# Configuration Nimba SMS
NIMBA_SMS_SERVICE_ID=votre_service_id_ici
NIMBA_SMS_SECRET_TOKEN=votre_secret_token_ici

# Configuration Resend
RESEND_API_KEY=re_votre_cle_api_ici

# Configuration Supabase (déjà configuré)
NEXT_PUBLIC_SUPABASE_URL=https://mspmrzlqhwpdkkburjiw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=votre_cle_service_role_ici
```

## 🚀 Commandes utiles

```bash
# Tester les services SMS et Email
npm run test-sms-email

# Démarrer le serveur de développement
npm run dev

# Vérifier la configuration
npm run check-supabase-env

# Nettoyer le cache
npm run clean
```

## 📞 Support

En cas de problème :

1. Vérifiez les logs du serveur
2. Testez avec la page `/dashboard/test-sms`
3. Vérifiez la configuration des services
4. Consultez la documentation des services :
   - [Nimba SMS Documentation](https://nimbasms.com/docs)
   - [Resend Documentation](https://resend.com/docs)

---

**Note :** Les services SMS et Email sont optionnels. L'application continue de fonctionner même si ces services ne sont pas configurés. 
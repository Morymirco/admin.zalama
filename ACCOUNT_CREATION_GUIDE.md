# Guide de Création des Comptes RH et Responsable

Ce guide vous aide à vérifier et s'assurer que la création automatique des comptes RH et Responsable fonctionne correctement lors de l'ajout d'un partenaire.

## 🔧 Configuration Requise

### 1. Variables d'environnement

Assurez-vous que votre fichier `.env.local` contient :

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=votre_url_supabase
SUPABASE_SERVICE_ROLE_KEY=votre_clé_service_supabase

# Email (Resend)
RESEND_API_KEY=votre_clé_api_resend

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. Vérification de la configuration

```bash
npm run check-supabase-env
```

## 🧪 Tests de Création de Comptes

### Test automatique

Exécutez le script de test pour vérifier que tout fonctionne :

```bash
npm run test-account-creation
```

Ce script va :
- ✅ Vérifier la connexion Supabase
- ✅ Tester la création d'un compte RH
- ✅ Tester la création d'un compte Responsable
- ✅ Tester les endpoints API
- ✅ Nettoyer les comptes de test

### Test manuel

1. **Démarrer l'application** :
   ```bash
   npm run dev
   ```

2. **Aller sur la page des partenaires** :
   ```
   http://localhost:3000/dashboard/partenaires
   ```

3. **Ajouter un nouveau partenaire** avec :
   - Email RH : `test-rh@votre-domaine.com`
   - Email Responsable : `test-responsable@votre-domaine.com`

4. **Vérifier dans Supabase** :
   - Aller dans Authentication > Users
   - Vérifier que les comptes ont été créés
   - Vérifier les métadonnées (role, partenaireId, etc.)

## 📧 Vérification des Emails

### Configuration Resend

1. **Vérifier la clé API Resend** dans `.env.local`
2. **Tester l'envoi d'email** :
   - Les emails doivent être envoyés automatiquement
   - Vérifier les logs dans la console
   - Vérifier le dossier spam si nécessaire

### Templates d'emails

Les templates sont configurés dans `lib/email-service.ts` :
- `sendPasswordResetEmailRH()` : Email pour les comptes RH
- `sendWelcomeEmailToResponsable()` : Email pour les comptes Responsable

## 🔍 Dépannage

### Erreur "Supabase connection failed"

```bash
# Vérifier les variables d'environnement
npm run check-supabase-env

# Vérifier la clé de service
echo $SUPABASE_SERVICE_ROLE_KEY
```

### Erreur "Email not sent"

1. **Vérifier la clé Resend** :
   ```bash
   echo $RESEND_API_KEY
   ```

2. **Vérifier les logs** dans la console du navigateur

3. **Tester l'envoi manuel** :
   ```javascript
   // Dans la console du navigateur
   fetch('/api/auth/create-rh-supabase', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({
       email: 'test@example.com',
       displayName: 'Test User',
       partenaireId: 'test-id',
       partenaireNom: 'Test Company'
     })
   })
   ```

### Erreur "User already exists"

- Les emails doivent être uniques
- Utilisez des emails différents pour chaque test
- Vérifiez dans Supabase Auth > Users

## 📋 Checklist de Vérification

- [ ] Variables d'environnement configurées
- [ ] Connexion Supabase fonctionnelle
- [ ] Clé API Resend valide
- [ ] Endpoints API accessibles
- [ ] Création de comptes RH fonctionne
- [ ] Création de comptes Responsable fonctionne
- [ ] Emails envoyés automatiquement
- [ ] Métadonnées utilisateur correctes
- [ ] Liens de réinitialisation générés

## 🚀 Utilisation en Production

### Sécurité

1. **Ne jamais exposer** `SUPABASE_SERVICE_ROLE_KEY` côté client
2. **Utiliser HTTPS** en production
3. **Valider les emails** avant création
4. **Limiter les tentatives** de création

### Monitoring

1. **Logs** : Surveiller les logs d'erreur
2. **Métriques** : Suivre le taux de succès des créations
3. **Emails** : Surveiller les bounces et échecs d'envoi

## 📞 Support

En cas de problème :
1. Vérifier les logs dans la console
2. Exécuter `npm run test-account-creation`
3. Vérifier la configuration Supabase
4. Tester avec des emails valides

---

**Note** : Ce système utilise Supabase Auth pour la gestion des utilisateurs et Resend pour l'envoi d'emails. Assurez-vous que ces services sont correctement configurés. 
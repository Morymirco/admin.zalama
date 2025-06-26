# Guide de Configuration de l'Authentification Supabase

## 🚀 Vue d'ensemble

Ce guide vous accompagne dans la configuration complète de l'authentification Supabase pour l'application ZaLaMa Admin Dashboard.

## 📋 Prérequis

- ✅ Projet Supabase créé
- ✅ Variables d'environnement configurées
- ✅ Schéma de base de données appliqué

## 🔧 Configuration des Variables d'Environnement

### 1. Récupération des Clés Supabase

1. **Allez dans votre dashboard Supabase** : https://supabase.com/dashboard
2. **Sélectionnez votre projet** ZaLaMa
3. **Allez dans Settings → API**
4. **Copiez les informations suivantes** :

```bash
# URL du projet
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co

# Clé anonyme (anon key)
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ⚠️ IMPORTANT : Clé service role (service_role secret)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 2. Mise à Jour du Fichier .env.local

Remplacez les valeurs dans votre fichier `.env.local` :

```bash
# Configuration Supabase ZaLaMa Admin
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anon_ici
SUPABASE_SERVICE_ROLE_KEY=votre_cle_service_role_ici

# Autres configurations...
```

## 🗄️ Configuration de la Base de Données

### 1. Application du Schéma

Exécutez le script pour appliquer le schéma complet :

```bash
npm run setup-supabase-db
```

### 2. Vérification du Schéma

Le schéma inclut maintenant :

- ✅ **Table `admin_users`** : Utilisateurs d'administration
- ✅ **Table `users`** : Utilisateurs finaux
- ✅ **Politiques RLS** : Sécurité au niveau des lignes
- ✅ **Index optimisés** : Performance des requêtes

## 👤 Création du Compte Administrateur

### 1. Exécution du Script

```bash
npm run create-admin
```

### 2. Informations du Compte Admin

Le script crée automatiquement un compte administrateur avec :

- **Email** : `admin@zalamagn.com`
- **Mot de passe** : `AdminZalama2024!`
- **Rôle** : `admin`

### 3. Vérification de la Création

Le script vérifie :
- ✅ Connexion à Supabase
- ✅ Création du compte dans Supabase Auth
- ✅ Ajout dans la table `admin_users`
- ✅ Attribution du rôle admin

## 🔐 Système d'Authentification

### 1. Service d'Authentification

Le service `authService.ts` gère :

- ✅ **Connexion/Déconnexion**
- ✅ **Inscription d'utilisateurs**
- ✅ **Réinitialisation de mot de passe**
- ✅ **Gestion des rôles**
- ✅ **Vérification des permissions**

### 2. Hook React

Le hook `useAuth` fournit :

- ✅ **État d'authentification**
- ✅ **Profil utilisateur**
- ✅ **Vérification des rôles**
- ✅ **Gestion des sessions**

### 3. Middleware de Protection

Le middleware protège :

- ✅ **Routes du dashboard**
- ✅ **Redirection automatique**
- ✅ **Vérification des sessions**

## 🎨 Interface de Connexion

### 1. Page de Connexion

- ✅ **Design moderne** avec thème ZaLaMa
- ✅ **Validation des champs**
- ✅ **Gestion des erreurs**
- ✅ **Informations de test**

### 2. Redirection Automatique

- ✅ **Utilisateurs connectés** → Dashboard
- ✅ **Utilisateurs non connectés** → Page de connexion

## 🔒 Sécurité

### 1. Politiques RLS (Row Level Security)

```sql
-- Seuls les admins peuvent voir tous les utilisateurs
CREATE POLICY "Admins can view all admin users" ON admin_users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admin_users au 
      WHERE au.id = auth.uid() AND au.role = 'admin'
    )
  );

-- Les utilisateurs peuvent voir leur propre profil
CREATE POLICY "Users can view their own profile" ON admin_users
  FOR SELECT USING (id = auth.uid());
```

### 2. Rôles Utilisateurs

- **`admin`** : Accès complet à toutes les fonctionnalités
- **`user`** : Accès limité
- **`rh`** : Accès aux ressources humaines
- **`responsable`** : Accès de supervision

## 🧪 Test de l'Authentification

### 1. Démarrage de l'Application

```bash
npm run dev
```

### 2. Test de Connexion

1. **Allez sur** : http://localhost:3000
2. **Vous serez redirigé vers** : http://localhost:3000/login
3. **Connectez-vous avec** :
   - Email : `admin@zalamagn.com`
   - Mot de passe : `AdminZalama2024!`
4. **Vous serez redirigé vers** : http://localhost:3000/dashboard

### 3. Vérification des Permissions

- ✅ **Accès au dashboard** : Seuls les utilisateurs authentifiés
- ✅ **Rôle admin** : Accès à toutes les fonctionnalités
- ✅ **Déconnexion** : Suppression de la session

## 🔄 Gestion des Sessions

### 1. Persistance des Sessions

- ✅ **Cookies sécurisés**
- ✅ **Renouvellement automatique**
- ✅ **Gestion des timeouts**

### 2. État Global

- ✅ **Hook `useAuth`** pour l'état global
- ✅ **Context React** pour le partage
- ✅ **Mise à jour en temps réel**

## 🛠️ Dépannage

### 1. Erreur "Invalid API key"

**Cause** : Clé service role incorrecte ou manquante

**Solution** :
1. Vérifiez votre fichier `.env.local`
2. Récupérez la vraie clé service role dans Supabase Dashboard
3. Redémarrez l'application

### 2. Erreur "Bucket not found"

**Cause** : Bucket de stockage non créé

**Solution** :
```bash
npm run create-storage-bucket
```

### 3. Erreur de Connexion

**Cause** : Variables d'environnement manquantes

**Solution** :
```bash
npm run check-supabase-env
```

### 4. Utilisateur Non Trouvé

**Cause** : Table `admin_users` non créée

**Solution** :
```bash
npm run setup-supabase-db
npm run create-admin
```

## 📝 Commandes Utiles

```bash
# Vérifier la configuration
npm run check-supabase-env

# Appliquer le schéma de base
npm run setup-supabase-db

# Créer le compte admin
npm run create-admin

# Créer le bucket de stockage
npm run create-storage-bucket

# Démarrer l'application
npm run dev
```

## 🔄 Migration depuis Firebase

### 1. État Actuel

- ✅ **Authentification** : Migrée vers Supabase
- ✅ **Base de données** : Migrée vers Supabase
- ✅ **Stockage** : En cours de migration

### 2. Prochaines Étapes

- 🔄 **Notifications** : Migration en cours
- 🔄 **Emails** : Migration en cours
- 🔄 **SMS** : Migration en cours

## 📞 Support

En cas de problème :

1. **Vérifiez les logs** de la console
2. **Consultez ce guide** de dépannage
3. **Vérifiez la documentation** Supabase
4. **Contactez l'équipe** de développement

---

**🎉 Félicitations !** Votre système d'authentification Supabase est maintenant configuré et fonctionnel. 
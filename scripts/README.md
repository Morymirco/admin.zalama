# Scripts de Création d'Admin - ZaLaMa

## 📋 Vue d'ensemble

Ce dossier contient les scripts pour créer l'administrateur par défaut dans Supabase.

## 🔧 Prérequis

1. **Variables d'environnement** : Créez un fichier `.env.local` à la racine du projet avec :
   ```env
   NEXT_PUBLIC_SUPABASE_URL=votre_url_supabase
   NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anon
   SUPABASE_SERVICE_ROLE_KEY=votre_cle_service_role
   ```

2. **Clé Service Role** : Récupérez votre clé service role dans :
   - Supabase Dashboard → Settings → API → `service_role` key

## 🚀 Méthodes de Création

### Méthode 1 : Script Node.js (Recommandée)

```bash
# Installer dotenv si pas déjà fait
npm install dotenv

# Exécuter le script
node scripts/create-admin.js
```

**Avantages :**
- Crée automatiquement l'utilisateur dans Supabase Auth ET dans la table `users`
- Gère les erreurs et les cas où l'admin existe déjà
- Utilise la même clé d'API que votre application

### Méthode 2 : Interface Web Supabase

1. Allez sur [app.supabase.com](https://app.supabase.com/)
2. Sélectionnez votre projet
3. Authentication → Users → Add User
4. Remplissez :
   - **Email** : `admin@zalama.com`
   - **Password** : `admin123`
5. Cliquez sur "Create User"

### Méthode 3 : Script SQL

1. Allez dans Supabase Dashboard → SQL Editor
2. Copiez-collez le contenu de `supabase/create-admin.sql`
3. Exécutez le script

**Note :** Cette méthode ne crée que dans la table `users`, pas dans Auth.

## 📊 Informations de l'Admin

- **Email** : `admin@zalama.com`
- **Mot de passe** : `admin123`
- **Type** : Entreprise
- **Statut** : Actif
- **Organisation** : ZaLaMa Admin

## 🔍 Vérification

Après création, vous pouvez vérifier que l'admin existe :

1. **Dans Supabase Auth** : Authentication → Users
2. **Dans la table users** : Table Editor → users

## 🛠️ Dépannage

### Erreur "Variables d'environnement manquantes"
- Vérifiez que votre fichier `.env.local` existe
- Vérifiez que les variables sont correctement nommées

### Erreur "Service role key invalid"
- Vérifiez que vous utilisez la bonne clé service role
- La clé service role est différente de la clé anon

### Erreur "User already exists"
- Le script gère automatiquement ce cas
- L'admin sera mis à jour s'il existe déjà

## 🔐 Sécurité

⚠️ **Important :**
- Ne partagez jamais votre clé service role
- Ne committez jamais le fichier `.env.local`
- Changez le mot de passe de l'admin après la première connexion

## 📝 Logs

Le script affiche des logs détaillés :
- ✅ Succès
- ❌ Erreurs
- ⚠️ Avertissements
- �� Actions en cours 
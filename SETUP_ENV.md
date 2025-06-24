# 🔧 Guide de Configuration des Variables d'Environnement

Ce guide vous explique comment configurer les variables d'environnement pour le projet ZaLaMa Admin sur un nouveau PC.

## 📋 Prérequis

1. **Compte Supabase** avec un projet créé
2. **Node.js** installé (version 16 ou supérieure)
3. **Git** installé
4. **Accès au projet** (cloné ou téléchargé)

## 🚀 Étapes de Configuration

### 1. Cloner le Projet

```bash
git clone <URL_DU_REPO>
cd admin.zalama
```

### 2. Installer les Dépendances

```bash
npm install
```

### 3. Créer le Fichier .env.local

Créez un fichier `.env.local` à la racine du projet :

```bash
touch .env.local
```

### 4. Configurer les Variables d'Environnement

Ouvrez le fichier `.env.local` et ajoutez les variables suivantes :

```env
# Configuration Supabase
NEXT_PUBLIC_SUPABASE_URL=votre_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anonyme
SUPABASE_SERVICE_ROLE_KEY=votre_cle_service_role
```

## 🔑 Identifiants Supabase ZaLaMa

### Configuration Prête à Utiliser

Pour le projet ZaLaMa Admin, utilisez ces identifiants :

```env
# Configuration Supabase ZaLaMa
NEXT_PUBLIC_SUPABASE_URL=https://mspmrzlqhwpdkkburjiw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zcG1yemxxaHdwZGtrYnVyaml3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3ODcyNTgsImV4cCI6MjA2NjM2MzI1OH0.zr-TRpKjGJjW0nRtsyPcCLy4Us-c5tOGX71k5_3JJd0
SUPABASE_SERVICE_ROLE_KEY=votre_cle_service_role_ici
```

**⚠️ Note :** Il vous manque la clé `SUPABASE_SERVICE_ROLE_KEY`. Récupérez-la dans votre dashboard Supabase.

### Comment Récupérer la Clé Service Role Manquante

1. Connectez-vous à [supabase.com](https://supabase.com)
2. Sélectionnez votre projet ZaLaMa
3. Allez dans **Settings** → **API**
4. Dans la section **Project API keys**, copiez la valeur **service_role secret**
5. Remplacez `votre_cle_service_role_ici` par cette valeur

### Exemple de Configuration Complète

```env
# Configuration Supabase ZaLaMa Admin
NEXT_PUBLIC_SUPABASE_URL=https://mspmrzlqhwpdkkburjiw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zcG1yemxxaHdwZGtrYnVyaml3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3ODcyNTgsImV4cCI6MjA2NjM2MzI1OH0.zr-TRpKjGJjW0nRtsyPcCLy4Us-c5tOGX71k5_3JJd0
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zcG1yemxxaHdwZGtrYnVyaml3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDc4NzI1OCwiZXhwIjoyMDY2MzYzMjU4fQ.example
```

## 🗄️ Configuration de la Base de Données

### Étape 1 : Exécuter le Schéma SQL

1. Allez dans **SQL Editor** dans votre dashboard Supabase
2. Exécutez le contenu du fichier `supabase/schema.sql`
3. Ou utilisez le fichier `supabase/schema-fixed.sql` si vous avez des problèmes de RLS

### Étape 2 : Créer l'Admin

Exécutez le script de création de l'admin :

```bash
node scripts/create-admin.js
```

**Identifiants par défaut :**
- Email : `admin@zalama.com`
- Mot de passe : `admin123`

## 🔒 Sécurité

### Variables Sensibles

- `SUPABASE_SERVICE_ROLE_KEY` : **NE JAMAIS** exposer publiquement
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` : Peut être exposée (préfixe NEXT_PUBLIC)
- `NEXT_PUBLIC_SUPABASE_URL` : Peut être exposée

### Bonnes Pratiques

1. **Ne jamais commiter** le fichier `.env.local`
2. **Utiliser des variables d'environnement** pour les secrets
3. **Changer les mots de passe** par défaut en production
4. **Configurer RLS** (Row Level Security) correctement

## 🚀 Démarrage de l'Application

Une fois la configuration terminée :

```bash
npm run dev
```

L'application sera accessible sur `http://localhost:3000`

## 🔧 Dépannage

### Erreur "Variables d'environnement manquantes"

```bash
# Vérifiez que le fichier .env.local existe
ls -la .env.local

# Vérifiez le contenu
cat .env.local
```

### Erreur de Connexion Supabase

1. Vérifiez que les clés sont correctes
2. Vérifiez que le projet Supabase est actif
3. Vérifiez les restrictions IP si configurées

### Erreur de Base de Données

1. Vérifiez que le schéma SQL a été exécuté
2. Vérifiez les politiques RLS
3. Vérifiez les permissions de l'utilisateur

## 📁 Structure des Fichiers

```
admin.zalama/
├── .env.local                    # Variables d'environnement (à créer)
├── supabase/
│   ├── schema.sql               # Schéma de base de données
│   ├── schema-fixed.sql         # Schéma sans RLS problématique
│   └── create-admin.sql         # Script SQL pour créer l'admin
├── scripts/
│   └── create-admin.js          # Script Node.js pour créer l'admin
└── lib/
    └── supabase.ts              # Configuration Supabase
```

## 🔄 Migration d'un Environnement

### Copier les Variables

Si vous migrez d'un autre PC, copiez simplement le fichier `.env.local` :

```bash
# Sur l'ancien PC
cp .env.local ~/backup/

# Sur le nouveau PC
cp ~/backup/.env.local ./
```

### Vérification

```bash
# Vérifier que tout fonctionne
npm run dev
```

## 📞 Support

En cas de problème :

1. Vérifiez ce guide
2. Consultez la documentation Supabase
3. Vérifiez les logs de l'application
4. Contactez l'équipe de développement

---

**Note :** Ce guide est spécifique au projet ZaLaMa Admin. Adaptez les variables selon vos besoins. 
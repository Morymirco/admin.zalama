# ZaLaMa Admin Dashboard

Un dashboard administratif moderne pour la gestion des partenaires, utilisateurs, services et finances de ZaLaMa.

## 🚀 Installation Rapide

### Prérequis
- Node.js 16+ 
- Compte Supabase
- Git

### 1. Cloner le projet
```bash
git clone <URL_DU_REPO>
cd admin.zalama
```

### 2. Installer les dépendances
```bash
npm install
```

### 3. Configuration des variables d'environnement

**Option A : Configuration automatique (Recommandée)**
```bash
node scripts/setup-env.js
```

**Option B : Configuration manuelle**
Créez un fichier `.env.local` à la racine du projet :

```env
NEXT_PUBLIC_SUPABASE_URL=https://mspmrzlqhwpdkkburjiw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zcG1yemxxaHdwZGtrYnVyaml3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3ODcyNTgsImV4cCI6MjA2NjM2MzI1OH0.zr-TRpKjGJjW0nRtsyPcCLy4Us-c5tOGX71k5_3JJd0
SUPABASE_SERVICE_ROLE_KEY=votre_cle_service_role_ici
```

**📖 Guide complet :** [SETUP_ENV.md](./SETUP_ENV.md)

### 4. Vérifier la configuration
```bash
node scripts/check-env.js
```

### 5. Configurer la base de données
1. Exécutez le schéma SQL dans Supabase SQL Editor
2. Créez l'utilisateur admin :
```bash
node scripts/create-admin.js
```

### 6. Démarrer l'application
```bash
npm run dev
```

L'application sera accessible sur `http://localhost:3000`

**Identifiants par défaut :**
- Email : `admin@zalama.com`
- Mot de passe : `admin123`

## 🏗️ Architecture

```
admin.zalama/
├── app/                    # Pages Next.js 13+ (App Router)
├── components/             # Composants React réutilisables
│   ├── dashboard/         # Composants spécifiques au dashboard
│   ├── layout/           # Composants de mise en page
│   └── ui/               # Composants UI de base
├── hooks/                 # Hooks React personnalisés
├── lib/                   # Utilitaires et services
│   └── services/         # Services Supabase
├── contexts/              # Contextes React
├── styles/                # Styles globaux
├── supabase/              # Scripts et schémas Supabase
└── scripts/               # Scripts utilitaires
```

## 🎨 Design System

L'application utilise un design system personnalisé "ZaLaMa" avec :
- **Couleurs** : Variables CSS personnalisées
- **Typographie** : Hiérarchie claire et lisible
- **Composants** : Interface moderne et cohérente
- **Responsive** : Adaptation mobile et desktop

## 📊 Fonctionnalités

### 🔐 Authentification
- Connexion sécurisée avec Supabase Auth
- Gestion des sessions utilisateur
- Protection des routes

### 👥 Gestion des Utilisateurs
- Liste des utilisateurs
- Ajout/Modification/Suppression
- Filtres et recherche
- Statistiques

### 🤝 Gestion des Partenaires
- Liste des partenaires
- Ajout de nouveaux partenaires
- Informations détaillées (contact, RH, légales)
- Filtres par type et statut

### 👨‍💼 Gestion des Employés
- Employés par partenaire
- Informations personnelles et professionnelles
- Types de contrats
- Salaires

### 🛠️ Gestion des Services
- Catalogue de services
- Catégorisation
- Prix et disponibilité
- Images et descriptions

### ⚠️ Système d'Alertes
- Alertes critiques, importantes, informatives
- Assignation et suivi
- Résolution et historique

### 💰 Gestion Financière
- Transactions financières
- Types : Débloqué, Récupéré, Revenu, Remboursement
- Suivi des montants
- Statuts de validation

### 📈 Performance
- Métriques de performance
- Graphiques et visualisations
- Suivi des objectifs
- Rapports

### 🔔 Notifications
- Système de notifications en temps réel
- Types : Information, Alerte, Succès, Erreur
- Gestion des lectures

## 🛠️ Technologies

- **Frontend** : Next.js 13+, React 18, TypeScript
- **Styling** : Tailwind CSS, CSS Variables
- **Backend** : Supabase (PostgreSQL, Auth, Storage)
- **Graphiques** : Recharts
- **Icônes** : Lucide React
- **État** : React Hooks, Context API

## 📁 Structure de la Base de Données

### Tables Principales
- `users` - Utilisateurs du système
- `partners` - Organisations partenaires
- `employees` - Employés des partenaires
- `services` - Services proposés
- `alerts` - Système d'alertes
- `financial_transactions` - Transactions financières
- `performance_metrics` - Métriques de performance
- `notifications` - Notifications utilisateur

## 🔧 Scripts Utilitaires

### Vérification de la configuration
```bash
node scripts/check-env.js
```

### Création de l'admin
```bash
node scripts/create-admin.js
```

## 🚀 Déploiement

### Vercel (Recommandé)
1. Connectez votre repo GitHub à Vercel
2. Configurez les variables d'environnement
3. Déployez automatiquement

### Autres plateformes
- Netlify
- Railway
- DigitalOcean App Platform

## 🔒 Sécurité

- **RLS** : Row Level Security activé
- **Auth** : Authentification Supabase
- **Validation** : Validation côté client et serveur
- **HTTPS** : Obligatoire en production

## 📞 Support

Pour toute question ou problème :
1. Consultez le guide [SETUP_ENV.md](./SETUP_ENV.md)
2. Vérifiez les logs de l'application
3. Contactez l'équipe de développement

## 📄 Licence

Ce projet est propriétaire de ZaLaMa.

---

**Développé avec ❤️ pour ZaLaMa**

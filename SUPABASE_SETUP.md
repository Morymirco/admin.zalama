# 🚀 Setup Rapide Supabase - ZaLaMa Admin

## ⚡ Configuration Express (5 minutes)

### 1. Configuration automatique
```bash
# Installer les dépendances
npm install

# Configurer les variables d'environnement
npm run setup:supabase

# Vérifier la configuration
npm run check:supabase
```

### 2. Configuration manuelle (si nécessaire)

#### Créer un projet Supabase
1. Allez sur [supabase.com](https://supabase.com)
2. Créez un nouveau projet
3. Notez l'URL et les clés API

#### Configurer les variables d'environnement
Créez un fichier `.env.local` :
```env
NEXT_PUBLIC_SUPABASE_URL=votre_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anonyme
SUPABASE_SERVICE_ROLE_KEY=votre_cle_service_role
```

### 3. Configuration de la base de données
```bash
# Option 1 : Script automatique
npm run setup:db

# Option 2 : Manuel dans Supabase Dashboard
# 1. Allez dans SQL Editor
# 2. Copiez le contenu de supabase/schema.sql
# 3. Exécutez le script
```

### 4. Test de la migration
```bash
# Lancer l'application
npm run dev

# Aller sur : http://localhost:3000/dashboard/migration-test
```

## 🔧 Scripts Disponibles

| Script | Description |
|--------|-------------|
| `npm run setup:supabase` | Configure automatiquement les variables d'environnement |
| `npm run check:supabase` | Vérifie la configuration Supabase |
| `npm run setup:db` | Configure la base de données |
| `npm run migrate:test` | Lance l'app et affiche l'URL de test |

## 📋 Checklist de Configuration

- [ ] Projet Supabase créé
- [ ] Variables d'environnement configurées
- [ ] Schéma de base de données exécuté
- [ ] Test de connexion réussi
- [ ] Test d'authentification réussi

## 🆘 Dépannage

### Erreur de connexion
```bash
# Vérifier les variables
npm run check:supabase

# Vérifier l'URL et les clés dans Supabase Dashboard
```

### Erreur de base de données
```bash
# Réexécuter le schéma
npm run setup:db

# Ou exécuter manuellement dans SQL Editor
```

### Erreur d'authentification
- Vérifier que l'authentification est activée dans Supabase
- Vérifier les redirections dans les paramètres

## 📚 Documentation Complète

- [Guide de migration complet](MIGRATION_GUIDE.md)
- [Documentation Supabase](https://supabase.com/docs)
- [Dashboard Supabase](https://supabase.com/dashboard)

## 🎯 Prochaines Étapes

1. ✅ Configuration de base
2. 🔄 Migration de l'authentification
3. 🔄 Migration des données
4. 🔄 Migration du storage
5. 🔄 Tests complets
6. 🔄 Déploiement

---

**💡 Conseil** : Commencez par tester la migration avant de migrer les données de production ! 
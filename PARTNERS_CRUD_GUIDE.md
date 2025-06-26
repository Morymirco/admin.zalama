# Guide CRUD Partenaires - Supabase

## 🎯 Fonctionnalités Implémentées

### ✅ **Create (Créer)**
- Ajout de nouveaux partenaires via modale
- Validation des données côté client et serveur
- Upload de logo avec Firebase Storage
- Création automatique de comptes RH et Responsable
- Notifications de succès/erreur

### ✅ **Read (Lire)**
- Affichage de tous les partenaires
- Recherche par nom, description, secteur
- Filtrage par type (Entreprise, Institution, Organisation)
- Pagination (6 partenaires par page)
- Statistiques en temps réel

### ✅ **Update (Mettre à jour)**
- Modification des informations partenaires
- Mise à jour du statut actif/inactif
- Validation des données
- Notifications de succès/erreur

### ✅ **Delete (Supprimer)**
- Suppression avec confirmation
- Suppression en cascade des employés
- Notifications de succès/erreur

## 🏗️ Architecture Technique

### 1. **Service Partenaire** (`services/partenaireService.ts`)
```typescript
// Opérations CRUD complètes
- getAll(): Récupérer tous les partenaires
- getById(id): Récupérer un partenaire par ID
- create(data): Créer un nouveau partenaire
- update(id, data): Mettre à jour un partenaire
- delete(id): Supprimer un partenaire
- search(term): Rechercher des partenaires
- getByType(type): Filtrer par type
- getStatistics(): Obtenir les statistiques
```

### 2. **Hook Personnalisé** (`hooks/useSupabasePartners.ts`)
```typescript
// Gestion d'état et opérations
- partenaires: Liste des partenaires
- loading: État de chargement
- error: Gestion des erreurs
- createPartenaire(): Créer
- updatePartenaire(): Mettre à jour
- deletePartenaire(): Supprimer
- searchPartenaires(): Rechercher
- getPartenairesByType(): Filtrer
```

### 3. **Page Principale** (`app/dashboard/(dashboard)/partenaires/page.tsx`)
```typescript
// Interface utilisateur et logique métier
- Gestion des états locaux
- Intégration avec le hook Supabase
- Gestion des modales
- Calcul des statistiques
- Pagination et filtrage
```

## 📊 Structure de Données

### Table `partners` (Supabase)
```sql
CREATE TABLE partners (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nom VARCHAR(200) NOT NULL,
  type VARCHAR(100) NOT NULL,
  secteur VARCHAR(100) NOT NULL,
  description TEXT,
  
  -- Représentant
  nom_representant VARCHAR(200),
  email_representant VARCHAR(255),
  telephone_representant VARCHAR(20),
  
  -- Responsable RH
  nom_rh VARCHAR(200),
  email_rh VARCHAR(255),
  telephone_rh VARCHAR(20),
  
  -- Informations légales
  rccm VARCHAR(100),
  nif VARCHAR(100),
  email VARCHAR(255),
  telephone VARCHAR(20),
  adresse TEXT,
  site_web VARCHAR(255),
  
  -- Autres
  logo_url VARCHAR(500),
  date_adhesion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  actif BOOLEAN DEFAULT true,
  nombre_employes INTEGER DEFAULT 0,
  salaire_net_total DECIMAL(15,2) DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🚀 Instructions de Déploiement

### 1. Configuration de la Base de Données
```bash
# Vérifier la configuration Supabase
npm run check-supabase-env

# Appliquer le schéma (supprime toutes les tables)
npm run setup-supabase-db
```

### 2. Ajouter des Partenaires de Test
```bash
# Ajouter 5 partenaires de test
npm run add-sample-partners
```

### 3. Vérification
1. Aller sur la page Partenaires : `/dashboard/partenaires`
2. Vérifier que les partenaires s'affichent
3. Tester les fonctionnalités CRUD :
   - ✅ Ajouter un nouveau partenaire
   - ✅ Modifier un partenaire existant
   - ✅ Supprimer un partenaire
   - ✅ Rechercher des partenaires
   - ✅ Filtrer par type

## 📋 Fonctionnalités Détaillées

### 🔍 **Recherche et Filtrage**
- **Recherche** : Par nom, description, secteur
- **Filtrage** : Par type (Entreprise, Institution, Organisation)
- **Pagination** : 6 partenaires par page
- **Tri** : Par date de création (plus récent en premier)

### 📊 **Statistiques**
- **Total partenaires** : Nombre total
- **Partenaires actifs** : Statut actif = true
- **Partenaires inactifs** : Statut actif = false
- **Nouveaux ce mois** : Créés dans le mois en cours
- **Tendance** : Hausse/Stable/Baisse selon les nouveaux partenaires

### 🎨 **Interface Utilisateur**
- **Design responsive** : Mobile et desktop
- **Thème ZaLaMa** : Couleurs et styles cohérents
- **Modales** : Ajout, édition, suppression
- **Notifications** : Toast de succès/erreur
- **Loading states** : Indicateurs de chargement

## 🔧 Composants Utilisés

### 1. **ListePartenaires**
- Affichage en grille des partenaires
- Actions d'édition et suppression
- Pagination

### 2. **ModaleAjoutPartenaire**
- Formulaire complet d'ajout
- Upload de logo
- Validation des données
- Préremplissage automatique

### 3. **ModaleEditionPartenaire**
- Formulaire d'édition
- Données pré-remplies
- Validation

### 4. **ModaleSuppressionPartenaire**
- Confirmation de suppression
- Informations du partenaire

### 5. **StatistiquesPartenaires**
- Cartes de statistiques
- Graphiques de tendance
- Indicateurs visuels

### 6. **ResumePartenaires**
- Résumé des chiffres clés
- Indicateurs de performance

## ⚠️ Notes Importantes

### 1. **Migration Firebase → Supabase**
- Les données Firebase ne sont pas migrées automatiquement
- Utilisez le script `add-sample-partners` pour les données de test
- Les politiques RLS sont configurées pour la sécurité

### 2. **Sécurité**
- **RLS activé** : Row Level Security sur toutes les tables
- **Politiques** : Lecture publique, écriture authentifiée
- **Validation** : Côté client et serveur

### 3. **Performance**
- **Index** : Sur les champs de recherche et filtrage
- **Pagination** : Pour éviter le chargement de trop de données
- **Cache** : Gestion d'état optimisée avec React hooks

### 4. **Erreurs et Logs**
- **Gestion d'erreurs** : Try/catch sur toutes les opérations
- **Logs** : Console pour le debugging
- **Notifications** : Toast pour l'utilisateur

## 🎉 Résultat Final

La section Partenaires offre maintenant :
- ✅ **CRUD complet** avec Supabase
- ✅ **Interface moderne** et responsive
- ✅ **Recherche et filtrage** avancés
- ✅ **Statistiques** en temps réel
- ✅ **Gestion d'erreurs** robuste
- ✅ **Performance** optimisée
- ✅ **Sécurité** avec RLS

Toutes les opérations sont maintenant gérées par Supabase avec une interface utilisateur fluide et des notifications appropriées. 
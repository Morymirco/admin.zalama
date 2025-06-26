# Guide de Gestion des Partenaires et Employés - ZaLaMa Admin

Ce guide détaille la gestion complète des partenaires et de leurs employés selon le schéma Supabase défini.

## 🏗️ Architecture

### Schéma de Base de Données

#### Table `partners`
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

#### Table `employees`
```sql
CREATE TABLE employees (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  partner_id UUID REFERENCES partners(id) ON DELETE CASCADE,
  nom VARCHAR(100) NOT NULL,
  prenom VARCHAR(100) NOT NULL,
  genre employee_gender NOT NULL,
  email VARCHAR(255),
  telephone VARCHAR(20),
  adresse TEXT,
  poste VARCHAR(100) NOT NULL,
  role VARCHAR(100),
  type_contrat employee_contract_type NOT NULL,
  salaire_net DECIMAL(10,2),
  date_embauche DATE,
  actif BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🔧 Services et Hooks

### Services

#### `partenaireService`
- `getAll()` : Récupérer tous les partenaires
- `getById(id)` : Récupérer un partenaire par ID
- `getByIdWithEmployees(id)` : Récupérer un partenaire avec ses employés
- `create(data)` : Créer un nouveau partenaire
- `update(id, data)` : Mettre à jour un partenaire
- `delete(id)` : Supprimer un partenaire (supprime aussi ses employés)
- `search(term)` : Rechercher des partenaires
- `getByType(type)` : Filtrer par type
- `getStatistics()` : Obtenir les statistiques
- `updatePartnerStats(partnerId)` : Mettre à jour les statistiques d'un partenaire

#### `employeService`
- `getByPartnerId(partnerId)` : Récupérer les employés d'un partenaire
- `getById(id)` : Récupérer un employé par ID
- `create(data)` : Créer un nouvel employé
- `update(id, data)` : Mettre à jour un employé
- `delete(id)` : Supprimer un employé
- `createBatch(employes)` : Créer plusieurs employés en lot
- `search(term, partnerId?)` : Rechercher des employés

### Hooks

#### `useSupabasePartners`
```typescript
const {
  partenaires,
  loading,
  error,
  statistiques,
  createPartenaire,
  updatePartenaire,
  deletePartenaire,
  searchPartenaires,
  filterByType,
  loadStatistiques
} = useSupabasePartners();
```

#### `useSupabaseEmployees`
```typescript
const {
  employes,
  loading,
  error,
  createEmploye,
  updateEmploye,
  deleteEmploye,
  createBatchEmployes,
  searchEmployes
} = useSupabaseEmployees(partnerId);
```

#### `useSupabasePartnerDetail`
```typescript
const {
  partenaire,
  loading,
  error,
  loadPartenaireDetail
} = useSupabasePartnerDetail(partnerId);
```

## 🎨 Composants

### Composants Principaux

#### `ListePartenaires`
- Affichage en grille des partenaires
- Recherche et filtrage
- Pagination
- Actions CRUD

#### `ModaleAjoutPartenaire`
- Formulaire complet pour ajouter un partenaire
- Validation des données
- Préremplissage automatique
- Upload de logo (désactivé temporairement)

#### `ListeEmployes`
- Affichage des employés d'un partenaire
- Statistiques en temps réel
- Recherche et filtrage par type de contrat
- Tri par différents critères

#### `ModaleAjoutEmploye`
- Formulaire pour ajouter un employé
- Validation des champs obligatoires
- Gestion des types de contrat
- Calcul automatique des statistiques

### Pages

#### `/dashboard/partenaires`
- Liste principale des partenaires
- Statistiques globales
- Filtres et recherche
- Actions CRUD

#### `/dashboard/partenaires/[id]`
- Détails d'un partenaire
- Onglets : Aperçu / Employés
- Gestion des employés
- Statistiques du partenaire

## 🧪 Tests

### Script de Test
```bash
npm run test-partners-employees
```

Ce script teste :
1. ✅ Création de partenaire
2. ✅ Création d'employés
3. ✅ Récupération avec relations
4. ✅ Mise à jour des statistiques
5. ✅ Recherche d'employés
6. ✅ Mise à jour d'employé
7. ✅ Suppression d'employé
8. ✅ Suppression de partenaire
9. ✅ Suppression en cascade

## 📊 Fonctionnalités

### Gestion des Partenaires

#### Création
- Informations de base (nom, type, secteur)
- Contact principal
- Représentant et responsable RH
- Informations légales (RCCM, NIF)
- Logo de l'entreprise

#### Mise à jour
- Modification de toutes les informations
- Mise à jour automatique des timestamps
- Validation des données

#### Suppression
- Suppression en cascade des employés
- Nettoyage automatique des relations

### Gestion des Employés

#### Création
- Informations personnelles (nom, prénom, genre)
- Contact (email, téléphone, adresse)
- Informations professionnelles (poste, rôle, type de contrat)
- Salaire et date d'embauche
- Statut actif/inactif

#### Mise à jour
- Modification des informations
- Mise à jour automatique des statistiques du partenaire
- Validation des données

#### Suppression
- Suppression individuelle
- Mise à jour automatique des statistiques

### Statistiques Automatiques

#### Partenaire
- Nombre d'employés actifs
- Salaire net total
- Mise à jour automatique lors des modifications d'employés

#### Globales
- Total des partenaires
- Répartition par type et secteur
- Statistiques financières
- Tendances

## 🔍 Recherche et Filtrage

### Partenaires
- Recherche par nom, description, secteur
- Filtrage par type (Entreprise, Institution, Organisation)
- Tri par date de création

### Employés
- Recherche par nom, prénom, poste
- Filtrage par type de contrat
- Tri par nom, poste, date d'embauche, salaire

## 📱 Interface Utilisateur

### Design System
- Thème ZaLaMa (bleu principal)
- Mode sombre/clair
- Composants responsifs
- Animations et transitions

### Expérience Utilisateur
- Navigation intuitive
- Feedback visuel
- Validation en temps réel
- Messages d'erreur clairs

## 🚀 Utilisation

### 1. Accéder à la gestion des partenaires
```
/dashboard/partenaires
```

### 2. Ajouter un partenaire
- Cliquer sur "Ajouter un partenaire"
- Remplir le formulaire
- Valider la création

### 3. Gérer les employés
- Cliquer sur un partenaire pour voir ses détails
- Aller dans l'onglet "Employés"
- Ajouter, modifier ou supprimer des employés

### 4. Consulter les statistiques
- Vue d'ensemble sur la page principale
- Statistiques détaillées par partenaire
- Graphiques et métriques

## 🔧 Configuration

### Variables d'Environnement
```env
NEXT_PUBLIC_SUPABASE_URL=votre_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anonyme
SUPABASE_SERVICE_ROLE_KEY=votre_cle_service_role
```

### Base de Données
```bash
# Exécuter le schéma
npm run setup-supabase-db

# Tester la configuration
npm run test-partners-employees
```

## 🐛 Dépannage

### Erreurs Courantes

#### "Erreur de connexion Supabase"
```bash
# Vérifier les variables d'environnement
npm run check-supabase-env
```

#### "Erreur lors de la création d'employé"
- Vérifier que le partenaire existe
- Valider les données du formulaire
- Consulter les logs de la console

#### "Statistiques non mises à jour"
- Vérifier les triggers de base de données
- Exécuter manuellement `updatePartnerStats`
- Consulter les logs d'erreur

### Logs et Debugging
```javascript
// Activer les logs détaillés
console.log('Données partenaire:', partenaire);
console.log('Employés:', employes);
console.log('Statistiques:', statistiques);
```

## 📈 Améliorations Futures

### Fonctionnalités Planifiées
- [ ] Import/export Excel des employés
- [ ] Gestion des contrats et documents
- [ ] Notifications automatiques
- [ ] Rapports avancés
- [ ] API REST complète
- [ ] Synchronisation avec d'autres systèmes

### Optimisations
- [ ] Pagination côté serveur
- [ ] Cache des données
- [ ] Optimisation des requêtes
- [ ] Compression des images

---

**Note** : Ce système est conçu pour être évolutif et maintenable. Toutes les modifications respectent le schéma de base de données défini et maintiennent la cohérence des données. 
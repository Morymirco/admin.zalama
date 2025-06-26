# Guide de Mise à Jour - Section Services

## 📋 Modifications Apportées

### 1. Type de Données (`types/service.ts`)
- ✅ Ajout du champ `fraisAttribues?: number` au type `Service`
- ✅ Ce champ représente les frais en Francs Guinéens (FG)

### 2. Interface Utilisateur (`components/dashboard/services/ListeServices.tsx`)
- ✅ Ajout de l'affichage des **frais attribués** avec icône DollarSign
- ✅ Ajout de l'affichage de la **date de création** avec icône Calendar
- ✅ Amélioration de l'affichage de la description (3 lignes au lieu de 2)
- ✅ Réorganisation des champs selon les spécifications

### 3. Modales d'Ajout et d'Édition
- ✅ **ModaleAjoutService.tsx** : Ajout du champ "Frais attribués (FG)"
- ✅ **ModaleEditionService.tsx** : Ajout du champ "Frais attribués (FG)"
- ✅ Réorganisation des champs pour une meilleure UX

### 4. Logique Métier (`app/dashboard/(dashboard)/services/page.tsx`)
- ✅ Mise à jour des fonctions `handleSubmitAddService` et `handleSubmitEditService`
- ✅ Gestion du nouveau champ `fraisAttribues` dans les formulaires

### 5. Base de Données Supabase (`supabase/schema.sql`)
- ✅ **Suppression complète** de toutes les tables existantes
- ✅ Ajout du champ `frais_attribues DECIMAL(10,2)` à la table `services`
- ✅ Ajout du champ `pourcentage_max DECIMAL(5,2)` à la table `services`
- ✅ Mise à jour des données de test avec le service "Avance sur salaire"
- ✅ Ajout d'un index sur `frais_attribues` pour les performances
- ✅ Nouvelle vue `service_statistics` pour les statistiques

### 6. Scripts d'Automatisation
- ✅ **add-sample-service.js** : Script pour ajouter le service exemple
- ✅ **setup-supabase-db.js** : Mise à jour pour le nouveau schéma
- ✅ **package.json** : Nouveau script `add-sample-service`

## 🎯 Service "Avance sur salaire" - Données

```sql
INSERT INTO services (
  nom, 
  description, 
  categorie, 
  frais_attribues, 
  pourcentage_max, 
  duree, 
  disponible
) VALUES (
  'Avance sur salaire',
  'Service permettant aux employés de recevoir une partie de leur salaire avant la date de paiement officielle, en cas de besoin urgent. L''avance est remboursée automatiquement lors du versement du salaire.',
  'Finances / Services aux employés',
  15000.00,
  30.00,
  '24-48 heures',
  true
);
```

## 🚀 Instructions de Déploiement

### 1. Mise à Jour de la Base de Données
```bash
# Vérifier la configuration Supabase
npm run check-supabase-env

# Appliquer le nouveau schéma (supprime toutes les tables)
npm run setup-supabase-db
```

### 2. Ajouter le Service Exemple (Optionnel)
```bash
# Ajouter le service "Avance sur salaire" à Firebase
npm run add-sample-service
```

### 3. Vérification
1. Aller sur la page Services : `/dashboard/services`
2. Vérifier que les cartes affichent :
   - ✅ Nom du service
   - ✅ Description (3 lignes)
   - ✅ Frais attribués avec icône 💰
   - ✅ Catégorie
   - ✅ Date de création avec icône 📅
   - ✅ Statut (Disponible/Indisponible)

## 📊 Nouveaux Champs Affichés

| Champ | Affichage | Icône | Format |
|-------|-----------|-------|--------|
| **Nom du service** | Titre principal | - | Texte |
| **Description** | Sous le titre | - | 3 lignes max |
| **Frais attribués** | Avec icône DollarSign | 💰 | "15 000 FG" |
| **Catégorie** | Label/Valeur | - | Texte |
| **Date de création** | Avec icône Calendar | 📅 | "24 juin 2025" |
| **Statut** | Badge coloré | - | "Disponible"/"Indisponible" |

## 🔧 Structure de la Table Services (Supabase)

```sql
CREATE TABLE services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nom VARCHAR(200) NOT NULL,
  description TEXT,
  categorie VARCHAR(100) NOT NULL,
  frais_attribues DECIMAL(10,2),        -- NOUVEAU
  pourcentage_max DECIMAL(5,2),         -- NOUVEAU
  duree VARCHAR(50),
  disponible BOOLEAN DEFAULT true,
  image_url VARCHAR(500),
  date_creation TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## ⚠️ Notes Importantes

1. **Suppression des données** : Le nouveau schéma supprime TOUTES les tables existantes
2. **Migration Firebase → Supabase** : Les données Firebase ne sont pas migrées automatiquement
3. **Politiques RLS** : Les politiques de sécurité sont réappliquées
4. **Index de performance** : Nouvel index sur `frais_attribues`

## 🎉 Résultat Final

La section Services affiche maintenant tous les champs demandés :
- ✅ **Nom du service** : "Avance sur salaire"
- ✅ **Description** : Description complète du service
- ✅ **Frais attribués** : "15 000 FG"
- ✅ **Catégorie** : "Finances / Services aux employés"
- ✅ **Statut** : "Disponible"
- ✅ **Date de création** : "24 juin 2025"

L'interface est moderne, responsive et respecte le design system ZaLaMa. 
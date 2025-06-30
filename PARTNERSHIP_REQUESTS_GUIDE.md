# Guide des Demandes de Partenariat - Export PDF

## 🎯 Fonctionnalités Implémentées

### ✅ **Interface unifiée**
- Intégration des demandes dans la section Partenaires
- Système d'onglets : "Gestion des partenaires" et "Demandes partenaires"
- Navigation simplifiée et cohérente

### ✅ **Gestion complète des demandes**
- Affichage de toutes les demandes de partenariat
- Filtrage par statut (En attente, En révision, Approuvées, Rejetées)
- Recherche par nom d'entreprise, représentant, responsable RH
- Actions rapides (Approuver, Rejeter, Mettre en révision)

### ✅ **Export PDF avancé**
- **Export individuel** : PDF détaillé pour chaque demande
- **Export global** : PDF de la liste complète des demandes
- **Design professionnel** : Couleurs ZaLaMa, mise en page structurée
- **Informations complètes** : Toutes les données de la demande

### ✅ **Détails complets**
- Informations de l'entreprise (nom, statut légal, RCCM, NIF, etc.)
- Informations du représentant (nom, poste, contact)
- Informations du responsable RH (nom, contact, accord)
- Détails employés (CDI, CDD, masse salariale, date de paiement)
- Métadonnées (ID, dates de création/modification)

## 🏗️ Architecture Technique

### 1. **Service PDF** (`services/pdfService.ts`)
```typescript
// Génération de PDF individuels
PDFService.generatePartnershipRequestPDF(request)

// Génération de PDF de liste
PDFService.generateMultipleRequestsPDF(requests)
```

### 2. **Composant Tableau** (`components/dashboard/TableauDemandes.tsx`)
```typescript
// Boutons d'export
- Export PDF individuel (icône Download)
- Export PDF global (bouton "Export PDF")

// Affichage détaillé
- Toutes les informations de la demande
- Métadonnées complètes
- Actions contextuelles
```

### 3. **Base de données** (`supabase/schema.sql`)
```sql
-- Table partnership_requests avec tous les champs
CREATE TABLE partnership_requests (
  -- Informations entreprise (13 champs)
  -- Informations représentant (4 champs)
  -- Informations RH (4 champs)
  -- Métadonnées (3 champs)
);
```

## 📊 Structure des Données

### Table `partnership_requests`
```sql
-- Informations de l'entreprise
company_name VARCHAR(200) NOT NULL,
legal_status VARCHAR(100) NOT NULL,
rccm VARCHAR(100) NOT NULL,
nif VARCHAR(100) NOT NULL,
activity_domain VARCHAR(200) NOT NULL,
headquarters_address TEXT NOT NULL,
phone VARCHAR(20) NOT NULL,
email VARCHAR(255) NOT NULL,
employees_count INTEGER NOT NULL,
payroll VARCHAR(100) NOT NULL,
cdi_count INTEGER NOT NULL DEFAULT 0,
cdd_count INTEGER NOT NULL DEFAULT 0,
payment_date VARCHAR(50) NOT NULL,

-- Informations du représentant
rep_full_name VARCHAR(200) NOT NULL,
rep_position VARCHAR(100) NOT NULL,
rep_email VARCHAR(255) NOT NULL,
rep_phone VARCHAR(20) NOT NULL,

-- Informations du responsable RH
hr_full_name VARCHAR(200) NOT NULL,
hr_email VARCHAR(255) NOT NULL,
hr_phone VARCHAR(20) NOT NULL,
agreement BOOLEAN NOT NULL DEFAULT false,

-- Statut et métadonnées
status VARCHAR(20) NOT NULL DEFAULT 'pending',
created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
```

## 🚀 Instructions de Déploiement

### 1. **Mise à jour de la base de données**
```bash
# Appliquer le nouveau schéma (inclut la table partnership_requests)
npm run setup-supabase-db
```

### 2. **Ajouter des données de test**
```bash
# Ajouter 5 demandes de partenariat de test
npm run add-sample-partnership-requests
```

### 3. **Vérification**
1. Aller sur la page Partenaires : `/dashboard/partenaires`
2. Cliquer sur l'onglet "Demandes partenaires"
3. Vérifier que les demandes s'affichent
4. Tester les fonctionnalités d'export PDF

## 📋 Fonctionnalités Détaillées

### 🔍 **Recherche et Filtrage**
- **Recherche** : Par nom d'entreprise, représentant, responsable RH
- **Filtrage** : Par statut (En attente, En révision, Approuvées, Rejetées)
- **Tri** : Par date de création (plus récent en premier)

### 📊 **Statistiques**
- **Total demandes** : Nombre total
- **En attente** : Demandes non traitées
- **En révision** : Demandes en cours d'analyse
- **Approuvées** : Demandes acceptées
- **Rejetées** : Demandes refusées

### 📄 **Export PDF**

#### **Export individuel**
- **Contenu** : Toutes les informations de la demande
- **Format** : PDF professionnel avec couleurs ZaLaMa
- **Sections** :
  - En-tête avec logo et titre
  - Informations de base (référence, date, statut)
  - Informations de l'entreprise (tableau détaillé)
  - Informations du représentant
  - Informations du responsable RH
  - Pied de page avec métadonnées

#### **Export global**
- **Contenu** : Liste de toutes les demandes
- **Format** : Tableau synthétique
- **Colonnes** : Entreprise, Représentant, Domaine, Employés, Statut, Date

### 🎨 **Interface Utilisateur**
- **Design responsive** : Mobile et desktop
- **Thème ZaLaMa** : Couleurs et styles cohérents
- **Actions contextuelles** : Boutons selon le statut
- **Notifications** : Toast de succès/erreur pour les exports
- **Loading states** : Indicateurs de chargement

## 🔧 Composants Utilisés

### 1. **TableauDemandes**
- Affichage en tableau des demandes
- Actions d'approbation/rejet
- Export PDF individuel et global
- Détails expansibles

### 2. **StatistiquesDemandes**
- Cartes de statistiques
- Graphiques de répartition
- Indicateurs visuels

### 3. **PDFService**
- Génération de PDF individuels
- Génération de PDF de liste
- Mise en page professionnelle

## 📱 Utilisation

### **Accès aux demandes**
1. Aller sur `/dashboard/partenaires`
2. Cliquer sur l'onglet "Demandes partenaires"
3. Voir la liste des demandes avec leur statut

### **Export PDF individuel**
1. Cliquer sur l'icône 📥 (Download) dans la colonne Actions
2. Le PDF se télécharge automatiquement
3. Nom du fichier : `demande-partenariat-[entreprise]-[date].pdf`

### **Export PDF global**
1. Cliquer sur le bouton "Export PDF" en haut à droite
2. Le PDF de la liste se télécharge automatiquement
3. Nom du fichier : `liste-demandes-partenariat-[date].pdf`

### **Actions sur les demandes**
1. **Demandes en attente** : Approuver ✅, Rejeter ❌, Mettre en révision 👁️
2. **Voir détails** : Cliquer sur les trois points ⋮
3. **Rechercher** : Utiliser la barre de recherche
4. **Filtrer** : Utiliser le menu déroulant des statuts

## ⚠️ Notes Importantes

### 1. **Dépendances**
- **jsPDF** : Génération de PDF côté client
- **jspdf-autotable** : Tables dans les PDF
- **date-fns** : Formatage des dates

### 2. **Sécurité**
- **RLS activé** : Row Level Security sur la table
- **Politiques** : Lecture/écriture authentifiée
- **Validation** : Côté client et serveur

### 3. **Performance**
- **Export côté client** : Pas de charge serveur
- **Optimisation** : Génération asynchrone
- **Cache** : Pas de mise en cache nécessaire

## 🎯 Avantages

### **Pour l'utilisateur**
- **Interface unifiée** : Tout dans la section Partenaires
- **Export facile** : PDF en un clic
- **Informations complètes** : Tous les détails visibles
- **Actions rapides** : Workflow optimisé

### **Pour l'administrateur**
- **Gestion centralisée** : Une seule interface
- **Traçabilité** : Historique complet
- **Export professionnel** : PDF de qualité
- **Maintenance simplifiée** : Code organisé

## 🔮 Évolutions futures

### **Fonctionnalités possibles**
- **Email automatique** : Envoi de PDF par email
- **Templates personnalisés** : Différents formats de PDF
- **Signature électronique** : Intégration de signature
- **Workflow avancé** : Validation multi-niveaux
- **Notifications** : Alertes pour nouvelles demandes 
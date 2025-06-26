# Guide de Création Automatique de Comptes Partenaire

## Vue d'ensemble

Lors de l'ajout d'un nouveau partenaire dans le système ZaLaMa, le processus inclut automatiquement :

1. **Création du partenaire** dans la base de données
2. **Création automatique du compte RH** (si email et nom fournis)
3. **Création automatique du compte responsable** (si email et nom fournis)
4. **Génération de mots de passe sécurisés** pour chaque compte
5. **Envoi de SMS** avec les identifiants de connexion
6. **Notification admin** de la création du partenaire

## Fonctionnalités

### 🔐 Génération de mot de passe sécurisé

- **Longueur** : 8 caractères
- **Complexité** : Contient obligatoirement :
  - 1 lettre majuscule
  - 1 lettre minuscule
  - 1 chiffre
  - 1 caractère spécial (!@#$%^&*)
- **Sécurité** : Mélange aléatoire des caractères

### 📧 Validation d'email

- Vérification du format email standard
- Obligatoire pour la création des comptes
- Utilisé comme identifiant de connexion

### 📱 Envoi SMS automatique

- **Contenu** : Identifiants de connexion + lien d'accès
- **Format** : Message personnalisé avec nom de l'utilisateur
- **Gestion d'erreur** : Les comptes sont créés même si le SMS échoue

## Architecture

### Services impliqués

1. **`partenaireService.ts`** : Service principal pour les partenaires
2. **`partnerAccountService.ts`** : Service de gestion des comptes partenaire
3. **`lib/utils.ts`** : Fonctions utilitaires (génération mot de passe, SMS, validation)

### API Routes

- **`/api/auth/create-rh-account`** : Création de compte RH
- **`/api/auth/create-responsable-account`** : Création de compte responsable
- **`/api/sms/send`** : Envoi de SMS

### Base de données

#### Tables utilisées

- **`partners`** : Informations des partenaires
- **`admin_users`** : Comptes de connexion (RH et responsable)

#### Structure des comptes

```sql
-- Table admin_users
{
  id: string,              -- ID du compte auth
  email: string,           -- Email de connexion
  display_name: string,    -- Nom complet
  role: 'rh' | 'responsable', -- Rôle spécifique
  partenaire_id: string,   -- ID du partenaire
  active: boolean         -- Statut actif/inactif
}
```

## Processus détaillé

### 1. Validation des données

```typescript
// Vérification des champs obligatoires pour RH
if (partenaireData.email_rh && partenaireData.nom_rh) {
  // Créer le compte RH
}

// Vérification des champs obligatoires pour responsable
if (partenaireData.email_representant && partenaireData.nom_representant) {
  // Créer le compte responsable
}
```

### 2. Création du partenaire

```typescript
// Insertion dans la table partners
const { data: partenaire, error } = await supabase
  .from('partners')
  .insert([partenaireData])
  .select()
  .single();
```

### 3. Création des comptes automatiquement

```typescript
// Créer les comptes RH et responsable
const accountCreationResults = await partnerAccountService.createPartnerAccounts({
  ...partenaireData,
  id: partenaire.id
});
```

### 4. Envoi des SMS

```typescript
// SMS pour RH
const smsMessageRH = `Bonjour ${rhData.nom}, votre compte ZaLaMa RH a été créé avec succès.
Email: ${rhData.email}
Mot de passe: ${password}
Connectez-vous sur https://admin.zalama.com`;

// SMS pour responsable
const smsMessageResponsable = `Bonjour ${responsableData.nom}, votre compte ZaLaMa responsable a été créé avec succès.
Email: ${responsableData.email}
Mot de passe: ${password}
Connectez-vous sur https://admin.zalama.com`;
```

## Interface utilisateur

### Formulaire d'ajout de partenaire

- **Champs RH** : Email et nom (optionnels mais recommandés)
- **Champs Responsable** : Email et nom (optionnels mais recommandés)
- **Champs téléphone** : Pour recevoir les identifiants par SMS
- **Validation en temps réel** : Format email et téléphone

### Résumé des actions

Après création réussie, affichage d'un résumé avec :

1. **✅ Partenaire créé** : Nom, type, secteur
2. **🔑 Compte RH** : Email et mot de passe généré (si créé)
3. **🔑 Compte Responsable** : Email et mot de passe généré (si créé)
4. **📱 SMS envoyés** : Statut de l'envoi des SMS

## Gestion des erreurs

### Erreurs courantes

1. **Email manquant** : Impossible de créer le compte
2. **Format email invalide** : Validation échouée
3. **Erreur création compte** : Rollback automatique
4. **Échec SMS** : Compte créé mais SMS non envoyé

### Stratégie de récupération

- **Rollback automatique** : Suppression du compte auth en cas d'erreur
- **Continuité de service** : Le partenaire est créé même si les comptes échouent
- **Logs détaillés** : Traçabilité complète des erreurs

## Sécurité

### Bonnes pratiques

- **Mots de passe forts** : Génération automatique sécurisée
- **Validation stricte** : Email et téléphone validés
- **Permissions limitées** : Rôles spécifiques (rh, responsable)
- **Comptes inactifs** : Possibilité de désactiver

### Recommandations

1. **Changement de mot de passe** : Forcer le changement au premier login
2. **Authentification à deux facteurs** : Optionnel pour les comptes sensibles
3. **Audit des connexions** : Logs des tentatives de connexion
4. **Expiration des mots de passe** : Politique de renouvellement

## Tests

### Script de test

```bash
node scripts/test-partner-account-creation.js
```

### Scénarios de test

1. **Création réussie** : Tous les champs valides
2. **Email manquant** : Erreur de validation
3. **Format email invalide** : Erreur de validation
4. **Téléphone manquant** : Compte créé, SMS non envoyé
5. **Erreur base de données** : Rollback automatique

## Maintenance

### Opérations courantes

1. **Réinitialisation de mot de passe** : Via l'interface admin
2. **Désactivation de compte** : Pour utilisateurs partis
3. **Suppression de compte** : Avec le partenaire
4. **Modification de rôle** : Élévation de privilèges

### Monitoring

- **Logs de création** : Traçabilité des comptes créés
- **Statistiques SMS** : Taux de succès des envois
- **Alertes d'erreur** : Notification des échecs critiques

## Évolutions futures

### Fonctionnalités prévues

1. **Templates SMS personnalisables** : Par partenaire
2. **Notifications email** : Alternative au SMS
3. **Workflow d'approbation** : Validation avant création
4. **Intégration SSO** : Authentification externe
5. **Gestion des permissions** : Rôles granulaires

### Améliorations techniques

1. **API REST** : Endpoints dédiés
2. **Webhooks** : Notifications en temps réel
3. **Cache Redis** : Performance des requêtes
4. **Queue de SMS** : Gestion asynchrone
5. **Backup automatique** : Sauvegarde des comptes

## Exemple d'utilisation

### Données d'entrée

```typescript
const partenaireData = {
  nom: "Entreprise Test",
  type: "PME",
  secteur: "Technologie",
  email_rh: "rh@entreprise.com",
  nom_rh: "Marie Dupont",
  telephone_rh: "+224623456789",
  email_representant: "responsable@entreprise.com",
  nom_representant: "Jean Martin",
  telephone_representant: "+224623456790"
};
```

### Résultat attendu

```typescript
{
  partenaire: { id: "uuid", nom: "Entreprise Test", ... },
  smsResults: {
    rh: { success: true, message: "Compte RH créé et SMS envoyé" },
    responsable: { success: true, message: "Compte responsable créé et SMS envoyé" },
    admin: { success: true, message: "Notification admin envoyée" }
  },
  accountResults: {
    rh: { success: true, password: "Wd9F0Y*y" },
    responsable: { success: true, password: "**K2Qiv9" }
  }
}
```

## Support

En cas de problème :

1. Vérifier les logs de la console
2. Contrôler les variables d'environnement
3. Tester avec les scripts fournis
4. Vérifier les permissions de la base de données
5. Consulter la documentation Supabase

## Ressources

- [Documentation Supabase Auth](https://supabase.com/docs/guides/auth)
- [Guide des API Routes Next.js](https://nextjs.org/docs/api-routes/introduction)
- [Documentation des variables d'environnement](https://nextjs.org/docs/basic-features/environment-variables) 
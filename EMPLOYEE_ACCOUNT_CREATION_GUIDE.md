# Guide de Création Automatique de Compte Employé

## Vue d'ensemble

Lors de l'ajout d'un nouvel employé dans le système ZaLaMa, le processus inclut automatiquement :

1. **Création de l'employé** dans la base de données
2. **Création d'un compte de connexion** avec mot de passe généré
3. **Envoi d'un SMS** avec les identifiants de connexion

## Fonctionnalités

### 🔐 Génération de mot de passe sécurisé

- **Longueur** : 8 caractères par défaut
- **Complexité** : Contient obligatoirement :
  - 1 lettre majuscule
  - 1 lettre minuscule
  - 1 chiffre
  - 1 caractère spécial (!@#$%^&*)
- **Sécurité** : Mélange aléatoire des caractères

### 📧 Validation d'email

- Vérification du format email standard
- Obligatoire pour la création du compte
- Utilisé comme identifiant de connexion

### 📱 Envoi SMS automatique

- **Contenu** : Identifiants de connexion + lien d'accès
- **Format** : Message personnalisé avec nom de l'employé
- **Gestion d'erreur** : Le compte est créé même si le SMS échoue

## Architecture

### Services impliqués

1. **`partenaireService.ts`** : Service principal pour les employés
2. **`employeeAccountService.ts`** : Service de gestion des comptes employés
3. **`lib/utils.ts`** : Fonctions utilitaires (génération mot de passe, SMS, validation)

### Base de données

#### Tables utilisées

- **`employees`** : Informations des employés
- **`admin_users`** : Comptes de connexion
- **`partners`** : Mise à jour des statistiques

#### Structure du compte

```sql
-- Table admin_users
{
  id: string,              -- ID du compte auth
  email: string,           -- Email de connexion
  display_name: string,    -- Nom complet
  role: 'user',           -- Rôle par défaut
  partenaire_id: string,   -- ID du partenaire
  active: boolean         -- Statut actif/inactif
}
```

## Processus détaillé

### 1. Validation des données

```typescript
// Vérification des champs obligatoires
if (!employeData.email) {
  throw new Error('L\'email est requis pour créer un compte de connexion');
}

// Validation du format email
if (!validateEmail(employeData.email)) {
  throw new Error('Format d\'email invalide');
}
```

### 2. Création de l'employé

```typescript
// Insertion dans la table employees
const { data: employe, error } = await supabase
  .from('employees')
  .insert([employeData])
  .select()
  .single();
```

### 3. Création du compte de connexion

```typescript
// Génération du mot de passe
const password = generatePassword();

// Création dans Supabase Auth
const { data: authData } = await supabase.auth.admin.createUser({
  email: employeData.email,
  password: password,
  email_confirm: true,
  user_metadata: {
    display_name: `${employeData.prenom} ${employeData.nom}`,
    role: 'user',
    partenaire_id: employeData.partner_id,
    employee_id: employeData.id
  }
});

// Création dans admin_users
const accountData = {
  id: authData.user.id,
  email: employeData.email,
  display_name: `${employeData.prenom} ${employeData.nom}`,
  role: 'user',
  partenaire_id: employeData.partner_id,
  active: true
};
```

### 4. Envoi du SMS

```typescript
const smsMessage = `Bonjour ${employeData.prenom}, votre compte ZaLaMa a été créé avec succès.
Email: ${employeData.email}
Mot de passe: ${password}
Connectez-vous sur https://admin.zalama.com`;

await sendSMS(employeData.telephone, smsMessage);
```

## Interface utilisateur

### Formulaire d'ajout d'employé

- **Champ email obligatoire** : Avec indication de création automatique de compte
- **Champ téléphone optionnel** : Pour recevoir les identifiants par SMS
- **Validation en temps réel** : Format email et téléphone

### Résumé des actions

Après création réussie, affichage d'un résumé avec :

1. **✅ Employé créé** : Nom, prénom, poste
2. **🔑 Compte de connexion** : Email et mot de passe généré
3. **📱 SMS envoyé** : Statut de l'envoi du SMS

## Gestion des erreurs

### Erreurs courantes

1. **Email manquant** : Impossible de créer le compte
2. **Format email invalide** : Validation échouée
3. **Erreur création compte** : Rollback automatique
4. **Échec SMS** : Compte créé mais SMS non envoyé

### Stratégie de récupération

- **Rollback automatique** : Suppression du compte auth en cas d'erreur
- **Continuité de service** : L'employé est créé même si le compte échoue
- **Logs détaillés** : Traçabilité complète des erreurs

## Sécurité

### Bonnes pratiques

- **Mots de passe forts** : Génération automatique sécurisée
- **Validation stricte** : Email et téléphone validés
- **Permissions limitées** : Rôle 'user' par défaut
- **Comptes inactifs** : Possibilité de désactiver

### Recommandations

1. **Changement de mot de passe** : Forcer le changement au premier login
2. **Authentification à deux facteurs** : Optionnel pour les comptes sensibles
3. **Audit des connexions** : Logs des tentatives de connexion
4. **Expiration des mots de passe** : Politique de renouvellement

## Tests

### Script de test

```bash
node scripts/test-employee-account-creation.js
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
2. **Désactivation de compte** : Pour employés partis
3. **Suppression de compte** : Avec l'employé
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
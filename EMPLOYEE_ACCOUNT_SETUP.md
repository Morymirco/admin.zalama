# Guide de Mise en Place - Création Automatique de Compte Employé

## Prérequis

### Variables d'environnement

Ajoutez la variable d'environnement suivante dans votre fichier `.env.local` :

```bash
SUPABASE_SERVICE_ROLE_KEY=votre_service_role_key_ici
```

**Important** : Cette clé doit être gardée secrète et ne doit jamais être exposée côté client.

### Obtention de la Service Role Key

1. Connectez-vous à votre dashboard Supabase
2. Allez dans Settings > API
3. Copiez la "service_role" key (pas la "anon" key)

## Installation

### 1. Création des API Routes

Les API routes suivantes doivent être créées dans le dossier `app/api/auth/` :

- `create-employee-account/route.ts` ✅ (créé)
- `delete-employee-account/route.ts` (à créer)
- `toggle-employee-account/route.ts` (à créer)
- `reset-employee-password/route.ts` (à créer)

### 2. Services requis

- `services/employeeAccountService.ts` ✅ (créé)
- `services/partenaireService.ts` ✅ (modifié)

### 3. Fonctions utilitaires

- `lib/utils.ts` ✅ (modifié avec les nouvelles fonctions)

## Configuration

### Base de données

Assurez-vous que la table `admin_users` existe avec la structure suivante :

```sql
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  partenaire_id UUID REFERENCES partners(id),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Politiques RLS

```sql
-- Politique pour permettre la lecture des comptes
CREATE POLICY "Users can view their own account" ON admin_users
  FOR SELECT USING (auth.uid() = id);

-- Politique pour permettre la mise à jour des comptes
CREATE POLICY "Users can update their own account" ON admin_users
  FOR UPDATE USING (auth.uid() = id);

-- Politique pour les opérations admin (via service role)
CREATE POLICY "Service role can manage all accounts" ON admin_users
  FOR ALL USING (auth.role() = 'service_role');
```

## Tests

### 1. Test de l'API Route

```bash
# Démarrer le serveur de développement
npm run dev

# Dans un autre terminal, exécuter le test
node scripts/test-employee-api-route.js
```

### 2. Test de création de compte

```bash
node scripts/test-employee-account-creation.js
```

## Utilisation

### 1. Ajout d'un employé via l'interface

1. Aller dans la section Partenaires
2. Sélectionner un partenaire
3. Cliquer sur "Ajouter un employé"
4. Remplir le formulaire (email obligatoire)
5. Valider

### 2. Processus automatique

Le système va automatiquement :

1. ✅ Créer l'employé dans la base de données
2. ✅ Générer un mot de passe sécurisé
3. ✅ Créer le compte de connexion dans Supabase Auth
4. ✅ Enregistrer le compte dans la table `admin_users`
5. ✅ Envoyer un SMS avec les identifiants (si téléphone fourni)
6. ✅ Afficher un résumé des actions effectuées

### 3. Résumé affiché

Après création réussie, l'utilisateur verra :

- ✅ **Employé créé** : Nom, prénom, poste
- 🔑 **Compte de connexion** : Email et mot de passe généré
- 📱 **SMS envoyé** : Statut de l'envoi du SMS

## Gestion des erreurs

### Erreurs courantes

1. **SUPABASE_SERVICE_ROLE_KEY manquante**
   ```
   Error: SUPABASE_SERVICE_ROLE_KEY is not defined
   ```
   **Solution** : Ajouter la variable d'environnement

2. **Email déjà utilisé**
   ```
   Error: User already registered
   ```
   **Solution** : Utiliser un email unique

3. **Format email invalide**
   ```
   Error: Format d'email invalide
   ```
   **Solution** : Vérifier le format de l'email

4. **Erreur de base de données**
   ```
   Error: Erreur lors de la création du compte admin
   ```
   **Solution** : Vérifier les permissions et la structure de la base

### Logs de débogage

Les erreurs sont loggées dans la console avec des détails complets pour faciliter le débogage.

## Sécurité

### Bonnes pratiques

1. **Service Role Key** : Jamais exposée côté client
2. **Validation** : Toutes les données sont validées
3. **Rollback** : En cas d'erreur, les comptes créés sont supprimés
4. **Logs** : Toutes les opérations sont tracées

### Permissions

- Seuls les utilisateurs avec le rôle `service_role` peuvent créer des comptes
- Les comptes créés ont le rôle `user` par défaut
- Les permissions peuvent être modifiées via l'interface admin

## Maintenance

### Opérations courantes

1. **Réinitialisation de mot de passe**
   - Via l'interface admin
   - Génération automatique d'un nouveau mot de passe
   - Envoi SMS avec le nouveau mot de passe

2. **Désactivation de compte**
   - Marquer le compte comme inactif
   - L'employé ne peut plus se connecter

3. **Suppression de compte**
   - Suppression complète du compte
   - Suppression de l'employé associé

### Monitoring

- Surveiller les logs d'erreur
- Vérifier le taux de succès des SMS
- Contrôler les tentatives de connexion échouées

## Évolutions futures

### Fonctionnalités prévues

1. **Templates SMS personnalisables**
2. **Notifications email alternatives**
3. **Workflow d'approbation**
4. **Intégration SSO**
5. **Gestion des permissions granulaires**

### Améliorations techniques

1. **API REST complète**
2. **Webhooks en temps réel**
3. **Cache Redis**
4. **Queue de SMS asynchrone**
5. **Backup automatique**

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
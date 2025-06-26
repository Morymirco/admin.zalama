# Guide de résolution de l'erreur PGRST116

## Problème
L'erreur `PGRST116` avec le message "JSON object requested, multiple (or no) rows returned" se produit lorsque l'utilisateur existe dans Supabase Auth mais pas dans la table `admin_users`.

## Causes possibles
1. L'utilisateur a été créé directement dans Supabase Auth sans créer l'enregistrement correspondant dans `admin_users`
2. Migration incomplète de Firebase vers Supabase
3. Suppression accidentelle d'enregistrements dans la table `admin_users`

## Solutions

### Solution 1 : Migration automatique (Recommandée)
Le service d'authentification a été modifié pour créer automatiquement l'enregistrement dans `admin_users` si l'utilisateur n'existe pas :

```typescript
// Dans authService.ts
async getUserProfile(userId: string): Promise<AuthUser | null> {
  // Si l'utilisateur n'existe pas dans admin_users, le créer automatiquement
  if (error.code === 'PGRST116') {
    return await this.createUserRecordFromAuth(userId);
  }
}
```

### Solution 2 : Migration manuelle des utilisateurs existants
Exécutez le script de migration pour créer les enregistrements manquants :

```bash
npm run migrate-users
```

Ce script va :
- Récupérer tous les utilisateurs de Supabase Auth
- Vérifier lesquels n'existent pas dans `admin_users`
- Créer automatiquement les enregistrements manquants

### Solution 3 : Vérification manuelle
1. Connectez-vous à votre dashboard Supabase
2. Allez dans Authentication > Users pour voir les utilisateurs Auth
3. Allez dans Table Editor > admin_users pour voir les utilisateurs dans la table
4. Identifiez les utilisateurs manquants et créez-les manuellement

## Prévention
Pour éviter ce problème à l'avenir :

1. **Toujours utiliser les méthodes d'inscription du service** :
   ```typescript
   await authService.signUp({
     email: 'user@example.com',
     password: 'password',
     displayName: 'Nom Utilisateur',
     role: 'user'
   });
   ```

2. **Vérifier la cohérence des données** :
   ```bash
   npm run check-supabase-env
   ```

3. **Utiliser le script de migration après les mises à jour** :
   ```bash
   npm run migrate-users
   ```

## Vérification
Après avoir appliqué une solution, testez la connexion :

1. Déconnectez-vous complètement
2. Reconnectez-vous
3. Vérifiez que le profil utilisateur se charge correctement
4. Consultez les logs pour confirmer l'absence d'erreurs

## Logs utiles
Les messages suivants indiquent que la correction fonctionne :
- "Utilisateur non trouvé dans admin_users, création automatique..."
- "Création automatique du profil utilisateur lors de la connexion..."
- "X utilisateurs migrés avec succès" 
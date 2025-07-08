# 📋 Ordre d'exécution des fichiers SQL sur Supabase

## 🎯 Objectif
Déployer les améliorations du système de notifications avec les nouveaux champs `employee_id` et `partner_id`.

## 📁 Fichiers SQL à exécuter dans l'ordre

### **1️⃣ Étape 1 : Migration des nouveaux champs**
**Fichier :** `01_migration_notification_fields.sql`

**Actions :**
- ✅ Ajouter les colonnes `employee_id` et `partner_id` à la table `notifications`
- ✅ Créer les index de performance
- ✅ Créer les nouvelles fonctions utilitaires
- ✅ Vérifier que tout est bien installé

**Comment exécuter :**
```sql
-- Copier et coller le contenu du fichier dans l'éditeur SQL de Supabase
-- Ou utiliser la commande :
\i 01_migration_notification_fields.sql
```

### **2️⃣ Étape 2 : Fonctions et triggers complets**
**Fichier :** `02_functions_and_triggers.sql`

**Actions :**
- ✅ Créer toutes les fonctions de notification avec les nouveaux paramètres
- ✅ Supprimer les anciens triggers
- ✅ Recréer tous les triggers avec les nouveaux paramètres `employee_id` et `partner_id`
- ✅ Inclut toutes les fonctions : demandes d'avance, transactions, alertes, avis, partenariat, etc.

**Comment exécuter :**
```sql
-- Copier et coller le contenu du fichier dans l'éditeur SQL de Supabase
-- Ou utiliser la commande :
\i 02_functions_and_triggers.sql
```

### **3️⃣ Étape 3 : Tests et vérification**
**Fichier :** `03_test_enhanced_notifications.sql`

**Actions :**
- ✅ Vérifier que les nouveaux champs existent
- ✅ Vérifier les index créés
- ✅ Vérifier les fonctions créées
- ✅ Vérifier les triggers
- ✅ Statistiques des notifications existantes

**Comment exécuter :**
```sql
-- Copier et coller le contenu du fichier dans l'éditeur SQL de Supabase
-- Ou utiliser la commande :
\i 03_test_enhanced_notifications.sql
```

## 🔄 Processus complet

### **Via l'interface Supabase :**

1. **Ouvrir l'éditeur SQL** dans votre projet Supabase
2. **Exécuter l'étape 1** : Copier-coller le contenu de `01_migration_notification_fields.sql`
3. **Exécuter l'étape 2** : Copier-coller le contenu de `02_functions_and_triggers.sql`
4. **Exécuter l'étape 3** : Copier-coller le contenu de `03_test_enhanced_notifications.sql`

### **Via la ligne de commande (si disponible) :**

```bash
# 1. Migration des nouveaux champs
psql -h db.mspmrzlqhwpdkkburjiw.supabase.co -U postgres.mspmrzlqhwpdkkburjiw -d postgres -f 01_migration_notification_fields.sql

# 2. Fonctions et triggers complets
psql -h db.mspmrzlqhwpdkkburjiw.supabase.co -U postgres.mspmrzlqhwpdkkburjiw -d postgres -f 02_functions_and_triggers.sql

# 3. Tests et vérification
psql -h db.mspmrzlqhwpdkkburjiw.supabase.co -U postgres.mspmrzlqhwpdkkburjiw -d postgres -f 03_test_enhanced_notifications.sql
```

## ⚠️ Points importants

### **Ordre obligatoire :**
1. **Migration** doit être exécutée AVANT les triggers
2. **Triggers** doivent être mis à jour APRÈS la migration
3. **Tests** doivent être exécutés EN DERNIER

### **Sécurité :**
- ✅ Tous les scripts utilisent `IF EXISTS` pour éviter les erreurs
- ✅ Les champs sont optionnels (NULL par défaut)
- ✅ Rétrocompatibilité avec les notifications existantes

### **Vérifications :**
- ✅ Chaque étape inclut des vérifications automatiques
- ✅ Les erreurs sont clairement identifiées
- ✅ Les statistiques sont affichées à la fin

## 🎯 Résultat attendu

Après l'exécution des 3 étapes, vous aurez :

### **Nouveaux champs :**
- ✅ `employee_id` dans la table `notifications`
- ✅ `partner_id` dans la table `notifications`

### **Nouvelles fonctions :**
- ✅ `get_employee_notifications(employee_id)`
- ✅ `get_partner_notifications(partner_id)`
- ✅ `get_user_notifications_with_details(user_id)`

### **Triggers mis à jour :**
- ✅ Tous les triggers incluent maintenant `employee_id` et `partner_id`
- ✅ Meilleure traçabilité des notifications
- ✅ Filtrage avancé possible

### **Index de performance :**
- ✅ Index simples sur `employee_id` et `partner_id`
- ✅ Index composites pour les requêtes fréquentes
- ✅ Optimisation des performances

## 🔍 Vérification finale

Après l'exécution, vérifiez que :

1. **Les colonnes existent :**
```sql
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'notifications' 
AND column_name IN ('employee_id', 'partner_id');
```

2. **Les fonctions sont créées :**
```sql
SELECT routine_name FROM information_schema.routines
WHERE routine_name IN (
    'get_employee_notifications',
    'get_partner_notifications',
    'get_user_notifications_with_details'
);
```

3. **Les triggers sont actifs :**
```sql
SELECT trigger_name FROM information_schema.triggers 
WHERE trigger_schema = 'public'
AND trigger_name LIKE 'trigger_%';
```

## 🚨 En cas d'erreur

Si une erreur survient :

1. **Vérifiez l'ordre d'exécution**
2. **Vérifiez que les tables existent** (notamment `avis` au lieu de `reviews`)
3. **Vérifiez les permissions** de votre utilisateur Supabase
4. **Consultez les logs** pour identifier le problème spécifique

## 📞 Support

En cas de problème, vérifiez :
- ✅ L'ordre d'exécution des fichiers
- ✅ Les permissions de votre compte Supabase
- ✅ La présence de toutes les tables requises
- ✅ Les logs d'erreur dans l'interface Supabase 
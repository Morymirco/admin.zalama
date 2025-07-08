# 🔔 Améliorations du Système de Notifications

## 📋 Vue d'ensemble

Le système de notifications a été considérablement amélioré pour permettre une meilleure identification et filtrage des notifications par employé et partenaire.

## 🆕 Nouvelles fonctionnalités

### 1. **Nouveaux champs dans la table `notifications`**

```sql
ALTER TABLE public.notifications 
ADD COLUMN employee_id uuid REFERENCES public.employees(id) ON DELETE SET NULL;

ALTER TABLE public.notifications 
ADD COLUMN partner_id uuid REFERENCES public.partners(id) ON DELETE SET NULL;
```

### 2. **Fonction `create_notification` améliorée**

```sql
CREATE OR REPLACE FUNCTION create_notification(
    p_user_id UUID,
    p_titre VARCHAR,
    p_message TEXT,
    p_type notification_type DEFAULT 'Information',
    p_employee_id UUID DEFAULT NULL,    -- ⭐ NOUVEAU
    p_partner_id UUID DEFAULT NULL      -- ⭐ NOUVEAU
)
```

### 3. **Nouvelles fonctions utilitaires**

#### `get_employee_notifications(p_employee_id uuid)`
Récupère toutes les notifications liées à un employé spécifique.

#### `get_partner_notifications(p_partner_id uuid)`
Récupère toutes les notifications liées à un partenaire spécifique.

#### `get_user_notifications_with_details(p_user_id uuid)`
Récupère les notifications d'un utilisateur avec les détails employé/partenaire.

#### `migrate_existing_notifications()`
Migre les notifications existantes pour ajouter `employee_id` et `partner_id` (optionnel).

## 🔧 Mise à jour des triggers

Tous les triggers existants ont été mis à jour pour inclure les nouveaux paramètres :

### Exemple : Trigger de demande d'avance

```sql
-- Avant
PERFORM create_notification(
    admin_user.id,
    'Nouvelle demande d''avance de salaire',
    'L''employé ' || employee_name || ' a soumis une demande...',
    'Alerte'
);

-- Après
PERFORM create_notification(
    admin_user.id,
    'Nouvelle demande d''avance de salaire',
    'L''employé ' || employee_name || ' a soumis une demande...',
    'Alerte',
    NEW.employe_id,      -- ⭐ employee_id
    NEW.partenaire_id    -- ⭐ partner_id
);
```

## 📊 Index de performance

```sql
-- Index simples
CREATE INDEX idx_notifications_employee_id ON public.notifications(employee_id);
CREATE INDEX idx_notifications_partner_id ON public.notifications(partner_id);

-- Index composites pour les requêtes fréquentes
CREATE INDEX idx_notifications_user_employee ON public.notifications(user_id, employee_id);
CREATE INDEX idx_notifications_user_partner ON public.notifications(user_id, partner_id);
CREATE INDEX idx_notifications_employee_partner ON public.notifications(employee_id, partner_id);
```

## 🚀 Utilisation

### 1. **Créer une notification avec employé et partenaire**

```sql
SELECT create_notification(
    'user-uuid',
    'Titre de la notification',
    'Message de la notification',
    'Information',
    'employee-uuid',  -- ID de l'employé concerné
    'partner-uuid'    -- ID du partenaire concerné
);
```

### 2. **Récupérer les notifications d'un employé**

```sql
SELECT * FROM get_employee_notifications('employee-uuid');
```

### 3. **Récupérer les notifications d'un partenaire**

```sql
SELECT * FROM get_partner_notifications('partner-uuid');
```

### 4. **Récupérer les notifications utilisateur avec détails**

```sql
SELECT * FROM get_user_notifications_with_details('user-uuid');
```

## 📁 Fichiers modifiés

### Fichiers SQL
- `supabase/notification_triggers.sql` - Triggers mis à jour
- `supabase/add_notification_fields.sql` - Migration des nouveaux champs
- `supabase/advanced_notification_triggers.sql` - Triggers avancés

### Scripts de test
- `scripts/test-enhanced-notifications.js` - Tests des nouvelles fonctionnalités
- `scripts/run-notification-migration.js` - Script de migration

## 🔄 Processus de migration

### 1. **Exécuter la migration**

```bash
node scripts/run-notification-migration.js
```

### 2. **Mettre à jour les triggers**

```bash
node scripts/run-notification-triggers.js
```

### 3. **Tester les nouvelles fonctionnalités**

```bash
node scripts/test-enhanced-notifications.js
```

### 4. **Optionnel : Migrer les notifications existantes**

```sql
SELECT migrate_existing_notifications();
```

## 💡 Cas d'usage

### 1. **Filtrage par employé**
```sql
-- Toutes les notifications concernant un employé spécifique
SELECT * FROM notifications WHERE employee_id = 'employee-uuid';
```

### 2. **Filtrage par partenaire**
```sql
-- Toutes les notifications concernant un partenaire spécifique
SELECT * FROM notifications WHERE partner_id = 'partner-uuid';
```

### 3. **Notifications d'un utilisateur avec contexte**
```sql
-- Notifications d'un utilisateur avec détails employé/partenaire
SELECT * FROM get_user_notifications_with_details('user-uuid');
```

### 4. **Statistiques par employé**
```sql
-- Nombre de notifications par employé
SELECT 
    e.nom || ' ' || e.prenom as employee_name,
    COUNT(n.id) as notification_count
FROM notifications n
JOIN employees e ON n.employee_id = e.id
GROUP BY e.id, e.nom, e.prenom
ORDER BY notification_count DESC;
```

## 🔍 Avantages

1. **Meilleure traçabilité** : Chaque notification peut être liée à un employé et/ou partenaire spécifique
2. **Filtrage avancé** : Possibilité de filtrer les notifications par employé ou partenaire
3. **Performance améliorée** : Index optimisés pour les requêtes fréquentes
4. **Rétrocompatibilité** : Les champs sont optionnels, les notifications existantes continuent de fonctionner
5. **Fonctions utilitaires** : Nouvelles fonctions pour faciliter la récupération des données

## ⚠️ Notes importantes

1. **Champs optionnels** : `employee_id` et `partner_id` sont NULL par défaut
2. **Rétrocompatibilité** : Les notifications existantes ne sont pas affectées
3. **Performance** : Les nouveaux index améliorent les performances des requêtes
4. **Migration optionnelle** : La fonction `migrate_existing_notifications()` peut enrichir les notifications existantes

## 🎯 Prochaines étapes

1. ✅ Exécuter la migration des nouveaux champs
2. ✅ Mettre à jour les triggers
3. ✅ Tester les nouvelles fonctionnalités
4. 🔄 Intégrer dans l'interface utilisateur
5. 🔄 Ajouter des filtres par employé/partenaire dans l'UI
6. 🔄 Créer des tableaux de bord avec statistiques 
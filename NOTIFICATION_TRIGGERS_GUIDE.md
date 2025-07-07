# 📋 Guide des Triggers de Notifications - Admin.Zalama

## 🎯 Vue d'ensemble

Ce document décrit tous les triggers de notifications automatiques implémentés dans le système Admin.Zalama. Ces triggers créent automatiquement des notifications dans la base de données lorsqu'ils détectent des événements importants.

## 📊 Table des matières

1. [Actions déclenchant des notifications](#actions-déclenchant-des-notifications)
2. [Types de notifications](#types-de-notifications)
3. [Détail des triggers](#détail-des-triggers)
4. [Fonctions utilitaires](#fonctions-utilitaires)
5. [Installation et configuration](#installation-et-configuration)
6. [Tests et maintenance](#tests-et-maintenance)

## 🚀 Actions déclenchant des notifications

### 1. **Demandes d'avance de salaire**
- ✅ **Création** d'une nouvelle demande
- ✅ **Changement de statut** (En attente → Approuvée/Rejetée)

### 2. **Demandes de partenariat**
- ✅ **Création** d'une nouvelle demande
- ✅ **Changement de statut** (pending → approved/rejected/in_review)

### 3. **Transactions financières**
- ✅ **Création** d'une nouvelle transaction

### 4. **Alertes**
- ✅ **Création** d'une nouvelle alerte
- ✅ **Résolution** d'une alerte

### 5. **Avis et évaluations**
- ✅ **Création** d'un nouvel avis

### 6. **Événements de sécurité**
- ✅ **Détection** d'événements à haut risque (score ≥ 7)

### 7. **Gestion des employés**
- ✅ **Ajout** d'un nouvel employé

### 8. **Gestion des partenaires**
- ✅ **Ajout** d'un nouveau partenaire

### 9. **Transactions**
- ✅ **Création** d'une nouvelle transaction

### 10. **Services**
- ✅ **Ajout** d'un nouveau service

### 11. **Sécurité**
- ✅ **Tentatives de connexion échouées** (≥ 3 tentatives)

## 📝 Types de notifications

| Type | Description | Utilisation |
|------|-------------|-------------|
| `Information` | Informations générales | Nouveaux employés, services, transactions |
| `Alerte` | Situations nécessitant attention | Demandes d'avance, partenariat, alertes |
| `Succès` | Actions réussies | Approbations, résolutions |
| `Erreur` | Problèmes détectés | Rejets, événements de sécurité |

## 🔧 Détail des triggers

### 1. **Demandes d'avance de salaire**

#### `notify_salary_advance_created()`
- **Déclencheur**: INSERT sur `salary_advance_requests`
- **Action**: Notifie tous les administrateurs
- **Message**: "L'employé [nom] du partenaire [partenaire] a soumis une demande d'avance de [montant] FCFA."

#### `notify_salary_advance_status_changed()`
- **Déclencheur**: UPDATE sur `salary_advance_requests`
- **Action**: Notifie l'employé concerné
- **Message**: "Votre demande d'avance de [montant] FCFA a été [statut]."

### 2. **Demandes de partenariat**

#### `notify_partnership_request_created()`
- **Déclencheur**: INSERT sur `partnership_requests`
- **Action**: Notifie tous les administrateurs
- **Message**: "Une nouvelle demande de partenariat a été soumise par [entreprise] ([domaine])."

#### `notify_partnership_request_status_changed()`
- **Déclencheur**: UPDATE sur `partnership_requests`
- **Action**: Notifie les administrateurs du changement
- **Message**: "La demande de partenariat de [entreprise] a été [statut]."

### 3. **Transactions financières**

#### `notify_financial_transaction_created()`
- **Déclencheur**: INSERT sur `financial_transactions`
- **Action**: Notifie les administrateurs
- **Message**: "Une transaction de [montant] FCFA a été effectuée pour [partenaire] ([type])."

### 4. **Alertes**

#### `notify_alert_created()`
- **Déclencheur**: INSERT sur `alerts`
- **Action**: Notifie tous les administrateurs + l'assigné
- **Message**: "Nouvelle alerte : [titre] - [description]"

#### `notify_alert_resolved()`
- **Déclencheur**: UPDATE sur `alerts`
- **Action**: Notifie l'assigné et les administrateurs
- **Message**: "L'alerte [titre] a été résolue."

### 5. **Avis**

#### `notify_review_created()`
- **Déclencheur**: INSERT sur `avis`
- **Action**: Notifie les administrateurs
- **Message**: "Un nouvel avis de [employé] pour [partenaire] (Note: [note]/5)."

### 6. **Événements de sécurité**

#### `notify_security_event()`
- **Déclencheur**: INSERT sur `security_events`
- **Condition**: Score de risque ≥ 7
- **Action**: Notifie les administrateurs
- **Message**: "Un événement de sécurité de type [type] a été détecté avec un score de risque de [score]/10."

### 7. **Employés**

#### `notify_new_employee()`
- **Déclencheur**: INSERT sur `employees`
- **Action**: Notifie les administrateurs
- **Message**: "Un nouvel employé [nom] [prénom] a été ajouté au partenaire [partenaire]."

### 8. **Partenaires**

#### `notify_new_partner()`
- **Déclencheur**: INSERT sur `partners`
- **Action**: Notifie les administrateurs
- **Message**: "Un nouveau partenaire [nom] ([type]) a été ajouté au système."

### 9. **Transactions**

#### `notify_transaction_created()`
- **Déclencheur**: INSERT sur `transactions`
- **Action**: Notifie les administrateurs
- **Message**: "Une transaction de [montant] FCFA a été effectuée pour [employé] ([partenaire])."

### 10. **Services**

#### `notify_new_service()`
- **Déclencheur**: INSERT sur `services`
- **Action**: Notifie les administrateurs
- **Message**: "Un nouveau service [nom] ([catégorie]) a été ajouté au catalogue."

### 11. **Sécurité - Tentatives de connexion**

#### `notify_failed_login_attempts()`
- **Déclencheur**: INSERT/UPDATE sur `password_attempts`
- **Condition**: ≥ 3 tentatives échouées
- **Action**: Notifie les administrateurs
- **Message**: "[nombre] tentatives de connexion échouées détectées pour l'utilisateur."

## 🛠️ Fonctions utilitaires

### `create_notification(user_id, titre, message, type)`
- **Fonction utilitaire** pour créer une notification
- **Paramètres**:
  - `user_id`: UUID de l'utilisateur destinataire
  - `titre`: Titre de la notification
  - `message`: Contenu de la notification
  - `type`: Type de notification (Information/Alerte/Succès/Erreur)

### `cleanup_old_notifications()`
- **Nettoyage automatique** des anciennes notifications
- **Supprime** les notifications lues de plus de 90 jours
- **Retourne** le nombre de notifications supprimées

### `mark_notification_as_read(notification_id)`
- **Marque** une notification comme lue
- **Met à jour** `lu = true` et `date_lecture = NOW()`
- **Retourne** `true` si la notification existe

### `mark_all_notifications_as_read(user_id)`
- **Marque** toutes les notifications d'un utilisateur comme lues
- **Retourne** le nombre de notifications mises à jour

### `get_notification_stats(user_id)`
- **Retourne** les statistiques des notifications d'un utilisateur
- **Format JSON**:
  ```json
  {
    "total": 10,
    "non_lues": 3,
    "par_type": {"Information": 5, "Alerte": 3, "Succès": 2},
    "recentes": 2
  }
  ```

## 📦 Installation et configuration

### 1. **Application des triggers**

```bash
# Vérifier les triggers existants
node scripts/apply-notification-triggers.js check

# Appliquer tous les triggers
node scripts/apply-notification-triggers.js all

# Ou appliquer par sections
node scripts/apply-notification-triggers.js apply

# Tester les triggers
node scripts/apply-notification-triggers.js test
```

### 2. **Application manuelle via Supabase**

1. Aller sur https://supabase.com/dashboard/project/[PROJECT_ID]/sql
2. Copier le contenu de `supabase/notification_triggers.sql`
3. Coller dans l'éditeur SQL et exécuter

### 3. **Vérification de l'installation**

```sql
-- Vérifier les fonctions créées
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_type = 'FUNCTION' 
AND routine_name LIKE 'notify_%';

-- Vérifier les triggers créés
SELECT trigger_name, event_object_table 
FROM information_schema.triggers 
WHERE trigger_name LIKE 'trigger_%';
```

## 🧪 Tests et maintenance

### **Test des triggers**

Le script de test automatique vérifie :
1. ✅ Création d'un partenaire de test
2. ✅ Création d'un employé de test
3. ✅ Vérification des notifications générées
4. ✅ Nettoyage des données de test

### **Maintenance**

#### **Nettoyage automatique**
- Les notifications lues de plus de 90 jours sont automatiquement supprimées
- Exécution quotidienne à 2h du matin

#### **Monitoring**
- Vérifier régulièrement les performances des triggers
- Surveiller l'espace disque utilisé par les notifications
- Analyser les statistiques d'utilisation

### **Optimisations**

#### **Index créés**
```sql
-- Index pour les notifications
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_lu ON notifications(lu);
CREATE INDEX idx_notifications_date_creation ON notifications(date_creation);
CREATE INDEX idx_notifications_type ON notifications(type);

-- Index pour les triggers
CREATE INDEX idx_salary_advance_requests_statut ON salary_advance_requests(statut);
CREATE INDEX idx_partnership_requests_status ON partnership_requests(status);
CREATE INDEX idx_alerts_date_resolution ON alerts(date_resolution);
CREATE INDEX idx_security_events_risk_score ON security_events(risk_score);
```

## 🔍 Dépannage

### **Problèmes courants**

1. **Triggers ne se déclenchent pas**
   - Vérifier que les fonctions existent
   - Vérifier les permissions sur les tables
   - Contrôler les logs d'erreur

2. **Notifications en double**
   - Vérifier les conditions dans les triggers
   - Contrôler les contraintes d'unicité

3. **Performance dégradée**
   - Vérifier les index
   - Analyser les requêtes lentes
   - Optimiser les fonctions de trigger

### **Logs et monitoring**

```sql
-- Vérifier les notifications récentes
SELECT * FROM notifications 
WHERE date_creation > NOW() - INTERVAL '1 hour'
ORDER BY date_creation DESC;

-- Statistiques par type
SELECT type, COUNT(*) 
FROM notifications 
GROUP BY type;

-- Notifications non lues par utilisateur
SELECT user_id, COUNT(*) 
FROM notifications 
WHERE lu = false 
GROUP BY user_id;
```

## 📈 Statistiques et métriques

### **Métriques à surveiller**
- Nombre de notifications créées par jour
- Répartition par type de notification
- Temps de lecture moyen des notifications
- Taux de notifications non lues

### **Alertes de performance**
- Plus de 1000 notifications créées par heure
- Plus de 50% de notifications non lues
- Temps de réponse des triggers > 1 seconde

## 🎯 Bonnes pratiques

1. **Testez** toujours les triggers avant la production
2. **Surveillez** les performances régulièrement
3. **Nettoyez** les anciennes notifications
4. **Documentez** les modifications apportées
5. **Sauvegardez** avant toute modification

---

## 📞 Support

Pour toute question ou problème avec les triggers de notifications :
1. Vérifiez d'abord ce guide
2. Consultez les logs d'erreur
3. Testez avec le script de test
4. Contactez l'équipe de développement

**Version**: 1.0  
**Dernière mise à jour**: Décembre 2024  
**Auteur**: Équipe Admin.Zalama 
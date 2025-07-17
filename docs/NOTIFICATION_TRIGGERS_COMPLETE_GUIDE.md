# 🔔 Guide Complet des Triggers de Notifications ZaLaMa

## 📋 Vue d'ensemble

Ce document décrit le système complet de triggers de notifications automatiques implémenté dans ZaLaMa Admin Dashboard. Ces triggers créent automatiquement des notifications dans la base de données lors d'événements métier importants.

## 🎯 Actions Déclenchant des Notifications

### 1. **Demandes d'Avance de Salaire** (`salary_advance_requests`)

#### 📝 Création d'une demande
- **Trigger**: `trigger_salary_advance_created`
- **Fonction**: `notify_salary_advance_created()`
- **Destinataires**: Tous les administrateurs et responsables
- **Type**: `Alerte`
- **Message**: "L'employé [nom] ([partenaire]) a soumis une demande d'avance de [montant] FCFA. Motif: [motif]"

#### 🔄 Changement de statut
- **Trigger**: `trigger_salary_advance_status_changed`
- **Fonction**: `notify_salary_advance_status_changed()`
- **Destinataires**: Tous les administrateurs
- **Types**:
  - `APPROUVE` → Type: `Succès`
  - `REFUSE` → Type: `Erreur`
  - `PAYE` → Type: `Succès`
- **Message**: "La demande d'avance de [montant] FCFA de [employé] a été [statut]"

### 2. **Transactions** (`transactions`)

#### 💳 Création d'une transaction
- **Trigger**: `trigger_transaction_created`
- **Fonction**: `notify_transaction_created()`
- **Destinataires**: Tous les administrateurs
- **Type**: `Information`
- **Message**: "Transaction de [montant] FCFA effectuée par [méthode] pour [employé] ([partenaire]). Numéro: [numéro]"

#### 🔄 Changement de statut
- **Trigger**: `trigger_transaction_status_changed`
- **Fonction**: `notify_transaction_status_changed()`
- **Types**:
  - `EFFECTUEE` → Type: `Succès`
  - `ANNULEE` → Type: `Erreur`
- **Message**: "La transaction de [montant] FCFA pour [employé] ([numéro]) a été [statut]"

### 3. **Remboursements** (`remboursements`)

#### 💰 Création d'un remboursement
- **Trigger**: `trigger_remboursement_created`
- **Fonction**: `notify_remboursement_created()`
- **Destinataires**: Tous les administrateurs
- **Type**: `Alerte`
- **Message**: "Remboursement de [montant] FCFA à effectuer par [partenaire] pour [employé]. Date limite: [date]"

#### 🔄 Changement de statut
- **Trigger**: `trigger_remboursement_status_changed`
- **Fonction**: `notify_remboursement_status_changed()`
- **Types**:
  - `PAYE` → Type: `Succès`
  - `EN_RETARD` → Type: `Erreur`
  - `ANNULE` → Type: `Erreur`
- **Message**: "Le remboursement de [montant] FCFA de [partenaire] pour [employé] a été [statut]"

### 4. **Demandes de Partenariat** (`partnership_requests`)

#### 🤝 Nouvelle demande
- **Trigger**: `trigger_partnership_request_created`
- **Fonction**: `notify_partnership_request_created()`
- **Destinataires**: Tous les administrateurs
- **Type**: `Alerte`
- **Message**: "Une nouvelle demande de partenariat a été soumise par [entreprise] ([domaine]). [nombre] employés."

#### 🔄 Changement de statut
- **Trigger**: `trigger_partnership_request_status_changed`
- **Fonction**: `notify_partnership_request_status_changed()`
- **Types**:
  - `approved` → Type: `Succès`
  - `rejected` → Type: `Erreur`
  - `in_review` → Type: `Information`

### 5. **Employés** (`employees`)

#### 👤 Nouvel employé
- **Trigger**: `trigger_employee_created`
- **Fonction**: `notify_employee_created()`
- **Destinataires**: Tous les administrateurs
- **Type**: `Information`
- **Message**: "Un nouvel employé a été ajouté: [nom] ([poste]) chez [partenaire]"

### 6. **Partenaires** (`partners`)

#### 🏢 Nouveau partenaire
- **Trigger**: `trigger_partner_created`
- **Fonction**: `notify_partner_created()`
- **Destinataires**: Tous les administrateurs
- **Type**: `Information`
- **Message**: "Un nouveau partenaire a été ajouté: [nom] ([secteur])"

### 7. **Alertes** (`alerts`)

#### ⚠️ Nouvelle alerte
- **Trigger**: `trigger_alert_created`
- **Fonction**: `notify_alert_created()`
- **Destinataires**: Tous les administrateurs + assigné spécifique
- **Types**:
  - `Critique` → Type: `Erreur`
  - `Importante` → Type: `Alerte`
  - Autres → Type: `Information`
- **Message**: "Une nouvelle alerte de priorité [priorité] a été créée: [description]"

#### ✅ Alerte résolue
- **Trigger**: `trigger_alert_resolved`
- **Fonction**: `notify_alert_resolved()`
- **Condition**: Statut passe à `Résolue`
- **Type**: `Succès`
- **Message**: "L'alerte '[titre]' a été résolue"

### 8. **Avis** (`avis`)

#### ⭐ Nouvel avis
- **Trigger**: `trigger_avis_created`
- **Fonction**: `notify_avis_created()`
- **Destinataires**: Tous les administrateurs
- **Types**:
  - `positif` → Type: `Succès`
  - `negatif` → Type: `Alerte`
  - Autre → Type: `Information`
- **Message**: "Un avis [type] ([note]/5) a été laissé par [employé] chez [partenaire]"

### 9. **Événements de Sécurité** (`security_events`)

#### 🔒 Événement à haut risque
- **Trigger**: `trigger_security_event_high_risk`
- **Fonction**: `notify_security_event_high_risk()`
- **Condition**: Score de risque ≥ 7
- **Type**: `Erreur`
- **Message**: "Événement de sécurité détecté: [type] (Score de risque: [score]/10)"

### 10. **Tentatives de Connexion** (`password_attempts`)

#### 🚫 Tentatives échouées
- **Trigger**: `trigger_failed_login_attempts`
- **Fonction**: `notify_failed_login_attempts()`
- **Condition**: ≥ 3 tentatives échouées
- **Type**: `Alerte`
- **Message**: "Plusieurs tentatives de connexion échouées détectées pour [email] ([nombre] tentatives)"

## 📊 Types de Notifications

| Type | Description | Utilisation | Couleur |
|------|-------------|-------------|---------|
| `Information` | Informations générales | Créations, mises à jour standard | Bleu |
| `Alerte` | Situations nécessitant attention | Nouvelles demandes, événements importants | Orange |
| `Succès` | Actions réussies | Approbations, résolutions | Vert |
| `Erreur` | Problèmes détectés | Rejets, échecs, sécurité | Rouge |

## 🔧 Fonctions Utilitaires

### `create_notification()`
```sql
CREATE OR REPLACE FUNCTION create_notification(
    p_user_id UUID,
    p_titre VARCHAR,
    p_message TEXT,
    p_type notification_type DEFAULT 'Information',
    p_employee_id UUID DEFAULT NULL,
    p_partner_id UUID DEFAULT NULL
)
```

### `notify_all_admins()`
```sql
CREATE OR REPLACE FUNCTION notify_all_admins(
    p_titre VARCHAR,
    p_message TEXT,
    p_type notification_type DEFAULT 'Information',
    p_employee_id UUID DEFAULT NULL,
    p_partner_id UUID DEFAULT NULL
)
```

### `check_notification_triggers()`
Vérifie l'état de tous les triggers de notification.

### `cleanup_old_notifications()`
Nettoie les anciennes notifications lues (30 jours par défaut).

## 🚀 Installation

### 1. Exécuter le script principal
```bash
psql -h [host] -U [user] -d [database] -f zalama_notification_triggers_complete.sql
```

### 2. Vérifier l'installation
```sql
SELECT * FROM check_notification_triggers();
```

### 3. Tester avec une insertion
```sql
-- Test avec une nouvelle demande d'avance
INSERT INTO salary_advance_requests (
    employe_id,
    partenaire_id,
    montant_demande,
    type_motif,
    motif,
    montant_total
) VALUES (
    '[employee_id]',
    '[partner_id]',
    50000,
    'Urgence médicale',
    'Frais médicaux urgents',
    52500
);

-- Vérifier les notifications créées
SELECT * FROM notifications 
WHERE date_creation > NOW() - INTERVAL '1 minute'
ORDER BY date_creation DESC;
```

## 📈 Statistiques et Monitoring

### Notifications par type (dernières 24h)
```sql
SELECT 
    type,
    COUNT(*) as count
FROM notifications 
WHERE date_creation > NOW() - INTERVAL '24 hours'
GROUP BY type
ORDER BY count DESC;
```

### Notifications par table source (estimation)
```sql
SELECT 
    CASE 
        WHEN titre LIKE '%avance%' THEN 'salary_advance_requests'
        WHEN titre LIKE '%transaction%' THEN 'transactions'
        WHEN titre LIKE '%remboursement%' THEN 'remboursements'
        WHEN titre LIKE '%partenariat%' THEN 'partnership_requests'
        WHEN titre LIKE '%employé%' THEN 'employees'
        WHEN titre LIKE '%partenaire%' THEN 'partners'
        WHEN titre LIKE '%alerte%' THEN 'alerts'
        WHEN titre LIKE '%avis%' THEN 'avis'
        WHEN titre LIKE '%sécurité%' THEN 'security_events'
        ELSE 'autre'
    END as source_table,
    COUNT(*) as count
FROM notifications 
WHERE date_creation > NOW() - INTERVAL '7 days'
GROUP BY source_table
ORDER BY count DESC;
```

## 🔄 Maintenance

### Nettoyage périodique
```sql
-- Nettoyer les notifications lues de plus de 30 jours
SELECT cleanup_old_notifications(30);
```

### Désactiver temporairement les triggers
```sql
-- Désactiver un trigger spécifique
ALTER TABLE salary_advance_requests DISABLE TRIGGER trigger_salary_advance_created;

-- Réactiver
ALTER TABLE salary_advance_requests ENABLE TRIGGER trigger_salary_advance_created;
```

### Mise à jour des triggers
1. Supprimer l'ancien trigger
2. Modifier la fonction
3. Recréer le trigger

## ⚠️ Notes Importantes

1. **Performance**: Les triggers s'exécutent à chaque opération. Optimiser les requêtes dans les fonctions.

2. **Gestion d'erreurs**: Les triggers utilisent `PERFORM` pour éviter les erreurs fatales.

3. **Sécurité**: Toutes les fonctions utilisent `SECURITY DEFINER` avec des privilèges appropriés.

4. **Liens**: Les champs `employee_id` et `partner_id` permettent de filtrer les notifications par contexte.

5. **Évolutivité**: Le système est conçu pour être facilement étendu avec de nouveaux triggers.

## 🔗 Intégration avec l'Interface

### API pour récupérer les notifications
```typescript
// Service côté client
const notifications = await fetch('/api/notifications', {
  method: 'GET',
  headers: { 
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
}).then(res => res.json());
```

### Filtrage par contexte
```typescript
// Notifications pour un employé spécifique
const employeeNotifications = await fetch(`/api/notifications?employee_id=${employeeId}`);

// Notifications pour un partenaire spécifique  
const partnerNotifications = await fetch(`/api/notifications?partner_id=${partnerId}`);
```

## ✅ Résultat Final

Avec ce système, ZaLaMa dispose maintenant d'un système de notifications automatiques complet qui:

- ✅ **Notifie automatiquement** lors de toutes les actions métier importantes
- ✅ **Catégorise intelligemment** les notifications par type et priorité
- ✅ **Cible précisément** les destinataires appropriés
- ✅ **Maintient les liens** entre notifications et entités métier
- ✅ **Facilite le monitoring** et la traçabilité des événements
- ✅ **S'intègre parfaitement** avec l'interface utilisateur existante

Le système est maintenant prêt pour la production et votre présentation ! 🚀 
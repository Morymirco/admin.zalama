# 📧 Guide des Notifications de Partenariat

## 🎯 Vue d'ensemble

Ce guide explique le système de notifications automatiques qui se déclenche lors de l'approbation d'une demande de partenariat dans la page `/dashboard/partenaires`.

## 🔄 Flux de notifications

### 1. Déclenchement automatique
Lorsqu'un administrateur approuve une demande de partenariat :
- ✅ Le statut de la demande passe à `approved`
- 📧 Un email est envoyé au partenaire
- 📱 Un SMS est envoyé aux contacts RH et responsables
- 📧 Un email de notification est envoyé aux administrateurs

### 2. Destinataires des notifications

#### 📧 Email au partenaire
- **Destinataire** : Email du représentant de l'entreprise
- **Contenu** : 
  - Félicitations pour l'approbation
  - Détails du partenariat
  - Prochaines étapes
  - Informations de contact

#### 📱 SMS aux RH et responsables
- **Destinataires** : Tous les utilisateurs avec les rôles `rh`, `responsable`, `manager`
- **Contenu** : Résumé de l'approbation avec les coordonnées du partenaire

#### 📧 Email aux administrateurs
- **Destinataires** : Tous les contacts RH et responsables
- **Contenu** :
  - Détails du nouveau partenaire
  - Liste des actions à effectuer
  - Contacts internes notifiés

## 🛠️ Configuration requise

### Variables d'environnement
```env
# Email (Resend)
RESEND_API_KEY=your_resend_api_key

# SMS (Nimba SMS)
NIMBA_SMS_API_KEY=your_nimba_sms_api_key
NIMBA_SMS_SENDER_NAME=ZaLaMa

# Supabase
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### Tables de base de données
- `partnership_requests` : Demandes de partenariat
- `admin_users` : Utilisateurs administrateurs (RH, responsables)

## 📁 Fichiers implémentés

### Services
- `services/partnershipNotificationService.ts` : Service principal de notifications
- `services/partnershipRequestService.ts` : Service modifié pour intégrer les notifications
- `services/emailService.ts` : Service email étendu avec les templates de partenariat

### Scripts de test
- `scripts/test-partnership-notifications.js` : Script de test complet

## 🚀 Utilisation

### 1. Approbation manuelle
```typescript
// Dans la page partenaires
const { approveRequest } = useSupabasePartnershipRequests();

// L'approbation déclenche automatiquement les notifications
await approveRequest(requestId);
```

### 2. Test des notifications
```bash
# Exécuter le script de test
node scripts/test-partnership-notifications.js
```

### 3. Vérification des logs
Les notifications génèrent des logs détaillés :
```
🔄 Approbation de la demande de partenariat: abc123
📧 Envoi des notifications d'approbation...
📱 SMS RH/Responsables: ✅ Envoyé
📧 Email partenaire: ✅ Envoyé
📧 Email admin: ✅ Envoyé
✅ Notifications envoyées avec succès
```

## 📧 Templates d'emails

### Email au partenaire
- **Sujet** : `🎉 Demande de partenariat approuvée - [Nom entreprise]`
- **Design** : Template vert avec félicitations
- **Contenu** : Détails du partenariat + prochaines étapes

### Email aux administrateurs
- **Sujet** : `✅ Partenariat approuvé - [Nom entreprise]`
- **Design** : Template bleu avec informations techniques
- **Contenu** : Détails + actions à effectuer

## 📱 Messages SMS

### Format du message
```
Demande de partenariat approuvée: [Nom entreprise] ([Domaine]). Contact: [Représentant] - [Téléphone]. Email: [Email]
```

### Destinataires
- Tous les utilisateurs avec rôles : `rh`, `responsable`, `manager`
- Filtré par `active = true`

## 🔧 Personnalisation

### Modifier les templates
1. Éditer `services/emailService.ts`
2. Modifier les méthodes `sendPartnershipApprovalEmail` et `sendPartnershipApprovalAdminEmail`

### Modifier les destinataires SMS
1. Éditer `services/partnershipNotificationService.ts`
2. Modifier la méthode `getRHAndManagerContacts`

### Ajouter de nouveaux types de notifications
1. Créer de nouvelles méthodes dans `partnershipNotificationService.ts`
2. Intégrer dans `partnershipRequestService.ts`

## 🐛 Dépannage

### Problèmes courants

#### ❌ Notifications non envoyées
1. Vérifier les variables d'environnement
2. Vérifier la connexion Supabase
3. Vérifier les permissions des clés API

#### ❌ Email non reçu
1. Vérifier la clé Resend API
2. Vérifier l'adresse email du destinataire
3. Vérifier les logs Resend

#### ❌ SMS non reçu
1. Vérifier la clé Nimba SMS API
2. Vérifier le solde SMS
3. Vérifier le format des numéros de téléphone

### Logs de débogage
```bash
# Activer les logs détaillés
DEBUG=* node scripts/test-partnership-notifications.js
```

## 📊 Monitoring

### Métriques à surveiller
- Taux de succès des notifications
- Temps de livraison des emails/SMS
- Erreurs de configuration
- Utilisation des quotas API

### Alertes recommandées
- Échec d'envoi de notifications
- Quota SMS/Email épuisé
- Erreurs de configuration

## 🔒 Sécurité

### Bonnes pratiques
- Utiliser des clés API sécurisées
- Limiter les permissions des clés
- Valider les données avant envoi
- Logger les tentatives d'envoi

### Validation des données
- Vérifier l'existence de la demande
- Valider les adresses email
- Vérifier les numéros de téléphone
- Contrôler les permissions utilisateur

## 📈 Évolutions futures

### Fonctionnalités prévues
- [ ] Notifications de rejet de partenariat
- [ ] Notifications de mise en révision
- [ ] Templates personnalisables
- [ ] Historique des notifications
- [ ] Retry automatique en cas d'échec

### Améliorations techniques
- [ ] Queue de notifications asynchrone
- [ ] Templates HTML plus avancés
- [ ] Intégration avec d'autres services
- [ ] Analytics des notifications

---

## 📞 Support

Pour toute question ou problème :
- 📧 Email : support@zalama.com
- 📋 Documentation : Ce guide
- 🐛 Issues : Repository GitHub
- 💬 Chat : Plateforme ZaLaMa 
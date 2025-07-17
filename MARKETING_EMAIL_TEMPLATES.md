# Templates d'Email Marketing ZaLaMa

## 🎨 Design Professionnel

Le système d'email marketing ZaLaMa utilise maintenant des templates professionnels avec :

- **Design responsive** adapté à tous les appareils
- **Couleurs ZaLaMa** cohérentes avec la marque
- **Formatage automatique** du contenu
- **Aperçu en temps réel** avant envoi

## 📧 Types de Campagnes

### 1. Message Personnalisé (Custom)
- **Icône**: 📧
- **Couleur**: #6366F1 (Bleu ZaLaMa)
- **Titre**: "Message ZaLaMa"
- **Usage**: Messages génériques, communications internes

### 2. Newsletter
- **Icône**: 📰
- **Couleur**: #3B82F6 (Bleu)
- **Titre**: "Newsletter ZaLaMa"
- **Usage**: Actualités, nouvelles fonctionnalités, mises à jour

### 3. Promotion/Offre
- **Icône**: 🎉
- **Couleur**: #10B981 (Vert)
- **Titre**: "Offre Spéciale ZaLaMa"
- **Usage**: Promotions, réductions, offres limitées

### 4. Annonce Importante
- **Icône**: 📢
- **Couleur**: #F59E0B (Orange)
- **Titre**: "Annonce Importante ZaLaMa"
- **Usage**: Informations critiques, changements importants

## 🛠️ Utilisation

### Dans l'Interface Marketing

1. **Sélectionner le type de campagne** dans le menu déroulant
2. **Saisir le sujet** de l'email
3. **Rédiger le message** (formatage automatique)
4. **Ajouter les destinataires** (un par ligne ou séparés par des virgules)
5. **Aperçu** du rendu final avant envoi
6. **Envoyer** les emails

### Exemple de Message

```
Bonjour,

Nous sommes ravis de vous annoncer le lancement de nouvelles fonctionnalités sur notre plateforme ZaLaMa :

✅ Interface utilisateur améliorée
✅ Application mobile optimisée  
✅ Sécurité renforcée
✅ Performance accrue

Ces améliorations vous permettront de gérer votre entreprise plus efficacement.

Cordialement,
L'équipe ZaLaMa
```

### Rendu Automatique

Le message sera automatiquement formaté avec :
- **Icône et titre** selon le type de campagne
- **Cadre coloré** pour le contenu
- **Footer professionnel** avec les informations ZaLaMa
- **Design responsive** pour tous les appareils

## 🔧 Architecture Technique

### Services Utilisés

```typescript
// Service principal
import { MarketingEmailService } from '@/services/marketingEmailService';

// Template générateur
import { generateEmailTemplate } from '@/lib/email-template';
```

### API Route

```typescript
// app/api/email/send/route.ts
POST /api/email/send
{
  "to": ["email@example.com"],
  "subject": "Sujet de l'email",
  "html": "Contenu HTML généré",
  "text": "Version texte simple"
}
```

### Structure du Template

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ZaLaMa Email</title>
</head>
<body>
  <!-- Header ZaLaMa -->
  <div class="header">
    <div class="logo">ZaLaMa</div>
    <div class="tagline">Votre partenaire de confiance</div>
  </div>
  
  <!-- Contenu principal -->
  <div class="content">
    <!-- Icône et titre selon le type -->
    <!-- Message formaté -->
    <!-- Footer -->
  </div>
</body>
</html>
```

## 🧪 Tests

### Script de Test

```bash
# Installer les dépendances
npm install node-fetch

# Configurer les variables d'environnement
export TEST_EMAIL=your_email@example.com
export RESEND_API_KEY=your_resend_api_key

# Lancer les tests
node scripts/test-marketing-email.js
```

### Tests Disponibles

1. **Email marketing personnalisé** - Template de base
2. **Email newsletter** - Actualités et mises à jour
3. **Email promotion** - Offres et réductions

## 📱 Responsive Design

Le template s'adapte automatiquement à :

- **Desktop** (> 768px) - Layout complet
- **Tablet** (768px - 480px) - Layout adapté
- **Mobile** (< 480px) - Layout optimisé

### Breakpoints CSS

```css
/* Desktop */
@media (min-width: 768px) {
  .container { max-width: 600px; }
}

/* Mobile */
@media (max-width: 767px) {
  .container { max-width: 100%; padding: 20px; }
  .header { padding: 20px; }
  .content { padding: 20px; }
}
```

## 🎯 Bonnes Pratiques

### Contenu

1. **Sujet court et accrocheur** (50 caractères max)
2. **Message concis** (200-300 mots)
3. **Appel à l'action clair**
4. **Informations de contact**

### Technique

1. **Toujours inclure une version texte**
2. **Tester sur différents clients email**
3. **Vérifier les liens et images**
4. **Respecter les règles anti-spam**

### Performance

1. **Images optimisées** (max 1MB)
2. **CSS inline** pour la compatibilité
3. **Liens de désabonnement** obligatoires
4. **Taux d'ouverture** surveillé

## 🔍 Monitoring

### Métriques à Suivre

- **Taux de livraison** (> 95%)
- **Taux d'ouverture** (15-25%)
- **Taux de clic** (2-5%)
- **Taux de désabonnement** (< 0.5%)

### Logs

```typescript
// Logs automatiques dans la console
console.log('📧 Email marketing envoyé:', {
  recipients: data.recipients.length,
  subject: data.subject,
  campaignType: data.campaignType,
  timestamp: new Date().toISOString()
});
```

## 🚀 Améliorations Futures

### Fonctionnalités Prévues

- [ ] **A/B Testing** des sujets et contenus
- [ ] **Segmentation** des destinataires
- [ ] **Automatisation** des campagnes
- [ ] **Analytics** détaillés
- [ ] **Templates personnalisables**
- [ ] **Intégration CRM**

### Optimisations

- [ ] **Cache** des templates
- [ ] **Compression** des images
- [ ] **CDN** pour les assets
- [ ] **Queue** pour les envois massifs

---

## 📞 Support

Pour toute question sur les templates d'email marketing :

- **Documentation**: Ce fichier
- **Code source**: `/services/marketingEmailService.ts`
- **Tests**: `/scripts/test-marketing-email.js`
- **Interface**: `/app/dashboard/(dashboard)/marketing/page.tsx` 
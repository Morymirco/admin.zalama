# Guide d'Upload de Fichiers - Supabase Storage

Ce guide explique comment configurer et utiliser l'upload de fichiers avec Supabase Storage dans l'application ZaLaMa Admin.

## 📋 Table des matières

1. [Configuration du Storage](#configuration-du-storage)
2. [Architecture technique](#architecture-technique)
3. [Services et Hooks](#services-et-hooks)
4. [Utilisation dans les composants](#utilisation-dans-les-composants)
5. [Types de fichiers supportés](#types-de-fichiers-supportés)
6. [Sécurité et politiques](#sécurité-et-politiques)
7. [Dépannage](#dépannage)

## 🚀 Configuration du Storage

### 1. Configuration des buckets Supabase

Exécutez le script de configuration :

```bash
npm run setup-supabase-storage
```

Ce script va :
- Créer les buckets nécessaires (`logos`, `photos`, `documents`, `receipts`)
- Configurer les politiques de sécurité (RLS)
- Tester l'upload de fichiers

### 2. Variables d'environnement requises

Assurez-vous d'avoir ces variables dans votre `.env.local` :

```env
NEXT_PUBLIC_SUPABASE_URL=votre_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_clé_anon
SUPABASE_SERVICE_ROLE_KEY=votre_clé_service
```

## 🏗️ Architecture technique

### Structure des buckets

```
storage/
├── logos/
│   ├── partners/
│   │   └── {partner_id}/
│   │       └── logo.{extension}
│   └── services/
│       └── {service_id}/
│           └── logo.{extension}
├── photos/
│   └── users/
│       └── {user_id}/
│           └── photo.{extension}
├── documents/
│   └── {category}/
│       └── {file_name}
└── receipts/
    └── {user_id}/
        └── {receipt_name}
```

### Services créés

1. **`storageService.ts`** - Service principal pour les opérations de storage
2. **`useFileUpload.ts`** - Hook React pour gérer les uploads
3. **Composants mis à jour** - Modales d'ajout avec upload de logo

## 🔧 Services et Hooks

### StorageService

Le service principal gère toutes les opérations de storage :

```typescript
import { storageService } from '@/services/storageService';

// Upload d'un fichier générique
const { url, error } = await storageService.uploadFile('logos', 'path/file.jpg', file);

// Upload spécialisé pour les logos de partenaires
const { url, error } = await storageService.uploadPartnerLogo(file, partnerId);

// Validation de fichier
const validation = storageService.validateImageFile(file);

// Redimensionnement d'image
const resizedFile = await storageService.resizeImage(file, 800, 800);
```

### Hook useFileUpload

Hook React pour gérer les uploads avec état et progression :

```typescript
import { useFileUpload } from '@/hooks/useFileUpload';

const { 
  uploading, 
  uploadProgress, 
  uploadPartnerLogo, 
  validateFile 
} = useFileUpload();

// Upload avec progression
const handleUpload = async (file: File) => {
  const { url, error } = await uploadPartnerLogo(file, partnerId);
  if (error) {
    toast.error('Erreur upload');
  } else {
    toast.success('Upload réussi');
  }
};
```

## 🎨 Utilisation dans les composants

### Modale d'ajout de partenaire

La modale `ModaleAjoutPartenaire` a été mise à jour pour inclure :

- Zone de drag & drop pour les logos
- Validation des fichiers
- Aperçu de l'image
- Barre de progression
- Redimensionnement automatique

```typescript
// Dans la modale
const { uploading, uploadProgress, uploadPartnerLogo, validateFile } = useFileUpload();

const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files[0];
  const validation = validateFile(file);
  if (!validation.valid) {
    toast.error(validation.error);
    return;
  }
  setLogoFile(file);
  // Créer l'aperçu...
};
```

### Affichage des logos

Les logos sont affichés avec gestion des erreurs :

```typescript
<img 
  src={partenaire.logo_url || '/images/default-logo.png'} 
  alt={`Logo ${partenaire.nom}`}
  onError={(e) => {
    e.currentTarget.src = '/images/default-logo.png';
  }}
  className="w-12 h-12 object-cover rounded-lg"
/>
```

## 📁 Types de fichiers supportés

### Images (logos, photos)
- **Formats** : JPEG, JPG, PNG, GIF, WebP
- **Taille max** : 5MB
- **Redimensionnement** : Automatique vers 800x800px max

### Documents
- **Formats** : PDF, DOC, DOCX, TXT
- **Taille max** : 10MB

### Reçus
- **Formats** : JPEG, JPG, PNG, PDF
- **Taille max** : 5MB

## 🔒 Sécurité et politiques

### Politiques RLS configurées

1. **Bucket `logos`** :
   - Lecture publique (tous peuvent voir les logos)
   - Upload/Modification/Suppression pour utilisateurs authentifiés

2. **Bucket `photos`** :
   - Lecture publique
   - Upload/Modification/Suppression pour utilisateurs authentifiés

3. **Bucket `documents`** :
   - Lecture/Upload/Modification/Suppression pour utilisateurs authentifiés uniquement

4. **Bucket `receipts`** :
   - Lecture/Upload/Modification/Suppression pour utilisateurs authentifiés uniquement

### Validation côté client

```typescript
// Validation des types de fichiers
const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

// Validation de la taille
const maxSize = 5 * 1024 * 1024; // 5MB

// Validation complète
const validation = storageService.validateImageFile(file);
if (!validation.valid) {
  toast.error(validation.error);
  return;
}
```

## 🛠️ Dépannage

### Erreurs courantes

1. **"Bucket not found"**
   ```bash
   npm run setup-supabase-storage
   ```

2. **"Permission denied"**
   - Vérifiez les politiques RLS dans le dashboard Supabase
   - Assurez-vous que l'utilisateur est authentifié

3. **"File too large"**
   - Vérifiez la taille du fichier (max 5MB pour les images)
   - Utilisez le redimensionnement automatique

4. **"Invalid file type"**
   - Vérifiez le format du fichier
   - Utilisez uniquement les formats supportés

### Logs et débogage

```typescript
// Activer les logs détaillés
console.log('Upload result:', { url, error });

// Vérifier la progression
console.log('Upload progress:', uploadProgress);

// Vérifier la validation
console.log('File validation:', validation);
```

### Test de l'upload

```bash
# Tester l'upload depuis le script
npm run setup-supabase-storage

# Tester manuellement dans l'application
# 1. Aller sur /dashboard/partenaires
# 2. Cliquer sur "Ajouter"
# 3. Télécharger un logo
# 4. Vérifier l'upload et l'affichage
```

## 📝 Exemples d'utilisation

### Upload de logo de partenaire

```typescript
const handleAddPartenaire = async (formData: any) => {
  try {
    // Upload du logo si présent
    let logoUrl = '';
    if (logoFile) {
      const uploadResult = await uploadPartnerLogo(logoFile, tempPartnerId);
      if (uploadResult.error) {
        throw new Error('Erreur upload logo');
      }
      logoUrl = uploadResult.url;
    }

    // Créer le partenaire avec l'URL du logo
    await createPartenaire({
      ...formData,
      logo_url: logoUrl
    });

    toast.success('Partenaire ajouté avec succès');
  } catch (error) {
    toast.error('Erreur lors de l\'ajout');
  }
};
```

### Upload de photo de profil

```typescript
const handlePhotoUpload = async (file: File) => {
  const { url, error } = await uploadUserPhoto(file, userId);
  if (error) {
    toast.error('Erreur upload photo');
  } else {
    // Mettre à jour le profil utilisateur
    await updateUserProfile({ photo_url: url });
    toast.success('Photo mise à jour');
  }
};
```

## 🔄 Prochaines étapes

1. **Tests complets** : Tester tous les types d'upload
2. **Optimisation** : Améliorer la compression des images
3. **CDN** : Configurer un CDN pour les fichiers statiques
4. **Backup** : Mettre en place un système de sauvegarde
5. **Monitoring** : Ajouter des métriques d'upload

## 📞 Support

Pour toute question ou problème :
1. Vérifiez les logs dans la console
2. Consultez la documentation Supabase
3. Testez avec le script de configuration
4. Vérifiez les politiques RLS dans le dashboard

---

**Note** : Ce système d'upload est conçu pour être sécurisé, performant et facile à utiliser. Il gère automatiquement la validation, le redimensionnement et l'optimisation des fichiers. 
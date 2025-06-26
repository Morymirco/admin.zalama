# Guide de Migration vers Supabase - ZaLaMa Admin

## 🎯 Vue d'ensemble

Ce guide détaille la migration progressive de Firebase vers Supabase pour le projet ZaLaMa Admin Dashboard.

## 📋 Prérequis

### 1. Compte Supabase
- Créer un compte sur [supabase.com](https://supabase.com)
- Créer un nouveau projet
- Noter l'URL et les clés API

### 2. Variables d'environnement
Créer un fichier `.env.local` avec les variables suivantes :

```env
# Configuration Supabase
NEXT_PUBLIC_SUPABASE_URL=votre_url_supabase_ici
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anonyme_supabase_ici
SUPABASE_SERVICE_ROLE_KEY=votre_cle_service_role_supabase_ici

# Configuration Firebase (pour la migration progressive)
NEXT_PUBLIC_FIREBASE_API_KEY=votre_cle_api_firebase
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=votre_domaine_auth_firebase
NEXT_PUBLIC_FIREBASE_PROJECT_ID=votre_project_id_firebase
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=votre_bucket_storage_firebase
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=votre_sender_id_firebase
NEXT_PUBLIC_FIREBASE_APP_ID=votre_app_id_firebase
```

## 🚀 Phase 1: Configuration (✅ Terminée)

### Étapes réalisées :
1. ✅ Installation des packages Supabase
2. ✅ Configuration de la connexion (`lib/supabase.ts`)
3. ✅ Création des services de base (`lib/services/database.ts`)
4. ✅ Hook d'authentification (`hooks/useAuth.ts`)
5. ✅ Schéma de base de données (`supabase/schema.sql`)
6. ✅ Composant de test (`components/MigrationTest.tsx`)
7. ✅ Page de test (`app/dashboard/migration-test/page.tsx`)

### Test de la configuration :
1. Aller sur `/dashboard/migration-test`
2. Tester la connexion Supabase
3. Tester le service partenaires
4. Tester l'authentification

## 🔐 Phase 2: Authentification (🔄 En cours)

### Étapes à réaliser :

#### 2.1 Configuration de l'authentification Supabase
```sql
-- Dans Supabase Dashboard > Authentication > Settings
-- Configurer les providers d'authentification
-- Activer Email/Password
-- Configurer les redirections
```

#### 2.2 Migration de la page de connexion
Modifier `app/page.tsx` pour utiliser Supabase au lieu de Firebase :

```typescript
// Remplacer
import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";

// Par
import { useAuth } from "@/hooks/useAuth";
```

#### 2.3 Protection des routes
Créer un middleware pour protéger les routes :

```typescript
// middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';

export async function middleware(req) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  const { data: { session } } = await supabase.auth.getSession();

  if (!session && req.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  return res;
}
```

#### 2.4 Test de l'authentification
- Tester la connexion/déconnexion
- Vérifier la persistance des sessions
- Tester la protection des routes

## 🗄️ Phase 3: Base de Données (🔄 À faire)

### 3.1 Création des tables
Exécuter le schéma SQL dans Supabase :

1. Aller dans Supabase Dashboard > SQL Editor
2. Copier le contenu de `supabase/schema.sql`
3. Exécuter le script

### 3.2 Migration des données
Créer un script de migration des données Firebase vers Supabase :

```typescript
// scripts/migrate-data.ts
import { supabase } from '@/lib/supabase';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

async function migratePartners() {
  const partnersSnapshot = await getDocs(collection(db, 'partners'));
  const partners = partnersSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));

  for (const partner of partners) {
    await supabase.from('partners').insert(partner);
  }
}
```

### 3.3 Test des services CRUD
Tester tous les services dans `lib/services/database.ts` :
- ✅ `partnerService.getAllPartners()`
- ✅ `partnerService.createPartner()`
- ✅ `partnerService.updatePartner()`
- ✅ `partnerService.deletePartner()`

### 3.4 Optimisation des requêtes
- Ajouter des index pour les performances
- Optimiser les requêtes avec des vues
- Configurer les politiques RLS

## 📁 Phase 4: Storage (🔄 À faire)

### 4.1 Configuration Supabase Storage
```sql
-- Créer un bucket pour les logos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('logos', 'logos', true);

-- Politique pour l'accès public aux logos
CREATE POLICY "Logos are publicly accessible" ON storage.objects
FOR SELECT USING (bucket_id = 'logos');
```

### 4.2 Migration des fichiers
Créer un script pour migrer les fichiers Firebase Storage vers Supabase Storage :

```typescript
// scripts/migrate-storage.ts
import { supabase } from '@/lib/supabase';
import { storage } from '@/lib/firebase';
import { ref, getDownloadURL } from 'firebase/storage';

async function migrateLogos() {
  // Récupérer tous les partenaires avec des logos
  const { data: partners } = await supabase
    .from('partners')
    .select('id, logo_url')
    .not('logo_url', 'is', null);

  for (const partner of partners) {
    if (partner.logo_url && partner.logo_url.includes('firebase')) {
      // Télécharger depuis Firebase
      const logoRef = ref(storage, partner.logo_url);
      const downloadURL = await getDownloadURL(logoRef);
      
      // Upload vers Supabase
      const response = await fetch(downloadURL);
      const blob = await response.blob();
      
      const { data, error } = await supabase.storage
        .from('logos')
        .upload(`${partner.id}/logo.jpg`, blob);
      
      if (!error) {
        // Mettre à jour l'URL dans la base
        const { data: publicUrlData } = supabase.storage
          .from('logos')
          .getPublicUrl(`${partner.id}/logo.jpg`);
        
        await supabase
          .from('partners')
          .update({ logo_url: publicUrlData.publicUrl })
          .eq('id', partner.id);
      }
    }
  }
}
```

### 4.3 Mise à jour des composants
Modifier les composants pour utiliser Supabase Storage :

```typescript
// Dans ModaleAjoutPartenaire.tsx
const uploadLogo = async (file: File) => {
  const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${file.name.split('.').pop()}`;
  
  const { data, error } = await supabase.storage
    .from('logos')
    .upload(`public/${fileName}`, file);
  
  if (error) throw error;
  
  const { data: publicUrlData } = supabase.storage
    .from('logos')
    .getPublicUrl(`public/${fileName}`);
  
  return publicUrlData.publicUrl;
};
```

## 🔄 Phase 5: Migration Progressive (🔄 En cours)

### 5.1 Approche hybride
Pendant la migration, maintenir les deux systèmes :

```typescript
// hooks/useDatabase.ts
export const usePartners = () => {
  const [useSupabase, setUseSupabase] = useState(false);
  
  const fetchPartners = async () => {
    if (useSupabase) {
      return await partnerService.getAllPartners();
    } else {
      return await firebasePartnerService.getAllPartners();
    }
  };
  
  // ... reste du hook
};
```

### 5.2 Basculement progressif
1. Commencer par les nouvelles fonctionnalités avec Supabase
2. Migrer les données existantes par lots
3. Tester chaque module migré
4. Basculer complètement une fois tous les tests validés

### 5.3 Rollback plan
Maintenir la possibilité de revenir à Firebase si nécessaire :

```typescript
// Configuration pour basculer entre les systèmes
const USE_SUPABASE = process.env.NEXT_PUBLIC_USE_SUPABASE === 'true';
```

## 🧪 Tests et Validation

### Tests à effectuer :
1. **Tests unitaires** : Chaque service CRUD
2. **Tests d'intégration** : Flux complets (création partenaire, upload logo, etc.)
3. **Tests de performance** : Comparaison Firebase vs Supabase
4. **Tests de sécurité** : Vérification des politiques RLS
5. **Tests utilisateur** : Scénarios réels d'utilisation

### Métriques à surveiller :
- Temps de réponse des requêtes
- Taux d'erreur
- Utilisation des ressources
- Coûts

## 🚀 Phase 6: Finalisation (🔄 À faire)

### 6.1 Nettoyage du code
- Supprimer les imports Firebase inutilisés
- Nettoyer les configurations Firebase
- Mettre à jour la documentation

### 6.2 Optimisations finales
- Optimiser les requêtes Supabase
- Configurer les webhooks si nécessaire
- Mettre en place le monitoring

### 6.3 Déploiement
- Tester en staging
- Déployer en production
- Surveiller les métriques
- Planifier la maintenance

## 📊 Monitoring et Maintenance

### Métriques à surveiller :
- Performance des requêtes
- Utilisation du stockage
- Erreurs d'authentification
- Coûts Supabase

### Maintenance régulière :
- Mise à jour des dépendances
- Optimisation des requêtes
- Sauvegarde des données
- Révision des politiques de sécurité

## 🆘 Dépannage

### Problèmes courants :

#### Erreur de connexion Supabase
```bash
# Vérifier les variables d'environnement
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY
```

#### Erreur RLS (Row Level Security)
```sql
-- Vérifier les politiques
SELECT * FROM pg_policies WHERE tablename = 'partners';

-- Désactiver temporairement RLS pour debug
ALTER TABLE partners DISABLE ROW LEVEL SECURITY;
```

#### Erreur d'upload de fichiers
```typescript
// Vérifier les permissions du bucket
const { data, error } = await supabase.storage
  .from('logos')
  .list();
```

## 📞 Support

Pour toute question ou problème :
1. Consulter la [documentation Supabase](https://supabase.com/docs)
2. Vérifier les logs dans Supabase Dashboard
3. Consulter les issues GitHub du projet
4. Contacter l'équipe de développement

---

**Note** : Cette migration se fait en douceur pour minimiser les risques. Chaque phase doit être testée avant de passer à la suivante. 
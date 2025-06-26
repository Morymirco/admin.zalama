# Guide d'utilisation des variables CSS ZaLaMa

## Vue d'ensemble

Le projet ZaLaMa Admin utilise un système de variables CSS personnalisées pour maintenir une cohérence visuelle dans toute l'application. Ces variables sont définies dans `styles/zalama-theme.css` et importées dans `app/globals.css`.

## Variables CSS principales

### Couleurs de base
```css
--zalama-blue: #3b82f6;         /* Bleu principal ZaLaMa */
--zalama-blue-accent: #60a5fa;  /* Bleu accent pour hover */
--zalama-success: #10b981;      /* Vert pour succès */
--zalama-warning: #f59e0b;      /* Orange pour avertissement */
--zalama-danger: #ef4444;       /* Rouge pour danger */
--zalama-green: #10b981;        /* Vert */
--zalama-red: #ef4444;          /* Rouge */
```

### Variables pour le thème sombre (par défaut)
```css
--zalama-bg-dark: #0a1525;      /* Fond principal */
--zalama-bg-darker: #061020;    /* Sidebar */
--zalama-bg-light: #0e1e36;     /* Cards, hover */
--zalama-bg-lighter: #1a2c4e;   /* Hover plus clair */
--zalama-header-blue: #0c1d3b;  /* Header */
--zalama-card: #0c1a2e;         /* Fond des cartes */
--zalama-border: #1e3a70;       /* Bordures */
--zalama-text: #e5e7ef;         /* Texte principal */
--zalama-text-secondary: #a0aec0; /* Texte secondaire */
--zalama-shadow: rgba(0, 0, 0, 0.3); /* Ombres */
```

### Variables pour le thème clair
```css
--zalama-bg-dark: #f5f7fa;      /* Fond principal */
--zalama-bg-darker: #e2e8f0;    /* Sidebar */
--zalama-bg-light: #edf2f7;     /* Cards, hover */
--zalama-bg-lighter: #f8fafc;   /* Hover plus clair */
--zalama-header-blue: #f1f5f9;  /* Header */
--zalama-card: #ffffff;         /* Fond des cartes */
--zalama-border: #cbd5e1;       /* Bordures */
--zalama-text: #1e293b;         /* Texte principal */
--zalama-text-secondary: #64748b; /* Texte secondaire */
--zalama-shadow: rgba(0, 0, 0, 0.1); /* Ombres */
```

### Variables de layout
```css
--sidebar-width: 16rem;
--sidebar-collapsed-width: 4rem;
--dashboard-padding: 8px;
--dashboard-gap: 8px;
--card-padding: 16px;
```

## Utilisation dans les composants

### Exemple d'utilisation dans un composant React

```tsx
import React from 'react';

const MonComposant: React.FC = () => {
  return (
    <div className="bg-[var(--zalama-card)] border border-[var(--zalama-border)] rounded-lg p-4">
      <h2 className="text-[var(--zalama-text)] font-semibold mb-2">
        Titre du composant
      </h2>
      <p className="text-[var(--zalama-text-secondary)]">
        Description du composant
      </p>
      <button className="bg-[var(--zalama-blue)] hover:bg-[var(--zalama-blue-accent)] text-white px-4 py-2 rounded">
        Action
      </button>
    </div>
  );
};
```

### Classes CSS utilitaires disponibles

#### Couleurs de fond
- `bg-[var(--zalama-card)]` - Fond des cartes
- `bg-[var(--zalama-bg-dark)]` - Fond principal
- `bg-[var(--zalama-bg-darker)]` - Fond de la sidebar
- `bg-[var(--zalama-bg-light)]` - Fond pour hover
- `bg-[var(--zalama-bg-lighter)]` - Fond pour hover plus clair
- `bg-[var(--zalama-header-blue)]` - Fond du header

#### Couleurs de texte
- `text-[var(--zalama-text)]` - Texte principal
- `text-[var(--zalama-text-secondary)]` - Texte secondaire
- `text-[var(--zalama-blue)]` - Texte bleu ZaLaMa
- `text-[var(--zalama-success)]` - Texte vert
- `text-[var(--zalama-warning)]` - Texte orange
- `text-[var(--zalama-danger)]` - Texte rouge

#### Bordures
- `border-[var(--zalama-border)]` - Bordure standard
- `border-[var(--zalama-blue)]` - Bordure bleue

#### Boutons
- `bg-[var(--zalama-blue)] hover:bg-[var(--zalama-blue-accent)]` - Bouton principal
- `bg-[var(--zalama-success)]` - Bouton succès
- `bg-[var(--zalama-danger)]` - Bouton danger

## Système de thème

Le projet utilise un système de thème qui bascule automatiquement entre le mode clair et sombre. Le thème est géré par le contexte `ThemeContext` et appliqué via l'attribut `data-theme` sur l'élément `html`.

### Changement de thème
```tsx
import { useTheme } from '@/contexts/ThemeContext';

const MonComposant: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <button onClick={toggleTheme}>
      {theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
    </button>
  );
};
```

## Responsive Design

Les variables CSS incluent des media queries pour adapter l'interface aux différentes tailles d'écran :

- **Desktop** (> 1200px) : Layout complet
- **Tablet** (768px - 1200px) : Layout adapté
- **Mobile** (< 768px) : Layout mobile-first

## Bonnes pratiques

1. **Utilisez toujours les variables CSS ZaLaMa** au lieu de couleurs hardcodées
2. **Respectez la hiérarchie des couleurs** : principal → secondaire → accent
3. **Testez sur les deux thèmes** (clair et sombre)
4. **Utilisez les classes utilitaires** quand possible
5. **Maintenez la cohérence** avec les autres composants

## Exemples de composants utilisant les variables ZaLaMa

### StatCard
```tsx
<div className="bg-[var(--zalama-card)] border border-[var(--zalama-border)] rounded-xl shadow-md">
  <div className="text-[var(--zalama-blue)] text-2xl">{icon}</div>
  <div className="text-[var(--zalama-text)] font-bold">{value}</div>
  <div className="text-[var(--zalama-text-secondary)]">{label}</div>
</div>
```

### ListePartenaires
```tsx
<div className="bg-[var(--zalama-card)] border border-[var(--zalama-border)] rounded-xl">
  <h3 className="text-[var(--zalama-text)]">{nom}</h3>
  <p className="text-[var(--zalama-text-secondary)]">{description}</p>
  <button className="text-[var(--zalama-blue)] hover:bg-[var(--zalama-blue)]/10">
    Éditer
  </button>
</div>
```

### Modale
```tsx
<div className="bg-[var(--zalama-card)] rounded-xl shadow-lg">
  <div className="border-b border-[var(--zalama-border)]">
    <h3 className="text-[var(--zalama-text)]">Titre</h3>
  </div>
  <div className="p-4">
    <p className="text-[var(--zalama-text-secondary)]">Contenu</p>
  </div>
</div>
```

## Maintenance

Pour ajouter de nouvelles variables CSS :

1. Ajoutez-les dans `styles/zalama-theme.css`
2. Définissez-les pour les deux thèmes (clair et sombre)
3. Documentez-les dans ce guide
4. Testez sur les deux thèmes

Pour modifier les couleurs existantes :

1. Modifiez les valeurs dans `styles/zalama-theme.css`
2. Testez l'impact sur tous les composants
3. Mettez à jour ce guide si nécessaire 
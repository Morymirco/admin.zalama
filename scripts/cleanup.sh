#!/bin/bash
echo "🧹 Nettoyage du cache et des fichiers temporaires..."

# Nettoyer le cache Next.js
rm -rf .next/cache
rm -rf .next/build-manifest.json
rm -rf .next/prerender-manifest.json

# Nettoyer le cache Node.js
rm -rf node_modules/.cache
rm -rf node_modules/.vite

# Nettoyer les logs
rm -rf *.log
rm -rf npm-debug.log*
rm -rf yarn-debug.log*
rm -rf yarn-error.log*

# Nettoyer les fichiers temporaires
rm -rf .DS_Store
rm -rf *.tsbuildinfo

echo "✅ Nettoyage terminé"

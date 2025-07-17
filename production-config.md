# Configuration Production - Variables dEnvironnement

## À ajouter dans votre fichier .env.production

```bash
# Configuration Lengo Pay pour la Production
LENGO_API_URL=https://portal.lengopay.com
LENGO_API_KEY=bDM0lhpcDRta052mxIZEFFcEV1o0ERwS2R0dnk3ZUhWOEpwczdYVXdnM1Bwd016UTVLcEVZNmc0RkQwMw==
LENGO_SITE_ID=ozazlahgzpntmYAG

# URL de base pour la production (à remplacer par votre domaine réel)
NEXT_PUBLIC_BASE_URL=https://votre-domaine-production.com

# Configuration Supabase
NEXT_PUBLIC_SUPABASE_URL=https://mspmrzlqhwpdkkburjiw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5CI6kpXVCJ9eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6m1cG1mxxaHdwZGtrYnVyaml3wicm9ZSI6ImFub24CJpYXQiOjE3TA3ODcyNTgsImV4cCI6MjA2NjM2MzI1OH0.zr-TRpKjGJjW0RtsyPcCLy4Us-c50onfiguration Email/SMS
RESEND_API_KEY=re_xxxxxxxxxxxx
NIMBA_SMS_API_KEY=xxxxxxxxxxxx
NIMBA_SMS_SENDER_NAME=ZaLaMa

# Configuration de l'application
NODE_ENV=production
```

## URLs de Callback à Configurer

- **Callback Principal**: `https://votre-domaine-production.com/api/payments/lengo-callback`
- **Callback Remboursements**: `https://votre-domaine-production.com/api/remboursements/lengo-callback`
- **URL de Retour**: `https://votre-domaine-production.com/dashboard/remboursements/success` 
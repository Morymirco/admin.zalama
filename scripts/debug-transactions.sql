-- Script de débogage pour vérifier les transactions
-- Exécuter dans Supabase SQL Editor

-- 1. Vérifier les types enum
SELECT 
  typname as enum_name,
  enumlabel as enum_value
FROM pg_enum e
JOIN pg_type t ON e.enumtypid = t.oid
WHERE typname = 'transaction_statut';

-- 2. Vérifier la structure de la table transactions
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'transactions'
ORDER BY ordinal_position;

-- 3. Compter les transactions par statut
SELECT 
  statut,
  COUNT(*) as nombre_transactions
FROM transactions
GROUP BY statut;

-- 4. Voir quelques exemples de transactions
SELECT 
  id,
  entreprise_id,
  employe_id,
  montant,
  numero_transaction,
  methode_paiement,
  statut,
  date_transaction,
  created_at
FROM transactions
LIMIT 10;

-- 5. Vérifier les partenaires
SELECT 
  id,
  nom,
  email,
  actif
FROM partners
LIMIT 10;

-- 6. Vérifier les transactions d'un partenaire spécifique (remplacer PARTNER_ID)
-- SELECT 
--   t.id,
--   t.entreprise_id,
--   t.employe_id,
--   t.montant,
--   t.numero_transaction,
--   t.statut,
--   p.nom as partenaire_nom,
--   e.nom as employe_nom,
--   e.prenom as employe_prenom
-- FROM transactions t
-- LEFT JOIN partners p ON t.entreprise_id = p.id
-- LEFT JOIN employees e ON t.employe_id = e.id
-- WHERE t.entreprise_id = 'PARTNER_ID_HERE';

-- 7. Vérifier les transactions EFFECTUEE
SELECT 
  t.id,
  t.entreprise_id,
  t.employe_id,
  t.montant,
  t.numero_transaction,
  t.statut,
  p.nom as partenaire_nom,
  e.nom as employe_nom,
  e.prenom as employe_prenom
FROM transactions t
LEFT JOIN partners p ON t.entreprise_id = p.id
LEFT JOIN employees e ON t.employe_id = e.id
WHERE t.statut = 'EFFECTUEE'
LIMIT 10;

-- 8. Vérifier s'il y a des remboursements existants
SELECT 
  COUNT(*) as nombre_remboursements
FROM remboursements;

-- 9. Vérifier les transactions sans remboursement
SELECT 
  t.id,
  t.entreprise_id,
  t.montant,
  t.numero_transaction,
  t.statut,
  p.nom as partenaire_nom
FROM transactions t
LEFT JOIN partners p ON t.entreprise_id = p.id
LEFT JOIN remboursements r ON t.id = r.transaction_id
WHERE t.statut = 'EFFECTUEE'
  AND r.id IS NULL
LIMIT 10; 
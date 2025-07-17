-- =====================================================
-- DEBUG DES MODALES DE DEMANDES D'AVANCE
-- =====================================================

-- 1. Vérifier les statuts actuels dans salary_advance_requests
SELECT 
    'Statuts dans salary_advance_requests' as info,
    statut::text as statut_text,
    COUNT(*) as count
FROM salary_advance_requests
GROUP BY statut::text
ORDER BY count DESC;

-- 2. Vérifier s'il y a des enregistrements problématiques
-- (en utilisant une conversion sécurisée)
CREATE TEMP TABLE temp_debug_statuts AS
SELECT 
    id,
    statut::text as statut_text,
    employe_id,
    montant_demande,
    created_at
FROM salary_advance_requests;

-- 3. Lister tous les statuts uniques trouvés
SELECT DISTINCT statut_text
FROM temp_debug_statuts
ORDER BY statut_text;

-- 4. Identifier les enregistrements avec des statuts potentiellement problématiques
SELECT 
    id,
    statut_text,
    montant_demande,
    created_at::date
FROM temp_debug_statuts
WHERE statut_text NOT IN ('En attente', 'Validé', 'Rejeté', 'Annulé')
ORDER BY created_at DESC
LIMIT 10;

-- 5. Compter les demandes récentes par statut
SELECT 
    statut_text,
    COUNT(*) as count
FROM temp_debug_statuts
WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY statut_text
ORDER BY count DESC;

-- 6. Vérifier les enum disponibles
SELECT 
    enumlabel as valeurs_enum_disponibles
FROM pg_enum
WHERE enumtypid = (
    SELECT oid 
    FROM pg_type 
    WHERE typname = 'transaction_status'
)
ORDER BY enumlabel;

-- Nettoyage
DROP TABLE temp_debug_statuts; 
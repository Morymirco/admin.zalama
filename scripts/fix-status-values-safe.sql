-- =====================================================
-- CORRECTION SÉCURISÉE DES STATUTS (sans utiliser APPROUVE dans WHERE)
-- =====================================================

-- 1. Identifier les enregistrements avec des statuts problématiques
-- On utilise une approche indirecte pour éviter l'erreur enum
CREATE TEMP TABLE temp_problematic_records AS
SELECT id, statut::text as statut_text
FROM salary_advance_requests;

-- 2. Voir les statuts actuels
SELECT 
    'Statuts présents dans la base' as info,
    statut_text,
    COUNT(*) as count
FROM temp_problematic_records
GROUP BY statut_text
ORDER BY statut_text;

-- 3. Correction par ID pour éviter l'erreur enum
-- Corriger tous les enregistrements qui ont des statuts non conformes
UPDATE salary_advance_requests 
SET statut = 'Validé',
    updated_at = NOW()
WHERE id IN (
    SELECT id FROM temp_problematic_records 
    WHERE statut_text = 'APPROUVE'
);

UPDATE salary_advance_requests 
SET statut = 'En attente',
    updated_at = NOW()
WHERE id IN (
    SELECT id FROM temp_problematic_records 
    WHERE statut_text = 'EN_ATTENTE'
);

UPDATE salary_advance_requests 
SET statut = 'Rejeté',
    updated_at = NOW()
WHERE id IN (
    SELECT id FROM temp_problematic_records 
    WHERE statut_text = 'REFUSE'
);

UPDATE salary_advance_requests 
SET statut = 'Annulé',
    updated_at = NOW()
WHERE id IN (
    SELECT id FROM temp_problematic_records 
    WHERE statut_text = 'PAYE'
);

-- 4. Vérification après correction
SELECT 
    'Statuts après correction' as info,
    statut::text as statut_corrige,
    COUNT(*) as count
FROM salary_advance_requests
GROUP BY statut::text
ORDER BY statut::text;

-- 5. Vérifier qu'il ne reste plus de problèmes
SELECT 
    'Vérification finale' as info,
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ Aucun statut problématique'
        ELSE '❌ ' || COUNT(*) || ' statuts problématiques restants'
    END as resultat
FROM temp_problematic_records
WHERE statut_text NOT IN ('En attente', 'Validé', 'Rejeté', 'Annulé');

-- 6. Nettoyer la table temporaire
DROP TABLE temp_problematic_records;

-- Message de confirmation
DO $$
BEGIN
    RAISE NOTICE '✅ Correction des statuts terminée !';
    RAISE NOTICE 'Vérifiez les résultats ci-dessus.';
    RAISE NOTICE 'L''erreur enum devrait maintenant être résolue.';
END $$; 
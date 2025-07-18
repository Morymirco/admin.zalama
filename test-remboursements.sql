-- Script de test pour vérifier la récupération des remboursements
-- Exécuter ce script dans Supabase pour diagnostiquer les problèmes

-- 1. Vérifier la structure de la table remboursements
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'remboursements' 
ORDER BY ordinal_position;

-- 2. Vérifier les types ENUM
SELECT 
    typname as enum_name,
    enumlabel as enum_value
FROM pg_enum e
JOIN pg_type t ON e.enumtypid = t.oid
WHERE t.typname IN ('remboursement_statut', 'methode_remboursement')
ORDER BY t.typname, e.enumsortorder;

-- 3. Compter les remboursements par statut
SELECT 
    statut,
    COUNT(*) as nombre,
    SUM(montant_total_remboursement) as montant_total
FROM remboursements 
GROUP BY statut
ORDER BY statut;

-- 4. Vérifier les remboursements en attente
SELECT 
    id,
    montant_transaction,
    frais_service,
    montant_total_remboursement,
    statut,
    date_creation,
    date_limite_remboursement,
    partenaire_id,
    employe_id,
    transaction_id
FROM remboursements 
WHERE statut = 'EN_ATTENTE'
ORDER BY date_creation DESC
LIMIT 10;

-- 5. Vérifier les remboursements par partenaire
SELECT 
    p.nom as partenaire_nom,
    COUNT(r.id) as nombre_remboursements,
    SUM(r.montant_total_remboursement) as montant_total,
    COUNT(CASE WHEN r.statut = 'EN_ATTENTE' THEN 1 END) as en_attente,
    COUNT(CASE WHEN r.statut = 'PAYE' THEN 1 END) as payes,
    COUNT(CASE WHEN r.statut = 'EN_RETARD' THEN 1 END) as en_retard
FROM remboursements r
LEFT JOIN partners p ON r.partenaire_id = p.id
GROUP BY p.id, p.nom
ORDER BY montant_total DESC;

-- 6. Vérifier les remboursements avec des montants problématiques
SELECT 
    id,
    montant_transaction,
    frais_service,
    montant_total_remboursement,
    CASE 
        WHEN montant_total_remboursement != montant_transaction + frais_service 
        THEN 'INCOHERENT'
        ELSE 'COHERENT'
    END as coherence_montants,
    statut,
    date_creation
FROM remboursements 
WHERE montant_total_remboursement != montant_transaction + frais_service
ORDER BY date_creation DESC;

-- 7. Vérifier les remboursements récents (derniers 7 jours)
SELECT 
    id,
    montant_transaction,
    frais_service,
    montant_total_remboursement,
    statut,
    date_creation,
    partenaire_id,
    employe_id
FROM remboursements 
WHERE date_creation >= CURRENT_DATE - INTERVAL '7 days'
ORDER BY date_creation DESC;

-- 8. Vérifier les contraintes de la table
SELECT 
    constraint_name,
    constraint_type,
    table_name
FROM information_schema.table_constraints 
WHERE table_name = 'remboursements'
ORDER BY constraint_type, constraint_name; 
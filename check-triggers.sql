-- Script pour vérifier les triggers actifs dans la base de données
-- Exécuter ce script dans Supabase pour voir tous les triggers

-- Vérifier tous les triggers dans le schéma public
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement,
    action_timing
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- Vérifier spécifiquement les triggers sur la table transactions
SELECT 
    trigger_name,
    event_manipulation,
    action_statement,
    action_timing
FROM information_schema.triggers 
WHERE trigger_schema = 'public' 
AND event_object_table = 'transactions'
ORDER BY trigger_name;

-- Vérifier les triggers sur la table remboursements
SELECT 
    trigger_name,
    event_manipulation,
    action_statement,
    action_timing
FROM information_schema.triggers 
WHERE trigger_schema = 'public' 
AND event_object_table = 'remboursements'
ORDER BY trigger_name;

-- Vérifier les triggers sur la table salary_advance_requests
SELECT 
    trigger_name,
    event_manipulation,
    action_statement,
    action_timing
FROM information_schema.triggers 
WHERE trigger_schema = 'public' 
AND event_object_table = 'salary_advance_requests'
ORDER BY trigger_name; 
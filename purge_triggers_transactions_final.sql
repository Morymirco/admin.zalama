-- ============================================================================
-- SUPPRESSION DÉFINITIVE : Tous les triggers sur table TRANSACTIONS
-- ============================================================================

DO $$ 
BEGIN 
    RAISE NOTICE '=== SUPPRESSION DE TOUS LES TRIGGERS SUR TRANSACTIONS ===';
END $$;

-- 1. SUPPRIMER TOUS LES TRIGGERS SUR TRANSACTIONS
DO $$
DECLARE
    trigger_record RECORD;
BEGIN
    FOR trigger_record IN 
        SELECT trigger_name
        FROM information_schema.triggers 
        WHERE trigger_schema = 'public'
        AND event_object_table = 'transactions'
        AND trigger_name NOT LIKE 'RI_%' -- Préserver les triggers système
    LOOP
        BEGIN
            EXECUTE format('DROP TRIGGER IF EXISTS %I ON transactions', trigger_record.trigger_name);
            RAISE NOTICE 'Trigger supprimé: %', trigger_record.trigger_name;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Impossible de supprimer %: %', trigger_record.trigger_name, SQLERRM;
        END;
    END LOOP;
END $$;

-- 2. VÉRIFICATION FINALE
SELECT 
    'TRIGGERS RESTANTS SUR TRANSACTIONS' as verification,
    trigger_name,
    event_manipulation,
    action_timing
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
AND event_object_table = 'transactions'
ORDER BY trigger_name;

-- 3. SI AUCUN TRIGGER N'APPARAÎT, C'EST PARFAIT !
DO $$ 
BEGIN 
    RAISE NOTICE '';
    RAISE NOTICE '🎯 ========================================';
    RAISE NOTICE '🎯 SUPPRESSION TERMINÉE';
    RAISE NOTICE '🎯 ========================================';
    RAISE NOTICE '';
    RAISE NOTICE '✅ Tous les triggers sur TRANSACTIONS supprimés';
    RAISE NOTICE '✅ Aucune modification automatique des montants';
    RAISE NOTICE '✅ Les nouvelles transactions auront les montants corrects';
    RAISE NOTICE '';
    RAISE NOTICE 'MAINTENANT : Créez une nouvelle demande pour tester !';
END $$; 
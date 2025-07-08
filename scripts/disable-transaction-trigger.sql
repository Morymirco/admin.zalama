-- Script pour désactiver temporairement le trigger de notification sur transactions
-- Exécutez ce script dans Supabase SQL Editor

-- Supprimer le trigger de notification sur transactions
DROP TRIGGER IF EXISTS trigger_transaction_created ON transactions;

-- Vérifier que le trigger a été supprimé
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table
FROM information_schema.triggers 
WHERE event_object_table = 'transactions' 
AND trigger_name = 'trigger_transaction_created';

-- Message de confirmation
DO $$
BEGIN
    RAISE NOTICE 'Trigger trigger_transaction_created supprimé avec succès de la table transactions';
END $$; 
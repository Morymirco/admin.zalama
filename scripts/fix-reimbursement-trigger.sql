-- =====================================================
-- FIX: Correction du trigger de remboursement intégral
-- =====================================================

-- 1. Supprimer l'ancien trigger
DROP TRIGGER IF EXISTS trigger_creer_remboursement_integral ON transactions;

-- 2. Créer une fonction qui peut être appelée directement
CREATE OR REPLACE FUNCTION creer_remboursement_integral_direct(
    p_transaction_id UUID
) RETURNS VOID AS $$
DECLARE
    transaction_record RECORD;
    remboursement_id UUID;
BEGIN
    -- Récupérer les informations de la transaction
    SELECT * INTO transaction_record 
    FROM transactions 
    WHERE id = p_transaction_id;
    
    -- Vérifier si la transaction existe et est réussie
    IF NOT FOUND THEN
        RAISE NOTICE 'Transaction % non trouvée', p_transaction_id;
        RETURN;
    END IF;
    
    IF transaction_record.statut != 'EFFECTUEE' THEN
        RAISE NOTICE 'Transaction % n''est pas EFFECTUEE (statut: %)', p_transaction_id, transaction_record.statut;
        RETURN;
    END IF;
    
    -- Vérifier si un remboursement existe déjà
    IF EXISTS (SELECT 1 FROM remboursements_integraux WHERE transaction_id = p_transaction_id) THEN
        RAISE NOTICE 'Remboursement déjà existant pour la transaction %', p_transaction_id;
        RETURN;
    END IF;
    
    -- Créer le remboursement
    INSERT INTO remboursements_integraux (
        id,
        transaction_id,
        montant_transaction,
        frais_service,
        montant_total,
        date_creation,
        date_echeance,
        status,
        partenaire_id,
        employe_id,
        description
    ) VALUES (
        gen_random_uuid(),
        p_transaction_id,
        transaction_record.montant,
        COALESCE(transaction_record.frais_service, 0),
        transaction_record.montant + COALESCE(transaction_record.frais_service, 0),
        NOW(),
        NOW() + INTERVAL '30 days',
        'EN_ATTENTE',
        transaction_record.partenaire_id,
        transaction_record.employe_id,
        'Remboursement automatique - Transaction ' || p_transaction_id
    ) RETURNING id INTO remboursement_id;
    
    RAISE NOTICE 'Remboursement créé avec succès: % pour la transaction %', remboursement_id, p_transaction_id;
    
    -- Créer l'entrée dans l'historique
    INSERT INTO historique_remboursements_integraux (
        id,
        remboursement_id,
        action,
        details,
        date_action,
        utilisateur_id
    ) VALUES (
        gen_random_uuid(),
        remboursement_id,
        'CREATION',
        'Remboursement créé automatiquement après transaction réussie',
        NOW(),
        NULL
    );
    
END;
$$ LANGUAGE plpgsql;

-- 3. Créer la fonction trigger (pour les nouveaux triggers)
CREATE OR REPLACE FUNCTION creer_remboursement_integral_automatique() RETURNS TRIGGER AS $$
BEGIN
    -- Appeler la fonction directe
    PERFORM creer_remboursement_integral_direct(NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Recréer le trigger pour INSERT et UPDATE
CREATE TRIGGER trigger_creer_remboursement_integral
    AFTER INSERT OR UPDATE ON transactions
    FOR EACH ROW
    WHEN (NEW.statut = 'EFFECTUEE')
    EXECUTE FUNCTION creer_remboursement_integral_automatique();

-- 5. Fonction pour créer les remboursements manquants
CREATE OR REPLACE FUNCTION creer_remboursements_manquants() RETURNS INTEGER AS $$
DECLARE
    transaction_record RECORD;
    count_created INTEGER := 0;
BEGIN
    -- Parcourir toutes les transactions EFFECTUEE sans remboursement
    FOR transaction_record IN 
        SELECT t.* 
        FROM transactions t
        WHERE t.statut = 'EFFECTUEE'
        AND NOT EXISTS (
            SELECT 1 FROM remboursements_integraux r 
            WHERE r.transaction_id = t.id
        )
    LOOP
        -- Créer le remboursement manquant en utilisant la fonction directe
        PERFORM creer_remboursement_integral_direct(transaction_record.id);
        count_created := count_created + 1;
    END LOOP;
    
    RAISE NOTICE 'Remboursements créés: %', count_created;
    RETURN count_created;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- VÉRIFICATION
-- =====================================================

-- Vérifier que les fonctions sont créées
SELECT 
    proname as function_name,
    prosrc as source
FROM pg_proc 
WHERE proname IN (
    'creer_remboursement_integral_direct',
    'creer_remboursement_integral_automatique',
    'creer_remboursements_manquants'
);

-- Vérifier que le trigger est actif
SELECT 
    tgname as trigger_name,
    tgrelid::regclass as table_name,
    tgtype,
    tgenabled
FROM pg_trigger 
WHERE tgname = 'trigger_creer_remboursement_integral';

-- Afficher un message de confirmation
DO $$
BEGIN
    RAISE NOTICE '✅ Triggers de remboursement corrigés avec succès!';
    RAISE NOTICE '📋 Les remboursements seront maintenant créés automatiquement pour:';
    RAISE NOTICE '   - Nouvelles transactions avec statut EFFECTUEE (INSERT)';
    RAISE NOTICE '   - Transactions mises à jour vers EFFECTUEE (UPDATE)';
END $$; 
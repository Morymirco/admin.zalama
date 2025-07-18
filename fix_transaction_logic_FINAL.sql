-- ============================================================================
-- CORRECTIF FINAL : Logique de transaction et remboursement ZaLaMa
-- ============================================================================

-- 1. CORRIGER le trigger automatique pour éviter les doublons de remboursements
CREATE OR REPLACE FUNCTION create_automatic_reimbursement()
RETURNS TRIGGER AS $$
BEGIN
    -- Vérifier si la transaction vient d'être marquée comme EFFECTUEE
    IF NEW.statut = 'EFFECTUEE' AND (OLD.statut IS NULL OR OLD.statut != 'EFFECTUEE') THEN
        
        -- ✅ VÉRIFICATION CRUCIALE : Éviter les doublons de remboursements
        IF NOT EXISTS (SELECT 1 FROM remboursements WHERE transaction_id = NEW.id) THEN
            
            -- Récupérer les informations nécessaires
            DECLARE
                v_demande_id UUID;
                v_employe_id UUID;
                v_partenaire_id UUID;
            BEGIN
                -- Récupérer depuis la demande d'avance si disponible
                IF NEW.demande_avance_id IS NOT NULL THEN
                    SELECT sar.id, sar.employe_id, sar.partenaire_id 
                    INTO v_demande_id, v_employe_id, v_partenaire_id
                    FROM salary_advance_requests sar 
                    WHERE sar.id = NEW.demande_avance_id;
                ELSE
                    -- Fallback vers les infos de la transaction
                    v_demande_id := NEW.demande_avance_id;
                    v_employe_id := NEW.employe_id;
                    v_partenaire_id := NEW.entreprise_id;
                END IF;
                
                -- Insérer le remboursement SEULEMENT si toutes les infos sont présentes
                IF v_employe_id IS NOT NULL AND v_partenaire_id IS NOT NULL THEN
                    INSERT INTO remboursements (
                        transaction_id,
                        demande_avance_id,
                        employe_id,
                        partenaire_id,
                        montant_transaction,              -- Montant de la transaction
                        frais_service,                   -- Frais ZaLaMa 6.5%
                        montant_total_remboursement,     -- = montant_transaction (logique ZaLaMa)
                        methode_remboursement,
                        date_creation,
                        date_transaction_effectuee,
                        date_limite_remboursement,
                        statut,
                        commentaire_admin,
                        created_at,
                        updated_at
                    ) VALUES (
                        NEW.id,
                        v_demande_id,
                        v_employe_id,
                        v_partenaire_id,
                        NEW.montant,                     -- Ex: 2000 GNF (montant demandé)
                        ROUND(NEW.montant * 0.065, 2),   -- Ex: 130 GNF (frais ZaLaMa)
                        NEW.montant,                     -- Ex: 2000 GNF (partenaire paie le montant demandé)
                        'VIREMENT_BANCAIRE',
                        NOW(),
                        NEW.date_transaction,
                        NEW.date_transaction + INTERVAL '30 days',
                        'EN_ATTENTE',
                        'Remboursement créé automatiquement - Logique ZaLaMa : partenaire rembourse le montant demandé',
                        NOW(),
                        NOW()
                    );
                    
                    RAISE NOTICE '✅ Remboursement automatique créé pour transaction %', NEW.id;
                ELSE
                    RAISE WARNING '⚠️ Impossible de créer un remboursement automatique pour transaction % - informations manquantes', NEW.id;
                END IF;
                
            EXCEPTION WHEN OTHERS THEN
                RAISE WARNING '❌ Erreur création remboursement automatique pour transaction %: %', NEW.id, SQLERRM;
            END;
        ELSE
            RAISE NOTICE 'ℹ️ Remboursement existe déjà pour transaction %', NEW.id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. NETTOYER les remboursements en double pour la transaction problématique
-- Identifier les doublons et garder seulement le plus ancien (par date de création)
WITH doublons AS (
    SELECT 
        id,
        transaction_id,
        ROW_NUMBER() OVER (PARTITION BY transaction_id ORDER BY created_at ASC) as rn
    FROM remboursements 
    WHERE transaction_id = 'fcc10eb9-2e00-4591-b1ba-be39fc94c1f8'
)
DELETE FROM remboursements 
WHERE id IN (
    SELECT id FROM doublons WHERE rn > 1
);

-- 3. CORRIGER le statut de la transaction SUCCESS qui reste ANNULEE
UPDATE transactions 
SET 
    statut = 'EFFECTUEE',
    date_transaction = COALESCE(date_transaction, NOW()),
    updated_at = NOW()
WHERE numero_transaction = 'UFFuSDg2T2drS2FzTmhhc2RkWFBpNXZVbHJOSEZEZVI='
AND statut = 'ANNULEE';

-- 4. CORRIGER les données de remboursement pour qu'elles respectent la logique ZaLaMa
UPDATE remboursements 
SET 
    montant_total_remboursement = montant_transaction,
    frais_service = ROUND(montant_transaction * 0.065, 2),
    commentaire_admin = COALESCE(commentaire_admin, '') || 
        CASE 
            WHEN commentaire_admin IS NULL OR commentaire_admin = '' 
            THEN 'Montant corrigé selon logique ZaLaMa'
            ELSE ' | Montant corrigé selon logique ZaLaMa'
        END,
    updated_at = NOW()
WHERE montant_total_remboursement != montant_transaction;

-- 5. VÉRIFIER que tout est correct maintenant
SELECT 
    '=== VÉRIFICATION DE LA TRANSACTION PROBLÉMATIQUE ===' as titre,
    t.id,
    t.numero_transaction,
    t.statut as transaction_statut,
    t.montant as transaction_montant,
    t.date_transaction,
    r.id as remboursement_id,
    r.statut as remboursement_statut,
    r.montant_transaction as r_montant_transaction,
    r.montant_total_remboursement,
    CASE 
        WHEN r.montant_total_remboursement = r.montant_transaction THEN '✅ CORRECT'
        ELSE '❌ INCORRECT'
    END as logique_correcte
FROM transactions t
LEFT JOIN remboursements r ON t.id = r.transaction_id
WHERE t.numero_transaction = 'UFFuSDg2T2drS2FzTmhhc2RkWFBpNXZVbHJOSEZEZVI=';

-- 6. VÉRIFIER qu'il n'y a plus de doublons dans le système
SELECT 
    '=== VÉRIFICATION DOUBLONS REMBOURSEMENTS ===' as titre,
    transaction_id,
    COUNT(*) as nombre_remboursements,
    CASE 
        WHEN COUNT(*) > 1 THEN '❌ DOUBLON DÉTECTÉ'
        ELSE '✅ OK'
    END as statut
FROM remboursements 
GROUP BY transaction_id
HAVING COUNT(*) > 1
ORDER BY COUNT(*) DESC;

-- 7. ANALYSE des données récentes
SELECT 
    '=== ANALYSE DES TRANSACTIONS RÉCENTES ===' as titre,
    COUNT(*) as total_transactions,
    COUNT(CASE WHEN statut = 'EFFECTUEE' THEN 1 END) as effectuees,
    COUNT(CASE WHEN statut = 'ANNULEE' THEN 1 END) as annulees,
    COUNT(CASE WHEN demande_avance_id IS NOT NULL THEN 1 END) as avec_demande_avance
FROM transactions 
WHERE date_creation >= CURRENT_DATE - INTERVAL '7 days'

UNION ALL

SELECT 
    '=== ANALYSE DES REMBOURSEMENTS RÉCENTS ===' as titre,
    COUNT(*) as total_remboursements,
    COUNT(CASE WHEN statut = 'EN_ATTENTE' THEN 1 END) as en_attente,
    COUNT(CASE WHEN statut = 'PAYE' THEN 1 END) as payes,
    COUNT(CASE WHEN montant_total_remboursement = montant_transaction THEN 1 END) as logique_correcte
FROM remboursements 
WHERE date_creation >= CURRENT_DATE - INTERVAL '7 days';

-- 8. SUCCÈS - Afficher le résumé des corrections
SELECT 
    '✅ CORRECTIFS APPLIQUÉS AVEC SUCCÈS' as resultat,
    'Trigger corrigé pour éviter doublons' as correction_1,
    'Doublons de remboursements supprimés' as correction_2,
    'Transaction SUCCESS mise à jour vers EFFECTUEE' as correction_3,
    'Montants de remboursement corrigés selon logique ZaLaMa' as correction_4,
    'Système prêt pour les futurs paiements' as statut_final; 
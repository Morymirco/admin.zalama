-- Migration pour mettre à jour la table transactions pour le système de paiement LengoPay
-- Ajout des champs manquants

-- 1. Ajouter le champ description
ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS description text;

-- 2. Ajouter le champ message_callback pour les messages de LengoPay
ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS message_callback text;

-- 3. S'assurer que le champ updated_at est bien configuré
-- (il existe déjà mais on s'assure qu'il est correctement configuré)
ALTER TABLE public.transactions 
ALTER COLUMN updated_at SET DEFAULT now();

-- 4. Créer un trigger pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Supprimer le trigger s'il existe déjà
DROP TRIGGER IF EXISTS update_transactions_updated_at ON public.transactions;

-- Créer le trigger pour la table transactions
CREATE TRIGGER update_transactions_updated_at
    BEFORE UPDATE ON public.transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 5. Mettre à jour les contraintes pour permettre les valeurs NULL pour certains champs
-- (car les paiements LengoPay peuvent ne pas avoir d'employé ou de demande d'avance)
ALTER TABLE public.transactions 
ALTER COLUMN employe_id DROP NOT NULL;

ALTER TABLE public.transactions 
ALTER COLUMN demande_avance_id DROP NOT NULL;

-- 6. Ajouter des commentaires pour documenter les champs
COMMENT ON COLUMN public.transactions.description IS 'Description du paiement (ex: "Paiement LengoPay")';
COMMENT ON COLUMN public.transactions.message_callback IS 'Message de callback reçu de LengoPay';
COMMENT ON COLUMN public.transactions.numero_transaction IS 'ID unique du paiement (pay_id de LengoPay)';
COMMENT ON COLUMN public.transactions.numero_compte IS 'Numéro de téléphone du destinataire';
COMMENT ON COLUMN public.transactions.numero_reception IS 'Numéro de téléphone qui a reçu le paiement (callback)';

-- 7. Créer un index sur numero_transaction pour les recherches rapides
CREATE INDEX IF NOT EXISTS idx_transactions_numero_transaction 
ON public.transactions(numero_transaction);

-- 8. Créer un index sur statut pour filtrer les transactions
CREATE INDEX IF NOT EXISTS idx_transactions_statut 
ON public.transactions(statut);

-- 9. Créer un index sur date_creation pour les requêtes temporelles
CREATE INDEX IF NOT EXISTS idx_transactions_date_creation 
ON public.transactions(date_creation);

-- 10. Vérifier que la table est bien configurée
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'transactions' 
AND table_schema = 'public'
ORDER BY ordinal_position; 
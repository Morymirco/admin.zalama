-- =====================================================
-- AJOUT DE LENGO_PAY À L'ENUM METHODE_REMBOURSEMENT
-- =====================================================

-- Vérifier si LENGO_PAY existe déjà dans l'enum
DO $$
BEGIN
    -- Ajouter LENGO_PAY à l'enum s'il n'existe pas déjà
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'LENGO_PAY' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'methode_remboursement')
    ) THEN
        ALTER TYPE methode_remboursement ADD VALUE 'LENGO_PAY';
        RAISE NOTICE 'LENGO_PAY ajouté à l''enum methode_remboursement';
    ELSE
        RAISE NOTICE 'LENGO_PAY existe déjà dans l''enum methode_remboursement';
    END IF;
END $$;

-- Vérifier les valeurs actuelles de l'enum
SELECT enumlabel as methode_remboursement
FROM pg_enum 
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'methode_remboursement')
ORDER BY enumsortorder; 
-- =====================================================
-- SCRIPT DE CRÉATION DE L'ADMIN PAR DÉFAUT
-- =====================================================

-- Note: Ce script crée l'admin dans la table users
-- Pour l'authentification, vous devez aussi créer l'utilisateur dans Supabase Auth
-- via l'interface web ou le script Node.js

-- Vérifier si l'admin existe déjà
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM users WHERE email = 'admin@zalama.com') THEN
        RAISE NOTICE 'L''admin existe déjà dans la table users';
        
        -- Mettre à jour l'admin existant
        UPDATE users 
        SET 
            nom = 'Admin',
            prenom = 'ZaLaMa',
            type = 'Entreprise',
            statut = 'Actif',
            organisation = 'ZaLaMa Admin',
            actif = true,
            updated_at = NOW()
        WHERE email = 'admin@zalama.com';
        
        RAISE NOTICE 'Admin mis à jour avec succès';
    ELSE
        -- Créer l'admin
        INSERT INTO users (
            email,
            password_hash,
            nom,
            prenom,
            type,
            statut,
            organisation,
            actif,
            date_inscription
        ) VALUES (
            'admin@zalama.com',
            'hashed_password_placeholder', -- Placeholder car Auth gère le mot de passe
            'Admin',
            'ZaLaMa',
            'Entreprise',
            'Actif',
            'ZaLaMa Admin',
            true,
            NOW()
        );
        
        RAISE NOTICE 'Admin créé avec succès';
    END IF;
END $$;

-- Afficher les informations de l'admin
SELECT 
    id,
    email,
    nom,
    prenom,
    type,
    statut,
    organisation,
    actif,
    date_inscription
FROM users 
WHERE email = 'admin@zalama.com'; 
-- Script de correction de la structure de la base de données
-- Pour le système de remboursement intégral ZaLaMa

-- 1. Créer les tables manquantes pour le système de remboursement intégral

-- Table des remboursements intégraux
CREATE TABLE IF NOT EXISTS public.remboursements_integraux (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  transaction_id uuid NOT NULL UNIQUE,
  demande_avance_id uuid NOT NULL,
  employe_id uuid NOT NULL,
  entreprise_id uuid NOT NULL,
  montant_transaction numeric NOT NULL,
  frais_service numeric DEFAULT 0,
  montant_total_remboursement numeric NOT NULL,
  date_creation timestamp with time zone DEFAULT now(),
  date_transaction_effectuee timestamp with time zone NOT NULL,
  date_limite_remboursement timestamp with time zone NOT NULL,
  date_remboursement_effectue timestamp with time zone,
  statut character varying DEFAULT 'EN_ATTENTE' CHECK (statut IN ('EN_ATTENTE', 'PAYE', 'EN_RETARD', 'ANNULE')),
  numero_compte character varying,
  numero_reception character varying,
  reference_paiement character varying,
  numero_transaction_remboursement character varying,
  commentaire_entreprise text,
  commentaire_admin text,
  motif_retard text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT remboursements_integraux_pkey PRIMARY KEY (id),
  CONSTRAINT remboursements_integraux_transaction_id_fkey FOREIGN KEY (transaction_id) REFERENCES public.transactions(id) ON DELETE CASCADE,
  CONSTRAINT remboursements_integraux_demande_avance_id_fkey FOREIGN KEY (demande_avance_id) REFERENCES public.salary_advance_requests(id) ON DELETE CASCADE,
  CONSTRAINT remboursements_integraux_employe_id_fkey FOREIGN KEY (employe_id) REFERENCES public.employees(id) ON DELETE CASCADE,
  CONSTRAINT remboursements_integraux_entreprise_id_fkey FOREIGN KEY (entreprise_id) REFERENCES public.partners(id) ON DELETE CASCADE
);

-- Table d'historique des remboursements intégraux
CREATE TABLE IF NOT EXISTS public.historique_remboursements_integraux (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  remboursement_id uuid NOT NULL,
  action character varying NOT NULL,
  montant_avant numeric,
  montant_apres numeric,
  statut_avant character varying,
  statut_apres character varying,
  description text NOT NULL,
  utilisateur_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT historique_remboursements_integraux_pkey PRIMARY KEY (id),
  CONSTRAINT historique_remboursements_integraux_remboursement_id_fkey FOREIGN KEY (remboursement_id) REFERENCES public.remboursements_integraux(id) ON DELETE CASCADE,
  CONSTRAINT historique_remboursements_integraux_utilisateur_id_fkey FOREIGN KEY (utilisateur_id) REFERENCES public.admin_users(id) ON DELETE SET NULL
);

-- 2. Créer les index pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_remboursements_integraux_transaction_id ON public.remboursements_integraux(transaction_id);
CREATE INDEX IF NOT EXISTS idx_remboursements_integraux_entreprise_id ON public.remboursements_integraux(entreprise_id);
CREATE INDEX IF NOT EXISTS idx_remboursements_integraux_statut ON public.remboursements_integraux(statut);
CREATE INDEX IF NOT EXISTS idx_remboursements_integraux_date_limite ON public.remboursements_integraux(date_limite_remboursement);
CREATE INDEX IF NOT EXISTS idx_historique_remboursements_integraux_remboursement_id ON public.historique_remboursements_integraux(remboursement_id);

-- 3. Créer la vue pour les remboursements avec informations complètes
CREATE OR REPLACE VIEW public.vue_remboursements_integraux AS
SELECT 
  r.id,
  r.transaction_id,
  r.demande_avance_id,
  r.employe_id,
  r.entreprise_id,
  r.montant_transaction,
  r.frais_service,
  r.montant_total_remboursement,
  r.date_creation,
  r.date_transaction_effectuee,
  r.date_limite_remboursement,
  r.date_remboursement_effectue,
  r.statut,
  r.numero_compte,
  r.numero_reception,
  r.reference_paiement,
  r.numero_transaction_remboursement,
  r.commentaire_entreprise,
  r.commentaire_admin,
  r.motif_retard,
  r.created_at,
  r.updated_at,
  -- Informations de la transaction
  t.numero_transaction,
  t.methode_paiement,
  t.recu_url,
  -- Informations de la demande d'avance
  sar.motif,
  sar.type_motif,
  -- Informations de l'employé
  e.nom as nom_employe,
  e.prenom as prenom_employe,
  e.email as email_employe,
  e.telephone as telephone_employe,
  -- Informations de l'entreprise
  p.nom as nom_entreprise,
  p.email as email_entreprise,
  p.telephone as telephone_entreprise,
  -- Calculs
  CASE 
    WHEN r.statut = 'EN_ATTENTE' AND r.date_limite_remboursement < now() THEN 'EN_RETARD'
    ELSE r.statut
  END as statut_calcule,
  CASE 
    WHEN r.date_limite_remboursement < now() THEN 
      EXTRACT(DAY FROM (now() - r.date_limite_remboursement))
    ELSE 0
  END as jours_retard
FROM public.remboursements_integraux r
LEFT JOIN public.transactions t ON r.transaction_id = t.id
LEFT JOIN public.salary_advance_requests sar ON r.demande_avance_id = sar.id
LEFT JOIN public.employees e ON r.employe_id = e.id
LEFT JOIN public.partners p ON r.entreprise_id = p.id;

-- 4. Créer la fonction pour créer automatiquement un remboursement
CREATE OR REPLACE FUNCTION public.creer_remboursement_integral()
RETURNS TRIGGER AS $$
BEGIN
  -- Vérifier si la transaction est réussie et qu'aucun remboursement n'existe déjà
  IF NEW.statut = 'EFFECTUEE' AND NOT EXISTS (
    SELECT 1 FROM public.remboursements_integraux WHERE transaction_id = NEW.id
  ) THEN
    -- Insérer le remboursement
    INSERT INTO public.remboursements_integraux (
      transaction_id,
      demande_avance_id,
      employe_id,
      entreprise_id,
      montant_transaction,
      frais_service,
      montant_total_remboursement,
      date_transaction_effectuee,
      date_limite_remboursement
    )
    SELECT 
      NEW.id,
      NEW.demande_avance_id,
      NEW.employe_id,
      NEW.entreprise_id,
      NEW.montant,
      COALESCE(sar.frais_service, 0),
      NEW.montant + COALESCE(sar.frais_service, 0),
      NEW.date_transaction,
      NEW.date_transaction + INTERVAL '30 days'
    FROM public.salary_advance_requests sar
    WHERE sar.id = NEW.demande_avance_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Créer la fonction pour l'historique
CREATE OR REPLACE FUNCTION public.ajouter_historique_remboursement_integral()
RETURNS TRIGGER AS $$
BEGIN
  -- Ajouter une entrée dans l'historique si le statut a changé
  IF OLD.statut IS DISTINCT FROM NEW.statut THEN
    INSERT INTO public.historique_remboursements_integraux (
      remboursement_id,
      action,
      statut_avant,
      statut_apres,
      description
    )
    VALUES (
      NEW.id,
      'CHANGEMENT_STATUT',
      OLD.statut,
      NEW.statut,
      'Changement de statut de ' || COALESCE(OLD.statut, 'NULL') || ' vers ' || NEW.statut
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Créer les triggers
DROP TRIGGER IF EXISTS trigger_creer_remboursement_integral ON public.transactions;
CREATE TRIGGER trigger_creer_remboursement_integral
  AFTER INSERT OR UPDATE ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.creer_remboursement_integral();

DROP TRIGGER IF EXISTS trigger_historique_remboursement_integral ON public.remboursements_integraux;
CREATE TRIGGER trigger_historique_remboursement_integral
  AFTER UPDATE ON public.remboursements_integraux
  FOR EACH ROW
  EXECUTE FUNCTION public.ajouter_historique_remboursement_integral();

-- 7. Créer la fonction pour mettre à jour les statuts en retard
CREATE OR REPLACE FUNCTION public.mettre_a_jour_statuts_retard()
RETURNS void AS $$
BEGIN
  UPDATE public.remboursements_integraux
  SET 
    statut = 'EN_RETARD',
    updated_at = now()
  WHERE 
    statut = 'EN_ATTENTE' 
    AND date_limite_remboursement < now();
END;
$$ LANGUAGE plpgsql;

-- 8. Créer la fonction pour créer les remboursements manquants
CREATE OR REPLACE FUNCTION public.creer_remboursements_manquants()
RETURNS integer AS $$
DECLARE
  nb_crees integer := 0;
BEGIN
  INSERT INTO public.remboursements_integraux (
    transaction_id,
    demande_avance_id,
    employe_id,
    entreprise_id,
    montant_transaction,
    frais_service,
    montant_total_remboursement,
    date_transaction_effectuee,
    date_limite_remboursement
  )
  SELECT 
    t.id,
    t.demande_avance_id,
    t.employe_id,
    t.entreprise_id,
    t.montant,
    COALESCE(sar.frais_service, 0),
    t.montant + COALESCE(sar.frais_service, 0),
    t.date_transaction,
    t.date_transaction + INTERVAL '30 days'
  FROM public.transactions t
  LEFT JOIN public.salary_advance_requests sar ON t.demande_avance_id = sar.id
  WHERE 
    t.statut = 'EFFECTUEE'
    AND NOT EXISTS (
      SELECT 1 FROM public.remboursements_integraux ri WHERE ri.transaction_id = t.id
    );
  
  GET DIAGNOSTICS nb_crees = ROW_COUNT;
  RETURN nb_crees;
END;
$$ LANGUAGE plpgsql;

-- 9. Appliquer les politiques RLS (Row Level Security)
ALTER TABLE public.remboursements_integraux ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.historique_remboursements_integraux ENABLE ROW LEVEL SECURITY;

-- Politique pour les remboursements intégraux
CREATE POLICY "Les administrateurs peuvent voir tous les remboursements" ON public.remboursements_integraux
  FOR ALL USING (true);

-- Politique pour l'historique
CREATE POLICY "Les administrateurs peuvent voir tout l'historique" ON public.historique_remboursements_integraux
  FOR ALL USING (true);

-- 10. Créer un commentaire sur la table
COMMENT ON TABLE public.remboursements_integraux IS 'Système de remboursement intégral pour les avances de salaire - Un remboursement par transaction réussie';
COMMENT ON TABLE public.historique_remboursements_integraux IS 'Historique des actions sur les remboursements intégraux';

-- 11. Exécuter la mise à jour des statuts en retard
SELECT public.mettre_a_jour_statuts_retard();

-- 12. Créer les remboursements manquants pour les transactions existantes
SELECT public.creer_remboursements_manquants() as remboursements_crees;

-- Message de confirmation
DO $$
BEGIN
  RAISE NOTICE 'Structure de base de données corrigée avec succès!';
  RAISE NOTICE 'Tables remboursements_integraux et historique_remboursements_integraux créées.';
  RAISE NOTICE 'Triggers et fonctions configurés pour l''automatisation.';
END $$; 
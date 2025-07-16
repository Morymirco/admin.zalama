import {
  CreateRemboursementResponse,
  EcheanceFormData,
  EcheanceRemboursement,
  FiltresRemboursement,
  OptionsTriRemboursement,
  PaiementEcheanceData,
  PaiementEcheanceResponse,
  PaiementLengoResponse,
  Remboursement,
  RemboursementFormData,
  StatistiquesRemboursementGlobales,
  StatistiquesRemboursementPartenaire,
  TransactionsSansRemboursementResponse
} from '@/types/reimbursement';
import { createClient } from '@supabase/supabase-js';

// Configuration Supabase
const supabaseUrl = 'https://mspmrzlqhwpdkkburjiw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zcG1yemxxaHdwZGtrYnVyaml3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3ODcyNTgsImV4cCI6MjA2NjM2MzI1OH0.zr-TRpKjGJjW0nRtsyPcCLy4Us-c5tOGX71k5_3JJd0';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Fonction utilitaire pour convertir les données de la DB vers l'interface
const convertRemboursementFromDB = (dbRemboursement: any): Remboursement => {
  // Convertir les montants en nombres
  const montantTransaction = parseFloat(dbRemboursement.montant_transaction) || 0;
  const fraisService = parseFloat(dbRemboursement.frais_service) || 0;
  const montantTotal = parseFloat(dbRemboursement.montant_total_remboursement) || 0;
  
  // Convertir les dates
  const dateCreation = dbRemboursement.date_creation || null;
  const dateTransaction = dbRemboursement.date_transaction_effectuee || null;
  const dateLimite = dbRemboursement.date_limite_remboursement || null;
  const dateRemboursement = dbRemboursement.date_remboursement_effectue || null;
  
  return {
    id: dbRemboursement.id,
    transaction_id: dbRemboursement.transaction_id,
    demande_avance_id: dbRemboursement.demande_avance_id,
    employe_id: dbRemboursement.employe_id,
    partenaire_id: dbRemboursement.partenaire_id,
    montant_transaction: montantTransaction,
    frais_service: fraisService,
    montant_total_remboursement: montantTotal,
    methode_remboursement: dbRemboursement.methode_remboursement || 'VIREMENT_BANCAIRE',
    date_creation: dateCreation,
    date_transaction_effectuee: dateTransaction,
    date_limite_remboursement: dateLimite,
    date_remboursement_effectue: dateRemboursement,
    statut: dbRemboursement.statut,
    numero_compte: dbRemboursement.numero_compte,
    numero_reception: dbRemboursement.numero_reception,
    reference_paiement: dbRemboursement.reference_paiement,
    numero_transaction_remboursement: dbRemboursement.numero_transaction_remboursement,
    commentaire_partenaire: dbRemboursement.commentaire_partenaire,
    commentaire_admin: dbRemboursement.commentaire_admin,
    motif_retard: dbRemboursement.motif_retard,
    created_at: dbRemboursement.created_at ? new Date(dbRemboursement.created_at) : null,
    updated_at: dbRemboursement.updated_at ? new Date(dbRemboursement.updated_at) : null,
    employe: dbRemboursement.nom_employe ? {
      id: dbRemboursement.employe_id,
      nom: dbRemboursement.nom_employe,
      prenom: dbRemboursement.prenom_employe,
      email: dbRemboursement.email_employe,
      telephone: dbRemboursement.telephone_employe
    } : undefined,
    partenaire: dbRemboursement.nom_entreprise ? {
      id: dbRemboursement.partenaire_id,
      nom: dbRemboursement.nom_entreprise,
      email: dbRemboursement.email_entreprise,
      email_rh: dbRemboursement.email_rh,
      telephone: dbRemboursement.telephone_entreprise
    } : undefined,
    demande_avance: dbRemboursement.motif ? {
      id: dbRemboursement.demande_avance_id,
      montant_demande: montantTransaction,
      motif: dbRemboursement.motif,
      date_creation: dateCreation
    } : undefined,
    transaction: dbRemboursement.numero_transaction ? {
      id: dbRemboursement.transaction_id,
      numero_transaction: dbRemboursement.numero_transaction,
      methode_paiement: dbRemboursement.methode_paiement,
      date_transaction: dateTransaction,
      statut: dbRemboursement.statut
    } : undefined,
    jours_retard: parseInt(dbRemboursement.jours_retard) || 0
  };
};

// Fonction utilitaire pour convertir les échéances
const convertEcheanceFromDB = (dbEcheance: any): EcheanceRemboursement => {
  return {
    id: dbEcheance.id,
    remboursement_id: dbEcheance.remboursement_id,
    numero_echeance: dbEcheance.numero_echeance,
    montant_echeance: dbEcheance.montant_echeance || 0,
    montant_paye: dbEcheance.montant_paye || 0,
    date_echeance: dbEcheance.date_echeance,
    date_paiement: dbEcheance.date_paiement,
    statut: dbEcheance.statut,
    methode_paiement: dbEcheance.methode_paiement,
    numero_transaction: dbEcheance.numero_transaction,
    numero_reception: dbEcheance.numero_reception,
    commentaire: dbEcheance.commentaire,
    created_at: dbEcheance.created_at,
    updated_at: dbEcheance.updated_at,
    remboursement: dbEcheance.remboursement
  };
};

class ReimbursementService {
  // =====================================================
  // GESTION DES REMBOURSEMENTS
  // =====================================================

  // Récupérer tous les remboursements avec relations
  async getAll(): Promise<Remboursement[]> {
    try {
      const response = await fetch('/api/remboursements');
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des remboursements');
      }
      
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Erreur lors de la récupération des remboursements');
      }
      
      return (result.data || []).map(convertRemboursementFromDB);
    } catch (error) {
      console.error('Erreur lors de la récupération des remboursements:', error);
      throw error;
    }
  }

  // Récupérer un remboursement par ID
  async getById(id: string): Promise<Remboursement | null> {
    try {
      const { data, error } = await supabase
        .from('remboursements')
        .select(`
          *,
          employe:employees(nom, prenom, email, telephone),
          partenaire:partners(nom, email, email_rh, telephone),
          demande_avance:salary_advance_requests(id, montant_demande, motif, date_creation),
          transaction:transactions(id, numero_transaction, methode_paiement, date_transaction, statut),
          echeances:echeances_remboursement(*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data ? convertRemboursementFromDB(data) : null;
    } catch (error) {
      console.error('Erreur lors de la récupération du remboursement:', error);
      throw error;
    }
  }

  // Récupérer les remboursements par partenaire
  async getByPartner(partenaireId: string): Promise<Remboursement[]> {
    try {
      const response = await fetch(`/api/remboursements?partenaire_id=${partenaireId}`);
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des remboursements du partenaire');
      }
      
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Erreur lors de la récupération des remboursements du partenaire');
      }
      
      return (result.data || []).map(convertRemboursementFromDB);
    } catch (error) {
      console.error('Erreur lors de la récupération des remboursements du partenaire:', error);
      throw error;
    }
  }

  // Récupérer les remboursements avec filtres
  async getWithFilters(filtres: FiltresRemboursement, tri?: OptionsTriRemboursement): Promise<Remboursement[]> {
    try {
      let query = supabase
        .from('remboursements')
        .select(`
          *,
          employe:employees(nom, prenom, email, telephone),
          partenaire:partners(nom, email, email_rh, telephone),
          demande_avance:salary_advance_requests(id, montant_demande, motif, date_creation),
          transaction:transactions(id, numero_transaction, methode_paiement, date_transaction, statut),
          echeances:echeances_remboursement(*)
        `);

      // Appliquer les filtres
      if (filtres.partenaire_id) {
        query = query.eq('partenaire_id', filtres.partenaire_id);
      }
      if (filtres.employe_id) {
        query = query.eq('employe_id', filtres.employe_id);
      }
      if (filtres.statut) {
        query = query.eq('statut', filtres.statut);
      }
      if (filtres.methode_remboursement) {
        query = query.eq('methode_remboursement', filtres.methode_remboursement);
      }
      if (filtres.transaction_id) {
        query = query.eq('transaction_id', filtres.transaction_id);
      }
      if (filtres.date_debut) {
        query = query.gte('date_creation', filtres.date_debut);
      }
      if (filtres.date_fin) {
        query = query.lte('date_creation', filtres.date_fin);
      }
      if (filtres.montant_min) {
        query = query.gte('montant_transaction', filtres.montant_min);
      }
      if (filtres.montant_max) {
        query = query.lte('montant_transaction', filtres.montant_max);
      }
      if (filtres.recherche) {
        query = query.or(`employe.nom.ilike.%${filtres.recherche}%,employe.prenom.ilike.%${filtres.recherche}%,partenaire.nom.ilike.%${filtres.recherche}%`);
      }

      // Appliquer le tri
      if (tri) {
        query = query.order(tri.champ, { ascending: tri.ordre === 'asc' });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []).map(convertRemboursementFromDB);
    } catch (error) {
      console.error('Erreur lors de la récupération des remboursements avec filtres:', error);
      throw error;
    }
  }

  // Créer un remboursement manuellement
  async create(remboursementData: RemboursementFormData): Promise<CreateRemboursementResponse> {
    try {
      console.log('🚀 Création de remboursement:', remboursementData);

      // Vérifier que la transaction existe et est EFFECTUEE
      const { data: transaction, error: transactionError } = await supabase
        .from('transactions')
        .select('*')
        .eq('id', remboursementData.transaction_id)
        .eq('statut', 'EFFECTUEE')
        .single();

      if (transactionError || !transaction) {
        throw new Error('Transaction non trouvée ou non effectuée');
      }

      // Vérifier qu'il n'y a pas déjà un remboursement pour cette transaction
      const { data: existingRemboursement } = await supabase
        .from('remboursements')
        .select('id')
        .eq('transaction_id', remboursementData.transaction_id)
        .single();

      if (existingRemboursement) {
        throw new Error('Un remboursement existe déjà pour cette transaction');
      }

      // Préparer les données pour l'insertion
      const insertData = {
        transaction_id: remboursementData.transaction_id,
        demande_avance_id: remboursementData.demande_avance_id,
        employe_id: remboursementData.employe_id,
        partenaire_id: remboursementData.partenaire_id,
        montant_transaction: remboursementData.montant_transaction,
        montant_restant: remboursementData.montant_transaction + remboursementData.frais_service,
        frais_service: remboursementData.frais_service,
        methode_remboursement: remboursementData.methode_remboursement,
        date_transaction_effectuee: transaction.date_transaction,
        plan_remboursement: remboursementData.plan_remboursement,
        commentaire_partenaire: remboursementData.commentaire_partenaire,
        statut: 'EN_ATTENTE'
      };

      const { data, error } = await supabase
        .from('remboursements')
        .insert([insertData])
        .select(`
          *,
          employe:employees(nom, prenom, email, telephone),
          partenaire:partners(nom, email, email_rh, telephone),
          demande_avance:salary_advance_requests(id, montant_demande, motif, date_creation),
          transaction:transactions(id, numero_transaction, methode_paiement, date_transaction, statut)
        `)
        .single();

      if (error) throw error;

      const remboursement = convertRemboursementFromDB(data);

      // Créer les échéances si un plan est fourni
      let echeances: EcheanceRemboursement[] = [];
      if (remboursementData.plan_remboursement) {
        echeances = await this.createEcheancesFromPlan(remboursement.id, remboursementData.plan_remboursement);
      }

      return {
        remboursement,
        echeances,
        message: 'Remboursement créé avec succès'
      };
    } catch (error) {
      console.error('Erreur lors de la création du remboursement:', error);
      throw error;
    }
  }

  // Mettre à jour un remboursement
  async update(id: string, updateData: Partial<Remboursement>): Promise<Remboursement> {
    try {
      const { data, error } = await supabase
        .from('remboursements')
        .update({
          ...updateData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select(`
          *,
          employe:employees(nom, prenom, email, telephone),
          partenaire:partners(nom, email, email_rh, telephone),
          demande_avance:salary_advance_requests(id, montant_demande, motif, date_creation),
          transaction:transactions(id, numero_transaction, methode_paiement, date_transaction, statut),
          echeances:echeances_remboursement(*)
        `)
        .single();

      if (error) throw error;
      return convertRemboursementFromDB(data);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du remboursement:', error);
      throw error;
    }
  }

  // =====================================================
  // GESTION DES ÉCHÉANCES
  // =====================================================

  // Récupérer les échéances d'un remboursement
  async getEcheances(remboursementId: string): Promise<EcheanceRemboursement[]> {
    try {
      const { data, error } = await supabase
        .from('echeances_remboursement')
        .select('*')
        .eq('remboursement_id', remboursementId)
        .order('numero_echeance', { ascending: true });

      if (error) throw error;
      return (data || []).map(convertEcheanceFromDB);
    } catch (error) {
      console.error('Erreur lors de la récupération des échéances:', error);
      throw error;
    }
  }

  // Créer une échéance
  async createEcheance(echeanceData: EcheanceFormData): Promise<EcheanceRemboursement> {
    try {
      const { data, error } = await supabase
        .from('echeances_remboursement')
        .insert([echeanceData])
        .select()
        .single();

      if (error) throw error;
      return convertEcheanceFromDB(data);
    } catch (error) {
      console.error('Erreur lors de la création de l\'échéance:', error);
      throw error;
    }
  }

  // Créer les échéances à partir d'un plan
  async createEcheancesFromPlan(remboursementId: string, plan: any): Promise<EcheanceRemboursement[]> {
    try {
      const echeances: EcheanceFormData[] = [];
      const { nombre_echeances, montant_echeance, date_debut } = plan;
      
      for (let i = 1; i <= nombre_echeances; i++) {
        const dateEcheance = new Date(date_debut);
        dateEcheance.setMonth(dateEcheance.getMonth() + i - 1);
        
        echeances.push({
          remboursement_id: remboursementId,
          numero_echeance: i,
          montant_echeance,
          date_echeance: dateEcheance.toISOString(),
          statut: 'EN_ATTENTE'
        });
      }

      const { data, error } = await supabase
        .from('echeances_remboursement')
        .insert(echeances)
        .select();

      if (error) throw error;
      return (data || []).map(convertEcheanceFromDB);
    } catch (error) {
      console.error('Erreur lors de la création des échéances:', error);
      throw error;
    }
  }

  // Effectuer un paiement d'échéance
  async effectuerPaiementEcheance(paiementData: PaiementEcheanceData): Promise<PaiementEcheanceResponse> {
    try {
      // Appeler la fonction PostgreSQL pour effectuer le paiement
      const { data, error } = await supabase.rpc('effectuer_paiement_echeance', {
        p_echeance_id: paiementData.echeance_id,
        p_montant_paye: paiementData.montant_paye,
        p_methode_paiement: paiementData.methode_paiement,
        p_numero_transaction: paiementData.numero_transaction,
        p_numero_reception: paiementData.numero_reception,
        p_commentaire: paiementData.commentaire,
        p_utilisateur_id: null // À remplacer par l'ID de l'utilisateur connecté
      });

      if (error) throw error;

      // Récupérer les données mises à jour
      const echeance = await this.getEcheanceById(paiementData.echeance_id);
      const remboursement = await this.getById(echeance.remboursement_id);

      return {
        echeance,
        remboursement,
        montant_restant: remboursement.montant_restant,
        message: 'Paiement effectué avec succès'
      };
    } catch (error) {
      console.error('Erreur lors du paiement de l\'échéance:', error);
      throw error;
    }
  }

  // Récupérer une échéance par ID
  async getEcheanceById(id: string): Promise<EcheanceRemboursement> {
    try {
      const { data, error } = await supabase
        .from('echeances_remboursement')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return convertEcheanceFromDB(data);
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'échéance:', error);
      throw error;
    }
  }

  // =====================================================
  // TRANSACTIONS SANS REMBOURSEMENT
  // =====================================================

  // Récupérer les transactions réussies sans remboursement
  async getTransactionsSansRemboursement(): Promise<TransactionsSansRemboursementResponse> {
    try {
      const { data, error } = await supabase
        .from('transactions_sans_remboursement')
        .select('*')
        .order('date_transaction', { ascending: false });

      if (error) throw error;

      return {
        transactions: data || [],
        total: data?.length || 0,
        message: 'Transactions sans remboursement récupérées'
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des transactions sans remboursement:', error);
      throw error;
    }
  }

  // =====================================================
  // STATISTIQUES
  // =====================================================

  // Récupérer les statistiques globales
  async getStatistiquesGlobales(): Promise<StatistiquesRemboursementGlobales> {
    try {
      const response = await fetch('/api/remboursements/statistiques');
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des statistiques');
      }
      
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Erreur lors de la récupération des statistiques');
      }
      
      // Adapter le format de réponse pour correspondre à l'interface
      const globales = result.data.globales;
      return {
        total_remboursements: globales.total_remboursements,
        montant_total_transactions: globales.montant_total_a_rembourser,
        montant_total_rembourse: globales.montant_total_rembourse,
        montant_total_restant: globales.montant_total_a_rembourser - globales.montant_total_rembourse,
        taux_remboursement_global: globales.taux_remboursement,
        remboursements_en_retard: globales.remboursements_en_retard,
        montant_en_retard: globales.montant_en_retard,
        echeances_en_retard: 0, // Pas d'échéances dans le système intégral
        total_transactions_reussies: globales.total_remboursements,
        transactions_sans_remboursement: 0, // À calculer séparément
        par_statut: {
          'EN_ATTENTE': globales.remboursements_en_attente,
          'PAYE': globales.remboursements_payes,
          'EN_RETARD': globales.remboursements_en_retard,
          'ANNULE': globales.remboursements_annules
        },
        par_methode: {
          VIREMENT_BANCAIRE: 0,
          MOBILE_MONEY: 0,
          ESPECES: 0,
          CHEQUE: 0,
          PRELEVEMENT_SALAIRE: 0,
          COMPENSATION_AVANCE: 0
        },
        par_mois: []
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      throw error;
    }
  }

  // Récupérer les statistiques par partenaire
  async getStatistiquesParPartenaire(): Promise<StatistiquesRemboursementPartenaire[]> {
    try {
      const response = await fetch('/api/remboursements/statistiques');
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des statistiques par partenaire');
      }
      
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Erreur lors de la récupération des statistiques par partenaire');
      }
      
      return result.data.par_partenaire || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques par partenaire:', error);
      throw error;
    }
  }

  // =====================================================
  // MAINTENANCE
  // =====================================================

  // Exécuter la maintenance quotidienne
  async executerMaintenanceQuotidienne(): Promise<void> {
    try {
      const { error } = await supabase.rpc('maintenance_quotidienne_remboursements');
      if (error) throw error;
    } catch (error) {
      console.error('Erreur lors de la maintenance quotidienne:', error);
      throw error;
    }
  }

  // Effectuer un paiement en lot pour plusieurs remboursements
  async effectuerPaiementEnLot(remboursementIds: string[], methodePaiement: string, numeroTransaction: string, commentaire?: string): Promise<{ success: boolean; message: string; remboursementsPayes: number }> {
    try {
      const response = await fetch('/api/remboursements/paiement-lot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          remboursement_ids: remboursementIds,
          methode_paiement: methodePaiement,
          numero_transaction: numeroTransaction,
          commentaire: commentaire
        })
      });

      if (!response.ok) {
        throw new Error('Erreur lors du paiement en lot');
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Erreur lors du paiement en lot:', error);
      throw error;
    }
  }

  // Effectuer un paiement en lot pour un partenaire
  async effectuerPaiementParPartenaire(partenaireId: string, methodePaiement: string, numeroTransaction: string, commentaire?: string): Promise<{ success: boolean; message: string; remboursementsPayes: number }> {
    try {
      const response = await fetch('/api/remboursements/paiement-partenaire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partenaire_id: partenaireId,
          methode_paiement: methodePaiement,
          numero_transaction: numeroTransaction,
          commentaire: commentaire
        })
      });

      if (!response.ok) {
        throw new Error('Erreur lors du paiement par partenaire');
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Erreur lors du paiement par partenaire:', error);
      throw error;
    }
  }

  // =====================================================
  // INTÉGRATION LENGO PAY
  // =====================================================

  // Effectuer le paiement via Lengo Pay
  async effectuerPaiementLengo(remboursementId: string, amount: number, currency: string = 'GNF'): Promise<PaiementLengoResponse> {
    try {
      const response = await fetch('/api/remboursements/lengo-paiement', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          remboursement_id: remboursementId,
          amount: amount,
          currency: currency
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de l\'initiation du paiement Lengo Pay');
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Erreur lors du paiement Lengo Pay:', error);
      throw error;
    }
  }

  // Vérifier le statut d'un paiement Lengo Pay
  async verifierStatutPaiementLengo(payId: string): Promise<{ status: string; message: string }> {
    try {
      // Cette méthode pourrait être utilisée pour vérifier le statut d'un paiement
      // si Lengo Pay fournit un endpoint de vérification
      console.log('Vérification du statut du paiement Lengo:', payId);
      
      // Pour l'instant, on se base sur les callbacks
      return {
        status: 'PENDING',
        message: 'Statut en attente de callback'
      };
    } catch (error) {
      console.error('Erreur lors de la vérification du statut:', error);
      throw error;
    }
  }
}

// Instance singleton
const reimbursementService = new ReimbursementService();
export default reimbursementService; 
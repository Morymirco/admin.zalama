import { createClient } from '@supabase/supabase-js';
import { DemandeAvanceSalaire, Transaction, DemandesStatistiques, TransactionsStatistiques } from '@/types/salaryAdvanceRequest';

// Configuration Supabase
const supabaseUrl = 'https://mspmrzlqhwpdkkburjiw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zcG1yemxxaHdwZGtrYnVyaml3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3ODcyNTgsImV4cCI6MjA2NjM2MzI1OH0.zr-TRpKjGJjW0nRtsyPcCLy4Us-c5tOGX71k5_3JJd0';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Fonction utilitaire pour convertir les données de la DB vers l'interface DemandeAvanceSalaire
const convertDemandeFromDB = (dbDemande: any): DemandeAvanceSalaire => {
  return {
    id: dbDemande.id,
    employe_id: dbDemande.employe_id,
    montant_demande: dbDemande.montant_demande,
    motif: dbDemande.motif,
    date_demande: dbDemande.date_demande ? new Date(dbDemande.date_demande) : new Date(),
    statut: dbDemande.statut,
    commentaire: dbDemande.commentaire,
    date_traitement: dbDemande.date_traitement ? new Date(dbDemande.date_traitement) : undefined,
    numero_reception: dbDemande.numero_reception,
    created_at: dbDemande.created_at ? new Date(dbDemande.created_at) : new Date(),
    updated_at: dbDemande.updated_at ? new Date(dbDemande.updated_at) : new Date(),
    
    // Relations
    employe: dbDemande.employe,
    entreprise: dbDemande.entreprise
  };
};

// Fonction utilitaire pour convertir les données vers la DB pour DemandeAvanceSalaire
const convertDemandeToDB = (demandeData: Partial<DemandeAvanceSalaire>): any => {
  const dbData: any = {};
  
  if (demandeData.employe_id !== undefined) dbData.employe_id = demandeData.employe_id;
  if (demandeData.montant_demande !== undefined) dbData.montant_demande = demandeData.montant_demande;
  if (demandeData.motif !== undefined) dbData.motif = demandeData.motif;
  if (demandeData.statut !== undefined) dbData.statut = demandeData.statut;
  if (demandeData.commentaire !== undefined) dbData.commentaire = demandeData.commentaire;
  if (demandeData.numero_reception !== undefined) dbData.numero_reception = demandeData.numero_reception;
  
  return dbData;
};

// Fonction utilitaire pour convertir les données de la DB vers l'interface Transaction
const convertTransactionFromDB = (dbTransaction: any): Transaction => {
  return {
    id: dbTransaction.id,
    demande_avance_id: dbTransaction.demande_avance_id,
    employe_id: dbTransaction.employe_id,
    entreprise_id: dbTransaction.entreprise_id,
    montant: dbTransaction.montant,
    numero_transaction: dbTransaction.numero_transaction,
    methode_paiement: dbTransaction.methode_paiement,
    numero_compte: dbTransaction.numero_compte,
    numero_reception: dbTransaction.numero_reception,
    date_transaction: dbTransaction.date_transaction ? new Date(dbTransaction.date_transaction) : new Date(),
    recu_url: dbTransaction.recu_url,
    date_creation: dbTransaction.date_creation ? new Date(dbTransaction.date_creation) : new Date(),
    statut: dbTransaction.statut,
    created_at: dbTransaction.created_at ? new Date(dbTransaction.created_at) : new Date(),
    updated_at: dbTransaction.updated_at ? new Date(dbTransaction.updated_at) : new Date(),
    
    // Relations
    employe: dbTransaction.employe,
    entreprise: dbTransaction.entreprise,
    demande_avance: dbTransaction.demande_avance
  };
};

// Fonction utilitaire pour convertir les données vers la DB pour Transaction
const convertTransactionToDB = (transactionData: Partial<Transaction>): any => {
  const dbData: any = {};
  
  if (transactionData.demande_avance_id !== undefined) dbData.demande_avance_id = transactionData.demande_avance_id;
  if (transactionData.employe_id !== undefined) dbData.employe_id = transactionData.employe_id;
  if (transactionData.entreprise_id !== undefined) dbData.entreprise_id = transactionData.entreprise_id;
  if (transactionData.montant !== undefined) dbData.montant = transactionData.montant;
  if (transactionData.numero_transaction !== undefined) dbData.numero_transaction = transactionData.numero_transaction;
  if (transactionData.methode_paiement !== undefined) dbData.methode_paiement = transactionData.methode_paiement;
  if (transactionData.numero_compte !== undefined) dbData.numero_compte = transactionData.numero_compte;
  if (transactionData.numero_reception !== undefined) dbData.numero_reception = transactionData.numero_reception;
  if (transactionData.recu_url !== undefined) dbData.recu_url = transactionData.recu_url;
  if (transactionData.statut !== undefined) dbData.statut = transactionData.statut;
  
  return dbData;
};

class SalaryAdvanceService {
  // ===== DEMANDES D'AVANCE SUR SALAIRE =====

  // Récupérer toutes les demandes d'un partenaire
  async getDemandesByPartner(partnerId: string): Promise<DemandeAvanceSalaire[]> {
    try {
      const { data, error } = await supabase
        .from('demandes_avance_details')
        .select('*')
        .eq('entreprise_id', partnerId)
        .order('date_demande', { ascending: false });

      if (error) throw error;
      return (data || []).map(convertDemandeFromDB);
    } catch (error) {
      console.error('Erreur lors de la récupération des demandes:', error);
      throw error;
    }
  }

  // Récupérer une demande par ID
  async getDemandeById(id: string): Promise<DemandeAvanceSalaire | null> {
    try {
      const { data, error } = await supabase
        .from('demandes_avance_details')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data ? convertDemandeFromDB(data) : null;
    } catch (error) {
      console.error('Erreur lors de la récupération de la demande:', error);
      throw error;
    }
  }

  // Créer une nouvelle demande
  async createDemande(demandeData: Partial<DemandeAvanceSalaire>): Promise<DemandeAvanceSalaire> {
    try {
      const dbData = convertDemandeToDB(demandeData);
      dbData.date_demande = new Date().toISOString();
      dbData.statut = demandeData.statut || 'EN_ATTENTE';

      const { data, error } = await supabase
        .from('demandes_avance_salaire')
        .insert([dbData])
        .select(`
          *,
          employe:employees(id, nom, prenom, email, poste, salaire_net),
          entreprise:partners(id, nom, email, email_rh)
        `)
        .single();

      if (error) throw error;
      return convertDemandeFromDB(data);
    } catch (error) {
      console.error('Erreur lors de la création de la demande:', error);
      throw error;
    }
  }

  // Mettre à jour une demande
  async updateDemande(id: string, demandeData: Partial<DemandeAvanceSalaire>): Promise<DemandeAvanceSalaire> {
    try {
      const dbData = convertDemandeToDB(demandeData);
      dbData.updated_at = new Date().toISOString();

      // Si le statut change, mettre à jour la date de traitement
      if (demandeData.statut && demandeData.statut !== 'EN_ATTENTE') {
        dbData.date_traitement = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('demandes_avance_salaire')
        .update(dbData)
        .eq('id', id)
        .select(`
          *,
          employe:employees(id, nom, prenom, email, poste, salaire_net),
          entreprise:partners(id, nom, email, email_rh)
        `)
        .single();

      if (error) throw error;
      return convertDemandeFromDB(data);
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la demande:', error);
      throw error;
    }
  }

  // Supprimer une demande
  async deleteDemande(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('demandes_avance_salaire')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Erreur lors de la suppression de la demande:', error);
      throw error;
    }
  }

  // Obtenir les statistiques des demandes d'un partenaire
  async getDemandesStats(partnerId: string): Promise<DemandesStatistiques> {
    try {
      const { data, error } = await supabase
        .from('demandes_statistiques_entreprise')
        .select('*')
        .eq('entreprise_id', partnerId)
        .single();

      if (error) throw error;

      return {
        total_demandes: data?.total_demandes || 0,
        demandes_en_attente: data?.demandes_en_attente || 0,
        demandes_approvees: data?.demandes_approvees || 0,
        demandes_refusees: data?.demandes_refusees || 0,
        demandes_payees: data?.demandes_payees || 0,
        montant_total_demande: data?.montant_total_demande || 0,
        montant_moyen_demande: data?.montant_moyen_demande || 0
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques des demandes:', error);
      throw error;
    }
  }

  // ===== TRANSACTIONS =====

  // Récupérer toutes les transactions d'un partenaire
  async getTransactionsByPartner(partnerId: string): Promise<Transaction[]> {
    try {
      const { data, error } = await supabase
        .from('transactions_details')
        .select('*')
        .eq('entreprise_id', partnerId)
        .order('date_transaction', { ascending: false });

      if (error) throw error;
      return (data || []).map(convertTransactionFromDB);
    } catch (error) {
      console.error('Erreur lors de la récupération des transactions:', error);
      throw error;
    }
  }

  // Récupérer une transaction par ID
  async getTransactionById(id: string): Promise<Transaction | null> {
    try {
      const { data, error } = await supabase
        .from('transactions_details')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data ? convertTransactionFromDB(data) : null;
    } catch (error) {
      console.error('Erreur lors de la récupération de la transaction:', error);
      throw error;
    }
  }

  // Créer une nouvelle transaction
  async createTransaction(transactionData: Partial<Transaction>): Promise<Transaction> {
    try {
      const dbData = convertTransactionToDB(transactionData);
      dbData.date_transaction = new Date().toISOString();
      dbData.date_creation = new Date().toISOString();
      dbData.statut = transactionData.statut || 'EFFECTUEE';

      const { data, error } = await supabase
        .from('transactions')
        .insert([dbData])
        .select(`
          *,
          employe:employees(id, nom, prenom, email),
          entreprise:partners(id, nom, email, email_rh),
          demande_avance:demandes_avance_salaire(*)
        `)
        .single();

      if (error) throw error;
      return convertTransactionFromDB(data);
    } catch (error) {
      console.error('Erreur lors de la création de la transaction:', error);
      throw error;
    }
  }

  // Mettre à jour une transaction
  async updateTransaction(id: string, transactionData: Partial<Transaction>): Promise<Transaction> {
    try {
      const dbData = convertTransactionToDB(transactionData);
      dbData.updated_at = new Date().toISOString();

      const { data, error } = await supabase
        .from('transactions')
        .update(dbData)
        .eq('id', id)
        .select(`
          *,
          employe:employees(id, nom, prenom, email),
          entreprise:partners(id, nom, email, email_rh),
          demande_avance:demandes_avance_salaire(*)
        `)
        .single();

      if (error) throw error;
      return convertTransactionFromDB(data);
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la transaction:', error);
      throw error;
    }
  }

  // Obtenir les statistiques des transactions d'un partenaire
  async getTransactionsStats(partnerId: string): Promise<TransactionsStatistiques> {
    try {
      const { data, error } = await supabase
        .from('transactions_details')
        .select('*')
        .eq('entreprise_id', partnerId);

      if (error) throw error;

      const transactions = data || [];
      const total_transactions = transactions.length;
      const transactions_effectuees = transactions.filter(t => t.statut === 'EFFECTUEE').length;
      const transactions_annulees = transactions.filter(t => t.statut === 'ANNULEE').length;
      const montant_total_transactions = transactions.reduce((sum, t) => sum + (t.montant || 0), 0);
      const montant_moyen_transaction = total_transactions > 0 ? montant_total_transactions / total_transactions : 0;

      return {
        total_transactions,
        transactions_effectuees,
        transactions_annulees,
        montant_total_transactions,
        montant_moyen_transaction
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques des transactions:', error);
      throw error;
    }
  }

  // ===== MÉTHODES DE COMPATIBILITÉ (anciennes méthodes) =====

  // Méthodes de compatibilité pour l'ancien code
  async getByPartner(partnerId: string): Promise<DemandeAvanceSalaire[]> {
    return this.getDemandesByPartner(partnerId);
  }

  async getById(id: string): Promise<DemandeAvanceSalaire | null> {
    return this.getDemandeById(id);
  }

  async create(requestData: Partial<DemandeAvanceSalaire>): Promise<DemandeAvanceSalaire> {
    return this.createDemande(requestData);
  }

  async update(id: string, requestData: Partial<DemandeAvanceSalaire>): Promise<DemandeAvanceSalaire> {
    return this.updateDemande(id, requestData);
  }

  async delete(id: string): Promise<void> {
    return this.deleteDemande(id);
  }

  async getStats(partnerId: string): Promise<any> {
    return this.getDemandesStats(partnerId);
  }
}

export default new SalaryAdvanceService();

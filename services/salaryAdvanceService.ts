import { createClient } from '@supabase/supabase-js';
import { 
  SalaryAdvanceRequest, 
  Transaction, 
  SalaryAdvanceRequestFormData, 
  TransactionFormData,
  TransactionStatus,
  TransactionStatut
} from '@/types/salaryAdvanceRequest';

// Configuration Supabase
const supabaseUrl = 'https://mspmrzlqhwpdkkburjiw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zcG1yemxxaHdwZGtrYnVyaml3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3ODcyNTgsImV4cCI6MjA2NjM2MzI1OH0.zr-TRpKjGJjW0nRtsyPcCLy4Us-c5tOGX71k5_3JJd0';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Fonction utilitaire pour convertir les données de la DB vers l'interface
const convertSalaryAdvanceFromDB = (dbRequest: any): SalaryAdvanceRequest => {
  return {
    id: dbRequest.id,
    employe_id: dbRequest.employe_id,
    partenaire_id: dbRequest.partenaire_id,
    montant_demande: dbRequest.montant_demande || 0,
    type_motif: dbRequest.type_motif,
    motif: dbRequest.motif,
    numero_reception: dbRequest.numero_reception,
    frais_service: dbRequest.frais_service || 0,
    montant_total: dbRequest.montant_total || 0,
    salaire_disponible: dbRequest.salaire_disponible,
    avance_disponible: dbRequest.avance_disponible,
    statut: dbRequest.statut || 'En attente',
    date_creation: dbRequest.date_creation ? new Date(dbRequest.date_creation) : new Date(),
    date_validation: dbRequest.date_validation ? new Date(dbRequest.date_validation) : undefined,
    date_rejet: dbRequest.date_rejet ? new Date(dbRequest.date_rejet) : undefined,
    motif_rejet: dbRequest.motif_rejet,
    created_at: dbRequest.created_at ? new Date(dbRequest.created_at) : new Date(),
    updated_at: dbRequest.updated_at ? new Date(dbRequest.updated_at) : new Date(),
    employe: dbRequest.employe,
    partenaire: dbRequest.partenaire,
    transactions: dbRequest.transactions
  };
};

const convertTransactionFromDB = (dbTransaction: any): Transaction => {
  return {
    id: dbTransaction.id,
    demande_avance_id: dbTransaction.demande_avance_id,
    employe_id: dbTransaction.employe_id,
    entreprise_id: dbTransaction.entreprise_id,
    montant: dbTransaction.montant || 0,
    numero_transaction: dbTransaction.numero_transaction,
    methode_paiement: dbTransaction.methode_paiement,
    numero_compte: dbTransaction.numero_compte,
    numero_reception: dbTransaction.numero_reception,
    date_transaction: dbTransaction.date_transaction ? new Date(dbTransaction.date_transaction) : new Date(),
    recu_url: dbTransaction.recu_url,
    date_creation: dbTransaction.date_creation ? new Date(dbTransaction.date_creation) : new Date(),
    statut: dbTransaction.statut || 'EN_COURS',
    created_at: dbTransaction.created_at ? new Date(dbTransaction.created_at) : new Date(),
    updated_at: dbTransaction.updated_at ? new Date(dbTransaction.updated_at) : new Date(),
    employe: dbTransaction.employe,
    entreprise: dbTransaction.entreprise,
    demande_avance: dbTransaction.demande_avance
  };
};

class SalaryAdvanceService {
  // Récupérer toutes les demandes d'avance avec les relations
  async getAll(): Promise<SalaryAdvanceRequest[]> {
    try {
      const { data, error } = await supabase
        .from('salary_advance_requests')
        .select(`
          *,
          employe:employees(nom, prenom, email, telephone, poste, salaire_net),
          partenaire:partners(nom, type, secteur, email, telephone)
        `)
        .order('date_creation', { ascending: false });

      if (error) throw error;
      return (data || []).map(convertSalaryAdvanceFromDB);
    } catch (error) {
      console.error('Erreur lors de la récupération des demandes:', error);
      throw error;
    }
  }

  // Récupérer une demande par ID
  async getById(id: string): Promise<SalaryAdvanceRequest | null> {
    try {
      const { data, error } = await supabase
        .from('salary_advance_requests')
        .select(`
          *,
          employe:employees(nom, prenom, email, telephone, poste, salaire_net),
          partenaire:partners(nom, type, secteur, email, telephone)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data ? convertSalaryAdvanceFromDB(data) : null;
    } catch (error) {
      console.error('Erreur lors de la récupération de la demande:', error);
      throw error;
    }
  }

  // Créer une nouvelle demande
  async create(requestData: SalaryAdvanceRequestFormData): Promise<SalaryAdvanceRequest> {
    try {
      const { data, error } = await supabase
        .from('salary_advance_requests')
        .insert([{
          ...requestData,
          date_creation: new Date().toISOString(),
          statut: 'En attente'
        }])
        .select(`
          *,
          employe:employees(nom, prenom, email, telephone, poste, salaire_net),
          partenaire:partners(nom, type, secteur, email, telephone)
        `)
        .single();

      if (error) throw error;
      return convertSalaryAdvanceFromDB(data);
    } catch (error) {
      console.error('Erreur lors de la création de la demande:', error);
      throw error;
    }
  }

  // Mettre à jour une demande
  async update(id: string, requestData: Partial<SalaryAdvanceRequest>): Promise<SalaryAdvanceRequest> {
    try {
      const { data, error } = await supabase
        .from('salary_advance_requests')
        .update({
          ...requestData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select(`
          *,
          employe:employees(nom, prenom, email, telephone, poste, salaire_net),
          partenaire:partners(nom, type, secteur, email, telephone)
        `)
        .single();

      if (error) throw error;
      return convertSalaryAdvanceFromDB(data);
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la demande:', error);
      throw error;
    }
  }

  // Approuver une demande
  async approve(id: string, motif?: string): Promise<SalaryAdvanceRequest> {
    try {
      const { data, error } = await supabase
        .from('salary_advance_requests')
        .update({
          statut: 'Validé',
          date_validation: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select(`
          *,
          employe:employees(nom, prenom, email, telephone, poste, salaire_net),
          partenaire:partners(nom, type, secteur, email, telephone)
        `)
        .single();

      if (error) throw error;
      return convertSalaryAdvanceFromDB(data);
    } catch (error) {
      console.error('Erreur lors de l\'approbation de la demande:', error);
      throw error;
    }
  }

  // Rejeter une demande
  async reject(id: string, motif_rejet: string): Promise<SalaryAdvanceRequest> {
    try {
      const { data, error } = await supabase
        .from('salary_advance_requests')
        .update({
          statut: 'Rejeté',
          date_rejet: new Date().toISOString(),
          motif_rejet,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select(`
          *,
          employe:employees(nom, prenom, email, telephone, poste, salaire_net),
          partenaire:partners(nom, type, secteur, email, telephone)
        `)
        .single();

      if (error) throw error;
      return convertSalaryAdvanceFromDB(data);
    } catch (error) {
      console.error('Erreur lors du rejet de la demande:', error);
      throw error;
    }
  }

  // Supprimer une demande
  async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('salary_advance_requests')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Erreur lors de la suppression de la demande:', error);
      throw error;
    }
  }

  // Rechercher des demandes
  async search(query: string): Promise<SalaryAdvanceRequest[]> {
    try {
      const { data, error } = await supabase
        .from('salary_advance_requests')
        .select(`
          *,
          employe:employees(nom, prenom, email, telephone, poste, salaire_net),
          partenaire:partners(nom, type, secteur, email, telephone)
        `)
        .or(`motif.ilike.%${query}%,type_motif.ilike.%${query}%`)
        .order('date_creation', { ascending: false });

      if (error) throw error;
      return (data || []).map(convertSalaryAdvanceFromDB);
    } catch (error) {
      console.error('Erreur lors de la recherche de demandes:', error);
      throw error;
    }
  }

  // Filtrer par statut
  async getByStatus(status: TransactionStatus): Promise<SalaryAdvanceRequest[]> {
    try {
      const { data, error } = await supabase
        .from('salary_advance_requests')
        .select(`
          *,
          employe:employees(nom, prenom, email, telephone, poste, salaire_net),
          partenaire:partners(nom, type, secteur, email, telephone)
        `)
        .eq('statut', status)
        .order('date_creation', { ascending: false });

      if (error) throw error;
      return (data || []).map(convertSalaryAdvanceFromDB);
    } catch (error) {
      console.error('Erreur lors du filtrage par statut:', error);
      throw error;
    }
  }

  // Filtrer par partenaire
  async getByPartner(partnerId: string): Promise<SalaryAdvanceRequest[]> {
    try {
      const { data, error } = await supabase
        .from('salary_advance_requests')
        .select(`
          *,
          employe:employees(nom, prenom, email, telephone, poste, salaire_net),
          partenaire:partners(nom, type, secteur, email, telephone)
        `)
        .eq('partenaire_id', partnerId)
        .order('date_creation', { ascending: false });

      if (error) throw error;
      return (data || []).map(convertSalaryAdvanceFromDB);
    } catch (error) {
      console.error('Erreur lors du filtrage par partenaire:', error);
      throw error;
    }
  }

  // Obtenir les statistiques
  async getStats(): Promise<{
    total: number;
    enAttente: number;
    approuvees: number;
    rejetees: number;
    montantTotal: number;
    montantMoyen: number;
    parStatut: Record<string, number>;
    parPartenaire: Record<string, number>;
  }> {
    try {
      const { data, error } = await supabase
        .from('salary_advance_requests')
        .select(`
          *,
          partenaire:partners(nom)
        `);

      if (error) throw error;

      const requests = (data || []).map(convertSalaryAdvanceFromDB);
      
      const total = requests.length;
      const enAttente = requests.filter(req => req.statut === 'En attente').length;
      const approuvees = requests.filter(req => req.statut === 'Validé').length;
      const rejetees = requests.filter(req => req.statut === 'Rejeté').length;
      
      const montantTotal = requests.reduce((sum, req) => sum + (req.montant_demande || 0), 0);
      const montantMoyen = total > 0 ? montantTotal / total : 0;
      
      const parStatut = requests.reduce((acc, req) => {
        acc[req.statut] = (acc[req.statut] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      const parPartenaire = requests.reduce((acc, req) => {
        const partenaireNom = req.partenaire?.nom || 'Inconnu';
        acc[partenaireNom] = (acc[partenaireNom] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return {
        total,
        enAttente,
        approuvees,
        rejetees,
        montantTotal,
        montantMoyen,
        parStatut,
        parPartenaire
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      throw error;
    }
  }

  // === MÉTHODES POUR LES TRANSACTIONS ===

  // Récupérer toutes les transactions
  async getAllTransactions(): Promise<Transaction[]> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          employe:employees(nom, prenom, email, telephone, poste),
          entreprise:partners(nom, type, secteur),
          demande_avance:demandes_avance_salaire(*)
        `)
        .order('date_transaction', { ascending: false });

      if (error) throw error;
      return (data || []).map(convertTransactionFromDB);
    } catch (error) {
      console.error('Erreur lors de la récupération des transactions:', error);
      throw error;
    }
  }

  // Créer une nouvelle transaction
  async createTransaction(transactionData: TransactionFormData): Promise<Transaction> {
    try {
      const numeroTransaction = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const { data, error } = await supabase
        .from('transactions')
        .insert([{
          ...transactionData,
          numero_transaction: numeroTransaction,
          date_transaction: new Date().toISOString(),
          statut: 'EN_COURS'
        }])
        .select(`
          *,
          employe:employees(nom, prenom, email, telephone, poste),
          entreprise:partners(nom, type, secteur),
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

  // Mettre à jour le statut d'une transaction
  async updateTransactionStatus(id: string, statut: TransactionStatut): Promise<Transaction> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .update({
          statut,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select(`
          *,
          employe:employees(nom, prenom, email, telephone, poste),
          entreprise:partners(nom, type, secteur),
          demande_avance:demandes_avance_salaire(*)
        `)
        .single();

      if (error) throw error;
      return convertTransactionFromDB(data);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut de la transaction:', error);
      throw error;
    }
  }
}

const salaryAdvanceService = new SalaryAdvanceService();

export default salaryAdvanceService;

// Exports utilitaires
export const getSalaryAdvanceStats = () => salaryAdvanceService.getStats();
export const getTransactions = () => salaryAdvanceService.getAllTransactions();

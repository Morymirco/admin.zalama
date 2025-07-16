import { createClient } from '@supabase/supabase-js';

// Configuration Supabase - Utiliser les mêmes clés que les autres services qui fonctionnent
const supabaseUrl = 'https://mspmrzlqhwpdkkburjiw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zcG1yemxxaHdwZGtrYnVyaml3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3ODcyNTgsImV4cCI6MjA2NjM2MzI1OH0.zr-TRpKjGJjW0nRtsyPcCLy4Us-c5tOGX71k5_3JJd0';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Interface pour les statistiques financières
interface FinanceStats {
  // Capital et fonds
  capitalInitial: number;
  montantDebloque: number;
  montantRecupere: number;
  soldeDisponible: number;
  tauxRemboursement: number;
  
  // Revenus et dépenses
  totalRevenus: number;
  totalDepenses: number;
  beneficeNet: number;
  revenusCommissions: number;
  
  // Transactions
  totalTransactions: number;
  transactionsCeMois: number;
  montantCeMois: number;
  
  // Répartition
  parType: Record<string, number>;
  parStatut: Record<string, number>;
  parCategorie: Record<string, number>;
  parMois: Record<string, { revenus: number; depenses: number }>;
}

// Interface pour les données de graphiques
interface ChartData {
  evolutionMensuelle: Array<{
    mois: string;
    revenus: number;
    depenses: number;
  }>;
  repartitionCategories: Array<{
    categorie: string;
    montant: number;
    pourcentage: number;
    type: 'revenu' | 'depense';
  }>;
  tendances: {
    croissance: number;
    prevision: number;
  };
}

// Types
export interface Transaction {
  id: string;
  demande_avance_id?: string;
  employe_id: string;
  entreprise_id: string;
  montant: number;
  numero_transaction: string;
  methode_paiement: 'VIREMENT_BANCAIRE' | 'MOBILE_MONEY' | 'ESPECES' | 'CHEQUE';
  numero_compte?: string;
  numero_reception?: string;
  recu_url?: string;
  date_transaction: string;
  date_creation: string;
  statut: 'EFFECTUEE' | 'ANNULEE';
  created_at: string;
  updated_at: string;
  employe?: { nom: string; prenom: string };
  entreprise?: { nom: string };
}

export interface SalaryAdvanceRequest {
  id: string;
  employe_id: string;
  partenaire_id: string;
  montant_demande: number;
  type_motif: string;
  motif: string;
  numero_reception?: string;
  montant_total: number;
  salaire_disponible?: number;
  avance_disponible?: number;
  date_validation?: string;
  date_rejet?: string;
  motif_rejet?: string;
  frais_service: number;
  statut: 'En attente' | 'Validé' | 'Rejeté' | 'Annulé';
  date_creation: string;
  created_at: string;
  updated_at: string;
  employe?: { nom: string; prenom: string };
  partenaire?: { nom: string };
}

export interface Remboursement {
  id: string;
  montant_total_remboursement: number;
  statut: 'EN_ATTENTE' | 'EFFECTUEE' | 'ANNULEE';
  methode_remboursement: string;
  date_creation: string;
  date_remboursement?: string;
  employe?: { nom: string; prenom: string };
  partenaire?: { nom: string };
}

export interface LengoBalance {
  status: string;
  balance: string;
  currency: string;
}

class FinanceService {
  // =====================================================
  // TRANSACTIONS
  // =====================================================

  async getTransactions(): Promise<Transaction[]> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          employe:employees(nom, prenom),
          entreprise:partners(nom)
        `)
        .order('date_transaction', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des transactions:', error);
      throw error;
    }
  }

  async getTransactionsByStatus(statut: string): Promise<Transaction[]> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          employe:employees(nom, prenom),
          entreprise:partners(nom)
        `)
        .eq('statut', statut)
        .order('date_transaction', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des transactions par statut:', error);
      throw error;
    }
  }

  async getTransactionsByMonth(year: number, month: number): Promise<Transaction[]> {
    try {
      const startDate = new Date(year, month - 1, 1).toISOString();
      const endDate = new Date(year, month, 0).toISOString();

      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          employe:employees(nom, prenom),
          entreprise:partners(nom)
        `)
        .gte('date_transaction', startDate)
        .lte('date_transaction', endDate)
        .order('date_transaction', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des transactions par mois:', error);
      throw error;
    }
  }

  // =====================================================
  // REMBOURSEMENTS
  // =====================================================

  async getRemboursements(): Promise<Remboursement[]> {
    try {
      const { data, error } = await supabase
        .from('remboursements')
        .select(`
          *,
          employe:employees(nom, prenom),
          partenaire:partners(nom)
        `)
        .order('date_creation', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des remboursements:', error);
      throw error;
    }
  }

  async getRemboursementsByStatus(statut: string): Promise<Remboursement[]> {
    try {
      const { data, error } = await supabase
        .from('remboursements')
        .select(`
          *,
          employe:employees(nom, prenom),
          partenaire:partners(nom)
        `)
        .eq('statut', statut)
        .order('date_creation', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des remboursements par statut:', error);
      throw error;
    }
  }

  // =====================================================
  // DEMANDES D'AVANCE
  // =====================================================

  async getSalaryAdvanceRequests(): Promise<SalaryAdvanceRequest[]> {
    try {
      const { data, error } = await supabase
        .from('salary_advance_requests')
        .select(`
          *,
          employe:employees(nom, prenom),
          partenaire:partners(nom)
        `)
        .order('date_creation', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des demandes d\'avance:', error);
      throw error;
    }
  }

  async getSalaryAdvanceRequestsByStatus(statut: string): Promise<SalaryAdvanceRequest[]> {
    try {
      const { data, error } = await supabase
        .from('salary_advance_requests')
        .select(`
          *,
          employe:employees(nom, prenom),
          partenaire:partners(nom)
        `)
        .eq('statut', statut)
        .order('date_creation', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des demandes d\'avance par statut:', error);
      throw error;
    }
  }

  // =====================================================
  // SOLDE LENGO PAY
  // =====================================================

  async getLengoBalance(): Promise<LengoBalance> {
    try {
      const response = await fetch('/api/payments/lengo-balance');
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Erreur lors de la récupération du solde');
      }

      return data.data;
    } catch (error) {
      console.error('Erreur lors de la récupération du solde Lengo Pay:', error);
      throw error;
    }
  }

  // =====================================================
  // STATISTIQUES
  // =====================================================

  async getFinanceStats(): Promise<FinanceStats> {
    try {
      const [transactions, remboursements, demandes] = await Promise.all([
        this.getTransactions(),
        this.getRemboursements(),
        this.getSalaryAdvanceRequests()
      ]);

      // Statistiques des transactions
      const totalTransactions = transactions.length;
      const transactionsEffectuees = transactions.filter(t => t.statut === 'EFFECTUEE').length;
      const transactionsAnnulees = transactions.filter(t => t.statut === 'ANNULEE').length;
      const montantTotalTransactions = transactions
        .filter(t => t.statut === 'EFFECTUEE')
        .reduce((sum, t) => sum + (t.montant || 0), 0);

      // Transactions ce mois
      const now = new Date();
      const transactionsCeMois = transactions.filter(t => {
        const transactionDate = new Date(t.date_transaction);
        return t.statut === 'EFFECTUEE' && 
               transactionDate.getMonth() === now.getMonth() &&
               transactionDate.getFullYear() === now.getFullYear();
      });
      const montantCeMois = transactionsCeMois.reduce((sum, t) => sum + (t.montant || 0), 0);

      // Statistiques des remboursements
      const totalRemboursements = remboursements.length;
      const remboursementsEffectues = remboursements.filter(r => r.statut === 'EFFECTUEE').length;
      const remboursementsEnAttente = remboursements.filter(r => r.statut === 'EN_ATTENTE').length;
      const remboursementsAnnules = remboursements.filter(r => r.statut === 'ANNULEE').length;
      const montantTotalRemboursements = remboursements
        .filter(r => r.statut === 'EFFECTUEE')
        .reduce((sum, r) => sum + (r.montant_total_remboursement || 0), 0);
      const montantRemboursementsEnAttente = remboursements
        .filter(r => r.statut === 'EN_ATTENTE')
        .reduce((sum, r) => sum + (r.montant_total_remboursement || 0), 0);

      // Statistiques des demandes d'avance
      const totalDemandes = demandes.length;
      const demandesEnAttente = demandes.filter(d => d.statut === 'En attente').length;
      const demandesApprouvees = demandes.filter(d => d.statut === 'Validé').length;
      const demandesRejetees = demandes.filter(d => d.statut === 'Rejeté').length;
      const montantTotalDemandes = demandes
        .filter(d => d.statut === 'Validé')
        .reduce((sum, d) => sum + (d.montant_demande || 0), 0);

      // Répartitions
      const repartitionMethodePaiement = transactions.reduce((acc, transaction) => {
        const methode = transaction.methode_paiement || 'Inconnue';
        acc[methode] = (acc[methode] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const repartitionMethodeRemboursement = remboursements.reduce((acc, remboursement) => {
        const methode = remboursement.methode_remboursement || 'Inconnue';
        acc[methode] = (acc[methode] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const repartitionStatutTransactions = transactions.reduce((acc, transaction) => {
        acc[transaction.statut] = (acc[transaction.statut] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const repartitionStatutRemboursements = remboursements.reduce((acc, remboursement) => {
        acc[remboursement.statut] = (acc[remboursement.statut] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return {
        totalTransactions,
        transactionsEffectuees,
        transactionsAnnulees,
        montantTotalTransactions,
        montantCeMois,
        
        totalRemboursements,
        remboursementsEffectues,
        remboursementsEnAttente,
        remboursementsAnnules,
        montantTotalRemboursements,
        montantRemboursementsEnAttente,
        
        totalDemandes,
        demandesEnAttente,
        demandesApprouvees,
        demandesRejetees,
        montantTotalDemandes,
        
        repartitionMethodePaiement,
        repartitionMethodeRemboursement,
        repartitionStatutTransactions,
        repartitionStatutRemboursements
      };
    } catch (error) {
      console.error('Erreur lors du calcul des statistiques financières:', error);
      throw error;
    }
  }

  // =====================================================
  // DONNÉES COMPLÈTES
  // =====================================================

  async getAllFinanceData() {
    try {
      const [transactions, remboursements, demandes, stats] = await Promise.all([
        this.getTransactions(),
        this.getRemboursements(),
        this.getSalaryAdvanceRequests(),
        this.getFinanceStats()
      ]);

      return {
        transactions,
        remboursements,
        demandes,
        stats
      };
    } catch (error) {
      console.error('Erreur lors de la récupération de toutes les données financières:', error);
      throw error;
    }
  }
}

export const financeService = new FinanceService();
export type { ChartData, FinanceStats };


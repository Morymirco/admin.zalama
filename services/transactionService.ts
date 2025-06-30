import { createClient } from '@supabase/supabase-js';
import { FinancialTransaction } from '@/types/employee';

// Configuration Supabase
const supabaseUrl = 'https://mspmrzlqhwpdkkburjiw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zcG1yemxxaHdwZGtrYnVyaml3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3ODcyNTgsImV4cCI6MjA2NjM2MzI1OH0.zr-TRpKjGJjW0nRtsyPcCLy4Us-c5tOGX71k5_3JJd0';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Fonction utilitaire pour convertir les données de la DB vers l'interface
const convertFromDB = (dbTransaction: any): FinancialTransaction => {
  return {
    id: dbTransaction.id,
    montant: dbTransaction.montant,
    type: dbTransaction.type,
    description: dbTransaction.description,
    partenaire_id: dbTransaction.partenaire_id,
    utilisateur_id: dbTransaction.utilisateur_id,
    service_id: dbTransaction.service_id,
    statut: dbTransaction.statut,
    date_transaction: dbTransaction.date_transaction,
    date_validation: dbTransaction.date_validation,
    reference: dbTransaction.reference,
    created_at: dbTransaction.created_at,
    updated_at: dbTransaction.updated_at,
    transaction_id: dbTransaction.transaction_id
  };
};

class TransactionService {
  // Récupérer toutes les transactions
  async getAll(): Promise<FinancialTransaction[]> {
    try {
      const { data, error } = await supabase
        .from('financial_transactions')
        .select('*')
        .order('date_transaction', { ascending: false });

      if (error) throw error;
      return (data || []).map(convertFromDB);
    } catch (error) {
      console.error('Erreur lors de la récupération des transactions:', error);
      throw error;
    }
  }

  // Obtenir les statistiques des transactions
  async getStats(): Promise<{
    total: number;
    montantTotal: number;
    parType: Record<string, number>;
    parStatut: Record<string, number>;
    transactionsCeMois: number;
    montantCeMois: number;
  }> {
    try {
      const { data, error } = await supabase
        .from('financial_transactions')
        .select('*');

      if (error) throw error;

      const transactions = (data || []).map(convertFromDB);
      
      const total = transactions.length;
      const montantTotal = transactions.reduce((sum, transaction) => sum + (transaction.montant || 0), 0);
      
      const parType = transactions.reduce((acc, transaction) => {
        acc[transaction.type] = (acc[transaction.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      const parStatut = transactions.reduce((acc, transaction) => {
        acc[transaction.statut] = (acc[transaction.statut] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      // Calculer les transactions de ce mois
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      
      const transactionsCeMois = transactions.filter(transaction => {
        if (!transaction.date_transaction) return false;
        const transactionDate = new Date(transaction.date_transaction);
        return transactionDate >= firstDayOfMonth;
      });
      
      const montantCeMois = transactionsCeMois.reduce((sum, transaction) => sum + (transaction.montant || 0), 0);

      return {
        total,
        montantTotal,
        parType,
        parStatut,
        transactionsCeMois: transactionsCeMois.length,
        montantCeMois
      };
    } catch (error) {
      console.error('Erreur lors du calcul des statistiques des transactions:', error);
      throw error;
    }
  }

  // Obtenir les transactions du mois
  async getThisMonth(): Promise<FinancialTransaction[]> {
    try {
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      
      const { data, error } = await supabase
        .from('financial_transactions')
        .select('*')
        .gte('date_transaction', firstDayOfMonth)
        .order('date_transaction', { ascending: false });

      if (error) throw error;
      return (data || []).map(convertFromDB);
    } catch (error) {
      console.error('Erreur lors de la récupération des transactions du mois:', error);
      throw error;
    }
  }
}

export const transactionService = new TransactionService();

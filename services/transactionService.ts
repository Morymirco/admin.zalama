import { createClient } from '@supabase/supabase-js';
import { FinancialTransaction, Transaction } from '@/types/employee';

// Configuration Supabase
const supabaseUrl = 'https://mspmrzlqhwpdkkburjiw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zcG1yemxxaHdwZGtrYnVyaml3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3ODcyNTgsImV4cCI6MjA2NjM2MzI1OH0.zr-TRpKjGJjW0nRtsyPcCLy4Us-c5tOGX71k5_3JJd0';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Fonction utilitaire pour convertir les données de la DB vers l'interface
const convertFromDB = (dbTransaction: any): Transaction => {
  return {
    id: dbTransaction.id,
    numero_transaction: dbTransaction.numero_transaction,
    montant: dbTransaction.montant,
    methode_paiement: dbTransaction.methode_paiement,
    description: dbTransaction.description,
    employe_id: dbTransaction.employe_id,
    entreprise_id: dbTransaction.entreprise_id,
    statut: dbTransaction.statut,
    date_transaction: dbTransaction.date_transaction,
    created_at: dbTransaction.created_at,
    updated_at: dbTransaction.updated_at,
    message_callback: dbTransaction.message_callback
  };
};

class TransactionService {
  // Récupérer toutes les transactions
  async getAll(): Promise<Transaction[]> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []).map(convertFromDB) as Transaction[];
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
        .from('transactions')
        .select('*');

      if (error) throw error;

      const transactions = (data || []).map(convertFromDB);
      console.log("transactions Jeanostone : ", transactions);
      const total = transactions.length;
      const montantTotal = transactions.reduce((sum, transaction) => sum + (transaction.montant || 0), 0);
      
      const parType = transactions.reduce((acc, transaction) => {
        acc[transaction.methode_paiement || ''] = (acc[transaction.methode_paiement || ''] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      const parStatut = transactions.reduce((acc, transaction) => {
        acc[transaction.statut || ''] = (acc[transaction.statut || ''] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      // Calculer les transactions de ce mois
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      
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
  async getThisMonth(): Promise<Transaction[]> {
    try {
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .gte('created_at', firstDayOfMonth)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []).map(convertFromDB);
    } catch (error) {
      console.error('Erreur lors de la récupération des transactions du mois:', error);
      throw error;
    }
  }
}

export const transactionService = new TransactionService();

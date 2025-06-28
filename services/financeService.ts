import { supabase } from '@/lib/supabase';
import { FinancialTransaction } from '@/types/employee';

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

// Fonction utilitaire pour convertir les données de la DB
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

class FinanceService {
  // Récupérer toutes les transactions financières
  async getAllTransactions(): Promise<FinancialTransaction[]> {
    try {
      const { data, error } = await supabase
        .from('financial_transactions')
        .select(`
          *,
          partenaire:partners(nom, type),
          utilisateur:employees(nom, prenom, email),
          service:services(nom, categorie)
        `)
        .order('date_transaction', { ascending: false });

      if (error) throw error;
      return (data || []).map(convertFromDB);
    } catch (error) {
      console.error('Erreur lors de la récupération des transactions:', error);
      throw error;
    }
  }

  // Récupérer les demandes d'avance de salaire
  async getSalaryAdvances(): Promise<any[]> {
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
      console.error('Erreur lors de la récupération des avances:', error);
      throw error;
    }
  }

  // Récupérer les transactions
  async getTransactions(): Promise<any[]> {
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

  // Calculer les statistiques financières complètes
  async getFinanceStats(): Promise<FinanceStats> {
    try {
      const [transactions, salaryAdvances, allTransactions] = await Promise.all([
        this.getAllTransactions(),
        this.getSalaryAdvances(),
        this.getTransactions()
      ]);

      // Calculer le montant débloqué (avances de salaire)
      const montantDebloque = salaryAdvances.reduce((sum, advance) => {
        return sum + (advance.montant_demande || 0);
      }, 0);

      // Calculer le montant récupéré (transactions effectuées)
      const montantRecupere = allTransactions
        .filter(t => t.statut === 'EFFECTUEE')
        .reduce((sum, transaction) => {
          return sum + (transaction.montant || 0);
        }, 0);

      // Capital initial (valeur fixe pour l'instant)
      const capitalInitial = 25000000;

      // Solde disponible
      const soldeDisponible = capitalInitial - montantDebloque + montantRecupere;

      // Taux de remboursement
      const tauxRemboursement = montantDebloque > 0 ? (montantRecupere / montantDebloque) * 100 : 0;

      // Calculer revenus et dépenses
      const totalRevenus = transactions
        .filter(t => ['entree', 'credit', 'revenu'].includes(t.type))
        .reduce((sum, t) => sum + (t.montant || 0), 0);

      const totalDepenses = transactions
        .filter(t => ['sortie', 'debit', 'depense'].includes(t.type))
        .reduce((sum, t) => sum + (t.montant || 0), 0);

      const beneficeNet = totalRevenus - totalDepenses;

      // Revenus par commissions (estimation basée sur les transactions)
      const revenusCommissions = totalRevenus * 0.15; // 15% de commission estimée

      // Statistiques par type
      const parType = transactions.reduce((acc, transaction) => {
        acc[transaction.type] = (acc[transaction.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Statistiques par statut
      const parStatut = transactions.reduce((acc, transaction) => {
        acc[transaction.statut] = (acc[transaction.statut] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Statistiques par catégorie
      const parCategorie = transactions.reduce((acc, transaction) => {
        const categorie = transaction.service || 'Autre';
        acc[categorie] = (acc[categorie] || 0) + (transaction.montant || 0);
        return acc;
      }, {} as Record<string, number>);

      // Statistiques par mois (6 derniers mois)
      const parMois: Record<string, { revenus: number; depenses: number }> = {};
      const mois = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août'];
      
      mois.forEach((moisNom, index) => {
        const moisDate = new Date();
        moisDate.setMonth(moisDate.getMonth() - (7 - index));
        
        const transactionsDuMois = transactions.filter(t => {
          if (!t.date_transaction) return false;
          const transactionDate = new Date(t.date_transaction);
          return transactionDate.getMonth() === moisDate.getMonth() && 
                 transactionDate.getFullYear() === moisDate.getFullYear();
        });

        const revenus = transactionsDuMois
          .filter(t => ['entree', 'credit', 'revenu'].includes(t.type))
          .reduce((sum, t) => sum + (t.montant || 0), 0);

        const depenses = transactionsDuMois
          .filter(t => ['sortie', 'debit', 'depense'].includes(t.type))
          .reduce((sum, t) => sum + (t.montant || 0), 0);

        parMois[moisNom] = { revenus, depenses };
      });

      // Transactions de ce mois
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      
      const transactionsCeMois = transactions.filter(transaction => {
        if (!transaction.date_transaction) return false;
        const transactionDate = new Date(transaction.date_transaction);
        return transactionDate >= firstDayOfMonth;
      });
      
      const montantCeMois = transactionsCeMois.reduce((sum, transaction) => sum + (transaction.montant || 0), 0);

      return {
        capitalInitial,
        montantDebloque,
        montantRecupere,
        soldeDisponible,
        tauxRemboursement,
        totalRevenus,
        totalDepenses,
        beneficeNet,
        revenusCommissions,
        totalTransactions: transactions.length,
        transactionsCeMois: transactionsCeMois.length,
        montantCeMois,
        parType,
        parStatut,
        parCategorie,
        parMois
      };
    } catch (error) {
      console.error('Erreur lors du calcul des statistiques financières:', error);
      throw error;
    }
  }

  // Obtenir les données pour les graphiques
  async getChartData(): Promise<ChartData> {
    try {
      const stats = await this.getFinanceStats();
      
      // Évolution mensuelle
      const evolutionMensuelle = Object.entries(stats.parMois).map(([mois, data]) => ({
        mois,
        revenus: data.revenus,
        depenses: data.depenses
      }));

      // Répartition par catégorie
      const repartitionCategories = Object.entries(stats.parCategorie)
        .map(([categorie, montant]) => ({
          categorie,
          montant,
          pourcentage: (montant / (stats.totalRevenus + stats.totalDepenses)) * 100,
          type: montant > 0 ? 'revenu' : 'depense'
        }))
        .sort((a, b) => b.montant - a.montant)
        .slice(0, 6); // Top 6 catégories

      // Calculer la tendance
      const derniersMois = evolutionMensuelle.slice(-3);
      const premiersMois = evolutionMensuelle.slice(-6, -3);
      
      const moyenneRecente = derniersMois.reduce((sum, mois) => sum + mois.revenus, 0) / 3;
      const moyenneAnterieure = premiersMois.reduce((sum, mois) => sum + mois.revenus, 0) / 3;
      
      const croissance = moyenneAnterieure > 0 ? ((moyenneRecente - moyenneAnterieure) / moyenneAnterieure) * 100 : 0;
      const prevision = moyenneRecente * 1.12; // +12% prévu

      return {
        evolutionMensuelle,
        repartitionCategories,
        tendances: {
          croissance,
          prevision
        }
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des données de graphiques:', error);
      throw error;
    }
  }

  // Créer une nouvelle transaction
  async createTransaction(transactionData: Partial<FinancialTransaction>): Promise<FinancialTransaction> {
    try {
      const { data, error } = await supabase
        .from('financial_transactions')
        .insert([{
          ...transactionData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;
      return convertFromDB(data);
    } catch (error) {
      console.error('Erreur lors de la création de la transaction:', error);
      throw error;
    }
  }

  // Mettre à jour une transaction
  async updateTransaction(id: string, transactionData: Partial<FinancialTransaction>): Promise<FinancialTransaction> {
    try {
      const { data, error } = await supabase
        .from('financial_transactions')
        .update({
          ...transactionData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return convertFromDB(data);
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la transaction:', error);
      throw error;
    }
  }

  // Supprimer une transaction
  async deleteTransaction(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('financial_transactions')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Erreur lors de la suppression de la transaction:', error);
      throw error;
    }
  }
}

const financeService = new FinanceService();

export default financeService;
export type { FinanceStats, ChartData };

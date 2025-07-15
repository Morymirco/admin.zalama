"use client";

import FinanceCharts from "@/components/dashboard/finances/FinanceCharts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/lib/supabase";
import {
    BarChart3,
    Calendar,
    CreditCard,
    Download,
    Filter,
    TrendingDown,
    TrendingUp,
    Users,
    Wallet
} from "lucide-react";
import { useEffect, useState } from "react";

// Types selon la structure de la base de données
interface Transaction {
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

interface SalaryAdvanceRequest {
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

interface FinancialStats {
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
  
  // Demandes d'avance
  totalDemandes: number;
  demandesEnAttente: number;
  demandesApprouvees: number;
  
  // Répartition
  parType: Record<string, number>;
  parStatut: Record<string, number>;
  parMethodePaiement: Record<string, number>;
}

const FinancesPage = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [salaryAdvances, setSalaryAdvances] = useState<SalaryAdvanceRequest[]>([]);
  const [stats, setStats] = useState<FinancialStats>({
    capitalInitial: 25000000,
    montantDebloque: 0,
    montantRecupere: 0,
    soldeDisponible: 25000000,
    tauxRemboursement: 0,
    totalRevenus: 0,
    totalDepenses: 0,
    beneficeNet: 0,
    revenusCommissions: 0,
    totalTransactions: 0,
    transactionsCeMois: 0,
    montantCeMois: 0,
    totalDemandes: 0,
    demandesEnAttente: 0,
    demandesApprouvees: 0,
    parType: {},
    parStatut: {},
    parMethodePaiement: {}
  });
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedType, setSelectedType] = useState('all');

  useEffect(() => {
    loadFinanceData();
  }, []);

  const loadFinanceData = async () => {
    try {
      setLoading(true);
      
      // Charger les demandes d'avance de salaire
      const { data: salaryData, error: salaryError } = await supabase
        .from('salary_advance_requests')
        .select(`
          *,
          employe:employees(nom, prenom),
          partenaire:partners(nom)
        `)
        .order('date_creation', { ascending: false });

      if (salaryError) throw salaryError;

      // Charger les transactions
      const { data: transactionData, error: transactionError } = await supabase
        .from('transactions')
        .select(`
          *,
          employe:employees(nom, prenom),
          entreprise:partners(nom)
        `)
        .order('date_transaction', { ascending: false });

      if (transactionError) throw transactionError;

      setTransactions(transactionData || []);
      setSalaryAdvances(salaryData || []);

      // Calculer les statistiques
      calculateStats(salaryData || [], transactionData || []);

    } catch (error) {
      console.error('Erreur lors du chargement des données financières:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (
    salaryData: SalaryAdvanceRequest[],
    transactionData: Transaction[]
  ) => {
    // Capital initial
    const capitalInitial = 25000000;

    // Montant débloqué (demandes d'avance approuvées)
    const montantDebloque = salaryData
      .filter(d => d.statut === 'Validé')
      .reduce((sum, d) => sum + (d.montant_demande || 0), 0);

    // Montant récupéré (transactions effectuées)
    const montantRecupere = transactionData
      .filter(t => t.statut === 'EFFECTUEE')
      .reduce((sum, t) => sum + (t.montant || 0), 0);

    // Solde disponible
    const soldeDisponible = capitalInitial - montantDebloque + montantRecupere;

    // Taux de remboursement
    const tauxRemboursement = montantDebloque > 0 ? (montantRecupere / montantDebloque) * 100 : 0;

    // Revenus et dépenses basés sur les transactions
    const totalRevenus = transactionData
      .filter(t => t.statut === 'EFFECTUEE')
      .reduce((sum, t) => sum + (t.montant || 0), 0);

    const totalDepenses = montantDebloque; // Les dépenses sont les montants débloqués

    const beneficeNet = totalRevenus - totalDepenses;

    // Revenus par commissions (estimation basée sur les transactions)
    const revenusCommissions = totalRevenus * 0.15;

    // Statistiques par méthode de paiement
    const parMethodePaiement = transactionData.reduce((acc, transaction) => {
      acc[transaction.methode_paiement] = (acc[transaction.methode_paiement] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Statistiques par statut (transactions)
    const parStatut = transactionData.reduce((acc, transaction) => {
      acc[transaction.statut] = (acc[transaction.statut] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Statistiques par type (basées sur les demandes d'avance)
    const parType = salaryData.reduce((acc, demande) => {
      acc[demande.type_motif] = (acc[demande.type_motif] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Transactions ce mois
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const transactionsCeMois = transactionData.filter(t => 
      new Date(t.date_transaction) >= firstDayOfMonth
    ).length;

    const montantCeMois = transactionData
      .filter(t => new Date(t.date_transaction) >= firstDayOfMonth)
      .reduce((sum, t) => sum + (t.montant || 0), 0);

    setStats({
      capitalInitial,
      montantDebloque,
      montantRecupere,
      soldeDisponible,
      tauxRemboursement,
      totalRevenus,
      totalDepenses,
      beneficeNet,
      revenusCommissions,
      totalTransactions: transactionData.length,
      transactionsCeMois,
      montantCeMois,
      totalDemandes: salaryData.length,
      demandesEnAttente: salaryData.filter(d => d.statut === 'En attente').length,
      demandesApprouvees: salaryData.filter(d => d.statut === 'Validé').length,
      parType,
      parStatut,
      parMethodePaiement
    });
  };

  const filteredTransactions = transactions.filter(transaction => {
    if (selectedType !== 'all' && transaction.methode_paiement !== selectedType) {
      return false;
    }
    return true;
  });

  if (loading) {
    return (
      <div className="p-6 bg-[var(--zalama-bg-dark)] min-h-screen">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-[var(--zalama-bg-lighter)] rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-[var(--zalama-bg-lighter)] rounded border border-[var(--zalama-border)]"></div>
            ))}
          </div>
          <div className="h-96 bg-[var(--zalama-bg-lighter)] rounded border border-[var(--zalama-border)]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto bg-[var(--zalama-bg-dark)] min-h-screen">
      {/* En-tête */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-[var(--zalama-text)]">Finances</h1>
          <p className="text-[var(--zalama-text-secondary)]">
            Gestion et suivi des finances de la plateforme
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="border-[var(--zalama-border)] text-[var(--zalama-text)] hover:bg-[var(--zalama-bg-lighter)]"
          >
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
          <Button className="bg-[var(--zalama-blue)] hover:bg-[var(--zalama-blue-accent)] text-white">
            <Filter className="h-4 w-4 mr-2" />
            Filtrer
          </Button>
        </div>
      </div>
      
      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="bg-[var(--zalama-card)] border-[var(--zalama-border)] shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[var(--zalama-text)]">Capital Initial</CardTitle>
            <Wallet className="h-4 w-4 text-[var(--zalama-text-secondary)]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[var(--zalama-text)]">
              {stats.capitalInitial.toLocaleString('fr-FR')} GNF
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[var(--zalama-card)] border-[var(--zalama-border)] shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[var(--zalama-text)]">Montant Débloqué</CardTitle>
            <TrendingDown className="h-4 w-4 text-[var(--zalama-danger)]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[var(--zalama-danger)]">
              {stats.montantDebloque.toLocaleString('fr-FR')} GNF
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[var(--zalama-card)] border-[var(--zalama-border)] shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[var(--zalama-text)]">Montant Récupéré</CardTitle>
            <TrendingUp className="h-4 w-4 text-[var(--zalama-success)]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[var(--zalama-success)]">
              {stats.montantRecupere.toLocaleString('fr-FR')} GNF
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[var(--zalama-card)] border-[var(--zalama-border)] shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[var(--zalama-text)]">Solde Disponible</CardTitle>
            <CreditCard className="h-4 w-4 text-[var(--zalama-blue)]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[var(--zalama-blue)]">
              {stats.soldeDisponible.toLocaleString('fr-FR')} GNF
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Statistiques secondaires */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="bg-[var(--zalama-card)] border-[var(--zalama-border)] shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[var(--zalama-text)]">Taux de Remboursement</CardTitle>
            <BarChart3 className="h-4 w-4 text-[var(--zalama-text-secondary)]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[var(--zalama-text)]">
              {stats.tauxRemboursement.toFixed(1)}%
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[var(--zalama-card)] border-[var(--zalama-border)] shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[var(--zalama-text)]">Demandes en Attente</CardTitle>
            <Users className="h-4 w-4 text-[var(--zalama-warning)]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[var(--zalama-warning)]">
              {stats.demandesEnAttente}
            </div>
            <p className="text-xs text-[var(--zalama-text-secondary)]">
              sur {stats.totalDemandes} demandes
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[var(--zalama-card)] border-[var(--zalama-border)] shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[var(--zalama-text)]">Transactions ce Mois</CardTitle>
            <Calendar className="h-4 w-4 text-[var(--zalama-blue)]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[var(--zalama-blue)]">
              {stats.transactionsCeMois}
            </div>
            <p className="text-xs text-[var(--zalama-text-secondary)]">
              {stats.montantCeMois.toLocaleString('fr-FR')} GNF
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Onglets */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="bg-[var(--zalama-bg-lighter)] border-[var(--zalama-border)]">
          <TabsTrigger 
            value="overview" 
            className="data-[state=active]:bg-[var(--zalama-blue)] data-[state=active]:text-white text-[var(--zalama-text)]"
          >
            Vue d'ensemble
          </TabsTrigger>
          <TabsTrigger 
            value="transactions" 
            className="data-[state=active]:bg-[var(--zalama-blue)] data-[state=active]:text-white text-[var(--zalama-text)]"
          >
            Transactions
          </TabsTrigger>
          <TabsTrigger 
            value="advances" 
            className="data-[state=active]:bg-[var(--zalama-blue)] data-[state=active]:text-white text-[var(--zalama-text)]"
          >
            Demandes d'Avance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <FinanceCharts 
            chartData={{
              evolutionMensuelle: [
                { mois: 'Jan', revenus: stats.totalRevenus * 0.15, depenses: stats.montantDebloque * 0.12 },
                { mois: 'Fév', revenus: stats.totalRevenus * 0.18, depenses: stats.montantDebloque * 0.14 },
                { mois: 'Mar', revenus: stats.totalRevenus * 0.22, depenses: stats.montantDebloque * 0.16 },
                { mois: 'Avr', revenus: stats.totalRevenus * 0.20, depenses: stats.montantDebloque * 0.15 },
                { mois: 'Mai', revenus: stats.totalRevenus * 0.25, depenses: stats.montantDebloque * 0.18 },
                { mois: 'Juin', revenus: stats.totalRevenus * 0.28, depenses: stats.montantDebloque * 0.20 }
              ],
              repartitionCategories: [
                { categorie: 'Avances salaire', pourcentage: 40, type: 'depense' },
                { categorie: 'Commissions', pourcentage: 35, type: 'revenu' },
                { categorie: 'Frais opérationnels', pourcentage: 15, type: 'depense' },
                { categorie: 'Services premium', pourcentage: 10, type: 'revenu' }
              ],
              tendances: {
                croissance: stats.tauxRemboursement
              }
            }}
            loading={loading}
          />
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <Card className="bg-[var(--zalama-card)] border-[var(--zalama-border)] shadow-lg">
            <CardHeader>
              <CardTitle className="text-[var(--zalama-text)]">Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 border border-[var(--zalama-border)] rounded-lg bg-[var(--zalama-bg-lighter)] hover:bg-[var(--zalama-bg-light)] transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-full ${
                        transaction.statut === 'EFFECTUEE' ? 'bg-[var(--zalama-success)]/20' : 'bg-[var(--zalama-danger)]/20'
                      }`}>
                        <CreditCard className={`h-4 w-4 ${
                          transaction.statut === 'EFFECTUEE' ? 'text-[var(--zalama-success)]' : 'text-[var(--zalama-danger)]'
                        }`} />
                      </div>
                      <div>
                        <p className="font-medium text-[var(--zalama-text)]">
                          {transaction.employe?.prenom} {transaction.employe?.nom}
                        </p>
                        <p className="text-sm text-[var(--zalama-text-secondary)]">
                          {transaction.entreprise?.nom} - {transaction.methode_paiement}
                        </p>
                        <p className="text-xs text-[var(--zalama-text-secondary)]">
                          {transaction.numero_transaction} - {new Date(transaction.date_transaction).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-[var(--zalama-success)]">
                        {transaction.montant.toLocaleString('fr-FR')} GNF
                      </p>
                      <Badge variant="outline" className="border-[var(--zalama-border)] text-[var(--zalama-text)]">
                        {transaction.statut}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advances" className="space-y-4">
          <Card className="bg-[var(--zalama-card)] border-[var(--zalama-border)] shadow-lg">
            <CardHeader>
              <CardTitle className="text-[var(--zalama-text)]">Demandes d'Avance de Salaire</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {salaryAdvances.map((advance) => (
                  <div
                    key={advance.id}
                    className="flex items-center justify-between p-4 border border-[var(--zalama-border)] rounded-lg bg-[var(--zalama-bg-lighter)] hover:bg-[var(--zalama-bg-light)] transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-full ${
                        advance.statut === 'Validé' ? 'bg-[var(--zalama-success)]/20' : 
                        advance.statut === 'En attente' ? 'bg-[var(--zalama-warning)]/20' : 'bg-[var(--zalama-danger)]/20'
                      }`}>
                        <Users className={`h-4 w-4 ${
                          advance.statut === 'Validé' ? 'text-[var(--zalama-success)]' : 
                          advance.statut === 'En attente' ? 'text-[var(--zalama-warning)]' : 'text-[var(--zalama-danger)]'
                        }`} />
                      </div>
                      <div>
                        <p className="font-medium text-[var(--zalama-text)]">
                          {advance.employe?.prenom} {advance.employe?.nom}
                        </p>
                        <p className="text-sm text-[var(--zalama-text-secondary)]">
                          {advance.partenaire?.nom} - {advance.motif}
                        </p>
                        <p className="text-xs text-[var(--zalama-text-secondary)]">
                          {new Date(advance.date_creation).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-[var(--zalama-blue)]">
                        {advance.montant_demande.toLocaleString('fr-FR')} GNF
                      </p>
                      <Badge variant="outline" className="border-[var(--zalama-border)] text-[var(--zalama-text)]">
                        {advance.statut}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FinancesPage;

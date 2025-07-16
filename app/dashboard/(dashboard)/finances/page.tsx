"use client";

import FinanceCharts from "@/components/dashboard/finances/FinanceCharts";
import { LengoBalanceCard } from "@/components/dashboard/finances/LengoBalanceCard";
import { RemboursementsSummary } from "@/components/dashboard/finances/RemboursementsSummary";
import { TransactionsSummary } from "@/components/dashboard/finances/TransactionsSummary";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { financeService, type Remboursement, type SalaryAdvanceRequest, type Transaction } from "@/services/financeService";
import {
  CreditCard,
  Download,
  Filter,
  Users
} from "lucide-react";
import { useEffect, useState } from "react";

const FinancesPage = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [salaryAdvances, setSalaryAdvances] = useState<SalaryAdvanceRequest[]>([]);
  const [remboursements, setRemboursements] = useState<Remboursement[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('all');

  useEffect(() => {
    loadFinanceData();
  }, []);

  const loadFinanceData = async () => {
    try {
      setLoading(true);
      
      // Utiliser le service centralisé
      const { transactions: transactionData, demandes: salaryData, remboursements: remboursementData } = 
        await financeService.getAllFinanceData();

      setTransactions(transactionData);
      setSalaryAdvances(salaryData);
      setRemboursements(remboursementData);

    } catch (error) {
      console.error('Erreur lors du chargement des données financières:', error);
    } finally {
      setLoading(false);
    }
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-64 bg-[var(--zalama-bg-lighter)] rounded border border-[var(--zalama-border)]"></div>
            <div className="h-64 bg-[var(--zalama-bg-lighter)] rounded border border-[var(--zalama-border)]"></div>
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
      
      {/* Solde Lengo Pay */}
      <div className="mb-6">
        <LengoBalanceCard />
      </div>
      
      {/* Résumés des transactions et remboursements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <TransactionsSummary transactions={transactions} loading={loading} />
        <RemboursementsSummary remboursements={remboursements} loading={loading} />
      </div>

      {/* Onglets */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="bg-[var(--zalama-bg-lighter)] border-[var(--zalama-border)]">
          <TabsTrigger 
            value="overview" 
            className="data-[state=active]:bg-[var(--zalama-blue)] data-[state=active]:text-white text-[var(--zalama-text)]"
          >
            Vue d&apos;ensemble
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
            Demandes d&apos;Avance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <FinanceCharts 
            chartData={{
              evolutionMensuelle: [
                { mois: 'Jan', revenus: 1500000, depenses: 1200000 },
                { mois: 'Fév', revenus: 1800000, depenses: 1400000 },
                { mois: 'Mar', revenus: 2200000, depenses: 1600000 },
                { mois: 'Avr', revenus: 2000000, depenses: 1500000 },
                { mois: 'Mai', revenus: 2500000, depenses: 1800000 },
                { mois: 'Juin', revenus: 2800000, depenses: 2000000 }
              ],
              repartitionCategories: [
                { categorie: 'Avances salaire', montant: 4000000, pourcentage: 40, type: 'depense' as const },
                { categorie: 'Commissions', montant: 3500000, pourcentage: 35, type: 'revenu' as const },
                { categorie: 'Frais opérationnels', montant: 1500000, pourcentage: 15, type: 'depense' as const },
                { categorie: 'Services premium', montant: 1000000, pourcentage: 10, type: 'revenu' as const }
              ],
              tendances: {
                croissance: 15.5,
                prevision: 17.2
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
              <CardTitle className="text-[var(--zalama-text)]">Demandes d&apos;Avance de Salaire</CardTitle>
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
